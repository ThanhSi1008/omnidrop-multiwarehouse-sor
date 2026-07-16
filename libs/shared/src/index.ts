// Shared Types, Constants, and Helper Configurations for Omni E-commerce System

export interface UserLimitKey {
  campaignId: string;
  userId: string;
}

export interface InventoryFlashSaleKey {
  sku: string;
}

export const REDIS_KEYS = {
  flashSaleInventory: (sku: string) => `inventory:flash_sale:${sku}`,
  userLimit: (campaignId: string, userId: string) => `user:limit:${campaignId}:${userId}`,
};

export const EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_TIMEOUT: 'order.timeout',
  INVENTORY_RELEASED: 'inventory.released',
};
