import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2,
  Menu,
  X,
  BarChart3,
  FileText,
  Camera,
  Plus,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamAuth } from "@/hooks/use-team-auth";

interface Team {
  id: string;
  name: string;
}

interface MonthlyReport {
  id: string;
  employeeId: string;
  employeeName: string;
  teamId: string;
  teamName: string;
  month: string;
  summary: string;
  achievements?: string;
  challenges?: string;
  goalsNextMonth?: string;
  totalHours?: number;
  tasksCompleted?: number;
  createdAt: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/team-portal/dashboard", fullAccessOnly: false },
  { label: "Tasks", icon: CheckSquare, path: "/team-portal/tasks", fullAccessOnly: false },
  { label: "My Time", icon: Clock, path: "/team-portal/timesheet", fullAccessOnly: false },
  { label: "Leaves", icon: CalendarDays, path: "/team-portal/leaves", fullAccessOnly: false },
  { label: "Notes", icon: StickyNote, path: "/team-portal/notes", fullAccessOnly: false },
  { label: "Weekly Reports", icon: FileText, path: "/team-portal/weekly-reports", fullAccessOnly: false },
  { label: "Monthly Reports", icon: BarChart3, path: "/team-portal/monthly-reports", fullAccessOnly: false },
  { label: "Screenshots", icon: Camera, path: "/team-portal/screenshots", fullAccessOnly: true },
  { label: "Employees", icon: Users, path: "/team-portal/employees", fullAccessOnly: true },
  { label: "Teams", icon: UserPlus, path: "/team-portal/teams", fullAccessOnly: true },
];

