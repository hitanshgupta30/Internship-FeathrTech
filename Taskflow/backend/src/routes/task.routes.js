const express = require('express');
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  updateTaskSchema,
  createCommentSchema
} = require('../validators/task.validator');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// Task CRUD
router.get('/:id', taskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Task Comments
router.get('/:id/comments', taskController.getTaskComments);
router.post('/:id/comments', validate(createCommentSchema), taskController.addTaskComment);

module.exports = router;
