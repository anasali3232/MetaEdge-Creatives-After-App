import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Briefcase,
  TicketCheck,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Plus,
  ArrowLeft,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Camera,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useClientAuth } from "@/hooks/use-client-auth";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/logo-metaedge.webp";

type Section = "dashboard" | "services" | "tickets" | "profile";

interface Service {
  id: number;
  name: string;
  notes?: string;
  status: string;
  assignedDate: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  message: string;
  imageUrl?: string | null;
  senderType: string;
  senderName: string;
  createdAt: string;
}

const NAV_ITEMS = [
  { key: "dashboard" as Section, label: "Dashboard", icon: LayoutDashboard },
  { key: "services" as Section, label: "My Services", icon: Briefcase },
  { key: "tickets" as Section, label: "Support Tickets", icon: TicketCheck },
  { key: "profile" as Section, label: "Profile", icon: User },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getServiceStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return <Badge className="bg-green-500 text-white border-0">Active</Badge>;
    case "completed":
      return <Badge className="bg-blue-500 text-white border-0">Completed</Badge>;
    case "paused":
      return <Badge className="bg-yellow-500 text-white border-0">Paused</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getTicketStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "open":
      return <Badge className="bg-blue-500 text-white border-0">Open</Badge>;
    case "in_progress":
      return <Badge className="bg-yellow-500 text-white border-0">In Progress</Badge>;
    case "resolved":
      return <Badge className="bg-green-500 text-white border-0">Resolved</Badge>;
    case "closed":
      return <Badge className="bg-gray-400 text-white border-0">Closed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ClientDashboard() {
  const { token, user, isLoading: authLoading, logout } = useClientAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [newTicketSending, setNewTicketSending] = useState(false);
  const [newTicketImage, setNewTicketImage] = useState<File | null>(null);
  const [newTicketImagePreview, setNewTicketImagePreview] = useState<string | null>(null);
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
  const newTicketImageRef = useRef<HTMLInputElement>(null);
  const replyImageRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    company: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) {
      navigate("/client/login");
    }
  }, [authLoading, token, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
        company: user.company || "",
      });
    }
  }, [user]);

  const uploadImage = async (file: File): Promise<string> => {
    const res = await fetch("/api/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to get upload URL");
    }
    const { uploadURL, objectPath } = await res.json();
    const putRes = await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!putRes.ok) throw new Error("Failed to upload image");
    return objectPath;
  };

  const handleImageSelect = (
    file: File | undefined,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 10MB", variant: "destructive" });
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const fetchServices = useCallback(async () => {
    if (!token) return;
    setServicesLoading(true);
    try {
      const res = await fetch("/api/client/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch {
      // silently fail
    } finally {
      setServicesLoading(false);
    }
  }, [token]);

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setTicketsLoading(true);
    try {
      const res = await fetch("/api/client/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch {
      // silently fail
    } finally {
      setTicketsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchServices();
      fetchTickets();
    }
  }, [token, fetchServices, fetchTickets]);

  const fetchTicketDetail = async (ticketId: string) => {
    if (!token) return;
    setTicketDetailLoading(true);
    try {
      const res = await fetch(`/api/client/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load ticket details", variant: "destructive" });
    } finally {
      setTicketDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTicket || !token) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/client/tickets/${selectedTicket.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedTicket(data);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id, token]);

  const handleCreateTicket = async () => {
    if (!token || !newTicketSubject.trim() || !newTicketMessage.trim()) return;
    setNewTicketSending(true);
    try {
      let imageUrl: string | undefined;
      if (newTicketImage) {
        try {
          imageUrl = await uploadImage(newTicketImage);
        } catch {
          toast({ title: "Image upload failed", description: "Query will be submitted without the image", variant: "destructive" });
        }
      }
      const res = await fetch("/api/client/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject: newTicketSubject, message: newTicketMessage, imageUrl }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Your query has been submitted" });
        setNewTicketOpen(false);
        setNewTicketSubject("");
        setNewTicketMessage("");
        setNewTicketImage(null);
        setNewTicketImagePreview(null);
        fetchTickets();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to create ticket", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to submit query", variant: "destructive" });
    } finally {
      setNewTicketSending(false);
    }
  };

  const handleReply = async () => {
    if (!token || !selectedTicket || (!replyText.trim() && !replyImage)) return;
    setReplySending(true);
    try {
      let imageUrl: string | undefined;
      if (replyImage) {
        try {
          imageUrl = await uploadImage(replyImage);
        } catch {
          toast({ title: "Image upload failed", description: "Reply will be sent without the image", variant: "destructive" });
        }
      }
      const res = await fetch(`/api/client/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyText, imageUrl }),
      });
      if (res.ok) {
        setReplyText("");
        setReplyImage(null);
        setReplyImagePreview(null);
        fetchTicketDetail(selectedTicket.id);
        toast({ title: "Reply sent" });
      } else {
        toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
    } finally {
      setReplySending(false);
    }
  };

  const handleProfileSave = async () => {
    if (!token) return;
    setProfileSaving(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileForm.name,
          bio: profileForm.bio,
          phone: profileForm.phone,
          company: profileForm.company,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem("client_user", JSON.stringify(updated));
        toast({ title: "Profile updated successfully" });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to update profile", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarUploading(true);
    try {
      const presignRes = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await presignRes.json();
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload");
      const profileRes = await fetch("/api/client/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarUrl: objectPath }),
      });
      if (profileRes.ok) {
        const updated = await profileRes.json();
        localStorage.setItem("client_user", JSON.stringify(updated));
        toast({ title: "Avatar updated" });
        window.location.reload();
      }
    } catch {
      toast({ title: "Error", description: "Failed to upload avatar", variant: "destructive" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/client/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
      </div>
    );
  }

  if (!token || !user) return null;

  const activeServices = services.filter((s) => s.status?.toLowerCase() === "active");
  const openTickets = tickets.filter((t) => t.status?.toLowerCase() === "open" || t.status?.toLowerCase() === "in_progress");

  const renderDashboard = () => (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(" ")[0]}!</h2>
        <p className="text-gray-500 mt-1">Here's an overview of your account</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900">{services.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Services</p>
                  <p className="text-3xl font-bold text-gray-900">{activeServices.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{openTickets.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Services</CardTitle>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No services assigned yet</p>
              ) : (
                <div className="space-y-3">
                  {services.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(s.assignedDate)}</p>
                      </div>
                      {getServiceStatusBadge(s.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No support tickets yet</p>
              ) : (
                <div className="space-y-3">
                  {tickets.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => { setSelectedTicket(t); fetchTicketDetail(t.id); setActiveSection("tickets"); }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">{t.subject}</p>
                        <p className="text-xs text-gray-400">{t.ticketNumber} · {formatDate(t.createdAt)}</p>
                      </div>
                      {getTicketStatusBadge(t.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-wrap gap-3">
        <Button
          onClick={() => { setNewTicketOpen(true); }}
          className="bg-[#C41E3A] hover:bg-[#A3182F]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Submit a Query
        </Button>
        <Button variant="outline" onClick={() => setActiveSection("services")}>
          View All Services
        </Button>
      </motion.div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
        <p className="text-gray-500 mt-1">All services assigned to your account</p>
      </motion.div>

      {servicesLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#C41E3A]" />
        </div>
      ) : services.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-1">No services yet</h3>
            <p className="text-sm text-gray-400">Services assigned to you will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-0 shadow-sm h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {getServiceStatusBadge(service.status)}
                  </div>
                  {service.notes && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{service.notes}</p>
                  )}
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    Assigned {formatDate(service.assignedDate)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTicketDetail = () => {
    if (!selectedTicket) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{selectedTicket.subject}</h3>
            <p className="text-xs text-gray-400">{selectedTicket.ticketNumber}</p>
          </div>
          {getTicketStatusBadge(selectedTicket.status)}
        </div>

        {ticketDetailLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#C41E3A]" />
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
            {(selectedTicket.messages || []).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderType === "client" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    msg.senderType === "client"
                      ? "bg-[#C41E3A] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-xs font-medium mb-1 opacity-75">{msg.senderType === "admin" ? "MetaEdge Creatives Support" : msg.senderName}</p>
                  {msg.imageUrl && (
                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
                      <img src={msg.imageUrl} alt="Attached" className="max-w-full max-h-[200px] rounded-lg object-contain cursor-pointer hover:opacity-90 transition-opacity" />
                    </a>
                  )}
                  {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                  <p className="text-[10px] mt-1 opacity-50">{formatDate(msg.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTicket.status !== "closed" && (
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
                onChange={(e) => handleImageSelect(e.target.files?.[0], setReplyImage, setReplyImagePreview)}
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
                className="flex-1 min-h-[60px]"
              />
              <Button
                onClick={handleReply}
                disabled={replySending || (!replyText.trim() && !replyImage)}
                className="bg-[#C41E3A] hover:bg-[#A3182F] self-end"
              >
                {replySending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTickets = () => (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-gray-500 mt-1">Manage your support queries</p>
        </div>
        <Button onClick={() => setNewTicketOpen(true)} className="bg-[#C41E3A] hover:bg-[#A3182F]">
          <Plus className="w-4 h-4 mr-2" />
          New Query
        </Button>
      </motion.div>

      {selectedTicket ? (
        renderTicketDetail()
      ) : ticketsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#C41E3A]" />
        </div>
      ) : tickets.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <TicketCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-1">No tickets yet</h3>
            <p className="text-sm text-gray-400">Submit a query and it will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedTicket(ticket);
                  fetchTicketDetail(ticket.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
                        {getTicketStatusBadge(ticket.status)}
                      </div>
                      <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400 shrink-0">
                      <p>Created {formatDate(ticket.createdAt)}</p>
                      <p>Updated {formatDate(ticket.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="text-xl bg-[#C41E3A] text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                  {avatarUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  ) : (
                    <Camera className="w-4 h-4 text-gray-500" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profileForm.email} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profileForm.company}
                  onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="bg-[#C41E3A] hover:bg-[#A3182F]"
              >
                {profileSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "services":
        return renderServices();
      case "tickets":
        return renderTickets();
      case "profile":
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-40">
        <div className="p-5 border-b border-gray-100">
          <img src={logoImage} alt="MetaEdge" className="h-12 object-contain" />
        </div>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
              <AvatarFallback className="text-xs bg-[#C41E3A] text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setSelectedTicket(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.key
                  ? "bg-[#C41E3A]/10 text-[#C41E3A]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Visit Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 lg:hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <img src={logoImage} alt="MetaEdge" className="h-8 object-contain" />
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                    <AvatarFallback className="text-xs bg-[#C41E3A] text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveSection(item.key);
                      setSelectedTicket(null);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.key
                        ? "bg-[#C41E3A]/10 text-[#C41E3A]"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="p-3 border-t border-gray-100 space-y-1">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Visit Site
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 lg:hidden flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <img src={logoImage} alt="MetaEdge" className="h-7 object-contain" />
          <Avatar className="w-8 h-8" onClick={() => setActiveSection("profile")}>
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback className="text-xs bg-[#C41E3A] text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection + (selectedTicket?.id || "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Dialog open={newTicketOpen} onOpenChange={(open) => {
        setNewTicketOpen(open);
        if (!open) { setNewTicketImage(null); setNewTicketImagePreview(null); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit a Query</DialogTitle>
            <DialogDescription>Describe your issue or question and our team will get back to you.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Brief description of your query"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-message">Message</Label>
              <Textarea
                id="ticket-message"
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                placeholder="Provide details about your query..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Attach Image (optional)</Label>
              <input
                ref={newTicketImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files?.[0], setNewTicketImage, setNewTicketImagePreview)}
              />
              {newTicketImagePreview ? (
                <div className="relative inline-block">
                  <img src={newTicketImagePreview} alt="Preview" className="max-h-[120px] rounded-lg border" />
                  <button
                    onClick={() => { setNewTicketImage(null); setNewTicketImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => newTicketImageRef.current?.click()}
                  className="gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  Choose Image
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={newTicketSending || !newTicketSubject.trim() || !newTicketMessage.trim()}
              className="bg-[#C41E3A] hover:bg-[#A3182F]"
            >
              {newTicketSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}