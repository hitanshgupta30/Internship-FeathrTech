const authService = require('./auth.service');
const db = require('../config/db');

/**
 * IN-MEMORY TASK & COMMENT STORE (Fallback / Testing)
 */
let tasks = [];
let comments = [];

/**
 * Reset stores for test isolation
 */
const resetStore = () => {
  tasks = [];
  comments = [];
};

/**
 * Helper to count open tasks (status !== 'done') for a given project
 * @param {string} projectId
 */
const countOpenTasksForProject = async (projectId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const res = await db.query(
        "SELECT COUNT(*)::int AS count FROM tasks WHERE project_id = $1 AND status != 'done'",
        [projectId]
      );
      return res.rows[0] ? res.rows[0].count : 0;
    } catch (err) {
      console.error('Error counting open tasks in Neon DB:', err.message);
    }
  }

  return tasks.filter((t) => t.projectId === projectId && t.status !== 'done').length;
};

/**
 * Helper to populate assignee object in memory
 * @param {object} task
 */
const populateTaskInMemory = async (task) => {
  if (!task) return null;
  const enriched = { ...task };
  if (enriched.assigneeId) {
    const assignee = await authService.findUserById(enriched.assigneeId);
    if (assignee) {
      const { password: _, ...safeAssignee } = assignee;
      enriched.assignee = safeAssignee;
    } else {
      enriched.assignee = null;
    }
  } else {
    enriched.assignee = null;
  }
  return enriched;
};

/**
 * Get all tasks for a project
 * @param {string} projectId
 */
const getTasksByProject = async (projectId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const queryText = `
        SELECT 
          t.id, 
          t.project_id AS "projectId", 
          t.title, 
          t.description, 
          t.status, 
          t.priority,
          t.due_date AS "dueDate", 
          t.assignee_id AS "assigneeId", 
          t.created_at AS "createdAt", 
          t.updated_at AS "updatedAt",
          CASE 
            WHEN u.id IS NOT NULL THEN json_build_object('id', u.id, 'name', u.name, 'email', u.email) 
            ELSE NULL 
          END AS assignee
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        WHERE t.project_id = $1
        ORDER BY t.created_at ASC;
      `;
      const res = await db.query(queryText, [projectId]);
      return res.rows;
    } catch (err) {
      console.error('Error getting tasks by project in Neon DB:', err.message);
    }
  }

  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const populated = [];
  for (const t of projectTasks) {
    populated.push(await populateTaskInMemory(t));
  }
  return populated;
};

/**
 * Create a new task in a project
 * @param {string} projectId
 * @param {object} taskData
 */
