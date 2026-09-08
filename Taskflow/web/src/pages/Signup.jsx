import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await signup(formData.name.trim(), formData.email.trim(), formData.password);
      setSuccessMessage('Account created. Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      console.error('Signup error:', err);
      let serverMessage = 'Failed to sign up. Please try again.';
      if (err.response?.data?.message) {
        serverMessage = err.response.data.message;
      } else if (err.response?.data?.errors?.[0]?.issue) {
        serverMessage = err.response.data.errors[0].issue;
      } else if (err.message === 'Network Error' || !err.response) {
        serverMessage = 'Cannot connect to backend server. Make sure the backend API is running on port 5000.';
      }
      setError(serverMessage);
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            taskflow
          </Link>
          <p className="auth-subtitle">Create a new account</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert" id="signup-error-alert">
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert" id="signup-success-alert">
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              name="name"
              className="form-input"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              name="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={loading}
            id="signup-submit-btn"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
