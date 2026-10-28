// MongoDB Query & CRUD Demonstration Script (Module 5 Syllabus)
// Operates on sandbox database: parcelTrailDemo
const mongoose = require('mongoose');

async function runMongoDemo() {
  const uri = 'mongodb://127.0.0.1:27017/parcelTrailDemo';
  await mongoose.connect(uri);
  console.log('--- Connected to parcelTrailDemo for MongoDB Syllabus Demo ---');
  const db = mongoose.connection.db;
  const col = db.collection('demo_parcels');

  // Clean up existing demo collection
  await col.deleteMany({});

  // 1. insertOne & insertMany (CRUD Create)
  await col.insertOne({ parcelId: 'P-1', item: 'Book', weight: 450, status: 'Expected', tags: ['study'] });
  await col.insertMany([
    { parcelId: 'P-2', item: 'Keyboard', weight: 800, status: 'Deposited', tags: ['tech', 'heavy'] },
    { parcelId: 'P-3', item: 'Flash Drive', weight: 50, status: 'Deposited', tags: ['tech'] },
    { parcelId: 'P-4', item: 'Headphones', weight: 250, status: 'Collected', tags: ['audio'] }
  ]);
  console.log('1. [Insert] Inserted 4 demo parcel documents');

  // 2. find() with $gt (Weight > 300g)
  const heavy = await col.find({ weight: { $gt: 300 } }).toArray();
  console.log('2. [Query $gt] Parcels with weight > 300g:', heavy.map(p => p.item));

  // 3. find() with $in (Status in Deposited or Collected)
  const inStatus = await col.find({ status: { $in: ['Deposited', 'Collected'] } }).toArray();
  console.log('3. [Query $in] Parcels in Deposited/Collected:', inStatus.map(p => p.item));

  // 4. find() with $regex (Case-insensitive search for "head")
  const regexSearch = await col.find({ item: { $regex: 'head', $options: 'i' } }).toArray();
  console.log('4. [Query $regex] Found items matching /head/i:', regexSearch.map(p => p.item));

  // 5. Projection (Select only item and status, suppress _id)
  const projected = await col.find({}, { projection: { item: 1, status: 1, _id: 0 } }).toArray();
  console.log('5. [Projection] Selected { item, status, _id: 0 }:', projected);

  // 6. updateOne() with $set and $push (Update status and add history tag)
  await col.updateOne({ parcelId: 'P-2' }, { $set: { status: 'Locked' }, $push: { tags: 'secured' } });
  const updatedP2 = await col.findOne({ parcelId: 'P-2' });
  console.log('6. [Update $set, $push] P-2 updated status & tags:', updatedP2.status, updatedP2.tags);

  // 7. updateMany() (Mark all tech items as verified)
  await col.updateMany({ tags: 'tech' }, { $set: { isInspected: true } });
  console.log('7. [updateMany] Inspected tech items');

  // 8. deleteOne() and deleteMany()
  await col.deleteOne({ parcelId: 'P-4' });
  console.log('8. [deleteOne] Deleted collected parcel P-4');

  await col.deleteMany({ status: 'Expected' });
  console.log('8b. [deleteMany] Deleted remaining Expected parcels');

  const remaining = await col.countDocuments();
  console.log(`--- Demo Complete. Remaining documents: ${remaining} ---`);
  await mongoose.disconnect();
}

if (require.main === module) {
  runMongoDemo().catch(console.error);
}

module.exports = runMongoDemo;
