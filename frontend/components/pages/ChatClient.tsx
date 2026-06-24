"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { fullUrl } from "@/lib/url";
import { ArrowLeft, Send } from "lucide-react";

interface Conversation {
  id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_picture: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
  sender_name: string;
  sender_picture: string | null;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function ChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  // Sur mobile, contrôle quelle vue est affichée : la liste ou le détail d'une conversation
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSelectedRef = useRef(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { router.push("/login"); return; }
    setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-sélectionne la conv depuis l'URL ?conv=ID
  useEffect(() => {
    if (autoSelectedRef.current) return;
    if (conversations.length === 0) return;

    const convParam = searchParams.get("conv");
    if (!convParam) return;

    const target = conversations.find(c => c.id === Number(convParam));
    if (target) {
      autoSelectedRef.current = true;
      selectConversation(target);
    }
  }, [conversations, searchParams]);

  const loadConversations = async () => {
    try {
      const res = await api.get("/api/conversations");
      setConversations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setMobileView("detail");
    try {
      const res = await api.get(`/api/conversations/${conv.id}/messages`);
      setMessages(res.data);
      setConversations(prev =>
        prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const backToList = () => {
    setMobileView("list");
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;
    try {
      const res = await api.post(`/api/conversations/${selectedConv.id}/messages`, {
        content: newMessage.trim(),
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id
          ? { ...c, last_message: newMessage.trim(), last_message_at: new Date().toISOString() }
          : c
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="flex h-[calc(100dvh-153px)] md:h-[calc(100dvh-190px)] overflow-hidden">

      {/* ── Sidebar conversations ── */}
      <div
        className={`w-full md:w-[300px] shrink-0 flex flex-col min-h-0 border-r border-gray-100 bg-white ${
          mobileView === "detail" ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="px-5 pt-6 pb-4 shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 hover:text-gray-800"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Retour
          </button>
          <h1 className="text-2xl font-semibold">Messages</h1>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-400 px-5">Aucune conversation</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                aria-label={`Conversation avec ${conv.other_user_name}${
                  conv.unread_count > 0 ? `, ${conv.unread_count} message(s) non lu(s)` : ""
                }`}
                className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition text-left border-b border-gray-50 ${
                  selectedConv?.id === conv.id ? "bg-gray-50" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                  {conv.other_user_picture ? (
                    <img src={fullUrl(conv.other_user_picture)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {conv.other_user_name}
                    </span>
                    {conv.last_message_at && (
                      <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                        {formatTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">
                      {conv.last_message || "Aucun message"}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Zone messages ── */}
      <div
        className={`flex-1 flex flex-col min-h-0 ${
          mobileView === "list" ? "hidden md:flex" : "flex"
        }`}
      >
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Sélectionnez une conversation
          </div>
        ) : (
          <>
            {/* Bouton retour visible uniquement sur mobile, ramène à la liste des conversations */}
            <div className="md:hidden px-4 pt-4 shrink-0">
              <button
                onClick={backToList}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
              >
                <ArrowLeft size={14} aria-hidden="true" /> Retour
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                const showDateSep = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);

                return (
                  <div key={msg.id}>
                    {showDateSep && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">{formatDateSeparator(msg.created_at)}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}

                    <div className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                      <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                        {msg.sender_picture ? (
                          <img src={fullUrl(msg.sender_picture)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-300" />
                        )}
                      </div>

                      <div className={`max-w-[75%] md:max-w-[60%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`flex items-center gap-2 text-xs text-gray-400 ${isMe ? "flex-row-reverse" : ""}`}>
                          <span className="font-medium text-gray-600">{msg.sender_name}</span>
                          <span>•</span>
                          <span>{formatTime(msg.created_at)}</span>
                        </div>

                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-[#9F3A1D] text-white rounded-tr-sm"
                            : "bg-white text-gray-800 rounded-tl-sm shadow-sm"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-100 bg-white px-4 md:px-6 py-4 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-3"
              >
                <label htmlFor="chat-message" className="sr-only">
                  Votre message
                </label>
                <input
                  id="chat-message"
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Envoyer un message"
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9F3A1D]/20"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  aria-label="Envoyer le message"
                  className="w-10 h-10 rounded-lg bg-[#9F3A1D] text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 shrink-0"
                >
                  <Send size={15} aria-hidden="true" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}