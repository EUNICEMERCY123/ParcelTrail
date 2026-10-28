# ParcelTrail - Full-Stack Smart Mailbox Custody Web Application

> "Know who touched your parcel, from doorstep to your hand."

- **Course:** Web Technology (B.Tech CSE)
- **Topic:** IoT-Enabled Smart Mailbox for Secure Parcel Management
- **Architecture:** Full-Stack MERN (React + Express API + MongoDB)
- **Primary Repositories / Folders:** `client/` (Frontend) and `server/` (Backend)

---

## 1. Project Overview

ParcelTrail is a full-stack web application that simulates an IoT-enabled smart mailbox system and maintains a verifiable custody diary for every delivery. It addresses the drawbacks of traditional single-user mailboxes by providing:
1. One-time 6-digit pickup passes with a live countdown timer.
2. 3-try security lockout rule protecting the physical mailbox latch.
3. Accelerometer tamper detection with an audible alarm.
4. Chronological custody history timeline and table view.
5. In-app simulated notifications and public parcel tracking.
6. Real MongoDB document persistence via an Express REST API.

---

## 2. Honest Academic Disclosure

- **Full-Stack Application:** This project is a genuine full-stack MERN application. React communicates with an Express REST API on port 5000, which performs CRUD queries against MongoDB (`parcelTrail`) using Mongoose schemas.
- **Simulated IoT Events:** There is **no physical microcontroller, no MQTT broker, no live Telegram bot API, and no SMS gateway connected**. All hardware actions (ESP32 controller, ultrasonic sensor, ESP32-CAM, servo motor, 12V solenoid lock, and accelerometer) are simulated in software with visible `Simulated` badges.
- **Single Resident User Model:** A pickup pass lets a trusted person collect on the resident's behalf; the application maintains one resident custody profile.
- **Test Notice:** Running the backend tests executes the integration suite, which resets the demo parcels in MongoDB to initial seed data.

---

## 3. Technologies Used (6-Module Course Syllabus)

