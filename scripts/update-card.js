const fs = require('fs');

let content = fs.readFileSync('components/explore/space-card.tsx', 'utf8');

// Update Interface
content = content.replace(
    'space: Space & { photos: SpacePhoto[] };',
    'space: Space & { photos: SpacePhoto[], bookings?: any[] };'
);

// Add Occupancy logic
const occupancyLogic = `
export function SpaceCard({ space }: SpaceCardProps) {
    // Occupancy logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let bookedHoursToday = 0;
    if (space.bookings) {
        space.bookings.forEach((bk: any) => {
            const start = new Date(bk.startTime);
            const end = new Date(bk.endTime);
            
            // Check if booking overlaps with today
            if (start < tomorrow && end > today) {
                // Calculate hours just for today
                const overlapStart = start > today ? start : today;
                const overlapEnd = end < tomorrow ? end : tomorrow;
                bookedHoursToday += (overlapEnd.getTime() - overlapStart.getTime()) / 3600000;
            }
        });
    }
    
    // Assume 12 bookable hours standard (e.g. 08:00 to 20:00) for percentage
    const occupancyPercent = Math.min(Math.round((bookedHoursToday / 12) * 100), 100);
`;

content = content.replace(/export function SpaceCard\(\{ space \}: SpaceCardProps\) \{/, occupancyLogic);

// Wrap image in Link
content = content.replace(
    '<div className="aspect-video w-full bg-gray-100 relative group overflow-hidden">',
    `<Link href={\`/spaces/\${space.id}\`} className="aspect-video w-full bg-gray-100 relative group overflow-hidden block">`
);
content = content.replace(
    /<\/div>\s*<CardContent/,
    `</Link>\n\n            <CardContent`
);

// Insert Occupancy UI
const occupancyUI = `
                <div className="mt-3 flex items-center justify-between text-[10px] bg-[#E2ECEC]/50 px-2 py-1.5 rounded-lg border border-[#008080]/10">
                    <div className="flex items-center gap-1.5 font-semibold text-[#008080]">
                        <span className="w-2 h-2 rounded-full bg-[#008080] animate-pulse"></span>
                        {occupancyPercent}% OCUPAT ASTĂZI
                    </div>
                    <span className="text-gray-400 font-bold tracking-wider">PRIN ACEST SITE</span>
                </div>
`;
content = content.replace(
    '</p>\n            </CardContent>',
    `</p>\n${occupancyUI}\n            </CardContent>`
);

fs.writeFileSync('components/explore/space-card.tsx', content);
