import React from 'react';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      case 'todo':
      default:
        return 'Todo';
    }
  };

  const formatPriority = (priority) => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'low':
        return 'Low';
      case 'medium':
      default:
        return 'Medium';
    }
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <div
      className="task-card"
      onClick={handleCardClick}
      data-testid={`task-card-${task.id || 'default'}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="task-card-header">
        <h4 className="task-card-title" data-testid="task-title">
          {task.title}
        </h4>
      </div>

      {task.description && (
        <p className="task-card-desc" data-testid="task-description">
          {task.description}
        </p>
      )}

      <div className="task-card-badges">
        <span
          className={`badge badge-status-${task.status || 'todo'}`}
          data-testid="task-status-badge"
        >
          {formatStatus(task.status)}
        </span>
        <span
          className={`badge badge-priority-${task.priority || 'medium'}`}
          data-testid="task-priority-badge"
        >
          {formatPriority(task.priority)}
        </span>
      </div>

      <div className="task-card-footer">
        <span data-testid="task-assignee">
          {task.assignee ? task.assignee.name : 'Unassigned'}
        </span>
        {formattedDueDate && (
          <span data-testid="task-duedate">
            {formattedDueDate}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
