const express = require('express');
const router = express.Router();

// GET /api/movies
router.get('/', (req, res) => {
  res.json({ message: 'Get all movies' });
});

// GET /api/movies/:id
router.get('/:id', (req, res) => {
  res.json({ message: `Get movie ${req.params.id}` });
});

// POST /api/movies (admin only - placeholder)
router.post('/', (req, res) => {
  res.json({ message: 'Create movie' });
});

module.exports = router;