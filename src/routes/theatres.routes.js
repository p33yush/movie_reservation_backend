const express = require('express');
const router = express.Router();

// GET /api/theatres
router.get('/', (req, res) => {
  res.json({ message: 'Get all theatres' });
});

// GET /api/theatres/:id
router.get('/:id', (req, res) => {
  res.json({ message: `Get theatre ${req.params.id}` });
});

module.exports = router;