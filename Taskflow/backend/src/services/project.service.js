const authService = require('./auth.service');
const taskService = require('./task.service');
const db = require('../config/db');

/**
 * IN-MEMORY PROJECT STORE (Fallback / Testing)
 */
let projects = [];

/**
 * Reset store for test isolation
 */
const resetStore = () => {
  projects = [];
};

/**
 * Helper to enrich project in memory
 * @param {object} project
 */
const populateProjectInMemory = async (project) => {
  if (!project) return null;

  const owner = await authService.findUserById(project.ownerId);
  const safeOwner = owner ? { id: owner.id, name: owner.name, email: owner.email } : null;

  const populatedMembers = [];
  for (const memberId of project.members || []) {
    const u = await authService.findUserById(memberId);
    if (u) {
      populatedMembers.push({ id: u.id, name: u.name, email: u.email });
    }
  }

  const openTaskCount = await taskService.countOpenTasksForProject(project.id);

  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    ownerId: project.ownerId,
    owner: safeOwner,
    members: populatedMembers,
    openTaskCount,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
};

/**
 * Check if a user has access to a project (as owner or member)
 * @param {string} projectId
 * @param {string} userId
 */
const hasProjectAccess = async (projectId, userId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const res = await db.query(
        `SELECT 1 FROM projects p
         LEFT JOIN project_members pm ON p.id = pm.project_id
         WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)
         LIMIT 1`,
        [projectId, userId]
      );
      return res.rows.length > 0;
    } catch (err) {
      console.error('Error checking project access in Neon DB:', err.message);
    }
  }

  const project = projects.find((p) => p.id === projectId);
  if (!project) return false;
  return project.ownerId === userId || (project.members && project.members.includes(userId));
};

/**
 * List all projects accessible to a user
 * @param {string} userId
 */
const listProjects = async (userId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const queryText = `
        SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.owner_id AS "ownerId", 
          p.created_at AS "createdAt", 
          p.updated_at AS "updatedAt",
          json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS owner,
          COALESCE(
            (
              SELECT json_agg(json_build_object('id', mu.id, 'name', mu.name, 'email', mu.email))
              FROM project_members pm2
              JOIN users mu ON pm2.user_id = mu.id
              WHERE pm2.project_id = p.id
            ),
            '[]'::json
          ) AS members,
          COALESCE(
            (
              SELECT COUNT(*)::int
              FROM tasks t
              WHERE t.project_id = p.id AND t.status != 'done'
            ),
            0
          ) AS "openTaskCount"
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        WHERE p.owner_id = $1 
           OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = $1)
        ORDER BY p.created_at DESC;
      `;
      const res = await db.query(queryText, [userId]);
      return res.rows;
    } catch (err) {
      console.error('Error listing projects in Neon DB:', err.message);
    }
  }

  const userProjects = projects.filter(
    (p) => p.ownerId === userId || (p.members && p.members.includes(userId))
  );

  const results = [];
  for (const proj of userProjects) {
    results.push(await populateProjectInMemory(proj));
  }
  return results;
};

/**
 * Get project by ID if user has access
 * @param {string} projectId
 * @param {string} userId
 */
const getProjectById = async (projectId, userId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const queryText = `
        SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.owner_id AS "ownerId", 
          p.created_at AS "createdAt", 
          p.updated_at AS "updatedAt",
          json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS owner,
          COALESCE(
            (
              SELECT json_agg(json_build_object('id', mu.id, 'name', mu.name, 'email', mu.email))
              FROM project_members pm2
              JOIN users mu ON pm2.user_id = mu.id
              WHERE pm2.project_id = p.id
            ),
            '[]'::json
          ) AS members,
          COALESCE(
            (
              SELECT COUNT(*)::int
              FROM tasks t
              WHERE t.project_id = p.id AND t.status != 'done'
            ),
            0
          ) AS "openTaskCount",
          EXISTS(
            SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = $2
          ) AS "isMember"
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        WHERE p.id = $1;
      `;
      const res = await db.query(queryText, [projectId, userId]);
      if (res.rows.length === 0) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
      }

      const project = res.rows[0];
      const isAuthorized = project.ownerId === userId || project.isMember;
      if (!isAuthorized) {
        const error = new Error('Access denied. You are not a member of this project.');
        error.statusCode = 403;
        throw error;
      }

      delete project.isMember;
      return project;
    } catch (err) {
      if (err.statusCode) throw err;
      console.error('Error fetching project by ID in Neon DB:', err.message);
    }
  }

  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const isAuthorized = project.ownerId === userId || (project.members && project.members.includes(userId));
  if (!isAuthorized) {
    const error = new Error('Access denied. You are not a member of this project.');
    error.statusCode = 403;
    throw error;
  }

  return populateProjectInMemory(project);
};

/**
 * Create a new project
 * @param {object} param0 { name, description, ownerId }
 */
