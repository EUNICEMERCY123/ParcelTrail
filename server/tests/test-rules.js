// Automated unit tests for parcel & pass rules (Module 6 Node.js CommonJS)
const assert = require('assert');
const {
  makeEvent,
  dropParcel,
  lockParcel,
  takeSnapshot,
  toggleFlash,
  knockTamper,
  addReport,
  redirectParcel
} = require('../rules/parcelRules');
const {
  issuePass,
  checkPassCode
} = require('../rules/passRules');

console.log('--- Running ParcelTrail Backend Unit Tests (CommonJS) ---\n');

function createSampleParcel(overrides = {}) {
  return {
    id: 'PRCL-TEST',
    parcelId: 'PRCL-TEST',
    trackingNumber: 'TRK-TEST-01',
    itemDescription: 'Test Item',
    sender: 'Test Shop',
    status: 'Expected',
    isTampered: false,
    photoUrl: '/assets/camera-placeholder.svg',
    events: [],
    pickupPass: null,
    reports: [],
    ...overrides
  };
}

let passedCount = 0;
function runTestCase(id, name, testFn) {
  try {
    testFn();
    console.log(`PASS ${id} ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`FAIL ${id} ${name}:`, err.message);
    process.exitCode = 1;
  }
}

// TC-01: Drop parcel
runTestCase('TC-01', 'Drop parcel: Expected -> Deposited', () => {
  const p = createSampleParcel({ status: 'Expected' });
  const updated = dropParcel(p);
  assert.strictEqual(updated.status, 'Deposited');
  assert.strictEqual(updated.events.length, 1);
  assert.strictEqual(updated.events[0].eventType, 'Parcel Deposited');
  assert.strictEqual(updated.events[0].isSimulated, true);
});

// TC-02: Drop parcel ignores if not Expected
runTestCase('TC-02', 'Drop parcel: ignored when already Deposited', () => {
  const p = createSampleParcel({ status: 'Deposited' });
  const updated = dropParcel(p);
  assert.strictEqual(updated.status, 'Deposited');
  assert.strictEqual(updated.events.length, 0);
});

// TC-03: Lock parcel
runTestCase('TC-03', 'Lock parcel: Deposited -> Locked', () => {
  const p = createSampleParcel({ status: 'Deposited' });
  const updated = lockParcel(p);
  assert.strictEqual(updated.status, 'Locked');
  assert.strictEqual(updated.events.length, 1);
  assert.strictEqual(updated.events[0].eventType, 'Lid Locked');
});

// TC-04: Lock parcel ignored when Expected
runTestCase('TC-04', 'Lock parcel: ignored when Expected', () => {
  const p = createSampleParcel({ status: 'Expected' });
  const updated = lockParcel(p);
  assert.strictEqual(updated.status, 'Expected');
  assert.strictEqual(updated.events.length, 0);
});

// TC-05: Take snapshot
runTestCase('TC-05', 'Take snapshot: ESP32-CAM /photo logged', () => {
  const p = createSampleParcel({ status: 'Deposited' });
  const updated = takeSnapshot(p);
  assert.strictEqual(updated.events.length, 1);
  assert.strictEqual(updated.events[0].eventType, 'Camera Snapshot Taken');
  assert.ok(updated.photoUrl.includes('camera-placeholder'));
});

// TC-06: Toggle flash OFF -> ON
runTestCase('TC-06', 'Toggle flash: turns flash ON (/flash)', () => {
  const p = createSampleParcel({ status: 'Locked' });
  const res = toggleFlash(p, false);
  assert.strictEqual(res.flashOn, true);
  assert.strictEqual(res.parcel.events.length, 1);
  assert.ok(res.parcel.events[0].description.includes('Flash turned ON'));
});

// TC-07: Toggle flash ON -> OFF
runTestCase('TC-07', 'Toggle flash: turns flash OFF (/flash)', () => {
  const p = createSampleParcel({ status: 'Locked' });
  const res = toggleFlash(p, true);
  assert.strictEqual(res.flashOn, false);
  assert.ok(res.parcel.events[0].description.includes('Flash turned OFF'));
});

// TC-08: Tamper knock
runTestCase('TC-08', 'Tamper knock: Accelerometer sets Tamper Alert', () => {
  const p = createSampleParcel({ status: 'Locked' });
  const updated = knockTamper(p);
  assert.strictEqual(updated.status, 'Tamper Alert');
  assert.strictEqual(updated.isTampered, true);
  assert.ok(updated.events[0].sensorType.includes('Accelerometer'));
});

// TC-09: Issue pass
runTestCase('TC-09', 'Issue pass: generates 6-digit code and 3 attempts', () => {
  const p = createSampleParcel({ status: 'Deposited' });
  const updated = issuePass(p, 'Meera', 30);
  assert.ok(updated.pickupPass);
  assert.strictEqual(updated.pickupPass.collectorName, 'Meera');
  assert.strictEqual(updated.pickupPass.code.length, 6);
  assert.strictEqual(updated.pickupPass.attemptsRemaining, 3);
  assert.strictEqual(updated.pickupPass.isUsed, false);
});

// TC-10: Check pass code - not 6 digits
runTestCase('TC-10', 'Check code: rejects if code is not 6 digits', () => {
  const p = issuePass(createSampleParcel({ status: 'Deposited' }), 'Meera', 30);
  const res = checkPassCode(p, '123');
  assert.strictEqual(res.success, false);
  assert.ok(res.message.includes('6 digits'));
});

// TC-11: Check pass code - wrong code attempt 1
runTestCase('TC-11', 'Check code: wrong code leaves 2 attempts', () => {
  const p = issuePass(createSampleParcel({ status: 'Deposited' }), 'Meera', 30);
  const res = checkPassCode(p, '000000');
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.parcel.pickupPass.attemptsRemaining, 2);
  assert.ok(res.message.includes('2 attempt(s) remaining'));
});

// TC-12: Check pass code - wrong code attempt 2
runTestCase('TC-12', 'Check code: wrong code leaves 1 attempt', () => {
  const p = issuePass(createSampleParcel({ status: 'Deposited' }), 'Meera', 30);
  const step1 = checkPassCode(p, '000000');
  const step2 = checkPassCode(step1.parcel, '111111');
  assert.strictEqual(step2.parcel.pickupPass.attemptsRemaining, 1);
});

// TC-13: Check pass code - 3-try lockout
runTestCase('TC-13', 'Check code: 3 failed tries locks pass and triggers Tamper Alert', () => {
  let p = issuePass(createSampleParcel({ status: 'Deposited' }), 'Meera', 30);
  p = checkPassCode(p, '000000').parcel;
  p = checkPassCode(p, '111111').parcel;
  const res = checkPassCode(p, '222222');
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.parcel.pickupPass.attemptsRemaining, 0);
  assert.strictEqual(res.parcel.status, 'Tamper Alert');
  assert.strictEqual(res.parcel.isTampered, true);
  assert.ok(res.message.includes('Pass locked'));
});

// TC-14: Check pass code - expired pass
runTestCase('TC-14', 'Check code: rejects expired pass', () => {
  let p = issuePass(createSampleParcel({ status: 'Deposited' }), 'Meera', 30);
  p.pickupPass.expiresAt = new Date(Date.now() - 1000);
  const res = checkPassCode(p, p.pickupPass.code);
  assert.strictEqual(res.success, false);
  assert.ok(res.message.includes('expired'));
});

// TC-15: Check pass code - correct code
runTestCase('TC-15', 'Check code: correct code marks parcel Collected and pass used', () => {
  const p = issuePass(createSampleParcel({ status: 'Deposited' }), 'Meera', 30);
  const validCode = p.pickupPass.code;
  const res = checkPassCode(p, validCode);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.parcel.status, 'Collected');
  assert.strictEqual(res.parcel.pickupPass.isUsed, true);
  assert.ok(res.message.includes('Code accepted'));
});

// TC-16: Check pass code - already used pass
runTestCase('TC-16', 'Check code: rejects already used pass', () => {
  const p = issuePass(createSampleParcel({ status: 'Deposited' }), 'Meera', 30);
  p.pickupPass.isUsed = true;
  const res = checkPassCode(p, p.pickupPass.code);
  assert.strictEqual(res.success, false);
  assert.ok(res.message.includes('already used'));
});

// TC-17: Add security report
runTestCase('TC-17', 'Add report: logs incident and adds to custody history', () => {
  const p = createSampleParcel({ status: 'Deposited' });
  const updated = addReport(p, 'Damaged Packaging', 'Box arrived torn and dented on corner.');
  assert.strictEqual(updated.reports.length, 1);
  assert.strictEqual(updated.reports[0].issueType, 'Damaged Packaging');
  assert.strictEqual(updated.events[updated.events.length - 1].eventType, 'Security Concern Reported');
});

// TC-18: Redirect parcel
runTestCase('TC-18', 'Redirect parcel: transfers custody to pickup point', () => {
  const p = createSampleParcel({ status: 'Deposited' });
  const point = { name: 'Gatehouse', address: 'Main Gate Security' };
  const updated = redirectParcel(p, point);
  assert.strictEqual(updated.status, 'Redirected');
  assert.ok(updated.events[updated.events.length - 1].description.includes('Gatehouse'));
});

// TC-19: makeEvent produces simulated event
runTestCase('TC-19', 'makeEvent: creates simulated event with timestamp', () => {
  const evt = makeEvent('Test Event', 'Test Sensor', 'Test Note');
  assert.strictEqual(evt.eventType, 'Test Event');
  assert.strictEqual(evt.sensorType, 'Test Sensor');
  assert.strictEqual(evt.isSimulated, true);
  assert.ok(evt.timestamp);
});

console.log(`\nUnit Test Summary: ${passedCount} of 19 test cases PASSED.`);
if (passedCount !== 19) process.exit(1);
