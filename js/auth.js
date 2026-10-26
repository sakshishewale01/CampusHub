// ========================================================
// CampusHub - Shared client helpers (loaded on every page)
// - CH.api(): fetch wrapper for the JSON API
// - CH.esc(): HTML escaping for any server-provided text
// - CH.ready: resolves to the logged-in user (or null)
// - Updates the navbar for logged-in users and handles logout
// ========================================================

window.CH = (function () {
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Resolves to the parsed JSON body; rejects with an Error(message) on non-2xx.
  function api(path, options) {
    options = options || {};
    var init = { method: options.method || "GET", headers: {}, credentials: "same-origin" };
    if (options.body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
    return fetch(path, init).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var error = new Error(data.message || "Request failed (" + response.status + ")");
          error.status = response.status;
          throw error;
        }
        return data;
      });
    });
  }

  function formatDate(isoDate) {
    var parts = String(isoDate).split("-");
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderNav(user) {
    var navLinks = document.querySelector(".nav-links");
    var navCta = document.querySelector(".nav-cta");
    if (!user || !navLinks || !navCta) return;

    var loginLink = navLinks.querySelector('a[href="login.html"]');
    if (loginLink && loginLink.parentElement) loginLink.parentElement.remove();

    if (user.role === "admin") {
      var li = document.createElement("li");
      li.innerHTML = '<a href="admin.html"' + (document.body.dataset.page === "admin" ? ' class="active"' : "") + ">Admin Panel</a>";
      navLinks.appendChild(li);
    }

    // Account centre: name and PRN in small text
    navCta.innerHTML =
      '<div class="nav-account">' +
      '<span class="nav-account-name">' + esc(user.fullName) + ' <small>' + esc(user.role) + "</small></span>" +
      (user.prn ? '<span class="nav-account-line">PRN: ' + esc(user.prn) + "</span>" : "") + "</div>" +
      '<button type="button" class="btn btn-secondary btn-small" id="logout-btn">Logout</button>';
    document.getElementById("logout-btn").addEventListener("click", function () {
      api("/api/logout", { method: "POST" }).finally(function () {
        window.location.href = "login.html";
      });
    });
  }

  var ready = api("/api/me")
    .then(function (data) { return data.user; })
    .catch(function () { return null; })
    .then(function (user) {
      renderNav(user);
      return user;
    });

  return { api: api, esc: esc, formatDate: formatDate, ready: ready };
})();
