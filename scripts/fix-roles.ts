
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration...');

    try {
        // 1. Update User Roles directly in SQLite to bypass Prisma Enum validation
        // using raw query because Prisma Client might throw if it reads 'OPERATOR'
        const result = await prisma.$executeRawUnsafe(`
      UPDATE users 
      SET role = 'RENTER' 
      WHERE role = 'OPERATOR';
    `);

        console.log(`Migrated users: ${result}`);

        // Verify
        const users = await prisma.user.findMany();
        console.log('Current users:', users);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
