
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'owner@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'OWNER',
            password: hashedPassword,
        },
        create: {
            email,
            name: 'Test Owner',
            password: hashedPassword,
            role: 'OWNER',
        },
    });

    console.log('Owner user created/updated:', owner.email);
    console.log('Password: password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
