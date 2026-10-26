// ========================================================
// CampusHub - REST API (auth, events, registrations,
// queries, admin tools and Excel export)
// ========================================================

const { ObjectId } = require('mongodb');
const ExcelJS = require('exceljs');
const lib = require('./lib');

const { HttpError } = lib;

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Validation helpers ----------
function toId(value) {
  return typeof value === 'string' && ObjectId.isValid(value) && value.length === 24
    ? new ObjectId(value)
    : null;
}

function requireId(value, label = 'id') {
  const id = toId(value);
  if (!id) throw new HttpError(400, `Invalid ${label}.`);
  return id;
}

// Returns a trimmed string, enforcing type and length.
function text(value, label, min, max) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `Please enter ${label}.`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min) throw new HttpError(400, `${label} must contain at least ${min} characters.`);
  if (trimmed.length > max) throw new HttpError(400, `${label} must be at most ${max} characters.`);
  return trimmed;
}

function parseUserInput(body, { allowRole = false } = {}) {
  const fullName = text(body.fullName, 'your full name', 2, 100);
  const email = text(body.email, 'your email address', 3, 254).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'Please enter a valid email address.');
  // PRN is exactly 12 digits (optional only for admin accounts)
  const prn = typeof body.prn === 'string' ? body.prn.trim() : '';
  const isAdminAccount = allowRole && body.role === 'admin';
  if (!prn && !isAdminAccount) throw new HttpError(400, 'Please enter your PRN.');
  if (prn && !/^\d{12}$/.test(prn)) throw new HttpError(400, 'PRN must be exactly 12 digits.');

  if (typeof body.password !== 'string' || !body.password) {
    throw new HttpError(400, 'Please enter a password.');
  }
  if (body.password.length < 8) throw new HttpError(400, 'Password must contain at least 8 characters.');
  if (body.password.length > 128) throw new HttpError(400, 'Password must be at most 128 characters.');
  if (typeof body.confirmPassword === 'string' && body.confirmPassword !== body.password) {
    throw new HttpError(400, 'Passwords do not match.');
  }

  let role = 'user';
  if (allowRole && body.role !== undefined) {
    if (!['admin', 'user'].includes(body.role)) throw new HttpError(400, 'Role must be admin or user.');
    role = body.role;
  }
  return { fullName, email, prn, password: body.password, role };
}

function parseEventInput(body) {
  const title = text(body.title, 'an event title', 2, 120);
  if (!CATEGORIES.includes(body.category)) {
    throw new HttpError(400, `Category must be one of: ${CATEGORIES.join(', ')}.`);
  }
  const date = typeof body.date === 'string' ? body.date.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new HttpError(400, 'Please enter a valid event date.');
  }
  const time = text(body.time, 'the event time', 1, 40);
  const venue = text(body.venue, 'the venue', 1, 120);
  const description = text(body.description, 'a description', 1, 1000);

  let image = '';
  if (typeof body.image === 'string' && body.image.trim()) {
    image = body.image.trim();
    if (image.length > 500 || !/^https?:\/\//i.test(image)) {
      throw new HttpError(400, 'Image must be an http(s) URL.');
    }
  }
  // Paid events must have a registration fee; free events always store 0
  if (typeof body.isPaid !== 'boolean') throw new HttpError(400, 'Please choose whether the event is Paid or Free.');
  let fee = 0;
  if (body.isPaid) {
    fee = Number(body.fee);
    if (body.fee === '' || body.fee === null || !Number.isFinite(fee) || fee <= 0 || fee > 100000) {
      throw new HttpError(400, 'Please enter a registration amount greater than 0 (max 100000).');
    }
    fee = Math.round(fee * 100) / 100;
  }
  return { title, category: body.category, date, time, venue, description, image, isPaid: body.isPaid, fee };
}

// ---------- Serializers (never expose password data) ----------
const publicUser = u => ({
  id: String(u._id),
  fullName: u.fullName,
  email: u.email,
  prn: u.prn,
  role: u.role
});

// An event is completed once its date is before today (the event day itself is still open)
function todayString() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const isCompleted = e => e.date < todayString();

