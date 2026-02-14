import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  XCircle,
  Users,
  Clock,
  LogOut,
} from "lucide-react";
import logoImage from "@/assets/logo-metaedge.webp";

interface ChatSession {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: string;
  lastMessageAt: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  senderType: string;
  senderName: string | null;
  message: string;
  createdAt: string;
}

export default function AdminLiveChat() {
  const { user, token, login, logout, hasPermission } = useAdminAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [sending, setSending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!user) return <AdminLogin onLogin={login} />;
  if (!hasPermission("messages")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">You do not have permission to access live chat.</p>
      </div>
    );
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/chat/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/chat/sessions/${sessionId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const connectWs = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat?type=admin&token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "admin_join" }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "new_session":
          setSessions((prev) => {
            if (prev.some((s) => s.id === data.session.id)) return prev;
            return [data.session, ...prev];
          });
          break;

        case "new_message":
          if (data.message.senderType === "visitor") {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === data.sessionId
                  ? { ...s, lastMessageAt: data.message.createdAt }
                  : s
              ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
            );
          }
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            if (prev[0]?.sessionId !== data.sessionId) return prev;
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
          scrollToBottom();
          break;

        case "message_sent":
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
          scrollToBottom();
          break;

        case "session_closed":
          setSessions((prev) =>
            prev.map((s) =>
              s.id === data.sessionId ? { ...s, status: "closed" } : s
            )
          );
          break;
      }
    };

    ws.onclose = () => {
      reconnectTimeout.current = setTimeout(connectWs, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    fetchSessions();
    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [connectWs]);

  const handleSelectSession = (session: ChatSession) => {
    setSelectedSession(session);
    setMessages([]);
    loadMessages(session.id);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedSession || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    setSending(true);

    wsRef.current.send(JSON.stringify({
      type: "admin_message",
      sessionId: selectedSession.id,
      message: replyText.trim(),
    }));

    setReplyText("");
    setSending(false);
  };

  const handleCloseSession = async (sessionId: string) => {
    try {
      await fetch(`/api/admin/chat/sessions/${sessionId}/close`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: "closed" } : s))
      );
      if (selectedSession?.id === sessionId) {
        setSelectedSession((prev) => prev ? { ...prev, status: "closed" } : null);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "close_session", sessionId }));
      }
    } catch (err) {
      console.error("Failed to close session:", err);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter === "all") return true;
    return s.status === statusFilter;
  });

  const openCount = sessions.filter((s) => s.status === "open").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src={logoImage} alt="MetaEdge Creatives" className="h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">Live Chat</h1>
              <p className="text-xs text-muted-foreground">Manage visitor conversations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-[#C41E3A] border-[#C41E3A]/30 hover:bg-[#C41E3A]/5">
                Visit Site
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex-shrink-0 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-[#C41E3A] hover:bg-[#A01830]" : ""}
              >
                All ({sessions.length})
              </Button>
              <Button
                variant={statusFilter === "open" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("open")}
                className={statusFilter === "open" ? "bg-[#C41E3A] hover:bg-[#A01830]" : ""}
              >
                Open ({openCount})
              </Button>
              <Button
                variant={statusFilter === "closed" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("closed")}
                className={statusFilter === "closed" ? "bg-[#C41E3A] hover:bg-[#A01830]" : ""}
              >
                Closed
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredSessions.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No chat sessions yet</p>
                </div>
              )}
              {filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSession?.id === session.id
                      ? "ring-2 ring-[#C41E3A] bg-red-50/50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectSession(session)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          {(session.visitorName || "V")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {session.visitorName || "Anonymous Visitor"}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(session.lastMessageAt)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={session.status === "open" ? "default" : "secondary"}
                        className={`text-[10px] flex-shrink-0 ${
                          session.status === "open"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {session.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {!selectedSession ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a chat session from the left to start responding to visitors.
                </p>
              </div>
            ) : (
              <>
                <div className="px-5 py-3 bg-gray-50 border-b flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center font-semibold">
                      {(selectedSession.visitorName || "V")[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        {selectedSession.visitorName || "Anonymous Visitor"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Started {new Date(selectedSession.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedSession.status === "open" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCloseSession(selectedSession.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Close Chat
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.senderType === "admin" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            msg.senderType === "admin"
                              ? "bg-[#C41E3A] text-white rounded-br-md"
                              : "bg-gray-100 text-gray-800 rounded-bl-md"
                          }`}
                        >
                          <p className={`text-[10px] font-medium mb-0.5 ${
                            msg.senderType === "admin" ? "text-white/70" : "text-gray-500"
                          }`}>
                            {msg.senderType === "admin" ? "You" : msg.senderName || "Visitor"}
                          </p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${
                            msg.senderType === "admin" ? "text-white/50" : "text-gray-400"
                          }`}>
                            {formatMessageTime(msg.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {selectedSession.status === "open" && (
                  <div className="px-5 py-3 bg-gray-50 border-t flex-shrink-0">
                    <div className="flex items-end gap-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="min-h-[44px] max-h-[120px] resize-none rounded-xl"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sending}
                        className="bg-[#C41E3A] hover:bg-[#A01830] h-[44px] px-4 rounded-xl"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedSession.status === "closed" && (
                  <div className="px-5 py-3 bg-gray-100 border-t text-center">
                    <p className="text-sm text-muted-foreground">This chat session has been closed.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
