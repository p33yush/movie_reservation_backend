const prisma = require('../config/database');
const AppError = require('../utils/AppError');

async function getShowtimes({ movieId, date, screenId }) {
    const where = {};

    if (movieId) {
        where.movieId = parseInt(movieId);
    }
    if (screenId) {
        where.screenId = parseInt(screenId);
    }
    if (date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        where.startTime = { gte: dayStart, lte: dayEnd };
    }

    const showtimes = await prisma.showtime.findMany({
        where, include: {
            movie: true,
            screen: {
                include: {
                    theatre: true
                },
            },
        },
        orderBy: { startTime: 'asc' },
    });

    return showtimes;
}

async function getShowtimesById(id) {
    const existing = await prisma.showtime.findUnique({
        where: { id: parseInt(id) },
        include: {
            movie: true, screen: {
                include: { theatre: true },
            },
        },
    });
    if (!existing) {
        throw new AppError('Showtime not found', 404);
    }
    return existing;


}

async function createShowtime({ movieId, screenId, startTime, price }) {
    const movie = await prisma.movie.findUnique({
        where: {
            id: movieId
        }
    });
    if (!movie) throw new AppError('Movie not found', 404);


    const screen = await prisma.screen.findUnique({ where: { id: screenId } });
    if (!screen) throw new AppError('Screen not found', 404);



    const start = new Date(startTime);
    const end = new Date(start.getTime() + movie.duration * 60000);

    // Check for conflicts on same screen, same day
    const conflict = await prisma.showtime.findFirst({
        where: {
            screenId: screen.id,
            startTime: { lt: end },
            endTime: { gt: start }
        }
    });

    if (conflict) {
        throw new AppError('Showtime conflict with existing show', 409);
    }


    const showtime = await prisma.showtime.create({
        data: { movieId, screenId, startTime: start, endTime: end, price },
        include: {
            movie: true, screen: true
        },
    });
    return showtime;
}

async function updateShowtime(id, data) {
    const existing = await prisma.showtime.findUnique({
        where: { id: parseInt(id) },
    });

    if (!existing) {
        throw new AppError('Showtime not found', 404);
    }

    const showtime = await prisma.showtime.update({
        where: { id: parseInt(id) },
        data,
    });

    return showtime;
}

async function deleteShowtime(id) {
    const existing = await prisma.showtime.findUnique({ where: { id: parseInt(id) } });

    if (!existing) {
        throw new AppError('Showtime not found', 404);
    }

    await prisma.showtime.delete({ where: { id: parseInt(id) } });

    return existing;
}

module.exports = { getShowtimes, getShowtimesById, createShowtime, updateShowtime, deleteShowtime };

