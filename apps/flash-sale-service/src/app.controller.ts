import { Controller, Post, Get, Body, Query, Inject, BadRequestException, HttpException, HttpStatus, Logger, Res } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import Redis from 'ioredis';
import { REDIS_KEYS } from '@omni/shared';
import * as crypto from 'crypto';

interface PurchaseDto {
  userId: string;
  sku: string;
  campaignId: string;
  quantity?: number;
  paymentMethod: string;
  deliveryAddress: {
    province: string;
    district: string;
    detailAddress: string;
  };
}

interface SetCampaignDto {
  sku: string;
  stock: number;
}

@Controller('purchase')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @Inject('ORDER_SERVICE_MQ')
    private readonly mqClient: ClientProxy,
  ) {}

  @Get('stock')
  async getStock(@Query('sku') sku?: string) {
    const targetSku = sku || 'KINH-X-DEN-SIZE-M';
    const stockKey = REDIS_KEYS.flashSaleInventory(targetSku);
    const stockVal = await this.redis.get(stockKey);
    return {
      sku: targetSku,
      stock: stockVal !== null ? parseInt(stockVal, 10) : 0,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stock-stream')
  async streamStock(@Query('sku') sku: string | undefined, @Res() res: any) {
    const targetSku = sku || 'KINH-X-DEN-SIZE-M';
    const stockKey = REDIS_KEYS.flashSaleInventory(targetSku);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendStock = async () => {
      const stockVal = await this.redis.get(stockKey);
      const data = JSON.stringify({
        sku: targetSku,
        stock: stockVal !== null ? parseInt(stockVal, 10) : 0,
        timestamp: new Date().toISOString(),
      });
      res.write(`data: ${data}\n\n`);
    };

    await sendStock();
    const intervalId = setInterval(sendStock, 1000);

    res.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });
  }

  @Post('admin/campaign')
  async setCampaign(@Body() body: SetCampaignDto) {
    const { sku, stock } = body;
    if (!sku || stock === undefined || stock < 0) {
      throw new BadRequestException('Invalid sku or stock');
    }

    const stockKey = REDIS_KEYS.flashSaleInventory(sku);
    await this.redis.set(stockKey, stock);

    // Clear all user limits
    const limitKeys = await this.redis.keys('user:limit:*');
    if (limitKeys.length > 0) {
      await this.redis.del(...limitKeys);
    }

    this.logger.log(`Admin set flash sale stock for ${sku} to ${stock} and cleared ${limitKeys.length} user limits.`);

    return {
      success: true,
      sku,
      stock,
      clearedLimitsCount: limitKeys.length,
    };
  }

  @Post()
  async purchase(@Body() body: PurchaseDto) {
    const { userId, sku, campaignId, paymentMethod, deliveryAddress } = body;
    const quantity = body.quantity ?? 1;

    if (!userId || !sku || !campaignId || !paymentMethod || !deliveryAddress) {
      throw new BadRequestException('Missing required fields');
    }

    const stockKey = REDIS_KEYS.flashSaleInventory(sku);
    const limitKey = REDIS_KEYS.userLimit(campaignId, userId);

    // Lua Script from PRD:
    // returns: 1 (success), -1 (limit exceeded), -2 (out of stock)
    const luaScript = `
      local stock_key = KEYS[1]
      local limit_key = KEYS[2]
      local requested_qty = tonumber(ARGV[1])

      -- 1. Check user purchase limit
      local purchased = redis.call("GET", limit_key)
      if purchased and tonumber(purchased) >= 1 then
        return -1
      end

      -- 2. Check inventory availability
      local current_stock = redis.call("GET", stock_key)
      if not current_stock or tonumber(current_stock) < requested_qty then
        return -2
      end

      -- 3. Deduct inventory and set hold key
      redis.call("DECRBY", stock_key, requested_qty)
      redis.call("SET", limit_key, 1, "EX", 300)
      return 1
    `;

    const result = await this.redis.eval(
      luaScript,
      2, // number of keys
      stockKey,
      limitKey,
      quantity,
    );

    if (result === -1) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: 'User purchase limit exceeded' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (result === -2) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: 'Out of stock' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Success! Generate Reservation Token
    const reservationToken = `res_token_${crypto.randomBytes(8).toString('hex')}`;
    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const eventPayload = {
      event_id: crypto.randomUUID(),
      event_type: 'ORDER_CREATED',
      timestamp: new Date().toISOString(),
      data: {
        order_id: orderId,
        user_id: userId,
        delivery_address: {
          province: deliveryAddress.province,
          district: deliveryAddress.district,
          detail_address: deliveryAddress.detailAddress,
        },
        items: [
          {
            sku,
            quantity,
          },
        ],
        payment_method: paymentMethod,
        reservation_token: reservationToken,
        campaign_id: campaignId,
      },
    };

    // Publish event order.created to RabbitMQ queue
    this.mqClient.emit('order.created', eventPayload);

    return {
      success: true,
      message: 'Order queued successfully',
      reservationToken,
      orderId,
    };
  }

  @EventPattern('order.timeout')
  async handleOrderTimeout(@Payload() event: { sku: string; quantity: number; userId: string; campaignId: string }) {
    this.logger.log(`Received order.timeout event for SKU: ${event.sku}, Quantity: ${event.quantity}, User: ${event.userId}`);
    const { sku, quantity, userId, campaignId } = event;

    const stockKey = REDIS_KEYS.flashSaleInventory(sku);
    const limitKey = REDIS_KEYS.userLimit(campaignId, userId);

    // Restore Redis stock and clear limit
    const multi = this.redis.multi();
    multi.incrby(stockKey, quantity);
    multi.del(limitKey);

    const results = await multi.exec();
    this.logger.log(`Restored Redis stock for ${sku} (+${quantity}) and cleared user purchase limit for ${userId}. Results: ${JSON.stringify(results)}`);
  }
}
