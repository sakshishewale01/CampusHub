// ========================================================
// CampusHub 3.0 - Authentication Routes (Express)
// Handles student registration, login, logout, profile update,
// and current session verification.
// ========================================================

const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { requireStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Memory rate-limiting for failed login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 mins

function checkRateLimit(email) {
  const record = loginAttempts.get(email);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.attempts >= MAX_ATTEMPTS) {
    if (now - record.lastAttempt < LOCKOUT_TIME_MS) {
      const waitMinutes = Math.ceil((LOCKOUT_TIME_MS - (now - record.lastAttempt)) / 60000);
      return { allowed: false, waitMinutes };
    }
    loginAttempts.delete(email);
  }
  return { allowed: true };
}

function recordFailedLogin(email) {
  const record = loginAttempts.get(email) || { attempts: 0, lastAttempt: Date.now() };
  record.attempts += 1;
  record.lastAttempt = Date.now();
  loginAttempts.set(email, record);
}

function clearFailedLogin(email) {
  loginAttempts.delete(email);
}

// --------------------------------------------------------
// 1. GET /api/auth/me — Return current logged-in user
// --------------------------------------------------------
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      user: req.session.user
    });
  }
  return res.status(200).json({
    success: true,
    isAuthenticated: false,
    user: null
  });
});

// --------------------------------------------------------
// 2. POST /api/auth/register — Public student registration
// --------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, fullName, email, collegeId, yearOfStudy, password, confirmPassword } = req.body;
    const studentName = (name || fullName || '').trim();

    // Validation
    if (!studentName || studentName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your full name (minimum 2 characters).'
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!collegeId || collegeId.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your College ID.'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please re-enter.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const validYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post-Graduate'];
    const selectedYear = yearOfStudy && validYears.includes(yearOfStudy) ? yearOfStudy : '3rd Year';

    // Public registration always assigns role: 'student'
    const newStudent = await User.create({
      name: studentName,
      email: cleanEmail,
      collegeId: collegeId.trim(),
      yearOfStudy: selectedYear,
      password: passwordHash,
      role: 'student'
    });

    // Auto-login: regenerate session
    req.session.regenerate(err => {
      if (err) console.error('Session error on registration:', err);

      req.session.user = {
        id: newStudent._id.toString(),
        name: newStudent.name,
        fullName: newStudent.name,
        email: newStudent.email,
        collegeId: newStudent.collegeId,
        yearOfStudy: newStudent.yearOfStudy,
        role: newStudent.role
      };

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to CampusHub.',
        user: req.session.user
      });
    });

  } catch (error) {
    console.error('Registration route error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
});

// --------------------------------------------------------
// 3. POST /api/auth/login — Authenticate student or admin
// --------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check rate limit
    const rateCheck = checkRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Please wait ${rateCheck.waitMinutes} minutes before trying again.`
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      recordFailedLogin(cleanEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordFailedLogin(cleanEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    clearFailedLogin(cleanEmail);

    // Regenerate session to prevent fixation
    req.session.regenerate(err => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ success: false, message: 'Session error on login.' });
      }

      req.session.user = {
        id: user._id.toString(),
        name: user.name,
        fullName: user.name,
        email: user.email,
        collegeId: user.collegeId,
        yearOfStudy: user.yearOfStudy,
        role: user.role
      };

      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        user: req.session.user
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
});

// --------------------------------------------------------
// 4. POST /api/auth/logout — Destroy session
// --------------------------------------------------------
router.post('/logout', (req, res) => {
  if (!req.session) {
    return res.status(200).json({ success: true, message: 'Logged out.' });
  }

  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Error during logout.' });
    }
    res.clearCookie('campushub.sid');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
});

// --------------------------------------------------------
// 5. PUT /api/auth/profile — Update student profile
// --------------------------------------------------------
router.put('/profile', requireStudent, async (req, res) => {
  try {
    const { name, fullName, collegeId, yearOfStudy } = req.body;
    const updatedName = (name || fullName || '').trim();

    if (!updatedName || updatedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must contain at least 2 characters.'
      });
    }

    if (!collegeId || collegeId.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'College ID must contain at least 2 characters.'
      });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.name = updatedName;
    user.collegeId = collegeId.trim();
    if (yearOfStudy) user.yearOfStudy = yearOfStudy;
    await user.save();

    req.session.user.name = user.name;
    req.session.user.fullName = user.name;
    req.session.user.collegeId = user.collegeId;
    req.session.user.yearOfStudy = user.yearOfStudy;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: req.session.user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

module.exports = router;
