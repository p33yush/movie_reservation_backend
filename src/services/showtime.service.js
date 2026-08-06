const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { redisClient } = require('../config/redis');

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

    // NEW: Stop deletion if people have paid for tickets to this specific showtime
    const activeReservations = await prisma.reservation.findFirst({
        where: {
            showtimeId: parseInt(id),
            status: 'CONFIRMED'
        }
    });

    if (activeReservations) {
        throw new AppError('Cannot delete: Showtime has active confirmed bookings.', 409);
    }

    await prisma.showtime.delete({ where: { id: parseInt(id) } });
    return existing;
}


async function getSeatMap(showtimeId) {
    // 1. Get the showtime so we know the screenId
    const showtime = await prisma.showtime.findUnique({
        where: { id: parseInt(showtimeId) },
        include: { screen: { include: { seats: true } } }
    });

    if (!showtime) throw new AppError('Showtime not found', 404);

    // 2. Get all reserved seats for this showtime
    const reservations = await prisma.reservation.findMany({
        where: { showtimeId: showtime.id, status: { not: 'CANCELLED' } },
        include: { reservedSeats: true }
    });

    const reservedSeatIds = new Set();
    reservations.forEach(res => {
        res.reservedSeats.forEach(rs => reservedSeatIds.add(rs.seatId));
    });

    // 3. Format the seat map
    const seatMap = showtime.screen.seats.map(seat => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        type: seat.seatType,
        status: reservedSeatIds.has(seat.id) ? 'RESERVED' : 'AVAILABLE'
    }));

    // Group by row for easy frontend rendering
    const groupedSeats = {};
    seatMap.forEach(seat => {
        if (!groupedSeats[seat.row]) groupedSeats[seat.row] = [];
        groupedSeats[seat.row].push(seat);
    });

    return {
        showtimeId: showtime.id,
        screenName: showtime.screen.name,
        price: showtime.price,
        seats: groupedSeats
    };
}

async function lockSeat(showtimeId, seatId, userId) {
    const lockKey = `lock:showtime:${showtimeId}:seat:${seatId}`;

    const isLocked = await redisClient.get(lockKey);
    if (isLocked) {
        throw new AppError('Seat is already locked', 409);
    }

    const isReserved = await prisma.reservedSeat.findFirst({
        where: {
            seatId: parseInt(seatId),
            reservation: {
                showtimeId: parseInt(showtimeId),
                status: { not: 'CANCELLED' }
            }
        }
    });

    if (isReserved) {
        throw new AppError('Seat is booked', 409);
    }

    await redisClient.set(lockKey, userId.toString(), {
        NX: true, EX: 600
    });

    return {
        message: 'Seat lock done', expiresAt: new Date(Date.now() + 600 * 1000)
    };
}

async function unlockSeat(showtimeId, seatId, userId) {
    const lockKey = `lock:showtime:${showtimeId}:seat:${seatId}`;

    const lockedBy = await redisClient.get(lockKey);
    if (lockedBy === userId.toString()) {
        await redisClient.del(lockKey);
    }
    return { message: 'Seat unlock done' };
}

module.exports = { getShowtimes, getShowtimesById, createShowtime, updateShowtime, deleteShowtime, getSeatMap, lockSeat, unlockSeat };

