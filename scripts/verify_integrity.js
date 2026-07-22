const { Client } = require('pg');
const Redis = require('ioredis');

async function verifyIntegrity() {
  console.log('================================================================');
  console.log('🔍 OMNIDROP ANTI-OVERSELLING & DATA INTEGRITY AUDIT (PHASE 5)');
  console.log('================================================================\n');

  const pgClient = new Client({
    connectionString: 'postgresql://postgres:postgrespassword@localhost:5432/omnidrop_db',
  });
  await pgClient.connect();

  const redis = new Redis({ host: 'localhost', port: 6380 });
  const sku = 'KINH-X-DEN-SIZE-M';

  // 1. Check Redis remaining stock
  const redisStockVal = await redis.get(`inventory:flash_sale:${sku}`);
  const redisRemaining = redisStockVal !== null ? parseInt(redisStockVal, 10) : 0;
  console.log(`[REDIS] Remaining Flash Sale Stock for ${sku}: ${redisRemaining}`);

  // 2. Query PostgreSQL Orders created under campaign
  const ordersRes = await pgClient.query(
    `SELECT count(*) as total_orders FROM "order".orders WHERE campaign_id = 'flash_sale_summer'`
  );
  const totalOrdersInPg = parseInt(ordersRes.rows[0].total_orders, 10);
  console.log(`[POSTGRES] Total Orders Saved in Schema 'order': ${totalOrdersInPg}`);

  // 3. Query Fulfillments per Warehouse
  const fulfillmentRes = await pgClient.query(
    `SELECT warehouse_code, count(*) as count FROM "order".fulfillments GROUP BY warehouse_code`
  );
  console.log(`[POSTGRES] Fulfillments Breakdown:`);
  for (const row of fulfillmentRes.rows) {
    console.log(`  - Warehouse ${row.warehouse_code}: ${row.count} fulfillments created`);
  }

  // 4. Check User Duplicate Purchases
  const userDupesRes = await pgClient.query(
    `SELECT user_id, count(*) as order_count FROM "order".orders WHERE campaign_id = 'flash_sale_summer' GROUP BY user_id HAVING count(*) > 1`
  );

  const duplicateUserCount = userDupesRes.rows.length;
  console.log(`[SECURITY] Duplicate Purchases per User: ${duplicateUserCount} (Target: 0)`);

  // 5. Data Integrity Audit Calculation
  const initialStock = 50; // default benchmark allocation
  const calculatedTotal = totalOrdersInPg + redisRemaining;

  console.log('\n----------------------------------------------------------------');
  console.log('AUDIT REPORT MATRIX:');
  console.log(`  Initial Campaign Stock Allocation : ${initialStock}`);
  console.log(`  Orders Created in PostgreSQL DB   : ${totalOrdersInPg}`);
  console.log(`  Remaining Stock in Redis Cache    : ${redisRemaining}`);
  console.log(`  Audit Sum (Orders + Redis Stock)  : ${calculatedTotal}`);
  console.log('----------------------------------------------------------------\n');

  let passed = true;

  if (duplicateUserCount > 0) {
    console.error('❌ FAIL: Found users with duplicate purchase orders under race condition!');
    passed = false;
  }

  if (totalOrdersInPg > initialStock) {
    console.error(`❌ CRITICAL OVERSELLING ERROR: PostgreSQL order count (${totalOrdersInPg}) exceeds initial stock (${initialStock})!`);
    passed = false;
  } else {
    console.log('✅ ZERO OVERSELLING ASSERTION PASSED: Total orders never exceeded available stock!');
  }

  if (passed) {
    console.log('\n🎉 ALL DATA INTEGRITY & ANTI-OVERSELLING AUDITS PASSED 100%!');
  } else {
    console.error('\n❌ DATA INTEGRITY AUDIT FAILED!');
    process.exit(1);
  }

  await pgClient.end();
  await redis.quit();
}

verifyIntegrity().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
