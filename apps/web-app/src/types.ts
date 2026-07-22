export interface WarehouseStock {
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableToSell: number;
}

export interface ProductItem {
  id: string;
  sku: string;
  price: number;
  originalPrice: number;
  title: string;
  description: string;
  category: 'flash_sale' | 'sunglasses' | 'apparel' | 'accessories' | 'bundles';
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  warehouses: WarehouseStock[];
  totalAts: number;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface FulfillmentItem {
  id: string;
  warehouseCode: string;
  status: string;
}

export interface OrderItemRecord {
  id: string;
  orderCode: string;
  userId: string;
  status: string;
  paymentMethod: string;
  totalPrice: number;
  province: string;
  district: string;
  detailAddress: string;
  campaignId: string;
  createdAt: string;
  items: { id: string; sku: string; quantity: number; price: number }[];
  fulfillments: FulfillmentItem[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
