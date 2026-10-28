// Express routes for Management Records: parcels and summary statistics (Module 5 & 6)
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const { buildParcelFilter } = require('../utils/parcelQuery');
const { computePassState } = require('../utils/passState');
const detailRoutes = require('./recordsDetailRoutes');

// Mount detail routes for incidents, passes, and activity
router.use('/', detailRoutes);

// GET /api/records/stats
router.get('/stats', async (req, res, next) => {
  try {
    const total = await Parcel.countDocuments();
    const waiting = await Parcel.countDocuments({
      status: { $in: ['Expected', 'Deposited', 'Locked', 'Tamper Alert', 'Redirected'] }
    });
    const activePasses = await Parcel.countDocuments({
      'pickupPass.isUsed': false,
      'pickupPass.attemptsRemaining': { $gt: 0 },
      'pickupPass.expiresAt': { $gt: new Date() }
    });
    const withReports = await Parcel.find({ 'reports.0': { $exists: true } }, 'reports');
    let openIncidents = 0;
    withReports.forEach((p) => (p.reports || []).forEach((r) => { if (r.status === 'Open') openIncidents++; }));
    res.json({ total, waiting, openIncidents, activePasses });
  } catch (err) { next(err); }
});

// GET /api/records/parcels
router.get('/parcels', async (req, res, next) => {
  try {
    const filter = buildParcelFilter(req.query);
    const sortKey = req.query.sort || 'newest';
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      item: { itemDescription: 1 },
      status: { status: 1 }
    };
    const sortObj = sortMap[sortKey] || { createdAt: -1 };
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const skip = (page - 1) * limit;

    const total = await Parcel.countDocuments(filter);
    const docs = await Parcel.find(filter)
      .select('parcelId id itemDescription sender trackingNumber status currentLocation expectedDate createdAt pickupPass')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const now = Date.now();
    const items = docs.map((d) => {
      const obj = d.toObject();
      obj.isLate = obj.status === 'Expected' && obj.expectedDate && new Date(obj.expectedDate).getTime() < now;
      obj.passState = computePassState(obj.pickupPass);
      delete obj.pickupPass;
      return obj;
    });

    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) { next(err); }
});

module.exports = router;
