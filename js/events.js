// ========================================================
<<<<<<< HEAD
// CampusHub - Dynamic Events Management (events.js)
// Fetches real event data from GET /api/events,
// handles real-time search, category filtering, sorting,
// live seat availability, and one-click student registration.
// ========================================================

// 1. State Variables
let allEvents = [];
let currentUser = null;
let registeredEventIds = new Set();
let selectedCategory = "All";
let selectedEventForModal = null;

// 2. DOM Elements
=======
// CampusHub - Events Page
// Loads events from the API, then handles search, category
// filtering, sorting, the details modal, event registration
// and the per-event question board.
// ========================================================

>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
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

<<<<<<< HEAD
// --------------------------------------------------------
// 3. Render Events Cards into DOM
// --------------------------------------------------------
function renderEventCards(eventsToRender) {
  if (!eventsGrid) return;

  eventsGrid.innerHTML = "";

  if (eventsToRender.length === 0) {
    if (noResults) noResults.style.display = "block";
    if (eventCount) eventCount.textContent = "Showing 0 of " + allEvents.length + " events";
    return;
  }

  if (noResults) noResults.style.display = "none";
  if (eventCount) eventCount.textContent = "Showing " + eventsToRender.length + " of " + allEvents.length + " events";

  eventsToRender.forEach(function (event) {
    const isRegistered = registeredEventIds.has(event.id);
    const availableSeats = event.availableSeats !== undefined ? event.availableSeats : Math.max(0, event.capacity - (event.registeredCount || 0));
    const isFull = availableSeats <= 0;
    const isClosed = event.status === "Registration Closed" || event.status === "Completed";

    // Create article element
    const article = document.createElement("article");
    article.className = "event-card";
    article.dataset.category = event.category;
    article.dataset.date = event.date;
    article.dataset.id = event.id;

    // Determine seat badge status
    let seatBadgeClass = "badge-seats";
    if (isFull) seatBadgeClass += " full";
    else if (availableSeats <= 10) seatBadgeClass += " limited";

    // Determine action button state
    let actionBtnText = "View Details";

    article.innerHTML = `
      <div class="event-card-img">
        <span class="event-tag">${escapeHtml(event.category)}</span>
        <img src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title)}" loading="lazy">
      </div>
      <div class="event-card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
          <h3>${escapeHtml(event.title)}</h3>
          <span class="${seatBadgeClass}" title="Capacity: ${event.capacity}">
            ${isFull ? 'Full' : availableSeats + ' seats left'}
          </span>
        </div>
        <div class="event-meta">
          <span class="icon">📅 ${escapeHtml(event.date)}</span>
          <span class="icon">⏰ ${escapeHtml(event.time || '10:00 AM')}</span>
          <span class="icon">📍 ${escapeHtml(event.venue)}</span>
        </div>
        <p class="event-desc">${escapeHtml(event.description)}</p>
        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button type="button" class="btn btn-secondary btn-small btn-block view-details-btn">
            ${actionBtnText}
          </button>
          ${isRegistered ? `
            <span class="badge-status confirmed" style="display: flex; align-items: center; justify-content: center; padding: 0 12px; white-space: nowrap;">
              ✓ Registered
            </span>
          ` : ''}
        </div>
      </div>
    `;

    // Attach click handler to View Details button
    const viewBtn = article.querySelector(".view-details-btn");
    viewBtn.addEventListener("click", () => openEventModal(event));

    eventsGrid.appendChild(article);
  });
}

// --------------------------------------------------------
// 4. Filtering and Sorting Logic
// --------------------------------------------------------
function filterAndSortEvents() {
  const searchText = (searchInput ? searchInput.value : "").trim().toLowerCase();

  // 1. Filter
  let filtered = allEvents.filter(function (event) {
    const categoryMatches = selectedCategory === "All" || event.category.toLowerCase() === selectedCategory.toLowerCase();
    const searchMatches =
      event.title.toLowerCase().includes(searchText) ||
      event.description.toLowerCase().includes(searchText) ||
      event.venue.toLowerCase().includes(searchText);

    return categoryMatches && searchMatches;
  });

  // 2. Sort
  const sortValue = sortSelect ? sortSelect.value : "date";
  if (sortValue === "name") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filtered.sort((a, b) => a.date.localeCompare(b.date));
  }

  // 3. Render
  renderEventCards(filtered);
}

// --------------------------------------------------------
// 5. Category Buttons & Controls Setup
// --------------------------------------------------------
categoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedCategory = button.dataset.category;

    categoryButtons.forEach(btn => {
      btn.classList.toggle("active", btn === button);
    });

    filterAndSortEvents();
=======
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
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
  });
});
searchInput.addEventListener("input", renderEvents);
sortSelect.addEventListener("change", renderEvents);
document.getElementById("event-controls").addEventListener("submit", function (e) { e.preventDefault(); });

<<<<<<< HEAD
if (searchInput) {
  searchInput.addEventListener("input", filterAndSortEvents);
}

if (sortSelect) {
  sortSelect.addEventListener("change", filterAndSortEvents);
}

const eventControls = document.getElementById("event-controls");
if (eventControls) {
  eventControls.addEventListener("submit", e => e.preventDefault());
}

