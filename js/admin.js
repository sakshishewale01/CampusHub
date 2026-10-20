// ========================================================
// CampusHub - Admin Panel
// Tabs: Events (CRUD), Registrations (filter / delete /
// Excel export), Questions (answer / delete), Users.
// Every call goes through the API, which enforces admin access.
// ========================================================

const adminRoot = document.getElementById("admin-root");
const adminDenied = document.getElementById("admin-denied");
const adminMessage = document.getElementById("admin-message");

let events = [];
let me = null;

function notify(message, type) {
  adminMessage.textContent = message || "";
  adminMessage.className = "form-message" + (message ? " " + type : "");
}

function fail(error) {
  notify(error.message, "error");
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ---------- Tabs ----------
const tabButtons = document.querySelectorAll(".admin-tab");
tabButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    tabButtons.forEach(function (b) { b.classList.toggle("active", b === button); });
    document.querySelectorAll(".admin-panel").forEach(function (panel) {
      panel.style.display = panel.id === "tab-" + button.dataset.tab ? "" : "none";
    });
    notify("");
    refresh(button.dataset.tab);
  });
});

function refresh(tab) {
  if (tab === "events") loadEvents();
  if (tab === "registrations") loadEvents().then(loadRegistrations);
  if (tab === "queries") loadQueries();
  if (tab === "users") loadUsers();
}

// ========================================================
// EVENTS
// ========================================================
const eventForm = document.getElementById("event-form");
const eventsBody = document.getElementById("events-body");
const fields = {
  id: document.getElementById("event-id"),
  title: document.getElementById("ev-title"),
  category: document.getElementById("ev-category"),
  date: document.getElementById("ev-date"),
  time: document.getElementById("ev-time"),
  venue: document.getElementById("ev-venue"),
  image: document.getElementById("ev-image"),
  paid: document.getElementById("ev-paid"),
  fee: document.getElementById("ev-fee"),
  desc: document.getElementById("ev-desc")
};

function loadEvents() {
  return CH.api("/api/events").then(function (data) {
    events = data.events;
    eventsBody.innerHTML = events.map(function (e) {
      return "<tr><td>" + CH.esc(e.title) + "</td><td>" + CH.esc(e.category) + "</td><td>" +
        CH.esc(CH.formatDate(e.date)) + "</td><td>" + CH.esc(e.venue) + "</td><td>" + (e.isPaid ? "₹" + CH.esc(e.fee) : "Free") + "</td><td>" + (e.registrationCount || 0) +
        '</td><td class="row-actions"><button type="button" class="link-btn" data-edit="' + CH.esc(e.id) + '">Edit</button>' +
        '<button type="button" class="link-btn danger" data-delete="' + CH.esc(e.id) + '">Delete</button></td></tr>';
    }).join("") || '<tr><td colspan="7" class="empty">No events yet.</td></tr>';

    // Keep the registrations filter in sync
    const filter = document.getElementById("reg-filter");
    const current = filter.value;
    filter.innerHTML = '<option value="">All events</option>' + events.map(function (e) {
      return '<option value="' + CH.esc(e.id) + '">' + CH.esc(e.title) + "</option>";
    }).join("");
    filter.value = events.some(function (e) { return e.id === current; }) ? current : "";
  }).catch(fail);
}

// The amount field only applies to paid events
function syncFeeField() {
  const paid = fields.paid.value === "paid";
  document.getElementById("ev-fee-group").style.display = paid ? "" : "none";
  fields.fee.required = paid;
  if (!paid) fields.fee.value = "";
}
fields.paid.addEventListener("change", syncFeeField);

function resetEventForm() {
  eventForm.reset();
  syncFeeField();
  fields.id.value = "";
  document.getElementById("event-form-title").textContent = "Add New Event";
  document.getElementById("event-submit").textContent = "Add Event";
  document.getElementById("event-cancel").style.display = "none";
}

document.getElementById("event-cancel").addEventListener("click", resetEventForm);

eventsBody.addEventListener("click", function (e) {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;
  if (editId) {
    const ev = events.find(function (item) { return item.id === editId; });
    fields.id.value = ev.id;
    fields.title.value = ev.title;
    fields.category.value = ev.category;
    fields.date.value = ev.date;
    fields.time.value = ev.time;
    fields.venue.value = ev.venue;
    fields.image.value = ev.image;
    fields.desc.value = ev.description;
    fields.paid.value = ev.isPaid ? "paid" : "free";
    fields.fee.value = ev.isPaid ? ev.fee : "";
    syncFeeField();
    document.getElementById("event-form-title").textContent = "Edit Event";
    document.getElementById("event-submit").textContent = "Save Changes";
    document.getElementById("event-cancel").style.display = "";
    eventForm.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (deleteId) {
    const ev = events.find(function (item) { return item.id === deleteId; });
    if (!confirm('Delete "' + ev.title + '"? Its registrations and questions will be deleted too.')) return;
    CH.api("/api/events/" + encodeURIComponent(deleteId), { method: "DELETE" })
      .then(function (data) { notify(data.message, "success"); loadEvents(); })
      .catch(fail);
  }
});

eventForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const body = {
    title: fields.title.value, category: fields.category.value, date: fields.date.value,
    time: fields.time.value, venue: fields.venue.value, image: fields.image.value, description: fields.desc.value,
    isPaid: fields.paid.value === "paid", fee: fields.fee.value
  };
  const editing = fields.id.value;
  CH.api(editing ? "/api/events/" + encodeURIComponent(editing) : "/api/events", {
    method: editing ? "PUT" : "POST",
    body: body
  }).then(function (data) {
    notify(data.message, "success");
    resetEventForm();
    loadEvents();
  }).catch(fail);
});

