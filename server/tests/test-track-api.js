// Automated integration tests for parcel tracking endpoint (Module 5 & 6)
const assert = require('assert');
const app = require('../server');

// Runs integration tests for GET /api/track/:trackingNumber
async function runTrackApiTests() {
  console.log('--- Running Track API Integration Tests ---');
  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  let passed = 0;

  // Executes single named test case
  async function test(name, fn) {
    try {
      await fn();
      console.log(`PASS ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL ${name}:`, err.message);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Reset database to ensure seed parcels exist
    await fetch(`${baseUrl}/parcels/reset`, { method: 'POST' });

    // 2. Fetch all parcels to obtain a genuine tracking number
    const listRes = await fetch(`${baseUrl}/parcels`);
    const list = await listRes.json();
    assert.ok(list.length > 0, 'Seed list must contain parcels');
    const sample = list[0];
    const trackingNum = sample.trackingNumber;
    assert.ok(trackingNum, 'Parcel must have a tracking number');

    // 3. Valid tracking lookup returns 200 and projected fields
    await test('GET /track/:num returns parcel details with events and excludes pass/reports', async () => {
      const res = await fetch(`${baseUrl}/track/${trackingNum}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.trackingNumber, trackingNum);
      assert.strictEqual(data.itemDescription, sample.itemDescription);
      assert.ok(data.status);
      assert.ok(Array.isArray(data.events));
      assert.strictEqual(data.pickupPass, undefined, 'pickupPass must never be returned');
      assert.strictEqual(data.reports, undefined, 'reports must never be returned');
    });

    // 4. Case-insensitive lookup
    await test('GET /track/:num matches case-insensitively', async () => {
      const lower = trackingNum.toLowerCase();
      const res = await fetch(`${baseUrl}/track/${lower}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.trackingNumber, trackingNum);
    });

    // 5. Bad format returns 400
    await test('GET /track/:num returns 400 for invalid formats', async () => {
      const resShort = await fetch(`${baseUrl}/track/123`);
      assert.strictEqual(resShort.status, 400);

      const resSpecial = await fetch(`${baseUrl}/track/TRK%20BAD%23`);
      assert.strictEqual(resSpecial.status, 400);
    });

    // 6. Unknown tracking number returns 404
    await test('GET /track/:num returns 404 for non-existent parcel', async () => {
      const res = await fetch(`${baseUrl}/track/TRK-99999-NONE`);
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.ok(data.message.includes('No parcel found'));
    });

    console.log(`\nTrack API Test Summary: ${passed} test cases PASSED.`);
  } finally {
    server.close();
    process.exit(process.exitCode ? 1 : 0);
  }
}

if (require.main === module) {
  runTrackApiTests();
}

module.exports = runTrackApiTests;
