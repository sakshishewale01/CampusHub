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

## 🧪 Testing Server-Side Validation

### Method 1: Web Browser UI Testing
1. Navigate to **`http://localhost:3000/register.html`**.
2. **Test Missing Fields:** Leave fields blank and attempt to submit. Observe the validation prompts.
3. **Test Short Password (< 8 chars):** Enter a 5-character password. Observe the error message: *"Password must contain at least 8 characters."*
4. **Test Mismatched Passwords:** Enter different values in Password and Confirm Password. Observe: *"Passwords do not match."*
5. **Test Valid Submission:**
   - Full Name: `Sakshi Shewale`
   - Email: `sakshi@college.edu`
   - College ID: `CS2026045`
   - Select Event: `Code Sprint Hackathon`
   - Password: `Password123!` & Confirm: `Password123!`
   - Click **"Register for Event"**.
   - Notice the green confirmation message returned by the server: *"Registration successful! Your registration has been validated and recorded."*
   - Observe that the record appears in the **Stored Registrations** preview below the form.
6. **Test Duplicate Email:**
   - Attempt to register again using the same email (`sakshi@college.edu`).
   - Observe the server response: *"An account with this email already exists."* (Status `409 Conflict`).
7. **Verify Server File on Disk:**
   - Open `server/data/registrations.json` in VS Code.
   - Observe the saved record: Notice that `salt` and `passwordHash` are present, but **no plain-text password is stored**.

---

### Method 2: Direct API Testing via Windows PowerShell
You can bypass the browser completely by sending requests directly to the Node.js backend using PowerShell to prove that server-side validation is authoritative:

#### 1. Test Empty Full Name (Expected: 400 Bad Request)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -ContentType "application/json" -Body '{"fullName":"","email":"test@college.edu","collegeId":"CS101","selectedEvent":"Code Sprint Hackathon","password":"Password123!","confirmPassword":"Password123!"}' -SkipHttpErrorCheck
```
*Expected Output:*
```json
{"success":false,"message":"Please enter your full name."}
```

#### 2. Test Invalid Email Address (Expected: 400 Bad Request)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -ContentType "application/json" -Body '{"fullName":"Sakshi Shewale","email":"invalid-email-format","collegeId":"CS101","selectedEvent":"Code Sprint Hackathon","password":"Password123!","confirmPassword":"Password123!"}' -SkipHttpErrorCheck
```
*Expected Output:*
```json
{"success":false,"message":"Please enter a valid email address."}
```

#### 3. Test Short Password < 8 characters (Expected: 400 Bad Request)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -ContentType "application/json" -Body '{"fullName":"Sakshi Shewale","email":"student@college.edu","collegeId":"CS101","selectedEvent":"Code Sprint Hackathon","password":"short","confirmPassword":"short"}' -SkipHttpErrorCheck
```
*Expected Output:*
```json
{"success":false,"message":"Password must contain at least 8 characters."}
```

#### 4. Test Password Mismatch (Expected: 400 Bad Request)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -ContentType "application/json" -Body '{"fullName":"Sakshi Shewale","email":"student@college.edu","collegeId":"CS101","selectedEvent":"Code Sprint Hackathon","password":"Password123!","confirmPassword":"WrongPassword!"}' -SkipHttpErrorCheck
```
*Expected Output:*
```json
{"success":false,"message":"Passwords do not match."}
```

#### 5. Test Valid Registration (Expected: 201 Created)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -ContentType "application/json" -Body '{"fullName":"Aarav Sharma","email":"aarav@college.edu","collegeId":"IT2026012","selectedEvent":"AI & Machine Learning Workshop","password":"StrongPassword123!","confirmPassword":"StrongPassword123!"}'
```
*Expected Output:*
```json
{
  "success": true,
  "message": "Registration successful! Your registration has been validated and recorded.",
  "registration": {
    "id": 1728775600000,
    "fullName": "Aarav Sharma",
    "email": "aarav@college.edu",
    "collegeId": "IT2026012",
    "selectedEvent": "AI & Machine Learning Workshop",
    "registrationDate": "13 Oct 2026"
  }
}
```

#### 6. Test Duplicate Email Registration (Expected: 409 Conflict)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -ContentType "application/json" -Body '{"fullName":"Aarav Sharma","email":"aarav@college.edu","collegeId":"IT2026012","selectedEvent":"Rhythm Night","password":"StrongPassword123!","confirmPassword":"StrongPassword123!"}' -SkipHttpErrorCheck
```
*Expected Output:*
```json
{"success":false,"message":"An account with this email already exists."}
```

#### 7. Test Method Not Allowed (Expected: 405 Method Not Allowed)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method GET -SkipHttpErrorCheck
```
*Expected Output:*
```json
{"success":false,"message":"Method Not Allowed. Please use POST."}
```

---

## 🚀 Deployment Guide

To deploy this plain Node.js application to cloud hosting services (such as **Render**, **Railway**, or **Koyeb**):

### 1. Preparation
- Ensure `package.json` contains:
  ```json
  "scripts": {
    "start": "node server/server.js"
  }
  ```
- Ensure the server listens to `process.env.PORT`:
  ```javascript
  const PORT = process.env.PORT || 3000;
  ```
- Commit and push all project files to your GitHub repository:
  ```bash
  git add .
  git commit -m "feat: implement server-side validation using Node.js"
  git push origin main
  ```

### 2. Deployment on Render (Web Service)
1. Sign in to [Render](https://render.com) and click **New + → Web Service**.
2. Connect your GitHub repository (`sakshishewale01/CampusHub`).
3. Set the following build configuration:
   - **Environment:** Node
   - **Build Command:** *(leave empty or enter `npm install`)*
   - **Start Command:** `npm start`
4. Choose the Free Instance type and click **Deploy Web Service**.
5. Render will allocate a public URL (e.g. `https://campushub.onrender.com`).

### 3. Important Storage Limitation on Free Cloud Hosts
- **Ephemeral Filesystem:** Free cloud platforms (like Render or Railway) use ephemeral storage. When the free service goes to sleep or redeploys, files written to the local disk (such as `server/data/registrations.json`) may reset to their initial git state.
- **Production Recommendation:** For production multi-user systems requiring durable permanent records across server restarts, cloud database storage (such as MongoDB Atlas or PostgreSQL) is standard practice and will be implemented in subsequent assignments.

---

## 📋 Faculty Evaluation Summary

- **Assignment Title:** Design, develop and deploy a web application to demonstrate server-side validation using Node.js.
- **Aim:** To implement authoritative server-side data validation and secure JSON file-based storage using pure Node.js built-in modules without external frameworks.
- **Objectives Met:**
  1. Built a native Node.js HTTP server using `http.createServer()`.
  2. Implemented request body streaming, parsing, and error-handling without third-party packages.
  3. Enforced rigorous server-side validation rules (full name, email regex, college ID, event, password min-length 8, password matching).
  4. Handled duplicate registrations with HTTP status `409 Conflict`.
  5. Implemented secure password hashing via `crypto.pbkdf2Sync` with unique random salts.
  6. Stored validated records in `server/data/registrations.json` while guarding sensitive server files from static exposure.
  7. Connected the frontend using `fetch()` and preserved all Assignment 1 & 2 UI features.

---
&copy; 2026 CampusHub. Built for Web Technology Lab. All rights reserved.
