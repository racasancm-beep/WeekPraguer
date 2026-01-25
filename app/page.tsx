import Link from "next/link";
import { Building2, Calendar, Shield, Sparkles, ArrowRight, CheckCircle2, Users, MapPin, Clock, Search, Heart, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#FAFAFB] text-[#1A1A1E] selection:bg-violet-100 italic-none">
            {/* Minimalist Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-300">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-violet-600 transition-colors">
                            WeekPragueR
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-10">
                        <Link href="/explore" className="text-sm font-bold text-gray-500 hover:text-violet-600 transition-colors uppercase tracking-widest">Explore</Link>
                        <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-violet-600 transition-colors uppercase tracking-widest">Sign In</Link>
                        <Link href="/register">
                            <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    <button className="lg:hidden p-2 text-gray-900">
                        <ArrowRight className="w-6 h-6 rotate-90" />
                    </button>
                </div>
            </nav>

            {/* Airy Hero Section */}
            <main className="pt-20">
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10 relative z-10 animate-in fade-in slide-in-from-left duration-1000">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-600 text-xs font-black uppercase tracking-widest">
                                <Sparkles className="w-4 h-4" />
                                Weekending Redefined
                            </div>

                            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-gray-900">
                                Your Perfect <br />
                                <span className="text-violet-600 italic">Weekend</span> <br />
                                Workspace.
                            </h1>

                            <p className="text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
                                Curated weekend rentals in the heart of Prague. For therapists, creators, and workshops who need space when the city rests.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/explore">
                                    <Button size="lg" className="h-16 px-10 rounded-[2rem] bg-gray-900 hover:bg-violet-600 text-white text-lg font-bold shadow-2xl transition-all hover:scale-105">
                                        Browse Spaces
                                        <Search className="ml-3 w-5 h-5" />
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-4 px-6 h-16 rounded-[2rem] bg-white border border-gray-100 shadow-sm text-sm font-bold text-gray-400">
                                    <MapPin className="w-4 h-4 text-violet-500" />
                                    Prague, Czech Republic
                                </div>
                            </div>

                            <div className="flex items-center gap-8 pt-6 border-t border-gray-100">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100" />
                                    ))}
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <span className="text-gray-900">1.2k+</span> professionals booked last month
                                </p>
                            </div>
                        </div>

                        <div className="relative animate-in fade-in slide-in-from-right duration-1000">
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-violet-200 border-[12px] border-white">
                                <img
                                    src="/hero.png"
                                    alt="Minimalist Prague Space"
                                    className="w-full aspect-[4/5] object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            {/* Floating Stats Card */}
                            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-50 max-w-[240px] hidden md:block animate-bounce-slow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Safe Pay</span>
                                </div>
                                <p className="text-2xl font-black tracking-tight text-gray-900">60/25/15</p>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter leading-tight">Automated Revenue Split Guarantee</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The "Three Pillars" Section */}
                <section className="py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-3 gap-12">
                            {/* For Owners */}
                            <div className="group space-y-6">
                                <div className="w-16 h-16 bg-violet-50 rounded-3xl flex items-center justify-center group-hover:bg-violet-600 transition-colors duration-500">
                                    <Building2 className="w-8 h-8 text-violet-600 group-hover:text-white transition-colors duration-500" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tighter text-gray-900">Building Owners</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    Turn your empty weekend offices into a revenue stream. We handle the bookings, insurance, and professional cleaning.
                                </p>
                                <ul className="space-y-3">
                                    {["60% Direct Revenue Share", "Automated SES Integration", "Professional Cleaning Teams"].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register?role=OWNER" className="inline-flex items-center gap-2 text-violet-600 font-black uppercase tracking-widest text-xs pt-4 group-hover:gap-4 transition-all">
                                    Start Earning <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* For Renters */}
                            <div className="group space-y-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                                    <Users className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-500" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tighter text-gray-900">Professional Renters</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    Access Prague's finest offices for your weekend sessions. Book by the hour or day with instant confirmation.
                                </p>
                                <ul className="space-y-3">
                                    {["Premium Prague Locations", "Verified Professional Spaces", "No Long-term Commitments"].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register?role=RENTER" className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs pt-4 group-hover:gap-4 transition-all">
                                    Find Your Space <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* For Cleaners */}
                            <div className="group space-y-6">
                                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-500">
                                    <Sparkles className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-500" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tighter text-gray-900">Certified Cleaners</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    Join our network of precision cleaning professionals. Guaranteed 15% share of every weekend transaction.
                                </p>
                                <ul className="space-y-3">
                                    {["15% Guaranteed Share", "App-Based Job Management", "Transparent Payout Tracking"].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register?role=CLEANER" className="inline-flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-xs pt-4 group-hover:gap-4 transition-all">
                                    Apply Now <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-32 bg-[#FAFAFB]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-24 space-y-4">
                            <h2 className="text-5xl font-black tracking-tighter text-gray-900">Why WeekPragueR?</h2>
                            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Innovation for the local market</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: "Weekend Exclusivity", desc: "Fri 18:00 - Sun 20:00. Zero disruption to daily office life.", icon: Clock },
                                { title: "Secure Payouts", desc: "Digital verification with SEPA-fast automatic payouts.", icon: Briefcase },
                                { title: "Prague Expertise", desc: "Founded and optimized for the unique Prague real estate market.", icon: Heart },
                                { title: "ID Verification", desc: "Multi-factor authentication for every single platform user.", icon: Shield },
                            ].map((feature, idx) => (
                                <Card key={idx} className="bg-white border-none shadow-xl shadow-gray-200/50 rounded-[2rem] p-8 hover:-translate-y-2 transition-transform duration-500">
                                    <feature.icon className="w-10 h-10 text-violet-600 mb-6" />
                                    <h3 className="text-lg font-black tracking-tight text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 py-24 text-white rounded-t-[4rem]">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-20">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">WeekPragueR</span>
                        </Link>
                        <p className="text-gray-400 font-medium leading-relaxed">
                            The definitive weekend office rental marketplace for Prague's modern professionals.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-10 md:col-span-2">
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-violet-400">Platform</h4>
                            <ul className="space-y-4 text-sm font-bold text-gray-300">
                                <li><Link href="/explore" className="hover:text-white transition-colors">Find a Space</Link></li>
                                <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Owner Login</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-violet-400">Trust</h4>
                            <ul className="space-y-4 text-sm font-bold text-gray-300">
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="/gdpr" className="hover:text-white transition-colors">GDPR</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">&copy; 2026 WeekPragueR. Precision in Every Booking.</p>
                    <div className="flex gap-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Built with ❤️ for Prague</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