const createTask = async (projectId, taskData) => {
  const newId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (db.isDatabaseConfigured() && db.pool) {
    try {
      await db.query(
        `INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, assignee_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          newId,
          projectId,
          taskData.title.trim(),
          (taskData.description || '').trim(),
          taskData.status || 'todo',
          taskData.priority || 'medium',
          taskData.dueDate || null,
          taskData.assigneeId || null
        ]
      );

      return getTaskById(newId);
    } catch (err) {
      console.error('Error creating task in Neon DB:', err.message);
      throw err;
    }
  }

  const newTask = {
    id: newId,
    projectId,
    title: taskData.title.trim(),
    description: (taskData.description || '').trim(),
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium',
    dueDate: taskData.dueDate || null,
    assigneeId: taskData.assigneeId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);
  return populateTaskInMemory(newTask);
};

/**
 * Find task by ID
 * @param {string} taskId
 */
const getTaskById = async (taskId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const queryText = `
        SELECT 
          t.id, 
          t.project_id AS "projectId", 
          t.title, 
          t.description, 
          t.status, 
          t.priority,
          t.due_date AS "dueDate", 
          t.assignee_id AS "assigneeId", 
          t.created_at AS "createdAt", 
          t.updated_at AS "updatedAt",
          CASE 
            WHEN u.id IS NOT NULL THEN json_build_object('id', u.id, 'name', u.name, 'email', u.email) 
            ELSE NULL 
          END AS assignee
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        WHERE t.id = $1;
      `;
      const res = await db.query(queryText, [taskId]);
      return res.rows[0] || null;
    } catch (err) {
      console.error('Error getting task by ID in Neon DB:', err.message);
    }
  }

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;
  return populateTaskInMemory(task);
};

/**
 * Update an existing task
 * @param {string} taskId
 * @param {object} updateData
 */
const updateTask = async (taskId, updateData) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const existing = await getTaskById(taskId);
      if (!existing) {
        const error = new Error('Task not found.');
        error.statusCode = 404;
        throw error;
      }

      await db.query(
        `UPDATE tasks
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             status = COALESCE($3, status),
             priority = COALESCE($4, priority),
             due_date = CASE WHEN $5 = '__NULL__' THEN NULL WHEN $5 IS NOT NULL THEN $5 ELSE due_date END,
             assignee_id = CASE WHEN $6 = '__NULL__' THEN NULL WHEN $6 IS NOT NULL THEN $6 ELSE assignee_id END,
             updated_at = NOW()
         WHERE id = $7`,
        [
          updateData.title ? updateData.title.trim() : null,
          updateData.description !== undefined ? updateData.description.trim() : null,
          updateData.status || null,
          updateData.priority || null,
          updateData.dueDate === null ? '__NULL__' : updateData.dueDate || null,
          updateData.assigneeId === null ? '__NULL__' : updateData.assigneeId || null,
          taskId
        ]
      );

      return getTaskById(taskId);
    } catch (err) {
      if (err.statusCode) throw err;
      console.error('Error updating task in Neon DB:', err.message);
      throw err;
    }
  }

  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  const existingTask = tasks[taskIndex];
  const updatedTask = {
    ...existingTask,
    ...updateData,
    id: existingTask.id,
    projectId: existingTask.projectId,
    createdAt: existingTask.createdAt,
    updatedAt: new Date().toISOString()
  };

  tasks[taskIndex] = updatedTask;
  return populateTaskInMemory(updatedTask);
};

/**
 * Delete a task and associated comments
 * @param {string} taskId
 */
const deleteTask = async (taskId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const existing = await getTaskById(taskId);
      if (!existing) {
        const error = new Error('Task not found.');
        error.statusCode = 404;
        throw error;
      }

      await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
      return { message: 'Task deleted successfully' };
    } catch (err) {
      if (err.statusCode) throw err;
      console.error('Error deleting task in Neon DB:', err.message);
      throw err;
    }
  }

  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  tasks.splice(taskIndex, 1);
  comments = comments.filter((c) => c.taskId !== taskId);

  return { message: 'Task deleted successfully' };
};

/**
 * Delete all tasks and comments for a project
 * @param {string} projectId
 */
const deleteTasksByProject = async (projectId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      await db.query('DELETE FROM tasks WHERE project_id = $1', [projectId]);
      return;
    } catch (err) {
      console.error('Error deleting project tasks in Neon DB:', err.message);
    }
  }

  const projectTaskIds = tasks.filter((t) => t.projectId === projectId).map((t) => t.id);
  tasks = tasks.filter((t) => t.projectId !== projectId);
  comments = comments.filter((c) => !projectTaskIds.includes(c.taskId));
};

/**
 * Get comments for a task sorted oldest first
 * @param {string} taskId
 */
const getCommentsByTaskId = async (taskId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const queryText = `
        SELECT 
          id, 
          task_id AS "taskId", 
          author_id AS "authorId", 
          author_name AS "authorName", 
          body, 
          created_at AS "createdAt"
        FROM comments
        WHERE task_id = $1
        ORDER BY created_at ASC;
      `;
      const res = await db.query(queryText, [taskId]);
      return res.rows;
    } catch (err) {
      console.error('Error getting task comments in Neon DB:', err.message);
    }
  }

  const taskComments = comments.filter((c) => c.taskId === taskId);
  return taskComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

/**
 * Add a comment to a task
 * @param {string} taskId
 * @param {object} author { id, name }
 * @param {object} param2 { body }
 */
const addComment = async (taskId, author, { body }) => {
  const task = await getTaskById(taskId);
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  const newId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const res = await db.query(
        `INSERT INTO comments (id, task_id, author_id, author_name, body, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, task_id AS "taskId", author_id AS "authorId", author_name AS "authorName", body, created_at AS "createdAt"`,
        [newId, taskId, author.id, author.name, body.trim()]
      );
      return res.rows[0];
    } catch (err) {
      console.error('Error adding task comment in Neon DB:', err.message);
      throw err;
    }
  }

  const newComment = {
    id: newId,
    taskId,
    authorId: author.id,
    authorName: author.name,
    body: body.trim(),
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  return newComment;
};

module.exports = {
  resetStore,
  countOpenTasksForProject,
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  deleteTasksByProject,
  getCommentsByTaskId,
  addComment
};
