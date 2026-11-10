// Express route for public tracking lookup by tracking number or parcel ID (Module 5 & 6)
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');

// Validates tracking number or parcel ID format: 6-20 characters of letters, digits, and dashes
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

    // Exact case-insensitive match on trackingNumber or parcelId
    const escaped = trackingNum.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('^' + escaped + '$', 'i');
    const filter = { $or: [{ trackingNumber: regex }, { parcelId: regex }] };

    const doc = await Parcel.findOne(filter)
      .select('parcelId trackingNumber itemDescription sender status currentLocation expectedDate events.eventType events.timestamp events.isSimulated -_id');

    if (!doc) {
      return res.status(404).json({ message: 'No parcel found with that tracking number.' });
    }

    res.json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.isValidTrackingNumber = isValidTrackingNumber;
