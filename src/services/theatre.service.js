const prisma = require('../config/database');
const AppError = require('../utils/AppError');

async function getAllTheatres({ city }) {
    const where = {};
    if (city) {
        where.city = city;
    }

    const theatres = await prisma.theatre.findMany({ where, include: { screens: true }, });

    return theatres;
}

async function getTheatreById(id) {
    const theatre = await prisma.theatre.findUnique({
        where: { id: parseInt(id) },
        include: {
            screens: {
                include: { seats: true },
            },
        },
    });

    if (!theatre) {
        throw new AppError('Theatre not found', 404);
    }
    return theatre;
}

async function createTheatre(data) {
    const theatre = await prisma.theatre.create({ data });
    return theatre;
}

async function updateTheatre(id, data) {
    const existing = await prisma.theatre.findUnique({
        where: { id: parseInt(id) },
    });

    if (!existing) {
        throw new AppError('Theatre not found', 404);
    }

    const theatre = await prisma.theatre.update({
        where: { id: parseInt(id) },
        data,
    });

    return theatre;
}

async function deleteTheatre(id) {
    const existing = await prisma.theatre.findUnique({
        where: { id: parseInt(id) },
    });

    if (!existing) {
        throw new AppError('Theatre not found', 404);
    }

    await prisma.theatre.delete({ where: { id: parseInt(id) } });

    return existing;
}

async function createScreen(theatreId, data) {
    const theatre = await prisma.theatre.findUnique({
        where: { id: parseInt(theatreId) },
    });

    if (!theatre) {
        throw new AppError('Theatre not found', 404);
    }

    const screen = await prisma.screen.create({
        data: {
            ...data,
            theatreId: parseInt(theatreId),
        },
    });

    return screen;
}


module.exports = { getAllTheatres, getTheatreById, createTheatre, updateTheatre, deleteTheatre, createScreen };