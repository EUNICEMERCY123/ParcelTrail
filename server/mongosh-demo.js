// MongoDB Shell Demonstration Script (Module 5 Syllabus)

// Switch to sandbox database
const demoDb = db.getSiblingDB("parcelTrailDemo");

// Clear existing demo collection
demoDb.parcels.deleteMany({});

// 1. insertOne: Insert a single parcel document
demoDb.parcels.insertOne({ parcelId: "PRCL-D1", itemDescription: "Keyboard", sender: "KeyHub", status: "Expected", weight: 650, tags: ["hardware"] });

// 2. insertMany: Insert multiple parcel documents at once
demoDb.parcels.insertMany([
  { parcelId: "PRCL-D2", itemDescription: "Wireless Mouse", sender: "LogiTech", status: "Deposited", weight: 120, tags: ["hardware", "wireless"] },
  { parcelId: "PRCL-D3", itemDescription: "USB-C Cable", sender: "CableCorp", status: "Deposited", weight: 45, tags: ["accessory"] },
  { parcelId: "PRCL-D4", itemDescription: "Noise Cancelling Headphones", sender: "SoundMax", status: "Collected", weight: 280, tags: ["audio"] }
]);

// 3. find with $gt: Query parcels weighing more than 100 grams
demoDb.parcels.find({ weight: { $gt: 100 } });

// 4. find with $in: Query parcels with status in Deposited or Collected
demoDb.parcels.find({ status: { $in: ["Deposited", "Collected"] } });

// 5. find with $regex: Case-insensitive search for parcels containing "phone" or "head"
demoDb.parcels.find({ itemDescription: { $regex: "head", $options: "i" } });

// 6. Projection: Retrieve only itemDescription and status, excluding the _id field
demoDb.parcels.find({}, { itemDescription: 1, status: 1, _id: 0 });

// 7. updateOne with $set and $push: Update status to Locked and append a tamper check tag
demoDb.parcels.updateOne({ parcelId: "PRCL-D2" }, { $set: { status: "Locked" }, $push: { tags: "inspected" } });

// 8. updateMany with $set: Mark all hardware parcels as categorized
demoDb.parcels.updateMany({ tags: "hardware" }, { $set: { isHardware: true } });

// 9. deleteOne: Delete the single collected parcel record
demoDb.parcels.deleteOne({ parcelId: "PRCL-D4" });

// 10. deleteMany: Delete all remaining expected parcels
demoDb.parcels.deleteMany({ status: "Expected" });
