import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Mail, Trash2, Newspaper, Clock, ShieldX, LogOut, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import AnimatedCounter from "@/components/AnimatedCounter";
import type { NewsletterSubscriber } from "@shared/schema";

function NewsletterManager({ token }: { token: string }) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: subscribers = [], isLoading } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/admin/newsletter"],
    queryFn: async () => {
      const res = await fetch("/api/admin/newsletter", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast({ title: "Subscriber removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
    },
    onError: () => {
      toast({ title: "Failed to remove subscriber", variant: "destructive" });
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

  const exportCSV = () => {
    const csv = ["Email,Subscribed Date"];
    subscribers.forEach((s) => {
      csv.push(`${s.email},${formatDate(s.subscribedAt)}`);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported successfully" });
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-lg font-bold text-foreground" data-testid="heading-newsletter-management">Newsletter Subscribers</h1>
              <p className="text-xs text-muted-foreground">
                <AnimatedCounter value={subscribers.length} duration={1000} /> subscriber{subscribers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {subscribers.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportCSV} data-testid="button-export-csv">
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {subscribers.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  data-testid="input-search-subscribers"
                />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : subscribers.length === 0 ? (
            <Card className="p-12 text-center">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No subscribers yet</h3>
              <p className="text-muted-foreground text-sm">Newsletter subscribers will appear here when users sign up from the website footer.</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No results</h3>
              <p className="text-muted-foreground text-sm">No subscribers match your search.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((subscriber, index) => (
                <motion.div
                  key={subscriber.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <a
                            href={`mailto:${subscriber.email}`}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                            data-testid={`text-subscriber-email-${subscriber.id}`}
                          >
                            {subscriber.email}
                          </a>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDate(subscriber.subscribedAt)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (confirm("Remove this subscriber?")) {
                            deleteMutation.mutate(subscriber.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-subscriber-${subscriber.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminNewsletter() {
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

  if (!hasPermission("settings")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <ShieldX className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2" data-testid="heading-access-denied">Access Denied</h1>
          <p className="text-muted-foreground text-sm mb-6">You do not have permission to manage newsletter subscribers.</p>
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

  return <NewsletterManager token={token} />;
}
