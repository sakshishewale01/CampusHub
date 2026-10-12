// ========================================================
// CampusHub - Registration Form & Storage (Assignment 2)
// Requirements:
// 1. Validate all inputs before saving.
// 2. Prevent invalid or duplicate data from being stored.
// 3. Store valid registrations in an Array named 'registrations'.
// 4. Convert Array to JSON using JSON.stringify() and save to localStorage.
// 5. Read JSON using JSON.parse() on page load to restore stored records.
// 6. Demonstrate stored data dynamically on the page.
// Note: Passwords are only checked for validation and never stored.
// ========================================================

// 1. Global Array to store registration objects
let registrations = [];

// localStorage key name for JSON storage
const STORAGE_KEY = "campushub_registrations";

// 2. DOM Elements
const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");
const fullNameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
const collegeIdInput = document.getElementById("collegeid");
const eventSelect = document.getElementById("event-select");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

// Preview elements to display stored registrations
const regBadge = document.getElementById("reg-badge");
const regList = document.getElementById("reg-list");

// 3. Helper function: Display messages (error or success)
function showRegisterMessage(message, type) {
  registerMessage.textContent = message;
  registerMessage.className = "form-message " + type;
}

// 4. Helper function: Clear message when user modifies any input
function clearMessage() {
  if (registerMessage.textContent !== "") {
    registerMessage.textContent = "";
    registerMessage.className = "form-message";
  }
}

// 5. Render Stored Registrations to the DOM
// Demonstrates that data in the 'registrations' Array is stored and accessible
function renderRegistrations() {
  if (!regList) return;

  // Update count badge
  if (regBadge) {
    regBadge.textContent = registrations.length + (registrations.length === 1 ? " saved" : " saved");
  }

  // If array is empty, display placeholder text
  if (registrations.length === 0) {
    regList.innerHTML = '<p class="reg-empty" id="reg-empty">No registrations stored yet. Register for an event above to save data.</p>';
    return;
  }

  // Build HTML list using array iteration
  let html = "";
  for (let i = registrations.length - 1; i >= 0; i--) {
    const reg = registrations[i];
    html += '<div class="reg-item">';
    html += '  <div class="reg-item-info">';
    html += '    <strong>' + reg.studentName + '</strong>';
    html += '    <span>' + reg.selectedEvent + ' &bull; ' + reg.collegeId + ' &bull; ' + reg.registrationDate + '</span>';
    html += '  </div>';
    html += '  <span class="reg-item-tag">Registered</span>';
    html += '</div>';
  }

  regList.innerHTML = html;
}

// 6. Load saved registrations from localStorage using JSON.parse()
function loadRegistrations() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      // Convert stored JSON string back into a JavaScript Array of objects
      registrations = JSON.parse(storedData);
      if (!Array.isArray(registrations)) {
        registrations = [];
      }
    } else {
      registrations = [];
    }
  } catch (error) {
    console.error("Error parsing stored JSON data:", error);
    registrations = [];
  }

  // Display loaded data in the DOM preview
  renderRegistrations();
}

// 7. Save registrations array to localStorage using JSON.stringify()
function saveRegistrations() {
  try {
    // Convert JavaScript Array into a JSON formatted string
    const jsonString = JSON.stringify(registrations);
    localStorage.setItem(STORAGE_KEY, jsonString);
  } catch (error) {
    console.error("Error saving JSON data to localStorage:", error);
  }
}

// 8. Auto-select event if passed via URL query parameter (e.g. from Events modal)
function checkUrlEventParam() {
  if (!eventSelect) return;
  const urlParams = new URLSearchParams(window.location.search);
  const eventParam = urlParams.get("event");
  if (eventParam) {
    for (let i = 0; i < eventSelect.options.length; i++) {
      if (eventSelect.options[i].value.toLowerCase() === eventParam.toLowerCase()) {
        eventSelect.selectedIndex = i;
        break;
      }
    }
  }
}

