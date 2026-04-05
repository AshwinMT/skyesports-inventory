const { z } = require('zod');

const validate = (schema) => async (req, res, next) => {
  try {
    const validData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace req parameters with validated and typed equivalents
    req.body = validData.body;
    req.query = validData.query;
    req.params = validData.params;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
};

module.exports = { validate };
