import { Controller, Inject, OnModuleInit, Logger, Post, Param, HttpCode, HttpStatus, NotFoundException, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Fulfillment } from './entities/fulfillment.entity';
import { Observable, lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

interface WarehouseStock {
  warehouseCode?: string;
  warehouse_code?: string;
  quantity?: number;
  reservedQuantity?: number;
  reserved_quantity?: number;
  availableToSell?: number;
  available_to_sell?: number;
}

interface GetSkuStockResponse {
  sku: string;
  stocks: WarehouseStock[];
  price: number;
}

interface CoreServiceGrpc {
  getSkuStock(data: { sku: string }): Observable<GetSkuStockResponse>;
}

interface OrderCreatedEvent {
  event_id: string;
  event_type: string;
  timestamp: string;
  data: {
    order_id: string;
    user_id: string;
    delivery_address: {
      province: string;
      district: string;
      detail_address: string;
    };
    items: {
      sku: string;
      quantity: number;
    }[];
    payment_method: string;
    reservation_token: string;
    campaign_id: string;
  };
}

@Controller('orders')
export class AppController implements OnModuleInit {
  private readonly logger = new Logger(AppController.name);
  private coreService: CoreServiceGrpc;

  constructor(
    @Inject('CORE_PACKAGE')
    private readonly grpcClient: any,

    @Inject('CORE_SERVICE_MQ')
    private readonly coreMqClient: ClientProxy,

    @Inject('FLASH_SALE_MQ')
    private readonly flashSaleMqClient: ClientProxy,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Fulfillment)
    private readonly fulfillmentRepo: Repository<Fulfillment>,
  ) {}

  onModuleInit() {
    this.coreService = this.grpcClient.getService('CoreService');
    
    // Background worker checking for timeouts every 10 seconds
    setInterval(() => {
      this.checkTimeouts().catch(err => this.logger.error(`Error checking timeouts: ${err.message}`));
    }, 10000);
  }

  @Get()
  async getAllOrders() {
    const orders = await this.orderRepo.find({
      relations: {
        items: true,
        fulfillments: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return orders;
  }

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() event: OrderCreatedEvent) {
    this.logger.log(`Received order.created event for Order ID: ${event.data.order_id}`);
    const { order_id, user_id, delivery_address, items, payment_method, campaign_id, reservation_token } = event.data;

    // 1. Phân vùng địa lý và kho ưu tiên
    const { primary, secondary } = this.getWarehousePreferences(delivery_address.province);
    this.logger.log(`Preferences for ${delivery_address.province}: Primary=${primary}, Secondary=${secondary}`);

    // 2. Lấy thông tin giá và tồn kho khả dụng qua gRPC
    const skuDetailsMap = new Map<string, GetSkuStockResponse>();
    let primaryCanHandleAll = true;
    let secondaryCanHandleAll = true;

    for (const item of items) {
      try {
        const grpcRes = await lastValueFrom(this.coreService.getSkuStock({ sku: item.sku }));
        this.logger.log(`gRPC response for ${item.sku}: ${JSON.stringify(grpcRes)}`);
        skuDetailsMap.set(item.sku, grpcRes);

        const stockMap = new Map<string, number>();
        for (const s of grpcRes.stocks) {
          const warehouseCode = s.warehouseCode || s.warehouse_code || '';
          const availableToSell = s.availableToSell !== undefined ? s.availableToSell : (s.available_to_sell !== undefined ? s.available_to_sell : 0);
          stockMap.set(warehouseCode, availableToSell);
        }

        const primaryAts = stockMap.get(primary) ?? 0;
        const secondaryAts = stockMap.get(secondary) ?? 0;
        this.logger.log(`Stock Map: ${JSON.stringify(Array.from(stockMap.entries()))}. Primary (${primary}) ATS: ${primaryAts}, Secondary (${secondary}) ATS: ${secondaryAts}`);

        if (primaryAts < item.quantity) {
          primaryCanHandleAll = false;
        }
        if (secondaryAts < item.quantity) {
          secondaryCanHandleAll = false;
        }
      } catch (err) {
        this.logger.error(`Failed to get stock for SKU ${item.sku} via gRPC: ${err.message}`);
        primaryCanHandleAll = false;
        secondaryCanHandleAll = false;
        skuDetailsMap.set(item.sku, { sku: item.sku, stocks: [], price: 0 });
      }
    }

    this.logger.log(`Routing decisions: primaryCanHandleAll=${primaryCanHandleAll}, secondaryCanHandleAll=${secondaryCanHandleAll}`);

    // 3. Chạy thuật toán SOR điều phối đơn
    const fulfillmentsToCreate: { warehouseCode: string; items: { sku: string; quantity: number; price: number }[] }[] = [];

    if (primaryCanHandleAll) {
      fulfillmentsToCreate.push({
        warehouseCode: primary,
        items: items.map(i => ({
          sku: i.sku,
          quantity: i.quantity,
          price: skuDetailsMap.get(i.sku)?.price ?? 0,
        })),
      });
    } else if (secondaryCanHandleAll) {
      fulfillmentsToCreate.push({
        warehouseCode: secondary,
        items: items.map(i => ({
          sku: i.sku,
          quantity: i.quantity,
          price: skuDetailsMap.get(i.sku)?.price ?? 0,
        })),
      });
    } else {
      // Bắt buộc tách đơn
      const primaryItems: { sku: string; quantity: number; price: number }[] = [];
      const secondaryItems: { sku: string; quantity: number; price: number }[] = [];

      for (const item of items) {
        const details = skuDetailsMap.get(item.sku);
        const price = details?.price ?? 0;
        const stockMap = new Map<string, number>();
        if (details) {
          for (const s of details.stocks) {
            const warehouseCode = s.warehouseCode || s.warehouse_code || '';
            const availableToSell = s.availableToSell !== undefined ? s.availableToSell : (s.available_to_sell !== undefined ? s.available_to_sell : 0);
            stockMap.set(warehouseCode, availableToSell);
          }
        }

        const primaryAts = stockMap.get(primary) ?? 0;
        if (primaryAts >= item.quantity) {
          primaryItems.push({ sku: item.sku, quantity: item.quantity, price });
        } else if (primaryAts > 0) {
          primaryItems.push({ sku: item.sku, quantity: primaryAts, price });
          secondaryItems.push({ sku: item.sku, quantity: item.quantity - primaryAts, price });
        } else {
          secondaryItems.push({ sku: item.sku, quantity: item.quantity, price });
        }
      }

      if (primaryItems.length > 0) {
        fulfillmentsToCreate.push({ warehouseCode: primary, items: primaryItems });
      }
      if (secondaryItems.length > 0) {
        fulfillmentsToCreate.push({ warehouseCode: secondary, items: secondaryItems });
      }
    }

    // 4. Tính toán tổng tiền
    let totalPrice = 0;
    const orderItemsPayload: { sku: string; quantity: number; price: number }[] = [];
    for (const item of items) {
      const price = skuDetailsMap.get(item.sku)?.price ?? 0;
      totalPrice += price * item.quantity;
      orderItemsPayload.push({ sku: item.sku, quantity: item.quantity, price });
    }

    // 5. Lưu vào Database (PostgreSQL schema: order)
    const newOrder = new Order();
    newOrder.orderCode = order_id;
    newOrder.userId = user_id;
    newOrder.status = 'PENDING_PAYMENT';
    newOrder.paymentMethod = payment_method;
    newOrder.totalPrice = totalPrice;
    newOrder.province = delivery_address.province;
    newOrder.district = delivery_address.district;
    newOrder.detailAddress = delivery_address.detail_address;
    newOrder.campaignId = campaign_id;
    newOrder.reservationToken = reservation_token;

    const savedOrder = await this.orderRepo.save(newOrder);

    for (const item of orderItemsPayload) {
      const orderItem = new OrderItem();
      orderItem.orderId = savedOrder.id;
      orderItem.sku = item.sku;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      await this.orderItemRepo.save(orderItem);
    }

    for (const ful of fulfillmentsToCreate) {
      const fulfillment = new Fulfillment();
      fulfillment.orderId = savedOrder.id;
      fulfillment.warehouseCode = ful.warehouseCode;
      fulfillment.status = 'PENDING';
      await this.fulfillmentRepo.save(fulfillment);
      this.logger.log(`Created fulfillment for Order ${order_id} at Warehouse ${ful.warehouseCode}`);
    }

    this.logger.log(`Order ${order_id} processed and saved successfully.`);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  async payOrder(@Param('id') id: string) {
    this.logger.log(`Received pay request for Order ID: ${id}`);
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: true, fulfillments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return { success: false, message: `Order status is ${order.status}, cannot pay.` };
    }

    // Update status
    order.status = 'PAID';
    await this.orderRepo.save(order);

    // Build deductions payload based on fulfillments and order items
    const deductions = order.fulfillments.map((f) => {
      return order.items.map((item) => ({
        warehouse_code: f.warehouseCode,
        sku: item.sku,
        quantity: item.quantity,
      }));
    }).flat();

    const eventPayload = {
      order_id: order.orderCode,
      deductions,
    };

    // Emit order.paid event to RabbitMQ
    this.coreMqClient.emit('order.paid', eventPayload);
    this.logger.log(`Published order.paid event for Order ID: ${order.orderCode}`);

    return { success: true, message: 'Order paid successfully' };
  }

  @Get('check-timeouts-trigger')
  async triggerTimeoutCheck() {
    this.logger.log('Manually triggered timeout check.');
    const cancelledCount = await this.checkTimeouts();
    return { success: true, cancelledCount };
  }

  private async checkTimeouts(): Promise<number> {
    // Timeout threshold is 5 minutes ago
    const threshold = new Date(Date.now() - 5 * 60 * 1000);

    const pendingOrders = await this.orderRepo.find({
      where: {
        status: 'PENDING_PAYMENT',
        createdAt: LessThan(threshold),
      },
      relations: { items: true },
    });

    if (pendingOrders.length === 0) {
      return 0;
    }

    this.logger.log(`Found ${pendingOrders.length} timed out orders. Cancelling...`);

    for (const order of pendingOrders) {
      order.status = 'CANCELLED';
      await this.orderRepo.save(order);

      // Emit order.timeout for each item to restore stock in Redis
      for (const item of order.items) {
        const timeoutPayload = {
          sku: item.sku,
          quantity: item.quantity,
          userId: order.userId,
          campaignId: order.campaignId || 'default_campaign',
        };
        this.flashSaleMqClient.emit('order.timeout', timeoutPayload);
        this.logger.log(`Emitted order.timeout for user ${order.userId}, SKU ${item.sku}`);
      }
    }

    return pendingOrders.length;
  }

  private getWarehousePreferences(province: string): { primary: string; secondary: string } {
    const provLower = province.toLowerCase();
    const southProvinces = [
      'hcm', 'ho chi minh', 'binh duong', 'can tho', 'quang nam', 'quang ngai', 'dong nai', 
      'long an', 'an giang', 'ba ria', 'vung tau', 'ben tre', 'binh dinh', 'binh phuoc', 
      'binh thuan', 'ca mau', 'dak lak', 'dak nong', 'gia lai', 'hau giang', 'khanh hoa', 
      'kien giang', 'kon tum', 'lam dong', 'ninh thuan', 'phu yen', 'soc trang', 'tay ninh', 
      'tien giang', 'tra vinh', 'vinh long'
    ];
    
    for (const p of southProvinces) {
      if (provLower.includes(p)) {
        return { primary: 'KHO_HCM', secondary: 'KHO_HN' };
      }
    }
    return { primary: 'KHO_HN', secondary: 'KHO_HCM' };
  }
}
