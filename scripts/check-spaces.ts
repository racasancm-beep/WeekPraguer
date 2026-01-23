
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.space.count();
        const spaces = await prisma.space.findMany();
        console.log('Space count:', count);
        console.log('Spaces:', JSON.stringify(spaces, null, 2));
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
