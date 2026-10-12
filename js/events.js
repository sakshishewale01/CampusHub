// ========================================================
// CampusHub - Events Page JavaScript (Assignment 2)
// Handles event search, category filtering, sorting,
// live event count, and the event details modal popup.
// ========================================================

// 1. Get DOM elements
const searchInput = document.getElementById("event-search");
const categoryButtons = document.querySelectorAll(".filter-chip");
const sortSelect = document.getElementById("event-sort");
const eventsGrid = document.querySelector(".events-list .events-grid");
const eventCards = Array.from(document.querySelectorAll(".events-list .event-card"));
const eventCount = document.getElementById("event-count");
const noResults = document.getElementById("no-results");

// Modal DOM elements
const eventModal = document.getElementById("event-modal");
const modalTitle = document.getElementById("modal-title");
const modalCategory = document.getElementById("modal-category");
const modalMeta = document.getElementById("modal-meta");
const modalDesc = document.getElementById("modal-desc");
const modalClose = document.getElementById("modal-close");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalRegisterBtn = document.getElementById("modal-register-btn");
const modalOverlay = document.getElementById("modal-overlay");

// Currently selected category (defaults to 'All')
let selectedCategory = "All";

// 2. Filter and Search Function
// Checks both the active category chip and the user search text
function updateEvents() {
  const searchText = searchInput.value.trim().toLowerCase();
  const matchingCards = [];

  eventCards.forEach(function (card) {
    const eventName = card.querySelector("h3").textContent.toLowerCase();
    const description = card.querySelector(".event-desc").textContent.toLowerCase();

    // Check category match
    const categoryMatches = selectedCategory === "All" || card.dataset.category === selectedCategory;

    // Check search match (in title or description)
    const searchMatches = eventName.includes(searchText) || description.includes(searchText);

    const shouldShow = categoryMatches && searchMatches;

    // Show or hide the event card using DOM style manipulation
    card.style.display = shouldShow ? "" : "none";

    if (shouldShow) {
      matchingCards.push(card);
    }
  });

  // Update dynamic count and show/hide no-results message
  eventCount.textContent = "Showing " + matchingCards.length + " of " + eventCards.length + " events";
  noResults.style.display = matchingCards.length === 0 ? "block" : "none";
}

// 3. Sorting Function
// Sorts event cards by event name (A-Z) or date (chronological)
function sortEvents() {
  const cardsToSort = eventCards.slice();

  cardsToSort.sort(function (firstCard, secondCard) {
    if (sortSelect.value === "name") {
      const firstName = firstCard.querySelector("h3").textContent;
      const secondName = secondCard.querySelector("h3").textContent;
      return firstName.localeCompare(secondName);
    }

    // Default: Sort by date using data-date attribute
    return firstCard.dataset.date.localeCompare(secondCard.dataset.date);
  });

  // Re-append sorted cards in the new order
  cardsToSort.forEach(function (card) {
    eventsGrid.appendChild(card);
  });
}

// 4. Category Filter Buttons Click Handlers
categoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedCategory = button.dataset.category;

    // Update active class state on buttons
    categoryButtons.forEach(function (categoryButton) {
      categoryButton.classList.toggle("active", categoryButton === button);
    });

    updateEvents();
  });
});

// 5. Search Input Event Listener (real-time filtering as user types)
searchInput.addEventListener("input", updateEvents);

// 6. Sort Select Change Event Listener
sortSelect.addEventListener("change", function () {
  sortEvents();
  updateEvents();
});

// 7. Prevent form submission / page refresh when pressing Enter in search
const eventControls = document.getElementById("event-controls");
if (eventControls) {
  eventControls.addEventListener("submit", function (event) {
    event.preventDefault();
  });
}

// 8. Event Details Modal Interaction
function openEventModal(card) {
  if (!eventModal) return;
  const eventName = card.querySelector("h3").textContent;
  modalTitle.textContent = eventName;
  modalCategory.textContent = card.dataset.category;
  modalMeta.innerHTML = card.querySelector(".event-meta").innerHTML;
  modalDesc.textContent = card.querySelector(".event-desc").textContent;
  if (modalRegisterBtn) {
    modalRegisterBtn.href = "register.html?event=" + encodeURIComponent(eventName);
  }
  eventModal.style.display = "flex";
  document.body.style.overflow = "hidden"; // Prevent background scroll
}

function closeEventModal() {
  if (!eventModal) return;
  eventModal.style.display = "none";
  document.body.style.overflow = ""; // Restore scrolling
}

// Attach click listener to every "View Details" button
const detailButtons = document.querySelectorAll(".event-card .btn-secondary");
detailButtons.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    const card = button.closest(".event-card");
    openEventModal(card);
  });
});

// Close modal event listeners
if (modalClose) modalClose.addEventListener("click", closeEventModal);
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeEventModal);
if (modalOverlay) modalOverlay.addEventListener("click", closeEventModal);

// Close modal when pressing the Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && eventModal && eventModal.style.display === "flex") {
    closeEventModal();
  }
});

// 9. Initial setup on page load
sortEvents();
updateEvents();
