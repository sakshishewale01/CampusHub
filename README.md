# CampusHub 3.0 — Complete MERN Stack Project

A modern, responsive, full-stack college event management web application built using the complete **MERN Stack** (**M**ongoDB Atlas, **E**xpress.js, **R**eact.js, and **N**ode.js).

Designed for the **Web Technology Laboratory (Third Year Computer Engineering)**, CampusHub enables students to discover campus events, register in real-time, view remaining seat capacities, and manage their participation, while providing college administrators with a dedicated control panel to create, edit, and supervise events and student registrations.

---

## 1. Project Overview

- **Project Title:** CampusHub (Version 3.0 — MERN Stack Edition)
- **Course:** Web Technology Laboratory
- **Author:** Sakshi Shewale (Computer Engineering, 3rd Year)
- **Domain:** Web Application / Campus Event Management
- **Architecture:** Client-Server MERN Architecture (React Single-Page Application + Node.js/Express.js Backend REST API + MongoDB Atlas Cloud Database)

CampusHub unifies technical fests, cultural nights, sports tournaments, and academic workshops organized across different campus departments into a centralized, interactive portal.

---

## 2. Problem Statement and Objectives

### Problem Statement
In universities and colleges:
1. Event notices are scattered across departmental bulletin boards, unorganized WhatsApp groups, posters, and social media.
2. Students frequently miss deadlines or don't know remaining seat availability.
3. Event coordinators rely on error-prone paper forms or loose Google Forms that allow duplicate entries and lack capacity enforcement.
4. There is no unified, role-based platform separating student participants from administrative organizers.

### Project Objectives
1. **Unified Platform:** Bring all campus events into one centralized, interactive platform.
2. **Role-Based Access Control (RBAC):** Separate permissions and views for **Student** participants and **Admin** coordinators.
3. **True Cloud Persistence:** Store all users, events, and registrations in **MongoDB Atlas** using Mongoose schemas and relationships.
4. **Dynamic Frontend with React:** Provide an interactive Single Page Application (SPA) with fast client-side navigation using React and Vite.
5. **Robust Server-Side Security:** Enforce server-side validation, password hashing with `bcryptjs`, and secure server-side sessions with `express-session` and `connect-mongo`.
6. **Deployment-Ready:** Single-command production build and deployment compatibility on cloud hosting platforms like **Render**.

---

## 3. Why CampusHub Uses the MERN Stack

| Technology | Role | Why It Was Chosen |
|---|---|---|
| **M — MongoDB Atlas** | Cloud Database | Flexible JSON-like document storage with Mongoose ODM; supports document references (`ObjectId`), indexes, and cloud hosting. |
| **E — Express.js** | Backend Web Framework | Lightweight, modular routing for REST API endpoints and middleware-based security (`authMiddleware`). |
| **R — React.js** | Interactive Frontend | Component-based UI, declarative state management (`useState`, `useEffect`), and instant client-side routing (`react-router-dom`). |
| **N — Node.js** | JavaScript Runtime | Unified JavaScript environment for both frontend and backend development with extensive npm ecosystem support. |

---

## 4. Architecture and Data Flow

```text
[ Browser (React SPA) ]
         │
         │  1. HTTP Requests (fetch with credentials: 'include')
         ▼
[ Express.js Web Server (Node.js) ]
         │
         │  2. Middlewares: CORS, express-session (connect-mongo), authMiddleware
         ▼
[ REST API Routes (/api/auth, /api/events, /api/registrations, /api/admin) ]
         │
         │  3. Business Logic, Validation, and Password Hashing (bcryptjs)
         ▼
[ Mongoose ODM (Models: User, Event, Registration) ]
         │
         │  4. Database Queries (find, create, findByIdAndUpdate)
         ▼
[ MongoDB Atlas (Cloud Database Cluster) ]
```

### Request Lifecycle Example (Student Registering for an Event):
1. **React Component:** Student clicks "Register Now" in `EventModal.jsx`.
2. **API Call:** React sends `POST /api/registrations` with `{ eventId }` and session cookie.
3. **Auth Middleware:** `requireStudent` middleware checks session cookie and verifies `user.role === 'student'`.
4. **Capacity & Duplicate Verification:**
   - Server checks if student already has a `Confirmed` registration in MongoDB (`Registration.findOne`).
   - Server counts confirmed registrations against event capacity.
5. **Database Write:** Server creates a new `Registration` document in MongoDB Atlas referencing the student and event.
6. **Response:** Server returns `201 Created` with confirmation details.
7. **React Update:** React catches response, displays a success toast, and refreshes seat counts across the UI.

---

## 5. Project Folder Structure