export default function TeamPortalMonthlyReports() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTeam, setFilterTeam] = useState("");
  const [editingReport, setEditingReport] = useState<MonthlyReport | null>(null);

  const [formData, setFormData] = useState({
    teamId: "",
    month: new Date().toISOString().slice(0, 7),
    summary: "",
    achievements: "",
    challenges: "",
    goalsNextMonth: "",
    totalHours: "",
    tasksCompleted: "",
  });

  const fetchTeams = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/teams", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTeams(data);
      })
      .catch(() => {});
  }, [token]);

  const fetchReports = useCallback(() => {
    if (!token) return;
    setLoadingReports(true);
    fetch("/api/team-portal/monthly-reports", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }, [token]);

  useEffect(() => {
    fetchTeams();
    fetchReports();
  }, [fetchTeams, fetchReports]);

  const resetForm = () => {
    setFormData({
      teamId: "",
      month: new Date().toISOString().slice(0, 7),
      summary: "",
      achievements: "",
      challenges: "",
      goalsNextMonth: "",
      totalHours: "",
      tasksCompleted: "",
    });
    setEditingReport(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.summary.trim()) return;
    setSubmitting(true);
    try {
      const body: any = {
        teamId: formData.teamId || undefined,
        month: formData.month,
        summary: formData.summary,
        achievements: formData.achievements || undefined,
        challenges: formData.challenges || undefined,
        goalsNextMonth: formData.goalsNextMonth || undefined,
        totalHours: formData.totalHours ? parseFloat(formData.totalHours) : undefined,
        tasksCompleted: formData.tasksCompleted ? parseInt(formData.tasksCompleted) : undefined,
      };

      const url = editingReport
        ? `/api/team-portal/monthly-reports/${editingReport.id}`
        : "/api/team-portal/monthly-reports";
      const method = editingReport ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        setShowForm(false);
        fetchReports();
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Are you sure you want to delete this report?")) return;
    try {
      await fetch(`/api/team-portal/monthly-reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReports();
    } catch {
    }
  };

  const handleEdit = (report: MonthlyReport) => {
    setEditingReport(report);
    setFormData({
      teamId: report.teamId || "",
      month: report.month || "",
      summary: report.summary || "",
      achievements: report.achievements || "",
      challenges: report.challenges || "",
      goalsNextMonth: report.goalsNextMonth || "",
      totalHours: report.totalHours?.toString() || "",
      tasksCompleted: report.tasksCompleted?.toString() || "",
    });
    setShowForm(true);
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

  const filteredReports = filterTeam
    ? reports.filter((r) => r.teamId === filterTeam)
    : reports;

  const formatMonth = (m: string) => {
    if (!m) return "";
    const [year, month] = m.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#C41E3A]">Team Portal</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleNav.map((item) => {
            const isActive = item.path === "/team-portal/monthly-reports";
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
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
            data-testid="button-logout-sidebar"
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
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-lg font-semibold text-gray-900 md:hidden">Team Portal</h2>
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block">Monthly Reports</h2>
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
                data-testid="button-logout-mobile"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-1">
            {visibleNav.map((item) => {
              const isActive = item.path === "/team-portal/monthly-reports";
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    setLocation(item.path);
                    setMobileMenuOpen(false);
                  }}
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
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

        <main className="p-4 md:p-6 pb-24 md:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
                  Monthly Reports
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create and view monthly performance reports
                </p>
              </div>
              <Button
                onClick={() => {
                  if (showForm && !editingReport) {
                    setShowForm(false);
                  } else {
                    resetForm();
                    setShowForm(true);
                  }
                }}
                className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
                data-testid="button-create-report"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Report
              </Button>
            </div>
          </motion.div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 overflow-hidden"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900" data-testid="text-form-title">
                      {editingReport ? "Edit Report" : "Create Monthly Report"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-monthly-report">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                          <select
                            value={formData.teamId}
                            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                            data-testid="select-team"
                          >
                            <option value="">Select team...</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                          <input
                            type="month"
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                            required
                            data-testid="input-month"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                          placeholder="Brief summary of the month's work..."
                          required
                          data-testid="textarea-summary"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
                          <textarea
                            value={formData.achievements}
                            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                            placeholder="Key achievements this month..."
                            data-testid="textarea-achievements"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
                          <textarea
                            value={formData.challenges}
                            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                            placeholder="Challenges faced this month..."
                            data-testid="textarea-challenges"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Goals for Next Month</label>
                        <textarea
                          value={formData.goalsNextMonth}
                          onChange={(e) => setFormData({ ...formData, goalsNextMonth: e.target.value })}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                          placeholder="Goals and plans for next month..."
                          data-testid="textarea-goals"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours</label>
                          <input
                            type="number"
                            value={formData.totalHours}
                            onChange={(e) => setFormData({ ...formData, totalHours: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                            placeholder="e.g. 160"
                            min="0"
                            step="0.5"
                            data-testid="input-total-hours"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Completed</label>
                          <input
                            type="number"
                            value={formData.tasksCompleted}
                            onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                            placeholder="e.g. 25"
                            min="0"
                            data-testid="input-tasks-completed"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={submitting || !formData.summary.trim()}
                          className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
                          data-testid="button-submit-report"
                        >
                          {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          {editingReport ? "Update Report" : "Submit Report"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setShowForm(false);
                            resetForm();
                          }}
                          data-testid="button-cancel-form"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
              data-testid="select-filter-team"
            >
              <option value="">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500" data-testid="text-report-count">
              {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingReports ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#C41E3A]" />
            </div>
          ) : filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500" data-testid="text-no-reports">No monthly reports found</p>
              <p className="text-sm text-gray-400 mt-1">Click "New Report" to create one</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report, index) => {
                const isExpanded = expandedId === report.id;
                const canModify = isFullAccess || report.employeeId === user.id;
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card data-testid={`card-report-${report.id}`}>
                      <CardContent className="p-4">
                        <div
                          className="flex items-start justify-between gap-3 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                          data-testid={`button-expand-${report.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900" data-testid={`text-employee-${report.id}`}>
                                {report.employeeName}
                              </span>
                              {report.teamName && (
                                <span className="text-xs bg-[#C41E3A]/10 text-[#C41E3A] px-2 py-0.5 rounded-md font-medium">
                                  {report.teamName}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">
                                {formatMonth(report.month)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2" data-testid={`text-summary-${report.id}`}>
                              {report.summary}
                            </p>
                            {(report.totalHours || report.tasksCompleted) && (
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                {report.totalHours != null && (
                                  <span className="text-xs text-gray-500">
                                    {report.totalHours}h worked
                                  </span>
                                )}
                                {report.tasksCompleted != null && (
                                  <span className="text-xs text-gray-500">
                                    {report.tasksCompleted} tasks done
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {canModify && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(report);
                                  }}
                                  data-testid={`button-edit-${report.id}`}
                                >
                                  <Pencil className="w-4 h-4 text-gray-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(report.id);
                                  }}
                                  data-testid={`button-delete-${report.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400" />
                                </Button>
                              </>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                {report.achievements && (
                                  <div data-testid={`text-achievements-${report.id}`}>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      Achievements
                                    </p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {report.achievements}
                                    </p>
                                  </div>
                                )}
                                {report.challenges && (
                                  <div data-testid={`text-challenges-${report.id}`}>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      Challenges
                                    </p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {report.challenges}
                                    </p>
                                  </div>
                                )}
                                {report.goalsNextMonth && (
                                  <div data-testid={`text-goals-${report.id}`}>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      Goals for Next Month
                                    </p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {report.goalsNextMonth}
                                    </p>
                                  </div>
                                )}
                                {!report.achievements && !report.challenges && !report.goalsNextMonth && (
                                  <p className="text-sm text-gray-400 italic">No additional details</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