const publicEvent = e => ({
  id: String(e._id),
  title: e.title,
  category: e.category,
  date: e.date,
  time: e.time,
  venue: e.venue,
  description: e.description,
  image: e.image || '',
  isPaid: !!e.isPaid,
  fee: e.fee || 0,
  completed: isCompleted(e)
});

const publicQuery = q => ({
  id: String(q._id),
  eventId: String(q.eventId),
  userName: q.userName,
  question: q.question,
  answer: q.answer || '',
  createdAt: q.createdAt,
  answeredAt: q.answeredAt || null
});

const publicRegistration = r => ({
  id: String(r._id),
  eventId: String(r.eventId),
  eventTitle: r.eventTitle,
  fullName: r.fullName,
  email: r.email,
  prn: r.prn,
  fee: r.fee || 0,
  createdAt: r.createdAt
});

async function findEvent(db, idString) {
  const event = await db.events.findOne({ _id: requireId(idString, 'event id') });
  if (!event) throw new HttpError(404, 'Event not found.');
  return event;
}

// ========================================================
// AUTH
// ========================================================
async function startSession(ctx, user, status, message) {
  const cookie = await lib.createSession(ctx.db, user._id);
  lib.sendJson(ctx.res, status, { success: true, message, user: publicUser(user) }, { 'Set-Cookie': cookie });
}

async function signup(ctx) {
  const input = parseUserInput(await ctx.body());
  const { salt, hash } = await lib.hashPassword(input.password);
  const user = {
    fullName: input.fullName,
    email: input.email,
    prn: input.prn,
    role: 'user', // public sign-up can never create an admin
    salt,
    passwordHash: hash,
    createdAt: new Date()
  };
  try {
    user._id = (await ctx.db.users.insertOne(user)).insertedId;
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, 'An account with this email already exists.');
    throw err;
  }
  await startSession(ctx, user, 201, 'Account created successfully. You are now logged in.');
}

async function login(ctx) {
  const body = await ctx.body();
  if (typeof body.email !== 'string' || typeof body.password !== 'string' || !body.email || !body.password) {
    throw new HttpError(400, 'Please enter your email and password.');
  }
  const email = body.email.trim().toLowerCase();
  const key = `${ctx.req.socket.remoteAddress}|${email}`;
  if (lib.isLockedOut(key)) {
    throw new HttpError(429, 'Too many failed attempts. Please try again in 15 minutes.');
  }

  const user = await ctx.db.users.findOne({ email });
  const valid = user && (await lib.verifyPassword(body.password, user.salt, user.passwordHash));
  if (!valid) {
    lib.recordFailure(key);
    throw new HttpError(401, 'Invalid email or password.');
  }
  lib.clearFailures(key);
  await startSession(ctx, user, 200, 'Login successful.');
}

async function logout(ctx) {
  const cookie = await lib.destroySession(ctx.db, ctx.req);
  lib.sendJson(ctx.res, 200, { success: true }, { 'Set-Cookie': cookie });
}

async function me(ctx) {
  lib.sendJson(ctx.res, 200, { success: true, user: ctx.user ? publicUser(ctx.user) : null });
}

// ========================================================
// EVENTS
// ========================================================
async function listEvents(ctx) {
  const { db, user } = ctx;
  const events = await db.events.find().sort({ date: 1, title: 1 }).toArray();
  const result = events.map(publicEvent);

  if (user && user.role === 'user') {
    const mine = await db.registrations.find({ userId: user._id }).project({ eventId: 1 }).toArray();
    const registered = new Set(mine.map(r => String(r.eventId)));
    result.forEach(e => { e.registered = registered.has(e.id); });
  }
  if (user && user.role === 'admin') {
    const counts = await db.registrations.aggregate([{ $group: { _id: '$eventId', n: { $sum: 1 } } }]).toArray();
    const byEvent = new Map(counts.map(c => [String(c._id), c.n]));
    result.forEach(e => { e.registrationCount = byEvent.get(e.id) || 0; });
  }
  lib.sendJson(ctx.res, 200, { success: true, events: result });
}

async function createEvent(ctx) {
  const event = { ...parseEventInput(await ctx.body()), createdAt: new Date() };
  event._id = (await ctx.db.events.insertOne(event)).insertedId;
  lib.sendJson(ctx.res, 201, { success: true, message: 'Event created.', event: publicEvent(event) });
}

