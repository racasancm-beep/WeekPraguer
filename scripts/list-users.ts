import { PrismaClient } from '@prisma/client';

async function listUsers() {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
                role: true,
            },
        });
        console.log('--- USER LIST ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('-----------------');
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
