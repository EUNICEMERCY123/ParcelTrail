// CLI utility to display stored parcels from MongoDB (Module 5 & 6)
const mongoose = require('mongoose');
const { connectDB } = require('../db');
const Parcel = require('../models/Parcel');

// Connects to database and logs all stored parcel records
async function showData() {
  try {
    await connectDB();
    const parcels = await Parcel.find().sort({ createdAt: 1 });
    console.log(`\n========================================`);
    console.log(`  PARCELTRAIL MONGODB DATABASE RECORDS`);
    console.log(`========================================`);
    console.log(`Total Parcels in MongoDB: ${parcels.length}\n`);

    parcels.forEach((p, idx) => {
      let passText = 'None';
      if (p.pickupPass) {
        if (p.pickupPass.isUsed) {
          passText = 'Used';
        } else {
          passText = `Active (Code: ${p.pickupPass.code})`;
        }
      }

      console.log(`[${idx + 1}] ${p.parcelId || p.id} - "${p.itemDescription}"`);
      console.log(`    Sender:        ${p.sender}`);
      console.log(`    Status:        ${p.status}`);
      console.log(`    Location:      ${p.currentLocation}`);
      console.log(`    Tracking No:   ${p.trackingNumber}`);
      console.log(`    Events Logged: ${p.events ? p.events.length : 0}`);
      console.log(`    Pickup Pass:   ${passText}`);
      console.log(`    Reports Filed: ${p.reports ? p.reports.length : 0}`);
      console.log(`----------------------------------------`);
    });

    await mongoose.disconnect();
    console.log('[MongoDB] Connection closed cleanly.\n');
  } catch (err) {
    console.error('Error reading MongoDB data:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  showData();
}

module.exports = showData;
