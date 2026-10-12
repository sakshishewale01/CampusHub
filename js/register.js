// ========================================================
// CampusHub - Registration Form (Assignment 3)
// Connected to Node.js HTTP Server for Server-Side Validation.
// Features:
// 1. Client-side validation for instant UX feedback.
// 2. Submits payload to Node.js backend: POST /api/register.
// 3. Server independently re-validates all inputs.
// 4. Server checks duplicates, hashes password with crypto,
//    and saves records to server/data/registrations.json.
// 5. Displays server response (201 Created, 400 Bad Request, 409 Conflict).
// 6. Synchronizes registered events with the server.
// ========================================================

// 1. Global Array to store registration objects
let registrations = [];

// localStorage key name for client-side persistence fallback
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
function renderRegistrations() {
  if (!regList) return;

  // Update count badge
  if (regBadge) {
    regBadge.textContent = registrations.length + " saved";
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

// 6. Load saved registrations (sync with server and localStorage fallback)
function loadRegistrations() {
  // First load from localStorage for immediate display
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      registrations = JSON.parse(storedData);
      if (!Array.isArray(registrations)) {
        registrations = [];
      }
    } else {
      registrations = [];
    }
  } catch (error) {
    registrations = [];
  }
  renderRegistrations();

  // Next, fetch latest validated registrations from Node.js server
  fetch('/api/registrations')
    .then(function (res) {
      if (res.ok) {
        return res.json();
      }
      throw new Error('Server not available');
    })
    .then(function (data) {
      if (data && Array.isArray(data.registrations)) {
        registrations = data.registrations.map(function (item) {
          return {
            id: item.id,
            studentName: item.fullName || item.studentName,
            email: item.email,
            collegeId: item.collegeId,
            selectedEvent: item.selectedEvent,
            registrationDate: item.registrationDate
          };
        });
        saveRegistrations();
        renderRegistrations();
      }
    })
    .catch(function () {
      // Server not connected (e.g. running statically); localStorage remains active
    });
}

// 7. Save registrations array to localStorage
function saveRegistrations() {
  try {
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

// 10. Form Submit Event Handler (Client validation -> Node.js POST -> Server validation)
registerForm.addEventListener("submit", function (event) {
  // Prevent page refresh on form submission
  event.preventDefault();

  const studentName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const collegeId = collegeIdInput.value.trim();
  const selectedEvent = eventSelect ? eventSelect.value.trim() : "";
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Regular expression to check standard email structure
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---------- STEP A: BASIC CLIENT-SIDE VALIDATION ----------

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

  if (!collegeId) {
    showRegisterMessage("Please enter your College ID.", "error");
    collegeIdInput.focus();
    return;
  }

  if (!selectedEvent) {
    showRegisterMessage("Please select an event to register for.", "error");
    eventSelect.focus();
    return;
  }

  if (!password) {
    showRegisterMessage("Please enter a password.", "error");
    passwordInput.focus();
    return;
  }
  if (password.length < 8) {
    showRegisterMessage("Password must contain at least 8 characters.", "error");
    passwordInput.focus();
    return;
  }

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

  // ---------- STEP B: SEND DATA TO NODE.JS SERVER (SERVER-SIDE VALIDATION) ----------

  const submitBtn = registerForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Validating on Server...";
  }

  // Create payload for Node.js server
  const registrationPayload = {
    fullName: studentName,
    email: email,
    collegeId: collegeId,
    selectedEvent: selectedEvent,
    password: password,
    confirmPassword: confirmPassword
  };

  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(registrationPayload)
  })
    .then(function (response) {
      return response.json().then(function (data) {
        return {
          status: response.status,
          ok: response.ok,
          data: data
        };
      });
    })
    .then(function (result) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Register for Event";
      }

      if (result.ok) {
        // Status 201 Created: Server accepted and saved the registration
        showRegisterMessage(result.data.message || "Registration successful! Record validated on server.", "success");
        registerForm.reset();

        // Update local registrations list with sanitized server data
        const savedRecord = result.data.registration || {
          id: Date.now(),
          studentName: studentName,
          email: email,
          collegeId: collegeId,
          selectedEvent: selectedEvent,
          registrationDate: new Date().toLocaleDateString("en-GB")
        };

        registrations.push({
          id: savedRecord.id,
          studentName: savedRecord.fullName || studentName,
          email: savedRecord.email || email,
          collegeId: savedRecord.collegeId || collegeId,
          selectedEvent: savedRecord.selectedEvent || selectedEvent,
          registrationDate: savedRecord.registrationDate || new Date().toLocaleDateString("en-GB")
        });

        saveRegistrations();
        renderRegistrations();
      } else {
        // Status 400 Bad Request or 409 Conflict: Server rejected registration
        showRegisterMessage(result.data.message || "Server validation error. Please check your input.", "error");
      }
    })
    .catch(function (networkError) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Register for Event";
      }
      console.warn("Server connection notice:", networkError);
      showRegisterMessage("Unable to reach the Node.js server at /api/register. Please verify server.js is running.", "error");
    });
});

// 11. Initial setup when page loads
loadRegistrations();
checkUrlEventParam();
