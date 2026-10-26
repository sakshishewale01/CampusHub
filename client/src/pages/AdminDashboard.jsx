import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function AdminDashboard({ user, onLogout, onShowToast }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('events');
  const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, totalRegistrations: 0, totalStudents: 0 });
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for registrations
  const [regSearch, setRegSearch] = useState('');
  const [regEventFilter, setRegEventFilter] = useState('All');

  // Event Modal State (Create / Edit)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentEventId, setCurrentEventId] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Technical',
    status: 'Upcoming',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    venue: '',
    capacity: 60,
    image: '',
    description: ''
  });
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });
  const [savingEvent, setSavingEvent] = useState(false);

  // Load Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, eventsData, regsData] = await Promise.all([
        api.getAdminStats().catch(() => ({ stats: {} })),
        api.getEvents().catch(() => ({ events: [] })),
        api.getAdminRegistrations().catch(() => ({ registrations: [] }))
      ]);

      if (statsData && statsData.stats) setStats(statsData.stats);
      setEvents(eventsData.events || []);
      setRegistrations(regsData.registrations || []);
    } catch (err) {
      console.error('Error loading admin control data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Open Create Event Modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentEventId(null);
    setEventForm({
      title: '',
      category: 'Technical',
      status: 'Upcoming',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      venue: '',
      capacity: 60,
      image: '',
      description: ''
    });
    setFormMsg({ text: '', type: '' });
    setIsEventModalOpen(true);
  };

  // Open Edit Event Modal
  const handleOpenEditModal = (event) => {
    setModalMode('edit');
    setCurrentEventId(event.id || event._id);
    setEventForm({
      title: event.title || '',
      category: event.category || 'Technical',
      status: event.status || 'Upcoming',
      date: event.date || '',
      time: event.time || '10:00 AM',
      venue: event.venue || '',
      capacity: event.capacity || 50,
      image: event.image || '',
      description: event.description || ''
    });
    setFormMsg({ text: '', type: '' });
    setIsEventModalOpen(true);
  };

  // Handle Event Form Save
  const handleSaveEvent = async (e) => {
    e.preventDefault();

    if (!eventForm.title.trim() || eventForm.title.trim().length < 3) {
      setFormMsg({ text: 'Event title must be at least 3 characters.', type: 'error' });
      return;
    }

    if (!eventForm.venue.trim()) {
      setFormMsg({ text: 'Please specify the event venue.', type: 'error' });
      return;
    }

    const numCapacity = parseInt(eventForm.capacity, 10);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      setFormMsg({ text: 'Capacity must be a positive integer.', type: 'error' });
      return;
    }

    setSavingEvent(true);
    setFormMsg({ text: '', type: '' });

    try {
      if (modalMode === 'create') {
        const res = await api.createEvent(eventForm);
        if (res && res.success) {
          onShowToast('New event created successfully!', 'success');
          setIsEventModalOpen(false);
          await loadAdminData();
        }
      } else {
        const res = await api.updateEvent(currentEventId, eventForm);
        if (res && res.success) {
          onShowToast('Event updated successfully!', 'success');
          setIsEventModalOpen(false);
          await loadAdminData();
        }
      }
    } catch (err) {
      setFormMsg({ text: err.message || 'Error saving event.', type: 'error' });
    } finally {
      setSavingEvent(false);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (eventId, title) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"? All student registrations for this event will be cancelled.`);
    if (!confirmed) return;

    try {
      const res = await api.deleteEvent(eventId);
      if (res && res.success) {
        onShowToast(res.message || 'Event deleted.', 'success');
        await loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message || 'Could not delete event.', 'error');
    }
  };

  // Handle Delete Registration
  const handleDeleteRegistration = async (regId, studentName, eventTitle) => {
    const confirmed = window.confirm(`Are you sure you want to remove registration for ${studentName} from "${eventTitle}"?`);
    if (!confirmed) return;

    try {
      const res = await api.deleteRegistration(regId);
      if (res && res.success) {
        onShowToast(res.message || 'Registration removed.', 'success');
        await loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message || 'Could not remove registration.', 'error');
    }
  };

  // Filter registrations for table
  const filteredRegistrations = registrations.filter((r) => {
    const q = regSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.studentName.toLowerCase().includes(q) ||
      r.studentEmail.toLowerCase().includes(q) ||
      r.collegeId.toLowerCase().includes(q) ||
      r.eventTitle.toLowerCase().includes(q);

    const matchesEvent = regEventFilter === 'All' || r.eventId === regEventFilter || r.eventTitle === regEventFilter;

    return matchesSearch && matchesEvent;
  });

  const handleLogoutClick = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <main>
      {/* ============ ADMIN HEADER ============ */}
      <section className="dashboard-header">
        <div className="container">
          <div className="dashboard-user-bar">
            <div>
              <span className="section-tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                Administrator Panel
              </span>
              <h1>College Event Control Center</h1>
              <p>Manage events, monitor seat capacities, and supervise student registrations.</p>
            </div>
            <div className="dashboard-actions">
              <button type="button" className="btn btn-primary btn-small" onClick={handleOpenCreateModal}>
                + Add New Event
              </button>
              <button type="button" className="btn btn-outline-light btn-small" onClick={handleLogoutClick}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ METRIC STATS ============ */}
      <div className="container">
        <div className="stats-grid-dashboard">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">📅</div>
            <div className="dashboard-stat-info">
              <h3>{stats.totalEvents || 0}</h3>
              <p>Total Campus Events</p>
            </div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon green">✨</div>
            <div className="dashboard-stat-info">
              <h3>{stats.upcomingEvents || 0}</h3>
              <p>Active Upcoming Events</p>
            </div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon amber">🎟️</div>
            <div className="dashboard-stat-info">
              <h3>{stats.totalRegistrations || 0}</h3>
              <p>Student Registrations</p>
            </div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon purple">🎓</div>
            <div className="dashboard-stat-info">
              <h3>{stats.totalStudents || 0}</h3>
              <p>Registered Students</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            📅 Event Management
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            👥 Student Registrations
          </button>
        </div>

        {/* ========================================================
             TAB 1: EVENT MANAGEMENT
             ======================================================== */}
        {activeTab === 'events' && (
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2>Campus Events Listing</h2>
              <button type="button" className="btn btn-secondary btn-small" onClick={handleOpenCreateModal}>
                + Create Event
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Category</th>
                    <th>Date & Time</th>
                    <th>Venue</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                        Loading campus events...
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                        No campus events found. Click "+ Add New Event" to create one.
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => {
                      const eventId = event.id || event._id;
                      let statusClass = 'upcoming';
                      if (event.status === 'Registration Closed') statusClass = 'closed';
                      if (event.status === 'Completed') statusClass = 'completed';

                      const availableSeats = event.availableSeats !== undefined ? event.availableSeats : Math.max(0, event.capacity - (event.registeredCount || 0));

                      return (
                        <tr key={eventId}>
                          <td>
                            <strong style={{ color: 'var(--dark)' }}>{event.title}</strong>
                          </td>
                          <td>
                            <span className="event-tag" style={{ margin: 0, fontSize: '0.72rem' }}>
                              {event.category}
                            </span>
                          </td>
                          <td>
                            {event.date}
                            <br />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                              {event.time || '10:00 AM'}
                            </span>
                          </td>
                          <td>{event.venue}</td>
                          <td>
                            <strong>{event.registeredCount || 0} / {event.capacity}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                              ({availableSeats} left)
                            </span>
                          </td>
                          <td>
                            <span className={`badge-status ${statusClass}`}>{event.status || 'Upcoming'}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn-action btn-action-edit"
                                onClick={() => handleOpenEditModal(event)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-action btn-action-danger"
                                onClick={() => handleDeleteEvent(eventId, event.title)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
             TAB 2: STUDENT REGISTRATIONS
             ======================================================== */}
        {activeTab === 'registrations' && (
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2>All Student Registrations</h2>
              <span className="badge-seats">{filteredRegistrations.length} records</span>
            </div>

            {/* Search & Filter Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: '240px' }}>
                <input
                  type="text"
                  placeholder="Search by student name, email, or ID..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <select
                  value={regEventFilter}
                  onChange={(e) => setRegEventFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                >
                  <option value="All">All Events</option>
                  {events.map((e) => (
                    <option key={e.id || e._id} value={e.id || e._id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>College ID</th>
                    <th>Event Name</th>
                    <th>Date Registered</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                        No student registrations match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((r) => {
                      const isConfirmed = r.status === 'Confirmed';
                      const statusClass = isConfirmed ? 'confirmed' : 'cancelled';

                      return (
                        <tr key={r.id || r._id}>
                          <td><strong>{r.studentName}</strong></td>
                          <td>{r.studentEmail}</td>
                          <td>
                            {r.collegeId || '-'}
                            <br />
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                              {r.yearOfStudy || ''}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--primary)' }}>{r.eventTitle}</strong>
                          </td>
                          <td>{r.registeredAt || 'Recent'}</td>
                          <td>
                            <span className={`badge-status ${statusClass}`}>{r.status || 'Confirmed'}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-action btn-action-danger"
                              onClick={() => handleDeleteRegistration(r.id || r._id, r.studentName, r.eventTitle)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============ CREATE / EDIT EVENT MODAL ============ */}
      {isEventModalOpen && (
        <div className="modal" style={{ display: 'flex' }} role="dialog" aria-modal="true">
          <div className="modal-overlay" onClick={() => setIsEventModalOpen(false)} />
          <div className="modal-box" style={{ maxWidth: '620px' }}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setIsEventModalOpen(false)}
            >
              &times;
            </button>
            <div className="modal-header">
              <span className="event-tag">Admin Action</span>
              <h2>{modalMode === 'create' ? 'Create New Event' : 'Edit Event Details'}</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveEvent} novalidate="true">
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="evt-title">Event Title *</label>
                  <input
                    type="text"
                    id="evt-title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. Code Sprint Hackathon"
                    required
                  />
                </div>

                <div className="form-row" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label htmlFor="evt-cat">Category *</label>
                    <select
                      id="evt-cat"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      required
                    >
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="evt-status">Status</label>
                    <select
                      id="evt-status"
                      value={eventForm.status}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Registration Closed">Registration Closed</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label htmlFor="evt-date">Event Date *</label>
                    <input
                      type="date"
                      id="evt-date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="evt-time">Time</label>
                    <input
                      type="text"
                      id="evt-time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      placeholder="e.g. 10:00 AM"
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label htmlFor="evt-venue">Venue *</label>
                    <input
                      type="text"
                      id="evt-venue"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      placeholder="e.g. CS Block Lab 3"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="evt-cap">Seat Capacity *</label>
                    <input
                      type="number"
                      id="evt-cap"
                      min="1"
                      max="5000"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="evt-img">Event Banner Image URL</label>
                  <input
                    type="url"
                    id="evt-img"
                    value={eventForm.image}
                    onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="evt-desc">Description *</label>
                  <textarea
                    id="evt-desc"
                    rows="3"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Detailed event information..."
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.95rem' }}
                    required
                  />
                </div>

                {formMsg.text && (
                  <p className={`form-message ${formMsg.type}`} style={{ marginBottom: '12px' }}>
                    {formMsg.text}
                  </p>
                )}

                <div className="modal-footer" style={{ padding: '14px 0 0', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => setIsEventModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-small" disabled={savingEvent}>
                    {savingEvent ? 'Saving...' : modalMode === 'create' ? 'Create Event' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
