import { useState, useEffect, useCallback, useMemo } from "react";
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
  FileText,
  BarChart3,
  Camera,
  Plus,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Upload,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamAuth } from "@/hooks/use-team-auth";

interface Team {
  id: string;
  name: string;
}

interface WeeklyReport {
  id: string;
  employeeId: string;
  employeeName: string;
  teamId: string;
  teamName: string;
  weekStart: string;
  weekEnd: string;
  accomplishments: string;
  challenges: string;
  nextWeekPlan: string;
  hoursWorked: number | null;
  pdfUrl: string | null;
  createdAt: string;
}

async function uploadPdfFile(file: File, token: string): Promise<string> {
  const metaRes = await fetch("/api/uploads/request-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/pdf",
    }),
  });
  if (!metaRes.ok) {
    const errData = await metaRes.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to get upload URL");
  }
  const { uploadURL, objectPath } = await metaRes.json();
  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/pdf" },
  });
  if (!uploadRes.ok) {
    throw new Error("Failed to upload file");
  }
  return objectPath;
}

function getWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  const month = d.toLocaleString("default", { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  return `Week of ${month} ${day}, ${year}`;
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

export default function TeamPortalWeeklyReports() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [filterTeam, setFilterTeam] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [filterWeek, setFilterWeek] = useState("");
  const [formData, setFormData] = useState({
    teamId: "",
    weekStart: "",
    weekEnd: "",
    accomplishments: "",
    challenges: "",
    nextWeekPlan: "",
    hoursWorked: "",
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
    setReportsLoading(true);
    fetch("/api/team-portal/weekly-reports", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch(() => {})
      .finally(() => setReportsLoading(false));
  }, [token]);

  useEffect(() => {
    fetchTeams();
    fetchReports();
  }, [fetchTeams, fetchReports]);

  const resetForm = () => {
    setFormData({
      teamId: "",
      weekStart: "",
      weekEnd: "",
      accomplishments: "",
      challenges: "",
      nextWeekPlan: "",
      hoursWorked: "",
    });
    setPdfFile(null);
    setEditingReport(null);
    setShowForm(false);
  };

  const handleEdit = (report: WeeklyReport) => {
    setEditingReport(report);
    setFormData({
      teamId: report.teamId,
      weekStart: report.weekStart,
      weekEnd: report.weekEnd,
      accomplishments: report.accomplishments,
      challenges: report.challenges || "",
      nextWeekPlan: report.nextWeekPlan || "",
      hoursWorked: report.hoursWorked != null ? String(report.hoursWorked) : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Are you sure you want to delete this report?")) return;
    try {
      await fetch(`/api/team-portal/weekly-reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReports();
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.accomplishments.trim()) return;
    setFormLoading(true);
    try {
      let uploadedPdfUrl: string | undefined;
      if (pdfFile) {
        setPdfUploading(true);
        try {
          uploadedPdfUrl = await uploadPdfFile(pdfFile, token);
        } catch {
          setPdfUploading(false);
        }
        setPdfUploading(false);
      }
      const url = editingReport
        ? `/api/team-portal/weekly-reports/${editingReport.id}`
        : "/api/team-portal/weekly-reports";
      const method = editingReport ? "PUT" : "POST";
      const body: Record<string, unknown> = {
        teamId: formData.teamId || undefined,
        weekStart: formData.weekStart,
        weekEnd: formData.weekEnd,
        accomplishments: formData.accomplishments,
        challenges: formData.challenges || undefined,
        nextWeekPlan: formData.nextWeekPlan || undefined,
        hoursWorked: formData.hoursWorked ? Number(formData.hoursWorked) : undefined,
        pdfUrl: uploadedPdfUrl || undefined,
      };
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
        fetchReports();
      }
    } catch {}
    setFormLoading(false);
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

  const availableWeeks = useMemo(() => {
    const weekSet = new Map<string, string>();
    reports.forEach((r) => {
      if (r.weekStart && !weekSet.has(r.weekStart)) {
        weekSet.set(r.weekStart, `${r.weekStart} — ${r.weekEnd}`);
      }
    });
    return Array.from(weekSet.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([value, label]) => ({ value, label }));
  }, [reports]);

  const filteredReports = reports
    .filter((r) => !filterTeam || r.teamId === filterTeam)
    .filter((r) => !filterWeek || r.weekStart === filterWeek);

  const canModify = (report: WeeklyReport) =>
    isFullAccess || report.employeeId === user.id;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#C41E3A]">Team Portal</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleNav.map((item) => {
            const isActive = item.path === "/team-portal/weekly-reports";
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
            data-testid="button-logout"
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
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block">Weekly Reports</h2>
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
              const isActive = item.path === "/team-portal/weekly-reports";
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
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Weekly Reports</h3>
                <p className="text-sm text-gray-500 mt-1">Submit and review weekly progress reports</p>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                data-testid="button-new-report"
                className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
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
                className="overflow-hidden mb-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-900" data-testid="text-form-title">
                      {editingReport ? "Edit Report" : "Create Weekly Report"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                          <select
                            value={formData.teamId}
                            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                            data-testid="select-team"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Week Start</label>
                          <input
                            type="date"
                            value={formData.weekStart}
                            onChange={(e) => setFormData({ ...formData, weekStart: e.target.value })}
                            data-testid="input-week-start"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Week End</label>
                          <input
                            type="date"
                            value={formData.weekEnd}
                            onChange={(e) => setFormData({ ...formData, weekEnd: e.target.value })}
                            data-testid="input-week-end"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                          <input
                            type="number"
                            value={formData.hoursWorked}
                            onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                            data-testid="input-hours-worked"
                            placeholder="e.g. 40"
                            min="0"
                            step="0.5"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Accomplishments <span className="text-[#C41E3A]">*</span>
                        </label>
                        <textarea
                          value={formData.accomplishments}
                          onChange={(e) => setFormData({ ...formData, accomplishments: e.target.value })}
                          data-testid="textarea-accomplishments"
                          rows={3}
                          required
                          placeholder="What did you accomplish this week?"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A] resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
                        <textarea
                          value={formData.challenges}
                          onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                          data-testid="textarea-challenges"
                          rows={2}
                          placeholder="Any challenges or blockers?"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A] resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Week Plan</label>
                        <textarea
                          value={formData.nextWeekPlan}
                          onChange={(e) => setFormData({ ...formData, nextWeekPlan: e.target.value })}
                          data-testid="textarea-next-week-plan"
                          rows={2}
                          placeholder="What's planned for next week?"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A] resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attach PDF (optional)</label>
                        <div className="flex items-center gap-3 flex-wrap">
                          <label
                            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer text-sm text-gray-600 hover:border-[#C41E3A] hover:text-[#C41E3A] transition-colors"
                            data-testid="label-pdf-upload"
                          >
                            <Upload className="w-4 h-4" />
                            {pdfFile ? pdfFile.name : "Choose PDF file"}
                            <input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              data-testid="input-pdf-upload"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f && f.size > 10 * 1024 * 1024) {
                                  alert("File must be under 10MB");
                                  return;
                                }
                                setPdfFile(f || null);
                              }}
                            />
                          </label>
                          {pdfFile && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setPdfFile(null)}
                              data-testid="button-remove-pdf"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          {pdfUploading && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <Button
                          type="submit"
                          disabled={formLoading || !formData.accomplishments.trim()}
                          data-testid="button-submit-report"
                          className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
                        >
                          {formLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          {editingReport ? "Update Report" : "Submit Report"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={resetForm}
                          data-testid="button-cancel-report"
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-4"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                data-testid="select-filter-team"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
              >
                <option value="">All Teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select
                value={filterWeek}
                onChange={(e) => setFilterWeek(e.target.value)}
                data-testid="select-filter-week"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
              >
                <option value="">All Weeks</option>
                {availableWeeks.map((w) => (
                  <option key={w.value} value={w.value}>
                    {getWeekLabel(w.value)}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-400" data-testid="text-report-count">
                {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>

          {reportsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#C41E3A]" />
            </div>
          ) : filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No weekly reports found</p>
              <p className="text-gray-400 text-xs mt-1">Click "New Report" to create one</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report, index) => {
                const isExpanded = expandedId === report.id;
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card data-testid={`card-report-${report.id}`}>
                      <CardContent className="p-4">
                        <div
                          className="flex items-start justify-between gap-3 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                          data-testid={`button-expand-report-${report.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm" data-testid={`text-employee-name-${report.id}`}>
                                {report.employeeName}
                              </span>
                              {report.teamName && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                                  {report.teamName}
                                </span>
                              )}
                              {report.hoursWorked != null && (
                                <span className="text-xs text-gray-500">
                                  {report.hoursWorked}h
                                </span>
                              )}
                              {report.pdfUrl && (
                                <Paperclip className="w-3 h-3 text-[#C41E3A]" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {report.weekStart} — {report.weekEnd}
                            </p>
                            {!isExpanded && (
                              <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                                {report.accomplishments}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {canModify(report) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(report);
                                  }}
                                  data-testid={`button-edit-report-${report.id}`}
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
                                  data-testid={`button-delete-report-${report.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400" />
                                </Button>
                              </>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
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
                              <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Accomplishments
                                  </p>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap" data-testid={`text-accomplishments-${report.id}`}>
                                    {report.accomplishments}
                                  </p>
                                </div>
                                {report.challenges && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      Challenges
                                    </p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap" data-testid={`text-challenges-${report.id}`}>
                                      {report.challenges}
                                    </p>
                                  </div>
                                )}
                                {report.nextWeekPlan && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      Next Week Plan
                                    </p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap" data-testid={`text-next-week-plan-${report.id}`}>
                                      {report.nextWeekPlan}
                                    </p>
                                  </div>
                                )}
                                {report.hoursWorked != null && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      Hours Worked
                                    </p>
                                    <p className="text-sm text-gray-700" data-testid={`text-hours-${report.id}`}>
                                      {report.hoursWorked} hours
                                    </p>
                                  </div>
                                )}
                                {report.pdfUrl && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      Attached PDF
                                    </p>
                                    <a
                                      href={report.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-sm text-[#C41E3A] hover:underline"
                                      data-testid={`link-pdf-${report.id}`}
                                    >
                                      <Paperclip className="w-4 h-4" />
                                      View PDF
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
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
