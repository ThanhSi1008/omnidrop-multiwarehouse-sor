const { Client } = require('pg');
const Redis = require('ioredis');

async function seed() {
  console.log('Seeding DB & Redis (JavaScript)...');

  // 1. PostgreSQL Connection
  const pgClient = new Client({
    connectionString: 'postgresql://postgres:postgrespassword@localhost:5432/omnidrop_db',
  });

  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL.');

    // Clear old data
    await pgClient.query('DELETE FROM core.inventory');
    await pgClient.query('DELETE FROM core.product_variants');
    await pgClient.query('DELETE FROM core.products');
    await pgClient.query('DELETE FROM core.warehouses');
    await pgClient.query('DELETE FROM "order".order_items');
    await pgClient.query('DELETE FROM "order".fulfillments');
    await pgClient.query('DELETE FROM "order".orders');
    console.log('Cleared existing records.');

    // Insert Warehouses
    const hnWarehouseId = '8c4d1685-79a8-44fb-9cf9-fbdf3b2c9df1';
    const hcmWarehouseId = '8c4d1685-79a8-44fb-9cf9-fbdf3b2c9df2';

    await pgClient.query(`
      INSERT INTO core.warehouses (id, code, name, address, created_at, updated_at)
      VALUES 
        ('${hnWarehouseId}', 'KHO_HN', 'Kho Miền Bắc - Hà Nội', '8 Tôn Thất Thuyết, Cầu Giấy, Hà Nội', NOW(), NOW()),
        ('${hcmWarehouseId}', 'KHO_HCM', 'Kho Miền Nam - Hồ Chí Minh', '123 Nguyễn Trãi, Quận 1, TP. HCM', NOW(), NOW())
    `);
    console.log('Inserted Warehouses KHO_HN and KHO_HCM.');

    // Insert Product & Variant
    const productId = '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9df3';
    const variantId = '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9df4';
    const sku = 'KINH-X-DEN-SIZE-M';

    await pgClient.query(`
      INSERT INTO core.products (id, title, description, created_at, updated_at)
      VALUES ('${productId}', 'Kính mát thời trang Omni', 'Kính chống UV cao cấp thương hiệu Omni', NOW(), NOW())
    `);

    await pgClient.query(`
      INSERT INTO core.product_variants (id, product_id, sku, price, created_at, updated_at)
      VALUES ('${variantId}', '${productId}', '${sku}', 425000.00, NOW(), NOW())
    `);
    console.log(`Inserted Product and Variant SKU: ${sku} with Price: 425,000.`);

    // Insert Inventory
    await pgClient.query(`
      INSERT INTO core.inventory (id, warehouse_id, variant_id, quantity, reserved_quantity, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), '${hnWarehouseId}', '${variantId}', 5, 0, NOW(), NOW()),
        (gen_random_uuid(), '${hcmWarehouseId}', '${variantId}', 5, 0, NOW(), NOW())
    `);
    console.log('Inserted physical stock (5 HN, 5 HCM).');

  } catch (err) {
    console.error('PostgreSQL Seeding Error:', err);
  } finally {
    await pgClient.end();
  }

  // 2. Redis Connection
  const redis = new Redis({
    host: 'localhost',
    port: 6380,
  });

  try {
    const sku = 'KINH-X-DEN-SIZE-M';
    const stockKey = `inventory:flash_sale:${sku}`;
    
    // Set Flash Sale Stock to 3
    await redis.set(stockKey, 3);
    
    // Clear user limits
    const keys = await redis.keys('user:limit:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    console.log(`Redis Seeded: Set ${stockKey} to 3. Cleared purchase limits.`);
  } catch (err) {
    console.error('Redis Seeding Error:', err);
  } finally {
    await redis.quit();
  }

  console.log('Seeding Completed successfully.');
}
seed();