// 9. Attach input/change listeners to clear old error messages as the user types
[fullNameInput, emailInput, collegeIdInput, eventSelect, passwordInput, confirmPasswordInput].forEach(function (input) {
  if (input) {
    input.addEventListener("input", clearMessage);
    input.addEventListener("change", clearMessage);
  }
});

// 10. Form Submit Event Handler (Validation -> Array Push -> JSON Conversion -> Storage)
registerForm.addEventListener("submit", function (event) {
  // Prevent page refresh on form submission
  event.preventDefault();

  const studentName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const collegeId = collegeIdInput.value.trim();
  const selectedEvent = eventSelect ? eventSelect.value.trim() : "";
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Regular expression to check standard email structure (e.g. user@domain.ext)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---------- VALIDATION CHECKS BEFORE SAVING ----------

  // 1. Validate Student Name
  if (!studentName) {
    showRegisterMessage("Please enter your full name.", "error");
    fullNameInput.focus();
    return;
  }
  if (studentName.length < 2) {
    showRegisterMessage("Full name must contain at least 2 characters.", "error");
    fullNameInput.focus();
    return;
  }

  // 2. Validate Email Address
  if (!email) {
    showRegisterMessage("Please enter your email address.", "error");
    emailInput.focus();
    return;
  }
  if (!emailPattern.test(email)) {
    showRegisterMessage("Please enter a valid email address (e.g. user@college.edu).", "error");
    emailInput.focus();
    return;
  }

  // 3. Validate College ID
  if (!collegeId) {
    showRegisterMessage("Please enter your College ID.", "error");
    collegeIdInput.focus();
    return;
  }

  // 4. Validate Event Selection
  if (!selectedEvent) {
    showRegisterMessage("Please select an event to register for.", "error");
    eventSelect.focus();
    return;
  }

  // 5. Validate Password
  if (!password) {
    showRegisterMessage("Please enter a password.", "error");
    passwordInput.focus();
    return;
  }
  if (password.length < 6) {
    showRegisterMessage("Password must contain at least 6 characters.", "error");
    passwordInput.focus();
    return;
  }

  // 6. Validate Confirm Password & Match
  if (!confirmPassword) {
    showRegisterMessage("Please confirm your password.", "error");
    confirmPasswordInput.focus();
    return;
  }
  if (password !== confirmPassword) {
    showRegisterMessage("Passwords do not match. Please re-enter.", "error");
    confirmPasswordInput.focus();
    return;
  }

  // 7. Prevent Duplicate Registration (same student email for the same event)
  const isDuplicate = registrations.some(function (reg) {
    return reg.email.toLowerCase() === email.toLowerCase() && reg.selectedEvent === selectedEvent;
  });

  if (isDuplicate) {
    showRegisterMessage("You have already registered for \"" + selectedEvent + "\" with this email address.", "error");
    emailInput.focus();
    return;
  }

  // ---------- DATA IS VALID -> CREATE OBJECT, ADD TO ARRAY, CONVERT TO JSON ----------

  // Format today's date (e.g. "13 Oct 2026")
  const today = new Date();
  const dateFormatted = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  // Create the registration object (NOTE: Passwords are NOT saved for privacy and security)
  const registrationRecord = {
    id: Date.now(),
    studentName: studentName,
    email: email,
    collegeId: collegeId,
    selectedEvent: selectedEvent,
    registrationDate: dateFormatted
  };

  // Step 1: Add new registration object to the JavaScript Array using push()
  registrations.push(registrationRecord);

  // Step 2: Convert Array into JSON string using JSON.stringify() and save to localStorage
  saveRegistrations();

  // Step 3: Update DOM preview to display newly saved registration
  renderRegistrations();

  // Step 4: Show success confirmation message and reset form fields
  showRegisterMessage("Registration successful for \"" + selectedEvent + "\"! Data validated and saved to JSON array.", "success");
  registerForm.reset();
});

// 11. Initial setup when page loads
loadRegistrations();
checkUrlEventParam();
