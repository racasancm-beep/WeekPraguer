import { PrismaClient } from '@prisma/client';

async function promoteAdmin(email: string) {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log(`User ${email} not found. Please register this email on the site first!`);
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });

        console.log(`SUCCESS: User ${email} has been promoted to ADMIN.`);
        console.log(JSON.stringify(updatedUser, null, 2));
    } catch (error) {
        console.error('Error promoting user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const targetEmail = 'weekpraguer@gmail.com';
promoteAdmin(targetEmail);
