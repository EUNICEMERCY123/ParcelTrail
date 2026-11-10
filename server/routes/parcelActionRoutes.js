// Express routes for parcel actions using updateOne, $set, $push, and $inc (Module 5 & 6)
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const PickupPoint = require('../models/PickupPoint');
const findParcelById = require('../utils/findParcel');
const { dropParcel, lockParcel, takeSnapshot, knockTamper, addReport, redirectParcel } = require('../rules/parcelRules');
const { issuePass, checkPassCode } = require('../rules/passRules');

const ALLOWED_REPORT_TYPES = [
  'Missing Parcel',
  'Damaged Packaging',
  'Tampered Lock',
  'Wrong Item',
  'Other',
  'Missing parcel',
  'Damaged',
  'Suspicious activity'
];

// POST /api/parcels/:id/simulate (Uses updateOne with $set and $push)
router.post('/:id/simulate', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

    const rawType = req.body.eventType || req.body.action;
    const eventType = rawType === 'photo' ? 'snapshot' : rawType;
    const plain = parcel.toObject();
    const prevCount = (plain.events || []).length;
    let ops = {};

    if (eventType === 'drop') {
      if (plain.status !== 'Expected') {
        return res.status(400).json({ message: `Parcel cannot be dropped while status is '${plain.status}'` });
      }
      const next = dropParcel(plain);
      ops = { $set: { status: 'Deposited' }, $push: { events: next.events[next.events.length - 1] } };
    } else if (eventType === 'lock') {
      if (plain.status !== 'Deposited') {
        return res.status(400).json({ message: `Parcel can only be locked when status is 'Deposited' (currently '${plain.status}')` });
      }
      const next = lockParcel(plain);
      ops = { $set: { status: 'Locked' }, $push: { events: next.events[next.events.length - 1] } };
    } else if (eventType === 'snapshot') {
      const next = takeSnapshot(plain);
      ops = { $set: { photoUrl: next.photoUrl }, $push: { events: next.events[next.events.length - 1] } };
    } else if (eventType === 'tamper') {
      const next = knockTamper(plain);
      if (next.events.length > prevCount) {
        ops = { $set: { status: 'Tamper Alert', isTampered: true }, $push: { events: next.events[next.events.length - 1] } };
      }
    } else {
      return res.status(400).json({ message: `Unknown simulation event: ${rawType}` });
    }

    await Parcel.updateOne({ _id: parcel._id }, ops);
    res.json(await findParcelById(req.params.id));
  } catch (err) { next(err); }
});

async function handleIssuePass(req, res, next) {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    if (parcel.status === 'Collected') {
      return res.status(400).json({ message: 'Cannot issue a pickup pass for an already collected parcel' });
    }

    const collectorName = req.body.collectorName;
    const rawMins = req.body.expiryMinutes ?? req.body.durationMinutes ?? 60;
    const mins = parseInt(rawMins, 10);
    if (isNaN(mins) || mins < 1 || mins > 1440) {
      return res.status(400).json({ message: 'expiryMinutes must be between 1 and 1440' });
    }

    const resPass = issuePass(parcel.toObject(), collectorName, mins);
    await Parcel.updateOne(
      { _id: parcel._id },
      { $set: { pickupPass: resPass.pickupPass }, $push: { events: resPass.events[resPass.events.length - 1] } }
    );
    res.json(await findParcelById(req.params.id));
  } catch (err) { next(err); }
}

// POST /api/parcels/:id/pass/issue and /api/parcels/:id/pass alias
router.post('/:id/pass/issue', handleIssuePass);
router.post('/:id/pass', handleIssuePass);

