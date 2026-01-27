
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const bookings = await prisma.booking.findMany({
        select: {
            id: true,
            totalPrice: true,
            cleaningFee: true,
            cleanerEarnings: true,
            space: {
                select: { name: true, size: true }
            }
        }
    });
    console.log("Bookings Summary:");
    bookings.forEach(b => {
        console.log(`- Space: ${b.space.name} (${b.space.size}m2), Total: ${b.totalPrice}, CleaningFee: ${b.cleaningFee}, CleanerEarnings: ${b.cleanerEarnings}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
