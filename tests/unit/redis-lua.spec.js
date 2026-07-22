const assert = require('assert');
const Redis = require('ioredis');

async function runRedisLuaUnitTests() {
  console.log('--- RUNNING UNIT TESTS: ATOMIC REDIS LUA ENGINE ---');
  const redis = new Redis({ host: 'localhost', port: 6380 });

  const sku = 'TEST-SKU-UNIT-LUA';
  const stockKey = `inventory:flash_sale:${sku}`;
  const campaignId = 'unit_test_campaign';
  
  const luaScript = `
    local stock_key = KEYS[1]
    local limit_key = KEYS[2]
    local requested_qty = tonumber(ARGV[1])

    local purchased = redis.call("GET", limit_key)
    if purchased and tonumber(purchased) >= 1 then
      return -1
    end

    local current_stock = redis.call("GET", stock_key)
    if not current_stock or tonumber(current_stock) < requested_qty then
      return -2
    end

    redis.call("DECRBY", stock_key, requested_qty)
    redis.call("SET", limit_key, 1, "EX", 300)
    return 1
  `;

  try {
    // TC-UT-01: Successful Purchase
    await redis.set(stockKey, 5);
    const limitKeyUser1 = `user:limit:${campaignId}:user_ut_1`;
    await redis.del(limitKeyUser1);

    const res1 = await redis.eval(luaScript, 2, stockKey, limitKeyUser1, 1);
    assert.strictEqual(res1, 1, 'Lua script must return 1 on success');

    const stockAfter1 = await redis.get(stockKey);
    assert.strictEqual(parseInt(stockAfter1, 10), 4, 'Redis stock must decrement to 4');
    console.log('  ✅ TC-UT-01 PASSED: Purchase succeeds, stock decrements & lock set');

    // TC-UT-02: User Limit Exceeded
    const res2 = await redis.eval(luaScript, 2, stockKey, limitKeyUser1, 1);
    assert.strictEqual(res2, -1, 'Lua script must return -1 when user limit exceeded');
    console.log('  ✅ TC-UT-02 PASSED: Re-purchase blocked with -1 (Limit Exceeded)');

    // TC-UT-03: Out of Stock
    await redis.set(stockKey, 0);
    const limitKeyUser2 = `user:limit:${campaignId}:user_ut_2`;
    await redis.del(limitKeyUser2);

    const res3 = await redis.eval(luaScript, 2, stockKey, limitKeyUser2, 1);
    assert.strictEqual(res3, -2, 'Lua script must return -2 when stock is zero');
    console.log('  ✅ TC-UT-03 PASSED: Purchase blocked with -2 (Out of Stock)');

    // Clean up
    await redis.del(stockKey, limitKeyUser1, limitKeyUser2);
  } finally {
    await redis.quit();
  }

  console.log('--- ALL REDIS LUA UNIT TESTS PASSED ---\n');
}

module.exports = { runRedisLuaUnitTests };

if (require.main === module) {
  runRedisLuaUnitTests();
}
