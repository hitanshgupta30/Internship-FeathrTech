import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectBoard = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [taskSearch, setTaskSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Add Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assigneeId: ''
  });
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskFormError, setTaskFormError] = useState('');

  // Add Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberFormError, setMemberFormError] = useState('');
  const [memberSuccessMessage, setMemberSuccessMessage] = useState('');

  const fetchProjectData = async () => {
    try {
      setError('');
      const [projRes, taskRes] = await Promise.all([
        axiosClient.get(`/projects/${projectId}`),
        axiosClient.get(`/projects/${projectId}/tasks`)
      ]);

      setProject(projRes.data.data.project);
      setTasks(taskRes.data.data.tasks || []);
    } catch (err) {
      console.error('Failed to load project board:', err);
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const isOwner = project && user && project.ownerId === user.id;

  const availableAssignees = [];
  if (project?.owner) {
    availableAssignees.push(project.owner);
  }
  if (project?.members) {
    project.members.forEach((m) => {
      if (!availableAssignees.some((a) => a.id === m.id)) {
        availableAssignees.push(m);
      }
    });
  }

  const openTaskModalWithStatus = (status = 'todo') => {
    setNewTask((prev) => ({ ...prev, status }));
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newTask.title.trim()) {
      setTaskFormError('Task title is required.');
      return;
    }

    try {
      setTaskSubmitting(true);
      setTaskFormError('');

      const payload = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate || null,
        assigneeId: newTask.assigneeId || null
      };

      const response = await axiosClient.post(`/projects/${projectId}/tasks`, payload);
      setTasks((prev) => [...prev, response.data.data.task]);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assigneeId: ''
      });
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      setTaskFormError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.issue ||
        'Failed to create task.'
      );
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!memberEmail.trim()) {
      setMemberFormError('Member email is required.');
      return;
    }

    try {
      setMemberSubmitting(true);
      setMemberFormError('');
      setMemberSuccessMessage('');

      const response = await axiosClient.post(`/projects/${projectId}/members`, {
        email: memberEmail.trim()
      });

      setProject(response.data.data.project);
      setMemberSuccessMessage('Member added.');
      setMemberEmail('');
      setTimeout(() => {
        setIsMemberModalOpen(false);
        setMemberSuccessMessage('');
      }, 1000);
    } catch (err) {
      console.error('Failed to add member:', err);
      setMemberFormError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.issue ||
        'Failed to add member.'
      );
    } finally {
      setMemberSubmitting(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !taskSearch.trim() ||
        t.title?.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.description?.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.assignee?.name?.toLowerCase().includes(taskSearch.toLowerCase());

      const matchPriority =
        priorityFilter === 'all' || t.priority?.toLowerCase() === priorityFilter;

      return matchSearch && matchPriority;
    });
  }, [tasks, taskSearch, priorityFilter]);

  if (loading) {
    return <LoadingSpinner message="Loading board..." />;
  }

  if (error || !project) {
    return (
      <div className="main-content">
        <div className="alert alert-danger">
          <span>{error || 'Project not found.'}</span>
        </div>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          Back
        </Link>
      </div>
    );
  }

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  return (
    <div className="main-content">
      {/* Navigation */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Project Header */}
      <div className="project-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>{project.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px', maxWidth: '650px' }}>
            {project.description || 'No description provided.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {isOwner && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsMemberModalOpen(true)}
              id="add-member-btn"
            >
              Add Member
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => openTaskModalWithStatus('todo')}
            id="add-task-btn"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Project Meta Bar */}
      <div className="project-meta-bar">
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
            Owner
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
            {project.owner ? project.owner.name : 'Unknown'}
          </span>
        </div>

        <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 'var(--space-4)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
            Members ({project.members?.length || 0})
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {project.members && project.members.length > 0 ? (
              project.members.map((m) => (
                <span key={m.id} className="member-chip">
                  {m.name}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                No extra members
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Task Filter */}
      <div className="search-filter-bar" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="search-input-wrapper" style={{ maxWidth: '320px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Filter tasks..."
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              type="button"
              className={`btn btn-sm ${priorityFilter === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPriorityFilter(p)}
              style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="board-container">
        {/* Column: TODO */}
        <div className="board-column">
          <div className="column-header">
            <span className="column-title">To Do</span>
            <span className="column-count">{todoTasks.length}</span>
          </div>

          <div className="column-tasks">
            {todoTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem', padding: 'var(--space-6) 0' }}>
                Empty
              </p>
            ) : (
              todoTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        {/* Column: IN PROGRESS */}
        <div className="board-column">
          <div className="column-header">
            <span className="column-title">In Progress</span>
            <span className="column-count">{inProgressTasks.length}</span>
          </div>

          <div className="column-tasks">
            {inProgressTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem', padding: 'var(--space-6) 0' }}>
                Empty
              </p>
            ) : (
              inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        {/* Column: DONE */}
        <div className="board-column">
          <div className="column-header">
            <span className="column-title">Done</span>
            <span className="column-count">{doneTasks.length}</span>
          </div>

          <div className="column-tasks">
            {doneTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem', padding: 'var(--space-6) 0' }}>
                Empty
              </p>
            ) : (
              doneTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskFormError('');
        }}
        title="Add Task"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsTaskModalOpen(false)}
              disabled={taskSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateTask}
              disabled={taskSubmitting || !newTask.title.trim()}
              id="confirm-create-task-btn"
            >
              {taskSubmitting ? 'Adding...' : 'Add'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateTask}>
          {taskFormError && <div className="alert alert-danger">{taskFormError}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Title *
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Design landing page"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              Description
            </label>
            <textarea
              id="task-desc"
              className="form-textarea"
              placeholder="Task details..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                className="form-select"
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="form-select"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">
                Assignee
              </label>
              <select
                id="task-assignee"
                className="form-select"
                value={newTask.assigneeId}
                onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {availableAssignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                className="form-input"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberFormError('');
          setMemberSuccessMessage('');
        }}
        title="Add Member"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsMemberModalOpen(false)}
              disabled={memberSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddMember}
              disabled={memberSubmitting || !memberEmail.trim()}
              id="confirm-add-member-btn"
            >
              {memberSubmitting ? 'Adding...' : 'Add'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddMember}>
          {memberFormError && <div className="alert alert-danger">{memberFormError}</div>}
          {memberSuccessMessage && <div className="alert alert-success">{memberSuccessMessage}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="member-email">
              Email *
            </label>
            <input
              id="member-email"
              type="email"
              className="form-input"
              placeholder="user@example.com"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectBoard;
