const taskService = require('../services/task.service');
const projectService = require('../services/project.service');

/**
 * Helper to ensure user has access to task's project
 */
const checkTaskAccess = async (taskId, userId) => {
  const task = await taskService.getTaskById(taskId);
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  const hasAccess = await projectService.hasProjectAccess(task.projectId, userId);
  if (!hasAccess) {
    const error = new Error('Access denied to this task.');
    error.statusCode = 403;
    throw error;
  }

  return task;
};

/**
 * Get all tasks for a project
 */
const getProjectTasks = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    // Verify user has access to project
    await projectService.getProjectById(projectId, req.user.id);

    const tasks = await taskService.getTasksByProject(projectId);
    return res.status(200).json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a task inside a project
 */
const createTask = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    // Verify user has access to project
    await projectService.getProjectById(projectId, req.user.id);

    const task = await taskService.createTask(projectId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task details by task ID
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await checkTaskAccess(req.params.id, req.user.id);
    const project = await projectService.getProjectById(task.projectId, req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        task: {
          ...task,
          project: {
            id: project.id,
            name: project.name
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing task
 */
const updateTask = async (req, res, next) => {
  try {
    await checkTaskAccess(req.params.id, req.user.id);

    const task = await taskService.updateTask(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 */
const deleteTask = async (req, res, next) => {
  try {
    await checkTaskAccess(req.params.id, req.user.id);

    const result = await taskService.deleteTask(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments for a task
 */
const getTaskComments = async (req, res, next) => {
  try {
    await checkTaskAccess(req.params.id, req.user.id);

    const comments = await taskService.getCommentsByTaskId(req.params.id);
    return res.status(200).json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a comment to a task
 */
const addTaskComment = async (req, res, next) => {
  try {
    await checkTaskAccess(req.params.id, req.user.id);

    const comment = await taskService.addComment(req.params.id, req.user, req.body);
    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskComments,
  addTaskComment
};
