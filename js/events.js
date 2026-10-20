// ========================================================
// CampusHub - Events Page
// Loads events from the API, then handles search, category
// filtering, sorting, the details modal, event registration
// and the per-event question board.
// ========================================================

const searchInput = document.getElementById("event-search");
const categoryButtons = document.querySelectorAll(".filter-chip");
const sortSelect = document.getElementById("event-sort");
const eventsGrid = document.querySelector(".events-list .events-grid");
const eventCount = document.getElementById("event-count");
const noResults = document.getElementById("no-results");

const eventModal = document.getElementById("event-modal");
const modalTitle = document.getElementById("modal-title");
const modalCategory = document.getElementById("modal-category");
const modalMeta = document.getElementById("modal-meta");
const modalDesc = document.getElementById("modal-desc");
const modalClose = document.getElementById("modal-close");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalRegisterBtn = document.getElementById("modal-register-btn");
const modalOverlay = document.getElementById("modal-overlay");
const modalStatus = document.getElementById("modal-status");
const queryList = document.getElementById("query-list");
const queryForm = document.getElementById("query-form");
const queryInput = document.getElementById("query-input");
const queryPrompt = document.getElementById("query-prompt");

let allEvents = [];
let currentUser = null;
let activeEvent = null;
let selectedCategory = "All";

// ---------- Rendering ----------
function eventMeta(event) {
  return '<span class="icon">📅 ' + CH.esc(CH.formatDate(event.date)) + "</span>" +
    '<span class="icon">⏰ ' + CH.esc(event.time) + "</span>" +
    '<span class="icon">📍 ' + CH.esc(event.venue) + "</span>" +
    '<span class="icon">💰 ' + (event.isPaid ? "Registration fee: ₹" + CH.esc(event.fee) : "Free entry") + "</span>";
}

function renderEvents() {
  const searchText = searchInput.value.trim().toLowerCase();

  const visible = allEvents.filter(function (event) {
    const categoryMatches = selectedCategory === "All" || event.category === selectedCategory;
    const searchMatches = event.title.toLowerCase().includes(searchText) ||
      event.description.toLowerCase().includes(searchText);
    return categoryMatches && searchMatches;
  });

  visible.sort(function (a, b) {
    if (sortSelect.value === "name") return a.title.localeCompare(b.title);
    return a.date.localeCompare(b.date);
  });

  eventsGrid.innerHTML = visible.map(function (event) {
    return '<article class="event-card" data-id="' + CH.esc(event.id) + '">' +
      '<div class="event-card-img"><span class="event-tag">' + CH.esc(event.category) + "</span>" +
      (event.completed ? '<span class="completed-tag">Completed</span>' : "") +
      (event.image ? '<img src="' + CH.esc(event.image) + '" alt="' + CH.esc(event.title) + '">' : "") +
      "</div>" +
      '<div class="event-card-body"><h3>' + CH.esc(event.title) + "</h3>" +
      '<div class="event-meta">' + eventMeta(event) + "</div>" +
      '<p class="event-desc">' + CH.esc(event.description) + "</p>" +
      (event.registered ? '<span class="registered-badge">✔ Registered</span>' : "") +
      '<a href="#" class="btn btn-secondary btn-small btn-block" data-details>View Details</a>' +
      "</div></article>";
  }).join("");

  eventCount.textContent = "Showing " + visible.length + " of " + allEvents.length + " events";
  noResults.style.display = visible.length === 0 ? "block" : "none";
}

// ---------- Filters ----------
categoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedCategory = button.dataset.category;
    categoryButtons.forEach(function (b) { b.classList.toggle("active", b === button); });
    renderEvents();
  });
});
searchInput.addEventListener("input", renderEvents);
sortSelect.addEventListener("change", renderEvents);
document.getElementById("event-controls").addEventListener("submit", function (e) { e.preventDefault(); });

// ---------- Modal ----------
function setStatus(message, type) {
  modalStatus.textContent = message || "";
  modalStatus.className = "form-message" + (message ? " " + type : "");
}

function updateRegisterButton() {
  modalRegisterBtn.disabled = false;
  if (activeEvent.completed && !(currentUser && currentUser.role === "admin")) {
    modalRegisterBtn.textContent = "Event Completed";
    modalRegisterBtn.className = "btn btn-secondary btn-small";
    modalRegisterBtn.disabled = true;
  } else if (!currentUser) {
    modalRegisterBtn.textContent = "Login to Register";
    modalRegisterBtn.className = "btn btn-primary btn-small";
  } else if (currentUser.role === "admin") {
    modalRegisterBtn.textContent = "Manage in Admin Panel";
    modalRegisterBtn.className = "btn btn-secondary btn-small";
  } else if (activeEvent.registered) {
    modalRegisterBtn.textContent = "Cancel Registration";
    modalRegisterBtn.className = "btn btn-secondary btn-small";
  } else {
    modalRegisterBtn.textContent = activeEvent.isPaid ? "Register (₹" + activeEvent.fee + ")" : "Register for Event";
    modalRegisterBtn.className = "btn btn-primary btn-small";
  }
}

