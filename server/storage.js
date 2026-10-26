// ========================================================
// CampusHub - Data Storage & Seed Management (storage.js)
// Simple JSON file storage with safe atomic writes.
// Manages users.json, events.json, and registrations.json.
// ========================================================

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Directory paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --------------------------------------------------------
// Safe Atomic JSON File Helpers
// Writing to a temporary file first before renaming ensures
// files are never corrupted if a crash or concurrent write occurs.
// --------------------------------------------------------

function readJsonFile(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      writeJsonFile(filePath, defaultData);
      return defaultData;
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? parsed : defaultData;
  } catch (error) {
    console.error(`Error reading ${path.basename(filePath)}:`, error.message);
    return defaultData;
  }
}

function writeJsonFile(filePath, data) {
  try {
    const tempPath = `${filePath}.tmp_${Date.now()}`;
    const jsonString = JSON.stringify(data, null, 2);
    // Write to temporary file
    fs.writeFileSync(tempPath, jsonString, 'utf8');
    // Atomically replace target file
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (error) {
    console.error(`Error saving ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// --------------------------------------------------------
// Getters and Setters for each data entity
// --------------------------------------------------------

function getUsers() {
  return readJsonFile(USERS_FILE, []);
}

function saveUsers(users) {
  return writeJsonFile(USERS_FILE, users);
}

function getEvents() {
  return readJsonFile(EVENTS_FILE, []);
}

function saveEvents(events) {
  return writeJsonFile(EVENTS_FILE, events);
}

function getRegistrations() {
  return readJsonFile(REGISTRATIONS_FILE, []);
}

function saveRegistrations(registrations) {
  return writeJsonFile(REGISTRATIONS_FILE, registrations);
}

// --------------------------------------------------------
// Default Seed Events (Preserves existing website content)
// --------------------------------------------------------

const DEFAULT_EVENTS = [
  {
    id: 'evt_1',
    title: 'Code Sprint Hackathon',
    category: 'Technical',
    date: '2026-09-12',
    time: '9:00 AM – 9:00 AM (24 hrs)',
    venue: 'CS Block, Lab 3',
    description: 'A 24-hour coding marathon where teams build solutions to real-world problems and compete for prizes.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=500&q=80',
    capacity: 60,
    registeredCount: 0,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_2',
    title: 'Rhythm Night',
    category: 'Cultural',
    date: '2026-09-18',
    time: '6:30 PM',
    venue: 'Open Air Theatre',
    description: 'An evening of music, dance and drama performed by talented students from every department.',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500&q=80',
    capacity: 200,
    registeredCount: 0,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_3',
    title: 'Inter-College Sports Meet',
    category: 'Sports',
    date: '2026-09-22',
    time: '8:00 AM',
    venue: 'Main Ground',
    description: 'Athletics, football and basketball tournaments between college teams across the region.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80',
    capacity: 100,
    registeredCount: 0,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_4',
    title: 'AI & Machine Learning Workshop',
    category: 'Workshop',
    date: '2026-09-28',
    time: '10:00 AM',
    venue: 'Seminar Hall 2',
    description: 'Hands-on session covering the basics of AI and machine learning tools, led by industry experts.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=500&q=80',
    capacity: 50,
    registeredCount: 0,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_5',
    title: 'Robotics Expo',
    category: 'Technical',
    date: '2026-10-03',
    time: '11:00 AM',
    venue: 'Mechanical Block',
    description: 'Showcasing student-built robots and automation projects with live demonstrations.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80',
    capacity: 80,
    registeredCount: 0,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_6',
    title: 'Art & Photography Exhibition',
    category: 'Cultural',
    date: '2026-10-06',
    time: '4:00 PM',
    venue: 'Art Gallery Hall',
    description: 'A curated exhibition of student artwork, sketches and photography projects.',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=500&q=80',
    capacity: 120,
    registeredCount: 0,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_7',
    title: '3x3 Basketball Championship',
    category: 'Sports',
    date: '2026-10-09',
    time: '3:00 PM',
    venue: 'Indoor Sports Complex',
    description: 'Fast-paced 3-on-3 basketball tournament open to all department teams.',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=500&q=80',
    capacity: 40,
    registeredCount: 0,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_8',
    title: 'Public Speaking Bootcamp',
    category: 'Workshop',
    date: '2026-10-14',
    time: '2:00 PM',
    venue: 'Seminar Hall 1',
    description: 'Build confidence and communication skills through guided practice sessions.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=80',
    capacity: 45,
    registeredCount: 0,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  }
];

// --------------------------------------------------------
// Initialize Database and Seed Default Accounts & Events
// --------------------------------------------------------

async function initializeStorage() {
  // 1. Initialize Users (ensure initial Admin and Demo Student exist)
  let users = getUsers();

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@campushub.edu').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const adminName = process.env.ADMIN_NAME || 'Campus Administrator';

  const existingAdmin = users.find(u => u.email.toLowerCase() === adminEmail);
  if (!existingAdmin) {
    const saltRounds = 10;
    const adminHash = await bcrypt.hash(adminPassword, saltRounds);

    const adminUser = {
      id: 'usr_admin',
      fullName: adminName,
      email: adminEmail,
      collegeId: 'FACULTY-001',
      yearOfStudy: 'Faculty / Admin',
      role: 'admin',
      passwordHash: adminHash,
      createdAt: new Date().toISOString()
    };
    users.push(adminUser);
    console.log(`[Storage] Initialized Admin account: ${adminEmail}`);
  }

  // Ensure a Demo Student account exists for effortless faculty testing
  const demoStudentEmail = 'sakshi@campushub.edu';
  const existingStudent = users.find(u => u.email.toLowerCase() === demoStudentEmail);
  if (!existingStudent) {
    const studentHash = await bcrypt.hash('Student@123', 10);
    const demoStudent = {
      id: 'usr_sakshi',
      fullName: 'Sakshi Shewale',
      email: demoStudentEmail,
      collegeId: 'CS2026045',
      yearOfStudy: '3rd Year',
      role: 'student',
      passwordHash: studentHash,
      createdAt: new Date().toISOString()
    };
    users.push(demoStudent);
    console.log(`[Storage] Initialized Demo Student account: ${demoStudentEmail}`);
  }

  saveUsers(users);

  // 2. Initialize Events (seed if empty)
  let events = getEvents();
  if (events.length === 0) {
    events = DEFAULT_EVENTS;
    saveEvents(events);
    console.log(`[Storage] Seeded ${DEFAULT_EVENTS.length} default campus events.`);
  }

  // 3. Initialize Registrations (ensure file exists)
  let registrations = getRegistrations();
  if (!registrations) {
    saveRegistrations([]);
  }

  // Recalculate registeredCount on events based on active confirmed registrations
  recalculateEventSeatCounts();
}

// Helper: Synchronize registeredCount with active registrations
function recalculateEventSeatCounts() {
  const events = getEvents();
  const registrations = getRegistrations();

  let modified = false;
  events.forEach(event => {
    const activeCount = registrations.filter(
      r => r.eventId === event.id && r.status === 'Confirmed'
    ).length;

    if (event.registeredCount !== activeCount) {
      event.registeredCount = activeCount;
      modified = true;
    }
  });

  if (modified) {
    saveEvents(events);
  }
}

module.exports = {
  getUsers,
  saveUsers,
  getEvents,
  saveEvents,
  getRegistrations,
  saveRegistrations,
  initializeStorage,
  recalculateEventSeatCounts
};
