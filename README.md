# CampusHub 🎓

### College Event Management Platform

CampusHub is a web application that helps college students explore campus events and register for them online. It also provides an admin dashboard to manage events and view student registrations.

## ✨ Features

- **Student Registration and Login** – Students can create accounts and log in.
- **Browse Events** – View upcoming college events.
- **Search and Filter** – Find events by name or category.
- **Event Registration** – Register for events online.
- **Student Dashboard** – View registered events and manage bookings.
- **Admin Dashboard** – Create, update, and delete events.
- **Manage Registrations** – Admins can view event registrations.
- **Protected Routes** – Separate access for students and admins.
- **Responsive Design** – Use the application on different screen sizes.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Builds the user interface |
| Vite | Runs and builds the frontend |
| Node.js | Runs JavaScript on the server |
| Express.js | Handles backend routes and API requests |
| MongoDB | Stores application data |
| Mongoose | Connects Node.js with MongoDB |
| CSS | Styles the application |
| Git and GitHub | Version control and code hosting |

## 📁 Project Structure

```text
CampusHub/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API communication
│   │   ├── styles/         # CSS styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Node.js and Express backend
│   ├── config/             # Database connection
│   ├── models/             # MongoDB data models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication checks
│   └── server.js
│
├── tests/                  # Automated tests
├── .env.example            # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ How to Run the Project

### 1. Install Node.js

Download Node.js from [nodejs.org](https://nodejs.org/).

Check that Node.js and npm are installed:

```bash
node -v
npm -v
```

### 2. Download the Project

Clone the repository:

```bash
git clone https://github.com/sakshishewale01/CampusHub.git
cd CampusHub
```

### 3. Install Dependencies

Install the root dependencies:

```bash
npm install
```

Install the frontend dependencies:

```bash
cd client
npm install
cd ..
```

Install the backend dependencies if the server has its own `package.json`:

```bash
cd server
npm install
cd ..
```

### 4. Configure Environment Variables

Create a `.env` file in the location expected by your backend configuration.

For example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Replace the example database value with your own MongoDB connection string. Never upload your real `.env` file or database password to GitHub.

### 5. Start the Application

Run the frontend and backend using the scripts configured in your project's `package.json` files.

For example, if the root scripts support these commands, open separate terminals and run:

**Backend:**

```bash
cd server
npm run dev
```

**Frontend:**

```bash
cd client
npm run dev
```

Open the local URL shown by Vite in your terminal, usually `http://localhost:5173`.

*Note: The exact commands and ports depend on your project's configuration.*

## 🗄️ Database

CampusHub uses MongoDB to store application data.

The main data models are:

- **User:** Stores student and admin account information.
- **Event:** Stores event details, dates, categories, and capacity.
- **Registration:** Stores student event bookings and related information.

Mongoose is used to interact with the database.

## 🔐 Authentication and Authorization

CampusHub supports separate student and admin roles.

- Students can browse events and manage their registrations.
- Admins can manage events and view registrations.
- Protected backend routes check whether the user has permission to perform an action.
- Passwords should be securely hashed before being stored.

## 🚀 Deployment

The frontend can be deployed on [Vercel](https://vercel.com/).

For a full-stack deployment, configure the backend API, MongoDB connection, environment variables, and frontend API URL correctly. The Express backend must also be deployed to a runtime that supports it.

## 🎯 Project Objective

The main objective of CampusHub is to make college event management easier by providing one platform where students can discover events and admins can manage event information and registrations.
