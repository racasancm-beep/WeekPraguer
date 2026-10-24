const fs = require('fs');

const pageContent = `"use client";

import Link from "next/link";
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    MapPin,
    Clock,
    Search,
    Utensils,
    Laptop,
    Camera,
    Music,
    Monitor,
    Wrench,
    ShieldCheck,
    Coffee,
    Flower2,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function HomePage() {
    const { t } = useLanguage();

    // 3 Space Categories (as requested: keep only 3 under "Categorii de spații")
    const POPULAR_CATEGORIES = [
        {
            id: "cocina",
            label: t("cat.kitchens"),
            desc: t("cat.kitchens.desc"),
            icon: Utensils,
            count: \`40+ \${t("spaces.count")}\`
        },
        {
            id: "coworking",
            label: t("cat.coworking"),
            desc: t("cat.coworking.desc"),
            icon: Laptop,
            count: \`80+ \${t("spaces.count")}\`
        },
        {
            id: "estudio",
            label: t("cat.studios"),
            desc: t("cat.studios.desc"),
            icon: Camera,
            count: \`120+ \${t("spaces.count")}\`
        },
    ];

    // 3 Services Options (same functions, features, and setup as space categories)
    const POPULAR_SERVICES = [
        {
            id: "curatenie",
            label: t("services.cleaning"),
            desc: t("services.cleaning.desc"),
            icon: Sparkles,
            count: \`90+ \${t("services.count")}\`,
            query: "Curatenie"
        },
        {
            id: "catering",
            label: t("services.catering"),
            desc: t("services.catering.desc"),
            icon: Utensils,
            count: \`60+ \${t("services.count")}\`,
            query: "Catering"
        },
        {
            id: "echipamente",
            label: t("services.tech"),
            desc: t("services.tech.desc"),
            icon: Laptop,
            count: \`45+ \${t("services.count")}\`,
            query: "Echipamente"
        },
    ];

    // Top 10 Most Popular Services List
    const TOP_SERVICES = [
        {
            rank: 1,
            name: "Curățenie & Igienizare",
            desc: "Igienizare completă înainte și după eveniment",
            count: \`95+ \${t("services.count")}\`,
            icon: Sparkles,
            query: "Curatenie"
        },
        {
            rank: 2,
            name: "Catering & Coffee Break",
            desc: "Meniuri calde, gustări reci și cafea de specialitate",
            count: \`84+ \${t("services.count")}\`,
            icon: Coffee,
            query: "Catering"
        },
        {
            rank: 3,
            name: "Fotografie & Video",
            desc: "Servicii foto-video profesionale și editare",
            count: \`78+ \${t("services.count")}\`,
            icon: Camera,
            query: "Fotografie"
        },
        {
            rank: 4,
            name: "Sonorizare & DJ",
            desc: "Instalații de sunet, microfoane și DJ autorizat",
            count: \`65+ \${t("services.count")}\`,
            icon: Music,
            query: "Sonorizare"
        },
        {
            rank: 5,
            name: "Proiectoare & Ecrane LED",
            desc: "Ecrane LED mari, videoproiectoare și accesorii",
            count: \`59+ \${t("services.count")}\`,
            icon: Monitor,
            query: "Proiector"
        },
        {
            rank: 6,
            name: "Asistență Tehnică & IT",
            desc: "Suport tehnic dedicat pe durata închirierii",
            count: \`52+ \${t("services.count")}\`,
            icon: Wrench,
            query: "Asistenta"
        },
        {
            rank: 7,
            name: "Securitate & Control Acces",
            desc: "Personal autorizat pentru pază și verificare invitați",
            count: \`41+ \${t("services.count")}\`,
            icon: ShieldCheck,
            query: "Securitate"
        },
        {
            rank: 8,
            name: "Bar Mobil & Barista",
            desc: "Barmani profesioniști, cocktail-uri și cafea premium",
            count: \`38+ \${t("services.count")}\`,
            icon: Utensils,
            query: "Bar"
        },
        {
            rank: 9,
            name: "Decor & Aranjamente",
            desc: "Design tematic, decor floral și mobilier adițional",
            count: \`34+ \${t("services.count")}\`,
            icon: Flower2,
            query: "Decor"
        },
        {
            rank: 10,
            name: "Hostess & Primire Oaspeți",
            desc: "Înregistrare invitați, asistență protocol și garderobă",
            count: \`29+ \${t("services.count")}\`,
            icon: Users,
            query: "Hostess"
        },
    ];

    return (
        <div className="min-h-screen bg-[#F3F8F8] text-[#1A2020] selection:bg-[#E6F4F4]">
            {/* Hero Section */}
            <main>
                <section className="relative py-14 lg:py-24 overflow-hidden bg-gradient-to-b from-[#E6F4F4]/60 via-[#F3F8F8] to-transparent">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-left duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F4F4] text-[#006F6F] text-xs font-black uppercase tracking-widest border border-[#CCE4E4]">
                                <Sparkles className="w-4 h-4 text-[#008080]" />
                                {t("hero.badge")}
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-[#1A2020]">
                                {t("hero.title1")} <br />
                                <span className="text-[#008080]">{t("hero.title2")}</span>
                            </h1>

                            <p className="text-lg text-gray-600 max-w-xl leading-relaxed font-normal">
                                {t("hero.subtitle")}
                            </p>

                            {/* Search Box */}
                            <div className="bg-white p-3 rounded-3xl shadow-xl shadow-[#008080]/5 border border-[#E2ECEC] flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 px-4 py-2 flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-[#E2ECEC]">
                                    <MapPin className="w-5 h-5 text-[#008080] flex-shrink-0" />
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                            {t("hero.cityLabel")}
                                        </label>
                                        <input
                                            type="text"
                                            id="hero-city"
                                            placeholder={t("hero.cityPlaceholder")}
                                            className="w-full text-sm font-semibold text-gray-800 focus:outline-none bg-transparent"
                                        />
                                    </div>
                                </div>

                                <Link href="/explore" className="flex items-center">
                                    <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#008080] hover:bg-[#006F6F] text-white text-base font-bold shadow-lg shadow-[#008080]/20 transition-all hover:scale-105">
                                        {t("hero.searchBtn")}
                                        <Search className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 pt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#008080]" />
                                    {t("hero.verified")}
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#008080]" />
                                    {t("hero.noDeposit")}
                                </span>
                            </div>
                        </div>

                        {/* Hero Image Showcase */}
                        <div className="relative animate-in fade-in slide-in-from-right duration-700">
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#008080]/10 border-[8px] border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                                    alt="TIDO Exclusive Space"
                                    className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-md border border-[#E2ECEC]">
                                    {t("hero.badgeTag")}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categorii de spații (3 Categories as requested) */}
                <section className="py-20 bg-white border-y border-[#E2ECEC]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-[#1A2020]">
                                    {t("cat.title")}
                                </h2>
                                <p className="text-gray-500 mt-2">
                                    {t("cat.subtitle")}
                                </p>
                            </div>
                            <Link href="/explore" className="text-sm font-bold text-[#008080] hover:text-[#006F6F] flex items-center gap-1">
                                {t("cat.viewAll")} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {POPULAR_CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={\`/explore?category=\${cat.id}\`}
                                    className="group p-6 rounded-3xl border border-[#E2ECEC] hover:border-[#008080] hover:shadow-xl hover:shadow-[#008080]/5 transition-all duration-300 bg-white"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#E6F4F4] flex items-center justify-center text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-colors duration-300 mb-5">
                                        <cat.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#008080] transition-colors">
                                            {cat.label}
                                        </h3>
                                        <span className="text-xs font-semibold text-gray-400">{cat.count}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-normal">
                                        {cat.desc}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Servicii (Identical setup and features + Top 10 Most Popular list) */}
                <section className="py-20 bg-[#F3F8F8] border-b border-[#E2ECEC]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-[#1A2020]">
                                    {t("services.title")}
                                </h2>
                                <p className="text-gray-500 mt-2">
                                    {t("services.subtitle")}
                                </p>
                            </div>
                            <Link href="/explore?q=Servicii" className="text-sm font-bold text-[#008080] hover:text-[#006F6F] flex items-center gap-1">
                                {t("services.viewAll")} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* 3 Main Service Options with same function, features, and setup */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {POPULAR_SERVICES.map((serv) => (
                                <Link
                                    key={serv.id}
                                    href={\`/explore?q=\${encodeURIComponent(serv.query)}\`}
                                    className="group p-6 rounded-3xl border border-[#E2ECEC] hover:border-[#008080] hover:shadow-xl hover:shadow-[#008080]/5 transition-all duration-300 bg-white"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#E6F4F4] flex items-center justify-center text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-colors duration-300 mb-5">
                                        <serv.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#008080] transition-colors">
                                            {serv.label}
                                        </h3>
                                        <span className="text-xs font-semibold text-gray-400">{serv.count}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-normal">
                                        {serv.desc}
                                    </p>
                                </Link>
                            ))}
                        </div>

                        {/* Top 10 Most Popular Services */}
                        <div className="mt-16 pt-12 border-t border-[#E2ECEC]">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F4] text-[#006F6F] text-xs font-black uppercase tracking-wider mb-2 border border-[#CCE4E4]">
                                        <Sparkles className="w-3.5 h-3.5 text-[#008080]" />
                                        Top 10 Recomandate
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight text-[#1A2020]">
                                        {t("services.top10Title")}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {t("services.top10Subtitle")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {TOP_SERVICES.map((s) => (
                                    <Link
                                        key={s.rank}
                                        href={\`/explore?q=\${encodeURIComponent(s.query)}\`}
                                        className="group bg-white p-5 rounded-2xl border border-[#E2ECEC] shadow-sm hover:shadow-lg hover:border-[#008080] transition-all duration-200 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="w-7 h-7 rounded-full bg-[#E6F4F4] text-[#008080] group-hover:bg-[#008080] group-hover:text-white font-black text-xs flex items-center justify-center transition-colors">
                                                    #{s.rank}
                                                </span>
                                                <s.icon className="w-5 h-5 text-gray-400 group-hover:text-[#008080] transition-colors" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-[#008080] transition-colors text-sm mb-1 line-clamp-1">
                                                {s.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {s.desc}
                                            </p>
                                        </div>
                                        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                                            <span className="text-gray-400 font-medium">{s.count}</span>
                                            <span className="text-[#008080] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                                Caută &rarr;
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Host CTA */}
                <section className="py-24 bg-gradient-to-r from-[#004D4D] via-[#006F6F] to-[#008080] text-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="text-xs font-black uppercase tracking-widest text-teal-200">
                                {t("host.badge")}
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                                {t("host.title")}
                            </h2>
                            <p className="text-teal-100 text-base leading-relaxed">
                                {t("host.subtitle")}
                            </p>
                            <div className="flex gap-4 pt-2">
                                <Link href="/register?role=OWNER">
                                    <Button size="lg" className="bg-white text-[#006F6F] hover:bg-teal-50 font-bold rounded-2xl px-8 h-14 shadow-lg shadow-black/10">
                                        {t("host.button")}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15">
                                <div className="text-3xl font-black text-teal-200 mb-2">{t("host.stat1.val")}</div>
                                <div className="text-sm font-semibold">{t("host.stat1.label")}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15">
                                <div className="text-3xl font-black text-teal-200 mb-2">{t("host.stat2.val")}</div>
                                <div className="text-sm font-semibold">{t("host.stat2.label")}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15">
                                <div className="text-3xl font-black text-teal-200 mb-2">{t("host.stat3.val")}</div>
                                <div className="text-sm font-semibold">{t("host.stat3.label")}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15">
                                <div className="text-3xl font-black text-teal-200 mb-2">{t("host.stat4.val")}</div>
                                <div className="text-sm font-semibold">{t("host.stat4.label")}</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#111A1A] py-16 text-white border-t border-teal-950">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                    <div className="space-y-4 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#008080] rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight">TI<span className="text-[#008080]">DO</span></span>
                        </Link>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {t("footer.desc")}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4">{t("footer.categories")}</h4>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li><Link href="/explore?category=cocina" className="hover:text-white">{t("cat.kitchens")}</Link></li>
                            <li><Link href="/explore?category=coworking" className="hover:text-white">{t("cat.coworking")}</Link></li>
                            <li><Link href="/explore?category=estudio" className="hover:text-white">{t("cat.studios")}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4">{t("services.title")}</h4>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li><Link href="/explore?q=Curatenie" className="hover:text-white">{t("services.cleaning")}</Link></li>
                            <li><Link href="/explore?q=Catering" className="hover:text-white">{t("services.catering")}</Link></li>
                            <li><Link href="/explore?q=Echipamente" className="hover:text-white">{t("services.tech")}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4">{t("footer.legal")}</h4>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li><Link href="/privacy" className="hover:text-white">{t("footer.privacy")}</Link></li>
                            <li><Link href="/terms" className="hover:text-white">{t("footer.terms")}</Link></li>
                            <li><Link href="/gdpr" className="hover:text-white">{t("footer.gdpr")}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-teal-950/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} TIDO. {t("footer.rights")}</p>
                    <p>{t("footer.tagline")}</p>
                </div>
            </footer>
        </div>
    );
}
`;

fs.writeFileSync('app/page.tsx', pageContent, 'utf8');
console.log('app/page.tsx updated successfully');
