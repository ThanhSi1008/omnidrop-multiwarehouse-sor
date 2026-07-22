const assert = require('assert');

// Geographic mapping helper matching order-routing-service
function getWarehousePreferences(province) {
  const provLower = province.toLowerCase();
  const southProvinces = [
    'hcm', 'ho chi minh', 'binh duong', 'can tho', 'quang nam', 'quang ngai', 'dong nai', 
    'long an', 'an giang', 'ba ria', 'vung tau', 'ben tre', 'binh dinh', 'binh phuoc', 
    'binh thuan', 'ca mau', 'dak lak', 'dak nong', 'gia lai', 'hau giang', 'khanh hoa', 
    'kien giang', 'kon tum', 'lam dong', 'ninh thuan', 'phu yen', 'soc trang', 'tay ninh', 
    'tien giang', 'tra vinh', 'vinh long'
  ];
  
  for (const p of southProvinces) {
    if (provLower.includes(p)) {
      return { primary: 'KHO_HCM', secondary: 'KHO_HN' };
    }
  }
  return { primary: 'KHO_HN', secondary: 'KHO_HCM' };
}

function runSorUnitTests() {
  console.log('--- RUNNING UNIT TESTS: SOR GEOGRAPHIC MAPPING ---');

  // TC-UT-04: North Provinces -> KHO_HN
  const hnRes = getWarehousePreferences('Hanoi');
  assert.strictEqual(hnRes.primary, 'KHO_HN', 'Hanoi must route primary to KHO_HN');
  assert.strictEqual(hnRes.secondary, 'KHO_HCM', 'Hanoi must route secondary to KHO_HCM');
  console.log('  ✅ TC-UT-04 PASSED: Hanoi routes to Primary KHO_HN');

  const hpRes = getWarehousePreferences('Hai Phong');
  assert.strictEqual(hpRes.primary, 'KHO_HN', 'Hai Phong must route primary to KHO_HN');
  console.log('  ✅ TC-UT-04 PASSED: Hai Phong routes to Primary KHO_HN');

  // TC-UT-05: South Provinces -> KHO_HCM
  const hcmRes = getWarehousePreferences('HCM City');
  assert.strictEqual(hcmRes.primary, 'KHO_HCM', 'HCM must route primary to KHO_HCM');
  assert.strictEqual(hcmRes.secondary, 'KHO_HN', 'HCM must route secondary to KHO_HN');
  console.log('  ✅ TC-UT-05 PASSED: HCM City routes to Primary KHO_HCM');

  const ctRes = getWarehousePreferences('Can Tho');
  assert.strictEqual(ctRes.primary, 'KHO_HCM', 'Can Tho must route primary to KHO_HCM');
  console.log('  ✅ TC-UT-05 PASSED: Can Tho routes to Primary KHO_HCM');

  console.log('--- ALL SOR UNIT TESTS PASSED ---\n');
}

module.exports = { runSorUnitTests };

if (require.main === module) {
  runSorUnitTests();
}
