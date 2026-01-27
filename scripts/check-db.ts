
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const spaces = await prisma.space.findMany();
    console.log("Spaces:", JSON.stringify(spaces, null, 2));
    
    const bookings = await prisma.booking.findMany({
        include: { space: true }
    });
    console.log("Bookings:", JSON.stringify(bookings, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
