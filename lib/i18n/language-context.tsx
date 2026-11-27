"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "ro" | "en" | "hu" | "de";

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    translateAmenity: (amenity: string) => string;
    translateCategory: (category?: string | null) => string;
}

export const LANGUAGES: { code: Language; label: string; flag: string; nativeName: string }[] = [
    { code: "ro", label: "Română", flag: "🇷🇴", nativeName: "Română" },
    { code: "en", label: "English", flag: "🇬🇧", nativeName: "English" },
    { code: "hu", label: "Magyar", flag: "🇭🇺", nativeName: "Magyar" },
    { code: "de", label: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
];

import { ro } from "./locales/ro";
import { en } from "./locales/en";
import { hu } from "./locales/hu";
import { de } from "./locales/de";

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
    ro,
    en,
    hu,
    de,
};

const AMENITY_TRANSLATIONS: Record<string, Record<Language, string>> = {
    // Exact 20 strings from lib/constants/amenities.ts
    "High-Speed Wi-Fi": {
        ro: "Wi-Fi de Mare Viteză",
        en: "High-Speed Wi-Fi",
        hu: "Gyors Wi-Fi",
        de: "Highspeed-WLAN",
    },
    "Professional Meeting Rooms": {
        ro: "Săli de Ședințe Profesionale",
        en: "Professional Meeting Rooms",
        hu: "Professzionális Tárgyalók",
        de: "Professionelle Konferenzräume",
    },
    "Ergonomic Furniture": {
        ro: "Mobilier Ergonomic",
        en: "Ergonomic Furniture",
        hu: "Ergonomikus Bútorok",
        de: "Ergonomische Möbel",
    },
    "Natural Lighting": {
        ro: "Lumină Naturală",
        en: "Natural Lighting",
        hu: "Természetes Világítás",
        de: "Natürliches Tageslicht",
    },
    "Air Conditioning": {
        ro: "Aer Condiționat",
        en: "Air Conditioning",
        hu: "Légkondicionáló",
        de: "Klimaanlage",
    },
    "Kitchen Access": {
        ro: "Acces la Bucătărie",
        en: "Kitchen Access",
        hu: "Konynahasználat",
        de: "Küchenzugang",
    },
    "Free Coffee/Tea": {
        ro: "Cafea / Ceai Gratuit",
        en: "Free Coffee/Tea",
        hu: "Ingyenes Kávé / Tea",
        de: "Kaffee / Tee kostenlos",
    },
    "Print/Scan Facilities": {
        ro: "Imprimantă / Scanner",
        en: "Print/Scan Facilities",
        hu: "Nyomtatás / Szkennelés",
        de: "Drucker / Scanner",
    },
    "Quiet Zones": {
        ro: "Zone de Liniște",
        en: "Quiet Zones",
        hu: "Csendes Zónák",
        de: "Ruhezonen",
    },
    "Breakout Areas": {
        ro: "Zone de Relaxare",
        en: "Breakout Areas",
        hu: "Pihenőzónák",
        de: "Pausen- & Loungebereiche",
    },
    "Whiteboards/Projectors": {
        ro: "Whiteboard / Proiectoare",
        en: "Whiteboards/Projectors",
        hu: "Flipchart / Projektorok",
        de: "Whiteboards / Projektoren",
    },
    "Secure Bike Storage": {
        ro: "Parcare Securizată Biciclete",
        en: "Secure Bike Storage",
        hu: "Biztonságos Kerékpártároló",
        de: "Sicherer Fahrradabstellplatz",
    },
    "On-site Showers": {
        ro: "Dușuri în Locație",
        en: "On-site Showers",
        hu: "Zuhanyzó a Helyszínen",
        de: "Duschen vor Ort",
    },
    "24/7 Access": {
        ro: "Acces 24/7",
        en: "24/7 Access",
        hu: "0–24 Hozzáférés",
        de: "24/7 Zugang",
    },
    "Advanced Security": {
        ro: "Securitate Avansată",
        en: "Advanced Security",
        hu: "Fejlett Biztonsági Rendszer",
        de: "Erweiterte Sicherheit",
    },
    "On-site Parking": {
        ro: "Parcare în Locație",
        en: "On-site Parking",
        hu: "Parkolás a Helyszínen",
        de: "Parkplätze vor Ort",
    },
    "ADA Accessibility": {
        ro: "Accesibilitate Persoane cu Dizabilități",
        en: "ADA Accessibility",
        hu: "Akadálymentesített Hozzáférés",
        de: "Barrierefreier Zugang",
    },
    "Outdoor Terrace": {
        ro: "Terasă Exterioară",
        en: "Outdoor Terrace",
        hu: "Kültéri Terasz",
        de: "Außenterrasse",
    },
    "Soundproofing": {
        ro: "Izolare Fonică",
        en: "Soundproofing",
        hu: "Hangszigetelés",
        de: "Schalldämmung",
    },
    "Reception Services": {
        ro: "Servicii de Recepție",
        en: "Reception Services",
        hu: "Recepciós Szolgáltatás",
        de: "Empfangsservice",
    },
    // Additional DB / Legacy Amenity Variants
    "High-Speed WiFi": {
        ro: "WiFi de Mare Viteză",
        en: "High-Speed WiFi",
        hu: "Gyors WiFi",
        de: "Highspeed-WLAN",
    },
    "Heating": {
        ro: "Încălzire",
        en: "Heating",
        hu: "Fűtés",
        de: "Heizung",
    },
    "Kitchen / Kitchenette": {
        ro: "Bucătărie / Chicinetă",
        en: "Kitchen / Kitchenette",
        hu: "Konyha / Teakonyha",
        de: "Küche / Kochnische",
    },
    "Free Parking": {
        ro: "Parcare Gratuită",
        en: "Free Parking",
        hu: "Ingyenes Parkolás",
        de: "Kostenlose Parkplätze",
    },
    "Projector / Screen": {
        ro: "Proiector / Ecran",
        en: "Projector / Screen",
        hu: "Projektor / Vetítővászon",
        de: "Projektor / Leinwand",
    },
    "Sound System / Speakers": {
        ro: "Sistem Audio / Boxe",
        en: "Sound System / Speakers",
        hu: "Hangrendszer / Hangfalak",
        de: "Soundsystem / Lautsprecher",
    },
    "Microphone": {
        ro: "Microfon",
        en: "Microphone",
        hu: "Mikrofon",
        de: "Mikrofon",
    },
    "Natural Light": {
        ro: "Lumină Naturală",
        en: "Natural Light",
        hu: "Természetes Fény",
        de: "Tageslicht",
    },
    "Blackout Curtains": {
        ro: "Draperii Opace (Blackout)",
        en: "Blackout Curtains",
        hu: "Sötétítő Függönyök",
        de: "Verdunkelungsvorhänge",
    },
    "Wheelchair Accessible": {
        ro: "Accesibil Scaun Rulant",
        en: "Wheelchair Accessible",
        hu: "Akadálymentesített",
        de: "Rollstuhlgerecht",
    },
    "Elevator": {
        ro: "Lift",
        en: "Elevator",
        hu: "Lift",
        de: "Aufzug",
    },
    "Whiteboard / Flipchart": {
        ro: "Whiteboard / Flipchart",
        en: "Whiteboard / Flipchart",
        hu: "Whiteboard / Flipchart",
        de: "Whiteboard / Flipchart",
    },
    "Coffee / Tea Station": {
        ro: "Stație Cafea / Ceai",
        en: "Coffee / Tea Station",
        hu: "Kávé / Tea Sarok",
        de: "Kaffee- / Teestation",
    },
    "Lounge / Waiting Area": {
        ro: "Zonă Lounge / Așteptare",
        en: "Lounge / Waiting Area",
        hu: "Lounge / Váróterület",
        de: "Lounge- / Wartebereich",
    },
    "Changing Room": {
        ro: "Vestiar / Cabină Schimb",
        en: "Changing Room",
        hu: "Öltöző",
        de: "Umkleideraum",
    },
    "Private Restroom": {
        ro: "Baie Privată",
        en: "Private Restroom",
        hu: "Privát Mosdó",
        de: "Privates WC",
    },
    "Security Cameras": {
        ro: "Camere de Supraveghere",
        en: "Security Cameras",
        hu: "Biztonsági Kamerák",
        de: "Überwachungskameras",
    },
    "Outdoor / Terrace Area": {
        ro: "Zonă Exterioară / Terasă",
        en: "Outdoor / Terrace Area",
        hu: "Kültéri Rész / Terasz",
        de: "Außenbereich / Terrasse",
    },
    "Climate Control": {
        ro: "Control Climatizare",
        en: "Climate Control",
        hu: "Klímaszabályozás",
        de: "Klimaregelung",
    },
};