```text
CampusHub/
│
├── client/                     # Frontend: React + Vite Single Page Application
│   ├── public/                 # Static assets (images, icons)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Role-aware navigation with user badges
│   │   │   ├── Footer.jsx      # Reusable footer
│   │   │   ├── ProtectedRoute.jsx # Client-side route guard (Student / Admin)
│   │   │   └── EventModal.jsx  # Event details modal with 1-click booking
│   │   ├── pages/              # Main page views
│   │   │   ├── Home.jsx        # Landing page (hero, highlights, categories)
│   │   │   ├── Events.jsx      # Dynamic catalog (search, filter, sort)
│   │   │   ├── About.jsx       # Mission, purpose, 4-step workflow
│   │   │   ├── Login.jsx       # Auth form with quick-fill demo buttons
│   │   │   ├── Register.jsx    # Student account registration form
│   │   │   ├── StudentDashboard.jsx # Student portal (my events, cancel, profile)
│   │   │   └── AdminDashboard.jsx   # Admin panel (event CRUD, registrations)
│   │   ├── services/
│   │   │   └── api.js          # Fetch API service wrapper with credentials
│   │   ├── styles/
│   │   │   └── style.css       # Preserved design tokens, cards, and animations
│   │   ├── App.jsx             # Root React component and routing setup
│   │   ├── index.css           # Global stylesheet imported into React
│   │   └── main.jsx            # React root DOM entry point
│   ├── package.json            # Client dependencies (React, react-router-dom, Vite)
│   └── vite.config.js          # Vite config with /api development proxy
│
├── server/                     # Backend: Node.js + Express + MongoDB
│   ├── config/
│   │   └── db.js               # Mongoose connection & initial seed logic
│   ├── models/                 # Mongoose Data Models
│   │   ├── User.js             # Student and Admin schema (bcrypt hashes)
│   │   ├── Event.js            # Campus event schema with capacity
│   │   └── Registration.js     # Event booking schema with User & Event refs
│   ├── routes/                 # Express REST API Route Handlers
│   │   ├── authRoutes.js       # Register, login, logout, me, profile
│   │   ├── eventRoutes.js      # Public event catalog with live seat math
│   │   ├── registrationRoutes.js # Event bookings, cancellations, student stats
│   │   └── adminRoutes.js      # Event CRUD, registrations table, admin stats
│   ├── middleware/
│   │   └── authMiddleware.js   # requireAuth, requireStudent, requireAdmin
│   └── server.js               # Express application entry & React static serving
│
├── tests/
│   └── mern_test_suite.js      # Automated test suite (45 verification checks)
│
├── .env.example                # Template for environment configuration
├── .env                        # Local environment variables (ignored by Git)
├── .gitignore                  # Git ignore rules for node_modules, build, .env
├── package.json                # Root scripts (build, start, server, client, test)
└── README.md                   # Comprehensive documentation and viva preparation
```

---

## 6. MongoDB Collections and Fields

### 1. `users` Collection (`models/User.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique document identifier |
| `name` | String | Required, Trim | Student or Admin's full name |
| `email` | String | Required, Unique, Lowercase | Normalized login email address |
| `collegeId` | String | Required, Trim | College registration number (e.g., `CS2026045`) |
| `yearOfStudy` | String | Enum | `1st Year`, `2nd Year`, `3rd Year`, `4th Year`, etc. |
| `password` | String | Required, Min 8 | `bcryptjs` salted password hash |
| `role` | String | Enum (`student`, `admin`) | Access control role (defaults to `student`) |
| `createdAt` | Date | Auto Timestamp | Account creation date |

### 2. `events` Collection (`models/Event.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique event identifier |
| `title` | String | Required, Trim | Event title (e.g., *Code Sprint Hackathon*) |
| `description` | String | Required | Event overview and rules |
| `category` | String | Enum | `Technical`, `Cultural`, `Sports`, `Workshop` |
| `date` | String | Required | Event date (e.g., `2026-09-12`) |
| `time` | String | Default `10:00 AM` | Event timing schedule |
| `venue` | String | Required | Physical campus location (e.g., *CS Block Lab 3*) |
| `capacity` | Number | Required, Min 1 | Total available participant seats |
| `status` | String | Enum | `Upcoming`, `Registration Closed`, `Completed` |
| `image` | String | URL | Event banner photo |

### 3. `registrations` Collection (`models/Registration.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique registration record ID |
| `student` | ObjectId | Ref `User` | Reference to the registered Student |
| `event` | ObjectId | Ref `Event` | Reference to the campus Event |
| `status` | String | Enum | `Confirmed` or `Cancelled` |
| `registeredAt` | String | Formatted Date | Date of registration |
| `cancelledAt` | Date | Optional | Cancellation timestamp |

