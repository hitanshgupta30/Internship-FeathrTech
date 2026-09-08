const express = require('express');
const projectController = require('../controllers/project.controller');
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema
} = require('../validators/project.validator');
const { createTaskSchema } = require('../validators/task.validator');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// Project CRUD
router.get('/', projectController.listProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Project Members
router.post('/:id/members', validate(addMemberSchema), projectController.addMember);

// Project Tasks
router.get('/:id/tasks', taskController.getProjectTasks);
router.post('/:id/tasks', validate(createTaskSchema), taskController.createTask);

module.exports = router;
