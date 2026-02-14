import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, LogOut, Loader2, MessageSquare, Clock, Send, ShieldX, User, ChevronLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import logoImage from "@/assets/logo-metaedge.webp";

interface Ticket {
  id: string;
  ticketNumber: string;
  clientName: string;
  clientEmail: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: string;
  senderType: string;
  senderName: string;
  message: string;
  imageUrl?: string | null;
  createdAt: string;
}

interface TicketDetail extends Ticket {
  messages: TicketMessage[];
}

const STATUS_TABS = ["all", "open", "in_progress", "resolved", "closed"];
const STATUS_LABELS: Record<string, string> = {
  all: "All",
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function TicketDetailView({ ticketId, token, onBack }: { ticketId: string; token: string; onBack: () => void }) {
  const { toast } = useToast();
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
  const replyImageRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const res = await fetch("/api/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }),
    });
    if (!res.ok) throw new Error("Failed to get upload URL");
    const { uploadURL, objectPath } = await res.json();
    const putRes = await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!putRes.ok) throw new Error("Failed to upload image");
    return objectPath;
  };

  const handleImageSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 10MB", variant: "destructive" });
      return;
    }
    setReplyImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setReplyImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const { data: ticket, isLoading } = useQuery<TicketDetail>({
    queryKey: [`/api/admin/tickets/${ticketId}`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch ticket");
      return res.json();
    },
    refetchInterval: 3000,
  });

  const sendReplyMutation = useMutation({
    mutationFn: async () => {
      let imageUrl: string | undefined;
      if (replyImage) {
        try {
          imageUrl = await uploadImage(replyImage);
        } catch {
          toast({ title: "Image upload failed", description: "Reply will be sent without image", variant: "destructive" });
        }
      }
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: replyText, imageUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reply");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Reply sent" });
      setReplyText("");
      setReplyImage(null);
      setReplyImagePreview(null);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tickets/${ticketId}`] });
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to change status");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tickets/${ticketId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const formatDate = (date: string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading || !ticket) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Tickets
      </Button>

      <Card className="p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3 className="text-lg font-bold text-foreground">{ticket.ticketNumber}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                {STATUS_LABELS[ticket.status] || ticket.status}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <h4 className="font-medium text-foreground mb-1">{ticket.subject}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{ticket.clientName} ({ticket.clientEmail})</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={newStatus || ticket.status} onValueChange={(val) => { setNewStatus(val); changeStatusMutation.mutate(val); }}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-4">
        <h4 className="font-semibold text-foreground mb-4">Messages</h4>
        <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderType === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-lg p-3 ${msg.senderType === "admin" ? "bg-primary/10 text-foreground" : "bg-gray-100 text-foreground"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{msg.senderName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</span>
                  </div>
                  {msg.imageUrl && (
                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
                      <img src={msg.imageUrl} alt="Attached" className="max-w-full max-h-[200px] rounded-lg object-contain cursor-pointer hover:opacity-90 transition-opacity" />
                    </a>
                  )}
                  {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
          )}
        </div>

        <div className="space-y-2">
          {replyImagePreview && (
            <div className="relative inline-block">
              <img src={replyImagePreview} alt="Preview" className="max-h-[100px] rounded-lg border" />
              <button
                onClick={() => { setReplyImage(null); setReplyImagePreview(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={replyImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="self-end shrink-0"
              onClick={() => replyImageRef.current?.click()}
              title="Attach image"
            >
              <ImagePlus className="w-4 h-4" />
            </Button>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="flex-1"
            />
            <Button
              onClick={() => sendReplyMutation.mutate()}
              disabled={(!replyText.trim() && !replyImage) || sendReplyMutation.isPending}
              className="self-end"
            >
              <Send className="w-4 h-4 mr-1" />
              {sendReplyMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function TicketsManager({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/admin/tickets"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    },
  });

  const filteredTickets = statusFilter === "all" ? tickets : tickets.filter(t => t.status === statusFilter);

  const formatDate = (date: string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src={logoImage} alt="MetaEdge Creatives" className="h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Support Tickets</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-[#C41E3A] border-[#C41E3A]/30 hover:bg-[#C41E3A]/5">
                Visit Site
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {selectedTicketId ? (
            <TicketDetailView ticketId={selectedTicketId} token={token} onBack={() => setSelectedTicketId(null)} />
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Support Tickets</h2>
                <Badge variant="secondary" className="ml-2">{tickets.length} tickets</Badge>
              </div>

              <div className="flex gap-2 mb-6 flex-wrap">
                {STATUS_TABS.map((tab) => (
                  <Button
                    key={tab}
                    variant={statusFilter === tab ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(tab)}
                  >
                    {STATUS_LABELS[tab]}
                    {tab !== "all" && (
                      <span className="ml-1 text-xs">({tickets.filter(t => t.status === tab).length})</span>
                    )}
                  </Button>
                ))}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2">No tickets found</h3>
                  <p className="text-muted-foreground text-sm">
                    {statusFilter === "all" ? "Support tickets will appear here." : `No ${STATUS_LABELS[statusFilter].toLowerCase()} tickets.`}
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className="p-5 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedTicketId(ticket.id)}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <span className="font-mono text-sm font-bold text-primary">{ticket.ticketNumber}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                                {STATUS_LABELS[ticket.status] || ticket.status}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <p className="font-medium text-foreground mb-1">{ticket.subject}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{ticket.clientName}</span>
                              <span>{ticket.clientEmail}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(ticket.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminTickets() {
  const { token, user, isLoading, login, logout, hasPermission } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !user) {
    return <AdminLogin onLogin={login} />;
  }

  if (!hasPermission("tickets")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="p-8 text-center max-w-md">
          <ShieldX className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to view support tickets.</p>
          <Link href="/admin"><Button>Back to Dashboard</Button></Link>
        </Card>
      </div>
    );
  }

  return <TicketsManager token={token} onLogout={logout} />;
}
