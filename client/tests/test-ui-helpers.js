// Unit tests for UI label mappings and Google Maps URL generator (Module 4 React UI)
import assert from 'node:assert';
import { STATUS_META, getParcelStatusInfo, getStepProgress, hasActivePass } from '../src/utils/labels.js';
import { MAILBOX_LOCATION, getMapUrl, getLocationCoordinates } from '../src/utils/locations.js';
import { formatCsvValue, buildCsvText } from '../src/utils/csv.js';
import { timeAgo } from '../src/utils/timeAgo.js';

console.log('--- Running UI Helpers Unit Tests ---');

// 1. Verify every status has a label, sentence, button text, and step
const statuses = ['Expected', 'Deposited', 'Locked', 'Tamper Alert', 'Collected', 'Redirected'];
for (const st of statuses) {
  const meta = STATUS_META[st];
  assert.ok(meta, `STATUS_META must contain '${st}'`);
  assert.ok(meta.label && typeof meta.label === 'string', `${st} must have label`);
  assert.ok(meta.sentence && typeof meta.sentence === 'string', `${st} must have sentence`);
  assert.ok(meta.button && typeof meta.button === 'string', `${st} must have button text`);
  assert.ok(meta.step && typeof meta.step === 'string', `${st} must have step`);
  assert.ok(typeof meta.percent === 'number', `${st} must have percent`);
  console.log(`PASS status meta check for: ${st}`);
}

// 2. Test getParcelStatusInfo with object and active pass
const normalLocked = getParcelStatusInfo({ status: 'Locked' });
assert.strictEqual(normalLocked.button, 'Let someone collect it');

const activePassLocked = getParcelStatusInfo({
  status: 'Locked',
  pickupPass: { code: '482913', isUsed: false, attemptsRemaining: 3, expiresAt: new Date(Date.now() + 60000).toISOString() }
});
assert.strictEqual(activePassLocked.button, 'Show pickup code');
console.log('PASS getParcelStatusInfo button variation with active pass');

// 3. Test getStepProgress
const prog1 = getStepProgress('Expected');
assert.strictEqual(prog1.step, 'Step 1 of 4');
assert.strictEqual(prog1.percent, 25);
console.log('PASS getStepProgress for Expected');

// 4. Test Google Maps URL builder for Map mode
const mapUrl = getMapUrl(10.9360, 76.7440, 'm');
assert.strictEqual(mapUrl, 'https://www.google.com/maps?q=10.936,76.744&z=17&output=embed&t=m');
console.log('PASS getMapUrl road map mode');

// 5. Test Google Maps URL builder for Satellite mode
const satUrl = getMapUrl(10.9360, 76.7440, 'k');
assert.strictEqual(satUrl, 'https://www.google.com/maps?q=10.936,76.744&z=17&output=embed&t=k');
console.log('PASS getMapUrl satellite mode');

// 6. Test getLocationCoordinates
const pts = [{ name: 'Gatehouse', lat: 10.9400, lon: 76.7400 }];
const found = getLocationCoordinates('Gatehouse', pts);
assert.strictEqual(found.lat, 10.9400);
const def = getLocationCoordinates('Unknown', pts);
assert.strictEqual(def.name, 'Your mailbox');
console.log('PASS getLocationCoordinates with matching spot and fallback');

// 7. Test CSV generation
assert.strictEqual(formatCsvValue('Simple'), 'Simple');
assert.strictEqual(formatCsvValue('Hello, world'), '"Hello, world"');
assert.strictEqual(formatCsvValue('Quote "test"'), '"Quote ""test"""');
const csvSample = buildCsvText(
  [{ label: 'Item', key: 'item' }, { label: 'Sender', key: 'sender' }],
  [{ item: 'Phone Case', sender: 'TechStore' }, { item: 'Gift, Book', sender: 'BookStore' }]
);
assert.ok(csvSample.includes('Item,Sender'));
assert.ok(csvSample.includes('Phone Case,TechStore'));
assert.ok(csvSample.includes('"Gift, Book",BookStore'));
console.log('PASS buildCsvText and formatCsvValue');

// 8. Test timeAgo helper
const nowMs = Date.now();
assert.strictEqual(timeAgo(new Date(nowMs - 10000)), 'Just now');
assert.strictEqual(timeAgo(new Date(nowMs - 5 * 60 * 1000)), '5 min ago');
assert.strictEqual(timeAgo(new Date(nowMs - 2 * 3600 * 1000)), '2 h ago');
assert.strictEqual(timeAgo(new Date(nowMs - 3 * 86400 * 1000)), '3 days ago');
console.log('PASS timeAgo relative time calculations');

console.log('UI Helpers Unit Tests: ALL PASSED.\n');
