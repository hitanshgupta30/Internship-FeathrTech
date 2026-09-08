import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-container">
      <div className="landing-hero">
        <h1 className="landing-title">
          Simple project tracking for teams.
        </h1>

        <p className="landing-subtitle">
          Manage tasks, organize boards, and track progress without clutter.
        </p>

        <div className="landing-cta-group">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg" id="landing-dashboard-btn">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary btn-lg" id="landing-signup-btn">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" id="landing-login-btn">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="simple-features-list">
        <div className="simple-feature-item">
          <h3>Task Boards</h3>
          <p>Organize work across Todo, In Progress, and Done columns with ease.</p>
        </div>

        <div className="simple-feature-item">
          <h3>Team Members</h3>
          <p>Invite collaborators to projects and assign tasks to teammates.</p>
        </div>

        <div className="simple-feature-item">
          <h3>Comments</h3>
          <p>Keep conversations and status updates directly inside each task.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
