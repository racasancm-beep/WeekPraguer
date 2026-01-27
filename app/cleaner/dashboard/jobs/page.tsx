"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Banknote, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CleanerMyJobs() {
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
                // Show ACCEPTED or COMPLETED jobs in My Jobs
                setJobs(data.jobs?.filter((j: any) => j.status === "ACCEPTED" || j.status === "COMPLETED") || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (jobId: string) => {
        try {
            const res = await fetch("/api/cleaner/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId }),
            });
            if (res.ok) {
                toast.success("Job completed! Space is now ready for the next guest.");
                fetchJobs();
            } else {
                toast.error("Failed to complete job.");
            }
        } catch (e) {
            toast.error("Network error.");
        }
    };

    if (loading) return <div className="p-8">Loading your jobs...</div>;

    const getEarnings = (job: any) => job.booking.cleanerEarnings > 0 ? job.booking.cleanerEarnings : (job.booking.cleaningFee > 0 ? job.booking.cleaningFee : job.booking.totalPrice * 0.15);

    const totalEarned = jobs.reduce((sum, job) => sum + (job.status === "COMPLETED" ? getEarnings(job) : 0), 0);
    const potentialEarnings = jobs.reduce((sum, job) => sum + (job.status === "ACCEPTED" ? getEarnings(job) : 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">My Jobs</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Manage your accepted and completed assignments.</p>
                </div>
                <div className="flex gap-4">
                    <Card className="border-none shadow-md bg-white dark:bg-gray-900 px-6 py-3 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Total Earned</p>
                        <p className="text-xl font-black text-green-600">{totalEarned.toLocaleString()} CZK</p>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-gray-900 px-6 py-3 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Potential</p>
                        <p className="text-xl font-black text-blue-600">{potentialEarnings.toLocaleString()} CZK</p>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6">
                {jobs.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-3xl bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="text-xl font-bold mb-2">No active jobs</h3>
                        <p className="text-muted-foreground">Go to Global Overview to accept new cleaning assignments.</p>
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
                                                    {job.booking.space.name}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <MapPin className="w-4 h-4 mr-1 text-green-500" />
                                                    {job.booking.space.city}, {job.booking.space.address}
                                                </div>
                                            </div>
                                            <Badge className={`${job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                } border-none px-3 py-1 font-bold`}>
                                                {job.status === 'ACCEPTED' ? 'Accepted' : 'Completed'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Check-in Time</p>
                                                <p className="text-sm font-bold flex items-center">
                                                    <Clock className="w-3 h-3 mr-1 text-green-500" />
                                                    {new Date(job.checkInTime).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/50">
                                                <p className="text-[10px] uppercase font-bold text-green-600 mb-1">Earnings</p>
                                                <p className="text-lg font-black text-green-700 dark:text-green-400">
                                                    {(job.booking.cleanerEarnings > 0 ? job.booking.cleanerEarnings : (job.booking.cleaningFee > 0 ? job.booking.cleaningFee : job.booking.totalPrice * 0.15)).toLocaleString()} CZK
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700">
                                        {job.status === 'ACCEPTED' ? (
                                            <Button
                                                onClick={() => handleComplete(job.id)}
                                                className="w-full md:w-32 h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none text-white font-bold rounded-2xl transition-transform active:scale-95"
                                            >
                                                Complete
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-green-600 font-bold">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Done
                                            </div>
                                        )}
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
