import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const spaces = await prisma.space.findMany({
        where: {
            name: { contains: "Yoga" }
        }
    });
    console.log(JSON.stringify(spaces, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
