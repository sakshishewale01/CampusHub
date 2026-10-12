# CampusHub — College Event Management Platform

CampusHub is a front-end college event management web application developed as part of the **Web Technology Lab**.

- **Assignment 1:** Static Web Page Design using **HTML5** and **CSS3**.
- **Assignment 2:** Dynamic Web Application demonstrating the capabilities of **Vanilla JavaScript** (DOM manipulation, event handling, form validation, searching, filtering, and sorting).

---

## 📁 Project Structure

```text
CampusHub/
│
├── index.html        # Home page (Hero, highlights, categories, stats, CTA)
├── events.html       # Events listing page (Search, filters, sort, event modal)
├── login.html        # Login form page (Client-side validation)
├── register.html     # Registration form page (Client-side validation)
├── about.html        # About page (Mission, features, how it works)
│
├── css/
│   └── style.css     # Shared stylesheet (Design system, responsive layout, modal)
│
├── js/
│   ├── events.js     # Search, category filters, sorting, counter, and details modal
│   ├── login.js      # Login form validation and demo feedback
│   └── register.js   # Registration form validation and demo feedback
│
└── README.md         # Project documentation and evaluation guide
```

---

## 📄 File Overview

| File | Purpose |
|------|---------|
<<<<<<< HEAD
| `index.html` | Landing page with navigation bar, hero banner, featured events highlights, category cards, key statistics, call-to-action, and footer. |
| `events.html` | Events listing page with real-time search, category filter chips, sorting dropdown, live counter, and interactive event details modal. |
| `login.html` | Student login page featuring client-side required field and email format validation with dynamic error/success feedback. |
| `register.html` | Student registration page featuring validation for full name, email, college ID, password length, and password matching. |
| `about.html` | Information page detailing CampusHub's purpose, feature highlights, and a 4-step workflow guide. |
| `css/style.css` | Comprehensive CSS stylesheet defining CSS variables (`:root`), Flexbox, CSS Grid layouts, card styles, form styling, modal dialogs, and media queries. |
| `js/events.js` | JavaScript module for live search by name/description, category filtering, sorting by date or name, event counting, and modal popup handling. |
| `js/login.js` | JavaScript module validating login inputs and displaying real-time feedback without page reloading. |
| `js/register.js` | JavaScript module validating registration fields, password rules, and password confirmation. |
=======
| `index.html` | Landing page with navbar, hero section, featured events, categories, statistics, call-to-action and footer. |
| `events.html` | Full events listing page with a static search bar, category filter chips, and a grid of event cards. |
| `login.html` | Login form UI with email, password, "remember me", "forgot password" link and a link to register. |
| `register.html` | Registration form UI with full name, email, college ID, password, confirm password fields and a link to login. |
| `about.html` | Explains what CampusHub is, its purpose, feature highlights, and a "How it Works" step-by-step section. |
| `css/style.css` | All styling for every page — layout (Flexbox & Grid), colors, typography, buttons, cards, forms, navbar, hover effects, and responsive media queries. |
| `images/` | Placeholder folder for local images (the project currently uses public Unsplash image URLs, so no local images are required). |



## 🎨 Design & Tech Notes

- Built with **semantic HTML5** (`header`, `nav`, `main`, `section`, `article`, `footer`).
- Styled entirely with **CSS3** — Flexbox for navigation/alignment, CSS Grid for
  card layouts, custom properties (`:root` variables) for a consistent theme.
- Fully **responsive** with media queries for tablet and mobile breakpoints.
- Includes hover effects, card shadows, rounded corners, and consistent spacing
  to give it a modern, professional look.
- Login and Register forms are **static UI only** — they do not submit data
  anywhere, since this is a front-end-only activity with no backend.
>>>>>>> 9c29345e74726a921e82c45e68459d6070b288e4

---

## ⚙️ Assignment 2 JavaScript Features Implemented

1. **Live Event Search (`events.html` & `js/events.js`)**:
   - Searches through event titles and descriptions in real time using the `input` event listener.
   - Converts strings to lowercase for case-insensitive matching.
   - Shows a friendly "No matching events found" message when no cards match.

2. **Category Filtering (`events.html` & `js/events.js`)**:
   - Filter chips for **All**, **Technical**, **Cultural**, **Sports**, and **Workshops**.
   - Clicking any category toggles the `.active` class and displays only matching cards.
   - Search query and category filter work seamlessly together.

3. **Event Sorting (`events.html` & `js/events.js`)**:
   - Supports sorting by **Date** (chronological order using `data-date`) and **Name (A-Z)** (alphabetical order using `localeCompare`).
   - Automatically rearranges the DOM cards inside `.events-grid`.

4. **Dynamic Event Counter & Status (`events.html` & `js/events.js`)**:
   - Live counter updates immediately on search or filter change (e.g., `"Showing 4 of 8 events"`).

