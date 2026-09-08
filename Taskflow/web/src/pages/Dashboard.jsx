import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProjects = async () => {
    try {
      setError('');
      const response = await axiosClient.get('/projects');
      setProjects(response.data.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newProject.name.trim()) {
      setFormError('Project name is required.');
      return;
    }

    try {
      setCreating(true);
      setFormError('');
      const response = await axiosClient.post('/projects', {
        name: newProject.name.trim(),
        description: newProject.description.trim()
      });

      setProjects((prev) => [response.data.data.project, ...prev]);
      setNewProject({ name: '', description: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      setFormError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.issue ||
        'Failed to create project.'
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  return (
    <div className="main-content">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>
            Projects
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Welcome, {user?.name || 'User'}. Manage your project boards.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          id="create-project-btn"
        >
          New Project
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      {projects.length > 0 && (
        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects"
          description="Create a project to start organizing tasks."
          actionLabel="New Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : filteredProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-muted)' }}>
          <p>No projects match "{searchQuery}".</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError('');
        }}
        title="New Project"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateProject}
              disabled={creating || !newProject.name.trim()}
              id="confirm-create-project-btn"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateProject}>
          {formError && <div className="alert alert-danger">{formError}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="project-name">
              Project Name *
            </label>
            <input
              id="project-name"
              type="text"
              className="form-input"
              placeholder="e.g. Website Redesign"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="project-desc">
              Description (Optional)
            </label>
            <textarea
              id="project-desc"
              className="form-textarea"
              placeholder="Brief description..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            ></textarea>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
