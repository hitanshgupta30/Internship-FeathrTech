const { z } = require('zod');

const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .trim()
    .min(1, 'Task title cannot be empty'),
  description: z
    .string()
    .trim()
    .optional()
    .default(''),
  status: z
    .enum(['todo', 'in_progress', 'done'], {
      errorMap: () => ({ message: "Status must be 'todo', 'in_progress', or 'done'" })
    })
    .default('todo'),
  priority: z
    .enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: "Priority must be 'low', 'medium', or 'high'" })
    })
    .default('medium'),
  dueDate: z
    .string()
    .nullable()
    .optional(),
  assigneeId: z
    .string()
    .nullable()
    .optional()
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title cannot be empty')
    .optional(),
  description: z
    .string()
    .trim()
    .optional(),
  status: z
    .enum(['todo', 'in_progress', 'done'], {
      errorMap: () => ({ message: "Status must be 'todo', 'in_progress', or 'done'" })
    })
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: "Priority must be 'low', 'medium', or 'high'" })
    })
    .optional(),
  dueDate: z
    .string()
    .nullable()
    .optional(),
  assigneeId: z
    .string()
    .nullable()
    .optional()
});

const createCommentSchema = z.object({
  body: z
    .string({ required_error: 'Comment body is required' })
    .trim()
    .min(1, 'Comment body cannot be empty')
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  createCommentSchema
};
