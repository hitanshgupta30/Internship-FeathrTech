import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  const openTasks = project.openTaskCount || 0;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
            {project.name}
          </h3>
          <span className="badge badge-status-todo">
            {openTasks} {openTasks === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-4)', minHeight: '36px', lineHeight: 1.45 }}>
          {project.description || 'No description.'}
        </p>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
          {formattedDate ? formattedDate : ''}
        </span>

        <Link
          to={`/projects/${project.id}`}
          className="btn btn-secondary btn-sm"
          id={`open-project-${project.id}`}
        >
          Open
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
