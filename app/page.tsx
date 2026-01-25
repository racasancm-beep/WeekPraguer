import Link from "next/link";
import { Building2, Calendar, Shield, Sparkles, ArrowRight, CheckCircle2, Users, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                            <Calendar className="w-8 h-8" />
                            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                Weekend Space Booker
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/explore">
                                <Button variant="ghost">Explore Spaces</Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline">Sign In</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-purple-600/10 to-pink-600/10 animate-gradient"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium animate-fade-in text-center mx-auto">
                            <Sparkles className="w-4 h-4" />
                            <span>Unlock Your Space's Weekend Potential</span>
                        </div>

                        <div className="flex justify-center -mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/hero-image.jpg"
                                alt="Prague Workspace"
                                className="w-full max-w-lg rounded-2xl shadow-2xl border-4 border-white dark:border-gray-800 transform -rotate-1 hover:rotate-0 transition-transform duration-500"
                            />
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight pt-4">
                            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Rent Office Spaces
                            </span>
                            <br />
                            <span className="text-gray-900 dark:text-white">
                                Only on Weekends
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            The premier marketplace connecting building owners with therapists, workshop organizers,
                            and event hosts in Prague. Transform empty weekend offices into thriving spaces.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/explore">
                                <Button size="lg" className="text-lg h-14 px-8 shadow-lg hover:shadow-xl">
                                    Find a Space
                                    <ArrowRight className="ml-2" />
                                </Button>
                            </Link>
                            <Link href="/register?role=owner">
                                <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                                    List Your Space
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span>Weekend-Only Bookings</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span>Secure Payments</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span>Verified Users</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Simple, secure, and designed for weekends
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* For Building Owners */}
                        <Card className="border-2 hover:border-violet-300 dark:hover:border-violet-700 transition-all hover:shadow-xl group">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <CardTitle className="text-2xl">For Building Owners</CardTitle>
                                <CardDescription className="text-base">
                                    Monetize Your Empty Weekends
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm font-bold">
                                        1
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">List your space for free with photos and details</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm font-bold">
                                        2
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">Receive weekend booking requests</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm font-bold">
                                        3
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">Get paid automatically Monday morning</p>
                                </div>
                                <div className="pt-4">
                                    <Link href="/register?role=OWNER">
                                        <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">List Your Space</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* For Renters */}
                        <Card className="border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-xl group">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Link href="/register?role=renter">
                                        <Users className="w-6 h-6 text-white" />
                                    </Link>
                                </div>
                                <CardTitle className="text-2xl">For Renters</CardTitle>
                                <CardDescription className="text-base">
                                    Find Your Perfect Weekend Space
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                                        1
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">Browse spaces in Prague with detailed filters</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                                        2
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">Book your slots and pay securely</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                                        3
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">Receive access codes and enjoy your weekend</p>
                                </div>
                                <div className="pt-4">
                                    <Link href="/register?role=RENTER">
                                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">Rent Spaces</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* For Cleaners */}
                        <Card className="border-2 hover:border-pink-300 dark:hover:border-pink-700 transition-all hover:shadow-xl group">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <CardTitle className="text-2xl">For Cleaners</CardTitle>
                                <CardDescription className="text-base">
                                    Streamlined Cleaning Operations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center text-sm font-bold">
                                        1
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">Get notified of upcoming cleaning jobs</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center text-sm font-bold">
                                        2
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">Check-in with photos before cleaning</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center text-sm font-bold">
                                        3
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">Track time automatically and get paid</p>
                                </div>
                                <div className="pt-4">
                                    <Link href="/register?role=CLEANER">
                                        <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">Cleaning</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-gradient-to-br from-gray-50 to-violet-50 dark:from-gray-800 dark:to-purple-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Why Choose Weekend Space Booker?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Built specifically for weekend office rentals in Prague
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all glass">
                            <Clock className="w-10 h-10 text-violet-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Weekend-Only</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Fri 18:00 - Sun 20:00. No tenant conflicts.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all glass">
                            <Shield className="w-10 h-10 text-violet-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                SEPA-compliant with automatic insurance.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all glass">
                            <MapPin className="w-10 h-10 text-violet-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Prague-Focused</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Optimized for local market and regulations.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all glass">
                            <Users className="w-10 h-10 text-violet-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Verified Users</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                ID verification and rating system.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Join WeekPraguer Today
                    </h2>
                    <p className="text-xl mb-8 text-violet-100">
                        Join the growing community of weekend space sharers in Prague
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" variant="secondary" className="text-lg h-14 px-8 shadow-xl hover:shadow-2xl">
                                Create Free Account
                                <ArrowRight className="ml-2" />
                            </Button>
                        </Link>
                        <Link href="/explore">
                            <Button size="lg" variant="outline" className="text-lg h-14 px-8 bg-white/10 hover:bg-white/20 text-white border-white/30">
                                Browse Spaces
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8 text-center md:text-left">
                        <div>
                            <h3 className="font-bold text-white mb-4">Weekend Space Booker</h3>
                            <p className="text-sm">
                                The premier weekend office rental marketplace in Prague.
                            </p>
                        </div>
                        <div className="md:text-right">
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                                <li><Link href="/gdpr" className="hover:text-white">GDPR Compliance</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                        <p>&copy; 2026 Weekend Space Booker. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
