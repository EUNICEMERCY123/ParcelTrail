// PickupPoint Mongoose Schema and Model (Module 5 & Module 6)
const mongoose = require('mongoose');

const PickupPointSchema = new mongoose.Schema({
  pointId: { type: String, required: true, unique: true },
  id: { type: String },
  name: { type: String, required: true },
  address: { type: String, required: true },
  distance: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  bbox: { type: String }
}, { timestamps: true });

PickupPointSchema.pre('save', function(next) {
  if (!this.id && this.pointId) {
    this.id = this.pointId;
  }
  next();
});

module.exports = mongoose.model('PickupPoint', PickupPointSchema);
