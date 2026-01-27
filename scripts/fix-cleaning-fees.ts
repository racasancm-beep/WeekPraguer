
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function calculateCleaningFee(sizeM2: number): number {
    const base = 250;
    const perMeter = 5;
    return base + (sizeM2 * perMeter);
}

async function main() {
    const bookings = await prisma.booking.findMany({
        include: { space: true }
    });

    console.log(`Updating ${bookings.length} bookings...`);

    for (const b of bookings) {
        const size = b.space.size || 50;
        const newCleaningFee = calculateCleaningFee(size);

        // Let's also fix cleanerEarnings to match
        await prisma.booking.update({
            where: { id: b.id },
            data: {
                cleaningFee: newCleaningFee,
                cleanerEarnings: newCleaningFee
            }
        });
        console.log(`Updated booking ${b.id}: CleaningFee set to ${newCleaningFee}`);
    }

    console.log("Migration complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