// --------------------------------------------------------
// 6. Event Details Modal Interaction
// --------------------------------------------------------
function openEventModal(event) {
  if (!eventModal) return;
  selectedEventForModal = event;

  const isRegistered = registeredEventIds.has(event.id);
  const availableSeats = event.availableSeats !== undefined ? event.availableSeats : Math.max(0, event.capacity - (event.registeredCount || 0));
  const isFull = availableSeats <= 0;
  const isClosed = event.status === "Registration Closed" || event.status === "Completed";

  modalTitle.textContent = event.title;
  modalCategory.textContent = event.category;

  modalMeta.innerHTML = `
    <span class="icon">📅 ${escapeHtml(event.date)}</span>
    <span class="icon">⏰ ${escapeHtml(event.time || '10:00 AM')}</span>
    <span class="icon">📍 ${escapeHtml(event.venue)}</span>
    <span class="icon">👥 Capacity: ${event.capacity} (${availableSeats} available)</span>
    <span class="icon">📌 Status: <strong style="color: ${event.status === 'Upcoming' ? '#10b981' : '#f59e0b'}">${escapeHtml(event.status || 'Upcoming')}</strong></span>
  `;

  modalDesc.textContent = event.description;

  // Configure modal register button state
  if (modalRegisterBtn) {
    // Reset styles
    modalRegisterBtn.onclick = null;
    modalRegisterBtn.disabled = false;
    modalRegisterBtn.className = "btn btn-primary btn-small";

    if (!currentUser) {
      // User is not logged in
      modalRegisterBtn.textContent = "Login to Register";
      modalRegisterBtn.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname);
    } else if (currentUser.role === "admin") {
      // User is admin
      modalRegisterBtn.textContent = "Manage in Admin Panel";
      modalRegisterBtn.href = "admin-dashboard.html";
    } else if (isRegistered) {
      // Already registered
      modalRegisterBtn.textContent = "✓ Already Registered";
      modalRegisterBtn.disabled = true;
      modalRegisterBtn.className = "btn btn-secondary btn-small";
      modalRegisterBtn.href = "#";
    } else if (isClosed) {
      // Event closed
      modalRegisterBtn.textContent = "Registration Closed";
      modalRegisterBtn.disabled = true;
      modalRegisterBtn.className = "btn btn-secondary btn-small";
      modalRegisterBtn.href = "#";
    } else if (isFull) {
      // Event full
      modalRegisterBtn.textContent = "Event Full";
      modalRegisterBtn.disabled = true;
      modalRegisterBtn.className = "btn btn-secondary btn-small";
      modalRegisterBtn.href = "#";
    } else {
      // Student can register
      modalRegisterBtn.textContent = "Register Now";
      modalRegisterBtn.href = "#";
      modalRegisterBtn.onclick = function (e) {
        e.preventDefault();
        handleEventRegistration(event.id);
      };
    }
  }
=======
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
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3

  eventModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeEventModal() {
  eventModal.style.display = "none";
  document.body.style.overflow = "";
}

<<<<<<< HEAD
// --------------------------------------------------------
// 7. Student Event Registration Request
// --------------------------------------------------------
async function handleEventRegistration(eventId) {
  if (!modalRegisterBtn) return;
  modalRegisterBtn.disabled = true;
  modalRegisterBtn.textContent = "Registering...";

  try {
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: eventId })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      if (typeof showToast === "function") {
        showToast(data.message || "Registration confirmed!", "success");
      }

      registeredEventIds.add(eventId);

      // Decrement seats locally
      const target = allEvents.find(e => e.id === eventId);
      if (target) {
        target.registeredCount = (target.registeredCount || 0) + 1;
        target.availableSeats = Math.max(0, target.capacity - target.registeredCount);
      }

      // Re-render modal button
      modalRegisterBtn.textContent = "✓ Already Registered";
      modalRegisterBtn.disabled = true;
      modalRegisterBtn.className = "btn btn-secondary btn-small";

      // Refresh list
      filterAndSortEvents();

      setTimeout(() => {
        closeEventModal();
      }, 1200);

    } else {
      modalRegisterBtn.disabled = false;
      modalRegisterBtn.textContent = "Register Now";
      if (typeof showToast === "function") {
        showToast(data.message || "Registration failed.", "error");
      } else {
        alert(data.message || "Registration failed.");
      }
    }

  } catch (error) {
    modalRegisterBtn.disabled = false;
    modalRegisterBtn.textContent = "Register Now";
    console.error("Registration error:", error);
    if (typeof showToast === "function") {
      showToast("Server error. Please try again.", "error");
    }
  }
}

// Modal event listeners
if (modalClose) modalClose.addEventListener("click", closeEventModal);
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeEventModal);
if (modalOverlay) modalOverlay.addEventListener("click", closeEventModal);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && eventModal && eventModal.style.display === "flex") {
    closeEventModal();
=======
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
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
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

<<<<<<< HEAD
// Helper: Escape HTML string
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --------------------------------------------------------
// 8. Initial Load: Fetch Session, Registrations, and Events
// --------------------------------------------------------
async function initializePage() {
  try {
    // 1. Check user session
    const authRes = await fetch("/api/auth/me");
    if (authRes.ok) {
      const authData = await authRes.json();
      currentUser = authData.user;
    }

    // 2. If student, fetch student's current registrations
    if (currentUser && currentUser.role === "student") {
      try {
        const myRegRes = await fetch("/api/student/registrations");
        if (myRegRes.ok) {
          const myRegData = await myRegRes.json();
          if (Array.isArray(myRegData.registrations)) {
            myRegData.registrations.forEach(r => {
              if (r.status === "Confirmed") {
                registeredEventIds.add(r.eventId);
              }
            });
          }
        }
      } catch (regErr) {
        console.warn("Could not load student registrations:", regErr);
      }
    }

    // 3. Fetch all events
    const eventsRes = await fetch("/api/events");
    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      allEvents = eventsData.events || [];
      filterAndSortEvents();
    }

  } catch (error) {
    console.error("Error loading events page data:", error);
  }
}

initializePage();
=======
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
>>>>>>> 60de5dab5c216d2aad9cf4195abb3abbe07d0ba3