---

## 7. How to Install and Run the Project in VS Code

### Step 1: Open Project in VS Code
Open the `CampusHub` folder in VS Code.

### Step 2: Install Dependencies
Open the terminal (`Ctrl + ~`) and run:
```bash
npm install
npm --prefix client install
```

### Step 3: Configure `.env` File
Create a `.env` file in the root folder:
```bash
cp .env.example .env
```
Add your MongoDB Atlas connection string (see Section 8 below).

### Step 4: Run the Application
You can run the full application in production or development mode:

**Production Mode (Single Express Server serving React build):**
```bash
npm run build
npm start
```
Visit `http://localhost:3000` in your browser.

**Development Mode (Vite Hot-Reloading + Express API):**
- Terminal 1 (Backend): `npm run server` (runs on `http://localhost:3000`)
- Terminal 2 (Frontend): `npm run client` (runs on `http://localhost:5173`)
Vite automatically proxies all `/api/*` calls to the Express backend!

---

## 8. How to Configure MongoDB Atlas

1. **Create an Account:** Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and register for a free account.
2. **Create a Free Cluster:** Select **M0 Free Tier** (AWS or Google Cloud provider) and click **Create Cluster**.
3. **Create Database User:**
   - In **Database Access**, click **Add New Database User**.
   - Set Authentication Method to **Password**.
   - Choose a username (e.g., `campushub_user`) and a secure password.
   - Set user privileges to **Read and write to any database**.
4. **Configure Network Access (IP Whitelist):**
   - In **Network Access**, click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) so that local testing and cloud deployments (like Render) can connect.
5. **Get Connection String:**
   - In **Database Deployments**, click **Connect** on your cluster.
   - Choose **Drivers** -> Driver: **Node.js**.
   - Copy the connection string. It will look like:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/campushub?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Paste this into your `.env` file as `MONGODB_URI`.

---

## 9. Environment Variable Setup

The `.env` file in the root directory holds all private secrets:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/campushub?retryWrites=true&w=majority
SESSION_SECRET=campushub_super_secret_session_key_2026
ADMIN_NAME=Campus Administrator
ADMIN_EMAIL=admin@campushub.edu
ADMIN_PASSWORD=Admin@12345
```

---

## 10. Initial Accounts & Demonstration Credentials

On initial startup, `server/config/db.js` automatically creates initial accounts and seeds default events:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@campushub.edu` | `Admin@12345` | Full event CRUD, student registrations review, admin panel |
| **Demo Student** | `sakshi@campushub.edu` | `Student@123` | Event browsing, booking, student dashboard, profile editing |

> **Evaluation Shortcut:** On the Login page (`/login`), click the **"Student Demo"** or **"Admin Demo"** buttons to auto-fill credentials instantly!

---

## 11. Student and Administrator Features

### Student Features
- Create account (`/register`) with full name, college ID, email, and study year.
- Login and logout with session cookies.
- Browse and live-search campus events (`/events`).
- Filter by category (*Technical*, *Cultural*, *Sports*, *Workshops*) and sort by date or name.
- View real-time available seat counts (`15 seats left` or `Full`).
- One-click register via modal dialog.
- Student Dashboard (`/dashboard`):
  - View list of registered events with status badges (`Confirmed`, `Cancelled`).
  - Cancel registrations self-service (restores the available seat for others).
  - Update student profile (Name, College ID, Year of Study).

### Administrator Features
- Preconfigured administrator authentication.
- Admin Control Center (`/admin`):
  - View overview metrics: Total Events, Upcoming Events, Total Registrations, Registered Students.
  - **Event Management (CRUD):**
    - Add new events with date, time, venue, capacity, and banner photo.
    - Edit existing event details or change status (`Upcoming`, `Registration Closed`, `Completed`).
    - Delete events with confirmation (automatically cancels linked registrations).
  - **Registration Supervision:**
    - Live-search all registrations by student name, email, or college ID.
    - Filter registrations by specific event.
    - Remove/cancel registrations.

---

## 12. API Endpoint Summary

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/auth/me` | Public | Returns current session user or `null` |
| `POST` | `/api/auth/register` | Public | Registers a new student account (bcrypt hashed) |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and starts session |
| `POST` | `/api/auth/logout` | Public | Destroys current session and clears cookie |
| `PUT` | `/api/auth/profile` | Student | Updates student name, college ID, study year |

### Event Routes (`/api/events`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/events` | Public | Returns events with category, search, and available seats |
| `GET` | `/api/events/:id` | Public | Returns single event details with computed seats |

