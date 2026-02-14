import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface NotificationCounts {
  unreadMessages: number;
  openTickets: number;
  newTicketMessages: number;
  activeChatSessions: number;
}

const POLL_INTERVAL = 15000;

let audioCtx: AudioContext | null = null;
function playNotificationSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {}
}

export function useAdminNotifications(token: string | null) {
  const [counts, setCounts] = useState<NotificationCounts>({
    unreadMessages: 0,
    openTickets: 0,
    newTicketMessages: 0,
    activeChatSessions: 0,
  });
  const prevCountsRef = useRef<NotificationCounts | null>(null);
  const { toast } = useToast();
  const initialLoadRef = useRef(true);

  const totalAlerts = counts.unreadMessages + counts.openTickets + counts.newTicketMessages + counts.activeChatSessions;

  const fetchCounts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: NotificationCounts = await res.json();
        setCounts(data);

        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          prevCountsRef.current = data;
          return;
        }

        const prev = prevCountsRef.current;
        if (prev) {
          if (data.unreadMessages > prev.unreadMessages) {
            playNotificationSound();
            toast({
              title: "New Contact Message",
              description: "A new contact form submission has arrived",
            });
          }
          if (data.openTickets > prev.openTickets) {
            playNotificationSound();
            toast({
              title: "New Support Ticket",
              description: "A client has opened a new support ticket",
            });
          }
          if (data.newTicketMessages > prev.newTicketMessages) {
            playNotificationSound();
            toast({
              title: "New Ticket Reply",
              description: "A client has replied to a support ticket",
            });
          }
          if (data.activeChatSessions > prev.activeChatSessions) {
            playNotificationSound();
            toast({
              title: "New Live Chat",
              description: "A visitor has started a live chat session",
            });
          }
        }
        prevCountsRef.current = data;
      }
    } catch {}
  }, [token, toast]);

  useEffect(() => {
    if (!token) return;
    initialLoadRef.current = true;
    prevCountsRef.current = null;
    fetchCounts();
    const interval = setInterval(fetchCounts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [token, fetchCounts]);

  return { counts, totalAlerts, refetch: fetchCounts };
}
