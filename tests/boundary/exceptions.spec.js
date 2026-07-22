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
          let json = {};
          try {
            json = JSON.parse(body);
          } catch {}
          resolve({ statusCode: res.statusCode, body: json, rawText: body });
        });
      }
    );
    req.on('error', reject);
    if (payloadStr) req.write(payloadStr);
    req.end();
  });
}

async function runBoundaryExceptionTests() {
  console.log('--- RUNNING BOUNDARY & EXCEPTION TESTS ---');

  // TC-BOUND-01: Missing required fields in POST /purchase
  const res1 = await makeHttpRequest({ path: '/purchase', method: 'POST' }, {
    userId: 'usr_incomplete',
    sku: 'KINH-X-DEN-SIZE-M',
    // Missing deliveryAddress & paymentMethod
  });

  assert.strictEqual(res1.statusCode, 400, 'Must return 400 Bad Request when missing fields');
  assert.ok(res1.body.message.includes('Missing required fields'), 'Error message must specify missing fields');
  console.log('  ✅ TC-BOUND-01 PASSED: Missing required fields rejected with 400 Bad Request');

  // TC-BOUND-02: Pay Non-existent Order ID
  const res2 = await makeHttpRequest({ path: '/orders/8c4d1685-0000-0000-0000-000000000000/pay', method: 'POST' });
  assert.strictEqual(res2.statusCode, 404, 'Must return 404 Not Found for invalid order ID');
  console.log('  ✅ TC-BOUND-02 PASSED: Paying non-existent order rejected with 404 Not Found');

  // TC-BOUND-04: Negative Admin Campaign Stock
  const res4 = await makeHttpRequest(
    { path: '/purchase/admin/campaign', method: 'POST' },
    { sku: 'KINH-X-DEN-SIZE-M', stock: -10 }
  );
  assert.strictEqual(res4.statusCode, 400, 'Must return 400 Bad Request for negative stock input');
  console.log('  ✅ TC-BOUND-04 PASSED: Negative stock input rejected with 400 Bad Request');

  console.log('--- ALL BOUNDARY & EXCEPTION TESTS PASSED ---\n');
}

module.exports = { runBoundaryExceptionTests };

if (require.main === module) {
  runBoundaryExceptionTests();
}
