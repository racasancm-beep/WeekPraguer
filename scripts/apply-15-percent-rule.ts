
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const bookings = await prisma.booking.findMany({
        include: { space: true }
    });

    console.log(`Updating ${bookings.length} bookings to the 15% cleaning rule...`);

    for (const b of bookings) {
        const total = b.totalPrice || 0;
        const isSelfClean = b.space.selfCleaning || false;

        const cleanerEarnings = isSelfClean ? 0 : total * 0.15;
        const adminEarnings = isSelfClean ? total * 0.30 : total * 0.25;
        const ownerEarnings = isSelfClean ? total * 0.70 : total * 0.60;

        await prisma.booking.update({
            where: { id: b.id },
            data: {
                cleaningFee: cleanerEarnings, // Ensure displays correctly in UI
                cleanerEarnings: cleanerEarnings,
                adminEarnings: adminEarnings,
                ownerEarnings: ownerEarnings
            }
        });
        console.log(`Updated booking ${b.id}: Cleaner gets ${cleanerEarnings} CZK (${isSelfClean ? 'Self-Cleaning' : '15% of ' + total})`);
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
