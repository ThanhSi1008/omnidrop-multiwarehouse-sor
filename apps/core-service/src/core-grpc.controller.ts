import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { Inventory } from './entities/inventory.entity';
import { InjectRepository as InjectRepo } from '@nestjs/typeorm';

interface GetSkuStockRequest {
  sku: string;
}

interface WarehouseStock {
  warehouse_code: string;
  quantity: number;
  reserved_quantity: number;
  available_to_sell: number;
}

interface GetSkuStockResponse {
  sku: string;
  stocks: WarehouseStock[];
  price: number;
}

@Controller()
export class CoreGrpcController {
  constructor(
    @InjectRepo(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepo(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  @GrpcMethod('CoreService', 'GetSkuStock')
  async getSkuStock(data: GetSkuStockRequest): Promise<GetSkuStockResponse> {
    const variant = await this.variantRepo.findOne({
      where: { sku: data.sku },
    });

    if (!variant) {
      return { sku: data.sku, stocks: [], price: 0 };
    }

    const inventories = await this.inventoryRepo.find({
      where: { variantId: variant.id },
      relations: { warehouse: true },
    });

    const stocks = inventories.map((inv) => {
      const quantity = inv.quantity;
      const reserved = inv.reservedQuantity;
      const ats = quantity - reserved;
      return {
        warehouse_code: inv.warehouse.code, // snake_case to match core.proto with keepCase: true
        quantity,
        reserved_quantity: reserved,
        available_to_sell: ats,
      };
    });

    return {
      sku: data.sku,
      stocks,
      price: Number(variant.price),
    };
  }
}
