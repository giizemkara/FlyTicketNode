# ✈️ FlyTicket - Full Stack Flight Booking System

Welcome to **FlyTicket**, a comprehensive, production-ready Full Stack Monolithic Web Application built for the **CENG-3502: Dynamic Web Programming** Final Assignment. This system delivers an end-to-end flight search, ticket booking, and administration ecosystem tailored for airline operations within the 81 cities of Türkiye.

---

## 🏗️ Architecture & Technology Stack

The project utilizes a **Monolithic Architecture** where both the Frontend presentation layer and Backend business logic coexist harmoniously inside a single repository, making deployment and orchestration straightforward.

### 🌟 Frontend (Client Side)
- **Language:** Pure Vanilla JavaScript (ECMAScript 6+) — *No heavy external frameworks (React/Vue), ensuring maximum performance and zero build-overhead.*
- **UI/UX Design:** Custom **Glassmorphism Design** built with clean HTML5 & responsive CSS3 variables. Includes real-time layout alignment and smooth transition parameters.
- **Form Controls:** Native input regex validation patterns preventing illegal format insertion (e.g., non-numeric blocks in credit card fields, extreme number bounds in pricing).
- **Interactive Modals:** Incorporated **SweetAlert2** for elegant, asynchronous user notifications, success feedback loops, and error dispatches.

### ⚙️ Backend (Server Side)
- **Runtime Environment:** Node.js
- **Framework:** Express.js (RESTful API Design implementation)
- **Database Layer:** MongoDB Atlas / Local using **Mongoose ODM** (Object Document Mapping) for schema schema definitions and validation mechanics.
- **Security Protocols:**
  - Password encryption using **Bcrypt** (salted hashing algorithm).
  - Environment isolation via **dotenv** config.
- **Automated Communication:** **Nodemailer** integration for processing SMTP protocols to send dynamically generated automated E-Tickets straight to passenger emails.

---

## 🚀 Key Feature Modules

### 👤 1. Customer Interface (User Side)
- **Dynamic Flight Search:** Query engine allowing filtering by Origin City, Destination City, and Departure Date.
- **Real-time Seating Allocation:** Live seat count deduction (`seats_available -= 1`) upon ticket issuance.
- **Secure Payment Simulation:** Interactive checkout layout running client-side format checkers to replicate institutional payment gateway flows safely without exposing private financial telemetry.
- **Digital Boarding Pass Engine:** Automated client-side creation allowing immediate digital card generation and local E-Ticket storage/download.
- **Automated SMTP Notification:** Forwards confirmation emails containing ticket ID, route configurations, and seat allocations.

### 🔐 2. Control Panel (Admin Side)
- **Hashed Authentication Shield:** Access protected via login verification backed by Mongoose query controls analyzing encrypted password models.
- **Flight Lifecycle Orchestration (CRUD):** Complete control interface enabling authorized administrators to:
  - **Create:** Dispatch new flight itineraries directly into MongoDB.
  - **Read:** Comprehensive tabular data feeds indexing current operational schedules, operational capacities, and ticket distributions.
  - **Update:** Real-time revision grids modifying dates, pricing structures, or availability indicators.
  - **Delete:** Drop scheduled flights instantly with direct database synchronization.

---

## 🎯 Hardcoded Business & Flight Rules
The backend validation pipeline strictly enforces systemic structural patterns defined in the official project specification sheet:
1. **Regional Footprint:** Fully seeds and supports all **81 official cities of Türkiye**.
2. **Departure Hourly Constraint:** No two flights originating from the exact same city are permitted to depart within the same hour window.
3. **Arrival Collision Safeguard:** No two flights heading towards the exact same destination are permitted to touch down at the identical arrival timestamp.
4. **Capacity Controls:** Implements zero-capacity ceilings; ticket checkouts automatically freeze when `seats_available` evaluates to `0`.

---

## 📁 Repository Directory Breakdown

```text
FlyTicketNode/
│
├── config/                  # Database connections & environment initializers
├── models/                  # Mongoose Schemas (Admin, City, Flight, Ticket, User)
├── routes/                  # Express Router Modules (API Endpoints structure)
├── public/                  # Frontend assets (HTML pages, CSS files, main.js)
│   ├── admin.html           # Authorized Admin panel workspace
│   ├── index.html           # Main Passenger search and checkout platform
│   ├── main.js              # Core UI manipulation, asynchronous Fetch operations
│   └── style.css            # Professional Glassmorphism presentation code
│
├── db_backup/               # Crucial MongoDB complete collection JSON exports
│   ├── admins.json          # Encrypted master credentials collection
│   ├── cities.json          # Comprehensive 81 Turkish cities collection
│   ├── flights.json         # Active testing flight schedules
│   ├── tickets.json         # Active issued ticketing logs
│   └── users.json           # Simulated application user profiles
│
├── .env.example             # Safe template mapping environment variables
├── .gitignore               # Critical security shield preventing credential leaks
├── package.json             # Core NPM manifest indexing libraries
├── seedFlights.js           # Automated script for initializing database states
└── server.js / app.js       # Main runtime core powering the web framework
```

---

## 🛠️ Installation & Deployment Manual

Follow this execution pipeline to run the complete environment locally on your workstation:

### Step 1: Clone and Prepare Workspace
Open your preferred terminal directory and ensure your workspace dependencies are fully fetched:
```bash
npm install
```

### Step 2: Establish Your Environment Security Mask
1. Create a file named `.env` in the absolute root folder (duplicate `.env.example`).
2. Supply your local or cloud MongoDB connection strings along with your secure email app token keys:
```env
MONGODB_URI=
EMAIL_USER=
EMAIL_PASS=
```
*(Note: Ensure `.env` remains locked inside your `.gitignore` rules to prevent remote security exposures).*

### Step 3: Seed Core Collections
To dynamically inject the entire index of 81 Turkish cities alongside baseline test flights into your database instance, fire up the seeder routine:
```bash
node seedFlights.js
```

### Step 4: Fire Up the Engine
Execute the main script to start your backend Express server listening to network inputs:
```bash
npm start
```
The application will boot up at **`http://localhost:3000`**.

---

## 📊 Documented API Endpoints Map

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/flights` | Public | Fetches complete index of current scheduled flights |
| **GET** | `/api/flights/search` | Public | Parametric query route filtering flights by from/to/date |
| **POST** | `/api/tickets` | Public | Issues ticket transactions, reduces seat count, fires Nodemailer |
| **GET** | `/api/tickets/:email` | Public | Pulls complete transactional ticket arrays for a unique user email |
| **POST** | `/api/admin/login` | Public | Validates admin credential models via Bcrypt comparison matrices |
| **POST** | `/api/flights` | Admin Only | Enforces flight creation business rules and creates a flight instance |
| **PUT** | `/api/flights/:id` | Admin Only | Updates a flight record specified by its MongoDB ObjectId |
| **DELETE**| `/api/flights/:id` | Admin Only | Purges a specific flight instance across application indexes |

---

## 🔐 Master Administration Access Credentials
To access the Admin Panel (`http://localhost:3000/admin.html`) without re-seeding custom user documents:
- **Username:** `admin`
- **Password:** `admin123`

*All database backups and active schemas are fully loaded under the `db_backup/` subdirectory to guarantee immediate grading compliance for the academic review jury.*

---
### ✈️ *Let's Fly High with FlyTicket! Good Luck!*