# CampusHub

CampusHub is a static, front-end-only college event management website built
as a Web Technology lab activity. It is built using **only HTML5 and CSS3** —
no JavaScript, no frameworks (React / Bootstrap / Tailwind), and no
backend or database of any kind.

## 📁 Project Structure

```text
CampusHub/
│
├── index.html        # Home page
├── events.html        # Upcoming events listing page
├── login.html          # Login form page
├── register.html       # Registration form page
├── about.html           # About / features / how-it-works page
│
├── css/
│   └── style.css        # Single shared stylesheet for the whole site
│
├── images/
│   └── README.md         # Notes on adding local images (optional)
│
└── README.md               # This file
```

## 📄 File Overview

| File | Purpose |
|------|---------|
| `index.html` | Landing page with navbar, hero section, featured events, categories, statistics, call-to-action and footer. |
| `events.html` | Full events listing page with a static search bar, category filter chips, and a grid of event cards. |
| `login.html` | Login form UI with email, password, "remember me", "forgot password" link and a link to register. |
| `register.html` | Registration form UI with full name, email, college ID, password, confirm password fields and a link to login. |
| `about.html` | Explains what CampusHub is, its purpose, feature highlights, and a "How it Works" step-by-step section. |
| `css/style.css` | All styling for every page — layout (Flexbox & Grid), colors, typography, buttons, cards, forms, navbar, hover effects, and responsive media queries. |
| `images/` | Placeholder folder for local images (the project currently uses public Unsplash image URLs, so no local images are required). |

## ▶️ How to Run

No build tools, servers, or installations are required.

1. Download / clone this folder.
2. Double-click `index.html` (or open it with **File → Open** in any browser).
3. Navigate the site using the navbar links — all pages are linked to each other.

> Note: An internet connection is needed only to load the placeholder images
> from Unsplash. All layout and styling works fully offline.

## 🎨 Design & Tech Notes

- Built with **semantic HTML5** (`header`, `nav`, `main`, `section`, `article`, `footer`).
- Styled entirely with **CSS3** — Flexbox for navigation/alignment, CSS Grid for
  card layouts, custom properties (`:root` variables) for a consistent theme.
- Fully **responsive** with media queries for tablet and mobile breakpoints.
- Includes hover effects, card shadows, rounded corners, and consistent spacing
  to give it a modern, professional look.
- Login and Register forms are **static UI only** — they do not submit data
  anywhere, since this is a front-end-only activity with no backend.

## 🚫 What's Intentionally Not Included

- No JavaScript
- No React / Bootstrap / Tailwind CSS or any other framework
- No Node.js, servers, APIs, or databases
- No working authentication — forms are for UI demonstration only

---
Built for the Web Technology Lab — Activity 1.
