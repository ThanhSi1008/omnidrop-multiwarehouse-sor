const { runSorUnitTests } = require('./unit/sor-mapping.spec');
const { runRedisLuaUnitTests } = require('./unit/redis-lua.spec');
const { runServicesEndpointsTests } = require('./unit/services-endpoints.spec');
const { runBoundaryExceptionTests } = require('./boundary/exceptions.spec');
const { runGrpcIntegrationTest } = require('./integration/grpc-contract.spec');
const { execSync } = require('child_process');

async function runMasterTestSuite() {
  console.log('================================================================');
  console.log('🧪 OMNIDROP MASTER AUTOMATED TEST SUITE RUNNER');
  console.log('================================================================\n');

  let passedSuites = 0;
  let totalSuites = 6;

  try {
    // 1. Unit Tests: SOR Mapping
    runSorUnitTests();
    passedSuites++;

    // 2. Unit Tests: Redis Lua Engine
    await runRedisLuaUnitTests();
    passedSuites++;

    // 3. Service API Endpoint Tests
    await runServicesEndpointsTests();
    passedSuites++;

    // 4. Integration Tests: gRPC Contract
    await runGrpcIntegrationTest();
    passedSuites++;

    // 5. Boundary & Exception Tests
    await runBoundaryExceptionTests();
    passedSuites++;

    // 6. E2E Flow & Anti-Overselling Concurrency Tests
    console.log('--- RUNNING E2E FLOW & CONCURRENCY INTEGRITY TESTS ---');
    execSync('npm run test:load', { stdio: 'inherit' });
    execSync('sleep 2 && npm run test:integrity', { stdio: 'inherit' });
    console.log('--- ALL E2E & CONCURRENCY TESTS PASSED ---\n');
    passedSuites++;

    console.log('================================================================');
    console.log(`🎉 MASTER TEST SUITE COMPLETED: ${passedSuites}/${totalSuites} Test Suites PASSED 100%!`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ MASTER TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runMasterTestSuite();
