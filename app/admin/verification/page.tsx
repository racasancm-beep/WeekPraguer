"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    companyName?: string;
    billingAddress?: string;
    createdAt: string;
}

export default function VerificationQueuePage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            const res = await fetch("/api/admin/verification-queue");
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const verifyUser = async (userId: string) => {
        try {
            const res = await fetch("/api/admin/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (!res.ok) throw new Error("Failed");

            toast.success(t("admin.verification.success"));
            setUsers(users.filter((u) => u.id !== userId));
        } catch (error) {
            toast.error(t("admin.verification.error"));
        }
    };

    if (loading) return <div>{t("admin.verification.loading")}</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{t("admin.verification.title")}</h1>
            {users.length === 0 ? (
                <p className="text-muted-foreground">{t("admin.verification.empty")}</p>
            ) : (
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="p-4 border rounded-lg bg-card flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold text-lg">{user.name || t("admin.verification.noName")}</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.email} • <span className="font-mono">{user.role}</span>
                                </p>
                                {user.companyName && <p className="text-sm">{t("admin.verification.company")}: {user.companyName}</p>}
                                {user.phone && <p className="text-sm">{t("admin.field.phone")}: {user.phone}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">{t("admin.verification.viewDetails")}</Button>
                                <Button onClick={() => verifyUser(user.id)}>{t("admin.verification.approve")}</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
