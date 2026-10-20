# CampusHub — College Event Management Platform

CampusHub is a full-featured college event management web application.


---

## 📁 Project Structure

```text
CampusHub/
│
├── index.html               # Home page (Hero banner, highlights, categories, stats, CTA)
├── events.html              # Events listing page (Search, category filters, sorting, event modal)
├── login.html               # Student login form page (Client-side validation)
├── register.html            # Registration form page (Client-side + Server-side validation)
├── about.html               # About page (Mission, features, 4-step workflow guide)
│
├── css/
│   └── style.css            # Shared stylesheet (Design tokens, Flexbox/Grid, modal, preview cards)
│
├── js/
│   ├── events.js            # Live search, category chips, sorting, count updates, event modal
│   ├── login.js             # Login client-side validation
│   └── register.js          # Registration client-side validation & fetch() submission to Node.js
│
├── server/
│   ├── server.js            # Node.js HTTP server (Static serving, API routing, server-side validation)
│   └── data/
│       └── registrations.json # Server-side persistent JSON registration records
│
├── package.json             # Project metadata and npm start script
├── .gitignore               # Git ignore rules for node_modules, logs, and environment files
└── README.md                # Comprehensive documentation and faculty evaluation guide
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

echnology Lab. All rights reserved.
