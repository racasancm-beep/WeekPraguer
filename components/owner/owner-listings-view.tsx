"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MapPin, Users, Ruler, Pencil, Mail, Phone, User, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSession } from "next-auth/react";
import { formatOwnerBlockedPeriods } from "@/lib/utils";

interface OwnerListingsViewProps {
    spaces: any[];
    isAdminAllView: boolean;
}

function getCleanBookingAmount(bk: any, space: any): number {
    if (bk?.accessCode === "OWNER_BLOCK") return 0;
    if (typeof bk?.basePrice === "number" && bk.basePrice > 0) {
        return Math.round(bk.basePrice * 100) / 100;
    }
    if (typeof bk?.totalPrice === "number" && bk.totalPrice > 0) {
        const ins = typeof bk?.insurance === "number" && bk.insurance > 0 ? bk.insurance : 0;
        const net = bk.totalPrice - ins;
        return Math.round((net > 0 ? net : bk.totalPrice) * 100) / 100;
    }
    if (bk?.startTime && bk?.endTime && space) {
        const hours = Math.max(
            1,
            Math.round(
                (new Date(bk.endTime).getTime() - new Date(bk.startTime).getTime()) / (1000 * 60 * 60)
            )
        );
        return bk.isHourly === false && space.dailyRate
            ? space.dailyRate
            : hours * (space.hourlyRate || 0);
    }
    return 0;
}

export function OwnerListingsView({ spaces, isAdminAllView }: OwnerListingsViewProps) {
    const { t } = useLanguage();
    const { data: session, status } = useSession();

    const sessionUserId = (session?.user as any)?.id;
    const sessionEmail = session?.user?.email?.trim().toLowerCase();
    const sessionRole = (session?.user as any)?.role;
    const isOwnerProfile = status === "authenticated" && sessionRole === "OWNER";

    const todayUtcStart = new Date();
    todayUtcStart.setUTCHours(0, 0, 0, 0);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isAdminAllView ? t("owner.listings.adminAllTitle") : t("owner.listings.title")}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {t("owner.listings.subtitle")} ({spaces.length} {t("admin.spacesLower")}).
                    </p>
                </div>
                {isOwnerProfile && (
                    <Link href="/owner/dashboard/listings/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t("owner.listings.addNewSpace")}
                        </Button>
                    </Link>
                )}
            </div>

            {spaces.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed">
                    <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("owner.listings.noSpacesTitle")}</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        {t("owner.listings.noSpacesDesc")}
                    </p>
                    {isOwnerProfile && (
                        <div className="mt-6">
                            <Link href="/owner/dashboard/listings/create">
                                <Button>{t("owner.listings.addListing")}</Button>
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {spaces.map((space) => {
                        const activeOwnerBlocks = (space.bookings || []).filter(
                            (bk: any) => bk.accessCode === "OWNER_BLOCK" && new Date(bk.endTime) >= todayUtcStart
                        );
                        const hasOwnerBlock = activeOwnerBlocks.length > 0;
                        const blockedPeriods = formatOwnerBlockedPeriods(activeOwnerBlocks);

                        const confirmedRenterBookings = (space.bookings || []).filter(
                            (bk: any) =>
                                bk.accessCode !== "OWNER_BLOCK" &&
                                (bk.status === "CONFIRMED" || bk.status === "COMPLETED")
                        );

                        // Strictly only the specific owner of this space (with role === "OWNER", never ADMIN) can make changes
                        const canMakeChangesToThisSpace =
                            isOwnerProfile &&
                            Boolean(
                                (sessionUserId && space.ownerId === sessionUserId) ||
                                (sessionEmail && space.owner?.email?.trim().toLowerCase() === sessionEmail)
                            );

                        return (
                            <div key={space.id} className="group relative bg-white dark:bg-gray-800 border rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                                <div className="aspect-video w-full bg-gray-200 relative">
                                    {space.photos[0] ? (
                                        <img
                                            src={space.photos[0].url}
                                            alt={space.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            {t("owner.listings.noImage")}
                                        </div>
                                    )}
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${space.isClean
                                        ? "bg-green-100/90 text-green-700 dark:bg-green-900/90 dark:text-green-300"
                                        : "bg-red-100/90 text-red-700 dark:bg-red-900/90 dark:text-red-300"
                                        }`}>
                                        {space.active ? (space.isClean ? t("owner.listings.active") : t("owner.listings.cleaningNeeded")) : t("owner.listings.inactive")}
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
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

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                                            {space.capacity} {t("explore.ppl")}
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                                            <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                                            {space.size} m²
                                        </div>
                                    </div>

                                    {hasOwnerBlock && (
                                        <div className="mb-3 px-2.5 py-2 rounded-lg bg-red-50 border border-red-200 space-y-1">
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className="font-extrabold text-red-700 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                                    {t("card.occupied100")}
                                                </span>
                                                <span className="font-extrabold text-red-700 uppercase">
                                                    {t("card.otherSources")}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-bold text-red-700 leading-snug break-words">
                                                {t("card.blockedDatesLabel")} {blockedPeriods.join(", ")}
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirmed / Reserved Bookings for this Space: Period + Amount (No Platform Fee) + Renter Contact Details */}
                                    {confirmedRenterBookings.length > 0 && (
                                        <div className="mb-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2">
                                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                                                {t("owner.listings.confirmedReservationsTitle")} ({confirmedRenterBookings.length})
                                            </div>
                                            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                                {confirmedRenterBookings.map((bk: any) => {
                                                    const amount = getCleanBookingAmount(bk, space);
                                                    return (
                                                        <div
                                                            key={bk.id}
                                                            className="p-2 rounded-md bg-white border border-emerald-200 text-[11px] space-y-1"
                                                        >
                                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                                <span className="font-bold text-gray-800">
                                                                    {new Date(bk.startTime).toLocaleDateString()} -{" "}
                                                                    {new Date(bk.endTime).toLocaleDateString()}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                                                                    <Wallet className="w-3 h-3 text-emerald-700" />
                                                                    {amount} RON ({t("owner.bookings.noPlatformFee")})
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-gray-700 pt-1 border-t border-gray-100">
                                                                <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                                                                    <User className="w-3 h-3 text-violet-600" />
                                                                    {bk.renter?.name || bk.renter?.email || "Client"}
                                                                </span>
                                                                {bk.renter?.email && (
                                                                    <a
                                                                        href={`mailto:${bk.renter.email}`}
                                                                        className="inline-flex items-center gap-1 font-mono text-blue-700 hover:underline"
                                                                    >
                                                                        <Mail className="w-3 h-3 text-blue-600" />
                                                                        {bk.renter.email}
                                                                    </a>
                                                                )}
                                                                <span className="inline-flex items-center gap-1 font-semibold">
                                                                    <Phone className="w-3 h-3 text-emerald-600" />
                                                                    {bk.renter?.phone || t("owner.bookings.noPhoneProvided")}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t gap-2 mt-auto">
                                        <span className="font-bold text-lg">
                                            {space.hourlyRate} RON
                                            <span className="text-sm font-normal text-gray-500">/{t("explore.perHour")}</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {canMakeChangesToThisSpace && (
                                                <Link href={`/owner/dashboard/listings/${space.id}/edit`}>
                                                    <Button size="sm" className="bg-[#008080] hover:bg-[#006F6F] text-white font-bold">
                                                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                                        {t("owner.listings.editSpace")}
                                                    </Button>
                                                </Link>
                                            )}
                                            <Link href={`/spaces/${space.id}`}>
                                                <Button variant="outline" size="sm">{t("owner.listings.viewSpace")}</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
