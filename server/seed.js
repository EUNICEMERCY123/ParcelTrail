// Seed generator function and database seeder (Module 5 & 6)
const fs = require('fs');
const path = require('path');
const { connectDB } = require('./db');
const Parcel = require('./models/Parcel');
const PickupPoint = require('./models/PickupPoint');
const Mailbox = require('./models/Mailbox');

function getDynamicParcels() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;
  const min = 60 * 1000;

  return [
    {
      parcelId: 'PRCL-101',
      id: 'PRCL-101',
      trackingNumber: 'TRK-98234-IN',
      itemDescription: 'Phone Cover',
      sender: 'ShopKart',
      status: 'Expected',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 2 * day),
      expectedDate: new Date(now + 1 * day),
      events: [],
      pickupPass: null,
      reports: []
    },
    {
      parcelId: 'PRCL-102',
      id: 'PRCL-102',
      trackingNumber: 'TRK-54129-IN',
      itemDescription: 'Notebook Set',
      sender: 'BookBarn',
      status: 'Deposited',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 1 * day),
      expectedDate: new Date(now - 6 * hour),
      events: [
        { id: 'EVT-102-1', timestamp: new Date(now - 18 * hour), eventType: 'Parcel Deposited', sensorType: 'Ultrasonic Sensor', description: 'Distance reading dropped below 15cm.', isSimulated: true },
        { id: 'EVT-102-2', timestamp: new Date(now - 17 * hour), eventType: 'Lid Locked', sensorType: 'Servo Motor Lock', description: 'Lid closed and locked securely.', isSimulated: true }
      ],
      pickupPass: null,
      reports: []
    },
    {
      parcelId: 'PRCL-103',
      id: 'PRCL-103',
      trackingNumber: 'TRK-33871-IN',
      itemDescription: 'Headphones',
      sender: 'SoundHub',
      status: 'Collected',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 3 * day),
      expectedDate: new Date(now - 2 * day),
      events: [
        { id: 'EVT-103-1', timestamp: new Date(now - 2 * day), eventType: 'Parcel Deposited', sensorType: 'Ultrasonic Sensor', description: 'Item detected inside mailbox.', isSimulated: true },
        { id: 'EVT-103-2', timestamp: new Date(now - 2 * day + 5 * min), eventType: 'Lid Locked', sensorType: 'Servo Motor Lock', description: 'Solenoid bolt engaged.', isSimulated: true },
        { id: 'EVT-103-3', timestamp: new Date(now - 1 * day), eventType: 'Pickup Pass Issued', sensorType: 'Security Subsystem', description: 'Pass issued to Rahul.', isSimulated: true },
        { id: 'EVT-103-4', timestamp: new Date(now - 1 * day + 15 * min), eventType: 'Parcel Collected', sensorType: 'Keypad Verification', description: 'Verified and collected.', isSimulated: true }
      ],
      pickupPass: null,
      reports: []
    },
    {
      parcelId: 'PRCL-104',
      id: 'PRCL-104',
      trackingNumber: 'TRK-88120-IN',
      itemDescription: 'Mechanical Keyboard',
      sender: 'Keytronics',
      status: 'Expected',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 5 * day),
      expectedDate: new Date(now - 2 * day),
      events: [
        { id: 'EVT-104-1', timestamp: new Date(now - 5 * day), eventType: 'Parcel Expected', sensorType: 'App', description: 'Order recorded.', isSimulated: false }
      ],
      pickupPass: null,
      reports: []
    },
    {
      parcelId: 'PRCL-105',
      id: 'PRCL-105',
      trackingNumber: 'TRK-77194-IN',
      itemDescription: 'Running Shoes',
      sender: 'FitGear',
      status: 'Expected',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 4 * day),
      expectedDate: new Date(now - 1 * day),
      events: [
        { id: 'EVT-105-1', timestamp: new Date(now - 4 * day), eventType: 'Parcel Expected', sensorType: 'App', description: 'Expected delivery.', isSimulated: false }
      ],
      pickupPass: null,
      reports: []
    },
    {
      parcelId: 'PRCL-106',
      id: 'PRCL-106',
      trackingNumber: 'TRK-66412-IN',
      itemDescription: 'Smart Watch',
      sender: 'TimeTech',
      status: 'Locked',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 1 * day),
      expectedDate: new Date(now + 1 * day),
      events: [
        { id: 'EVT-106-1', timestamp: new Date(now - 10 * hour), eventType: 'Parcel Deposited', sensorType: 'Ultrasonic Sensor', description: 'Detected in compartment.', isSimulated: true },
        { id: 'EVT-106-2', timestamp: new Date(now - 9 * hour), eventType: 'Lid Locked', sensorType: 'Servo Motor Lock', description: 'Locked by deadbolt.', isSimulated: true },
        { id: 'EVT-106-3', timestamp: new Date(now - 20 * min), eventType: 'Pickup Pass Issued', sensorType: 'Security Subsystem', description: 'Pass created for Meera.', isSimulated: true }
      ],
      pickupPass: {
        code: '482913',
        collectorName: 'Meera',
        expiresAt: new Date(now + 45 * min),
        isUsed: false,
        attemptsRemaining: 3
      },
      reports: []
    },
    {
      parcelId: 'PRCL-107',
      id: 'PRCL-107',
      trackingNumber: 'TRK-55209-IN',
      itemDescription: 'Coffee Beans',
      sender: 'RoastCo',
      status: 'Locked',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 2 * day),
      expectedDate: new Date(now - 1 * day),
      events: [
        { id: 'EVT-107-1', timestamp: new Date(now - 30 * hour), eventType: 'Parcel Deposited', sensorType: 'Ultrasonic Sensor', description: 'Deposited.', isSimulated: true },
        { id: 'EVT-107-2', timestamp: new Date(now - 29 * hour), eventType: 'Lid Locked', sensorType: 'Servo Motor Lock', description: 'Locked.', isSimulated: true },
        { id: 'EVT-107-3', timestamp: new Date(now - 2 * hour), eventType: 'Pickup Pass Issued', sensorType: 'Security Subsystem', description: 'Pass created for Rohan.', isSimulated: true }
      ],
      pickupPass: {
        code: '391024',
        collectorName: 'Rohan',
        expiresAt: new Date(now - 1 * hour),
        isUsed: false,
        attemptsRemaining: 3
      },
      reports: []
    },
    {
      parcelId: 'PRCL-108',
      id: 'PRCL-108',
      trackingNumber: 'TRK-44108-IN',
      itemDescription: 'Bluetooth Speaker',
      sender: 'AudioBox',
      status: 'Tamper Alert',
      isTampered: true,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 2 * day),
      expectedDate: new Date(now + 1 * day),
      events: [
        { id: 'EVT-108-1', timestamp: new Date(now - 24 * hour), eventType: 'Parcel Deposited', sensorType: 'Ultrasonic Sensor', description: 'Deposited.', isSimulated: true },
        { id: 'EVT-108-2', timestamp: new Date(now - 23 * hour), eventType: 'Lid Locked', sensorType: 'Servo Motor Lock', description: 'Locked.', isSimulated: true },
        { id: 'EVT-108-3', timestamp: new Date(now - 4 * hour), eventType: 'Tamper Knock Detected', sensorType: 'Accelerometer', description: 'Mailbox disturbed.', isSimulated: true },
        { id: 'EVT-108-4', timestamp: new Date(now - 3 * hour), eventType: 'Pickup Code Lockout', sensorType: 'Keypad Verification', description: '3 failed attempts.', isSimulated: true }
      ],
      pickupPass: {
        code: '852147',
        collectorName: 'Kiran',
        expiresAt: new Date(now + 1 * hour),
        isUsed: false,
        attemptsRemaining: 0
      },
      reports: [
        {
          id: 'REP-108-1',
          type: 'Tampered Lock',
          description: 'Mailbox was shaken and someone repeatedly tried wrong passcodes.',
          status: 'Open',
          createdAt: new Date(now - 2 * hour)
        }
      ]
    },
    {
      parcelId: 'PRCL-109',
      id: 'PRCL-109',
      trackingNumber: 'TRK-33109-IN',
      itemDescription: 'Winter Jacket',
      sender: 'WarmWear',
      status: 'Deposited',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 3 * day),
      expectedDate: new Date(now - 1 * day),
      events: [
        { id: 'EVT-109-1', timestamp: new Date(now - 2 * day), eventType: 'Parcel Deposited', sensorType: 'Ultrasonic Sensor', description: 'Deposited into mailbox.', isSimulated: true },
        { id: 'EVT-109-2', timestamp: new Date(now - 1 * day), eventType: 'Incident resolved', sensorType: 'App', description: 'Checked packaging, contents intact.', isSimulated: false }
      ],
      pickupPass: null,
      reports: [
        {
          id: 'REP-109-1',
          type: 'Damaged Packaging',
          description: 'Cardboard corner was badly crushed during delivery.',
          status: 'Resolved',
          resolvedAt: new Date(now - 1 * day),
          resolutionNote: 'Checked packaging, contents intact.',
          createdAt: new Date(now - 2 * day)
        }
      ]
    },
    {
      parcelId: 'PRCL-110',
      id: 'PRCL-110',
      trackingNumber: 'TRK-22110-IN',
      itemDescription: 'Desk Lamp',
      sender: 'Lumina',
      status: 'Redirected',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Karunya Nagar Main Gatehouse',
      createdAt: new Date(now - 6 * day),
      expectedDate: new Date(now - 4 * day),
      events: [
        { id: 'EVT-110-1', timestamp: new Date(now - 5 * day), eventType: 'Parcel Redirected', sensorType: 'Gatehouse Transfer', description: 'Transferred to Karunya Nagar Main Gatehouse.', isSimulated: true }
      ],
      pickupPass: null,
      reports: []
    },
    {
      parcelId: 'PRCL-111',
      id: 'PRCL-111',
      trackingNumber: 'TRK-11111-IN',
      itemDescription: 'USB-C Hub',
      sender: 'CableMart',
      status: 'Collected',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 7 * day),
      expectedDate: new Date(now - 6 * day),
      events: [
        { id: 'EVT-111-1', timestamp: new Date(now - 6 * day), eventType: 'Parcel Deposited', sensorType: 'Ultrasonic Sensor', description: 'Deposited.', isSimulated: true },
        { id: 'EVT-111-2', timestamp: new Date(now - 5 * day), eventType: 'Parcel Collected', sensorType: 'Keypad Verification', description: 'Collected with pass.', isSimulated: true }
      ],
      pickupPass: {
        code: '123456',
        collectorName: 'Alex',
        expiresAt: new Date(now - 5 * day),
        isUsed: true,
        attemptsRemaining: 3
      },
      reports: []
    },
    {
      parcelId: 'PRCL-112',
      id: 'PRCL-112',
      trackingNumber: 'TRK-00112-IN',
      itemDescription: 'Canvas Backpack',
      sender: 'TrailGear',
      status: 'Deposited',
      isTampered: false,
      photoUrl: '/assets/camera-placeholder.svg',
      currentLocation: 'Mailbox',
      createdAt: new Date(now - 1 * day),
      expectedDate: new Date(now + 2 * day),
      events: [
        { id: 'EVT-112-1', timestamp: new Date(now - 12 * hour), eventType: 'Parcel Deposited', sensorType: 'Ultrasonic Sensor', description: 'Arrived in mailbox.', isSimulated: true }
      ],
      pickupPass: null,
      reports: []
    }
  ];
}

async function seedDatabase() {
  await connectDB();
  const dataPath = path.join(__dirname, 'data', 'parcelData.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  const staticData = JSON.parse(raw);

  const parcels = getDynamicParcels();

  await Parcel.deleteMany({});
  await PickupPoint.deleteMany({});
  await Mailbox.deleteMany({});

  await Parcel.insertMany(parcels);
  await PickupPoint.insertMany(staticData.pickupPoints);
  await Mailbox.create(staticData.mailbox || { flashOn: false });

  console.log(`[Seed] Seeded ${parcels.length} parcels, ${staticData.pickupPoints.length} pickup points.`);
  return { parcels, pickupPoints: staticData.pickupPoints };
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedDatabase, getDynamicParcels };
