import { Client } from 'pg';

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

export async function ensureSchemaExists(connectionString: string, schemaName: string) {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log(`Schema "${schemaName}" is verified/created.`);
  } catch (error) {
    console.error(`Failed to ensure schema "${schemaName}" exists:`, error);
  } finally {
    await client.end();
  }
}
