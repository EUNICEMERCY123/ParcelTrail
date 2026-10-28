// Express routes for Incidents, Passes, and Activity records (Module 5 & 6)
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const findParcelById = require('../utils/findParcel');
const { computePassState } = require('../utils/passState');
const { collectAllEvents } = require('../utils/events');

// GET /incidents
router.get('/incidents', async (req, res, next) => {
  try {
    const docs = await Parcel.find({ 'reports.0': { $exists: true } }, 'parcelId itemDescription reports');
    const list = [];
    docs.forEach((p) => {
      (p.reports || []).forEach((r) => {
        if (req.query.status && r.status !== req.query.status) return;
        if (req.query.type && r.type !== req.query.type) return;
        list.push({
          id: r.id || r._id,
          parcelId: p.parcelId,
          itemDescription: p.itemDescription,
          type: r.type,
          description: r.description,
          status: r.status,
          resolvedAt: r.resolvedAt,
          resolutionNote: r.resolutionNote,
          createdAt: r.createdAt
        });
      });
    });
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (err) { next(err); }
});

// POST /incidents/:parcelId/:reportId/resolve
router.post('/incidents/:parcelId/:reportId/resolve', async (req, res, next) => {
  try {
    const parcel = await findParcelById(req.params.parcelId);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    const report = (parcel.reports || []).find((r) => (r.id || String(r._id)) === req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.status === 'Resolved') return res.status(400).json({ message: 'Incident already resolved' });

    report.status = 'Resolved';
    report.resolvedAt = new Date();
    report.resolutionNote = (req.body.note || '').slice(0, 200);

    parcel.events.push({
      id: `EVT-${Date.now()}`,
      timestamp: new Date(),
      eventType: 'Incident resolved',
      sensorType: 'App',
      description: report.resolutionNote || 'Incident marked as resolved in custody records.',
      isSimulated: false
    });

    await parcel.save();
    res.json({ success: true, parcel, report });
  } catch (err) { next(err); }
});

// GET /passes
router.get('/passes', async (req, res, next) => {
  try {
    const docs = await Parcel.find({ 'pickupPass.code': { $exists: true } }, 'parcelId itemDescription pickupPass createdAt');
    const list = [];
    docs.forEach((p) => {
      if (!p.pickupPass) return;
      const state = computePassState(p.pickupPass);
      if (req.query.state && state !== req.query.state) return;
      list.push({
        parcelId: p.parcelId,
        itemDescription: p.itemDescription,
        collectorName: p.pickupPass.collectorName,
        expiresAt: p.pickupPass.expiresAt,
        attemptsRemaining: p.pickupPass.attemptsRemaining,
        state
      });
    });
    res.json(list);
  } catch (err) { next(err); }
});

// GET /activity
router.get('/activity', async (req, res, next) => {
  try {
    const parcels = await Parcel.find({}, 'parcelId itemDescription events');
    const all = collectAllEvents(parcels, { parcelId: req.query.parcelId, type: req.query.type });
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const skip = (page - 1) * limit;
    const items = all.slice(skip, skip + limit);
    res.json({ items, total: all.length, page, pages: Math.ceil(all.length / limit) || 1 });
  } catch (err) { next(err); }
});

module.exports = router;
