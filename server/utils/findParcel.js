// Helper to look up a parcel by parcelId, id, or MongoDB _id (Module 6)
const Parcel = require('../models/Parcel');

async function findParcelById(id) {
  let parcel = await Parcel.findOne({ $or: [{ parcelId: id }, { id: id }] });
  if (!parcel && id && id.match(/^[0-9a-fA-F]{24}$/)) {
    parcel = await Parcel.findById(id);
  }
  return parcel;
}

module.exports = findParcelById;
