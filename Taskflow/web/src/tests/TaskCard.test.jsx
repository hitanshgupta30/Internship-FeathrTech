import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import TaskCard from '../components/TaskCard';

describe('TaskCard Component', () => {
  const mockTask = {
    id: 'task_123',
    title: 'Implement Database Connection Layer',
    description: 'Prepare schema for Neon PostgreSQL',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-09-01',
    assignee: {
      id: 'usr_456',
      name: 'Alex Developer'
    }
  };

  const renderComponent = (task = mockTask) => {
    return render(
      <BrowserRouter>
        <TaskCard task={task} />
      </BrowserRouter>
    );
  };

  it('renders task title correctly', () => {
    renderComponent();
    const titleElement = screen.getByTestId('task-title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('Implement Database Connection Layer');
  });

  it('renders status badge correctly', () => {
    renderComponent();
    const statusBadge = screen.getByTestId('task-status-badge');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveTextContent('In Progress');
  });

  it('renders priority badge correctly', () => {
    renderComponent();
    const priorityBadge = screen.getByTestId('task-priority-badge');
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveTextContent('High');
  });

  it('renders assignee name and due date', () => {
    renderComponent();
    const assigneeElement = screen.getByTestId('task-assignee');
    expect(assigneeElement).toHaveTextContent('Alex Developer');

    const dueDateElement = screen.getByTestId('task-duedate');
    expect(dueDateElement).toBeInTheDocument();
  });
});
