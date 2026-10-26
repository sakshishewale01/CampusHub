// ========================================================
<<<<<<< HEAD
// CampusHub - Student Registration Handler (register.js)
// Handles:
// 1. Client-side validation for instant UX feedback.
// 2. Account creation via POST /api/auth/register.
// 3. Optional immediate event registration via POST /api/registrations.
// 4. Live rendering of verified registration records.
// ========================================================

// 1. Stored registrations array
let registrations = [];

// 2. DOM Elements
=======
// CampusHub - Create Account
// Client-side validation for instant feedback, then
// POST /api/register (the server re-validates everything and
// always creates a normal "user" account). Event registration
// happens afterwards from the Events page.
// ========================================================

>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");
const fullNameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
<<<<<<< HEAD
const collegeIdInput = document.getElementById("collegeid");
const yearSelect = document.getElementById("year-of-study");
const eventSelect = document.getElementById("event-select");
=======
const prnInput = document.getElementById("prn");
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const submitBtn = document.getElementById("register-submit-btn");

<<<<<<< HEAD
const regBadge = document.getElementById("reg-badge");
const regList = document.getElementById("reg-list");

// 3. Helper: Display Message
=======
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
function showRegisterMessage(message, type) {
  if (!registerMessage) return;
  registerMessage.textContent = message;
  registerMessage.className = "form-message " + type;
}

<<<<<<< HEAD
// 4. Helper: Clear Message
=======
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
function clearMessage() {
  if (registerMessage && registerMessage.textContent !== "") {
    registerMessage.textContent = "";
    registerMessage.className = "form-message";
  }
}

[fullNameInput, emailInput, prnInput, passwordInput, confirmPasswordInput].forEach(function (input) {
  input.addEventListener("input", clearMessage);
});

<<<<<<< HEAD
  if (regBadge) {
    regBadge.textContent = registrations.length + " saved";
  }

  if (registrations.length === 0) {
    regList.innerHTML = '<p class="reg-empty" id="reg-empty">No registrations recorded yet.</p>';
    return;
  }

  let html = "";
  // Show most recent registrations first
  const displayList = registrations.slice().reverse().slice(0, 5);

  displayList.forEach(function (reg) {
    const studentName = reg.fullName || reg.studentName || "Student";
    const eventName = reg.selectedEvent || reg.eventTitle || "General Account";
    const date = reg.registrationDate || reg.registeredAt || "Recent";

    html += '<div class="reg-item">';
    html += '  <div class="reg-item-info">';
    html += '    <strong>' + studentName + '</strong>';
    html += '    <span>' + eventName + ' &bull; ' + (reg.collegeId || '') + ' &bull; ' + date + '</span>';
    html += '  </div>';
    html += '  <span class="reg-item-tag">' + (reg.status || 'Verified') + '</span>';
    html += '</div>';
  });

  regList.innerHTML = html;
}

// 6. Fetch existing registrations from server
async function loadRegistrations() {
  try {
    const res = await fetch("/api/registrations");
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.registrations)) {
        registrations = data.registrations;
        renderRegistrations();
      }
    }
  } catch (error) {
    console.warn("Could not load registrations list:", error);
  }
}

// 7. Auto-select event if passed in URL query param (?event=...)
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

// 8. Attach input listeners to clear old errors
[fullNameInput, emailInput, collegeIdInput, yearSelect, eventSelect, passwordInput, confirmPasswordInput].forEach(function (input) {
  if (input) {
    input.addEventListener("input", clearMessage);
    input.addEventListener("change", clearMessage);
  }
});

