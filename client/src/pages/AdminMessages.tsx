import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Mail, Trash2, MessageSquare, Phone, Building2, User, Clock, ChevronDown, ChevronUp, ShieldX, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import type { ContactMessage } from "@shared/schema";

function MessageCard({ message, token, index }: { message: ContactMessage; token: string; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/contact-messages/${message.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast({ title: "Message deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
    },
    onError: () => {
      toast({ title: "Failed to delete message", variant: "destructive" });
    },
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-bold text-foreground" data-testid={`text-message-name-${message.id}`}>
                  {message.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(message.createdAt)}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
              <a href={`mailto:${message.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Mail className="w-3.5 h-3.5" />
                {message.email}
              </a>
              {message.phone && (
                <a href={`tel:${message.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  {message.phone}
                </a>
              )}
              {message.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {message.company}
                </span>
              )}
            </div>

            {message.subject && (
              <p className="text-sm font-medium text-foreground mb-1">
                {message.subject}
              </p>
            )}

            <p className={`text-sm text-muted-foreground ${expanded ? "" : "line-clamp-2"}`}>
              {message.message}
            </p>

            {message.message.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
                data-testid={`button-expand-message-${message.id}`}
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (confirm("Delete this message?")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            data-testid={`button-delete-message-${message.id}`}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function MessagesManager({ token }: { token: string }) {
  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contact-messages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/contact-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground" data-testid="heading-messages-management">Form Submissions</h1>
              <p className="text-xs text-muted-foreground">{messages.length} total message{messages.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : messages.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No messages yet</h3>
              <p className="text-muted-foreground text-sm">Contact form submissions will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageCard key={message.id} message={message} token={token} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminMessages() {
  const { token, user, isLoading, login, logout, hasPermission } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={login} />;
  }

  if (!hasPermission("messages")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <ShieldX className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2" data-testid="heading-access-denied">Access Denied</h1>
          <p className="text-muted-foreground text-sm mb-6">You do not have permission to view messages.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/admin">
              <Button variant="outline" data-testid="button-back-dashboard">Back to Dashboard</Button>
            </Link>
            <Button variant="ghost" onClick={logout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <MessagesManager token={token} />;
}
