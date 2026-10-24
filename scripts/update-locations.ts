import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROMANIAN_CITIES: Record<string, { lat: number; lng: number }> = {
    "București": { lat: 44.4268, lng: 26.1025 },
    "Cluj-Napoca": { lat: 46.7712, lng: 23.5914 },
    "Timișoara": { lat: 45.7489, lng: 21.2087 },
    "Iași": { lat: 47.1585, lng: 27.5681 },
    "Constanța": { lat: 44.1733, lng: 28.6383 },
    "Craiova": { lat: 44.3302, lng: 23.7949 },
    "Brașov": { lat: 45.6427, lng: 25.5887 },
    "Galați": { lat: 45.4233, lng: 28.0425 },
    "Ploiești": { lat: 44.9367, lng: 26.0125 },
    "Oradea": { lat: 47.0465, lng: 21.9189 },
    "Sibiu": { lat: 45.7983, lng: 24.1256 }
};

const CITIES_ARRAY = Object.keys(ROMANIAN_CITIES);

// Add a little randomness so they aren't all exactly stacked
function getRandomOffset() {
    return (Math.random() - 0.5) * 0.05; // ~2.5km offset
}

async function main() {
    const spaces = await prisma.space.findMany();
    
    for (const space of spaces) {
        // Pick a random Romanian city to override the Spanish ones
        const randomCity = CITIES_ARRAY[Math.floor(Math.random() * CITIES_ARRAY.length)];
        const cityInfo = ROMANIAN_CITIES[randomCity];
        
        const newLat = cityInfo.lat + getRandomOffset();
        const newLng = cityInfo.lng + getRandomOffset();
        
        await prisma.space.update({
            where: { id: space.id },
            data: {
                city: randomCity,
                latitude: newLat,
                longitude: newLng,
                // Replace "Spain" with "Romania" in address/description if needed? Not strict, but good idea.
                // We'll just set address to something generic
                address: space.address.replace(/Madrid|Barcelona|Valencia|Sevilla|Málaga/g, randomCity)
            }
        });
        console.log(`Updated ${space.name} to ${randomCity} at [${newLat}, ${newLng}]`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
