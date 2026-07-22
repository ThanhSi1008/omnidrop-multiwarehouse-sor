import { Controller, Get, Post, Put, Param, Body, Logger, Inject, NotFoundException } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { AppService } from './app.service';
import { ProductVariant } from './entities/product-variant.entity';
import { Inventory } from './entities/inventory.entity';
import { Warehouse } from './entities/warehouse.entity';
import { User } from './entities/user.entity';

interface OrderPaidEvent {
  order_id: string;
  deductions: {
    warehouse_code: string;
    sku: string;
    quantity: number;
  }[];
}

const PRODUCTS_CACHE_KEY = 'cache:products:all';
const PRODUCTS_CACHE_TTL = 60; // 60 seconds TTL

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,

    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,

    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,

    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('products')
  async getProducts() {
    // 1. Try Read from Redis Cache to Offload DB
    try {
      const cached = await this.redis.get(PRODUCTS_CACHE_KEY);
      if (cached) {
        this.logger.log(`[Cache Hit] Serving /products from Redis RAM cache (${PRODUCTS_CACHE_KEY})`);
        return JSON.parse(cached);
      }
    } catch (err) {
      this.logger.warn(`Redis Cache Read Error: ${err.message}`);
    }

    // 2. Cache Miss: Query PostgreSQL Database
    this.logger.log(`[Cache Miss] Querying PostgreSQL DB for /products...`);
    const variants = await this.variantRepo.find({
      relations: {
        product: true,
        inventories: {
          warehouse: true,
        },
      },
    });

    const formatted = variants.map((v) => {
      const warehouses = v.inventories ? v.inventories.map((inv) => ({
        warehouseCode: inv.warehouse?.code || '',
        warehouseName: inv.warehouse?.name || '',
        quantity: inv.quantity,
        reservedQuantity: inv.reservedQuantity,
        availableToSell: inv.quantity - inv.reservedQuantity,
      })) : [];

      const totalAts = warehouses.reduce((sum, w) => sum + w.availableToSell, 0);

      return {
        id: v.id,
        sku: v.sku,
        price: Number(v.price),
        title: v.product?.title || 'Product',
        description: v.product?.description || '',
        warehouses,
        totalAts,
      };
    });

    // 3. Cache Result in Redis RAM with 60s TTL
    try {
      await this.redis.set(PRODUCTS_CACHE_KEY, JSON.stringify(formatted), 'EX', PRODUCTS_CACHE_TTL);
      this.logger.log(`[Cache Write] Saved /products result into Redis RAM (TTL ${PRODUCTS_CACHE_TTL}s)`);
    } catch (err) {
      this.logger.warn(`Redis Cache Write Error: ${err.message}`);
    }

    return formatted;
  }

  @Get('users')
  async getUsers() {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  @Post('users/register')
  async registerUser(@Body() body: { fullName: string; email: string; phone?: string; avatarUrl?: string }) {
    let existing = await this.userRepo.findOne({ where: { email: body.email } });
    if (existing) {
      existing.fullName = body.fullName || existing.fullName;
      if (body.phone) existing.phone = body.phone;
      if (body.avatarUrl) existing.avatarUrl = body.avatarUrl;
      return this.userRepo.save(existing);
    }

    const user = this.userRepo.create({
      email: body.email,
      fullName: body.fullName,
      phone: body.phone || '0987654321',
      avatarUrl: body.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.email}`,
      loyaltyPoints: 100,
    });

    const saved = await this.userRepo.save(user);
    this.logger.log(`Registered new customer in PostgreSQL: ${saved.email} (${saved.id})`);
    return saved;
  }

  @Post('users/login')
  async loginUser(@Body() body: { email: string }) {
    let user = await this.userRepo.findOne({ where: { email: body.email } });
    if (!user) {
      const name = body.email.split('@')[0] || 'Khách Hàng VIP';
      user = this.userRepo.create({
        email: body.email,
        fullName: name.charAt(0).toUpperCase() + name.slice(1),
        phone: '0987654321',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.email}`,
        loyaltyPoints: 50,
      });
      user = await this.userRepo.save(user);
      this.logger.log(`Created & logged in customer in PostgreSQL: ${user.email}`);
    }
    return user;
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: { fullName?: string; phone?: string; avatarUrl?: string }) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Customer user not found');
    }
    if (body.fullName !== undefined) user.fullName = body.fullName;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl;

    const saved = await this.userRepo.save(user);
    this.logger.log(`Updated customer profile in PostgreSQL DB: ${saved.email} (${saved.id})`);
    return saved;
  }

  @EventPattern('order.paid')
  async handleOrderPaid(@Payload() event: OrderPaidEvent) {
    this.logger.log(`Received order.paid event for Order: ${event.order_id}`);
    
    for (const dec of event.deductions) {
      const variant = await this.variantRepo.findOne({
        where: { sku: dec.sku },
      });

      const warehouse = await this.warehouseRepo.findOne({
        where: { code: dec.warehouse_code },
      });

      if (!variant || !warehouse) {
        this.logger.error(`Variant ${dec.sku} or Warehouse ${dec.warehouse_code} not found for deduction.`);
        continue;
      }

      const inventory = await this.inventoryRepo.findOne({
        where: {
          variantId: variant.id,
          warehouseId: warehouse.id,
        },
      });

      if (!inventory) {
        this.logger.error(`Inventory record not found for variant ${dec.sku} in warehouse ${dec.warehouse_code}`);
        continue;
      }

      // Deduct physical quantity and release reserved quantity
      inventory.quantity = Math.max(0, inventory.quantity - dec.quantity);
      inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - dec.quantity);

      await this.inventoryRepo.save(inventory);
      this.logger.log(`Deducted ${dec.quantity} units of SKU ${dec.sku} from Warehouse ${dec.warehouse_code}. New Physical Stock: ${inventory.quantity}`);
    }

    // Event-Driven Cache Invalidation: Clear products cache so UI gets fresh stock
    try {
      await this.redis.del(PRODUCTS_CACHE_KEY);
      this.logger.log(`[Cache Invalidation] Cleared ${PRODUCTS_CACHE_KEY} after PostgreSQL inventory deduction.`);
    } catch (err) {
      this.logger.warn(`Failed to invalidate products cache: ${err.message}`);
    }
  }
}
