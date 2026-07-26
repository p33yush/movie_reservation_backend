const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtime.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const { createShowtimeSchema, updateShowtimeSchema } = require('../validators/showtime.validator');


router.get('/', showtimeController.getShowtimes);
router.get('/:id', showtimeController.getShowtimesById);

router.post('/', authenticate, authorize('ADMIN'), validate(createShowtimeSchema), showtimeController.createShowtime);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateShowtimeSchema), showtimeController.updateShowtime);
router.delete('/:id', authenticate, authorize('ADMIN'), showtimeController.deleteShowtime);

module.exports = router;
