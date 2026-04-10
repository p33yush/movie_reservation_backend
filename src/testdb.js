const prisma = require('./config/database');

async function main() {
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in the database`);
}

main()
    .catch(console.error)
    .finally(() => {
        prisma.$disconnect();
    });