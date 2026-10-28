// Core parcel transition and simulation rules (Module 6 Node.js CommonJS)

function makeEvent(eventType, sensorType, description) {
  return {
    id: 'EVT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date(),
    eventType,
    sensorType,
    description,
    isSimulated: true
  };
}

function dropParcel(parcel) {
  if (parcel.status !== 'Expected') return parcel;
  const evt = makeEvent('Parcel Deposited', 'Ultrasonic Sensor (statusparcel/topic)', "Published 'Parcel Detected!' to statusparcel/topic (simulated). Ultrasonic sensor detected package.");
  return { ...parcel, status: 'Deposited', events: [...(parcel.events || []), evt] };
}

function lockParcel(parcel) {
  if (parcel.status !== 'Deposited') return parcel;
  const evt = makeEvent('Lid Locked', 'Servo + Relay + Solenoid (command/topic)', "Sent 'LOCK' to command/topic (simulated). Relay switched 12V solenoid lock, servo closed door.");
  return { ...parcel, status: 'Locked', events: [...(parcel.events || []), evt] };
}

function takeSnapshot(parcel) {
  const evt = makeEvent('Camera Snapshot Taken', 'ESP32-CAM (/photo)', 'Telegram command /photo sent to ESP32-CAM (simulated). Optical frame captured.');
  return { ...parcel, photoUrl: '/assets/camera-placeholder.svg', events: [...(parcel.events || []), evt] };
}

function toggleFlash(parcel, currentFlashOn) {
  const nextFlash = !currentFlashOn;
  const text = nextFlash ? 'Flash turned ON' : 'Flash turned OFF';
  const evt = makeEvent('Flash Toggled', 'ESP32-CAM (/flash)', `Telegram command /flash sent: ${text} (simulated).`);
  return { parcel: { ...parcel, events: [...(parcel.events || []), evt] }, flashOn: nextFlash };
}

function knockTamper(parcel) {
  const evt = makeEvent('Tamper Alert Triggered', 'Accelerometer (Extra feature, simulated)', 'Sudden vibration detected. Extra feature (simulated, from research paper).');
  return { ...parcel, status: 'Tamper Alert', isTampered: true, events: [...(parcel.events || []), evt] };
}

function addReport(parcel, issueType, description) {
  const report = {
    id: 'REP-' + Date.now(),
    type: issueType,
    issueType,
    description: (description || '').trim(),
    createdAt: new Date()
  };
  const evt = makeEvent('Security Concern Reported', 'Resident Portal', `Report filed: [${issueType}] "${(description || '').trim()}"`);
  return {
    ...parcel,
    reports: [...(parcel.reports || []), report],
    events: [...(parcel.events || []), evt]
  };
}

function redirectParcel(parcel, pickupPoint) {
  const locName = pickupPoint.name || pickupPoint;
  const locAddr = pickupPoint.address ? ` (${pickupPoint.address})` : '';
  const evt = makeEvent('Parcel Redirected', 'Resident Dispatch', `Delivery custody transferred to: ${locName}${locAddr}.`);
  return {
    ...parcel,
    status: 'Redirected',
    currentLocation: locName,
    events: [...(parcel.events || []), evt]
  };
}

module.exports = {
  makeEvent,
  dropParcel,
  lockParcel,
  takeSnapshot,
  toggleFlash,
  knockTamper,
  addReport,
  redirectParcel
};
