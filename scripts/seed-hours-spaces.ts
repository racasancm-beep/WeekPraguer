import { PrismaClient, UserRole } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// High quality fallback photos if a listing has none
const FALLBACK_PHOTOS = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80"
];

function extractDetails(l: any) {
    const text = ((l.title || "") + " " + (l.description || "")).toLowerCase();

    // Capacity extraction
    let cap: any = l.public_data?.max_occupants || l.public_data?.aforoMXimo || l.public_data?.aforoMaximo;
    if (!cap) {
        const capMatch = text.match(/(\d+)\s*(?:personas|personas|pers\b|pax\b|asistentes|plazas)/i);
        if (capMatch) cap = parseInt(capMatch[1], 10);
    }
    let parsedCap = parseInt(cap, 10);
    if (isNaN(parsedCap) || parsedCap <= 0 || parsedCap > 500) {
        parsedCap = 12;
    }

    // Size extraction
    let size: any = null;
    const sizeMatch = text.match(/(\d+)\s*(?:m2|m²|metros\s*cuadrados)/i);
    if (sizeMatch) size = parseInt(sizeMatch[1], 10);
    let parsedSize = parseInt(size, 10);
    if (isNaN(parsedSize) || parsedSize <= 0 || parsedSize > 5000) {
        parsedSize = 65;
    }

    return { cap: parsedCap, size: parsedSize };
}

async function main() {
    console.log("🌱 Starting Hours.es database seeding...");

    // 1. Ensure default Host / Owner exists
    const hostEmail = "host@hours.es";
    let owner = await prisma.user.findUnique({ where: { email: hostEmail } });

    if (!owner) {
        owner = await prisma.user.create({
            data: {
                email: hostEmail,
                name: "Hours Partner Host",
                role: UserRole.OWNER,
                verified: true,
                companyName: "Hours Community Spaces",
                phone: "+34 910 000 000"
            }
        });
        console.log(`Created default host: ${owner.name} (${owner.id})`);
    } else {
        console.log(`Using existing host: ${owner.name} (${owner.id})`);
    }

    // 2. Load scraped listings from hours.es
    const jsonPath = path.resolve("C:/Users/racas/.gemini/antigravity/brain/7f1b898b-dd8a-4095-8a49-fecc7d59a3ed/scratch/hours_listings.json");
    if (!fs.existsSync(jsonPath)) {
        throw new Error(`Data file not found at ${jsonPath}`);
    }

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const listings = JSON.parse(rawData);
    console.log(`Loaded ${listings.length} spaces from hours.es dataset.`);

    let createdCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < listings.length; i++) {
        const item = listings[i];
        const { cap, size } = extractDetails(item);

        const city = item.public_data?.ciudad || item.public_data?.city || "Madrid";
        const category = item.public_data?.category || "espacio";
        const address = item.public_data?.location?.address || item.address_norm || `${city}, España`;
        const district = item.neighborhood || "";
        let lat = typeof item.latitude === "number" && !isNaN(item.latitude) ? item.latitude : Number(item.public_data?.lat);
        if (isNaN(lat) || !lat) lat = 40.4168;

        let lng = typeof item.longitude === "number" && !isNaN(item.longitude) ? item.longitude : Number(item.public_data?.lng);
        if (isNaN(lng) || !lng) lng = -3.7038;

        // Price calculations: stored in cents in hours.es
        let hourlyEur = Math.round(Number(item.price_amount || 2500) / 100);
        if (isNaN(hourlyEur) || hourlyEur <= 0 || hourlyEur > 1500) hourlyEur = 30;
        const dailyEur = Math.round(hourlyEur * 8);
        const weekendEur = Math.round(hourlyEur * 16);

        // Amenities
        const amenities = Array.isArray(item.public_data?.amenities)
            ? item.public_data.amenities
            : ["WiFi", "Luz Natural", "Climatización"];

        const amenitiesLower = amenities.map((a: string) => a.toLowerCase()).join(" ");
        const hasWifi = amenitiesLower.includes("wifi") || amenitiesLower.includes("wi-fi") || true;
        const hasAC = amenitiesLower.includes("aire") || amenitiesLower.includes("ac") || amenitiesLower.includes("climatiz");
        const hasKitchen = amenitiesLower.includes("cocina") || category.toLowerCase() === "cocina";
        const hasParking = amenitiesLower.includes("parking") || amenitiesLower.includes("aparcamiento");
        const hasProjector = amenitiesLower.includes("proyector") || amenitiesLower.includes("tv") || amenitiesLower.includes("pantalla");

        // Images
        let photos = (item.listing_images || [])
            .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((img: any) => img.image_url)
            .filter((url: string) => typeof url === "string" && url.startsWith("http"));

        if (photos.length === 0) {
            photos = [FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length]];
        }

        const spaceData = {
            ownerId: owner.id,
            name: (item.title || "Espacio Hours").trim(),
            description: (item.description || `Espacio ideal para ${category} en ${city}. Disponible por horas para tus actividades y proyectos.`).trim(),
            address: address.trim(),
            city: city.trim(),
            district: district.trim(),
            latitude: lat,
            longitude: lng,
            size: size,
            capacity: cap,
            category: category.trim().toLowerCase(),
            hasWifi,
            hasProjector,
            hasKitchen,
            hasParking,
            hasAC,
            amenitiesList: JSON.stringify(amenities),
            hourlyRate: hourlyEur,
            dailyRate: dailyEur,
            weekendRate: weekendEur,
            active: true,
            isClean: true,
            selfCleaning: false,
        };

        const existing = await prisma.space.findUnique({ where: { id: item.id } });

        if (existing) {
            await prisma.space.update({
                where: { id: item.id },
                data: spaceData
            });
            // Update photos
            await prisma.spacePhoto.deleteMany({ where: { spaceId: item.id } });
            await prisma.spacePhoto.createMany({
                data: photos.map((url: string) => ({
                    spaceId: item.id,
                    url: url
                }))
            });
            updatedCount++;
        } else {
            await prisma.space.create({
                data: {
                    id: item.id,
                    ...spaceData,
                    photos: {
                        create: photos.map((url: string) => ({ url }))
                    }
                }
            });
            createdCount++;
        }

        if ((i + 1) % 50 === 0 || i + 1 === listings.length) {
            console.log(`Processed ${i + 1}/${listings.length} spaces...`);
        }
    }

    console.log(`✅ Finished seeding! Created: ${createdCount}, Updated: ${updatedCount}. Total in database: ${createdCount + updatedCount}`);
}

main()
    .catch((e) => {
        console.error("Error seeding spaces:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
