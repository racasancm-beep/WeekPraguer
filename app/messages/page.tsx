"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    MessageSquare,
    Send,
    Clock,
    Lock,
    ShieldAlert,
    CheckCircle2,
    Calendar,
    Building2,
    ArrowLeft,
    RefreshCw,
    Bot,
    Bell,
    User,
    KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";

interface ConversationItem {
    id: string;
    bookingId: string;
    space: {
        id: string;
        name: string;
        address: string;
        city: string;
        accessCode?: string | null;
        photos?: { url: string }[];
    };
    booking: {
        id: string;
        startTime: string;
        endTime: string;
        status: string;
        totalPrice: number;
        accessCode?: string | null;
    };
    otherParty: {
        id: string;
        name: string | null;
        email: string;
    };
    isUserOwner: boolean;
    lastMessage?: {
        content: string;
        createdAt: string;
        senderRole: string;
        isAutomated: boolean;
    } | null;
    activeStatus: {
        isActive: boolean;
        expiresAt: string;
        isExpired: boolean;
    };
    status: string;
}

interface MessageItem {
    id: string;
    conversationId: string;
    senderId?: string | null;
    senderRole: string;
    content: string;
    isAutomated: boolean;
    automatedType?: string | null;
    createdAt: string;
    sender?: {
        id: string;
        name: string | null;
        email: string;
    } | null;
}

function MessagesContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialBookingId = searchParams.get("bookingId");
    const { t } = useLanguage();

    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [currentConversation, setCurrentConversation] = useState<any | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [loadingList, setLoadingList] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch conversation list
    const fetchConversations = async (autoSelectFirst = true) => {
        try {
            const res = await fetch("/api/chat/conversations");
            if (res.ok) {
                const data = await res.json();
                const list: ConversationItem[] = data.conversations || [];
                setConversations(list);

                if (list.length > 0 && autoSelectFirst && !selectedConvId) {
                    if (initialBookingId) {
                        const target = list.find((c) => c.bookingId === initialBookingId);
                        if (target) {
                            setSelectedConvId(target.id);
                            return;
                        }
                    }
                    setSelectedConvId(list[0].id);
                }
            }
        } catch (e) {
            console.error("Error fetching conversations:", e);
        } finally {
            setLoadingList(false);
        }
    };

    // Auto-create/open conversation if initialBookingId is provided
    useEffect(() => {
        if (status === "authenticated" && initialBookingId) {
            fetch("/api/chat/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: initialBookingId }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data?.conversation?.id) {
                        setSelectedConvId(data.conversation.id);
                    }
                    fetchConversations(false);
                })
                .catch(() => {
                    fetchConversations(true);
                });
        } else if (status === "authenticated") {
            fetchConversations(true);
        }
    }, [status, initialBookingId]);

    // Fetch messages for selected conversation
    const fetchSelectedChat = async (silent = false) => {
        if (!selectedConvId) return;
        if (!silent) setLoadingChat(true);
        try {
            const res = await fetch(`/api/chat/conversations/${selectedConvId}`);
            if (res.ok) {
                const data = await res.json();
                setCurrentConversation(data.conversation);
                setMessages(data.conversation.messages || []);
            }
        } catch (e) {
            console.error("Error loading chat messages:", e);
        } finally {
            if (!silent) setLoadingChat(false);
        }
    };

    useEffect(() => {
        if (selectedConvId) {
            fetchSelectedChat(false);

            // Set up polling every 4 seconds for fresh live chat
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            pollTimerRef.current = setInterval(() => {
                fetchSelectedChat(true);
            }, 4000);
        }

        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, [selectedConvId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !selectedConvId || sending) return;

        setSending(true);
        try {
            const res = await fetch(`/api/chat/conversations/${selectedConvId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            if (res.ok) {
                setNewMessage("");
                setMessages((prev) => [...prev, data.message]);
                fetchConversations(false);
            } else {
                toast.error(data.message || "Eroare la trimiterea mesajului");
            }
        } catch (err) {
            toast.error("Eroare de rețea.");
        } finally {
            setSending(false);
        }
    };

    // 1. Unauthenticated view with DISCLAIMER as requested
    if (status === "unauthenticated") {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-3xl border shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto shadow-sm">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                        {t("chat.loginRequiredTitle") || "Autentificare Necesară"}
                    </h2>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 leading-relaxed">
                        <ShieldAlert className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                        {t("chat.loginDisclaimer") ||
                            "Trebuie să fii autentificat pentru a putea discuta cu alți membri ai platformei. Chatul se activează automat după rezervarea unui spațiu și este disponibil până la 48 de ore după check-out."}
                    </div>
                    <Button
                        onClick={() => router.push("/login?callbackUrl=/messages")}
                        className="w-full h-11 bg-[#008080] hover:bg-[#006F6F] text-white font-bold rounded-xl"
                    >
                        {t("nav.signIn") || "Conectează-te în Cont"}
                    </Button>
                </div>
            </div>
        );
    }

    if (status === "loading" || loadingList) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="flex items-center gap-2 text-teal-700 font-bold">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t("common.loading") || "Se încarcă mesajele..."}</span>
                </div>
            </div>
        );
    }

    const currentUserId = (session?.user as any)?.id;
    const isOwnerRole = (session?.user as any)?.role === "OWNER";

    return (
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
                        <MessageSquare className="w-7 h-7 text-[#008080]" />
                        <span>{t("chat.platformChatTitle") || "Mesagerie & Notificări Platformă"}</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {t("chat.platformChatSubtitle") ||
                            "Chat securizat între proprietari și clienți, activ de la confirmare până la 48h după check-out."}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] h-[75vh]">
                {/* Left Panel: Conversation List */}
                <div className="md:col-span-4 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/40">
                    <div className="p-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">
                            {t("chat.conversationsTitle") || "Conversații Active"} ({conversations.length})
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchConversations(false)}
                            className="h-7 px-2 text-gray-500 hover:text-teal-700"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 space-y-2">
                                <MessageSquare className="w-10 h-10 mx-auto text-gray-300" />
                                <p className="text-xs font-semibold">
                                    {t("chat.noConversations") ||
                                        "Nu ai nicio conversație activă. Chatul se activează automat atunci când un spațiu este rezervat."}
                                </p>
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const isSelected = conv.id === selectedConvId;
                                const isExpired = conv.activeStatus?.isExpired;
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConvId(conv.id)}
                                        className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 ${
                                            isSelected
                                                ? "bg-teal-50/80 dark:bg-teal-950/30 border-l-4 border-l-[#008080]"
                                                : "hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
                                            {(conv.otherParty?.name?.[0] || conv.otherParty?.email?.[0] || "U").toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                                    {conv.otherParty?.name || conv.otherParty?.email?.split("@")[0]}
                                                </p>
                                                <span
                                                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                                                        isExpired
                                                            ? "bg-gray-200 text-gray-600"
                                                            : "bg-emerald-100 text-emerald-800"
                                                    }`}
                                                >
                                                    {isExpired ? "Arhivat" : "Activ"}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-semibold text-[#008080] truncate">
                                                {conv.space.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                                {conv.lastMessage?.content || "Niciun mesaj încă"}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Panel: Active Chat Thread */}
                <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-gray-800">
                    {!currentConversation ? (
                        <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400">
                            <div>
                                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                <p className="text-sm font-semibold">
                                    {t("chat.selectAConversation") || "Selectează o conversație din listă pentru a citi și trimite mesaje."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-3.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/30 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
                                        {(currentConversation.otherParty?.name?.[0] || currentConversation.otherParty?.email?.[0] || "U").toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">
                                                {currentConversation.otherParty?.name || currentConversation.otherParty?.email}
                                            </h2>
                                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                                                {currentConversation.isUserOwner ? (t("renter.roleBadge") || "Customer") : (t("owner.roleBadge") || "Owner")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
                                            <span>{currentConversation.space.name}</span>
                                            <span>•</span>
                                            <span>
                                                {new Date(currentConversation.booking.startTime).toLocaleDateString()} -{" "}
                                                {new Date(currentConversation.booking.endTime).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0 text-right">
                                    {currentConversation.activeStatus?.isExpired ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            <Lock className="w-3 h-3" />
                                            Închis (+48h după check-out)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            Chat Activ (deschis până la 48h post check-out)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Access code reminder banner inside chat */}
                            {(currentConversation.space.accessCode || currentConversation.booking.accessCode) && (
                                <div className="bg-teal-50 px-4 py-2 border-b border-teal-200 flex items-center justify-between text-xs text-teal-900">
                                    <span className="flex items-center gap-1.5 font-bold">
                                        <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                                        Cod Acces Spațiu:
                                    </span>
                                    <span className="font-mono font-black text-teal-950 bg-white px-2 py-0.5 rounded border border-teal-300">
                                        {currentConversation.space.accessCode || currentConversation.booking.accessCode}
                                    </span>
                                </div>
                            )}

                            {/* Messages Stream */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                                        Niciun mesaj schimbat încă. Scrie primul mesaj mai jos!
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        // Automated system reminder (24h or 12h)
                                        if (msg.isAutomated && (msg.automatedType === "REMINDER_24H" || msg.automatedType === "REMINDER_12H")) {
                                            return (
                                                <div key={msg.id} className="my-2 p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200 shadow-sm max-w-lg mx-auto">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-teal-800 mb-1.5">
                                                        <Bot className="w-3.5 h-3.5 text-teal-600" />
                                                        <span>
                                                            {msg.automatedType === "REMINDER_24H" ? "Reamintire Automată 24h" : "Reamintire Automată 12h"}
                                                        </span>
                                                        <span className="text-[9px] text-teal-600 font-semibold">• Trimis pe chat & email client</span>
                                                    </div>
                                                    <p className="text-xs text-teal-950 leading-relaxed font-medium">
                                                        {msg.content}
                                                    </p>
                                                    <div className="text-[9px] text-teal-600 mt-1 text-right">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Owner notification message
                                        if (msg.isAutomated && msg.automatedType === "OWNER_NOTIFICATION") {
                                            return (
                                                <div key={msg.id} className="my-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs font-semibold max-w-md mx-auto flex items-start gap-2 shadow-sm">
                                                    <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="leading-snug">{msg.content}</p>
                                                        <div className="text-[9px] text-amber-600 mt-1 text-right">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Regular user messages
                                        const isMine = msg.senderId === currentUserId;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                                    <span className="text-[10px] font-bold text-gray-500">
                                                        {isMine
                                                            ? (t("messages.you") || "You")
                                                            : msg.sender?.name || (msg.senderRole === "OWNER" ? (t("owner.roleBadge") || "Owner") : (t("renter.roleBadge") || "Customer"))}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm break-words ${
                                                        isMine
                                                            ? "bg-[#008080] text-white rounded-br-xs"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-xs"
                                                    }`}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input or Expired notice */}
                            {currentConversation.activeStatus?.isExpired ? (
                                <div className="p-3 bg-gray-100 dark:bg-gray-900 border-t text-center text-xs text-gray-500 font-semibold flex items-center justify-center gap-2">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                    <span>
                                        {t("chat.chatExpiredNotice") ||
                                            "Acest chat a fost arhivat automat la 48 de ore după finalizarea închirierii (check-out). Nu mai pot fi trimise mesaje noi."}
                                    </span>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={t("chat.inputPlaceholder") || "Scrie un mesaj către proprietar sau client..."}
                                        className="text-xs h-10 rounded-xl"
                                        disabled={sending}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="h-10 px-4 bg-[#008080] hover:bg-[#006F6F] text-white font-bold rounded-xl shrink-0"
                                    >
                                        <Send className="w-4 h-4 mr-1" />
                                        <span>{t("common.send") || "Trimite"}</span>
                                    </Button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-teal-700 font-bold">Se încarcă chat-ul...</div>}>
            <MessagesContent />
        </Suspense>
    );
}
