import { SpaceFilters } from "@/components/explore/space-filters";
import { SpaceGrid } from "@/components/explore/space-grid";

export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";

async function getSpaces(searchParams: { [key: string]: string | string[] | undefined }) {
    const city = searchParams.city as string | undefined;
    const minPrice = searchParams.minPrice as string | undefined;
    const maxPrice = searchParams.maxPrice as string | undefined;
    const capacity = searchParams.capacity as string | undefined;
    const amenities = searchParams.amenities as string | undefined;

    const where: any = {};

    if (city) {
        where.city = { contains: city, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
        where.weekendRate = {};
        if (minPrice) where.weekendRate.gte = parseFloat(minPrice);
        if (maxPrice) where.weekendRate.lte = parseFloat(maxPrice);
    }

    if (capacity) {
        where.capacity = { gte: parseInt(capacity) };
    }

    if (amenities) {
        const amenityList = amenities.split(",");
        where.AND = amenityList.map((amenity) => ({
            amenitiesList: { contains: amenity }
        }));
    }

    return await prisma.space.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            photos: true,
        }
    });
}

export default async function ExploreSpacesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const spaces = await getSpaces(params);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Explore Weekend Spaces</h1>
                        <p className="text-gray-500 mt-1">Find the perfect office for your weekend project or event.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border sticky top-8">
                            <SpaceFilters />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <SpaceGrid spaces={spaces} />
                    </div>
                </div>
            </div>
        </div>
    );
}
