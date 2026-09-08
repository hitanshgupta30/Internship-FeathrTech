/**
 * Middleware generator for Zod request validation
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {'body' | 'query' | 'params'} source - Request property to validate (default: 'body')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.') || 'root',
        issue: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req[source] = result.data;
    next();
  };
};

module.exports = {
  validate
};
