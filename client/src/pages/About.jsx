import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main>
      {/* ============ PAGE HEADER ============ */}
      <section className="page-header">
        <div className="container">
          <h1>About CampusHub</h1>
          <p>Learn what CampusHub is, why it exists, and how it helps students stay connected to campus life.</p>
        </div>
      </section>

      {/* ============ ABOUT SECTION ============ */}
      <section>
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <span className="section-tag">Who We Are</span>
              <h2>Bringing every college event to one place</h2>
              <p>
                CampusHub is a student event management platform designed to make
                campus life easier to navigate. Instead of chasing notices, WhatsApp
                groups and posters, students can find every technical, cultural,
                sports and workshop event happening on campus in a single hub.
              </p>
              <p>
                Our platform was built to solve a simple problem: too many events,
                scattered across too many places. CampusHub organizes it all —
                dates, timings, venues and details — into a clean and easy-to-use
                interface.
              </p>
            </div>
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80" alt="Students collaborating on campus" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ PURPOSE SECTION ============ */}
      <section className="bg-alt">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">Our Purpose</span>
            <h2>Why CampusHub Exists</h2>
            <p>To simplify how students discover, register for and participate in college events — all in one platform.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Centralized Discovery</h3>
              <p>One platform for every club and department to list their events, so students never miss out.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Effortless Registration</h3>
              <p>Simple sign-up flows mean students can register for an event in just a few clicks.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Better Organization</h3>
              <p>Event organizers get a clean structure to showcase details, timing and venue information.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WORKFLOW GUIDE ============ */}
      <section>
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">How It Works</span>
            <h2>Get Started in 4 Simple Steps</h2>
            <p>Participating in campus activities has never been simpler.</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">1️⃣</div>
              <h3>Create Your Account</h3>
              <p>Sign up with your college email and ID to access personalized event registrations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">2️⃣</div>
              <h3>Explore Events</h3>
              <p>Browse upcoming hackathons, sports meets, and workshops with real-time seat availability.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">3️⃣</div>
              <h3>One-Click Register</h3>
              <p>Confirm your seat instantly. Manage or cancel registrations anytime from your dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">4️⃣</div>
              <h3>Show Up & Participate</h3>
              <p>Attend the event, build skills, network with peers, and make the most of campus life!</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/events" className="btn btn-primary">
              Explore Upcoming Events
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
