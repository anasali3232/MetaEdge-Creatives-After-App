import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, Users, FileBarChart, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import AnimatedCounter from "@/components/AnimatedCounter";

interface ClockEntry {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut: string | null;
  totalMinutes: number | null;
  date: string;
  notes: string | null;
}

interface LeaveEntry {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface EmployeeReport {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  totalHoursWorked: number;
  totalDaysWorked: number;
  totalClockEntries: number;
  pendingLeaves: number;
  approvedLeaves: number;
  totalLeaves: number;
  clockEntries: ClockEntry[];
  leaves: LeaveEntry[];
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ReportsView({ token }: { token: string }) {
  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<"clock" | "leaves">("clock");

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/admin/employee-reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const handleFilter = () => {
    fetchReports();
  };

  const totalHours = reports.reduce((sum, r) => sum + r.totalHoursWorked, 0);
  const totalPendingLeaves = reports.reduce((sum, r) => sum + r.pendingLeaves, 0);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back-admin">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="heading-employee-reports">Employee Reports</h1>
              <p className="text-xs text-muted-foreground">{reports.length} employees</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-4 mb-6">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm"
                data-testid="input-start-date"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm"
                data-testid="input-end-date"
              />
            </div>
            <Button onClick={handleFilter} size="sm" data-testid="button-apply-filter">
              <Calendar className="w-4 h-4 mr-1" />
              Apply Filter
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-employees">
                  <AnimatedCounter value={reports.length} duration={800} />
                </p>
                <p className="text-xs text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-50">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-hours">
                  <AnimatedCounter value={Math.round(totalHours)} duration={800} />h
                </p>
                <p className="text-xs text-muted-foreground">Total Hours Worked</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50">
                <FileBarChart className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-pending-leaves">
                  <AnimatedCounter value={totalPendingLeaves} duration={800} />
                </p>
                <p className="text-xs text-muted-foreground">Pending Leave Requests</p>
              </div>
            </div>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="p-10 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No employees found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((emp, index) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Card className="overflow-visible">
                  <div
                    className="p-5 cursor-pointer hover-elevate"
                    onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                    data-testid={`card-employee-${emp.id}`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[180px]">
                        <p className="font-semibold text-foreground">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{emp.role} {emp.department ? `- ${emp.department}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm flex-wrap">
                        <div className="text-center">
                          <p className="font-bold text-foreground">{emp.totalHoursWorked}h</p>
                          <p className="text-xs text-muted-foreground">Hours</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground">{emp.totalDaysWorked}</p>
                          <p className="text-xs text-muted-foreground">Days</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground">{emp.approvedLeaves}</p>
                          <p className="text-xs text-muted-foreground">Leaves</p>
                        </div>
                        {emp.pendingLeaves > 0 && (
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                            {emp.pendingLeaves} pending
                          </span>
                        )}
                        {expandedId === emp.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedId === emp.id && (
                    <div className="border-t px-5 pb-5 pt-4">
                      <div className="flex gap-2 mb-4">
                        <Button
                          size="sm"
                          variant={expandedTab === "clock" ? "default" : "outline"}
                          onClick={() => setExpandedTab("clock")}
                          data-testid={`button-tab-clock-${emp.id}`}
                        >
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Time Entries ({emp.clockEntries.length})
                        </Button>
                        <Button
                          size="sm"
                          variant={expandedTab === "leaves" ? "default" : "outline"}
                          onClick={() => setExpandedTab("leaves")}
                          data-testid={`button-tab-leaves-${emp.id}`}
                        >
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Leaves ({emp.totalLeaves})
                        </Button>
                      </div>

                      {expandedTab === "clock" ? (
                        emp.clockEntries.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">No time entries in selected range</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b text-left">
                                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Date</th>
                                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Clock In</th>
                                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Clock Out</th>
                                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Duration</th>
                                  <th className="pb-2 font-medium text-muted-foreground">Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {emp.clockEntries.slice(0, 20).map(entry => (
                                  <tr key={entry.id} className="border-b last:border-0">
                                    <td className="py-2 pr-4 text-foreground">{entry.date}</td>
                                    <td className="py-2 pr-4 text-foreground">{formatTime(entry.clockIn)}</td>
                                    <td className="py-2 pr-4 text-foreground">{entry.clockOut ? formatTime(entry.clockOut) : "Active"}</td>
                                    <td className="py-2 pr-4 text-foreground">
                                      {entry.totalMinutes != null ? `${Math.floor(entry.totalMinutes / 60)}h ${entry.totalMinutes % 60}m` : "-"}
                                    </td>
                                    <td className="py-2 text-muted-foreground">{entry.notes || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {emp.clockEntries.length > 20 && (
                              <p className="text-xs text-muted-foreground mt-2 text-center">Showing 20 of {emp.clockEntries.length} entries</p>
                            )}
                          </div>
                        )
                      ) : (
                        emp.leaves.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">No leave requests</p>
                        ) : (
                          <div className="space-y-2">
                            {emp.leaves.map(leave => (
                              <div key={leave.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-md flex-wrap">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{leave.type} Leave</p>
                                  <p className="text-xs text-muted-foreground">{leave.startDate} to {leave.endDate}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{leave.reason}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[leave.status] || "bg-gray-100"}`}>
                                  {leave.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminEmployeeReports() {
  const { token, user, isLoading, login, hasPermission } = useAdminAuth();

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

  return <ReportsView token={token} />;
}
