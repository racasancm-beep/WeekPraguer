import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MapPin, Users, Ruler } from "lucide-react";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

async function getOwnerSpaces(ownerId?: string) {
    return await prisma.space.findMany({
        where: ownerId ? { ownerId } : {},
        include: { photos: true, owner: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
    });
}

export default async function MyListingsPage({
    searchParams,
}: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== "OWNER" && role !== "ADMIN")) {
        redirect("/login");
    }

    const params = searchParams ? await searchParams : {};
    const targetUserId = typeof params.userId === "string" ? params.userId : undefined;

    const spaces = (await getOwnerSpaces(
        role === "ADMIN" ? targetUserId : (session.user as any).id
    )) as any[];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {role === "ADMIN" && !targetUserId ? "All Platform Listings (Admin View)" : "My Listings"}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Manage office spaces and availability ({spaces.length} spaces).
                    </p>
                </div>
                <Link href="/owner/dashboard/listings/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Space
                    </Button>
                </Link>
            </div>

            {spaces.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed">
                    <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No spaces listed yet</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Get started by adding your first office space for rentals.
                    </p>
                    <div className="mt-6">
                        <Link href="/owner/dashboard/listings/create">
                            <Button>Add Listing</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {spaces.map((space) => (
                        <div key={space.id} className="group relative bg-white dark:bg-gray-800 border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video w-full bg-gray-200 relative">
                                {space.photos[0] ? (
                                    <img
                                        src={space.photos[0].url}
                                        alt={space.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${space.isClean
                                    ? "bg-green-100/90 text-green-700 dark:bg-green-900/90 dark:text-green-300"
                                    : "bg-red-100/90 text-red-700 dark:bg-red-900/90 dark:text-red-300"
                                    }`}>
                                    {space.active ? (space.isClean ? "Active" : "Cleaning Needed") : "Inactive"}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-lg truncate mb-1">{space.name}</h3>
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                    <span className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {space.city}
                                    </span>
                                    {space.owner?.email && (
                                        <span className="text-[11px] font-mono text-violet-600 truncate max-w-[140px]">
                                            {space.owner.email}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                                        {space.capacity} ppl
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                                        {space.size} m²
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="font-bold text-lg">
                                        {space.hourlyRate} RON
                                        <span className="text-sm font-normal text-gray-500">/hr</span>
                                    </span>
                                    <Link href={`/spaces/${space.id}`}>
                                        <Button variant="outline" size="sm">View Space</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
