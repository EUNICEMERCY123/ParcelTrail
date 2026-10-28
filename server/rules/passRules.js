// Pickup pass issuance and verification rules (Module 6 Node.js CommonJS)
const { makeEvent } = require('./parcelRules');

function issuePass(parcel, collectorName, minutesValid) {
  const mins = parseInt(minutesValid, 10) || 60;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const pass = {
    code: code,
    collectorName: (collectorName || 'Guest').trim(),
    minutesValid: mins,
    expiresAt: new Date(Date.now() + mins * 60000),
    isUsed: false,
    attemptsRemaining: 3
  };
  const evt = makeEvent(
    'Pickup Pass Issued',
    'Security Subsystem (In-app Pass)',
    `One-time 6-digit pass issued to ${pass.collectorName} (valid for ${mins} mins).`
  );
  return {
    ...parcel,
    pickupPass: pass,
    events: [...(parcel.events || []), evt]
  };
}

function checkPassCode(parcel, enteredCode) {
  const pass = parcel.pickupPass;
  if (!pass) return { parcel, success: false, message: 'No active pass' };
  if (pass.isUsed) return { parcel, success: false, message: 'This pass was already used' };
  const expiryTime = new Date(pass.expiresAt).getTime();
  if (Date.now() > expiryTime) return { parcel, success: false, message: 'This pass has expired' };
  if (pass.attemptsRemaining <= 0) return { parcel, success: false, message: 'Pass locked due to 3 failed attempts' };
  if (!enteredCode || enteredCode.length !== 6) return { parcel, success: false, message: 'Passcode must be exactly 6 digits' };

  if (enteredCode === pass.code) {
    const evt = makeEvent(
      'Parcel Collected',
      'Keypad Unlock (Relay + Solenoid + Servo)',
      `Collected by ${pass.collectorName}. Relay switched on, solenoid unlocked, servo opened the door (simulated).`
    );
    return {
      parcel: {
        ...parcel,
        status: 'Collected',
        isTampered: false,
        pickupPass: { ...pass, isUsed: true },
        events: [...(parcel.events || []), evt]
      },
      success: true,
      message: 'Code accepted! Mailbox unlocked.'
    };
  }

  const triesLeft = pass.attemptsRemaining - 1;
  if (triesLeft <= 0) {
    const lockEvt = makeEvent(
      'Security Lockdown',
      'Keypad Lockout',
      'Pickup pass locked after 3 failed attempts by unauthorized user (simulated).'
    );
    return {
      parcel: {
        ...parcel,
        status: 'Tamper Alert',
        isTampered: true,
        pickupPass: { ...pass, attemptsRemaining: 0 },
        events: [...(parcel.events || []), lockEvt]
      },
      success: false,
      message: 'Pass locked! 3 incorrect attempts. Tamper alert raised.'
    };
  }

  return {
    parcel: {
      ...parcel,
      pickupPass: { ...pass, attemptsRemaining: triesLeft }
    },
    success: false,
    message: `Incorrect code! ${triesLeft} attempt(s) remaining.`
  };
}

module.exports = {
  issuePass,
  checkPassCode
};
