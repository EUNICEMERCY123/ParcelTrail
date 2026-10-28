// Integration tests for Records API and pass management (Module 5 & 6)
const assert = require('assert');
const app = require('../server');
const { computePassState } = require('../utils/passState');

async function runRecordsTests() {
  console.log('--- Running Records API Integration Tests ---');
  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

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
    // 1. Unit tests for computePassState
    test('computePassState handles all pass states', () => {
      assert.strictEqual(computePassState(null), null);
      assert.strictEqual(computePassState({}), null);
      assert.strictEqual(computePassState({ code: '123456', isUsed: true }), 'used');
      assert.strictEqual(computePassState({ code: '123456', isUsed: false, attemptsRemaining: 0, expiresAt: new Date(Date.now() + 60000) }), 'locked');
      assert.strictEqual(computePassState({ code: '123456', isUsed: false, attemptsRemaining: 3, expiresAt: new Date(Date.now() - 60000) }), 'expired');
      assert.strictEqual(computePassState({ code: '123456', isUsed: false, attemptsRemaining: 3, expiresAt: new Date(Date.now() + 60000) }), 'active');
    });

    // Reset database to initial seed
    await fetch(`${baseUrl}/parcels/reset`, { method: 'POST' });

    // 2. Records stats
    await test('GET /records/stats returns counts', async () => {
      const res = await fetch(`${baseUrl}/records/stats`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(typeof data.total, 'number');
      assert.ok(data.total >= 12);
      assert.ok(data.waiting >= 1);
      assert.ok(data.openIncidents >= 1);
      assert.ok(data.activePasses >= 1);
    });

    // 3. Records parcels paging, sorting & late check
    await test('GET /records/parcels supports paging, sort and isLate', async () => {
      const res = await fetch(`${baseUrl}/records/parcels?page=1&limit=4&sort=item`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.items.length, 4);
      assert.strictEqual(data.page, 1);
      assert.ok(data.pages >= 3);
      assert.strictEqual(data.total, 12);
      // Check late flag presence
      const allRes = await fetch(`${baseUrl}/records/parcels?limit=50`);
      const allData = await allRes.json();
      const lateItems = allData.items.filter((i) => i.isLate);
      assert.ok(lateItems.length >= 2, 'Should have at least 2 late parcels');
      assert.ok(allData.items.some((i) => i.passState === 'active'));
    });

    // 4. Records incidents and resolution
    let targetReport = null;
    await test('GET /records/incidents and POST resolve', async () => {
      const res = await fetch(`${baseUrl}/records/incidents`);
      assert.strictEqual(res.status, 200);
      const list = await res.json();
      assert.ok(list.length >= 2);
      targetReport = list.find((r) => r.status === 'Open');
      assert.ok(targetReport, 'Found open incident to resolve');

      // Resolve it
      const resResolve = await fetch(`${baseUrl}/records/incidents/${targetReport.parcelId}/${targetReport.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Resolved during automated test' })
      });
      assert.strictEqual(resResolve.status, 200);
      const resolveData = await resResolve.json();
      assert.strictEqual(resolveData.success, true);
      assert.strictEqual(resolveData.report.status, 'Resolved');

      // Reject resolving already resolved
      const resDup = await fetch(`${baseUrl}/records/incidents/${targetReport.parcelId}/${targetReport.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Again' })
      });
      assert.strictEqual(resDup.status, 400);
    });

    // 5. Passes list and pass cancel
    await test('GET /records/passes and POST pass cancel', async () => {
      const res = await fetch(`${baseUrl}/records/passes`);
      assert.strictEqual(res.status, 200);
      const list = await res.json();
      assert.ok(list.length >= 3);
      const active = list.find((p) => p.state === 'active');
      assert.ok(active, 'Found active pass');

      // Cancel pass
      const cancelRes = await fetch(`${baseUrl}/parcels/${active.parcelId}/pass/cancel`, { method: 'POST' });
      assert.strictEqual(cancelRes.status, 200);
      const cancelData = await cancelRes.json();
      assert.strictEqual(cancelData.success, true);

      // Cancel again fails
      const cancelFail = await fetch(`${baseUrl}/parcels/${active.parcelId}/pass/cancel`, { method: 'POST' });
      assert.strictEqual(cancelFail.status, 400);
    });

    // 6. Records activity paging
    await test('GET /records/activity returns paginated events', async () => {
      const res = await fetch(`${baseUrl}/records/activity?page=1&limit=5`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.items.length, 5);
      assert.ok(data.total >= 10);
      assert.ok(data.items[0].eventType);
    });

    // 7. Edit parcel PUT /parcels/:id
    await test('PUT /parcels/:id validates and updates parcel', async () => {
      // Invalid (short item)
      const resBad = await fetch(`${baseUrl}/parcels/PRCL-101`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemDescription: 'A', sender: 'Sender' })
      });
      assert.strictEqual(resBad.status, 400);

      // Valid update
      const resGood = await fetch(`${baseUrl}/parcels/PRCL-101`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemDescription: 'Updated Case', sender: 'Best Supplier', trackingNumber: 'TRK-UP-1' })
      });
      assert.strictEqual(resGood.status, 200);
      const updated = await resGood.json();
      assert.strictEqual(updated.itemDescription, 'Updated Case');
    });

    console.log(`\nRecords API Test Summary: ${passed} test cases PASSED.`);
  } finally {
    server.close();
    process.exit(process.exitCode ? 1 : 0);
  }
}

if (require.main === module) {
  runRecordsTests().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = runRecordsTests;
