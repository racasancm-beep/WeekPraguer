"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            const res = await fetch("/api/admin/verification-queue");
            const data = await res.json();
            setUsers(data.users);
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

            toast.success("User verified successfully");
            setUsers(users.filter((u) => u.id !== userId));
        } catch (error) {
            toast.error("Failed to verify user");
        }
    };

    if (loading) return <div>Loading queue...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Verification Queue</h1>
            {users.length === 0 ? (
                <p className="text-muted-foreground">No pending verifications.</p>
            ) : (
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="p-4 border rounded-lg bg-card flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold text-lg">{user.name || "No Name"}</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.email} • <span className="font-mono">{user.role}</span>
                                </p>
                                {user.companyName && <p className="text-sm">Company: {user.companyName}</p>}
                                {user.phone && <p className="text-sm">Phone: {user.phone}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">View Details</Button>
                                <Button onClick={() => verifyUser(user.id)}>Approve</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
