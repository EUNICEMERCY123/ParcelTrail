// Express routes for parcel actions using updateOne, $set, $push, and $inc (Module 5 & 6)
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const findParcelById = require('../utils/findParcel');
const { dropParcel, lockParcel, takeSnapshot, knockTamper, addReport, redirectParcel } = require('../rules/parcelRules');
const { issuePass, checkPassCode } = require('../rules/passRules');

// POST /api/parcels/:id/simulate (Uses updateOne with $set and $push)
router.post('/:id/simulate', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    const { eventType } = req.body;
    const plain = parcel.toObject();
    let ops = {};

    if (eventType === 'drop') ops = { $set: { status: 'Deposited' }, $push: { events: dropParcel(plain).events.slice(-1)[0] } };
    else if (eventType === 'lock') ops = { $set: { status: 'Locked' }, $push: { events: lockParcel(plain).events.slice(-1)[0] } };
    else if (eventType === 'snapshot') ops = { $set: { photoUrl: takeSnapshot(plain).photoUrl }, $push: { events: takeSnapshot(plain).events.slice(-1)[0] } };
    else if (eventType === 'tamper') ops = { $set: { status: 'Tamper Alert', isTampered: true }, $push: { events: knockTamper(plain).events.slice(-1)[0] } };
    else return res.status(400).json({ message: `Unknown simulation event: ${eventType}` });

    await Parcel.updateOne({ _id: parcel._id }, ops);
    res.json(await findParcelById(req.params.id));
  } catch (err) { next(err); }
});

// POST /api/parcels/:id/pass/issue (Uses updateOne with $set and $push)
router.post('/:id/pass/issue', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    const { collectorName, expiryMinutes } = req.body;
    const resPass = issuePass(parcel.toObject(), collectorName, expiryMinutes || 60);

    await Parcel.updateOne(
      { _id: parcel._id },
      { $set: { pickupPass: resPass.pickupPass }, $push: { events: resPass.events.slice(-1)[0] } }
    );
    res.json(await findParcelById(req.params.id));
  } catch (err) { next(err); }
});

// POST /api/parcels/:id/pass/verify (Uses updateOne with $set, $push, and $inc)
router.post('/:id/pass/verify', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    const plain = parcel.toObject();
    const result = checkPassCode(plain, req.body.inputCode);

    if (result.success) {
      const evt = result.parcel.events.slice(-1)[0];
      await Parcel.updateOne({ _id: parcel._id }, { $set: { status: 'Collected', isTampered: false, 'pickupPass.isUsed': true }, $push: { events: evt } });
    } else if (result.parcel.pickupPass.attemptsRemaining === 0 && plain.pickupPass.attemptsRemaining > 0) {
      const lockEvt = result.parcel.events.slice(-1)[0];
      await Parcel.updateOne({ _id: parcel._id }, { $set: { status: 'Tamper Alert', isTampered: true, 'pickupPass.attemptsRemaining': 0 }, $push: { events: lockEvt } });
    } else if (result.parcel.pickupPass.attemptsRemaining < plain.pickupPass.attemptsRemaining) {
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
    const { locationName, address } = req.body;
    const resRed = redirectParcel(parcel.toObject(), { name: locationName, address });
    await Parcel.updateOne({ _id: parcel._id }, { $set: { status: 'Redirected', currentLocation: locationName }, $push: { events: resRed.events.slice(-1)[0] } });
    res.json(await findParcelById(req.params.id));
  } catch (err) { next(err); }
});

// POST /api/parcels/:id/report (Uses updateOne with $push)
router.post('/:id/report', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    const { type, description } = req.body;
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ message: 'Description must be at least 10 characters long' });
    }
    const resRep = addReport(parcel.toObject(), type, description);
    await Parcel.updateOne({ _id: parcel._id }, { $push: { reports: resRep.reports.slice(-1)[0], events: resRep.events.slice(-1)[0] } });
    res.json(await findParcelById(req.params.id));
  } catch (err) { next(err); }
});

// POST /api/parcels/:id/pass/cancel (Module 6)
router.post('/:id/pass/cancel', async (req, res, next) => {
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
});

module.exports = router;
