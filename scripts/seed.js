const { Client } = require('pg');
const Redis = require('ioredis');

async function seed() {
  console.log('Seeding Multi-Product Apparel Catalog DB & Redis...');

  const pgClient = new Client({
    connectionString: 'postgresql://postgres:postgrespassword@localhost:5432/omnidrop_db',
  });

  const productsData = [
    {
      id: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9df3',
      variantId: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9df4',
      title: 'Áo Polo Nam Luxury Cool-Tech Omni',
      description: 'Chất liệu thun cá sấu 100% cotton dệt cao cấp, thoáng khí, chống nhăn xù',
      sku: 'KINH-X-DEN-SIZE-M',
      price: 325000,
      hnQty: 15,
      hcmQty: 15,
    },
    {
      id: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9df5',
      variantId: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9df6',
      title: 'Áo Hoodie Oversized Omni Heavyweight',
      description: 'Chất liệu Nỉ Chân Cua 100% Cotton định lượng 400gsm dày dặn đứng form',
      sku: 'HOODIE-OMNI-BLACK-L',
      price: 590000,
      hnQty: 20,
      hcmQty: 20,
    },
    {
      id: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9df7',
      variantId: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9df8',
      title: 'Quần Khaki Slim-Fit Co Giãn Owen Premium',
      description: 'Vải khaki nhập khẩu co giãn 4 chiều, chống nhăn công sở thanh lịch',
      sku: 'QUAN-KHAKI-OWEN-SLIM',
      price: 450000,
      hnQty: 15,
      hcmQty: 15,
    },
    {
      id: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9df9',
      variantId: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9d00',
      title: 'Áo Sơ Mi Nam Formal Trắng Chống Nhăn',
      description: 'Áo sơ mi tay dài cổ đức chuẩn form Châu Âu, vải bamboo chống nhăn tự nhiên',
      sku: 'AO-SOMI-FORMAL-TRANG',
      price: 480000,
      hnQty: 18,
      hcmQty: 18,
    },
    {
      id: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9d01',
      variantId: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9d02',
      title: 'Áo Khoác Bomber Minimalist Windbreaker',
      description: 'Chất liệu trượt nước cao cấp 2 lớp chống gió, khóa kéo YKK độ bền cao',
      sku: 'AO-KHOAC-BOMBER-DEN',
      price: 650000,
      hnQty: 12,
      hcmQty: 12,
    },
    {
      id: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9d03',
      variantId: '9c4d1685-79a8-44fb-9cf9-fbdf3b2c9d04',
      title: 'Combo 3 Áo Thun Basic Cotton 100%',
      description: 'Set 3 áo thun nam cổ tròn (Đen / Trắng / Xám) mềm mịn mát mẻ',
      sku: 'COMBO-3-AO-THUN-BASIC',
      price: 390000,
      hnQty: 25,
      hcmQty: 25,
    },
  ];

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

    for (const p of productsData) {
      await pgClient.query(`
        INSERT INTO core.products (id, title, description, created_at, updated_at)
        VALUES ('${p.id}', '${p.title}', '${p.description}', NOW(), NOW())
      `);

      await pgClient.query(`
        INSERT INTO core.product_variants (id, product_id, sku, price, created_at, updated_at)
        VALUES ('${p.variantId}', '${p.id}', '${p.sku}', ${p.price}, NOW(), NOW())
      `);

      await pgClient.query(`
        INSERT INTO core.inventory (id, warehouse_id, variant_id, quantity, reserved_quantity, created_at, updated_at)
        VALUES 
          (gen_random_uuid(), '${hnWarehouseId}', '${p.variantId}', ${p.hnQty}, 0, NOW(), NOW()),
          (gen_random_uuid(), '${hcmWarehouseId}', '${p.variantId}', ${p.hcmQty}, 0, NOW(), NOW())
      `);
    }

    console.log(`Inserted ${productsData.length} apparel products & variants into PostgreSQL.`);

  } catch (err) {
    console.error('PostgreSQL Seeding Error:', err);
  } finally {
    await pgClient.end();
  }

  // 2. Redis Connection
  const redis = new Redis({ host: 'localhost', port: 6380 });

  try {
    for (const p of productsData) {
      const stockKey = `inventory:flash_sale:${p.sku}`;
      const totalStock = p.hnQty + p.hcmQty;
      await redis.set(stockKey, totalStock);
      console.log(`Seeded Redis stock: ${stockKey} = ${totalStock}`);
    }

    // Clear user limits
    const keys = await redis.keys('user:limit:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    console.log(`Redis Seeded successfully for all ${productsData.length} SKUs. Cleared purchase limits.`);
  } catch (err) {
    console.error('Redis Seeding Error:', err);
  } finally {
    await redis.quit();
  }

  console.log('Seeding Completed successfully.');
}

seed();
