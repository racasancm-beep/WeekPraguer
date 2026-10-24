"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "ro" | "en" | "hu" | "de";

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

export const LANGUAGES: { code: Language; label: string; flag: string; nativeName: string }[] = [
    { code: "ro", label: "Română", flag: "🇷🇴", nativeName: "Română" },
    { code: "en", label: "English", flag: "🇬🇧", nativeName: "English" },
    { code: "hu", label: "Magyar", flag: "🇭🇺", nativeName: "Magyar" },
    { code: "de", label: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
    ro: {
        // Navigation
        "nav.explore": "Explorează Spații",
        "nav.login": "Autentificare",
        "nav.listSpace": "Publică un Spațiu",
        
        // Hero
        "hero.badge": "Închiriază și împarte spații cu ora",
        "hero.title1": "Închiriază spațiul tău când nu îl folosești,",
        "hero.title2": "cu ora.",
        "hero.subtitle": "Platformă cu peste 640 de spații unice în România. Bucătării utilate, coworking, studiouri foto & video, săli de evenimente, săli de sport și terase.",
        "hero.cityLabel": "Oraș",
        "hero.cityPlaceholder": "București, Cluj-Napoca...",
        "hero.searchBtn": "Caută Spații",
        "hero.verified": "640+ Spații Verificate",
        "hero.noDeposit": "Fără Garanție Obligatorie",
        "hero.badgeTag": "⭐ 4.9/5 • București & Cluj-Napoca",
        "hero.genieQuote": "Cu fiecare dorință pe care ți-o pui, devin tot mai puternic. Îndrăznești să vezi cât de departe pot ajunge?",

        // Categories
        "cat.title": "Categorii de spații",
        "cat.subtitle": "Găsește locul perfect pentru activitatea pe care vrei să o desfășori",
        "cat.viewAll": "Vezi toate spațiile",
        "cat.kitchens": "Bucătării",
        "cat.kitchens.desc": "Bucătării profesionale complet utilate",
        "cat.coworking": "Coworking",
        "cat.coworking.desc": "Birouri și spații de lucru partajate",
        "cat.studios": "Studiouri",
        "cat.studios.desc": "Fotografie, înregistrări video și podcast",
        "cat.rooms": "Săli & Evenimente",
        "cat.rooms.desc": "Ședințe de echipă, prezentări și ateliere",
        "cat.gyms": "Săli de sport",
        "cat.gyms.desc": "Antrenamente personale, yoga și dans",
        "cat.terraces": "Terase",
        "cat.terraces.desc": "Spații exterioare cu farmec deosebit",
                "spaces.count": "spații",

        // Services
        "services.title": "Servicii",
        "services.subtitle": "Găsește servicii profesionale dedicate pentru spațiul sau evenimentul tău",
        "services.viewAll": "Vezi toate serviciile",
        "services.cleaning": "Curățenie & Igienizare",
        "services.cleaning.desc": "Igienizare completă înainte și după evenimente sau sesiuni foto",
        "services.catering": "Catering & Protocol",
        "services.catering.desc": "Coffee break, gustări, meniuri calde și servire dedicată",
        "services.tech": "Echipamente & Suport Tehnic",
        "services.tech.desc": "Sisteme audio-video, lumini, ecrane LED și asistență pe durata evenimentului",
        "services.count": "servicii",
        "services.top10Title": "Top 10 Servicii Populare",
        "services.top10Subtitle": "Cele mai căutate și apreciate servicii suplimentare de pe platformă",

        // Cities
        "cities.title": "Orașe disponibile",
        "cities.subtitle": "Spații cu ora în cele mai importante 10 orașe din România",

        // Host CTA
        "host.badge": "Pentru Gazde",
        "host.title": "Ai un spațiu liber? Câștigă bani închiriindu-l cu ora.",
        "host.subtitle": "Publică gratuit studioul, bucătăria, sala sau biroul tău în doar câteva minute. Tu decizi prețurile, orele și disponibilitatea.",
        "host.button": "Publică spațiul meu",
        "host.stat1.val": "100%",
        "host.stat1.label": "Control total rezervări și calendar",
        "host.stat2.val": "0 Lei",
        "host.stat2.label": "Înscriere și publicare gratuită",
        "host.stat3.val": "640+",
        "host.stat3.label": "Comunitate activă de spații",
        "host.stat4.val": "Sigur",
        "host.stat4.label": "Plăți securizate și verificate",

        // Footer
        "footer.desc": "Platformă dedicată închirierii spațiilor cu ora. Găsește și rezervă spații unice în toată România.",
        "footer.categories": "Categorii",
        "footer.cities": "Orașe",
        "footer.legal": "Legal",
        "footer.privacy": "Politică de Confidențialitate",
        "footer.terms": "Termeni și Condiții",
        "footer.gdpr": "GDPR",
        "footer.rights": "Toate drepturile rezervate.",
        "footer.tagline": "Închiriază și împarte spații cu ora",

        // Explore page
        "explore.title": "Explorează Spații cu Ora",
        "explore.subtitle": "Găsește și rezervă spații unice pentru orice proiect sau eveniment",
        "explore.viewSpace": "Vezi spațiul",
        "filters.title": "Filtre de căutare",
        "filters.clear": "Resetează",
        "filters.search": "Caută",
        "filters.category": "Categorie",
        "filters.city": "Oraș",
        "filters.capacity": "Capacitate minimă",
        "filters.price": "Preț maxim / oră",
        "filters.apply": "Aplică filtre",
        "filters.reset": "Resetează"
    },
    en: {
        // Navigation
        "nav.explore": "Explore Spaces",
        "nav.login": "Sign In",
        "nav.listSpace": "List a Space",
        
        // Hero
        "hero.badge": "Rent and share spaces by the hour",
        "hero.title1": "Rent your space when you're not using it,",
        "hero.title2": "by the hour.",
        "hero.subtitle": "Marketplace with over 640 unique spaces across Romania. Rental kitchens, coworking, photography & recording studios, event rooms, gyms and terraces.",
        "hero.cityLabel": "City",
        "hero.cityPlaceholder": "București, Cluj-Napoca...",
        "hero.searchBtn": "Search Spaces",
        "hero.verified": "640+ Verified Spaces",
        "hero.noDeposit": "No Deposit Required",
        "hero.badgeTag": "⭐ 4.9/5 • București & Cluj-Napoca",
        "hero.genieQuote": "With every wish you make, I grow more powerful. Dare to see how far I can go?",

        // Categories
        "cat.title": "Space categories",
        "cat.subtitle": "Find the perfect place for whatever project or activity you want to host",
        "cat.viewAll": "Browse all spaces",
        "cat.kitchens": "Kitchens",
        "cat.kitchens.desc": "Fully equipped commercial & private kitchens",
        "cat.coworking": "Coworking",
        "cat.coworking.desc": "Shared desks and flexible working rooms",
        "cat.studios": "Studios",
        "cat.studios.desc": "Photography, video shooting & podcast studios",
        "cat.rooms": "Rooms & Events",
        "cat.rooms.desc": "Team meetings, presentations & workshop rooms",
        "cat.gyms": "Gyms & Sports",
        "cat.gyms.desc": "Personal training, yoga studios & dance halls",
        "cat.terraces": "Terraces",
        "cat.terraces.desc": "Charming outdoor and rooftop venues",
                "spaces.count": "spaces",

        // Services
        "services.title": "Services",
        "services.subtitle": "Find professional services dedicated to your space or event",
        "services.viewAll": "View all services",
        "services.cleaning": "Cleaning & Sanitation",
        "services.cleaning.desc": "Complete cleaning before and after events or shooting sessions",
        "services.catering": "Catering & Protocol",
        "services.catering.desc": "Coffee breaks, finger food, hot meals, and dedicated staffing",
        "services.tech": "AV Equipment & Tech Support",
        "services.tech.desc": "Sound systems, stage lighting, LED screens, and on-site event assistance",
        "services.count": "services",
        "services.top10Title": "Top 10 Most Popular Services",
        "services.top10Subtitle": "The most booked and requested add-on services across the platform",

        // Cities
        "cities.title": "Available cities",
        "cities.subtitle": "Hourly spaces across the top 10 cities of Romania",

        // Host CTA
        "host.badge": "For Hosts",
        "host.title": "Have a free space? Earn money by the hour.",
        "host.subtitle": "List your studio, kitchen, room or office for free in minutes. You set the prices, schedules and availability.",
        "host.button": "List my space",
        "host.stat1.val": "100%",
        "host.stat1.label": "Full booking & calendar control",
        "host.stat2.val": "RON0",
        "host.stat2.label": "Free to sign up & list",
        "host.stat3.val": "640+",
        "host.stat3.label": "Active spaces community",
        "host.stat4.val": "Secure",
        "host.stat4.label": "Protected & verified payments",

        // Footer
        "footer.desc": "Hourly space rental marketplace. Find and book unique spaces across Romania.",
        "footer.categories": "Categories",
        "footer.cities": "Cities",
        "footer.legal": "Legal",
        "footer.privacy": "Privacy Policy",
        "footer.terms": "Terms of Service",
        "footer.gdpr": "GDPR",
        "footer.rights": "All rights reserved.",
        "footer.tagline": "Rent and share spaces by the hour",

        // Explore page
        "explore.title": "Explore Spaces by the Hour",
        "explore.subtitle": "Find and book unique spaces for any project or event",
        "explore.viewSpace": "View space",
        "filters.title": "Search filters",
        "filters.clear": "Clear",
        "filters.search": "Search",
        "filters.category": "Category",
        "filters.city": "City",
        "filters.capacity": "Min. capacity",
        "filters.price": "Max price / hour",
        "filters.apply": "Apply filters",
        "filters.reset": "Reset"
    },
    hu: {
        // Navigation
        "nav.explore": "Helyszínek böngészése",
        "nav.login": "Bejelentkezés",
        "nav.listSpace": "Helyszín közzététele",
        
        // Hero
        "hero.badge": "Bérelj és ossz meg helyiségeket óránként",
        "hero.title1": "Add bérbe a helyiségedet, amikor nem használod,",
        "hero.title2": "óránként.",
        "hero.subtitle": "Több mint 640 egyedi bérlehető helyszín Romániában. Felszerelt konyhák, coworking, fotó- és videóstúdiók, rendezvénytermek, edzőtermek és teraszok.",
        "hero.cityLabel": "Város",
        "hero.cityPlaceholder": "Bukarest, Kolozsvár...",
        "hero.searchBtn": "Keresés",
        "hero.verified": "640+ Ellenőrzött Helyszín",
        "hero.noDeposit": "Kaució Nem Szükséges",
        "hero.badgeTag": "⭐ 4.9/5 • Bukarest & Kolozsvár",
        "hero.genieQuote": "Minden kívánságoddal egyre erősebbé válok. Mered látni, meddig tudok elmenni?",

        // Categories
        "cat.title": "Kategóriák",
        "cat.subtitle": "Találd meg a tökéletes helyszínt bármilyen tevékenységhez vagy projekthez",
        "cat.viewAll": "Összes helyszín",
        "cat.kitchens": "Konyhák",
        "cat.kitchens.desc": "Professzionálisan felszerelt konyhák",
        "cat.coworking": "Coworking",
        "cat.coworking.desc": "Közösségi irodák és munkaállomások",
        "cat.studios": "Stúdiók",
        "cat.studios.desc": "Fotó-, videó- és podcaststúdiók",
        "cat.rooms": "Termek & Események",
        "cat.rooms.desc": "Csapatmegbeszélések, előadások és workshopok",
        "cat.gyms": "Edzőtermek & Sport",
        "cat.gyms.desc": "Személyi edzés, jóga és táncterem",
        "cat.terraces": "Teraszok",
        "cat.terraces.desc": "Hangulatos szabadtéri és tetőteraszok",
                "spaces.count": "helyszín",

        // Services
        "services.title": "Szolgáltatások",
        "services.subtitle": "Találj professzionális szolgáltatásokat a helyszínedhez vagy rendezvényedhez",
        "services.viewAll": "Összes szolgáltatás",
        "services.cleaning": "Takarítás és Fertőtlenítés",
        "services.cleaning.desc": "Teljes körű takarítás rendezvények vagy fotózások előtt és után",
        "services.catering": "Catering és Vendéglátás",
        "services.catering.desc": "Kávészünet, falatkák, meleg ételek és dedikált személyzet",
        "services.tech": "Technikai és Hangtechnikai Eszközök",
        "services.tech.desc": "Hangtechnika, fények, LED falak és helyszíni technikai asszisztencia",
        "services.count": "szolgáltatás",
        "services.top10Title": "Top 10 Legnépszerűbb Szolgáltatás",
        "services.top10Subtitle": "A leggyakrabban igényelt kiegészítő szolgáltatások",

        // Cities
        "cities.title": "Elérhető városok",
        "cities.subtitle": "Óradíjas helyiségek Románia 10 legnagyobb városában",

        // Host CTA
        "host.badge": "Házigazdáknak",
        "host.title": "Van egy szabad helyiséged? Keress pénzt óránként.",
        "host.subtitle": "Hirdesd meg stúdiódat, konyhádat vagy tárgyalódat ingyen, percek alatt. Te döntöd el az árakat és az elérhetőséget.",
        "host.button": "Helyszínem hirdetése",
        "host.stat1.val": "100%",
        "host.stat1.label": "Teljes naptár- és foglaláskezelés",
        "host.stat2.val": "0 Ft",
        "host.stat2.label": "Ingyenes regisztráció és közzététel",
        "host.stat3.val": "640+",
        "host.stat3.label": "Aktív helyszínek közössége",
        "host.stat4.val": "Biztonságos",
        "host.stat4.label": "Biztonságos, ellenőrzött kifizetések",

        // Footer
        "footer.desc": "Óradíjas helyiségbérlési piactér. Találj és foglalj egyedi helyszíneket Románia-szerte.",
        "footer.categories": "Kategóriák",
        "footer.cities": "Városok",
        "footer.legal": "Jogi információk",
        "footer.privacy": "Adatvédelmi irányelvek",
        "footer.terms": "Általános szerződési feltételek",
        "footer.gdpr": "GDPR",
        "footer.rights": "Minden jog fenntartva.",
        "footer.tagline": "Bérelj és ossz meg helyiségeket óránként",

        // Explore page
        "explore.title": "Helyszínek felfedezése óradíjjal",
        "explore.subtitle": "Találj és bérelj egyedi helyiségeket bármely projekthez",
        "explore.viewSpace": "Megtekintés",
        "filters.title": "Keresési szűrők",
        "filters.clear": "Törlés",
        "filters.search": "Keresés",
        "filters.category": "Kategória",
        "filters.city": "Város",
        "filters.capacity": "Min. kapacitás",
        "filters.price": "Max. óradíj",
        "filters.apply": "Szűrés",
        "filters.reset": "Alaphelyzet"
    },
    de: {
        // Navigation
        "nav.explore": "Räume entdecken",
        "nav.login": "Anmelden",
        "nav.listSpace": "Raum inserieren",
        
        // Hero
        "hero.badge": "Räume stundenweise mieten & teilen",
        "hero.title1": "Vermiete deinen Raum, wenn du ihn nicht brauchst,",
        "hero.title2": "stundenweise.",
        "hero.subtitle": "Marktplatz mit über 640 einzigartigen Räumen in Rumänien. Profi-Küchen, Coworking, Foto- & Filmstudios, Veranstaltungsräume, Fitnessstudios und Terrassen.",
        "hero.cityLabel": "Stadt",
        "hero.cityPlaceholder": "Bukarest, Klausenburg...",
        "hero.searchBtn": "Räume suchen",
        "hero.verified": "640+ Verifizierte Räume",
        "hero.noDeposit": "Keine Kaution erforderlich",
        "hero.badgeTag": "⭐ 4.9/5 • Bukarest & Klausenburg",
        "hero.genieQuote": "Mit jedem Wunsch, den du äußerst, werde ich mächtiger. Wagst du zu sehen, wie weit ich gehen kann?",

        // Categories
        "cat.title": "Raumkategorien",
        "cat.subtitle": "Finde die ideale Location für dein Projekt, Seminar oder Event",
        "cat.viewAll": "Alle Räume ansehen",
        "cat.kitchens": "Mietküchen",
        "cat.kitchens.desc": "Voll ausgestattete Profi- und Showküchen",
        "cat.coworking": "Coworking",
        "cat.coworking.desc": "Arbeitsplätze und flexible Meetingräume",
        "cat.studios": "Studios",
        "cat.studios.desc": "Foto-, Videodreh- und Podcaststudios",
        "cat.rooms": "Räume & Events",
        "cat.rooms.desc": "Team-Meetings, Workshops und Seminarräume",
        "cat.gyms": "Fitness & Sport",
        "cat.gyms.desc": "Personal Training, Yoga- und Tanzstudios",
        "cat.terraces": "Terrassen",
        "cat.terraces.desc": "Attraktive Außenbereiche und Rooftops",
        "spaces.count": "Räume",

        // Cities
        "cities.title": "Verfügbare Städte",
        "cities.subtitle": "Stundenweise buchbare Räume in den 10 größten Städten Rumäniens",

        // Host CTA
        "host.badge": "Für Gastgeber",
        "host.title": "Hast du freien Platz? Verdiene stundenweise Geld.",
        "host.subtitle": "Inseriere dein Studio, deine Küche oder dein Büro kostenlos in wenigen Minuten. Du bestimmst Preise, Zeiten und Verfügbarkeit.",
        "host.button": "Meinen Raum inserieren",
        "host.stat1.val": "100%",
        "host.stat1.label": "Volle Kontrolle über Buchungen & Kalender",
        "host.stat2.val": "0 RON",
        "host.stat2.label": "Kostenlose Registrierung & Veröffentlichung",
        "host.stat3.val": "640+",
        "host.stat3.label": "Aktive Raum-Community",
        "host.stat4.val": "Sicher",
        "host.stat4.label": "Geschützte und verifizierte Auszahlungen",

        // Footer
        "footer.desc": "Plattform für stundenweise Raummiete. Finde und buche einzigartige Räume in ganz Rumänien.",
        "footer.categories": "Kategorien",
        "footer.cities": "Städte",
        "footer.legal": "Rechtliches",
        "footer.privacy": "Datenschutz",
        "footer.terms": "Nutzungsbedingungen",
        "footer.gdpr": "DSGVO",
        "footer.rights": "Alle Rechte vorbehalten.",
        "footer.tagline": "Räume stundenweise mieten & teilen",

        // Explore page
        "explore.title": "Räume stundenweise entdecken",
        "explore.subtitle": "Finde und buche außergewöhnliche Räume für jedes Event",
        "explore.viewSpace": "Raum ansehen",
        "filters.title": "Suchfilter",
        "filters.clear": "Löschen",
        "filters.search": "Suchen",
        "filters.category": "Kategorie",
        "filters.city": "Stadt",
        "filters.capacity": "Min. Kapazität",
        "filters.price": "Max. Preis / Stunde",
        "filters.apply": "Filter anwenden",
        "filters.reset": "Zurücksetzen"
    }
};

const LanguageContext = createContext<LanguageContextType>({
    language: "ro",
    setLanguage: () => {},
    t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("ro");

    useEffect(() => {
        try {
            const saved = localStorage.getItem("tido_language") as Language;
            if (saved && ["ro", "en", "hu", "de"].includes(saved)) {
                setLanguageState(saved);
            }
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem("tido_language", lang);
        } catch {
            // Ignore localStorage errors
        }
    };

    const t = (key: string): string => {
        return TRANSLATIONS[language]?.[key] || TRANSLATIONS.ro[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
