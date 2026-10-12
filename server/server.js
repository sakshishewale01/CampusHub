// ========================================================
// CampusHub - Node.js HTTP Server (Assignment 3)
// Built using Node.js built-in modules: http, fs, path, crypto
// Demonstrates server-side validation, duplicate prevention,
// password hashing, JSON file storage, and static file serving.
// ========================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 1. Configurable Port
const PORT = process.env.PORT || 3000;

// 2. Paths
const PUBLIC_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

// Ensure data directory and registrations.json exist on startup
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

// 3. MIME types dictionary for static file serving
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

// 4. Helper function: Send JSON responses with status code
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(data));
}

// 5. Helper function: Read existing registrations from JSON file
function readRegistrations() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading registrations file:', error);
    return [];
  }
}

// 6. Helper function: Save registrations to JSON file
function saveRegistrations(registrations) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to registrations file:', error);
    return false;
  }
}

// 7. Helper function: Hash passwords securely using PBKDF2 (built-in crypto)
function hashPassword(password) {
  // Generate a random 16-byte salt
  const salt = crypto.randomBytes(16).toString('hex');
  // Derive a 64-byte key using 100,000 iterations of SHA-512
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// 8. Handler: Registration Endpoint (POST /api/register)
function handleRegister(req, res) {
  // Enforce POST method
  if (req.method !== 'POST') {
    return sendJsonResponse(res, 405, {
      success: false,
      message: 'Method Not Allowed. Please use POST.'
    });
  }

  // Validate Content-Type
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return sendJsonResponse(res, 400, {
      success: false,
      message: 'Invalid Content-Type. Expected application/json.'
    });
  }

  // Read request body chunks with size limit (max 1MB)
  const MAX_BODY_SIZE = 1024 * 1024;
  let body = '';
  let bodySize = 0;

  req.on('data', chunk => {
    bodySize += chunk.length;
    if (bodySize > MAX_BODY_SIZE) {
      res.destroy(); // Terminate request to protect server memory
      return;
    }
    body += chunk;
  });

  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Malformed request. JSON body could not be parsed.'
      });
    }

    if (!payload || typeof payload !== 'object') {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Invalid payload. Request body must be a JSON object.'
      });
    }

    // Extract fields (supporting fullName or studentName for flexibility)
    const rawFullName = payload.fullName || payload.studentName;
    const rawEmail = payload.email;
    const rawCollegeId = payload.collegeId;
    const rawSelectedEvent = payload.selectedEvent;
    const rawPassword = payload.password;
    const rawConfirmPassword = payload.confirmPassword;

    // ========================================================
    // SERVER-SIDE VALIDATION RULES
    // The server is the final authority. It validates all inputs
    // independently of browser or client-side validation.
    // ========================================================

    // Rule 1: Full Name validation
    if (typeof rawFullName !== 'string' || !rawFullName.trim()) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Please enter your full name.'
      });
    }
    const fullName = rawFullName.trim();
    if (fullName.length < 2) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Full name must contain at least 2 characters.'
      });
    }

    // Rule 2: Email Address validation
    if (typeof rawEmail !== 'string' || !rawEmail.trim()) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Please enter your email address.'
      });
    }
    const email = rawEmail.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // Rule 3: College ID validation
    if (typeof rawCollegeId !== 'string' || !rawCollegeId.trim()) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Please enter your College ID.'
      });
    }
    const collegeId = rawCollegeId.trim();

    // Rule 4: Selected Event validation
    if (typeof rawSelectedEvent !== 'string' || !rawSelectedEvent.trim()) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Please select an event to register for.'
      });
    }
    const selectedEvent = rawSelectedEvent.trim();

    // Rule 5: Password validation (minimum 8 characters)
    if (typeof rawPassword !== 'string' || !rawPassword) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Please enter a password.'
      });
    }
    if (rawPassword.length < 8) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Password must contain at least 8 characters.'
      });
    }

    // Rule 6: Confirm Password validation
    if (typeof rawConfirmPassword === 'string' && rawConfirmPassword !== rawPassword) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // ========================================================
    // DUPLICATE REGISTRATION CHECK
    // ========================================================
    const registrations = readRegistrations();
    const isDuplicate = registrations.some(
      r => r.email && r.email.toLowerCase() === email
    );

    if (isDuplicate) {
      return sendJsonResponse(res, 409, {
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // ========================================================
    // SECURE STORAGE (PASSWORD HASHING)
    // Passwords are never stored in plain text.
    // ========================================================
    const { salt, hash } = hashPassword(rawPassword);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newRecord = {
      id: Date.now(),
      fullName: fullName,
      email: email,
      collegeId: collegeId,
      selectedEvent: selectedEvent,
      registrationDate: formattedDate,
      createdAt: now.toISOString(),
      salt: salt,
      passwordHash: hash
    };

    // Append to array and save to file
    registrations.push(newRecord);
    const saveSuccess = saveRegistrations(registrations);

    if (!saveSuccess) {
      return sendJsonResponse(res, 500, {
        success: false,
        message: 'Internal server error: Failed to save registration record.'
      });
    }

    // Return success response without returning password, salt, or hash
    return sendJsonResponse(res, 201, {
      success: true,
      message: 'Registration successful! Your registration has been validated and recorded.',
      registration: {
        id: newRecord.id,
        fullName: newRecord.fullName,
        email: newRecord.email,
        collegeId: newRecord.collegeId,
        selectedEvent: newRecord.selectedEvent,
        registrationDate: newRecord.registrationDate
      }
    });
  });
}