5. **Interactive Event Details Modal (`events.html`, `css/style.css` & `js/events.js`)**:
   - Clicking **"View Details"** on any event card opens a styled modal dialog.
   - Reads event data (title, category, date, time, venue, description) dynamically from the selected card.
   - Can be closed via the "Close" button, close icon (`&times;`), overlay click, or pressing the `Escape` key.

6. **Registration Form Validation & Field Verification (`register.html` & `js/register.js`)**:
   - Validates that Student Name is non-empty and at least 2 characters.
   - Validates Email format using a standard regular expression pattern (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - Validates that College ID is provided.
   - Validates that an Event is selected from the dropdown.
   - Validates that Password is at least 6 characters and matches Confirm Password.
   - Automatically sets `.focus()` on the invalid field.
   - Clears old error messages as the user types/corrects inputs.
   - Prevents page reload using `event.preventDefault()`.

7. **JSON & Array Data Storage (`register.html` & `js/register.js`)**:
   - **Array Storage:** Uses a JavaScript Array named `registrations` to store registration objects using `registrations.push()`.
   - **Data Validation Before Saving:** If any field validation fails or a duplicate registration for the same event and email is detected, data is **NOT** saved.
   - **JSON Conversion:** Uses `JSON.stringify(registrations)` to convert the array of registration records into JSON format before storing it in browser `localStorage`.
   - **JSON Parsing & Persistence:** Uses `JSON.parse()` to read stored JSON back into the `registrations` Array on page reload. Missing or invalid JSON is safely handled.
   - **Privacy:** Passwords are strictly validated in memory and **never stored** in the array or in `localStorage`.
   - **Visual Proof of Stored Data:** Renders a dynamic list of stored registrations directly below the form in `register.html` with student name, event, college ID, and registration date.

8. **Login Form Validation (`login.html` & `js/login.js`)**:
   - Checks that email and password fields are filled.
   - Validates email format.
   - Displays clear error feedback if invalid, or a success message if valid.
   - Prevents page reload using `event.preventDefault()`.

---

## 💻 How to Run and Test in VS Code

1. **Open Project in VS Code**:
   - Open Visual Studio Code.
   - Click **File → Open Folder...** and select the `CampusHub` project folder.

2. **Run using Live Server (Recommended)**:
   - Install the **Live Server** extension by Ritwick Dey from the VS Code Extensions marketplace (`Ctrl+Shift+X`).
   - Right-click `index.html` and select **"Open with Live Server"**.
   - Your default browser will open at `http://127.0.0.1:5500/index.html`.

3. **Alternative — Open Directly in Browser**:
   - Navigate to the `CampusHub` folder in File Explorer.
   - Double-click `index.html` to open it in Chrome, Edge, Firefox, or Safari.

4. **Testing Instructions**:
   - **Test Events Page (`events.html`)**:
     - Type keywords (e.g., `"code"`, `"music"`, `"basketball"`) in the search box to observe real-time filtering and counter updates.
     - Click category chips (**Technical**, **Cultural**, **Sports**, **Workshops**, **All**) to verify filtering.
     - Switch the sort dropdown between **"Sort by: Date"** and **"Sort by: Name (A-Z)"** to observe DOM card re-ordering.
     - Click **"View Details"** on any card to test the modal popup. Press `Escape` or click "Close" to dismiss.
   - **Test Registration (`register.html`)**:
     - Click "Register" with empty inputs to test required field validation.
     - Enter an invalid email (e.g., `test@`) to test email format validation.
     - Enter mismatched passwords to test confirmation matching.
     - Fill all fields correctly to see the success message.
   - **Test Login (`login.html`)**:
     - Submit with empty inputs to verify validation.
     - Enter an invalid email to check format handling.
     - Enter valid credentials to see the confirmation message.

---

## ⚠️ Important Note Regarding Authentication

This project is currently a **client-side front-end demonstration** for Web Technology Lab Assignment 2.
- Form validation is performed entirely in the browser using JavaScript.
- No permanent user accounts are created, and no server database is connected at this stage.
- Server-side authentication and database persistence will be implemented in future assignments using Node.js, Express.js, and MongoDB.

---

## 🎨 Technology Stack

- **HTML5:** Semantic layout tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **CSS3:** Custom properties (`:root`), Flexbox, CSS Grid, animations, and responsive media queries.
- **Vanilla JavaScript:** DOM selection (`getElementById`, `querySelector`, `querySelectorAll`), event listeners (`click`, `input`, `change`, `submit`, `keydown`), array manipulation (`slice`, `sort`, `filter`), and string methods (`includes`, `trim`, `toLowerCase`, `localeCompare`).

---
&copy; 2026 CampusHub. Built for Web Technology Lab. All rights reserved.
