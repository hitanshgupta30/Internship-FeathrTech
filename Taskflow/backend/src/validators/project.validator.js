const { z } = require('zod');

const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .trim()
    .min(1, 'Project name cannot be empty'),
  description: z
    .string()
    .trim()
    .optional()
    .default('')
});

const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name cannot be empty')
    .optional(),
  description: z
    .string()
    .trim()
    .optional()
});

const addMemberSchema = z.object({
  email: z
    .string({ required_error: 'Member email is required' })
    .trim()
    .email('Invalid member email address')
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema
};
