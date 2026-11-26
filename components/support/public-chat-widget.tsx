"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
    MessageSquare,
    X,
    HelpCircle,
    CreditCard,
    ShieldAlert,
    Send,
    CheckCircle2,
    Loader2,
    Mail,
    ArrowLeft,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";

type InquiryCategory = "HOW_IT_WORKS" | "PAYMENT_ISSUES" | "FRAUD_REPORT";

export function PublicChatWidget() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { t } = useLanguage();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<InquiryCategory | null>(null);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState(session?.user?.email || "");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const categories = [
        {
            key: "HOW_IT_WORKS" as InquiryCategory,
            icon: HelpCircle,
            title: t("inquiry.howItWorks") || "a. Cum funcționează platforma",
            subtitle: t("inquiry.howItWorksSub") || "Întrebări despre rezervări, închirieri sau utilizarea contului.",
            color: "text-blue-600 bg-blue-50 border-blue-200",
        },
        {
            key: "PAYMENT_ISSUES" as InquiryCategory,
            icon: CreditCard,
            title: t("inquiry.paymentIssues") || "b. Probleme cu plățile",
            subtitle: t("inquiry.paymentIssuesSub") || "Dificultăți legate de transfer bancar, card sau dovezi de plată.",
            color: "text-amber-600 bg-amber-50 border-amber-200",
        },
        {
            key: "FRAUD_REPORT" as InquiryCategory,
            icon: ShieldAlert,
            title: t("inquiry.fraudReport") || "c. Raportează un proprietar sau client pentru activitate frauduloasă",
            subtitle: t("inquiry.fraudReportSub") || "Semnalează comportamente suspecte, înșelăciuni sau nereguli.",
            color: "text-red-600 bg-red-50 border-red-200",
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) {
            toast.error("Te rugăm să alegi una dintre cele 3 opțiuni.");
            return;
        }

        const trimmedMsg = message.trim();
        if (trimmedMsg.length < 5) {
            toast.error("Mesajul trebuie să conțină cel puțin 5 caractere.");
            return;
        }

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            toast.error("Este necesară o adresă de email validă pentru a primi răspuns.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/support/public-inquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: selectedCategory,
                    message: trimmedMsg.slice(0, 400),
                    email: trimmedEmail,
                    userName: session?.user?.name || undefined,
                    pageUrl: pathname || "/",
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setIsSubmitted(true);
                toast.success(t("inquiry.successToast") || "Mesajul a fost transmis administratorilor!");
            } else {
                toast.error(data.message || "Eroare la transmiterea mesajului.");
            }
        } catch (err) {
            toast.error("Eroare de conexiune la server.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedCategory(null);
        setMessage("");
        setIsSubmitted(false);
    };

    // When the Back to Home floating button is visible (on any page except "/"),
    // the Support/Report widget sits cleanly ABOVE it (bottom-24 / 96px from bottom),
    // ensuring they never overlap each other.
    const hasHomeButton = pathname !== "/";
    const bottomPositionClass = hasHomeButton ? "bottom-24" : "bottom-6";

    return (
        <aside aria-label="Support & Inquiries Widget">
            {/* Floating Trigger Button */}
            <div className={`fixed right-6 z-40 transition-all duration-300 ${bottomPositionClass}`}>
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#008080] hover:bg-[#006F6F] text-white font-bold shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/20"
                        title={t("inquiry.widgetBtn") || "Asistență & Întrebări"}
                    >
                        <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs tracking-wide">
                            {t("inquiry.widgetBtn") || "Asistență / Raportare"}
                        </span>
                    </button>
                )}
            </div>

            {/* Chat Box Modal / Drawer */}
            {isOpen && (
                <div className={`fixed right-6 z-50 w-[92vw] max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-teal-200 dark:border-teal-900/60 overflow-hidden flex flex-col max-h-[82vh] animate-in slide-in-from-bottom-5 duration-300 ${bottomPositionClass}`}>
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-teal-700 to-[#008080] text-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-black truncate">
                                    {t("inquiry.headerTitle") || "Asistență & Contact Direct"}
                                </h3>
                                <p className="text-[10px] text-teal-100 truncate">
                                    {t("inquiry.headerSubtitle") || "Mesajele sunt transmise direct Administratorilor"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1">
                        {isSubmitted ? (
                            <div className="py-8 text-center space-y-3">
                                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h4 className="text-base font-black text-gray-900 dark:text-gray-100">
                                    {t("inquiry.sentTitle") || "Mesajul a fost transmis!"}
                                </h4>
                                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                                    {t("inquiry.sentDesc") ||
                                        "Administratorul platformei a primit sesizarea ta și îți va răspunde pe adresa de email specificată."}
                                </p>
                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReset}
                                        className="text-xs font-bold"
                                    >
                                        {t("inquiry.sendAnother") || "Trimite alt mesaj"}
                                    </Button>
                                </div>
                            </div>
                        ) : !selectedCategory ? (
                            /* Step 1: Select one of the 3 options */
                            <div className="space-y-3">
                                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-semibold leading-relaxed">
                                    {t("inquiry.introNotice") ||
                                        "Selectează una dintre cele 3 opțiuni de mai jos pentru a trimite un mesaj direct echipei de administrare:"}
                                </div>

                                <div className="space-y-2 pt-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.key}
                                            onClick={() => setSelectedCategory(cat.key)}
                                            className="w-full p-3 rounded-2xl border-2 border-gray-200 hover:border-[#008080] hover:bg-teal-50/50 text-left transition-all group flex items-start gap-3"
                                        >
                                            <div className={`p-2 rounded-xl shrink-0 ${cat.color}`}>
                                                <cat.icon className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-black text-gray-900 dark:text-gray-100 group-hover:text-[#008080] transition-colors leading-tight">
                                                    {cat.title}
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                                                    {cat.subtitle}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Step 2: 400-char text area + email input */
                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                <div className="flex items-center justify-between pb-2 border-b">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory(null)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#008080]"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        <span>{t("common.back") || "Schimbă opțiunea"}</span>
                                    </button>
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                                        {categories.find((c) => c.key === selectedCategory)?.title.split(".")[0]}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                            {t("inquiry.descLabel") || "Descrie situația (max. 400 caractere):"}
                                        </label>
                                        <span
                                            className={`text-[10px] font-mono font-bold ${
                                                message.length >= 380 ? "text-red-600" : "text-gray-400"
                                            }`}
                                        >
                                            {message.length}/400
                                        </span>
                                    </div>
                                    <Textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value.slice(0, 400))}
                                        maxLength={400}
                                        rows={4}
                                        placeholder={
                                            selectedCategory === "FRAUD_REPORT"
                                                ? "Descrie comportamentul fraudulos, utilizatorul implicat sau linkul spațiului..."
                                                : "Detaliază întrebarea sau problema întâmpinată..."
                                        }
                                        required
                                        className="text-xs bg-gray-50 dark:bg-gray-900 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1 block">
                                        {t("inquiry.emailLabel") || "Adresa ta de email (pentru a primi răspunsul):"}
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nume@exemplu.ro"
                                            required
                                            className="text-xs pl-8 h-9"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        {t("inquiry.emailNotice") ||
                                            "Pentru a primi răspuns, este necesar să specifici o adresă de email validă."}
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !message.trim() || !email.trim()}
                                    className="w-full h-10 bg-[#008080] hover:bg-[#006F6F] text-white font-bold rounded-xl text-xs shadow-md"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                            {t("common.sending") || "Se trimite..."}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5 mr-1.5" />
                                            {t("inquiry.sendBtn") || "Trimite către Administratori"}
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </aside>
    );
}