// POST /api/parcels/:id/pass/verify (Uses updateOne with $set, $push, and $inc)
router.post('/:id/pass/verify', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

    const plain = parcel.toObject();
    const submittedCode = req.body.inputCode ?? req.body.code;
    const result = checkPassCode(plain, submittedCode);

    const prevAttempts = plain.pickupPass ? plain.pickupPass.attemptsRemaining : 0;
    const nextAttempts = result.parcel && result.parcel.pickupPass ? result.parcel.pickupPass.attemptsRemaining : 0;

    if (result.success) {
      const evt = result.parcel.events[result.parcel.events.length - 1];
      await Parcel.updateOne(
        { _id: parcel._id },
        { $set: { status: 'Collected', isTampered: false, 'pickupPass.isUsed': true }, $push: { events: evt } }
      );
    } else if (plain.pickupPass && nextAttempts === 0 && prevAttempts > 0) {
      const lockEvt = result.parcel.events[result.parcel.events.length - 1];
      await Parcel.updateOne(
        { _id: parcel._id },
        { $set: { status: 'Tamper Alert', isTampered: true, 'pickupPass.attemptsRemaining': 0 }, $push: { events: lockEvt } }
      );
    } else if (plain.pickupPass && nextAttempts < prevAttempts) {
      await Parcel.updateOne({ _id: parcel._id }, { $inc: { 'pickupPass.attemptsRemaining': -1 } });
    }

    res.json({ success: result.success, message: result.message, parcel: await findParcelById(req.params.id) });
  } catch (err) { next(err); }
});

// POST /api/parcels/:id/redirect (Uses updateOne with $set and $push)
router.post('/:id/redirect', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    if (parcel.status === 'Collected') {
      return res.status(400).json({ message: 'Collected parcels cannot be redirected' });
    }

    let locationName = (req.body.locationName || req.body.pickupPointName || '').trim();
    let address = (req.body.address || '').trim();

    if (!locationName && req.body.pickupPointId) {
      const pt = await PickupPoint.findOne({ $or: [{ pointId: req.body.pickupPointId }, { id: req.body.pickupPointId }] });
      if (pt) {
        locationName = pt.name;
        if (!address) address = pt.address;
      }
    }

    if (!locationName) {
      return res.status(400).json({ message: 'locationName is required to redirect a parcel' });
    }

    const resRed = redirectParcel(parcel.toObject(), { name: locationName, address });
    await Parcel.updateOne(
      { _id: parcel._id },
      { $set: { status: 'Redirected', currentLocation: locationName }, $push: { events: resRed.events[resRed.events.length - 1] } }
    );
    res.json(await findParcelById(req.params.id));
  } catch (err) { next(err); }
});

// POST /api/parcels/:id/report (Uses updateOne with $push)
router.post('/:id/report', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

    const { type, description } = req.body;
    if (!type || !ALLOWED_REPORT_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid report type. Allowed: ${ALLOWED_REPORT_TYPES.join(', ')}` });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ message: 'Description must be at least 10 characters long' });
    }

    const resRep = addReport(parcel.toObject(), type, description);
    await Parcel.updateOne(
      { _id: parcel._id },
      { $push: { reports: resRep.reports[resRep.reports.length - 1], events: resRep.events[resRep.events.length - 1] } }
    );
    res.json(await findParcelById(req.params.id));
  } catch (err) { next(err); }
});

async function handleCancelPass(req, res, next) {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    if (!parcel.pickupPass || parcel.pickupPass.isUsed) {
      return res.status(400).json({ message: 'No active unused pickup pass to cancel' });
    }
    const cancelEvt = {
      id: `EVT-${Date.now()}`,
      timestamp: new Date(),
      eventType: 'Pickup pass cancelled',
      sensorType: 'App',
      description: `Pickup pass for ${parcel.pickupPass.collectorName || 'collector'} was cancelled.`,
      isSimulated: false
    };
    await Parcel.updateOne({ _id: parcel._id }, { $set: { pickupPass: null }, $push: { events: cancelEvt } });
    res.json({ success: true, parcel: await findParcelById(req.params.id) });
  } catch (err) { next(err); }
}

// POST /api/parcels/:id/pass/cancel and DELETE /api/parcels/:id/pass alias
router.post('/:id/pass/cancel', handleCancelPass);
router.delete('/:id/pass', handleCancelPass);

module.exports = router;
