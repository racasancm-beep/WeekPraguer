const fs = require('fs');
let content = fs.readFileSync('app/explore/page.tsx', 'utf8');

const regex = /return await prisma\.space\.findMany\(\{[\s\S]*?take: 200, \/\/ Rich grid\s*\}\);/;

const replacementStr = `    const sort = searchParams.sort as string | undefined;

    let spaces = await prisma.space.findMany({
        where,
        include: {
            photos: true,
            bookings: {
                where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }
            }
        },
        take: 200, // Rich grid
    });

    // Sort spaces
    spaces = spaces.sort((a, b) => {
        if (sort === 'price_asc') {
            return a.hourlyRate - b.hourlyRate;
        } else if (sort === 'price_desc') {
            return b.hourlyRate - a.hourlyRate;
        }
        
        // Default: Cele mai populare (Most Popular - by booked hours)
        const aHours = a.bookings.reduce((sum, bk) => sum + (new Date(bk.endTime).getTime() - new Date(bk.startTime).getTime()) / 3600000, 0);
        const bHours = b.bookings.reduce((sum, bk) => sum + (new Date(bk.endTime).getTime() - new Date(bk.startTime).getTime()) / 3600000, 0);
        return bHours - aHours;
    });

    return spaces;`;

content = content.replace(regex, replacementStr);
fs.writeFileSync('app/explore/page.tsx', content);
