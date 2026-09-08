import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import CommentThread from '../components/CommentThread';
import LoadingSpinner from '../components/LoadingSpinner';

const TaskDetail = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Editable Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assigneeId: ''
  });

  const fetchTaskDetails = async () => {
    try {
      setError('');
      const response = await axiosClient.get(`/tasks/${taskId}`);
      const fetchedTask = response.data.data.task;
      setTask(fetchedTask);

      setFormData({
        title: fetchedTask.title || '',
        description: fetchedTask.description || '',
        status: fetchedTask.status || 'todo',
        priority: fetchedTask.priority || 'medium',
        dueDate: fetchedTask.dueDate ? fetchedTask.dueDate.substring(0, 10) : '',
        assigneeId: fetchedTask.assigneeId || ''
      });

      // Fetch project to retrieve team members list for assignee dropdown
      if (fetchedTask.projectId) {
        try {
          const projRes = await axiosClient.get(`/projects/${fetchedTask.projectId}`);
          const proj = projRes.data.data.project;
          const membersList = [];
          if (proj.owner) membersList.push(proj.owner);
          if (proj.members) {
            proj.members.forEach((m) => {
              if (!membersList.some((existing) => existing.id === m.id)) {
                membersList.push(m);
              }
            });
          }
          setProjectMembers(membersList);
        } catch (projErr) {
          console.warn('Could not fetch project members for assignees:', projErr);
        }
      }
    } catch (err) {
      console.error('Failed to load task details:', err);
      setError(err.response?.data?.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        assigneeId: formData.assigneeId || null
      };

      const response = await axiosClient.put(`/tasks/${taskId}`, payload);
      setTask((prev) => ({
        ...prev,
        ...response.data.data.task
      }));
      setSuccessMessage('Task updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.issue ||
        'Failed to update task.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this task?');
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError('');
      await axiosClient.delete(`/tasks/${taskId}`);
      // Navigate back to the project board
      if (task?.projectId) {
        navigate(`/projects/${task.projectId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.message || 'Failed to delete task.');
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading task details..." />;
  }

  if (error && !task) {
    return (
      <div className="main-content">
        <div className="alert alert-danger">
          <span>⚠️ {error}</span>
        </div>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: '960px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {task?.projectId ? (
          <Link
            to={`/projects/${task.projectId}`}
            style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-500)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            ← Back to {task.project?.name || 'Project Board'}
          </Link>
        ) : (
          <Link
            to="/dashboard"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-500)' }}
          >
            ← Back to Dashboard
          </Link>
        )}

        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={handleDeleteTask}
          disabled={deleting}
          id="delete-task-btn"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Main Task Editor Card */}
      <div className="card">
        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdateTask}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-task-title">
              Title
            </label>
            <input
              id="edit-task-title"
              type="text"
              name="title"
              className="form-input"
              style={{ fontSize: '1.15rem', fontWeight: 600 }}
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-task-desc">
              Description
            </label>
            <textarea
              id="edit-task-desc"
              name="description"
              className="form-textarea"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task details..."
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-status">
                Status
              </label>
              <select
                id="edit-task-status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-priority">
                Priority
              </label>
              <select
                id="edit-task-priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-assignee">
                Assignee
              </label>
              <select
                id="edit-task-assignee"
                name="assigneeId"
                className="form-select"
                value={formData.assigneeId}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-duedate">
                Due Date
              </label>
              <input
                id="edit-task-duedate"
                type="date"
                name="dueDate"
                className="form-input"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving || !formData.title.trim()}
              id="save-task-btn"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        {/* Comment Thread Component */}
        <CommentThread taskId={taskId} />
      </div>
    </div>
  );
};

export default TaskDetail;
