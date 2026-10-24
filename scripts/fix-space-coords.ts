import { prisma } from "../lib/prisma";

async function main() {
    await prisma.space.updateMany({
        where: { name: "COCO3" },
        data: { latitude: 45.6427, longitude: 25.5887 }
    });
    await prisma.space.updateMany({
        where: { name: "COCO2" },
        data: { latitude: 44.1792, longitude: 28.6499 }
    });
    await prisma.space.updateMany({
        where: { name: "ABcoco2" },
        data: { latitude: 44.1733, longitude: 28.6383 }
    });
    const updated = await prisma.space.findMany({
        select: { id: true, name: true, city: true, latitude: true, longitude: true }
    });
    console.log("Updated spaces:", updated);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
