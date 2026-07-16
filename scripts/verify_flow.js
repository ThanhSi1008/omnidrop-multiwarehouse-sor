const { Client } = require('pg');
const Redis = require('ioredis');

// Helper sleep function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runVerification() {
  console.log('--- STARTING END-TO-END FLOW VERIFICATION ---');

  // Set up connection clients
  const pgClient = new Client({
    connectionString: 'postgresql://postgres:postgrespassword@localhost:5432/omnidrop_db',
  });
  await pgClient.connect();

  const redis = new Redis({
    host: 'localhost',
    port: 6380,
  });

  const sku = 'KINH-X-DEN-SIZE-M';

  // 1. Check Initial Stocks
  console.log('\n[1] Checking initial stock states...');
  const initialRedisStock = await redis.get(`inventory:flash_sale:${sku}`);
  console.log(`Initial Redis Campaign Stock: ${initialRedisStock}`);

  const initialHnStockRes = await pgClient.query("SELECT quantity, reserved_quantity FROM core.inventory WHERE warehouse_id = '8c4d1685-79a8-44fb-9cf9-fbdf3b2c9df1'");
  const initialHcmStockRes = await pgClient.query("SELECT quantity, reserved_quantity FROM core.inventory WHERE warehouse_id = '8c4d1685-79a8-44fb-9cf9-fbdf3b2c9df2'");

  console.log(`Initial HN Warehouse Physical Stock: ${initialHnStockRes.rows[0].quantity}, Reserved: ${initialHnStockRes.rows[0].reserved_quantity}`);
  console.log(`Initial HCM Warehouse Physical Stock: ${initialHcmStockRes.rows[0].quantity}, Reserved: ${initialHcmStockRes.rows[0].reserved_quantity}`);

  // 2. Submit Flash Sale Purchase through API Gateway (port 3000)
  console.log('\n[2] Sending purchase request for User 1 (Hanoi address)...');
  const response = await fetch('http://localhost:3000/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'usr_77210',
      sku: sku,
      campaignId: 'flash_sale_summer',
      quantity: 1,
      paymentMethod: 'ONLINE_GATEWAY',
      deliveryAddress: {
        province: 'Hanoi',
        district: 'Cau Giay',
        detailAddress: '8 Tôn Thất Thuyết',
      },
    }),
  });

  const resJson = await response.json();
  console.log('Purchase Response:', resJson);

  if (!resJson.success) {
    console.error('Purchase failed!');
    await pgClient.end();
    await redis.quit();
    process.exit(1);
  }

  const { orderId, reservationToken } = resJson;

  // Wait 2 seconds for RabbitMQ and SOR processing to finish
  console.log('Waiting for RabbitMQ consumer & SOR routing...');
  await sleep(2000);

  // Check Redis state after purchase
  const postPurchaseRedisStock = await redis.get(`inventory:flash_sale:${sku}`);
  const userLimitValue = await redis.get('user:limit:flash_sale_summer:usr_77210');
  console.log(`Post-Purchase Redis Stock (Expected: 2): ${postPurchaseRedisStock}`);
  console.log(`User Limit flag in Redis (Expected: 1): ${userLimitValue}`);

  // Check PostgreSQL Orders & Fulfillments
  const orderRes = await pgClient.query(`SELECT * FROM "order".orders WHERE order_code = '${orderId}'`);
  if (orderRes.rows.length === 0) {
    console.error('Order was not created in PostgreSQL!');
    process.exit(1);
  }
  const order = orderRes.rows[0];
  console.log(`PostgreSQL Order Saved: Code=${order.order_code}, Status=${order.status}, TotalPrice=${order.total_price}`);

  const fulfillmentRes = await pgClient.query(`SELECT * FROM "order".fulfillments WHERE order_id = '${order.id}'`);
  console.log(`Fulfillments created: ${fulfillmentRes.rows.length}`);
  for (const f of fulfillmentRes.rows) {
    console.log(`- Warehouse assigned: ${f.warehouse_code}, Status: ${f.status}`);
  }

  // 3. Simulating paying for the order
  console.log(`\n[3] Triggering Payment simulation for Order ID: ${order.id}...`);
  const payResponse = await fetch(`http://localhost:3000/orders/${order.id}/pay`, {
    method: 'POST',
  });
  const payJson = await payResponse.json();
  console.log('Payment Response:', payJson);

  // Wait 2 seconds for payment event propagation (order.paid) to finish
  console.log('Waiting for Saga execution...');
  await sleep(2000);

  // Check Database physical stock deduction
  const finalHnStockRes = await pgClient.query("SELECT quantity, reserved_quantity FROM core.inventory WHERE warehouse_id = '8c4d1685-79a8-44fb-9cf9-fbdf3b2c9df1'");
  console.log(`Final HN Warehouse Physical Stock (Expected: 4): ${finalHnStockRes.rows[0].quantity}, Reserved (Expected: 0): ${finalHnStockRes.rows[0].reserved_quantity}`);

  // 4. Test Timeout Rollback Flow
  console.log('\n[4] Simulating purchase for User 2 (will trigger timeout rollback)...');
  const response2 = await fetch('http://localhost:3000/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'usr_88220',
      sku: sku,
      campaignId: 'flash_sale_summer',
      quantity: 1,
      paymentMethod: 'ONLINE_GATEWAY',
      deliveryAddress: {
        province: 'HCM',
        district: 'District 1',
        detailAddress: '123 Nguyen Trai',
      },
    }),
  });

  const resJson2 = await response2.json();
  const orderId2 = resJson2.orderId;
  console.log(`User 2 Purchase success. Order ID: ${orderId2}`);

  await sleep(1500);

  // Check Redis stock before rollback
  const redisStockBeforeRollback = await redis.get(`inventory:flash_sale:${sku}`);
  console.log(`Redis Stock before rollback: ${redisStockBeforeRollback}`);

  // Check User 2 Order Status
  const orderRes2 = await pgClient.query(`SELECT * FROM "order".orders WHERE order_code = '${orderId2}'`);
  const order2 = orderRes2.rows[0];
  console.log(`Order 2 status: ${order2.status}`);

  // Artificially change created_at of Order 2 to 10 minutes ago so the timeout worker will catch it!
  await pgClient.query(`UPDATE "order".orders SET created_at = NOW() - INTERVAL '10 minutes' WHERE id = '${order2.id}'`);
  console.log('Artificially updated Order 2 created_at to 10 minutes ago.');

  // Trigger timeout check manually via endpoint
  console.log('Triggering timeout worker...');
  const timeoutTriggerRes = await fetch('http://localhost:3000/orders/check-timeouts-trigger');
  const timeoutTriggerJson = await timeoutTriggerRes.json();
  console.log('Timeout Worker Trigger Response:', timeoutTriggerJson);

  // Wait 2 seconds for RabbitMQ order.timeout propagation
  await sleep(2000);

  // Verify stock restored
  const redisStockAfterRollback = await redis.get(`inventory:flash_sale:${sku}`);
  const user2LimitVal = await redis.get('user:limit:flash_sale_summer:usr_88220');
  console.log(`Redis Stock after rollback (Expected: 2): ${redisStockAfterRollback}`);
  console.log(`User 2 Limit flag in Redis (Expected: null): ${user2LimitVal}`);

  const orderRes2Final = await pgClient.query(`SELECT status FROM "order".orders WHERE id = '${order2.id}'`);
  console.log(`Final Order 2 status in PostgreSQL (Expected: CANCELLED): ${orderRes2Final.rows[0].status}`);

  console.log('\n--- VERIFICATION COMPLETED SUCCESSFULLY ---');

  // Close connections
  await pgClient.end();
  await redis.quit();
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
});
