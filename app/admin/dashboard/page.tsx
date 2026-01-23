import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, CalendarCheck, DollarSign } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                <p className="text-muted-foreground">Platform-wide statistics and management.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Spaces</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">+4 new this week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">573</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">428,000 CZK</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">New booking from Martin</p>
                                    <p className="text-sm text-muted-foreground">Modern Loft in Vinohrady</p>
                                </div>
                                <div className="ml-auto font-medium">+1,200 CZK</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">New space listed</p>
                                    <p className="text-sm text-muted-foreground">Creative Studio in Holesovice</p>
                                </div>
                                <div className="ml-auto text-sm text-muted-foreground">Just now</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">New user registered</p>
                                    <p className="text-sm text-muted-foreground">jana@example.com</p>
                                </div>
                                <div className="ml-auto text-sm text-muted-foreground">2 hours ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Platform Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Server Load</span>
                                    <span className="font-bold text-green-600">Normal</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[20%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Database Connections</span>
                                    <span>4/100</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[4%]"></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
