// ========================================================
// CampusHub - MongoDB connection, indexes and seed data
// ========================================================

const { MongoClient } = require('mongodb');
const { hashPassword } = require('./lib');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'campushub';

// Events shown on the site before an admin adds any of their own.
const SEED_EVENTS = [
  ['Code Sprint Hackathon', 'Technical', '2026-09-12', '9:00 AM – 9:00 AM (24 hrs)', 'CS Block, Lab 3',
    'A 24-hour coding marathon where teams build solutions to real-world problems and compete for prizes.',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=500&q=80'],
  ['Rhythm Night', 'Cultural', '2026-09-18', '6:30 PM', 'Open Air Theatre',
    'An evening of music, dance and drama performed by talented students from every department.',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500&q=80'],
  ['Inter-College Sports Meet', 'Sports', '2026-09-22', '8:00 AM', 'Main Ground',
    'Athletics, football and basketball tournaments between college teams across the region.',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80'],
  ['AI & Machine Learning Workshop', 'Workshop', '2026-09-28', '10:00 AM', 'Seminar Hall 2',
    'Hands-on session covering the basics of AI and machine learning tools, led by industry experts.',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=500&q=80'],
  ['Robotics Expo', 'Technical', '2026-10-03', '11:00 AM', 'Mechanical Block',
    'Showcasing student-built robots and automation projects with live demonstrations.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80'],
  ['Art & Photography Exhibition', 'Cultural', '2026-10-06', '4:00 PM', 'Art Gallery Hall',
    'A curated exhibition of student artwork, sketches and photography projects.',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=500&q=80'],
  ['3x3 Basketball Championship', 'Sports', '2026-10-09', '3:00 PM', 'Indoor Sports Complex',
    'Fast-paced 3-on-3 basketball tournament open to all department teams.',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=500&q=80'],
  ['Public Speaking Bootcamp', 'Workshop', '2026-10-14', '2:00 PM', 'Seminar Hall 1',
    'Build confidence and communication skills through guided practice sessions.',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=80']
];

async function connect() {
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const mdb = client.db(MONGODB_DB);

  const db = {
    client,
    users: mdb.collection('users'),
    events: mdb.collection('events'),
    registrations: mdb.collection('registrations'),
    queries: mdb.collection('queries'),
    sessions: mdb.collection('sessions')
  };

  await Promise.all([
    db.users.createIndex({ email: 1 }, { unique: true }),
    // A user can register for a given event only once
    db.registrations.createIndex({ userId: 1, eventId: 1 }, { unique: true }),
    db.registrations.createIndex({ eventId: 1 }),
    db.queries.createIndex({ eventId: 1, createdAt: -1 }),
    // MongoDB removes expired sessions automatically
    db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  ]);

  await migrate(db);
  await seed(db);
  return db;
}

// "College ID" was renamed to "PRN"; carry existing records over.
async function migrate(db) {
  await db.users.updateMany({ collegeId: { $exists: true } }, { $rename: { collegeId: 'prn' } });
  await db.registrations.updateMany({ collegeId: { $exists: true } }, { $rename: { collegeId: 'prn' } });
  await db.users.updateMany({ role: 'admin', prn: 'ADMIN' }, { $set: { prn: '' } });
  // Events created before paid/free existed are free
  await db.events.updateMany({ isPaid: { $exists: false } }, { $set: { isPaid: false, fee: 0 } });
  await db.registrations.updateMany({ fee: { $exists: false } }, { $set: { fee: 0 } });
}

async function seed(db) {
  if ((await db.events.countDocuments()) === 0) {
    await db.events.insertMany(SEED_EVENTS.map(([title, category, date, time, venue, description, image]) => ({
      title, category, date, time, venue, description, image, isPaid: false, fee: 0, createdAt: new Date()
    })));
    console.log(` - Seeded ${SEED_EVENTS.length} sample events`);
  }

  // Bootstrap the first admin account (change these via environment variables)
  if ((await db.users.countDocuments({ role: 'admin' })) === 0) {
    const email = (process.env.ADMIN_EMAIL || 'admin@campushub.edu').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const { salt, hash } = await hashPassword(password);
    await db.users.updateOne(
      { email },
      {
        $set: { role: 'admin' },
        $setOnInsert: {
          fullName: 'CampusHub Admin',
          email,
          prn: '',
          salt,
          passwordHash: hash,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(` - Created admin account: ${email}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log('   Using the DEFAULT admin password. Set ADMIN_EMAIL / ADMIN_PASSWORD before deploying.');
    }
  }
}

module.exports = { connect, MONGODB_URI, MONGODB_DB };
