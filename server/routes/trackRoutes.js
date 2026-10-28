// Express route for public tracking lookup by tracking number (Module 5 & 6)
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');

// Validates tracking number format: 6-20 characters of letters, digits, and dashes
function isValidTrackingNumber(num) {
  if (!num || typeof num !== 'string') return false;
  const trimmed = num.trim();
  const pattern = /^[A-Za-z0-9-]{6,20}$/;
  return pattern.test(trimmed);
}

// GET /api/track/:trackingNumber
router.get('/:trackingNumber', async (req, res, next) => {
  try {
    const trackingNum = req.params.trackingNumber;

    if (!isValidTrackingNumber(trackingNum)) {
      return res.status(400).json({ message: 'Tracking number must be 6 to 20 letters, numbers, or dashes.' });
    }

    // Exact case-insensitive match on tracking number
    const escaped = trackingNum.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = { trackingNumber: new RegExp('^' + escaped + '$', 'i') };

    const doc = await Parcel.findOne(filter)
      .select('trackingNumber itemDescription sender status currentLocation expectedDate events.eventType events.timestamp events.isSimulated -_id');

    if (!doc) {
      return res.status(404).json({ message: 'No parcel found with that tracking number.' });
    }

    res.json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
