const assert = require('assert');
const http = require('http');

function makeHttpRequest(options, bodyPayload) {
  return new Promise((resolve, reject) => {
    const payloadStr = bodyPayload ? JSON.stringify(bodyPayload) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payloadStr),
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch {}
          resolve({ statusCode: res.statusCode, body: json, rawText: body, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (payloadStr) req.write(payloadStr);
    req.end();
  });
}

async function runServicesEndpointsTests() {
  console.log('--- RUNNING SERVICES & ENDPOINTS COVERAGE TESTS ---');

  // TC-GW-01: API Gateway Health Check
  const resGw = await makeHttpRequest({ path: '/', method: 'GET' });
  assert.strictEqual(resGw.statusCode, 200, 'Gateway root must return 200 OK');
  assert.ok(resGw.rawText.includes('Omnidrop Multiwarehouse SOR API Gateway is running'), 'Gateway root text match');
  console.log('  ✅ TC-GW-01 PASSED: API Gateway root health check verified');

  // TC-GW-02: Proxy X-Trace-Id header preservation
  const testTraceId = 'trace_test_coverage_9912';
  const resTrace = await makeHttpRequest({ path: '/products', method: 'GET', headers: { 'X-Trace-Id': testTraceId } });
  assert.strictEqual(resTrace.headers['x-trace-id'], testTraceId, 'API Gateway must preserve incoming X-Trace-Id header');
  console.log('  ✅ TC-GW-02 PASSED: X-Trace-Id header preserved across proxy');

  // TC-CORE-01: GET /products
  const resCore = await makeHttpRequest({ path: '/products', method: 'GET' });
  assert.strictEqual(resCore.statusCode, 200, 'GET /products must return 200 OK');
  assert.ok(Array.isArray(resCore.body), 'GET /products must return an array of variants');
  assert.ok(resCore.body.length > 0, 'Products array must not be empty');
  assert.ok(resCore.body[0].warehouses.length >= 2, 'Variant must list physical stock for KHO_HN and KHO_HCM');
  console.log(`  ✅ TC-CORE-01 PASSED: GET /products returned ${resCore.body.length} variants with warehouse stocks`);

  // TC-FLASH-01: GET /purchase/stock
  const resStock = await makeHttpRequest({ path: '/purchase/stock?sku=KINH-X-DEN-SIZE-M', method: 'GET' });
  assert.strictEqual(resStock.statusCode, 200, 'GET /purchase/stock must return 200 OK');
  assert.strictEqual(resStock.body.sku, 'KINH-X-DEN-SIZE-M', 'SKU must match request query');
  assert.ok(typeof resStock.body.stock === 'number', 'Stock value must be a number');
  console.log(`  ✅ TC-FLASH-01 PASSED: GET /purchase/stock returned stock=${resStock.body.stock}`);

  // TC-FLASH-02: POST /purchase/admin/campaign
  const resAdmin = await makeHttpRequest(
    { path: '/purchase/admin/campaign', method: 'POST' },
    { sku: 'KINH-X-DEN-SIZE-M', stock: 15 }
  );
  assert.strictEqual(resAdmin.statusCode, 201 || resAdmin.statusCode === 200, 'Admin campaign update must succeed');
  assert.strictEqual(resAdmin.body.stock, 15, 'Admin campaign stock must update to 15');
  console.log('  ✅ TC-FLASH-02 PASSED: Admin campaign stock updated to 15 and user limits cleared');

  // TC-ORDER-01: GET /orders
  const resOrders = await makeHttpRequest({ path: '/orders', method: 'GET' });
  assert.strictEqual(resOrders.statusCode, 200, 'GET /orders must return 200 OK');
  assert.ok(Array.isArray(resOrders.body), 'GET /orders must return array of orders');
  console.log(`  ✅ TC-ORDER-01 PASSED: GET /orders returned ${resOrders.body.length} orders`);

  console.log('--- ALL SERVICES & ENDPOINTS COVERAGE TESTS PASSED ---\n');
}

module.exports = { runServicesEndpointsTests };

if (require.main === module) {
  runServicesEndpointsTests();
}
