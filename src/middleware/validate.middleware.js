const AppError = require('../utils/AppError');

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // return all errors, not just the first
      stripUnknown: true, // remove unexpected fields
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new AppError(message, 400));
    }

    req.body = value; // use cleaned/validated data
    next();
  };
}

module.exports = validate;