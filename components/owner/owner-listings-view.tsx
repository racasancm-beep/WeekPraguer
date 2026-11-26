"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MapPin, Users, Ruler, Pencil, Mail, Phone, User, ChevronDown, ChevronUp, KeyRound, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSession } from "next-auth/react";
import { formatOwnerBlockedPeriods } from "@/lib/utils";
import { BookingPriceBreakdown } from "@/components/booking/booking-price-breakdown";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface OwnerListingsViewProps {
    spaces: any[];
    isAdminAllView: boolean;
}

export function OwnerListingsView({ spaces, isAdminAllView }: OwnerListingsViewProps) {
    const { t } = useLanguage();
    const { data: session, status } = useSession();

    const [spaceList, setSpaceList] = useState<any[]>(spaces);
    const [spaceToDelete, setSpaceToDelete] = useState<any | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setSpaceList(spaces);
    }, [spaces]);

    const sessionUserId = (session?.user as any)?.id;
    const sessionEmail = session?.user?.email?.trim().toLowerCase();
    const sessionRole = (session?.user as any)?.role;
    const isAdmin = status === "authenticated" && sessionRole === "ADMIN";
    const isOwnerProfile = status === "authenticated" && sessionRole === "OWNER";

    const todayUtcStart = new Date();
    todayUtcStart.setUTCHours(0, 0, 0, 0);

    const handleDeleteSpace = async () => {
        if (!spaceToDelete) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/spaces/${spaceToDelete.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t("owner.listings.deletedSuccess") || "Spațiul a fost șters cu succes!");
                setSpaceList((prev) => prev.filter((s) => s.id !== spaceToDelete.id));
                setSpaceToDelete(null);
            } else {
                toast.error(data.message || "Eroare la ștergerea spațiului.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Eroare la conexiunea cu serverul.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isAdminAllView ? t("owner.listings.adminAllTitle") : t("owner.listings.title")}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {t("owner.listings.subtitle")} ({spaceList.length} {t("admin.spacesLower")}).
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

            {spaceList.length === 0 ? (
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
                    {spaceList.map((space) => {
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

                        // Strictly only the specific owner of this space (with role === "OWNER") can edit it
                        const canMakeChangesToThisSpace =
                            isOwnerProfile &&
                            Boolean(
                                (sessionUserId && space.ownerId === sessionUserId) ||
                                (sessionEmail && space.owner?.email?.trim().toLowerCase() === sessionEmail)
                            );

                        // Admin profile can delete ANY space on the platform; Owner can delete their own space
                        const canDeleteThisSpace = isAdmin || canMakeChangesToThisSpace;

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

                                    {/* Space Access Code (Visible and editable for Owner) */}
                                    <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-teal-50/80 border border-teal-200 flex items-center justify-between text-xs">
                                        <span className="flex items-center text-teal-800 font-bold">
                                            <KeyRound className="w-3.5 h-3.5 mr-1.5 text-teal-600 shrink-0" />
                                            {t("owner.listings.accessCodeLabel") || "Cod Acces:"}
                                        </span>
                                        <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${
                                            space.accessCode
                                                ? "bg-white text-teal-950 border-teal-300"
                                                : "bg-gray-100 text-gray-500 border-gray-200 font-sans"
                                        }`}>
                                            {space.accessCode || t("owner.listings.noAccessCode") || "Nespecificat"}
                                        </span>
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

                                    {/* Confirmed / Reserved Bookings for this Space: Period + Amount (Owner Price) + Customer Contact Details */}
                                    {confirmedRenterBookings.length > 0 && (
                                        <div className="mb-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2">
                                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                                                {t("owner.listings.confirmedReservationsTitle")} ({confirmedRenterBookings.length})
                                            </div>
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {confirmedRenterBookings.map((bk: any) => (
                                                    <OwnerConfirmedReservationItem key={bk.id} bk={bk} space={space} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t gap-2 mt-auto">
                                        <span className="font-bold text-lg">
                                            {space.hourlyRate} RON
                                            <span className="text-sm font-normal text-gray-500">/{t("explore.perHour")}</span>
                                        </span>
                                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                            {canMakeChangesToThisSpace && (
                                                <Link href={`/owner/dashboard/listings/${space.id}/edit`}>
                                                    <Button size="sm" className="bg-[#008080] hover:bg-[#006F6F] text-white font-bold h-8 text-xs">
                                                        <Pencil className="w-3.5 h-3.5 mr-1" />
                                                        {t("owner.listings.editSpace")}
                                                    </Button>
                                                </Link>
                                            )}
                                            <Link href={`/spaces/${space.id}`}>
                                                <Button variant="outline" size="sm" className="h-8 text-xs">{t("owner.listings.viewSpace")}</Button>
                                            </Link>
                                            {canDeleteThisSpace && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSpaceToDelete(space)}
                                                    className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold"
                                                    title={t("owner.listings.deleteSpace") || "Șterge Spațiul"}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                    <span>{t("owner.listings.deleteSpace") || "Șterge"}</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Confirmation Dialog for Space Deletion (Admin & Owner) */}
            <Dialog open={Boolean(spaceToDelete)} onOpenChange={(open) => !open && !deleting && setSpaceToDelete(null)}>
                <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
                    <DialogHeader className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-lg font-black text-center text-gray-900">
                            {t("owner.listings.deleteConfirmTitle") || "Confirmă Ștergerea Spațiului"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-center text-gray-500">
                            {t("owner.listings.deleteConfirmDesc") ||
                                "Ești sigur că vrei să ștergi acest spațiu de pe platformă? Această acțiune este ireversibilă."}
                        </DialogDescription>
                    </DialogHeader>

                    {spaceToDelete && (
                        <div className="my-3 p-3 bg-red-50/70 border border-red-200 rounded-xl text-center space-y-1">
                            <p className="text-sm font-bold text-red-950 truncate">{spaceToDelete.name}</p>
                            <p className="text-xs text-red-700">{spaceToDelete.city} • {spaceToDelete.address}</p>
                            {spaceToDelete.owner?.email && (
                                <p className="text-[11px] font-mono text-red-600">
                                    Proprietar: {spaceToDelete.owner.email}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex sm:justify-between gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setSpaceToDelete(null)}
                            disabled={deleting}
                            className="w-full sm:w-auto font-bold text-xs"
                        >
                            {t("common.cancel") || "Anulează"}
                        </Button>
                        <Button
                            onClick={handleDeleteSpace}
                            disabled={deleting}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    {t("owner.listings.deletingSpace") || "Se șterge..."}
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                    {t("owner.listings.deleteSpace") || "Șterge Spațiul"}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function OwnerConfirmedReservationItem({ bk, space }: { bk: any; space: any }) {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`p-2 rounded-md border text-[11px] transition-all ${
                isExpanded ? "bg-white border-emerald-300 shadow-sm" : "bg-white/90 border-emerald-200 hover:border-emerald-400 cursor-pointer"
            }`}
            onClick={() => {
                if (!isExpanded) setIsExpanded(true);
            }}
        >
            <div className="flex items-center justify-between gap-1">
                <div className="font-bold text-gray-800">
                    {new Date(bk.startTime).toLocaleDateString()} - {new Date(bk.endTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {t("renter.status.approved")}
                    </span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="p-0.5 rounded text-gray-500 hover:text-emerald-700"
                        title={isExpanded ? t("common.hideDetails") : t("common.showDetails")}
                    >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
                    <BookingPriceBreakdown booking={bk} space={space} highlightOwnerNet compact />
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-gray-700 pt-1 border-t border-gray-100">
                        <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                            <User className="w-3 h-3 text-violet-600" />
                            {bk.renter?.name || bk.renter?.email || "Customer"}
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
            )}
        </div>
    );
}
