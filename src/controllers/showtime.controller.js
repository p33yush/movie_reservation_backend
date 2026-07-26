const showtimeService = require('../services/showtime.service');


async function getShowtimes(req, res, next) {
    try {
        const result = await showtimeService.getShowtimes(req.query);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

async function getShowtimesById(req, res, next) {
    try {
        const showtime = await showtimeService.getShowtimesById(req.params.id);
        res.json({ success: true, data: showtime });
    } catch (err) {
        next(err);
    }
}

async function createShowtime(req, res, next) {
    try {
        const showtime = await showtimeService.createShowtime(req.body);
        res.status(201).json({ success: true, data: showtime, message: 'showtime created' });
    } catch (err) {
        next(err);
    }
}

async function updateShowtime(req, res, next) {
    try {
        const showtime = await showtimeService.updateShowtime(req.params.id, req.body);
        res.json({ success: true, data: showtime, message: 'showtime updated' });
    } catch (err) {
        next(err);
    }
}

async function deleteShowtime(req, res, next) {
    try {
        const showtime = await showtimeService.deleteShowtime(req.params.id);
        res.json({ success: true, data: showtime, message: 'showtime deleted' });
    } catch (err) {
        next(err);
    }
}

module.exports = { getShowtimes, getShowtimesById, createShowtime, updateShowtime, deleteShowtime };