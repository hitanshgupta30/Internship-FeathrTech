import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-brand">
          taskflow
        </Link>

        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="navbar-user-section">
              <Link
                to="/dashboard"
                className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>

              <div className="navbar-user-badge">
                <div className="navbar-avatar">{getInitials(user?.name)}</div>
                <span>{user?.name || 'User'}</span>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleLogout}
                id="logout-btn"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="navbar-links">
              <Link
                to="/login"
                className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
