// Automated unit tests for server utilities, query escaping, tracking validation, CORS, and test DB isolation
const assert = require('assert');
const express = require('express');
const cors = require('cors');
const { buildParcelFilter, escapeRegex } = require('../utils/parcelQuery');
const { computePassState } = require('../utils/passState');
const { collectAllEvents } = require('../utils/events');
const { buildCorsOptions } = require('../utils/corsOptions');
const { errorHandler } = require('../middleware/errorHandler');
const { withDatabaseName, resolveMongoUri, assertSafeTestUri, TEST_DB_NAME } = require('../db');
const { isValidTrackingNumber } = require('../routes/trackRoutes');

console.log('--- Running ParcelTrail Server Utility Unit Tests ---\n');

let passedCount = 0;
let totalCount = 0;

async function test(name, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`PASS ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`FAIL ${name}:`, err.message);
    process.exitCode = 1;
  }
}

async function run() {
  await test('escapeRegex neutralizes regex metacharacters', () => {
    const escaped = escapeRegex('item+(test)[1]?');
    const rx = new RegExp(escaped, 'i');
    assert.ok(rx.test('My item+(test)[1]? box'));
    assert.ok(!rx.test('My item test 1 box'));
  });

  await test('buildParcelFilter safely builds search, status, and ignores invalid dates', () => {
    const filter = buildParcelFilter({
      search: 'Phone (Cover)',
      status: 'Expected, Deposited',
      from: 'invalid-date',
      to: '2026-11-10'
    });
    assert.strictEqual(filter.$or.length, 4);
    assert.deepStrictEqual(filter.status, { $in: ['Expected', 'Deposited'] });
    assert.strictEqual(filter.createdAt.$gte, undefined);
    assert.ok(filter.createdAt.$lte instanceof Date);
  });

  await test('computePassState identifies active, used, locked, expired, and null passes', () => {
    assert.strictEqual(computePassState(null), null);
    assert.strictEqual(computePassState({ code: '123456', isUsed: true }), 'used');
    assert.strictEqual(computePassState({ code: '123456', isUsed: false, attemptsRemaining: 0 }), 'locked');
    assert.strictEqual(computePassState({ code: '123456', isUsed: false, attemptsRemaining: 3, expiresAt: new Date(Date.now() - 1000) }), 'expired');
    assert.strictEqual(computePassState({ code: '123456', isUsed: false, attemptsRemaining: 3, expiresAt: new Date(Date.now() + 60000) }), 'active');
  });

  await test('collectAllEvents filters and sorts newest first', () => {
    const parcels = [
      {
        parcelId: 'PRCL-101',
        itemDescription: 'Phone Cover',
        events: [
          { id: '1', eventType: 'Parcel Deposited', sensorType: 'Ultrasonic', description: 'A', timestamp: '2026-11-01T10:00:00Z' },
          { id: '2', eventType: 'Lid Locked', sensorType: 'Servo', description: 'B', timestamp: '2026-11-01T12:00:00Z' }
        ]
      },
      {
        parcelId: 'PRCL-102',
        itemDescription: 'Keyboard',
        events: [
          { id: '3', eventType: 'Parcel Deposited', sensorType: 'Ultrasonic', description: 'C', timestamp: '2026-11-01T11:00:00Z' }
        ]
      }
    ];

    const all = collectAllEvents(parcels);
    assert.strictEqual(all.length, 3);
    assert.strictEqual(all[0].id, '2');
    assert.strictEqual(all[1].id, '3');
    assert.strictEqual(all[2].id, '1');

    const filtered = collectAllEvents(parcels, { parcelId: 'PRCL-101', type: 'lock' });
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].id, '2');
  });

  await test('isValidTrackingNumber accepts tracking numbers and parcel IDs', () => {
    assert.strictEqual(isValidTrackingNumber('TRK-54129-IN'), true);
    assert.strictEqual(isValidTrackingNumber('PRCL-101'), true);
    assert.strictEqual(isValidTrackingNumber('123'), false);
    assert.strictEqual(isValidTrackingNumber('TRK BAD#'), false);
  });

  await test('withDatabaseName rewrites Atlas and local URIs to parceltrail_test', () => {
    const atlas = 'mongodb+srv://user:pass@cluster.mongodb.net/parcelTrail?retryWrites=true&w=majority';
    const rewritten = withDatabaseName(atlas, TEST_DB_NAME);
    assert.ok(rewritten.includes('/parceltrail_test?retryWrites=true&w=majority'));

    const local = withDatabaseName('mongodb://127.0.0.1:27017/parcelTrail', TEST_DB_NAME);
    assert.strictEqual(local, 'mongodb://127.0.0.1:27017/parceltrail_test');
  });

  await test('resolveMongoUri isolates test runs and blocks production MONGODB_TEST_URI', () => {
    const prevEnv = process.env.NODE_ENV;
    const prevUri = process.env.MONGODB_URI;
    const prevTestUri = process.env.MONGODB_TEST_URI;
    try {
      process.env.NODE_ENV = 'test';
      delete process.env.MONGODB_TEST_URI;
      process.env.MONGODB_URI = 'mongodb+srv://u:p@cluster.mongodb.net/parcelTrail?w=majority';
      const resolved = resolveMongoUri();
      assert.ok(resolved.includes('/parceltrail_test?w=majority'));

      process.env.MONGODB_TEST_URI = 'mongodb+srv://u:p@cluster.mongodb.net/parcelTrail?w=majority';
      assert.throws(() => resolveMongoUri(), /Unsafe MONGODB_TEST_URI/);

      process.env.MONGODB_TEST_URI = 'mongodb://127.0.0.1:27017/';
      assert.throws(() => resolveMongoUri(), /Unsafe MONGODB_TEST_URI/);

      process.env.MONGODB_URI = 'mongodb+srv://u:p@cluster.mongodb.net/customProdDb';
      process.env.MONGODB_TEST_URI = 'mongodb+srv://u:p@cluster.mongodb.net/customProdDb?w=majority';
      assert.throws(() => resolveMongoUri(), /Unsafe MONGODB_TEST_URI/);

      assert.strictEqual(
        assertSafeTestUri('mongodb://127.0.0.1:27017/parceltrail_test', 'mongodb://127.0.0.1:27017/parcelTrail'),
        'mongodb://127.0.0.1:27017/parceltrail_test'
      );
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevUri === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = prevUri;
      if (prevTestUri === undefined) delete process.env.MONGODB_TEST_URI; else process.env.MONGODB_TEST_URI = prevTestUri;
    }
  });

  await test('buildCorsOptions enforces allowlist by default and allows wildcard only explicitly', () => {
    const defaultOpts = buildCorsOptions(undefined);
    assert.strictEqual(typeof defaultOpts.origin, 'function');

    defaultOpts.origin('https://parcel-trail.vercel.app', (err, ok) => {
      assert.strictEqual(err, null);
      assert.strictEqual(ok, true);
    });

    defaultOpts.origin(undefined, (err, ok) => {
      assert.strictEqual(err, null);
      assert.strictEqual(ok, true);
    });

    defaultOpts.origin('https://untrusted.example', (err) => {
      assert.ok(err instanceof Error);
      assert.strictEqual(err.status, 403);
      assert.strictEqual(err.statusCode, 403);
    });

    const customOpts = buildCorsOptions('https://staging.example/');
    customOpts.origin('https://staging.example', (err, ok) => {
      assert.strictEqual(err, null);
      assert.strictEqual(ok, true);
    });

    const wildcardOpts = buildCorsOptions('*');
    assert.strictEqual(wildcardOpts.origin, true);
  });

  await test('Express CORS + errorHandler returns HTTP 403 for blocked origins and 200 for allowed origins', async () => {
    const app = express();
    app.use(cors(buildCorsOptions(undefined)));
    app.get('/api/ping', (req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    const server = await new Promise((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });

    try {
      const port = server.address().port;
      const blockedRes = await fetch(`http://127.0.0.1:${port}/api/ping`, {
        headers: { Origin: 'https://blocked.example' }
      });
      assert.strictEqual(blockedRes.status, 403);
      const blockedBody = await blockedRes.json();
      assert.strictEqual(blockedBody.success, false);
      assert.match(blockedBody.message, /CORS blocked/);

      const allowedRes = await fetch(`http://127.0.0.1:${port}/api/ping`, {
        headers: { Origin: 'https://parcel-trail.vercel.app' }
      });
      assert.strictEqual(allowedRes.status, 200);
      assert.strictEqual(allowedRes.headers.get('access-control-allow-origin'), 'https://parcel-trail.vercel.app');
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  console.log(`\nUtility Unit Test Summary: ${passedCount} of ${totalCount} test cases PASSED.`);
  if (passedCount !== totalCount) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
