import { Space, SpacePhoto } from "@prisma/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Ruler } from "lucide-react";
import Link from "next/link";

interface SpaceCardProps {
    space: Space & { photos: SpacePhoto[] };
}

export function SpaceCard({ space }: SpaceCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video w-full bg-gray-200 relative">
                {space.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                {space.hasWifi && (
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-xs font-medium text-emerald-600">
                        Wi-Fi
                    </div>
                )}
            </div>

            <CardContent className="p-4">
                <h3 className="font-semibold text-lg truncate mb-1">{space.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 mr-1 text-primary" />
                    {space.city}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {space.capacity} ppl
                    </div>
                    <div className="flex items-center">
                        <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                        {space.size} m²
                    </div>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-2">
                    {space.description}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <div>
                    <span className="font-bold text-lg text-primary">
                        {space.dailyRate} CZK
                    </span>
                    <span className="text-xs text-gray-500 block">/day</span>
                </div>
                <Link href={`/spaces/${space.id}`}>
                    <Button size="sm">View Details</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
