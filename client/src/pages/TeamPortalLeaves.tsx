import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  CalendarDays,
  StickyNote,
  Users,
  UserPlus,
  LogOut,
  Calendar,
  FileText,
  Plus,
  Check,
  X,
  Loader2,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamAuth } from "@/hooks/use-team-auth";

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/team-portal/dashboard", fullAccessOnly: false },
  { label: "Tasks", icon: CheckSquare, path: "/team-portal/tasks", fullAccessOnly: false },
  { label: "My Time", icon: Clock, path: "/team-portal/timesheet", fullAccessOnly: false },
  { label: "Leaves", icon: CalendarDays, path: "/team-portal/leaves", fullAccessOnly: false },
  { label: "Notes", icon: StickyNote, path: "/team-portal/notes", fullAccessOnly: false },
  { label: "Employees", icon: Users, path: "/team-portal/employees", fullAccessOnly: true },
  { label: "Teams", icon: UserPlus, path: "/team-portal/teams", fullAccessOnly: true },
];

const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Vacation", "Personal", "Other"];

export default function TeamPortalLeaves() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [formType, setFormType] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formReason, setFormReason] = useState("");

  const fetchLeaves = useCallback(() => {
    if (!token) return;
    setLoadingLeaves(true);
    fetch("/api/team-portal/leaves", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setLeaves(Array.isArray(data) ? data : []))
      .catch(() => setLeaves([]))
      .finally(() => setLoadingLeaves(false));
  }, [token]);

  const fetchEmployees = useCallback(() => {
    if (!token || !isFullAccess) return;
    fetch("/api/team-portal/employees", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token, isFullAccess]);

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, [fetchLeaves, fetchEmployees]);

  const handleApply = async () => {
    if (!token || !formType || !formStartDate || !formEndDate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/team-portal/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formType,
          startDate: formStartDate,
          endDate: formEndDate,
          reason: formReason,
        }),
      });
      if (res.ok) {
        setDialogOpen(false);
        setFormType("");
        setFormStartDate("");
        setFormEndDate("");
        setFormReason("");
        fetchLeaves();
      }
    } catch {}
    setSubmitting(false);
  };

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    if (!token) return;
    try {
      await fetch(`/api/team-portal/leaves/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchLeaves();
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
      </div>
    );
  }

  if (!token || !user) {
    setLocation("/team-portal/login");
    return null;
  }

  const visibleNav = NAV_ITEMS.filter((item) => !item.fullAccessOnly || isFullAccess);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.name || employeeId;
  };

  const myLeaves = leaves
    .filter((l) => l.employeeId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const allLeaves = leaves
    .filter((l) => statusFilter === "all" || l.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#C41E3A]">Team Portal</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleNav.map((item) => {
            const isActive = item.path === "/team-portal/leaves";
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#C41E3A]/10 text-[#C41E3A]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-gray-600 hover:text-[#C41E3A]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 md:ml-56">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-lg font-semibold text-gray-900 md:hidden">Team Portal</h2>
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block">Leaves</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#C41E3A]/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#C41E3A] text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="md:hidden text-gray-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-1">
            {visibleNav.map((item) => {
              const isActive = item.path === "/team-portal/leaves";
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    setLocation(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#C41E3A]/10 text-[#C41E3A]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        <main className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex items-center justify-between"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Leave Management</h3>
              <p className="text-sm text-gray-500 mt-1">Apply and track your leave requests</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#C41E3A] hover:bg-[#A3182F] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Leave Type</label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAVE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                    <Input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                    <Input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Reason</label>
                    <Textarea
                      value={formReason}
                      onChange={(e) => setFormReason(e.target.value)}
                      placeholder="Enter reason for leave..."
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleApply}
                    disabled={submitting || !formType || !formStartDate || !formEndDate}
                    className="w-full bg-[#C41E3A] hover:bg-[#A3182F] text-white"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {isFullAccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="mb-4 flex flex-wrap items-center gap-2"
            >
              <Button
                variant={!showAllRequests ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllRequests(false)}
                className={!showAllRequests ? "bg-[#C41E3A] hover:bg-[#A3182F] text-white" : ""}
              >
                <FileText className="w-4 h-4 mr-1" />
                My Requests
              </Button>
              <Button
                variant={showAllRequests ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllRequests(true)}
                className={showAllRequests ? "bg-[#C41E3A] hover:bg-[#A3182F] text-white" : ""}
              >
                <Calendar className="w-4 h-4 mr-1" />
                All Requests
              </Button>
              {showAllRequests && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#C41E3A]" />
                  {showAllRequests && isFullAccess ? "All Leave Requests" : "My Leave Requests"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingLeaves ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#C41E3A]" />
                  </div>
                ) : (showAllRequests && isFullAccess ? allLeaves : myLeaves).length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>No leave requests found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {showAllRequests && isFullAccess && (
                            <th className="text-left py-3 px-2 font-medium text-gray-500">Employee</th>
                          )}
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Type</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Start Date</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">End Date</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Reason</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Applied On</th>
                          {showAllRequests && isFullAccess && (
                            <th className="text-left py-3 px-2 font-medium text-gray-500">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllRequests && isFullAccess ? allLeaves : myLeaves).map((leave) => (
                          <tr key={leave.id} className="border-b border-gray-100 hover:bg-gray-50">
                            {showAllRequests && isFullAccess && (
                              <td className="py-3 px-2 text-gray-900 font-medium">
                                {leave.employeeName || getEmployeeName(leave.employeeId)}
                              </td>
                            )}
                            <td className="py-3 px-2 text-gray-900">{leave.type}</td>
                            <td className="py-3 px-2 text-gray-600">
                              {new Date(leave.startDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2 text-gray-600">
                              {new Date(leave.endDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2 text-gray-600 max-w-[200px] truncate">
                              {leave.reason || "—"}
                            </td>
                            <td className="py-3 px-2">{statusBadge(leave.status)}</td>
                            <td className="py-3 px-2 text-gray-600">
                              {new Date(leave.createdAt).toLocaleDateString()}
                            </td>
                            {showAllRequests && isFullAccess && (
                              <td className="py-3 px-2">
                                {leave.status === "pending" ? (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleUpdateStatus(leave.id, "approved")}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleUpdateStatus(leave.id, "rejected")}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {visibleNav.slice(0, 5).map((item) => {
            const isActive = item.path === "/team-portal/leaves";
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium ${
                  isActive ? "text-[#C41E3A]" : "text-gray-400"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}