"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Banknote, MapPin, Clock } from "lucide-react";

export default function CleanerDashboard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch("/api/cleaner/jobs");
            if (res.ok) {
                const data = await res.json();
                // Show only PENDING jobs in Overview
                setJobs(data.jobs?.filter((j: any) => j.status === "PENDING") || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (jobId: string) => {
        try {
            const res = await fetch("/api/cleaner/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId }),
            });
            if (res.ok) {
                toast.success("Job accepted! Moved to My Jobs.");
                fetchJobs();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to check in.");
            }
        } catch (e) {
            toast.error("Network error.");
        }
    };

    if (loading) return <div className="p-8">Loading available cleaning jobs...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Cleaning Jobs</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Available opportunities in your area.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {jobs.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-3xl bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="text-xl font-bold mb-2">All caught up!</h3>
                        <p className="text-muted-foreground">No new cleaning requests at the moment.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <Card key={job.id} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all group">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-6 flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-black group-hover:text-green-600 transition-colors">
                                                    {job.booking.space.owner.name || "Owner"}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <MapPin className="w-4 h-4 mr-1 text-green-500" />
                                                    {job.booking.space.city}, {job.booking.space.address}
                                                </div>
                                            </div>
                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 font-bold">
                                                Pending
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Service Required After</p>
                                                <p className="text-sm font-bold flex items-center">
                                                    <Clock className="w-3 h-3 mr-1 text-green-500" />
                                                    {new Date(job.booking.endTime).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/50">
                                                <p className="text-[10px] uppercase font-bold text-green-600 mb-1">Potential Earnings</p>
                                                <p className="text-lg font-black text-green-700 dark:text-green-400">
                                                    {job.booking.cleaningFee.toLocaleString()} CZK
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700">
                                        <Button
                                            onClick={() => handleCheckIn(job.id)}
                                            className="w-full md:w-32 h-12 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-none text-white font-bold rounded-2xl transition-transform active:scale-95"
                                        >
                                            Check In
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
