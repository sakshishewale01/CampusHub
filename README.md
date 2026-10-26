# CampusHub — College Event Management Platform

CampusHub is a full-featured college event management web application.

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

## 📄 File Overview

| File / Folder | Purpose |
|---|---|
| `index.html` | Landing page with navbar, hero section, featured highlights, category cards, statistics, and footer. |
| `events.html` | Events listing page with real-time search, category filter chips, sorting dropdown, live counter, and interactive event details modal. |
| `login.html` | Student login page featuring client-side required field and email format validation with dynamic error/success feedback. |
| `register.html` | Student registration page featuring form inputs, event dropdown, live validation feedback, and stored registrations preview. |
| `about.html` | About page detailing CampusHub's mission, features, and how it works. |
| `css/style.css` | Comprehensive shared stylesheet defining CSS variables (`:root`), Flexbox, CSS Grid layouts, card styles, form styling, modal dialogs, and media queries. |
| `js/events.js` | Client-side JavaScript handling search, category filtering, sorting by date or name, count updates, and modal popup interactions. |
| `js/login.js` | Client-side JavaScript handling login validation. |
| `js/register.js` | Client-side JavaScript handling registration form validation and asynchronous `fetch()` submission to the Node.js backend. |
| `server/server.js` | Node.js HTTP server created using `http.createServer()` without any external frameworks. Handles static file delivery, request body parsing, server-side validation, duplicate email detection, password hashing, and JSON file storage. |
| `server/data/registrations.json` | JSON file storing validated student registration records on the server. |
| `package.json` | Defines project metadata and `npm start` script (`node server/server.js`). |

---

## 🛠️ Software and Technologies Used

- **Frontend:**
  - **HTML5:** Semantic layout tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
  - **CSS3:** Custom properties (`:root`), Flexbox, CSS Grid, smooth transitions, and responsive media queries.
  - **Vanilla JavaScript:** DOM manipulation, event listeners, array methods, JSON parsing/stringification, and the `fetch()` API.
- **Backend (Assignment 3):**
  - **Node.js:** JavaScript runtime environment.
  - **`http` Module (Built-in):** Low-level HTTP server created with `http.createServer()`.
  - **`fs` Module (Built-in):** Synchronous and stream-based file reading/writing for serving static files and updating `registrations.json`.
  - **`path` Module (Built-in):** Path resolution and security checks to prevent directory traversal.
  - **`crypto` Module (Built-in):** PBKDF2 password-based key derivation (`crypto.pbkdf2Sync`) with 16-byte random salts (`crypto.randomBytes`) for secure password hashing.
  - **Zero External Backend Frameworks:** No Express.js, MongoDB, or third-party middleware used.

---

## 💡 Client-Side vs Server-Side Validation: What is the Difference?

| Feature | Client-Side Validation (Browser) | Server-Side Validation (Node.js) |
|---|---|---|
| **Where it runs** | In the user's browser via JavaScript (`js/register.js`). | On the Node.js web server (`server/server.js`). |
| **Purpose** | Instant user feedback; prevents unnecessary network calls and guides user formatting. | Final authority and security; ensures data integrity even if the client is compromised or bypassed. |
| **Can it be bypassed?** | **Yes.** Anyone can disable JavaScript, use Postman, curl, or modify browser memory. | **No.** Every request reaching the API endpoint is independently validated regardless of its origin. |
| **Duplicate check** | Limited to client cache or previously fetched list. | Authoritative; checks the central server record repository (`registrations.json`). |
| **Password security** | Checks format/length; must never store plain-text passwords. | Hashes password securely using PBKDF2 with salt before saving to disk. |

---

## ⚙️ Server-Side Validation Rules (`server/server.js`)

Before any registration record is accepted or saved to `server/data/registrations.json`, the server independently enforces:

1. **Full Name:**
   - Must be a string.
   - Must not be empty or contain only whitespace.
   - Must be at least 2 characters long after trimming.
   - *Error:* `"Please enter your full name (minimum 2 characters)."` (Status: `400 Bad Request`)
