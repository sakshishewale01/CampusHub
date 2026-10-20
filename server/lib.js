// ========================================================
// CampusHub - Shared server helpers
// JSON responses, body parsing, password hashing, cookie
// sessions (stored in MongoDB) and a small login rate limiter.
// ========================================================

const crypto = require('crypto');
const { promisify } = require('util');

const pbkdf2 = promisify(crypto.pbkdf2);

const SESSION_COOKIE = 'sid';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours
const MAX_BODY_SIZE = 1024 * 1024;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(JSON.stringify(data));
}

// Reads and parses a JSON request body (max 1MB).
function readJson(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return reject(new HttpError(400, 'Invalid Content-Type. Expected application/json.'));
    }
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        reject(new HttpError(413, 'Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return reject(new HttpError(400, 'Request body must be a JSON object.'));
        }
        resolve(parsed);
      } catch (e) {
        reject(new HttpError(400, 'Malformed request. JSON body could not be parsed.'));
      }
    });
    req.on('error', reject);
  });
}

// ---------- Passwords (PBKDF2, same scheme as the original server) ----------
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = (await pbkdf2(password, salt, 100000, 64, 'sha512')).toString('hex');
  return { salt, hash };
}

async function verifyPassword(password, salt, expectedHash) {
  const actual = await pbkdf2(password, salt, 100000, 64, 'sha512');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

// ---------- Sessions ----------
function parseCookies(req) {
  const cookies = {};
  (req.headers.cookie || '').split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx > -1) cookies[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return cookies;
}

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

function cookieHeader(value, maxAgeSeconds) {
  let cookie = `${SESSION_COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`;
  if (process.env.NODE_ENV === 'production') cookie += '; Secure';
  return cookie;
}

// Creates a session and returns the Set-Cookie header value.
async function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await db.sessions.insertOne({
    _id: sha256(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS)
  });
  return cookieHeader(token, SESSION_TTL_MS / 1000);
}

async function destroySession(db, req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token) await db.sessions.deleteOne({ _id: sha256(token) });
  return cookieHeader('', 0);
}

async function getSessionUser(db, req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const session = await db.sessions.findOne({ _id: sha256(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  return db.users.findOne({ _id: session.userId });
}

// ---------- Login rate limiting (in memory) ----------
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const attempts = new Map();

function isLockedOut(key) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (entry.resetAt < Date.now()) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key) {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < Date.now()) {
    attempts.set(key, { count: 1, resetAt: Date.now() + LOCK_MS });
  } else {
    entry.count += 1;
  }
}

const clearFailures = key => attempts.delete(key);

module.exports = {
  HttpError,
  sendJson,
  readJson,
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getSessionUser,
  isLockedOut,
  recordFailure,
  clearFailures
};