// 9. Handler: Public Registrations list (GET /api/registrations)
function handleGetRegistrations(req, res) {
  if (req.method !== 'GET') {
    return sendJsonResponse(res, 405, {
      success: false,
      message: 'Method Not Allowed. Please use GET.'
    });
  }

  const registrations = readRegistrations();
  // Strip private security fields (salt, passwordHash) before sending
  const sanitized = registrations.map(r => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    collegeId: r.collegeId,
    selectedEvent: r.selectedEvent,
    registrationDate: r.registrationDate
  }));

  return sendJsonResponse(res, 200, {
    success: true,
    count: sanitized.length,
    registrations: sanitized
  });
}

// 10. Handler: Static File Serving
function serveStaticFile(req, res, pathname) {
  // Default to index.html for root path
  let relativePath = pathname === '/' ? 'index.html' : pathname;

  // If path doesn't have an extension, try appending .html (clean URL support)
  if (!path.extname(relativePath)) {
    const potentialHtml = path.join(PUBLIC_DIR, relativePath + '.html');
    if (fs.existsSync(potentialHtml)) {
      relativePath += '.html';
    }
  }

  // Resolve absolute path and normalize
  const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  // Security check 1: Prevent Directory Traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access denied.');
  }

  // Security check 2: Prevent access to server directory, JSON data, package files or hidden files
  const relativeFromRoot = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
  if (
    relativeFromRoot.startsWith('server/') ||
    relativeFromRoot.startsWith('.git') ||
    relativeFromRoot === 'package.json' ||
    relativeFromRoot === 'package-lock.json' ||
    relativeFromRoot.startsWith('.env')
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access to server files is denied.');
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404 Not Found</h1><p>The requested file was not found on this server.</p>');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff'
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', streamError => {
      console.error('File stream error:', streamError);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      }
    });
    stream.pipe(res);
  });
}

// 11. Create and Start the HTTP Server
const server = http.createServer((req, res) => {
  // Parse URL safely
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Route: Registration API endpoint
  if (pathname === '/api/register') {
    return handleRegister(req, res);
  }

  // Route: Public registrations list endpoint
  if (pathname === '/api/registrations') {
    return handleGetRegistrations(req, res);
  }

  // Route: Any other /api endpoint -> 404
  if (pathname.startsWith('/api/')) {
    return sendJsonResponse(res, 404, {
      success: false,
      message: 'API endpoint not found.'
    });
  }

  // Route: Static files (HTML, CSS, JS, images)
  serveStaticFile(req, res, pathname);
});

// 12. Listen on configured port
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` CampusHub Server is running on: http://localhost:${PORT}`);
  console.log(` - Static files served from: ${PUBLIC_DIR}`);
  console.log(` - Registration endpoint: POST http://localhost:${PORT}/api/register`);
  console.log(` - Registrations list:    GET  http://localhost:${PORT}/api/registrations`);
  console.log(`====================================================`);
});
