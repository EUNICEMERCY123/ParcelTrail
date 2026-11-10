// Express routes for Parcel CRUD, search, edit, and reset (Module 5 & 6)
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const findParcelById = require('../utils/findParcel');
const { buildParcelFilter } = require('../utils/parcelQuery');
const { seedDatabase } = require('../seed');

async function generateNextParcelId() {
  const existing = await Parcel.find({ parcelId: /^PRCL-\d+$/ }, 'parcelId').lean();
  let maxNum = 100;
  existing.forEach((doc) => {
    const num = parseInt(String(doc.parcelId).split('-')[1], 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });
  return `PRCL-${maxNum + 1}`;
}

function parseOptionalDate(value) {
  if (value === undefined || value === null || value === '') return { valid: true, date: null };
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return { valid: false, date: null };
  return { valid: true, date: parsed };
}

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

// POST /api/parcels/reset (Seeds dynamic parcels and returns summary list)
router.post('/reset', async (req, res, next) => {
  try {
    const { parcels } = await seedDatabase();
    res.json({ success: true, message: 'Parcels reset to default', parcels });
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
    const { itemDescription, sender, expectedDate, trackingNumber } = req.body;
    if (!itemDescription || itemDescription.trim().length < 2) {
      return res.status(400).json({ message: 'Item description must be at least 2 characters' });
    }
    if (!sender || sender.trim().length < 2) {
      return res.status(400).json({ message: 'Sender must be at least 2 characters' });
    }
    const parsedDate = parseOptionalDate(expectedDate);
    if (!parsedDate.valid) {
      return res.status(400).json({ message: 'Invalid expectedDate format' });
    }

    const parcelId = await generateNextParcelId();
    const resolvedTracking =
      trackingNumber && String(trackingNumber).trim()
        ? String(trackingNumber).trim()
        : `TRK-${Math.floor(10000 + Math.random() * 90000)}-IN`;

    const newParcel = new Parcel({
      parcelId,
      id: parcelId,
      trackingNumber: resolvedTracking,
      itemDescription: itemDescription.trim(),
      sender: sender.trim(),
      status: 'Expected',
      currentLocation: 'Mailbox',
      expectedDate: parsedDate.date,
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
    const parsedDate = parseOptionalDate(expectedDate);
    if (!parsedDate.valid) {
      return res.status(400).json({ message: 'Invalid expectedDate format' });
    }

    const updates = {};
    if (itemDescription) updates.itemDescription = itemDescription.trim();
    if (sender) updates.sender = sender.trim();
    if (trackingNumber !== undefined && String(trackingNumber).trim()) {
      updates.trackingNumber = String(trackingNumber).trim();
    }
    if (expectedDate !== undefined) updates.expectedDate = parsedDate.date;

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

module.exports = router;
