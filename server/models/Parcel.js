// Parcel Mongoose Schema and Model with expected date and report lifecycle (Module 5 & 6)
const mongoose = require('mongoose');

const EventSubSchema = new mongoose.Schema({
  id: { type: String },
  timestamp: { type: Date, default: Date.now },
  eventType: { type: String, required: true },
  sensorType: { type: String, required: true },
  description: { type: String, required: true },
  isSimulated: { type: Boolean, default: true }
}, { _id: false });

const PickupPassSubSchema = new mongoose.Schema({
  code: { type: String },
  collectorName: { type: String },
  expiresAt: { type: Date },
  isUsed: { type: Boolean, default: false },
  attemptsRemaining: { type: Number, default: 3 }
}, { _id: false });

const ReportSubSchema = new mongoose.Schema({
  id: { type: String },
  type: {
    type: String,
    enum: ['Missing Parcel', 'Damaged Packaging', 'Tampered Lock', 'Wrong Item', 'Other', 'Missing parcel', 'Damaged', 'Suspicious activity'],
    required: true
  },
  description: { type: String, required: true, minlength: 10 },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  resolvedAt: { type: Date },
  resolutionNote: { type: String, maxlength: 200 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ParcelSchema = new mongoose.Schema({
  parcelId: { type: String, required: true, unique: true },
  id: { type: String },
  trackingNumber: { type: String, required: true },
  itemDescription: { type: String, required: true, minlength: 2 },
  sender: { type: String, required: true, minlength: 2 },
  status: {
    type: String,
    enum: ['Expected', 'Deposited', 'Locked', 'Tamper Alert', 'Collected', 'Redirected'],
    default: 'Expected'
  },
  expectedDate: { type: Date },
  isTampered: { type: Boolean, default: false },
  photoUrl: { type: String, default: '/assets/camera-placeholder.svg' },
  currentLocation: { type: String, default: 'Mailbox' },
  events: [EventSubSchema],
  pickupPass: { type: PickupPassSubSchema, default: null },
  reports: [ReportSubSchema]
}, { timestamps: true });

ParcelSchema.pre('save', function(next) {
  if (!this.id && this.parcelId) this.id = this.parcelId;
  next();
});

module.exports = mongoose.model('Parcel', ParcelSchema);
