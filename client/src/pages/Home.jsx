import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    api.getEvents()
      .then((data) => {
        if (data && data.events) {
          setFeaturedEvents(data.events.slice(0, 4));
        }
      })
      .catch((err) => console.warn('Could not load featured events:', err));
  }, []);

  return (
    <main>
      {/* ============ HERO SECTION ============ */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="section-tag">Your College Event Companion</span>
            <h1>Discover. Register. Participate.</h1>
            <p>
              CampusHub brings every technical fest, cultural night, sports meet
              and workshop on campus into one simple place — so you never miss
              out on what's happening around you.
            </p>
            <div className="hero-buttons">
              <Link to="/events" className="btn btn-primary">
                Explore Events
              </Link>
              <Link to="/about" className="btn btn-outline-light">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://mitaoe.ac.in/assets/images/about_mae.jpg" alt="Students at a college event" />
          </div>
        </div>
      </section>

      {/* ============ FEATURED EVENTS SECTION ============ */}
      <section className="featured-events">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">Featured</span>
            <h2>Upcoming Highlights</h2>
            <p>A quick look at some of the most anticipated events happening on campus this month.</p>
          </div>

          <div className="events-grid">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event) => (
                <article className="event-card" key={event.id || event._id}>
                  <div className="event-card-img">
                    <span className="event-tag">{event.category}</span>
                    <img src={event.image} alt={event.title} />
                  </div>
                  <div className="event-card-body">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <span className="icon">📅 {event.date}</span>
                      <span className="icon">⏰ {event.time || '10:00 AM'}</span>
                      <span className="icon">📍 {event.venue}</span>
                    </div>
                    <p className="event-desc">{event.description}</p>
                    <Link to="/events" className="btn btn-secondary btn-small btn-block">
                      View Details
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              // Default fallback cards if server still loading
              <>
                <article className="event-card">
                  <div className="event-card-img">
                    <span className="event-tag">Technical</span>
                    <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=500&q=80" alt="Code Sprint Hackathon" />
                  </div>
                  <div className="event-card-body">
                    <h3>Code Sprint Hackathon</h3>
                    <div className="event-meta">
                      <span className="icon">📅 12 Sept 2026</span>
                      <span className="icon">⏰ 9:00 AM</span>
                      <span className="icon">📍 CS Block, Lab 3</span>
                    </div>
                    <p className="event-desc">A 24-hour coding marathon where teams build solutions to real-world problems.</p>
                    <Link to="/events" className="btn btn-secondary btn-small btn-block">View Details</Link>
                  </div>
                </article>

                <article className="event-card">
                  <div className="event-card-img">
                    <span className="event-tag">Cultural</span>
                    <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500&q=80" alt="Rhythm Night Concert" />
                  </div>
                  <div className="event-card-body">
                    <h3>Rhythm Night</h3>
                    <div className="event-meta">
                      <span className="icon">📅 18 Sept 2026</span>
                      <span className="icon">⏰ 6:30 PM</span>
                      <span className="icon">📍 Open Air Theatre</span>
                    </div>
                    <p className="event-desc">An evening of music, dance and drama performed by talented students.</p>
                    <Link to="/events" className="btn btn-secondary btn-small btn-block">View Details</Link>
                  </div>
                </article>

                <article className="event-card">
                  <div className="event-card-img">
                    <span className="event-tag">Sports</span>
                    <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80" alt="Inter College Sports Meet" />
                  </div>
                  <div className="event-card-body">
                    <h3>Inter-College Sports Meet</h3>
                    <div className="event-meta">
                      <span className="icon">📅 22 Sept 2026</span>
                      <span className="icon">⏰ 8:00 AM</span>
                      <span className="icon">📍 Main Ground</span>
                    </div>
                    <p className="event-desc">Athletics, football and basketball tournaments between college teams.</p>
                    <Link to="/events" className="btn btn-secondary btn-small btn-block">View Details</Link>
                  </div>
                </article>

                <article className="event-card">
                  <div className="event-card-img">
                    <span className="event-tag">Workshop</span>
                    <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=500&q=80" alt="AI Workshop" />
                  </div>
                  <div className="event-card-body">
                    <h3>AI & Machine Learning Workshop</h3>
                    <div className="event-meta">
                      <span className="icon">📅 28 Sept 2026</span>
                      <span className="icon">⏰ 10:00 AM</span>
                      <span className="icon">📍 Seminar Hall 2</span>
                    </div>
                    <p className="event-desc">Hands-on session covering the basics of AI and machine learning tools.</p>
                    <Link to="/events" className="btn btn-secondary btn-small btn-block">View Details</Link>
                  </div>
                </article>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES SECTION ============ */}
      <section className="categories-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">Browse</span>
            <h2>Explore by Category</h2>
            <p>Find events that match your interest, from coding contests to cultural festivals.</p>
          </div>

          <div className="category-grid">
            <Link to="/events?category=Technical" className="category-card">
              <div className="category-icon">💻</div>
              <h3>Technical</h3>
              <p>Hackathons, coding contests & tech talks</p>
            </Link>
            <Link to="/events?category=Cultural" className="category-card">
              <div className="category-icon">🎭</div>
              <h3>Cultural</h3>
              <p>Music, dance, drama & art festivals</p>
            </Link>
            <Link to="/events?category=Sports" className="category-card">
              <div className="category-icon">🏆</div>
              <h3>Sports</h3>
              <p>Tournaments, meets & fitness challenges</p>
            </Link>
            <Link to="/events?category=Workshop" className="category-card">
              <div className="category-icon">🛠️</div>
              <h3>Workshops</h3>
              <p>Skill-building sessions & guest lectures</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ STATISTICS SECTION ============ */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>150+</h3>
              <p>Events Hosted</p>
            </div>
            <div className="stat-item">
              <h3>25K+</h3>
              <p>Student Registrations</p>
            </div>
            <div className="stat-item">
              <h3>40+</h3>
              <p>College Clubs</p>
            </div>
            <div className="stat-item">
              <h3>98%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CALL TO ACTION SECTION ============ */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to join your next campus event?</h2>
            <p>Create a free CampusHub account and start registering for events organized across your college in minutes.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/events" className="btn btn-outline-light">
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
