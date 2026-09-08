import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import TaskDetail from './pages/TaskDetail';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-all */}
        <Route
          path="*"
          element={
            <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 - Page Not Found</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                The page you are looking for does not exist.
              </p>
              <a href="/" className="btn btn-primary">
                Return to Home
              </a>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
