async function getMe(req, res, next) {
    try {
      const { id, name, email, role, createdAt } = req.user;
  
      res.json({
        success: true,
        data: { id, name, email, role, createdAt },
      });
    } catch (err) {
      next(err);
    }
  }
  
  module.exports = { getMe };