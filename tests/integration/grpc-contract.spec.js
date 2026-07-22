const assert = require('assert');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

async function runGrpcIntegrationTest() {
  console.log('--- RUNNING INTEGRATION TEST: gRPC CONTRACT (TC-INT-01) ---');

  const protoPath = path.join(__dirname, '../../libs/shared/proto/core.proto');
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const coreProto = grpc.loadPackageDefinition(packageDefinition).core;
  const client = new coreProto.CoreService('localhost:50052', grpc.credentials.createInsecure());

  await new Promise((resolve, reject) => {
    client.GetSkuStock({ sku: 'KINH-X-DEN-SIZE-M' }, (err, response) => {
      if (err) {
        console.error('gRPC Error:', err);
        return reject(err);
      }

      assert.strictEqual(response.sku, 'KINH-X-DEN-SIZE-M', 'gRPC SKU match');
      assert.ok(Array.isArray(response.stocks), 'gRPC response must contain stocks array');
      assert.ok(response.price > 0, 'gRPC response must contain positive price');

      for (const stock of response.stocks) {
        assert.ok(stock.warehouse_code, 'Stock item must have warehouse_code');
        assert.ok(typeof stock.available_to_sell === 'number', 'available_to_sell must be a number');
      }

      console.log(`  ✅ TC-INT-01 PASSED: gRPC GetSkuStock contract verified! Price: ${response.price}, Warehouses: ${response.stocks.length}`);
      resolve();
    });
  });

  client.close();
  console.log('--- gRPC INTEGRATION TEST PASSED ---\n');
}

module.exports = { runGrpcIntegrationTest };

if (require.main === module) {
  runGrpcIntegrationTest();
}