### Student Registration Routes (`/api/registrations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/registrations` | Student | Registers student for an event (enforces capacity & duplicates) |
| `GET` | `/api/registrations/my` | Student | Returns authenticated student's registrations |
| `POST` | `/api/registrations/:id/cancel`| Student | Cancels registration and restores event seat count |
| `GET` | `/api/student/stats` | Student | Returns student dashboard metric counts |

### Administrator Routes (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Statistical metrics for Admin Dashboard |
| `GET` | `/api/admin/registrations` | Admin | View all student registrations with search & filter |
| `DELETE` | `/api/admin/registrations/:id`| Admin | Removes a student registration |
| `POST` | `/api/admin/events` | Admin | Creates a new campus event |
| `PUT` | `/api/admin/events/:id` | Admin | Updates an existing campus event |
| `DELETE` | `/api/admin/events/:id` | Admin | Deletes a campus event |

---

## 13. Client-Side vs Server-Side Validation

| Validation Rule | Client-Side (React Form) | Server-Side (Express & Mongoose) |
|---|---|---|
| **Full Name** | Checks non-empty, min 2 chars | Enforced via `User` schema `minlength: 2` |
| **Email Address** | Regex format check in browser | Enforced via `User` schema regex + duplicate email check in MongoDB |
| **College ID** | Checked on input | Enforced as required string |
| **Password** | Checked min 8 chars & matching confirmation | Checked $\ge 8$ chars before `bcrypt.hash()` |
| **Capacity** | Checked $> 0$ in form | Enforced in `Event` schema `min: 1` |
| **Duplicate Event Booking** | Handled via UI button state | Authoritative check in `Registration` collection (`findOne`) |
| **Overbooking Guard** | Disables button when seats = 0 | Calculated from confirmed registrations; rejects booking if full |

---

## 14. Password Hashing and Session Authentication

1. **Password Hashing:**
   - Built using `bcryptjs`.
   - On registration or seeding:
     ```javascript
     const passwordHash = await bcrypt.hash(password, 10);
     ```
   - On login:
     ```javascript
     const isMatch = await bcrypt.compare(password, user.password);
     ```
   - Plaintext passwords are never stored in the database.
2. **Session Authentication:**
   - Managed via `express-session` with `connect-mongo`.
   - The browser receives an encrypted HTTP-only cookie (`campushub.sid`):
     - `httpOnly: true`: Prevents malicious JavaScript from reading the session cookie (anti-XSS).
     - `sameSite: 'lax'`: Protects against Cross-Site Request Forgery (CSRF).
     - `req.session.regenerate()`: Invoked on login to prevent Session Fixation attacks.
     - `req.session.destroy()`: Destroys session upon logout.

---

## 15. How React Communicates with Express & MongoDB

1. **React Component:** A student clicks "Register" in `Events.jsx`.
2. **Service Layer (`services/api.js`):** Executes `fetch('/api/registrations', { method: 'POST', credentials: 'include', body: ... })`.
3. **Vite Proxy (Dev) / Express Static (Prod):** The request reaches Express on `/api/registrations`.
4. **Express Middleware:** Checks session cookie using `requireStudent`.
5. **Mongoose Controller:** Executes queries against MongoDB Atlas:
   ```javascript
   const existing = await Registration.findOne({ student: studentId, event: eventId, status: 'Confirmed' });
   ```
6. **MongoDB Response:** MongoDB Atlas returns document results to Mongoose.
7. **JSON Response:** Express responds with `{ success: true, message: 'Successfully registered!' }`.
8. **React State Update:** The component triggers a state update (`useState`), showing a toast and updating the seat count without a full page refresh.

---

## 16. Deployment on Render

CampusHub 3.0 is deployment-ready as a single web service on **Render**:

