import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import EventModal from '../components/EventModal';

export default function Events({ user, onShowToast }) {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState('date');
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Load events and user registrations
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch events
      const eventsData = await api.getEvents();
      const loadedEvents = eventsData.events || [];
      setEvents(loadedEvents);

      // 2. If student, fetch their registrations
      if (user && user.role === 'student') {
        try {
          const myRegData = await api.getMyRegistrations();
          if (myRegData && myRegData.registrations) {
            const registeredIds = new Set(
              myRegData.registrations
                .filter((r) => r.status === 'Confirmed')
                .map((r) => r.eventId)
            );
            setRegisteredEventIds(registeredIds);
          }
        } catch (regErr) {
          console.warn('Could not load student registrations:', regErr);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Filter and sort events
  const filteredEvents = events.filter((event) => {
    const categoryMatches =
      selectedCategory === 'All' ||
      event.category.toLowerCase() === selectedCategory.toLowerCase();

    const searchMatches =
      event.title.toLowerCase().includes(searchText.toLowerCase()) ||
      event.description.toLowerCase().includes(searchText.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchText.toLowerCase());

    return categoryMatches && searchMatches;
  });

  filteredEvents.sort((a, b) => {
    if (sortOption === 'name') {
      return a.title.localeCompare(b.title);
    }
    return a.date.localeCompare(b.date);
  });

  // Handle Event Registration
  const handleRegister = async (eventId) => {
    setRegistering(true);
    try {
      const res = await api.registerForEvent(eventId);
      if (res && res.success) {
        onShowToast(res.message || 'Registration confirmed!', 'success');
        setRegisteredEventIds((prev) => new Set([...prev, eventId]));
        await loadData();
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1000);
      }
    } catch (err) {
      onShowToast(err.message || 'Registration failed.', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <main>
      {/* ============ PAGE HEADER ============ */}
      <section className="page-header">
        <div className="container">
          <h1>Upcoming Events</h1>
          <p>Browse and discover every technical, cultural, sports and workshop event happening on campus.</p>
        </div>
      </section>

      <div className="container">
        {/* ============ SEARCH + FILTER BAR ============ */}
        <form className="filter-bar" onSubmit={(e) => e.preventDefault()}>
          <div className="search-box">
            <span className="icon">🔍</span>
            <input
              type="text"
              placeholder="Search events by name, description, venue..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              aria-label="Search events"
            />
          </div>
          <div className="filter-chip-group" aria-label="Filter events by category">
            {['All', 'Technical', 'Cultural', 'Sports', 'Workshop'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-chip ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'Workshop' ? 'Workshops' : cat}
              </button>
            ))}
          </div>
          <select
            className="filter-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Sort events"
          >
            <option value="date">Sort by: Date</option>
            <option value="name">Sort by: Name (A-Z)</option>
          </select>
        </form>

        {/* ============ EVENTS GRID ============ */}
        <section className="events-list">
          <p className="event-count" aria-live="polite">
            Showing {filteredEvents.length} of {events.length} events
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p>Loading campus events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <p className="no-results" style={{ display: 'block' }}>
              No matching events found. Try a different search query or category filter.
            </p>
          ) : (
            <div className="events-grid mt-40">
              {filteredEvents.map((event) => {
                const eventId = event.id || event._id;
                const isRegistered = registeredEventIds.has(eventId);
                const availableSeats = event.availableSeats !== undefined ? event.availableSeats : Math.max(0, event.capacity - (event.registeredCount || 0));
                const isFull = availableSeats <= 0;

                let seatBadgeClass = 'badge-seats';
                if (isFull) seatBadgeClass += ' full';
                else if (availableSeats <= 10) seatBadgeClass += ' limited';

                return (
                  <article className="event-card" key={eventId}>
                    <div className="event-card-img">
                      <span className="event-tag">{event.category}</span>
                      <img src={event.image} alt={event.title} loading="lazy" />
                    </div>
                    <div className="event-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <h3>{event.title}</h3>
                        <span className={seatBadgeClass} title={`Total Capacity: ${event.capacity}`}>
                          {isFull ? 'Full' : `${availableSeats} seats left`}
                        </span>
                      </div>
                      <div className="event-meta">
                        <span className="icon">📅 {event.date}</span>
                        <span className="icon">⏰ {event.time || '10:00 AM'}</span>
                        <span className="icon">📍 {event.venue}</span>
                      </div>
                      <p className="event-desc">{event.description}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-small btn-block"
                          onClick={() => handleOpenModal(event)}
                        >
                          View Details
                        </button>
                        {isRegistered && (
                          <span className="badge-status confirmed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', whiteSpace: 'nowrap' }}>
                            ✓ Registered
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ============ EVENT DETAILS MODAL ============ */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        isRegistered={selectedEvent && registeredEventIds.has(selectedEvent.id || selectedEvent._id)}
        onRegister={handleRegister}
        registering={registering}
      />
    </main>
  );
}
