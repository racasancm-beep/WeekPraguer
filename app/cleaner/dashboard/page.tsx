"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
                setJobs(data.jobs || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (jobId: string, status: string) => {
        // Mock status update or implement if needed
        alert(`Marking job ${jobId} as ${status}`);
    };

    if (loading) return <div>Loading jobs...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Cleaning Jobs</h1>

            <div className="space-y-6">
                {jobs.length === 0 ? (
                    <p>No active cleaning jobs.</p>
                ) : (
                    jobs.map((job) => (
                        <Card key={job.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>{job.booking.space.name}</CardTitle>
                                <Badge variant={job.checkInTime ? "default" : "secondary"}>
                                    {job.checkInTime ? "In Progress" : "Pending"}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p>{job.booking.space.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Service Required After</p>
                                        <p>{new Date(job.booking.endTime).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        {!job.checkInTime && (
                                            <Button onClick={() => handleStatusUpdate(job.id, "CHECK_IN")}>Check In</Button>
                                        )}
                                        {job.checkInTime && !job.checkOutTime && (
                                            <Button onClick={() => handleStatusUpdate(job.id, "CHECK_OUT")}>Complete Job</Button>
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
