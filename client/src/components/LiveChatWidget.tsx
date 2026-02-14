import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, MinusCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  sessionId: string;
  senderType: string;
  senderName: string | null;
  message: string;
  createdAt: string;
}

interface LiveChatWidgetProps {
  clientName?: string;
  clientEmail?: string;
}

function getVisitorId(): string {
  let id = localStorage.getItem("chat_visitor_id");
  if (!id) {
    id = "v_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem("chat_visitor_id", id);
  }
  return id;
}

export default function LiveChatWidget({ clientName, clientEmail }: LiveChatWidgetProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const connectWs = useCallback(() => {
    const visitorId = getVisitorId();
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat?type=visitor&visitorId=${visitorId}&sessionId=${sessionId || ""}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({
        type: "visitor_start",
        visitorId,
        visitorName: clientName || "Visitor",
        visitorEmail: clientEmail || undefined,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "session_started":
          setSessionId(data.session.id);
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
          scrollToBottom();
          break;

        case "message_sent":
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            const tempIdx = prev.findIndex((m) => m.id.startsWith("temp_") && m.message === data.message.message && m.senderType === data.message.senderType);
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = data.message;
              return updated;
            }
            return [...prev, data.message];
          });
          scrollToBottom();
          break;

        case "new_message":
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
          if (!isOpen) setHasUnread(true);
          scrollToBottom();
          break;

        case "session_closed":
          setSessionId(null);
          setMessages([]);
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      reconnectTimeout.current = setTimeout(() => {
        if (isOpen) connectWs();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [sessionId, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !wsRef.current) {
      connectWs();
    }
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [isOpen, connectWs]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const msgText = inputValue.trim();
    const tempId = "temp_" + Date.now();
    setMessages((prev) => [...prev, {
      id: tempId,
      sessionId: sessionId || "",
      senderType: "visitor",
      senderName: clientName || "Visitor",
      message: msgText,
      createdAt: new Date().toISOString(),
    }]);
    scrollToBottom();

    wsRef.current.send(JSON.stringify({
      type: "visitor_message",
      visitorName: clientName || "Visitor",
      message: msgText,
    }));
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setIsOpen(false);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[101] w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: "480px", maxHeight: "calc(100vh - 160px)" }}
          >
            <div className="bg-[#C41E3A] text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">MetaEdge Support</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-gray-400"}`} />
                    <span className="text-xs text-white/80">{isConnected ? "Online" : "Connecting..."}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div className="w-16 h-16 bg-[#C41E3A]/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-[#C41E3A]" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Welcome to MetaEdge!</h4>
                  <p className="text-sm text-gray-500">Type a message to start chatting with our support team.</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === "visitor" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.senderType === "visitor"
                        ? "bg-[#C41E3A] text-white rounded-br-md"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                    }`}
                  >
                    {msg.senderType === "admin" && (
                      <p className="text-[10px] font-medium text-[#C41E3A] mb-0.5">{msg.senderName || "Support"}</p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.senderType === "visitor" ? "text-white/60" : "text-gray-400"}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#C41E3A]/30 transition-shadow"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || !isConnected}
                  className="w-10 h-10 bg-[#C41E3A] text-white rounded-full flex items-center justify-center hover:bg-[#A01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[100] flex items-center justify-center w-14 h-14 bg-[#C41E3A] text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ y: -3 }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-white text-[#C41E3A] text-[10px] font-bold items-center justify-center">!</span>
          </span>
        )}
      </motion.button>
    </>
  );
}
