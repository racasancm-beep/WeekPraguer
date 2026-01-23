
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Find the user to keep
        const userToKeep = await prisma.user.findFirst({
            where: {
                OR: [
                    { name: { contains: 'Consta1', mode: 'insensitive' } },
                    { email: { contains: 'Consta1', mode: 'insensitive' } }
                ]
            }
        });

        if (!userToKeep) {
            console.log('User "Consta1" not found. No users deleted.');
            return;
        }

        console.log(`Found user to keep: ${userToKeep.name} (${userToKeep.email})`);

        // Delete other users
        const deleteResult = await prisma.user.deleteMany({
            where: {
                id: { not: userToKeep.id }
            }
        });

        console.log(`Successfully deleted ${deleteResult.count} other users.`);
    } catch (e: any) {
        console.error('Error clearing users:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
