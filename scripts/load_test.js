const http = require('http');
const Redis = require('ioredis');
const { Client } = require('pg');

// Parse CLI flags or use defaults
const TOTAL_REQUESTS = parseInt(process.argv[2], 10) || 2000;
const CONCURRENCY = parseInt(process.argv[3], 10) || 100;
const INITIAL_STOCK = parseInt(process.argv[4], 10) || 50;

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: CONCURRENCY,
});

async function runLoadTest() {
  console.log('================================================================');
  console.log('⚡ OMNIDROP HIGH-CONCURRENCY FLASH SALE LOAD BENCHMARK (PHASE 5)');
  console.log('================================================================');
  console.log(`Target Endpoint: HTTP POST http://localhost:3000/purchase`);
  console.log(`Total Requests : ${TOTAL_REQUESTS}`);
  console.log(`Concurrency    : ${CONCURRENCY} parallel worker connections`);
  console.log(`Initial Stock  : ${INITIAL_STOCK} units in Redis`);
  console.log('----------------------------------------------------------------\n');

  // 1. Clear PostgreSQL Order tables for clean benchmark environment
  const pgClient = new Client({
    connectionString: 'postgresql://postgres:postgrespassword@localhost:5432/omnidrop_db',
  });
  await pgClient.connect();
  await pgClient.query('DELETE FROM "order".order_items');
  await pgClient.query('DELETE FROM "order".fulfillments');
  await pgClient.query('DELETE FROM "order".orders');
  await pgClient.end();
  console.log('[SEED] Cleared PostgreSQL Order tables.');

  // 2. Seed Redis Stock for Load Test
  const redis = new Redis({ host: 'localhost', port: 6380 });
  const sku = 'KINH-X-DEN-SIZE-M';
  const stockKey = `inventory:flash_sale:${sku}`;
  await redis.set(stockKey, INITIAL_STOCK);
  
  // Clear any existing load limit keys
  const limitKeys = await redis.keys('user:limit:*');
  if (limitKeys.length > 0) {
    await redis.del(...limitKeys);
  }
  await redis.quit();
  console.log(`[SEED] Redis campaign stock reset to ${INITIAL_STOCK} units. Purchase limits cleared.\n`);

  // Metrics collection
  let completed = 0;
  let successCount = 0;
  let outOfStockCount = 0;
  let limitExceededCount = 0;
  let errorCount = 0;
  const latencies = [];

  const startTime = Date.now();

  function makeRequest(index) {
    return new Promise((resolve) => {
      const payload = JSON.stringify({
        userId: `usr_load_bench_${index}`,
        sku: sku,
        campaignId: 'flash_sale_summer',
        quantity: 1,
        paymentMethod: 'ONLINE_GATEWAY',
        deliveryAddress: {
          province: index % 2 === 0 ? 'Hanoi' : 'HCM',
          district: 'District Load',
          detailAddress: `${index} Benchmark Street`,
        },
      });

      const reqStart = Date.now();
      const req = http.request(
        {
          hostname: 'localhost',
          port: 3000,
          path: '/purchase',
          method: 'POST',
          agent: agent,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'X-Trace-Id': `trace_bench_${index}_${Date.now()}`,
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            const latency = Date.now() - reqStart;
            latencies.push(latency);
            completed++;

            if (res.statusCode === 201 || res.statusCode === 200) {
              successCount++;
            } else if (res.statusCode === 400) {
              if (body.includes('Out of stock')) {
                outOfStockCount++;
              } else if (body.includes('limit exceeded')) {
                limitExceededCount++;
              } else {
                errorCount++;
              }
            } else {
              errorCount++;
            }
            resolve();
          });
        }
      );

      req.on('error', (err) => {
        const latency = Date.now() - reqStart;
        latencies.push(latency);
        completed++;
        errorCount++;
        resolve();
      });

      req.write(payload);
      req.end();
    });
  }

  console.log(`[BENCHMARK] Executing ${TOTAL_REQUESTS} burst requests...`);

  // Dispatch requests in batches of CONCURRENCY
  let reqIndex = 0;
  async function worker() {
    while (reqIndex < TOTAL_REQUESTS) {
      const curr = reqIndex++;
      await makeRequest(curr);
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const durationMs = Date.now() - startTime;
  const durationSec = durationMs / 1000;
  const rps = (completed / durationSec).toFixed(2);
  const opm = (rps * 60).toFixed(0);

  // Calculate Latency stats
  latencies.sort((a, b) => a - b);
  const minLat = latencies[0] || 0;
  const maxLat = latencies[latencies.length - 1] || 0;
  const meanLat = (latencies.reduce((a, b) => a + b, 0) / latencies.length || 0).toFixed(2);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

  console.log('\n================================================================');
  console.log('📊 LOAD TEST BENCHMARK RESULTS');
  console.log('================================================================');
  console.log(`Total Requests Processed : ${completed}`);
  console.log(`Total Execution Time     : ${durationMs} ms (${durationSec.toFixed(2)} s)`);
  console.log(`Throughput (RPS)         : ${rps} req/sec`);
  console.log(`Throughput (OPM)         : ${opm} orders/minute`);
  console.log('----------------------------------------------------------------');
  console.log(`HTTP 200/201 (Successful) : ${successCount} (Reserved & Queued)`);
  console.log(`HTTP 400 (Out of Stock)  : ${outOfStockCount}`);
  console.log(`HTTP 400 (Limit Exceeded): ${limitExceededCount}`);
  console.log(`HTTP 5xx (Errors)        : ${errorCount}`);
  console.log('----------------------------------------------------------------');
  console.log(`Latency Min              : ${minLat} ms`);
  console.log(`Latency Mean             : ${meanLat} ms`);
  console.log(`Latency Median (p50)     : ${p50} ms`);
  console.log(`Latency p95              : ${p95} ms`);
  console.log(`Latency p99              : ${p99} ms`);
  console.log(`Latency Max              : ${maxLat} ms`);
  console.log('================================================================\n');

  if (errorCount === 0 && successCount === INITIAL_STOCK) {
    console.log('✅ BENCHMARK PASSED PERFECTLY: Atomic Lua Script correctly capped sales at initial stock!');
  } else if (errorCount > 0) {
    console.warn('⚠️ WARNING: Requests encountered 5xx errors during benchmark.');
  }
}

runLoadTest().catch((err) => {
  console.error('Load test error:', err);
});