async function updateEvent(ctx) {
  const id = requireId(ctx.params.id, 'event id');
  const changes = parseEventInput(await ctx.body());
  const updated = await ctx.db.events.findOneAndUpdate(
    { _id: id },
    { $set: { ...changes, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!updated) throw new HttpError(404, 'Event not found.');
  // Keep the title snapshot on existing registrations in sync
  await ctx.db.registrations.updateMany({ eventId: id }, { $set: { eventTitle: changes.title } });
  lib.sendJson(ctx.res, 200, { success: true, message: 'Event updated.', event: publicEvent(updated) });
}

async function deleteEvent(ctx) {
  const id = requireId(ctx.params.id, 'event id');
  const result = await ctx.db.events.deleteOne({ _id: id });
  if (!result.deletedCount) throw new HttpError(404, 'Event not found.');
  await Promise.all([
    ctx.db.registrations.deleteMany({ eventId: id }),
    ctx.db.queries.deleteMany({ eventId: id })
  ]);
  lib.sendJson(ctx.res, 200, { success: true, message: 'Event and its registrations were deleted.' });
}

// ========================================================
// REGISTRATIONS (user)
// ========================================================
async function registerForEvent(ctx) {
  const event = await findEvent(ctx.db, ctx.params.id);
  const { user } = ctx;
  if (isCompleted(event)) throw new HttpError(400, 'This event has already been completed. Registration is closed.');
  try {
    await ctx.db.registrations.insertOne({
      userId: user._id,
      eventId: event._id,
      eventTitle: event.title,
      fee: event.isPaid ? event.fee : 0, // fee at the time of registering
      fullName: user.fullName,
      email: user.email,
      prn: user.prn,
      createdAt: new Date()
    });
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, 'You are already registered for this event.');
    throw err;
  }
  lib.sendJson(ctx.res, 201, { success: true, message: `You are registered for "${event.title}".` });
}

async function cancelRegistration(ctx) {
  const result = await ctx.db.registrations.deleteOne({
    userId: ctx.user._id,
    eventId: requireId(ctx.params.id, 'event id')
  });
  if (!result.deletedCount) throw new HttpError(404, 'You are not registered for this event.');
  lib.sendJson(ctx.res, 200, { success: true, message: 'Your registration was cancelled.' });
}

// ========================================================
// QUERIES (questions about an event)
// ========================================================
async function listEventQueries(ctx) {
  const queries = await ctx.db.queries
    .find({ eventId: requireId(ctx.params.id, 'event id') })
    .sort({ createdAt: -1 })
    .toArray();
  lib.sendJson(ctx.res, 200, { success: true, queries: queries.map(publicQuery) });
}

async function postQuery(ctx) {
  const event = await findEvent(ctx.db, ctx.params.id);
  const question = text((await ctx.body()).question, 'your question', 5, 500);
  const query = {
    eventId: event._id,
    userId: ctx.user._id,
    userName: ctx.user.fullName,
    question,
    answer: '',
    createdAt: new Date()
  };
  query._id = (await ctx.db.queries.insertOne(query)).insertedId;
  lib.sendJson(ctx.res, 201, { success: true, message: 'Your question was posted.', query: publicQuery(query) });
}

// ========================================================
// ADMIN: registrations, export, queries, users
// ========================================================
function registrationFilter(ctx) {
  const eventId = ctx.url.searchParams.get('eventId');
  return eventId ? { eventId: requireId(eventId, 'event id') } : {};
}

async function adminListRegistrations(ctx) {
  const rows = await ctx.db.registrations.find(registrationFilter(ctx)).sort({ createdAt: -1 }).toArray();
  lib.sendJson(ctx.res, 200, { success: true, count: rows.length, registrations: rows.map(publicRegistration) });
}

async function adminDeleteRegistration(ctx) {
  const result = await ctx.db.registrations.deleteOne({ _id: requireId(ctx.params.id) });
  if (!result.deletedCount) throw new HttpError(404, 'Registration not found.');
  lib.sendJson(ctx.res, 200, { success: true, message: 'Registration removed.' });
}

async function adminExport(ctx) {
  const filter = registrationFilter(ctx);
  const [rows, events] = await Promise.all([
    ctx.db.registrations.find(filter).sort({ eventTitle: 1, createdAt: 1 }).toArray(),
    ctx.db.events.find().toArray()
  ]);

  // Group registrations by event; one worksheet per event
  const rowsByEvent = new Map();
  rows.forEach(r => {
    const key = String(r.eventId);
    if (!rowsByEvent.has(key)) rowsByEvent.set(key, []);
    rowsByEvent.get(key).push(r);
  });
  const exportedEvents = (filter.eventId ? events.filter(e => e._id.equals(filter.eventId)) : events)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CampusHub';
  workbook.created = new Date();

  // Excel sheet names: max 31 chars, none of []:*?/\, and unique
  const usedNames = new Set();
  const sheetName = title => {
    const base = title.replace(/[\[\]:*?/\\]/g, ' ').trim().slice(0, 28) || 'Event';
    let name = base;
    for (let n = 2; usedNames.has(name.toLowerCase()); n++) name = `${base} (${n})`;
    usedNames.add(name.toLowerCase());
    return name;
  };

  exportedEvents.forEach(event => {
    const sheet = workbook.addWorksheet(sheetName(event.title));
    sheet.columns = [
      { header: 'Sr No', key: 'sr', width: 8 },
      { header: 'Full Name', key: 'fullName', width: 28 },
      { header: 'Email', key: 'email', width: 34 },
      { header: 'PRN', key: 'prn', width: 16 },
      { header: 'Fee (INR)', key: 'fee', width: 12 },
      { header: 'Registered At', key: 'createdAt', width: 22 }
    ];
    (rowsByEvent.get(String(event._id)) || []).forEach((r, i) => {
      sheet.addRow({ sr: i + 1, fullName: r.fullName, email: r.email, prn: r.prn, fee: r.fee || 0, createdAt: r.createdAt });
    });
    sheet.getColumn('createdAt').numFmt = 'yyyy-mm-dd hh:mm';
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: 'F1' };
  });

  if (filter.eventId && exportedEvents.length === 0) throw new HttpError(404, 'Event not found.');

  let label = 'all-events';
  if (filter.eventId) {
    label = exportedEvents[0].title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'event';
  }
  const filename = `campushub-registrations-${label}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  ctx.res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': buffer.length,
    'Cache-Control': 'no-store'
  });
  ctx.res.end(Buffer.from(buffer));
}

async function adminListQueries(ctx) {
  const [queries, events] = await Promise.all([
    ctx.db.queries.find().sort({ createdAt: -1 }).toArray(),
    ctx.db.events.find().project({ title: 1 }).toArray()
  ]);
  const titles = new Map(events.map(e => [String(e._id), e.title]));
  lib.sendJson(ctx.res, 200, {
    success: true,
    queries: queries.map(q => ({ ...publicQuery(q), eventTitle: titles.get(String(q.eventId)) || '(deleted event)' }))
  });
}

async function adminAnswerQuery(ctx) {
  const answer = text((await ctx.body()).answer, 'an answer', 1, 1000);
  const updated = await ctx.db.queries.findOneAndUpdate(
    { _id: requireId(ctx.params.id) },
    { $set: { answer, answeredAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!updated) throw new HttpError(404, 'Question not found.');
  lib.sendJson(ctx.res, 200, { success: true, message: 'Answer saved.', query: publicQuery(updated) });
}

async function adminDeleteQuery(ctx) {
  const result = await ctx.db.queries.deleteOne({ _id: requireId(ctx.params.id) });
  if (!result.deletedCount) throw new HttpError(404, 'Question not found.');
  lib.sendJson(ctx.res, 200, { success: true, message: 'Question deleted.' });
}

async function adminListUsers(ctx) {
  const users = await ctx.db.users.find().sort({ createdAt: -1 }).toArray();
  lib.sendJson(ctx.res, 200, {
    success: true,
    users: users.map(u => ({ ...publicUser(u), createdAt: u.createdAt }))
  });
}

async function adminCreateUser(ctx) {
  const input = parseUserInput(await ctx.body(), { allowRole: true });
  const { salt, hash } = await lib.hashPassword(input.password);
  const user = {
    fullName: input.fullName,
    email: input.email,
    prn: input.prn,
    role: input.role,
    salt,
    passwordHash: hash,
    createdAt: new Date()
  };
  try {
    user._id = (await ctx.db.users.insertOne(user)).insertedId;
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, 'An account with this email already exists.');
    throw err;
  }
  lib.sendJson(ctx.res, 201, { success: true, message: `${user.role} account created.`, user: publicUser(user) });
}

async function adminDeleteUser(ctx) {
  const id = requireId(ctx.params.id, 'user id');
  if (id.equals(ctx.user._id)) throw new HttpError(400, 'You cannot delete your own account.');
  const result = await ctx.db.users.deleteOne({ _id: id });
  if (!result.deletedCount) throw new HttpError(404, 'User not found.');
  await Promise.all([
    ctx.db.registrations.deleteMany({ userId: id }),
    ctx.db.queries.deleteMany({ userId: id }),
    ctx.db.sessions.deleteMany({ userId: id })
  ]);
  lib.sendJson(ctx.res, 200, { success: true, message: 'User and their data were deleted.' });
}

// ========================================================
// ROUTE TABLE   [method, path, who may call it, handler]
// access: 'public' | 'user' (role user only) | 'admin'
// ========================================================
const routes = [
  ['POST', '/api/register', 'public', signup],
  ['POST', '/api/login', 'public', login],
  ['POST', '/api/logout', 'public', logout],
  ['GET', '/api/me', 'public', me],

  ['GET', '/api/events', 'public', listEvents],
  ['POST', '/api/events', 'admin', createEvent],
  ['PUT', '/api/events/:id', 'admin', updateEvent],
  ['DELETE', '/api/events/:id', 'admin', deleteEvent],

  ['POST', '/api/events/:id/register', 'user', registerForEvent],
  ['DELETE', '/api/events/:id/register', 'user', cancelRegistration],

  ['GET', '/api/events/:id/queries', 'public', listEventQueries],
  ['POST', '/api/events/:id/queries', 'user', postQuery],

  ['GET', '/api/admin/registrations', 'admin', adminListRegistrations],
  ['DELETE', '/api/admin/registrations/:id', 'admin', adminDeleteRegistration],
  ['GET', '/api/admin/export', 'admin', adminExport],
  ['GET', '/api/admin/queries', 'admin', adminListQueries],
  ['PUT', '/api/admin/queries/:id', 'admin', adminAnswerQuery],
  ['DELETE', '/api/admin/queries/:id', 'admin', adminDeleteQuery],
  ['GET', '/api/admin/users', 'admin', adminListUsers],
  ['POST', '/api/admin/users', 'admin', adminCreateUser],
  ['DELETE', '/api/admin/users/:id', 'admin', adminDeleteUser]
].map(([method, pattern, access, handler]) => ({
  method,
  access,
  handler,
  regex: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$')
}));

// Dispatches an /api request, enforcing the route's access level.
async function handleApi(req, res, url, db) {
  const matches = routes.filter(r => r.regex.test(url.pathname));
  if (matches.length === 0) {
    lib.sendJson(res, 404, { success: false, message: 'API endpoint not found.' });
    return;
  }
  const route = matches.find(r => r.method === req.method);
  if (!route) {
    lib.sendJson(res, 405, { success: false, message: 'Method Not Allowed.' });
    return;
  }

  try {
    const user = await lib.getSessionUser(db, req);
    if (route.access !== 'public') {
      if (!user) throw new HttpError(401, 'Please log in to continue.');
      if (route.access === 'admin' && user.role !== 'admin') throw new HttpError(403, 'Admin access required.');
      if (route.access === 'user' && user.role !== 'user') {
        throw new HttpError(403, 'Only student accounts can do this. Admins manage events from the admin panel.');
      }
    }
    const ctx = {
      req,
      res,
      url,
      db,
      user,
      params: route.regex.exec(url.pathname).groups || {},
      body: () => lib.readJson(req)
    };
    await route.handler(ctx);
  } catch (err) {
    if (err instanceof HttpError) {
      lib.sendJson(res, err.status, { success: false, message: err.message });
    } else {
      console.error('Unhandled API error:', err);
      if (!res.headersSent) {
        lib.sendJson(res, 500, { success: false, message: 'Internal server error.' });
      }
    }
  }
}

module.exports = { handleApi };
