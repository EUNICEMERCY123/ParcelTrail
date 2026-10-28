// Node.js Core Basics Demonstration Script (Module 6 Syllabus)
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. CommonJS custom module loaded with require (Module 6)
const { makeEvent } = require('../rules/parcelRules');
const sampleEvent = makeEvent('System Boot', 'Demo Subsystem', 'CommonJS require loaded successfully');

console.log('=== Node.js Core Basics Demo ===');
console.log('1. Module loaded with require:', sampleEvent.sensorType);

// 2. Event loop execution order: Synchronous log -> Promise.then (Microtask) -> setTimeout (Macrotask)
console.log('2. Event loop synchronous start');

setTimeout(() => {
  console.log('5. Event loop macrotask: setTimeout callback executed');
}, 0);

Promise.resolve().then(() => {
  console.log('4. Event loop microtask: Promise.then executed before next macrotask');
});

console.log('3. Event loop synchronous end');

// 3. Callback-based File I/O vs Promise async/await with try/catch
const testFile = path.join(__dirname, '..', 'data', 'parcelData.json');

// Asynchronous callback pattern
fs.readFile(testFile, 'utf8', (err, data) => {
  if (err) return console.error('Callback read error:', err.message);
  console.log('6. Callback fs.readFile finished (file bytes):', data.length);
});

// Async/await promise pattern with try/catch
async function readFileAsync() {
  try {
    const raw = await fs.promises.readFile(testFile, 'utf8');
    const parsed = JSON.parse(raw);
    console.log('7. Async/await fs.promises.readFile with try/catch parsed parcels:', parsed.parcels.length);
  } catch (err) {
    console.error('Async/await try/catch error handler:', err.message);
  }
}
readFileAsync();

// 4. Tiny native HTTP server on port 5050 that closes itself cleanly
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', message: 'Hello from native Node http server on port 5050' }));
});

server.listen(5050, () => {
  console.log('8. Native HTTP server listening on http://localhost:5050 (auto-closing in 2s)');
});

setTimeout(() => {
  server.close(() => {
    console.log('9. Native HTTP server closed cleanly. Demo finished.');
  });
}, 2000);
