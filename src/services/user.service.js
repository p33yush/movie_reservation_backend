const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const QRCode = require('qrcode');

async function getUserProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
        }
    });

    if (!user) throw new AppError('User not found', 404);
    return user;
}

async function getUserReservations(userId) {
    const reservations = await prisma.reservation.findMany({
        where: { 
            userId: parseInt(userId),
            status: { not: 'PENDING' } 
        },
        include: {
            showtime: {
                include: {
                    movie: true,
                    screen: { include: { theatre: true } }
                }
            },
            reservedSeats: {
                include: { seat: true }
            },
            payment: true
        },
        orderBy: {
            showtime: { startTime: 'desc' }
        }
    });

    const now = new Date();
    const upcoming = [];
    const past = [];

    for (const res of reservations) {
        const qrData = JSON.stringify({ reservationId: res.id, userId: res.userId, status: res.status });
        const qrCodeBase64 = await QRCode.toDataURL(qrData);

        const formattedRes = {
            ...res,
            qrCode: qrCodeBase64
        };

        if (new Date(res.showtime.endTime) < now) {
            past.push(formattedRes);
        } else {
            upcoming.push(formattedRes);
        }
    }

    return { upcoming, past };
}

module.exports = {
    getUserProfile,
    getUserReservations
};
