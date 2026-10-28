// Express routes for Parcel CRUD, search, edit, and reset (Module 5 & 6)
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const findParcelById = require('../utils/findParcel');
const { buildParcelFilter } = require('../utils/parcelQuery');
const { seedDatabase } = require('../seed');

// GET /api/parcels (uses shared buildParcelFilter and summary projection)
router.get('/', async (req, res, next) => {
  try {
    const filter = buildParcelFilter(req.query);
    const parcels = await Parcel.find(filter)
      .select('parcelId id itemDescription sender trackingNumber status isTampered currentLocation expectedDate createdAt')
      .slice('events', -1)
      .sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) { next(err); }
});

// GET /api/parcels/:id
router.get('/:id', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    res.json(parcel);
  } catch (err) { next(err); }
});

// POST /api/parcels (Add new expected parcel with optional expectedDate)
router.post('/', async (req, res, next) => {
  try {
    const { itemDescription, sender, expectedDate } = req.body;
    if (!itemDescription || itemDescription.trim().length < 2) {
      return res.status(400).json({ message: 'Item description must be at least 2 characters' });
    }
    if (!sender || sender.trim().length < 2) {
      return res.status(400).json({ message: 'Sender must be at least 2 characters' });
    }
    const count = await Parcel.countDocuments();
    const parcelId = `PRCL-${101 + count}`;
    const trackingNumber = `TRK-${Math.floor(10000 + Math.random() * 90000)}-IN`;
    const newParcel = new Parcel({
      parcelId,
      id: parcelId,
      trackingNumber,
      itemDescription: itemDescription.trim(),
      sender: sender.trim(),
      status: 'Expected',
      currentLocation: 'Mailbox',
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      events: [{
        id: `EVT-${Date.now()}`,
        timestamp: new Date(),
        eventType: 'Parcel Expected',
        sensorType: 'Order Placement',
        description: 'Item purchased online and expected for delivery in Smart Mailbox.',
        isSimulated: true
      }]
    });
    const saved = await newParcel.save();
    res.status(201).json(saved);
  } catch (err) { next(err); }
});

// PUT /api/parcels/:id (Edit parcel: itemDescription, sender, trackingNumber, expectedDate)
router.put('/:id', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    if (parcel.status === 'Collected') {
      return res.status(400).json({ message: 'Collected parcels cannot be edited' });
    }
    const { itemDescription, sender, trackingNumber, expectedDate } = req.body;
    if (itemDescription !== undefined && itemDescription.trim().length < 2) {
      return res.status(400).json({ message: 'Item description must be at least 2 characters' });
    }
    if (sender !== undefined && sender.trim().length < 2) {
      return res.status(400).json({ message: 'Sender must be at least 2 characters' });
    }

    const updates = {};
    if (itemDescription) updates.itemDescription = itemDescription.trim();
    if (sender) updates.sender = sender.trim();
    if (trackingNumber) updates.trackingNumber = trackingNumber.trim();
    if (expectedDate !== undefined) updates.expectedDate = expectedDate ? new Date(expectedDate) : null;

    await Parcel.updateOne({ _id: parcel._id }, { $set: updates });
    const updated = await findParcelById(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/parcels/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    if (parcel.status !== 'Collected') {
      return res.status(400).json({ message: 'Only Collected parcels can be deleted from records' });
    }
    await Parcel.deleteOne({ _id: parcel._id });
    res.json({ success: true, message: `Parcel ${parcel.parcelId} deleted successfully` });
  } catch (err) { next(err); }
});

// POST /api/parcels/reset (Seeds dynamic parcels and returns summary list)
router.post('/reset', async (req, res, next) => {
  try {
    const { parcels } = await seedDatabase();
    res.json({ success: true, message: 'Parcels reset to default', parcels });
  } catch (err) { next(err); }
});

module.exports = router;
