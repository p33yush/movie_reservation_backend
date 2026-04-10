const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding the database...');

    await prisma.seatLock.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.reservedSeat.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.showtime.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.screen.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.theatre.deleteMany();
    await prisma.user.deleteMany();

    console.log('cleaning done');

    //users
    const regUser = await prisma.user.create({
        data: {
            email: 'user@example.com',
            passwordHash: '$2b$10$placeholder',
            name: 'Peeyush',
            role: 'USER'
        },
    });
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            passwordHash: '$2b$10$placeholder',
            name: 'PeeyushDaddy',
            role: 'ADMIN'
        },
    });

    console.log('Users created:');

//theatres
    const theatre1 = await prisma.theatre.create({
        data: {
          name: 'Sapna Sangeeta',
          address: 'Tower Square',
          city: 'Indore',
          phone: '7985-0100-74',
        },
      });
      const theatre2 = await prisma.theatre.create({
        data: {
          name: 'PVR Treasure Island',
          address: 'Treasure Island Mall, Palasia',
          city: 'Indore',
          phone: '7985-1100-74',
        },
      });
      console.log('Created theatres');

//screens
const screen1 = await prisma.screen.create({
    data: {
      theatreId: theatre1.id,
      name: 'Screen 1 - PVR',
      totalSeats:100,
    },
  });
  const screen2 = await prisma.screen.create({
    data: {
      theatreId: theatre2.id,
      name: 'Screen 2 - INSIGNIA',
      totalSeats:100,
    },
  });
  const screen3 = await prisma.screen.create({
    data: {
      theatreId: theatre1.id,
      name: 'Screen 3 - IMAX',
      totalSeats:100,
    },
  });
  console.log('Created screens');

//seats

//seats for each screen
async function generateSeats(screenId, rows, seatsPerRow, vipRows = []) {
    const seats = [];
    for(let r=0;r<rows;r++) {
        const rowLetter = String.fromCharCode(65 + r);
        for(let s=1;s<=seatsPerRow;s++) {
            seats.push({
                screenId,
                row: rowLetter,
                number: s,
                seatType: vipRows.includes(rowLetter) ? 'VIP' : (r < 2 ? 'PREMIUM' : 'REGULAR'),
            });
        }
    }

    await prisma.seat.createMany({data: seats});
    return seats.length;
}

const seat1 = await generateSeats(screen1.id, 10, 10, ['A', 'B']);  // Screen 1: 100 seats
const seat2 = await generateSeats(screen2.id, 10, 10, ['A']);       // Screen 2: 100 seats
const seat3 = await generateSeats(screen3.id, 10, 10, ['A', 'B', 'C']); // Screen 3: 100 seats

console.log('Created seats');

//movies

const movie1 = await prisma.movie.create({
    data: {
        title: 'Dhurandhar 2',
        description: 'Revenge of Hamza and story after death of Rehman Dakait',
        duration: 235,
        rating: 8.2,
        posterUrl: 'https://example.com/posters/dhurandhar2.jpg',
        releaseDate: new Date('2026-03-19'),
        genre: 'Action, Drama, Thriller',
        status: 'NOW_SHOWING',
    },
});
const movie2 = await prisma.movie.create({
    data: {
        title: 'Inception',
    description: 'A skilled thief enters dreams to steal secrets but is given a chance at redemption by planting an idea.',
    duration: 148,
    rating: 8.8,
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg',
    releaseDate: new Date('2010-07-16'),
    genre: 'Sci-Fi, Action, Thriller',
    status: 'NOW_SHOWING',
    },
});
const movie3 = await prisma.movie.create({
    data: {
        title: 'The Dark Knight',
    description: 'Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos.',
    duration: 152,
    rating: 9.0,
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8a/Dark_Knight.jpg',
    releaseDate: new Date('2008-07-18'),
    genre: 'Action, Crime, Drama',
    status: 'NOW_SHOWING',
    },
});
const movie4 = await prisma.movie.create({
    data: {
        title: 'Avengers: Endgame',
        description: 'The Avengers assemble once more to reverse the damage caused by Thanos and restore balance to the universe.',
        duration: 181,
        rating: 8.4,
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
        releaseDate: new Date('2019-04-26'),
        genre: 'Action, Adventure, Sci-Fi',
        status: 'NOW_SHOWING',
    },
});

console.log('Created movies');

//showtimes

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

function createShowtime(baseDate, hour, min) {
    const date = new Date(baseDate);
    date.setHours(hour, min, 0, 0);
    return date;
}

function createEndTime(startTime,durationMin) {
    return new Date(startTime.getTime() + durationMin * 60000);
}

const showtime1 = await prisma.showtime.create({
    data:{
        movieId: movie1.id,
        screenId: screen1.id,
        startTime: createShowtime(today, 10, 0),
        endTime: createEndTime(createShowtime(today, 10, 0), movie1.duration),
        price:200,
    },
});
const showtime2 = await prisma.showtime.create({
    data:{
        movieId: movie2.id,
        screenId: screen2.id,
        startTime: createShowtime(today, 14, 30),
        endTime: createEndTime(createShowtime(today, 10, 0), movie2.duration),
        price:200,
    },
});
const showtime3 = await prisma.showtime.create({
    data:{
        movieId: movie3.id,
        screenId: screen1.id,
        startTime: createShowtime(today, 18, 45),
        endTime: createEndTime(createShowtime(today, 18, 0), movie3.duration),
        price:200,
    },
});
const showtime4 = await prisma.showtime.create({
    data:{
        movieId: movie4.id,
        screenId: screen3.id,
        startTime: createShowtime(today, 20, 15),
        endTime: createEndTime(createShowtime(today, 20, 15), movie4.duration),
        price:200,
    },
});


console.log('Created showtimes');

console.log('\n✅ Seed completed!');
}

main()
    .catch((e) => {
        console.error('seed failed',e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
