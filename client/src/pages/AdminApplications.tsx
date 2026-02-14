import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import { Link } from "wouter";
import {
  ArrowLeft,
  FileText,
  Trash2,
  Loader2,
  ShieldX,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  User,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  XCircle,
  Star,
  Eye,
  Calendar,
  Send,
  X,
} from "lucide-react";

interface JobApplicationWithTitle {
  id: string;
  careerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  cvUrl: string | null;
  portfolioUrl: string | null;
  status: string;
  createdAt: string;
  careerTitle: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Clock },
  reviewed: { label: "Reviewed", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Eye },
  shortlisted: { label: "Shortlisted", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: Star },
  interview: { label: "Interview", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Calendar },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
};

function InterviewModal({ app, token, onClose }: { app: JobApplicationWithTitle; token: string; onClose: () => void }) {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/applications/${app.id}/interview-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date, time, location, message: message.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({ title: "Interview email sent successfully!" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Schedule Interview</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {app.firstName} {app.lastName} — {app.careerTitle}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <p className="text-xs text-purple-700">
              An interview invitation email will be sent to <strong>{app.email}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Time *</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location / Meeting Link *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Office address, Google Meet link, Zoom link..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any additional instructions or notes for the candidate..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-5 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!date || !time || !location || sendMutation.isPending}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Interview Email
          </Button>
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ app, token }: { app: JobApplicationWithTitle; token: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const { toast } = useToast();

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/admin/applications/${app.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({ title: "Status updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/applications/${app.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({ title: "Application deleted" });
    },
  });

  const cfg = statusConfig[app.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div
          className="p-5 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-base">
                  {app.firstName} {app.lastName}
                </h3>
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${cfg.color} ${cfg.bg}`}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-primary font-medium mb-1">{app.careerTitle}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {app.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {app.phone}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">
                {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Address</p>
                  <p className="text-sm">{app.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Full Name</p>
                  <p className="text-sm">{app.firstName} {app.lastName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {app.cvUrl && (
                <a
                  href={app.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </a>
              )}
              {app.portfolioUrl && (() => {
                let portfolioLink: string | null = null;
                let portfolioFile: string | null = null;
                try {
                  const parsed = JSON.parse(app.portfolioUrl);
                  portfolioLink = parsed.link || null;
                  portfolioFile = parsed.file || null;
                } catch {
                  if (app.portfolioUrl.startsWith("/objects/")) {
                    portfolioFile = app.portfolioUrl;
                  } else {
                    portfolioLink = app.portfolioUrl;
                  }
                }
                return (
                  <>
                    {portfolioLink && (
                      <a
                        href={portfolioLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Portfolio Link
                      </a>
                    )}
                    {portfolioFile && (
                      <a
                        href={portfolioFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Portfolio File
                      </a>
                    )}
                  </>
                );
              })()}
              {!app.cvUrl && !app.portfolioUrl && (
                <p className="text-sm text-muted-foreground italic">No CV or portfolio attached</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-50 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground mr-1">Set Status:</span>
              {["pending", "reviewed", "shortlisted", "rejected"].map((s) => {
                const sc = statusConfig[s];
                return (
                  <button
                    key={s}
                    onClick={() => statusMutation.mutate(s)}
                    disabled={app.status === s || statusMutation.isPending}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                      app.status === s ? `${sc.bg} ${sc.color}` : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    {sc.label}
                  </button>
                );
              })}
              <button
                onClick={() => setShowInterviewModal(true)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1 ${
                  app.status === "interview"
                    ? "bg-purple-50 border-purple-200 text-purple-700"
                    : "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200"
                }`}
              >
                <Calendar className="w-3 h-3" />
                Interview
              </button>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm("Delete this application?")) {
                    deleteMutation.mutate();
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {showInterviewModal && (
        <InterviewModal app={app} token={token} onClose={() => setShowInterviewModal(false)} />
      )}
    </>
  );
}

export default function AdminApplications() {
  const { token, user, isLoading: authLoading, login, logout, hasPermission } = useAdminAuth();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: applications = [], isLoading } = useQuery<JobApplicationWithTitle[]>({
    queryKey: ["/api/admin/applications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!token,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={login} />;
  }

  if (!hasPermission("applications")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <ShieldX className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You do not have permission to view job applications.</p>
          <Button variant="outline" onClick={logout}>Sign Out</Button>
        </div>
      </div>
    );
  }

  const filtered = statusFilter === "all"
    ? applications
    : applications.filter((a) => a.status === statusFilter);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    interview: applications.filter((a) => a.status === "interview").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="p-2 rounded-xl bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">Job Applications</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {(["all", "pending", "reviewed", "shortlisted", "interview", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-muted-foreground hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <FileText className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No applications found</h3>
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "No job applications have been submitted yet."
                : `No applications with "${statusFilter}" status.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => (
              <ApplicationCard key={app.id} app={app} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
