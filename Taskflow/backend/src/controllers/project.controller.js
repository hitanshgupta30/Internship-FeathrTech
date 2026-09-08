const projectService = require('../services/project.service');

/**
 * List all projects accessible to authenticated user
 */
const listProjects = async (req, res, next) => {
  try {
    const projects = await projectService.listProjects(req.user.id);
    return res.status(200).json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await projectService.createProject({
      name,
      description,
      ownerId: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project details
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project
 */
const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add member to project by email
 */
const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const project = await projectService.addMember(req.params.id, req.user.id, email);
    return res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember
};
