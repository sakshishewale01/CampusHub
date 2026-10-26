// ========================================================
<<<<<<< HEAD
// CampusHub 3.0 — Node.js Express Server (MERN Stack)
// Connects to MongoDB Atlas via Mongoose, manages sessions,
// and routes requests to Modular REST API endpoints.
=======
// CampusHub - Node.js HTTP Server
// Built-in http module for routing/static files, MongoDB for
// storage, cookie sessions for admin/user login.
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
// ========================================================

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
<<<<<<< HEAD
const fs = require('fs');

const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_DIST = path.join(__dirname, '../client/dist');
const PUBLIC_DIR = path.join(__dirname, '..');

// 1. CORS Configuration for Development & Production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dynamic host in cloud deployment
      }
    },
    credentials: true
  })
);

// 2. Parse JSON & Form Data Bodies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Configure Server-Side Sessions with MongoDB Store
const sessionSecret = process.env.SESSION_SECRET || 'campushub_mern_secret_2026';

const sessionOptions = {
  name: 'campushub.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Use MongoDB Session Store if MONGODB_URI is provided
if (process.env.MONGODB_URI) {
  try {
    sessionOptions.store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60 // 1 day
    });
    console.log('[Session] Using MongoDB Atlas session store.');
  } catch (storeError) {
    console.warn('[Session] Warning: Could not initialize MongoStore, falling back to memory store:', storeError.message);
  }
}

app.use(session(sessionOptions));

// 4. API Endpoints Routing
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/student/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Backwards-compatibility aliases
app.use('/api/student', registrationRoutes);

// 5. Serve React Client Build in Production
if (fs.existsSync(CLIENT_DIST)) {
  console.log(`[Express] Serving built React frontend from: ${CLIENT_DIST}`);
  app.use(express.static(CLIENT_DIST));

  // Client-side routing fallback for Express v5
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    }
    next();
  });
} else {
  // Development fallback: serve static files from root if client build does not exist yet
  app.use(express.static(PUBLIC_DIR));
}

// 6. 404 Handler for undefined API routes
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found.'
    });
  }
  res.status(404).send('Not Found');
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
=======
const { connect, MONGODB_URI, MONGODB_DB } = require('./db');
const { handleApi } = require('./api');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Only these top-level paths may be served as static files
const PUBLIC_FOLDERS = ['css/', 'js/', 'images/'];

function serveStaticFile(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('405 Method Not Allowed');
  }

  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname === '/' ? 'index.html' : pathname);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Bad Request');
  }

  // Clean URL support: /events -> events.html
  if (!path.extname(relativePath) && fs.existsSync(path.join(PUBLIC_DIR, relativePath + '.html'))) {
    relativePath += '.html';
  }

  const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access denied.');
  }

  // Serve only top-level .html pages and the public asset folders, so
  // server code, package files, node_modules and .env are never exposed.
  const relative = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
  const isTopLevelPage = !relative.includes('/') && relative.endsWith('.html');
  if (!isTopLevelPage && !PUBLIC_FOLDERS.some(folder => relative.startsWith(folder))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access to this file is denied.');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404 Not Found</h1><p>The requested file was not found on this server.</p>');
    }

    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') return res.end();

    const stream = fs.createReadStream(filePath);
    stream.on('error', streamError => {
      console.error('File stream error:', streamError);
      res.destroy();
    });
    stream.pipe(res);
  });
}

async function main() {
  console.log('====================================================');
  console.log(` Connecting to MongoDB: ${MONGODB_URI} (db: ${MONGODB_DB})`);
  const db = await connect();

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      return handleApi(req, res, url, db);
    }
    serveStaticFile(req, res, url.pathname);
  });

  server.listen(PORT, () => {
    console.log(` CampusHub Server is running on: http://localhost:${PORT}`);
    console.log('====================================================');
  });

  const shutdown = () => {
    server.close();
    db.client.close().finally(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  console.error('Failed to start CampusHub:', err.message);
  console.error('Is MongoDB running? Set MONGODB_URI if it is not on 127.0.0.1:27017.');
  process.exit(1);
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
});

// 8. Start Server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(` CampusHub 3.0 (MERN Stack) is running!`);
    console.log(` Server URL: http://localhost:${PORT}`);
    console.log(` Health:     http://localhost:${PORT}/api/health`);
    console.log(` Mode:       ${process.env.NODE_ENV || 'development'}`);
    console.log('====================================================');
  });
}

// Only start listener if run directly (allows importing app in automated tests)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
