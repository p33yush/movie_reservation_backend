const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const movieRoutes = require('./movies.routes');
const theatreRoutes = require('./theatres.routes');
const userRoutes = require('./users.routes');

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/theatres', theatreRoutes);
router.use('/users',userRoutes);

module.exports = router;