function renderQueries(queries) {
  if (queries.length === 0) {
    queryList.innerHTML = '<p class="query-empty">No questions yet. Be the first to ask.</p>';
    return;
  }
  queryList.innerHTML = queries.map(function (q) {
    return '<div class="query-item"><p class="query-q"><strong>' + CH.esc(q.userName) + ":</strong> " + CH.esc(q.question) + "</p>" +
      (q.answer
        ? '<p class="query-a"><strong>Organizer:</strong> ' + CH.esc(q.answer) + "</p>"
        : '<p class="query-pending">Awaiting an answer</p>') +
      "</div>";
  }).join("");
}

function loadQueries() {
  queryList.innerHTML = '<p class="query-empty">Loading questions...</p>';
  CH.api("/api/events/" + encodeURIComponent(activeEvent.id) + "/queries")
    .then(function (data) { renderQueries(data.queries); })
    .catch(function () { queryList.innerHTML = '<p class="query-empty">Could not load questions.</p>'; });
}

function openEventModal(event) {
  activeEvent = event;
  modalTitle.textContent = event.title;
  modalCategory.textContent = event.category;
  modalMeta.innerHTML = eventMeta(event);
  modalDesc.textContent = event.description;
  setStatus("");
  updateRegisterButton();

  const isStudent = currentUser && currentUser.role === "user";
  queryForm.style.display = isStudent ? "block" : "none";
  queryPrompt.style.display = isStudent ? "none" : "block";
  queryPrompt.innerHTML = !currentUser
    ? '<a href="login.html">Login</a> or <a href="register.html">sign up</a> to ask a question about this event.'
    : "Admins answer questions from the Admin Panel.";
  queryInput.value = "";
  loadQueries();

  eventModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeEventModal() {
  eventModal.style.display = "none";
  document.body.style.overflow = "";
}

eventsGrid.addEventListener("click", function (e) {
  const button = e.target.closest("[data-details]");
  if (!button) return;
  e.preventDefault();
  const id = button.closest(".event-card").dataset.id;
  const event = allEvents.find(function (item) { return item.id === id; });
  if (event) openEventModal(event);
});

modalClose.addEventListener("click", closeEventModal);
modalCloseBtn.addEventListener("click", closeEventModal);
modalOverlay.addEventListener("click", closeEventModal);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && eventModal.style.display === "flex") closeEventModal();
});

modalRegisterBtn.addEventListener("click", function () {
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }
  if (currentUser.role === "admin") {
    window.location.href = "admin.html";
    return;
  }

  const registering = !activeEvent.registered;
  modalRegisterBtn.disabled = true;
  CH.api("/api/events/" + encodeURIComponent(activeEvent.id) + "/register", { method: registering ? "POST" : "DELETE" })
    .then(function (data) {
      activeEvent.registered = registering;
      setStatus(data.message, "success");
      renderEvents();
    })
    .catch(function (error) { setStatus(error.message, "error"); })
    .finally(function () {
      updateRegisterButton();
    });
});

queryForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const question = queryInput.value.trim();
  if (question.length < 5) {
    setStatus("Please write a question of at least 5 characters.", "error");
    return;
  }
  CH.api("/api/events/" + encodeURIComponent(activeEvent.id) + "/queries", { method: "POST", body: { question: question } })
    .then(function (data) {
      queryInput.value = "";
      setStatus(data.message, "success");
      loadQueries();
    })
    .catch(function (error) { setStatus(error.message, "error"); });
});

// ---------- Initial load ----------
CH.ready.then(function (user) {
  currentUser = user;
  return CH.api("/api/events");
}).then(function (data) {
  allEvents = data.events;
  renderEvents();

  // Deep link from other pages: events.html?event=<title>
  const wanted = new URLSearchParams(window.location.search).get("event");
  const match = wanted && allEvents.find(function (e) { return e.title.toLowerCase() === wanted.toLowerCase(); });
  if (match) openEventModal(match);
}).catch(function () {
  eventCount.textContent = "";
  noResults.textContent = "Could not load events. Please check that the server is running.";
  noResults.style.display = "block";
});
