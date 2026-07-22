import { ProductItem, OrderItemRecord } from '../types';

export async function fetchProductsApi(): Promise<ProductItem[]> {
  const res = await fetch('/api/products');
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await res.json();
  
  return data.map((item: any) => {
    let category: ProductItem['category'] = 'apparel';
    let imageUrl = '/omni_hoodie.png';
    let badge = 'THỜI TRANG NAM';
    let originalPrice = item.price * 1.5;

    if (item.sku === 'KINH-X-DEN-SIZE-M') {
      category = 'flash_sale';
      imageUrl = '/omni_hoodie.png';
      badge = '⚡ FLASH SALE POLO';
      originalPrice = 650000;
    } else if (item.sku === 'HOODIE-OMNI-BLACK-L') {
      category = 'apparel';
      imageUrl = '/omni_hoodie.png';
      badge = 'HOODIE 400GSM';
      originalPrice = 890000;
    } else if (item.sku === 'QUAN-KHAKI-OWEN-SLIM') {
      category = 'apparel';
      imageUrl = '/omni_hoodie.png';
      badge = 'KHAKI SLIM-FIT';
      originalPrice = 650000;
    } else if (item.sku === 'AO-SOMI-FORMAL-TRANG') {
      category = 'apparel';
      imageUrl = '/omni_hoodie.png';
      badge = 'SƠ MI CÔNG SỞ';
      originalPrice = 720000;
    } else if (item.sku === 'AO-KHOAC-BOMBER-DEN') {
      category = 'apparel';
      imageUrl = '/omni_hoodie.png';
      badge = 'BOMBER 2 LỚP';
      originalPrice = 950000;
    } else if (item.sku === 'COMBO-3-AO-THUN-BASIC') {
      category = 'bundles';
      imageUrl = '/omni_bundle.png';
      badge = '🎁 COMBO 3 ÁO THUN';
      originalPrice = 580000;
    }

    const totalAts = item.warehouses
      ? item.warehouses.reduce((sum: number, w: any) => sum + (w.availableToSell || 0), 0)
      : 20;

    return {
      id: item.id || item.variantId,
      sku: item.sku,
      price: item.price || 325000,
      originalPrice,
      title: item.productTitle || item.title || item.sku,
      description: item.productDescription || item.description || 'Sản phẩm thời trang cao cấp thương hiệu Omni',
      category,
      imageUrl,
      rating: 4.9,
      reviewsCount: 156,
      badge,
      warehouses: item.warehouses || [],
      totalAts,
    };
  });
}

export async function fetchFlashSaleStockApi(sku: string = 'KINH-X-DEN-SIZE-M'): Promise<number> {
  const res = await fetch(`/api/purchase/stock?sku=${sku}`);
  if (!res.ok) throw new Error('Failed to fetch flash sale stock');
  const data = await res.json();
  return data.stock;
}

export async function refillCampaignStockApi(sku: string, stock: number = 10): Promise<{ success: boolean; message?: string }> {
  const res = await fetch('/api/purchase/admin/campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sku, stock }),
  });
  return res.json();
}

export async function createPurchaseApi(payload: {
  userId: string;
  sku: string;
  campaignId: string;
  quantity: number;
  paymentMethod: string;
  deliveryAddress: { province: string; district: string; detailAddress: string };
}): Promise<{ success: boolean; orderId: string; message?: string }> {
  const res = await fetch('/api/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Tạo đơn hàng thất bại');
  }
  return data;
}

export async function fetchOrdersApi(): Promise<OrderItemRecord[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function payOrderApi(orderId: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`/api/orders/${orderId}/pay`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Thanh toán thất bại');
  return data;
}

export async function registerUserApi(payload: { fullName: string; email: string; phone?: string }): Promise<any> {
  const res = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Đăng ký thất bại');
  return res.json();
}

export async function loginUserApi(email: string): Promise<any> {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Đăng nhập thất bại');
  return res.json();
}

