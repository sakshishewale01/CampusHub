// ========================================================
// CampusHub - Login (admin and user)
// Validates input, then authenticates against POST /api/login.
// Admins are sent to the admin panel, users to the events page.
// ========================================================

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

function showLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className = "form-message " + type;
}

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
    showLoginMessage("Please enter your email address.", "error");
    email.focus();
    return;
  }
  if (!emailPattern.test(email.value.trim())) {
    showLoginMessage("Please enter a valid email address (e.g. you@college.edu).", "error");
    email.focus();
    return;
  }
  if (!password.value) {
    showLoginMessage("Please enter your password.", "error");
    password.focus();
    return;
  }

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
});