### Deployment Steps:
1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy CampusHub 3.0 MERN stack application"
   git push origin main
   ```
2. On Render Dashboard ([render.com](https://render.com)):
   - Click **New** -> **Web Service**.
   - Connect your GitHub repository.
   - **Environment:** Node
   - **Build Command:** `npm run build` *(installs client dependencies and compiles React)*
   - **Start Command:** `npm start` *(starts the production Express server)*
3. **Environment Variables:**
   Add these in the Render environment tab:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `SESSION_SECRET`: A long random string
   - `ADMIN_EMAIL`: `admin@campushub.edu`
   - `ADMIN_PASSWORD`: A secure password

---

## 17. Test Results (45 of 45 Checks Passed)

CampusHub includes an automated verification suite (`tests/mern_test_suite.js`) validating all components of the MERN architecture:

```bash
node tests/mern_test_suite.js
```

### Verified Test Summary:
- ✅ **User Model Validation:** Valid student user passes Mongoose validation, emails normalized to lowercase, default role assigned, `toJSON()` strips password hash, invalid emails and missing fields rejected.
- ✅ **Event Model Validation:** Valid event passes Mongoose validation, default status `Upcoming`, negative/zero capacity rejected, invalid category rejected.
- ✅ **Registration Model Validation:** References to User and Event validated, default status `Confirmed`, missing references rejected.
- ✅ **Security Middlewares:** `requireAuth` returns 401 for anonymous requests, `requireStudent` blocks admins, `requireAdmin` blocks students and permits admins.
- ✅ **React Build Artifacts:** Production `client/dist/index.html` and bundled JS/CSS assets verified.
- ✅ **Architecture Files:** All 22 required MERN project files verified.
- **Total: 45 Passed, 0 Failed.**

---

## 18. Short Faculty Demonstration Script

When demonstrating CampusHub 3.0 to your Web Technology faculty:

1. **Introduction (30 seconds):**
   - *"Good morning, Professor. My project is CampusHub 3.0, a complete college event management system built on the MERN stack: MongoDB Atlas for cloud persistence, Express.js for the REST API, React with Vite for the frontend, and Node.js."*
2. **Homepage & Event Discovery (45 seconds):**
   - Show `http://localhost:3000/`. Highlight the preserved visual design and responsive layout.
   - Navigate to `/events`: Demonstrate real-time search typing (*"Hackathon"*), category chips (*Cultural*, *Sports*), and sorting.
   - Point out the **Live Seat Counter Badge** (`X seats left` or `Full`).
3. **Student Registration & Dashboard (60 seconds):**
   - Go to `/register`: Show client-side validation rejecting invalid emails or short passwords.
   - Create a student account. Point out automatic login and redirection to `/dashboard`.
   - Go to Events, open an event modal, and click **"Register Now"**.
   - Return to `/dashboard`: Show the event listed under **My Registered Events**.
   - Click **"Cancel Registration"**: Show that status updates to *Cancelled* and the available seat count on the event increases by 1!
   - Demonstrate updating the student profile (Name, College ID, Year).
4. **Admin Control Center & RBAC Security (45 seconds):**
   - Click **Logout**.
   - Go to `/login`, click **"Admin Demo"**, and log in.
   - Show `/admin`: Real-time metrics counters, Event Management table, and Student Registrations table.
   - Click **"+ Add New Event"**: Create a sample event and verify it appears immediately in the event catalog.
   - Explain Role-Based Access Control: Show that non-admin accounts attempting to access `/admin` or `/api/admin/*` are blocked with `403 Forbidden`.

---

## 19. Common Viva Questions with Simple Answers

**Q1: What is the MERN stack, and what role does each technology play in CampusHub?**
> *Answer:* MERN stands for MongoDB, Express.js, React.js, and Node.js. In CampusHub, **MongoDB Atlas** stores application records in collections, **Express.js** handles routing and server-side validation, **React.js** powers the responsive Single-Page Application interface, and **Node.js** runs the backend server.

**Q2: How does React communicate with Express in your application?**
> *Answer:* React communicates with Express over HTTP using the Fetch API (`client/src/services/api.js`). During development, Vite proxies `/api` calls to Express on port 3000. In production, Express serves the built React bundle from the same origin, sending HTTP-only session cookies with every request.

**Q3: How are passwords stored and secured in MongoDB?**
> *Answer:* Passwords are never stored in plaintext. When a user registers, `bcryptjs` generates a random cryptographic salt and hashes the password with 10 rounds of computation. During login, `bcrypt.compare()` verifies the submitted password against the stored hash.

**Q4: How do you prevent overbooking and duplicate event registrations?**
> *Answer:* On the server, `POST /api/registrations` queries the `Registration` collection. It checks if the student already has an active `Confirmed` booking for that event (preventing duplicates). It also counts confirmed bookings against the event's `capacity` before creating a new registration document.

**Q5: What is the difference between client-side and server-side validation?**
> *Answer:* Client-side validation runs in the browser using React state to provide instant feedback to the user. Server-side validation runs on the Express server via Mongoose schemas to guarantee data integrity and security, ensuring that bypassed or direct API calls cannot corrupt the database.

**Q6: What is a Mongoose schema and model?**
> *Answer:* A Mongoose schema defines the structure, data types, required fields, and validation rules of documents in a collection (e.g., `User.js`, `Event.js`). A Mongoose model is a compiled wrapper on the schema providing an interface to query, create, update, and delete documents in MongoDB.
