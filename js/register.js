// ========================================================
// CampusHub - Create Account
// Client-side validation for instant feedback, then
// POST /api/register (the server re-validates everything and
// always creates a normal "user" account). Event registration
// happens afterwards from the Events page.
// ========================================================

const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");
const fullNameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
const prnInput = document.getElementById("prn");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

function showRegisterMessage(message, type) {
  registerMessage.textContent = message;
  registerMessage.className = "form-message " + type;
}

function clearMessage() {
  if (registerMessage.textContent !== "") {
    registerMessage.textContent = "";
    registerMessage.className = "form-message";
  }
}

[fullNameInput, emailInput, prnInput, passwordInput, confirmPasswordInput].forEach(function (input) {
  input.addEventListener("input", clearMessage);
});

// Already logged in? No need to sign up again.
CH.ready.then(function (user) {
  if (user) window.location.href = user.role === "admin" ? "admin.html" : "events.html";
});

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
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
    showRegisterMessage("Password must contain at least 8 characters.", "error");
    passwordInput.focus();
    return;
  }
  if (password !== confirmPassword) {
    showRegisterMessage("Passwords do not match. Please re-enter.", "error");
    confirmPasswordInput.focus();
    return;
  }

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
    });
});
