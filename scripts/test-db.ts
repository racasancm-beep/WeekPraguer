
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('Successfully connected and queried users table. Count:', users.length);
    } catch (e: any) {
        console.error('Error querying users table:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