// 9. Handle Form Submission
registerForm.addEventListener("submit", async function (event) {
=======
// Already logged in? No need to sign up again.
CH.ready.then(function (user) {
  if (user) window.location.href = user.role === "admin" ? "admin.html" : "events.html";
});

registerForm.addEventListener("submit", function (event) {
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
  event.preventDefault();

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
<<<<<<< HEAD
  const collegeId = collegeIdInput.value.trim();
  const yearOfStudy = yearSelect ? yearSelect.value : "3rd Year";
  const selectedEventTitle = eventSelect ? eventSelect.value.trim() : "";
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---------- CLIENT-SIDE VALIDATION ----------
  if (!fullName || fullName.length < 2) {
    showRegisterMessage("Please enter your full name (at least 2 characters).", "error");
    fullNameInput.focus();
    return;
  }

  if (!email || !emailPattern.test(email)) {
    showRegisterMessage("Please enter a valid email address.", "error");
    emailInput.focus();
    return;
  }

  if (!collegeId || collegeId.length < 2) {
    showRegisterMessage("Please enter your College ID.", "error");
    collegeIdInput.focus();
    return;
  }

  if (!password || password.length < 8) {
=======
  const prn = prnInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (fullName.length < 2) {
    showRegisterMessage("Full name must contain at least 2 characters.", "error");
    fullNameInput.focus();
    return;
  }
  if (!emailPattern.test(email)) {
    showRegisterMessage("Please enter a valid email address (e.g. user@college.edu).", "error");
    emailInput.focus();
    return;
  }
  if (!/^[0-9]{12}$/.test(prn)) {
    showRegisterMessage("PRN must be exactly 12 digits.", "error");
    prnInput.focus();
    return;
  }
  if (password.length < 8) {
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
    showRegisterMessage("Password must contain at least 8 characters.", "error");
    passwordInput.focus();
    return;
  }
<<<<<<< HEAD

=======
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
  if (password !== confirmPassword) {
    showRegisterMessage("Passwords do not match. Please re-enter.", "error");
    confirmPasswordInput.focus();
    return;
  }

<<<<<<< HEAD
  // ---------- SERVER SUBMISSION ----------
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account on Server...";
  }

  try {
    // 1. Create Student Account
    const registerResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        collegeId,
        yearOfStudy,
        password,
        confirmPassword
      })
=======
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  CH.api("/api/register", {
    method: "POST",
    body: { fullName: fullName, email: email, prn: prn, password: password, confirmPassword: confirmPassword }
  })
    .then(function () {
      showRegisterMessage("Account created! Redirecting to events...", "success");
      // Keep the event the user was looking at, so they can register right away
      const eventParam = new URLSearchParams(window.location.search).get("event");
      window.location.href = "events.html" + (eventParam ? "?event=" + encodeURIComponent(eventParam) : "");
    })
    .catch(function (error) {
      submitBtn.disabled = false;
      showRegisterMessage(error.message, "error");
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
    });

    const regResult = await registerResponse.json();

    if (!registerResponse.ok || !regResult.success) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Student Account";
      }
      showRegisterMessage(regResult.message || "Registration failed. Please check your inputs.", "error");
      return;
    }

    // 2. If user also selected an event to register for, call event registration
    if (selectedEventTitle) {
      try {
        // Fetch events to get matching eventId
        const eventsRes = await fetch("/api/events");
        const eventsData = await eventsRes.json();
        const matchedEvent = (eventsData.events || []).find(e =>
          e.title.toLowerCase() === selectedEventTitle.toLowerCase()
        );

        if (matchedEvent) {
          await fetch("/api/registrations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId: matchedEvent.id })
          });
        }
      } catch (eventErr) {
        console.warn("Event auto-registration notice:", eventErr);
      }
    }

    // 3. Success Feedback and Redirection
    showRegisterMessage("Account created successfully! Welcome to CampusHub. Redirecting to your dashboard...", "success");

    await loadRegistrations();

    setTimeout(() => {
      window.location.href = "student-dashboard.html";
    }, 1200);

  } catch (netErr) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Student Account";
    }
    console.error("Registration request error:", netErr);
    showRegisterMessage("Unable to reach the server. Please ensure the backend is running.", "error");
  }
});
<<<<<<< HEAD

// 10. Initial load
loadRegistrations();
checkUrlEventParam();
=======
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