2. **Email Address:**
   - Must be a string.
   - Must follow a valid email pattern (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - Converted to lowercase for consistent case-insensitive comparison.
   - *Error:* `"Please enter a valid email address."` (Status: `400 Bad Request`)
3. **College ID:**
   - Must be a non-empty string after trimming.
   - *Error:* `"Please enter your College ID."` (Status: `400 Bad Request`)
4. **Selected Event:**
   - Must be a non-empty string.
   - *Error:* `"Please select an event to register for."` (Status: `400 Bad Request`)
5. **Password Length:**
   - Must be a string with a minimum length of 8 characters.
   - *Error:* `"Password must contain at least 8 characters."` (Status: `400 Bad Request`)
6. **Password Confirmation:**
   - If `confirmPassword` is submitted, it must strictly match `password`.
   - *Error:* `"Passwords do not match."` (Status: `400 Bad Request`)
7. **Duplicate Account Prevention:**
   - The email is checked against all existing records in `registrations.json`.
   - If an account already exists with that email:
   - *Error:* `"An account with this email already exists."` (Status: `409 Conflict`)
8. **Security & Password Hashing:**
   - Passwords are **never stored in plain text**.
   - A unique 16-byte random salt is generated for each registration.
   - The password is hashed using PBKDF2 (100,000 iterations of SHA-512).
   - Only the `salt` and `passwordHash` are saved in `registrations.json`.
   - API responses **never return** passwords, salts, or hashes.

---

## 📡 API Endpoints

### 1. `POST /api/register`
- **Description:** Validates and registers a new student for an event.
- **Request Headers:** `Content-Type: application/json`
- **Request Body Format:**
  ```json
  {
    "fullName": "Sakshi Shewale",
    "email": "sakshi@college.edu",
    "collegeId": "CS2026045",
    "selectedEvent": "Code Sprint Hackathon",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }
  ```
- **Response — 201 Created (Success):**
  ```json
  {
    "success": true,
    "message": "Registration successful! Your registration has been validated and recorded.",
    "registration": {
      "id": 1728775600000,
      "fullName": "Sakshi Shewale",
      "email": "sakshi@college.edu",
      "collegeId": "CS2026045",
      "selectedEvent": "Code Sprint Hackathon",
      "registrationDate": "13 Oct 2026"
    }
  }
  ```
- **Response — 400 Bad Request (Validation Failure):**
  ```json
  {
    "success": false,
    "message": "Password must contain at least 8 characters."
  }
  ```
- **Response — 409 Conflict (Duplicate Email):**
  ```json
  {
    "success": false,
    "message": "An account with this email already exists."
  }
  ```
- **Response — 405 Method Not Allowed:**
  Returned if an HTTP method other than `POST` is sent to `/api/register`.

### 2. `GET /api/registrations`
- **Description:** Returns a list of public, sanitized registration records (omits password hashes and salts).
- **Response — 200 OK:**
  ```json
  {
    "success": true,
    "count": 1,
    "registrations": [
      {
        "id": 1728775600000,
        "fullName": "Sakshi Shewale",
        "email": "sakshi@college.edu",
        "collegeId": "CS2026045",
        "selectedEvent": "Code Sprint Hackathon",
        "registrationDate": "13 Oct 2026"
      }
    ]
  }
  ```

---

## ▶️ How to Install and Run Locally

### Prerequisites
- Node.js (version 16 or newer recommended).
- Check your installation by opening a terminal and running:
  ```bash
  node -v
  ```

### Starting the Server
1. Open the project folder in VS Code or your terminal:
   ```bash
   cd CampusHub
   ```
2. Start the Node.js server using npm:
   ```bash
   npm start
   ```
   *(Alternatively: `node server/server.js`)*
3. You will see the server startup confirmation:
   ```text
   ====================================================
    CampusHub Server is running on: http://localhost:3000
    - Static files served from: .../CampusHub
    - Registration endpoint: POST http://localhost:3000/api/register
    - Registrations list:    GET  http://localhost:3000/api/registrations
   ====================================================
   ```
4. Open your browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)** (or [http://localhost:3000/register.html](http://localhost:3000/register.html))

---

---
