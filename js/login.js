// ========================================================
<<<<<<< HEAD
// CampusHub - Login Handler (login.js)
// Client-side validation + Node.js Express Server Authentication
// Communicates with POST /api/auth/login.
// Role-based redirection:
// - Student -> student-dashboard.html
// - Admin   -> admin-dashboard.html
=======
// CampusHub - Login (admin and user)
// Validates input, then authenticates against POST /api/login.
// Admins are sent to the admin panel, users to the events page.
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
// ========================================================

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("login-submit-btn");

<<<<<<< HEAD
// Helper function to display messages
=======
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
function showLoginMessage(message, type) {
  if (!loginMessage) return;
  loginMessage.textContent = message;
  loginMessage.className = "form-message " + type;
}

<<<<<<< HEAD
// Clear message when inputs change
[emailInput, passwordInput].forEach(input => {
  if (input) {
    input.addEventListener("input", () => {
      if (loginMessage.textContent !== "") {
        loginMessage.textContent = "";
        loginMessage.className = "form-message";
      }
    });
  }
});

// Demo Credentials Auto-Fill
const fillStudentBtn = document.getElementById("fill-student-btn");
const fillAdminBtn = document.getElementById("fill-admin-btn");

if (fillStudentBtn) {
  fillStudentBtn.addEventListener("click", () => {
    emailInput.value = "sakshi@campushub.edu";
    passwordInput.value = "Student@123";
    showLoginMessage("Student demo credentials filled. Click Login to sign in.", "success");
  });
}

if (fillAdminBtn) {
  fillAdminBtn.addEventListener("click", () => {
    emailInput.value = "admin@campushub.edu";
    passwordInput.value = "Admin@12345";
    showLoginMessage("Admin demo credentials filled. Click Login to sign in.", "success");
  });
}

// Form Submission Event
loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Regular expression to check email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 1. Client-Side Validation
  if (!email) {
=======
function redirectFor(user) {
  window.location.href = user.role === "admin" ? "admin.html" : "events.html";
}

// Already logged in? Skip the form.
CH.ready.then(function (user) {
  if (user) redirectFor(user);
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.value.trim()) {
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
    showLoginMessage("Please enter your email address.", "error");
    emailInput.focus();
    return;
  }
  if (!emailPattern.test(email)) {
    showLoginMessage("Please enter a valid email address (e.g. you@college.edu).", "error");
    emailInput.focus();
    return;
  }
<<<<<<< HEAD
  if (!password) {
=======
  if (!password.value) {
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
    showLoginMessage("Please enter your password.", "error");
    passwordInput.focus();
    return;
  }

<<<<<<< HEAD
  // 2. Server Authentication (POST /api/auth/login)
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying Credentials...";
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });

    const result = await response.json();

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }

    if (response.ok && result.success) {
      showLoginMessage(result.message || "Login successful! Redirecting...", "success");

      // Check URL for redirect parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get("redirect");

      setTimeout(() => {
        if (result.user && result.user.role === "admin") {
          window.location.href = "admin-dashboard.html";
        } else if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = "student-dashboard.html";
        }
      }, 700);

    } else {
      // Server returned validation or authentication error (400, 401, 429)
      showLoginMessage(result.message || "Invalid email or password.", "error");
    }

  } catch (error) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
    console.error("Login request error:", error);
    showLoginMessage("Unable to connect to the server. Please ensure the server is running.", "error");
  }
=======
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  CH.api("/api/login", { method: "POST", body: { email: email.value.trim(), password: password.value } })
    .then(function (data) {
      showLoginMessage("Login successful. Redirecting...", "success");
      redirectFor(data.user);
    })
    .catch(function (error) {
      submitBtn.disabled = false;
      showLoginMessage(error.message, "error");
    });
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
});
