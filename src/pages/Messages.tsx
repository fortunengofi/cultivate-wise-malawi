import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Send, ArrowLeft, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  listing?: { product: string; emoji: string; price: string };
  other_profile?: { display_name: string | null };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (!convs) { setLoading(false); return; }

    // fetch listings + other party profiles
    const listingIds = [...new Set(convs.map((c) => c.listing_id))];
    const otherIds = [...new Set(convs.map((c) => (c.buyer_id === user.id ? c.seller_id : c.buyer_id)))];

    const [{ data: listings }, { data: profiles }] = await Promise.all([
      supabase.from("listings").select("id,product,emoji,price").in("id", listingIds),
      supabase.from("profiles").select("user_id,display_name").in("user_id", otherIds),
    ]);

    const enriched: Conversation[] = convs.map((c) => ({
      ...c,
      listing: listings?.find((l) => l.id === c.listing_id),
      other_profile: profiles?.find((p) => p.user_id === (c.buyer_id === user.id ? c.seller_id : c.buyer_id)),
    }));
    setConversations(enriched);
    setLoading(false);
  };

  // Load messages + subscribe to realtime
  useEffect(() => {
    if (!conversationId || !user) return;
    setMessages([]);
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !conversationId || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: text.trim(),
    });
    setSending(false);
    if (error) toast.error(error.message);
    else { setText(""); loadConversations(); }
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <PageHeader title="Messages" subtitle="Chat with buyers and sellers" />
      <div className="px-4 sm:px-0 mt-6">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 h-[70vh]">
            {/* Conversation list */}
            <div className={`bg-card rounded-xl border border-border overflow-y-auto ${conversationId ? "hidden md:block" : ""}`}>
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />
                  No conversations yet.<br />Visit the Market to message a farmer.
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/messages/${c.id}`)}
                    className={`w-full text-left p-3 border-b border-border hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                      c.id === conversationId ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-2xl">{c.listing?.emoji || "🌾"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{c.other_profile?.display_name || "Farmer"}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.listing?.product}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Chat panel */}
            <div className={`bg-card rounded-xl border border-border flex flex-col ${!conversationId ? "hidden md:flex" : ""}`}>
              {activeConv ? (
                <>
                  <div className="p-3 border-b border-border flex items-center gap-3">
                    <button onClick={() => navigate("/messages")} className="md:hidden p-1 -ml-1">
                      <ArrowLeft size={18} />
                    </button>
                    <span className="text-2xl">{activeConv.listing?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{activeConv.other_profile?.display_name || "Farmer"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Package size={11} /> {activeConv.listing?.product} • {activeConv.listing?.price}
                      </p>
                    </div>
                  </div>

                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
                    {messages.map((m) => {
                      const mine = m.sender_id === user?.id;
                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                            mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                          }`}>
                            {m.content}
                            <p className={`text-[10px] mt-0.5 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="p-3 border-t border-border flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                    />
                    <Button onClick={send} disabled={sending || !text.trim()} className="gradient-earth text-primary-foreground border-0">
                      {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle size={40} className="mx-auto mb-2 opacity-40" />
                    Select a conversation
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;