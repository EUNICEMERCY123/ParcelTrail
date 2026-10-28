// Automated integration tests for ParcelTrail Express API (Module 5 & 6)
const assert = require('assert');
const app = require('../server');

async function runApiTests() {
  console.log('--- Running ParcelTrail API Integration Tests ---');
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  let passed = 0;
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
    // 1. Health check
    await test('GET /health returns 200 and ok status', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'ok');
    });

    // 2. Reset parcels to known seed
    await test('POST /parcels/reset seeds initial parcels', async () => {
      const res = await fetch(`${baseUrl}/parcels/reset`, { method: 'POST' });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });

    // 3. List parcels
    let parcelId = '';
    await test('GET /parcels returns parcel array', async () => {
      const res = await fetch(`${baseUrl}/parcels`);
      assert.strictEqual(res.status, 200);
      const list = await res.json();
      assert.ok(Array.isArray(list));
      assert.ok(list.length >= 3);
      parcelId = list[0].parcelId;
    });

    // 4. Projection check: GET /parcels summary uses $slice on events and excludes passes and reports
    await test('GET /parcels projection limits events to $slice 1 and excludes passes and reports', async () => {
      const res = await fetch(`${baseUrl}/parcels`);
      const list = await res.json();
      assert.ok(list.length > 0);
      assert.ok(!list[0].events || list[0].events.length <= 1, 'events must have at most 1 item via $slice');
      assert.strictEqual(list[0].pickupPass, undefined, 'pickupPass must be excluded by projection');
      assert.strictEqual(list[0].reports, undefined, 'reports must be excluded by projection');
      assert.ok(list[0].itemDescription, 'itemDescription must be present');
    });

    // 5. Status filter using $in operator
    await test('GET /parcels?status=Expected,Deposited filters using $in', async () => {
      const res = await fetch(`${baseUrl}/parcels?status=Expected,Deposited`);
      assert.strictEqual(res.status, 200);
      const list = await res.json();
      assert.ok(list.length > 0);
      assert.ok(list.every((p) => ['Expected', 'Deposited'].includes(p.status)));
    });

    // 6. Create new parcel
    let createdId = '';
    await test('POST /parcels creates a new expected parcel', async () => {
      const res = await fetch(`${baseUrl}/parcels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemDescription: 'Wireless Mouse', sender: 'LogiStore' })
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.itemDescription, 'Wireless Mouse');
      assert.strictEqual(data.status, 'Expected');
      createdId = data.parcelId;
    });

    // 7. Search parcels using $regex
    await test('GET /parcels?search=Mouse finds parcel via $regex', async () => {
      const res = await fetch(`${baseUrl}/parcels?search=Mouse`);
      assert.strictEqual(res.status, 200);
      const results = await res.json();
      assert.ok(results.some((p) => p.itemDescription.includes('Wireless Mouse')));
    });

    // 8. Simulate drop (updateOne with $set and $push)
    await test('POST /parcels/:id/simulate triggers drop via updateOne', async () => {
      const res = await fetch(`${baseUrl}/parcels/${createdId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'drop' })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'Deposited');
    });

    // 9. Simulate lock (updateOne with $set and $push)
    await test('POST /parcels/:id/simulate triggers lock via updateOne', async () => {
      const res = await fetch(`${baseUrl}/parcels/${createdId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'lock' })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'Locked');
    });

    // 10. Issue pickup pass (updateOne with $set and $push)
    let passCode = '';
    await test('POST /parcels/:id/pass/issue creates pass via updateOne', async () => {
      const res = await fetch(`${baseUrl}/parcels/${createdId}/pass/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectorName: 'Priya', expiryMinutes: 60 })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.pickupPass);
      assert.strictEqual(data.pickupPass.collectorName, 'Priya');
      passCode = data.pickupPass.code;
    });

    // 11. Active passes endpoint using $gt operators
    await test('GET /passes/active counts active passes with $gt', async () => {
      const res = await fetch(`${baseUrl}/passes/active`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(typeof data.activePasses === 'number');
      assert.ok(data.activePasses >= 1);
    });

    // 12. Verify wrong pass code (updateOne with $inc attemptsRemaining)
    await test('POST /parcels/:id/pass/verify decrements attempts with $inc', async () => {
      const res = await fetch(`${baseUrl}/parcels/${createdId}/pass/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputCode: '000000' })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.parcel.pickupPass.attemptsRemaining, 2);
    });

    // 13. Verify correct pass code (updateOne with $set and $push)
    await test('POST /parcels/:id/pass/verify marks Collected on correct code', async () => {
      const res = await fetch(`${baseUrl}/parcels/${createdId}/pass/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputCode: passCode })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.parcel.status, 'Collected');
    });

    // 14. Notifications endpoint (Projection with array sort)
    await test('GET /notifications returns last 5 events newest first', async () => {
      const res = await fetch(`${baseUrl}/notifications`);
      assert.strictEqual(res.status, 200);
      const events = await res.json();
      assert.ok(Array.isArray(events));
      assert.ok(events.length <= 5);
      assert.ok(events.length > 0);
      assert.ok(events[0].eventType);
    });

    // 15. Delete collected parcel (deleteOne)
    await test('DELETE /parcels/:id deletes collected parcel via deleteOne', async () => {
      const res = await fetch(`${baseUrl}/parcels/${createdId}`, { method: 'DELETE' });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });

    // 16. Pickup points and Mailbox flash toggle
    await test('GET /pickup-points & /mailbox/flash work properly', async () => {
      const ptsRes = await fetch(`${baseUrl}/pickup-points`);
      assert.strictEqual(ptsRes.status, 200);
      const toggleRes = await fetch(`${baseUrl}/mailbox/flash/toggle`, { method: 'POST' });
      assert.strictEqual(toggleRes.status, 200);
    });

    console.log(`\nAPI Test Summary: ${passed} of 16 integration tests PASSED.`);
  } finally {
    server.close();
    process.exit(process.exitCode ? 1 : 0);
  }
}

if (require.main === module) {
  runApiTests();
}