const createProject = async ({ name, description, ownerId }) => {
  const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (db.isDatabaseConfigured() && db.pool) {
    try {
      await db.query(
        `INSERT INTO projects (id, name, description, owner_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [newId, name.trim(), (description || '').trim(), ownerId]
      );
      return getProjectById(newId, ownerId);
    } catch (err) {
      console.error('Error creating project in Neon DB:', err.message);
      throw err;
    }
  }

  const newProject = {
    id: newId,
    name: name.trim(),
    description: (description || '').trim(),
    ownerId,
    members: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.push(newProject);
  return populateProjectInMemory(newProject);
};

/**
 * Update project details (owner only)
 * @param {string} projectId
 * @param {string} userId
 * @param {object} updateData
 */
const updateProject = async (projectId, userId, updateData) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      // Check existing project
      const checkRes = await db.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
      if (checkRes.rows.length === 0) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
      }
      if (checkRes.rows[0].owner_id !== userId) {
        const error = new Error('Only the project owner can update project details.');
        error.statusCode = 403;
        throw error;
      }

      await db.query(
        `UPDATE projects 
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             updated_at = NOW()
         WHERE id = $3`,
        [updateData.name ? updateData.name.trim() : null, updateData.description !== undefined ? updateData.description.trim() : null, projectId]
      );

      return getProjectById(projectId, userId);
    } catch (err) {
      if (err.statusCode) throw err;
      console.error('Error updating project in Neon DB:', err.message);
      throw err;
    }
  }

  const projectIndex = projects.findIndex((p) => p.id === projectId);
  if (projectIndex === -1) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const project = projects[projectIndex];
  if (project.ownerId !== userId) {
    const error = new Error('Only the project owner can update project details.');
    error.statusCode = 403;
    throw error;
  }

  const updatedProject = {
    ...project,
    ...updateData,
    id: project.id,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: new Date().toISOString()
  };

  projects[projectIndex] = updatedProject;
  return populateProjectInMemory(updatedProject);
};

/**
 * Delete project and related tasks (owner only)
 * @param {string} projectId
 * @param {string} userId
 */
const deleteProject = async (projectId, userId) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const checkRes = await db.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
      if (checkRes.rows.length === 0) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
      }
      if (checkRes.rows[0].owner_id !== userId) {
        const error = new Error('Only the project owner can delete this project.');
        error.statusCode = 403;
        throw error;
      }

      await db.query('DELETE FROM projects WHERE id = $1', [projectId]);
      return { message: 'Project deleted successfully' };
    } catch (err) {
      if (err.statusCode) throw err;
      console.error('Error deleting project in Neon DB:', err.message);
      throw err;
    }
  }

  const projectIndex = projects.findIndex((p) => p.id === projectId);
  if (projectIndex === -1) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const project = projects[projectIndex];
  if (project.ownerId !== userId) {
    const error = new Error('Only the project owner can delete this project.');
    error.statusCode = 403;
    throw error;
  }

  projects.splice(projectIndex, 1);
  taskService.deleteTasksByProject(projectId);

  return { message: 'Project deleted successfully' };
};

/**
 * Add a member to a project by email (owner only)
 * @param {string} projectId
 * @param {string} userId
 * @param {string} memberEmail
 */
const addMember = async (projectId, userId, memberEmail) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const checkRes = await db.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
      if (checkRes.rows.length === 0) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
      }
      if (checkRes.rows[0].owner_id !== userId) {
        const error = new Error('Only the project owner can invite team members.');
        error.statusCode = 403;
        throw error;
      }

      const targetUser = await authService.findUserByEmail(memberEmail);
      if (!targetUser) {
        const error = new Error('User not found with this email address. Please make sure they have created a TaskFlow account first.');
        error.statusCode = 404;
        throw error;
      }

      if (targetUser.id === checkRes.rows[0].owner_id) {
        const error = new Error('User is already the owner of this project.');
        error.statusCode = 400;
        throw error;
      }

      const memberCheck = await db.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, targetUser.id]
      );
      if (memberCheck.rows.length > 0) {
        const error = new Error('User is already a member of this project.');
        error.statusCode = 400;
        throw error;
      }

      const memberRecordId = `pm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.query(
        `INSERT INTO project_members (id, project_id, user_id, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [memberRecordId, projectId, targetUser.id]
      );

      await db.query('UPDATE projects SET updated_at = NOW() WHERE id = $1', [projectId]);

      return getProjectById(projectId, userId);
    } catch (err) {
      if (err.statusCode) throw err;
      console.error('Error adding project member in Neon DB:', err.message);
      throw err;
    }
  }

  const projectIndex = projects.findIndex((p) => p.id === projectId);
  if (projectIndex === -1) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const project = projects[projectIndex];
  if (project.ownerId !== userId) {
    const error = new Error('Only the project owner can invite team members.');
    error.statusCode = 403;
    throw error;
  }

  const targetUser = await authService.findUserByEmail(memberEmail);
  if (!targetUser) {
    const error = new Error('User not found with this email address. Please make sure they have created a TaskFlow account first.');
    error.statusCode = 404;
    throw error;
  }

  if (targetUser.id === project.ownerId) {
    const error = new Error('User is already the owner of this project.');
    error.statusCode = 400;
    throw error;
  }

  if (!project.members) {
    project.members = [];
  }

  if (project.members.includes(targetUser.id)) {
    const error = new Error('User is already a member of this project.');
    error.statusCode = 400;
    throw error;
  }

  project.members.push(targetUser.id);
  project.updatedAt = new Date().toISOString();
  projects[projectIndex] = project;

  return populateProjectInMemory(project);
};

module.exports = {
  resetStore,
  hasProjectAccess,
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember
};
