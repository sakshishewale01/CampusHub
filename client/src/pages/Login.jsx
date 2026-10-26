import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function Login({ onLoginSuccess, onShowToast }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  // Quick Demo Autofills for Faculty Demonstration
  const handleFillStudent = () => {
    setEmail('sakshi@campushub.edu');
    setPassword('Student@123');
    setMessage({ text: 'Student demo credentials filled. Click Login to sign in.', type: 'success' });
  };

  const handleFillAdmin = () => {
    setEmail('admin@campushub.edu');
    setPassword('Admin@12345');
    setMessage({ text: 'Admin demo credentials filled. Click Login to sign in.', type: 'success' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ text: 'Please enter your email address.', type: 'error' });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setMessage({ text: 'Please enter a valid email address (e.g. you@college.edu).', type: 'error' });
      return;
    }

    if (!password) {
      setMessage({ text: 'Please enter your password.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.login(email.trim(), password);
      if (res && res.success) {
        onLoginSuccess(res.user);
        onShowToast(res.message || 'Login successful!', 'success');

        if (res.user.role === 'admin') {
          navigate('/admin');
        } else if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setMessage({ text: err.message || 'Invalid email or password.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <section className="auth-section">
        <div className="auth-card">
          <Link to="/" className="logo">
            <span className="logo-badge">CH</span>
            Campus<span>Hub</span>
          </Link>
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Log in to register for events and manage your participation.</p>
          </div>

          <form onSubmit={handleSubmit} novalidate="true">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMessage({ text: '', type: '' });
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setMessage({ text: '', type: '' });
                }}
                required
              />
            </div>

            <div className="form-options">
              <div className="checkbox-group">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('For evaluation/demo accounts, use the quick buttons below.'); }} className="forgot-link">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Verifying Credentials...' : 'Login'}
            </button>

            {message.text && (
              <p className={`form-message ${message.type}`} role="status">
                {message.text}
              </p>
            )}

            {/* Quick Demo Credentials Fill (For Faculty Demonstration) */}
            <div style={{ marginTop: '18px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)', fontSize: '0.85rem' }}>
              <p style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', textAlign: 'center' }}>
                ⚡ Quick Demo Login (Click to Fill):
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn-action btn-action-edit" onClick={handleFillStudent} title="Fill Sakshi Shewale Demo Account">
                  Student Demo
                </button>
                <button type="button" className="btn-action btn-action-edit" onClick={handleFillAdmin} style={{ background: '#fef3c7', color: '#b45309' }} title="Fill Admin Demo Account">
                  Admin Demo
                </button>
              </div>
            </div>
          </form>

          <div className="auth-divider">New to CampusHub</div>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