| Module | Syllabus Topic | File & Line Reference |
|---|---|---|
| **Module 1 (HTML and CSS)** | Page structure | [client/index.html#L1-L18](file:///c:/Users/user/Desktop/Parcel%20Trail/client/index.html#L1-L18) & [client/public/track.html#L1-L38](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/track.html#L1-L38) |
| | Common elements | [client/public/help.html#L11-L48](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/help.html#L11-L48) & [client/src/pages/HomePage.jsx#L10-L67](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/pages/HomePage.jsx#L10-L67) |
| | Images | [client/src/components/MailboxStatus.jsx#L29-L30](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/MailboxStatus.jsx#L29-L30) & [client/public/assets/mailbox-base.svg](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/assets/mailbox-base.svg) |
| | Audio | [client/src/components/OptionsPanel.jsx#L44](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/OptionsPanel.jsx#L44) |
| | Video | Not used (audio and iframe are used instead) |
| | Iframe | [client/src/components/MapFrame.jsx#L30-L35](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/MapFrame.jsx#L30-L35) |
| | Tables | [client/src/components/records/ParcelsTab.jsx#L94-L104](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/records/ParcelsTab.jsx#L94-L104) & [client/src/components/HistoryPanel.jsx#L78-L93](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/HistoryPanel.jsx#L78-L93) |
| | Forms | [client/src/components/AddParcelForm.jsx#L37-L71](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/AddParcelForm.jsx#L37-L71) & [client/public/track.html#L43-L58](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/track.html#L43-L58) |
| | CSS backgrounds and colors | [client/src/css/base.css#L8-L19](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/css/base.css#L8-L19) |
| | Gradients | [client/src/css/components.css#L257](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/css/components.css#L257) |
| | Fonts and text styles | [client/src/css/base.css#L23,L27-L36](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/css/base.css#L23,L27-L36) |
| | Selectors | [client/src/css/base.css#L4,L39,L95](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/css/base.css#L4,L39,L95) |
| | Box model | [client/src/css/base.css#L4-L6](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/css/base.css#L4-L6) |
| | Position properties | [client/src/css/components.css#L5-L30](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/css/components.css#L5-L30) |
| | Navigation bars with lists and links | [client/src/components/TopBar.jsx#L28-L69](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/TopBar.jsx#L28-L69) & [client/public/help.html#L23-L32](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/help.html#L23-L32) |
| | Bootstrap | [client/index.html#L12](file:///c:/Users/user/Desktop/Parcel%20Trail/client/index.html#L12) & [client/src/pages/HomePage.jsx#L9-L67](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/pages/HomePage.jsx#L9-L67) |
| **Module 2 (JavaScript and JSON)** | Functions and events | [client/public/js/track.js#L14,L22,L33,L110-L115](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/track.js#L14,L22,L33,L110-L115) |
| | DOM | [client/public/js/track.js#L6-L10,L30-L45](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/track.js#L6-L10,L30-L45) |
| | Form validation | [client/public/js/track.js#L90-L93](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/track.js#L90-L93) |
| | JSON intro | [client/public/js/track.js#L16,L25,L99](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/track.js#L16,L25,L99) |
| | JSON syntax | [server/data/parcels.json#L1-L132](file:///c:/Users/user/Desktop/Parcel%20Trail/server/data/parcels.json#L1-L132) |
| | JSON data types | [server/data/parcels.json#L2-L15](file:///c:/Users/user/Desktop/Parcel%20Trail/server/data/parcels.json#L2-L15) |
| **Module 3 (jQuery)** | Fundamentals and selectors | [client/public/js/help-practice.js#L8-L25](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/help-practice.js#L8-L25) |
| | Form field data | [client/public/js/help-practice.js#L50,L68](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/help-practice.js#L50,L68) |
| | Traversal | [client/public/js/help-practice.js#L10-L13](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/help-practice.js#L10-L13) |
| | Manipulators | [client/public/js/help-practice.js#L27-L32,L58-L62](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/help-practice.js#L27-L32,L58-L62) |
| | Events and effects | [client/public/js/help-practice.js#L14-L15,L31,L34,L62](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/help-practice.js#L14-L15,L31,L34,L62) & [client/public/js/help-parts.js#L45-L51](file:///c:/Users/user/Desktop/Parcel%20Trail/client/public/js/help-parts.js#L45-L51) |
| **Module 4 (ReactJS)** | Rendering | [client/src/main.jsx#L12-L16](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/main.jsx#L12-L16) |
| | JSX | [client/src/pages/HomePage.jsx#L8-L69](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/pages/HomePage.jsx#L8-L69) |
| | Components | [client/src/components/MailboxStatus.jsx#L13-L39](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/MailboxStatus.jsx#L13-L39) |
| | Props | [client/src/components/MailboxStatus.jsx#L13,L20](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/MailboxStatus.jsx#L13,L20) & [client/src/components/TrackStepper.jsx#L7-L84](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/TrackStepper.jsx#L7-L84) |
| | Memo | [client/src/components/ParcelCard.jsx#L16-L54](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/ParcelCard.jsx#L16-L54) & [client/src/components/records/ParcelRecordRow.jsx#L5-L60](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/records/ParcelRecordRow.jsx#L5-L60) |
| | Events | [client/src/pages/MyParcelsPage.jsx#L90-L99](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/pages/MyParcelsPage.jsx#L90-L99) |
| | Conditional rendering | [client/src/pages/MyParcelsPage.jsx#L106-L115](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/pages/MyParcelsPage.jsx#L106-L115) & [client/src/components/PickupPanel.jsx#L24-L38](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/PickupPanel.jsx#L24-L38) |
| | Lists | [client/src/pages/MyParcelsPage.jsx#L67,L76](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/pages/MyParcelsPage.jsx#L67,L76) & [client/src/components/ParcelsSidebar.jsx#L42-L50](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/ParcelsSidebar.jsx#L42-L50) |
| | Forms | [client/src/components/AddParcelForm.jsx#L37-L71](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/AddParcelForm.jsx#L37-L71) |
| | Router | [client/src/App.jsx#L12-L25](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/App.jsx#L12-L25) & [client/src/components/TopBar.jsx#L31-L59](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/components/TopBar.jsx#L31-L59) |
| | CSS styling | [client/src/main.jsx#L6-L9](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/main.jsx#L6-L9) |
| | Hooks (state, effect, memo) | [client/src/pages/MyParcelsPage.jsx#L2,L24,L51,L83](file:///c:/Users/user/Desktop/Parcel%20Trail/client/src/pages/MyParcelsPage.jsx#L2,L24,L51,L83) |
| **Module 5 (MongoDB)** | NoSQL | [server/models/Parcel.js#L1-L61](file:///c:/Users/user/Desktop/Parcel%20Trail/server/models/Parcel.js#L1-L61) |
| | Shell | [server/mongosh-demo.js#L1-L42](file:///c:/Users/user/Desktop/Parcel%20Trail/server/mongosh-demo.js#L1-L42) |
| | Create database and collection | [server/db.js#L8-L16](file:///c:/Users/user/Desktop/Parcel%20Trail/server/db.js#L8-L16) & [server/models/Parcel.js#L53](file:///c:/Users/user/Desktop/Parcel%20Trail/server/models/Parcel.js#L53) |
| | Insert | [server/routes/parcelRoutes.js#L67](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L67) & [server/seed.js#L26](file:///c:/Users/user/Desktop/Parcel%20Trail/server/seed.js#L26) |
| | Find | [server/routes/parcelRoutes.js#L30](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L30) & [server/utils/findParcel.js#L6-L10](file:///c:/Users/user/Desktop/Parcel%20Trail/server/utils/findParcel.js#L6-L10) |
| | Update | [server/routes/parcelActionRoutes.js#L24,L60](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelActionRoutes.js#L24,L60) & [server/routes/parcelRoutes.js#L50](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L50) |
| | Delete | [server/routes/parcelRoutes.js#L81](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L81) & [server/seed.js#L15](file:///c:/Users/user/Desktop/Parcel%20Trail/server/seed.js#L15) |
| | Query operators | [server/routes/parcelRoutes.js#L18-L28](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L18-L28) ($regex, $or, $in), [server/routes/otherRoutes.js#L12-L14](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/otherRoutes.js#L12-L14) ($gt), [server/utils/parcelQuery.js#L23-L27](file:///c:/Users/user/Desktop/Parcel%20Trail/server/utils/parcelQuery.js#L23-L27) ($gte, $lte) |
| | Projections | [server/routes/parcelRoutes.js#L30-L33](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L30-L33) & [server/routes/otherRoutes.js#L22](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/otherRoutes.js#L22) |
| **Module 6 (Node.js, Express, Mongoose)** | Node.js intro | [server/demo/node-basics-demo.js#L1-L12](file:///c:/Users/user/Desktop/Parcel%20Trail/server/demo/node-basics-demo.js#L1-L12) |
| | Event loop | [server/demo/node-basics-demo.js#L13-L25](file:///c:/Users/user/Desktop/Parcel%20Trail/server/demo/node-basics-demo.js#L13-L25) |
| | Async code | [server/routes/parcelRoutes.js#L10-L36](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L10-L36) & [server/demo/node-basics-demo.js#L35-L45](file:///c:/Users/user/Desktop/Parcel%20Trail/server/demo/node-basics-demo.js#L35-L45) |
| | Callbacks | [server/middleware/activityLogger.js#L32-L35](file:///c:/Users/user/Desktop/Parcel%20Trail/server/middleware/activityLogger.js#L32-L35) & [server/demo/node-basics-demo.js#L29-L33](file:///c:/Users/user/Desktop/Parcel%20Trail/server/demo/node-basics-demo.js#L29-L33) |
| | Modules | [server/server.js#L2-L10](file:///c:/Users/user/Desktop/Parcel%20Trail/server/server.js#L2-L10) & [server/rules/parcelRules.js#L1-L70](file:///c:/Users/user/Desktop/Parcel%20Trail/server/rules/parcelRules.js#L1-L70) |
| | File system | [server/middleware/activityLogger.js#L9-L17,L32-L35](file:///c:/Users/user/Desktop/Parcel%20Trail/server/middleware/activityLogger.js#L9-L17,L32-L35) & [server/demo/node-basics-demo.js#L26-L45](file:///c:/Users/user/Desktop/Parcel%20Trail/server/demo/node-basics-demo.js#L26-L45) |
| | Web programming | [server/demo/node-basics-demo.js#L47-L60](file:///c:/Users/user/Desktop/Parcel%20Trail/server/demo/node-basics-demo.js#L47-L60) |
| | Express | [server/server.js#L1-L51](file:///c:/Users/user/Desktop/Parcel%20Trail/server/server.js#L1-L51) |
| | Create APIs | [server/routes/parcelRoutes.js#L1-L92](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L1-L92) & [server/routes/recordsRoutes.js#L1-L100](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/recordsRoutes.js#L1-L100) |
| | Mongoose | [server/db.js#L8-L16](file:///c:/Users/user/Desktop/Parcel%20Trail/server/db.js#L8-L16) & [server/models/Parcel.js#L29-L53](file:///c:/Users/user/Desktop/Parcel%20Trail/server/models/Parcel.js#L29-L53) |
| | Exception handling | [server/middleware/errorHandler.js#L3-L17](file:///c:/Users/user/Desktop/Parcel%20Trail/server/middleware/errorHandler.js#L3-L17) & [server/server.js#L40-L42](file:///c:/Users/user/Desktop/Parcel%20Trail/server/server.js#L40-L42) |

---

## 4. MongoDB Operations Used in the Application

The running application itself uses each of the following Module 5 database operations:

| Operation / Feature | Description | File | Line Range |
|---|---|---|---|
| **Create Database** | Connects to `parcelTrail` database | `server/db.js` | [db.js#L8-L16](file:///c:/Users/user/Desktop/Parcel%20Trail/server/db.js#L8-L16) |
| **Create Collection** | Defines `parcels`, `pickuppoints`, `mailboxes` | `server/models/Parcel.js` | [Parcel.js#L29-L53](file:///c:/Users/user/Desktop/Parcel%20Trail/server/models/Parcel.js#L29-L53) |
| **Insert (`insertOne` / `save`)** | Adds a newly expected parcel via POST `/api/parcels` | `server/routes/parcelRoutes.js` | [parcelRoutes.js#L67](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L67) |
| **Insert Many (`insertMany`)** | Seeds default parcels from JSON | `server/seed.js` | [seed.js#L26](file:///c:/Users/user/Desktop/Parcel%20Trail/server/seed.js#L26) |
| **Find with Projection** | Retrieves parcel summary list (excludes `events`, `pickupPass`) | `server/routes/parcelRoutes.js` | [parcelRoutes.js#L30-L33](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L30-L33) |
| **Find One (`findOne`)** | Fetches complete parcel document by ID | `server/utils/findParcel.js` | [findParcel.js#L6-L10](file:///c:/Users/user/Desktop/Parcel%20Trail/server/utils/findParcel.js#L6-L10) |
| **Query Operator: `$regex` & `$or`** | Case-insensitive search by item, sender, or tracking ID | `server/routes/parcelRoutes.js` | [parcelRoutes.js#L18-L24](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L18-L24) |
| **Query Operator: `$in`** | Status filtering (e.g. `status=Expected,Deposited`) | `server/routes/parcelRoutes.js` | [parcelRoutes.js#L26-L28](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L26-L28) |
| **Query Operator: `$gt`** | Counts active valid passes where attempts > 0 and expiry > now | `server/routes/otherRoutes.js` | [otherRoutes.js#L12-L14](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/otherRoutes.js#L12-L14) |
| **Update: `updateOne` with `$set` & `$push`** | Updates status/location and appends new custody events | `server/routes/parcelActionRoutes.js` | [parcelActionRoutes.js#L24](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelActionRoutes.js#L24) |
| **Update: `updateOne` with `$inc`** | Decrements remaining pass attempts upon incorrect passcode | `server/routes/parcelActionRoutes.js` | [parcelActionRoutes.js#L60](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelActionRoutes.js#L60) |
| **Delete: `deleteOne`** | Deletes a single collected parcel record | `server/routes/parcelRoutes.js` | [parcelRoutes.js#L81](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L81) |
| **Delete: `deleteMany`** | Wipes collections during database reset and reseeding | `server/seed.js` | [seed.js#L15](file:///c:/Users/user/Desktop/Parcel%20Trail/server/seed.js#L15) |
| **Count Documents (`countDocuments`)** | Totals and stats filtering | `server/routes/recordsRoutes.js` | [recordsRoutes.js#L15-L22](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/recordsRoutes.js#L15-L22) |
| **Sort, Skip & Limit (Pagination)** | Paginated parcel records and activity | `server/routes/recordsRoutes.js` | [recordsRoutes.js#L47-L52](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/recordsRoutes.js#L47-L52) |
| **Query Operators: `$gte` & `$lte`** | Date range filtering for parcels | `server/utils/parcelQuery.js` | [parcelQuery.js#L23-L27](file:///c:/Users/user/Desktop/Parcel%20Trail/server/utils/parcelQuery.js#L23-L27) |
| **Update: `updateOne` with `$set`** | Inline editing of parcel details & pass cancel | `server/routes/parcelRoutes.js` | [parcelRoutes.js#L50](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/parcelRoutes.js#L50) |
| **Find with Field Projection & Sort** | Projects events and sorts newest first for notifications | `server/routes/otherRoutes.js` | [otherRoutes.js#L22-L42](file:///c:/Users/user/Desktop/Parcel%20Trail/server/routes/otherRoutes.js#L22-L42) |

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns server status and MongoDB connection state |
| `GET` | `/api/parcels` | List parcels with `$regex` search, `$in` status filter, and projection |
| `POST` | `/api/parcels` | Register a new expected parcel |
| `POST` | `/api/parcels/reset` | Reseed MongoDB collections to initial demo dataset |
| `GET` | `/api/parcels/:id` | Full document details of a single parcel |
| `PUT` | `/api/parcels/:id` | Edit parcel item description, sender, tracking, or date |
| `DELETE` | `/api/parcels/:id` | Delete a collected parcel record |
| `POST` | `/api/parcels/:id/simulate` | Simulate ultrasonic drop, lock, camera snapshot, or tamper |
| `POST` | `/api/parcels/:id/pass/issue` | Issue a temporary 6-digit pickup passcode |
| `POST` | `/api/parcels/:id/pass/verify` | Verify 6-digit passcode against keypad (3-try limit) |
| `DELETE` | `/api/parcels/:id/pass` | Cancel an active pickup pass |
| `POST` | `/api/parcels/:id/redirect` | Redirect parcel to another pickup spot |
| `POST` | `/api/parcels/:id/report` | Record a damage, missing, or tamper report |
| `GET` | `/api/passes/active` | Count active unexpired pickup passes |
| `GET` | `/api/records/stats` | Summary statistics for management cards |
| `GET` | `/api/records/parcels` | Paginated parcel records table with sort and filter |
| `GET` | `/api/records/incidents` | Incident management records with open/resolved status |
| `POST` | `/api/records/resolve` | Resolve an open incident with a resident note |
| `GET` | `/api/records/passes` | Complete pickup pass lifecycle records |
| `GET` | `/api/records/activity` | Paginated chronological custody event audit trail |
| `GET` | `/api/track/:trackingNumber` | Public tracking lookup by tracking number (case-insensitive) |
| `GET` | `/api/pickup-points` | List available pickup locker locations |
| `GET` | `/api/mailbox/flash` | Retrieve camera flash LED status |
| `POST` | `/api/mailbox/flash` | Toggle camera flash LED status |
| `GET` | `/api/notifications` | Return last 5 custody events sorted newest first |

---

## 6. How to Run the Application

### Step 1: Start the Backend (Terminal 1)
```bash
cd server
npm install
npm run dev      # Starts Express on http://localhost:5000 with node --watch
```

### Step 2: Start the Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```
Open **http://localhost:3000/** in your browser. All `/api` calls are automatically proxied to `http://localhost:5000`.

### Step 3: Run Automated Tests
```bash
# Server tests (Unit, API, Records API, Track API - 46 tests)
npm --prefix server test

# Client UI helper unit tests (13 tests)
npm --prefix client test

# Optional Playwright Edge browser E2E test suite (12 tests + screenshots)
node client/tests/e2e.js
```

### Step 4: Run Node Basics Syllabus Demo
```bash
node server/demo/node-basics-demo.js
```

### Step 5: Inspect Data in MongoDB
```bash
node server/tools/show-data.js
```

---

## 7. Test with Postman

A complete Postman Collection is provided in `postman/ParcelTrail.postman_collection.json` (v2.1 format) covering all 24 API endpoints with automated status check tests.

### How to use:
1. Open the Postman application.
2. Click **File -> Import** and select `postman/ParcelTrail.postman_collection.json`.
3. Check the collection variables:
   - `baseUrl`: default is `http://localhost:5000` (change to your deployed Render URL when testing online).
   - `parcelId`: default is `PRCL-101`.
4. Run individual requests or use **Run collection** to run the complete automated test suite across all folders: `Parcels`, `Pickup code`, `Records`, `Track`, and `Other`.
5. *(Note: Postman itself is an external GUI desktop tool and cannot be run inside this terminal environment; the collection file has been validated with Node.js).*

---

## 8. Deploy (Production Deployment Guide)

This application can be deployed using standard production cloud services: **MongoDB Atlas** (Database) + **Render** (Node/Express API) + **Vercel** (React Client).

### Step 1: MongoDB Atlas Database
1. Create a free shared cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write privileges.
3. In Network Access, allow access from anywhere (`0.0.0.0/0`).
4. Copy your connection string (e.g. `mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/parcelTrail`).

### Step 2: Render Web Service (Backend)
1. Create a new **Web Service** on [render.com](https://render.com) connected to your repository.
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add an Environment Variable:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string.
6. Copy your public service URL (e.g. `https://parceltrail-api.onrender.com`).

### Step 3: Configure Frontend API Proxy
In `client/vercel.json`, replace `YOUR-RENDER-NAME.onrender.com` with your real Render URL:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-RENDER-NAME.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
**Explanation of the two rewrites:**
- The first rule forwards all browser API calls starting with `/api/` directly to your Render backend server.
- The second rule redirects all client-side navigation paths (such as `/my-parcels` and `/records`) to `/index.html` so that refreshing the page works seamlessly with React Router, while still allowing static files like `help.html` and `track.html` to be served directly.

### Step 4: Vercel Frontend
1. Import your repository on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Deploy!

### Step 5: Seed Demo Data
Once deployed, open your Vercel URL, navigate to **My parcels**, and click the **Reset demo data** button once to populate your empty Atlas database with the 12 sample parcels.

> **Production Notes:**
> - Free Render instances spin down after ~15 minutes of inactivity; the very first request may take a few seconds to wake the service.
> - The native `mongosh` terminal utility is not available on the cloud deployment.
