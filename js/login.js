// ========================================================
// CampusHub - Login Form Validation (Assignment 2)
// Demonstrates client-side validation using vanilla JavaScript.
// Note: This is for front-end demonstration only. No backend
// database or server authentication is connected in this demo.
// ========================================================

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

// Helper function to display error or success messages
function showLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className = "form-message " + type;
}

loginForm.addEventListener("submit", function (event) {
  // Prevent page refresh on form submission
  event.preventDefault();

  // Retrieve input elements by ID
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  // Regular expression to check standard email structure
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 1. Validate Email Address
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

  // 2. Validate Password
  if (!password.value) {
    showLoginMessage("Please enter your password.", "error");
    password.focus();
    return;
  }

  // 3. Validation Passed: Show success message and clear form inputs
  showLoginMessage("Login details are valid! (Demo note: Client-side validation passed. Server authentication will be added in future assignments.)", "success");
  loginForm.reset();
});