// ========================================================
// REGISTRATIONS
// ========================================================
const regFilter = document.getElementById("reg-filter");
const exportBtn = document.getElementById("export-btn");

function exportUrl() {
  return "/api/admin/export" + (regFilter.value ? "?eventId=" + encodeURIComponent(regFilter.value) : "");
}

function loadRegistrations() {
  exportBtn.href = exportUrl();
  const query = regFilter.value ? "?eventId=" + encodeURIComponent(regFilter.value) : "";
  return CH.api("/api/admin/registrations" + query).then(function (data) {
    document.getElementById("reg-count").textContent = data.count;
    document.getElementById("reg-body").innerHTML = data.registrations.map(function (r, i) {
      return "<tr><td>" + (i + 1) + "</td><td>" + CH.esc(r.eventTitle) + "</td><td>" + CH.esc(r.fullName) +
        "</td><td>" + CH.esc(r.email) + "</td><td>" + CH.esc(r.prn) + "</td><td>" + CH.esc(fmtDateTime(r.createdAt)) +
        '</td><td class="row-actions"><button type="button" class="link-btn danger" data-remove="' + CH.esc(r.id) + '">Remove</button></td></tr>';
    }).join("") || '<tr><td colspan="7" class="empty">No registrations yet.</td></tr>';
  }).catch(fail);
}

regFilter.addEventListener("change", loadRegistrations);

document.getElementById("reg-body").addEventListener("click", function (e) {
  const id = e.target.dataset.remove;
  if (!id || !confirm("Remove this registration?")) return;
  CH.api("/api/admin/registrations/" + encodeURIComponent(id), { method: "DELETE" })
    .then(function (data) { notify(data.message, "success"); loadRegistrations(); })
    .catch(fail);
});

// ========================================================
// QUESTIONS
// ========================================================
const queriesList = document.getElementById("queries-list");

function loadQueries() {
  return CH.api("/api/admin/queries").then(function (data) {
    queriesList.innerHTML = data.queries.map(function (q) {
      return '<div class="admin-query" data-id="' + CH.esc(q.id) + '">' +
        '<p class="admin-query-meta">' + CH.esc(q.eventTitle) + " &bull; " + CH.esc(q.userName) + " &bull; " + CH.esc(fmtDateTime(q.createdAt)) + "</p>" +
        '<p class="admin-query-q">' + CH.esc(q.question) + "</p>" +
        '<textarea rows="2" maxlength="1000" placeholder="Write an answer..." aria-label="Answer">' + CH.esc(q.answer) + "</textarea>" +
        '<div class="admin-actions"><button type="button" class="btn btn-primary btn-small" data-answer>' + (q.answer ? "Update Answer" : "Post Answer") + "</button>" +
        '<button type="button" class="btn btn-secondary btn-small" data-del>Delete</button></div></div>';
    }).join("") || '<p class="empty">No questions yet.</p>';
  }).catch(fail);
}

queriesList.addEventListener("click", function (e) {
  const card = e.target.closest(".admin-query");
  if (!card) return;
  const id = encodeURIComponent(card.dataset.id);
  if (e.target.hasAttribute("data-answer")) {
    CH.api("/api/admin/queries/" + id, { method: "PUT", body: { answer: card.querySelector("textarea").value } })
      .then(function (data) { notify(data.message, "success"); loadQueries(); })
      .catch(fail);
  }
  if (e.target.hasAttribute("data-del") && confirm("Delete this question?")) {
    CH.api("/api/admin/queries/" + id, { method: "DELETE" })
      .then(function (data) { notify(data.message, "success"); loadQueries(); })
      .catch(fail);
  }
});

// ========================================================
// USERS
// ========================================================
const usersBody = document.getElementById("users-body");
const userForm = document.getElementById("user-form");

function loadUsers() {
  return CH.api("/api/admin/users").then(function (data) {
    usersBody.innerHTML = data.users.map(function (u) {
      const self = u.id === me.id;
      return "<tr><td>" + CH.esc(u.fullName) + "</td><td>" + CH.esc(u.email) + "</td><td>" + CH.esc(u.prn) +
        '</td><td><span class="role-tag ' + CH.esc(u.role) + '">' + CH.esc(u.role) + "</span></td>" +
        '<td class="row-actions">' + (self ? '<span class="empty">You</span>' :
          '<button type="button" class="link-btn danger" data-user="' + CH.esc(u.id) + '">Delete</button>') + "</td></tr>";
    }).join("");
  }).catch(fail);
}

usersBody.addEventListener("click", function (e) {
  const id = e.target.dataset.user;
  if (!id || !confirm("Delete this user and all of their registrations and questions?")) return;
  CH.api("/api/admin/users/" + encodeURIComponent(id), { method: "DELETE" })
    .then(function (data) { notify(data.message, "success"); loadUsers(); })
    .catch(fail);
});

userForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const password = document.getElementById("u-password").value;
  CH.api("/api/admin/users", {
    method: "POST",
    body: {
      fullName: document.getElementById("u-name").value,
      email: document.getElementById("u-email").value,
      prn: document.getElementById("u-prn").value,
      role: document.getElementById("u-role").value,
      password: password,
      confirmPassword: password
    }
  }).then(function (data) {
    notify(data.message, "success");
    userForm.reset();
    loadUsers();
  }).catch(fail);
});

// ---------- Start ----------
CH.ready.then(function (user) {
  if (!user || user.role !== "admin") {
    adminDenied.style.display = "";
    return;
  }
  me = user;
  adminRoot.style.display = "";
  loadEvents();
});