const CATEGORY_KEY_MAP: Record<string, string> = {
    cocina: "catOpt.cocina",
    kitchen: "catOpt.cocina",
    kitchens: "catOpt.cocina",
    coworking: "catOpt.coworking",
    estudio: "catOpt.estudio",
    studio: "catOpt.estudio",
    studios: "catOpt.estudio",
    sala: "catOpt.sala",
    gimnasio: "catOpt.gimnasio",
    gym: "catOpt.gimnasio",
    terraza: "catOpt.terraza",
    terrace: "catOpt.terraza",
    eventos: "catOpt.eventos",
    events: "catOpt.eventos",
    yoga: "catOpt.yoga",
    "fotografía": "catOpt.fotografia",
    fotografia: "catOpt.fotografia",
    photography: "catOpt.fotografia",
    taller: "catOpt.taller",
    workshop: "catOpt.taller",
    curatenie: "services.cleaning",
    catering: "services.catering",
    echipamente: "services.tech",
};

const LanguageContext = createContext<LanguageContextType>({
    language: "ro",
    setLanguage: () => {},
    t: (key: string) => key,
    translateAmenity: (amenity: string) => amenity,
    translateCategory: (category?: string | null) => category || "",
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
        return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || TRANSLATIONS.ro[key] || key;
    };

    const translateAmenity = (amenity: string): string => {
        return AMENITY_TRANSLATIONS[amenity]?.[language] || amenity;
    };

    const translateCategory = (category?: string | null): string => {
        if (!category) return "";
        const norm = category.trim().toLowerCase();
        const key = CATEGORY_KEY_MAP[norm];
        if (key) {
            return t(key);
        }
        return category;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translateAmenity, translateCategory }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
