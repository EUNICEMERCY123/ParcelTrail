// Express routes for Pickup Points, Mailbox Flash, Active Passes, and Notifications (Module 5 & 6)
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const PickupPoint = require('../models/PickupPoint');
const Mailbox = require('../models/Mailbox');
const { collectAllEvents } = require('../utils/events');

// GET /api/passes/active (counts active passes using $gt operators)
router.get('/passes/active', async (req, res, next) => {
  try {
    const now = new Date();
    const count = await Parcel.countDocuments({
      'pickupPass.isUsed': false,
      'pickupPass.attemptsRemaining': { $gt: 0 },
      'pickupPass.expiresAt': { $gt: now }
    });
    res.json({ activePasses: count, timestamp: now });
  } catch (err) { next(err); }
});

// GET /api/notifications (projection of events with plain loop and array.sort)
router.get('/notifications', async (req, res, next) => {
  try {
    const parcels = await Parcel.find({}, 'parcelId itemDescription events');
    const allEvents = collectAllEvents(parcels);
    res.json(allEvents.slice(0, 5));
  } catch (err) { next(err); }
});

// GET /api/pickup-points
router.get('/pickup-points', async (req, res, next) => {
  try {
    const points = await PickupPoint.find();
    res.json(points);
  } catch (err) { next(err); }
});

// GET /api/mailbox/flash
router.get('/mailbox/flash', async (req, res, next) => {
  try {
    let box = await Mailbox.findOne();
    if (!box) box = await Mailbox.create({ flashOn: false });
    res.json({ flashOn: box.flashOn });
  } catch (err) { next(err); }
});

// POST /api/mailbox/flash/toggle
router.post('/mailbox/flash/toggle', async (req, res, next) => {
  try {
    let box = await Mailbox.findOne();
    if (!box) box = await Mailbox.create({ flashOn: false });
    box.flashOn = !box.flashOn;
    await box.save();
    res.json({ flashOn: box.flashOn });
  } catch (err) { next(err); }
});

module.exports = router;
