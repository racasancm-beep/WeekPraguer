import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedAdmin123 = await bcrypt.hash('admin123', 10);
    const hashedPass123 = await bcrypt.hash('password123', 10);

    const admin1 = await prisma.user.upsert({
        where: { email: 'admin@mygenie.com' },
        update: {
            name: 'MyGenie Super Admin',
            role: 'ADMIN',
            password: hashedAdmin123,
            verified: true,
        },
        create: {
            email: 'admin@mygenie.com',
            name: 'MyGenie Super Admin',
            password: hashedAdmin123,
            role: 'ADMIN',
            verified: true,
        },
    });

    const admin2 = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {
            role: 'ADMIN',
            password: hashedPass123,
            verified: true,
        },
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPass123,
            role: 'ADMIN',
            verified: true,
        },
    });

    console.log('Admin users ready:', admin1.email, '(password: admin123) and', admin2.email, '(password: password123)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
