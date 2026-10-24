"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage, LANGUAGES, Language } from "@/lib/i18n/language-context";
import { Globe, ChevronDown, Check } from "lucide-react";

export function LanguageSelector({ variant = "dropdown" }: { variant?: "dropdown" | "pill" }) {
    const { language, setLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (variant === "pill") {
        return (
            <div className="inline-flex items-center p-1 bg-[#F3F8F8] border border-[#DDE8E8] rounded-full shadow-inner">
                {LANGUAGES.map((l) => {
                    const active = l.code === language;
                    return (
                        <button
                            key={l.code}
                            type="button"
                            onClick={() => setLanguage(l.code)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                active
                                    ? "bg-[#008080] text-white shadow-sm"
                                    : "text-gray-600 hover:text-[#008080]"
                            }`}
                        >
                            <span>{l.flag}</span>
                            <span className="uppercase text-[11px]">{l.code}</span>
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F3F8F8] text-[#1A1A1E] border border-[#DDE8E8] hover:border-[#008080] hover:bg-[#EAF3F3] transition-all shadow-sm focus:outline-none"
                aria-expanded={open}
            >
                <span className="text-sm">{currentLang.flag}</span>
                <span className="font-semibold">{currentLang.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? "rotate-180 text-[#008080]" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Select Language
                    </div>
                    {LANGUAGES.map((l) => {
                        const active = l.code === language;
                        return (
                            <button
                                key={l.code}
                                type="button"
                                onClick={() => {
                                    setLanguage(l.code);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                                    active
                                        ? "bg-[#F3F8F8] text-[#008080] font-bold"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-base">{l.flag}</span>
                                    <span>{l.label}</span>
                                </div>
                                {active && <Check className="w-3.5 h-3.5 text-[#008080]" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
