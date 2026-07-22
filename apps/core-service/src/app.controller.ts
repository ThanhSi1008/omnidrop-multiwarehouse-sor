import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { ProductVariant } from './entities/product-variant.entity';
import { Inventory } from './entities/inventory.entity';
import { Warehouse } from './entities/warehouse.entity';

interface OrderPaidEvent {
  order_id: string;
  deductions: {
    warehouse_code: string;
    sku: string;
    quantity: number;
  }[];
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,

    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,

    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('products')
  async getProducts() {
    const variants = await this.variantRepo.find({
      relations: {
        product: true,
        inventories: {
          warehouse: true,
        },
      },
    });

    return variants.map((v) => {
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
  }
}
