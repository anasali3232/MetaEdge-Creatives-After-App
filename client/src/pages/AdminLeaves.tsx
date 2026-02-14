import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, Check, X, Clock, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";

interface LeaveRequest {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  employeeName: string;
  employeeEmail: string;
}

function LeaveManagement({ token }: { token: string }) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/admin/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, [token]);

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/leaves/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLeaves();
      }
    } catch {}
    setUpdating(null);
  };

  const filtered = filter === "all" ? leaves : leaves.filter(l => l.status === filter);
  const pendingCount = leaves.filter(l => l.status === "pending").length;

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const typeLabels: Record<string, string> = {
    annual: "Annual Leave",
    sick: "Sick Leave",
    personal: "Personal Leave",
    unpaid: "Unpaid Leave",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back-admin">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="heading-admin-leaves">Leave Management</h1>
              <p className="text-xs text-muted-foreground">
                {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? "s" : ""}` : "All caught up"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              data-testid={`button-filter-${f}`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded text-xs">{pendingCount}</span>
              )}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No leave requests found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((leave, index) => (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground" data-testid={`text-employee-${leave.id}`}>
                          {leave.employeeName}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[leave.status] || "bg-gray-100 text-gray-800"}`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{leave.employeeEmail}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {leave.startDate} to {leave.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {typeLabels[leave.type] || leave.type}
                        </span>
                      </div>
                      <p className="text-sm text-foreground bg-gray-50 rounded-md p-3 mt-2">{leave.reason}</p>
                      {leave.reviewedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed on {new Date(leave.reviewedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {leave.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(leave.id, "approved")}
                          disabled={updating === leave.id}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`button-approve-${leave.id}`}
                        >
                          {updating === leave.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(leave.id, "rejected")}
                          disabled={updating === leave.id}
                          className="border-red-200 text-red-600"
                          data-testid={`button-reject-${leave.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminLeaves() {
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

  if (!hasPermission("team")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">You don't have permission to view this page.</p>
          <Link href="/admin">
            <Button data-testid="button-back-dashboard">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <LeaveManagement token={token} />;
}
