import { SpaceFilters } from "@/components/explore/space-filters";
import { SpaceGrid } from "@/components/explore/space-grid";

// Helper to fetch spaces on the server
async function getSpaces(searchParams: { [key: string]: string | string[] | undefined }) {
    const params = new URLSearchParams();
    if (searchParams.city) params.append("city", searchParams.city as string);
    if (searchParams.minPrice) params.append("minPrice", searchParams.minPrice as string);
    if (searchParams.maxPrice) params.append("maxPrice", searchParams.maxPrice as string);
    if (searchParams.capacity) params.append("capacity", searchParams.capacity as string);
    if (searchParams.hasWifi) params.append("hasWifi", searchParams.hasWifi as string);

    // We need an absolute URL for server-side fetching, or we can use the Prisma client directly
    // Using Prisma directly is better for Server Components
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/spaces?${params.toString()}`, {
        cache: 'no-store'
    });

    if (!res.ok) {
        throw new Error('Failed to fetch spaces');
    }

    return res.json();
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
