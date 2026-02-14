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
  Pencil,
  Trash2,
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
  title: string | null;
  weekStart: string;
  weekEnd: string;
  accomplishments: string;
  challenges: string;
  nextWeekPlan: string;
  hoursWorked: number | null;
  pdfUrl: string | null;
  createdAt: string;
}

async function uploadFile(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/team-portal/upload-report-file", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "File upload failed");
  }
  const data = await res.json();
  return data.fileUrl;
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

  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [filterWeek, setFilterWeek] = useState("");
  const [formData, setFormData] = useState({
    teamId: "",
    title: "",
    weekStart: "",
    weekEnd: "",
    note: "",
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

  const availableTeams = useMemo(() => {
    if (isFullAccess) return teams;
    if (!user) return [];
    return teams.filter((t) => user.accessTeams.includes(t.id));
  }, [teams, user, isFullAccess]);

  const resetForm = () => {
    setFormData({
      teamId: "",
      title: "",
      weekStart: "",
      weekEnd: "",
      note: "",
    });
    setSelectedFile(null);
    setEditingReport(null);
    setShowForm(false);
  };

  const handleEdit = (report: WeeklyReport) => {
    setEditingReport(report);
    setFormData({
      teamId: report.teamId,
      title: report.title || "",
      weekStart: report.weekStart,
      weekEnd: report.weekEnd,
      note: report.accomplishments || "",
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
    if (!token) return;
    if (!formData.teamId) {
      alert("Please select a team");
      return;
    }
    if (!formData.weekStart || !formData.weekEnd) {
      alert("Please select week start and end dates");
      return;
    }
    if (!selectedFile && !formData.note.trim()) return;
    setFormLoading(true);
    try {
      let uploadedFileUrl: string | undefined;
      if (selectedFile) {
        setFileUploading(true);
        try {
          uploadedFileUrl = await uploadFile(selectedFile, token);
        } catch (err) {
          setFileUploading(false);
          setFormLoading(false);
          alert("File upload failed. Please try again.");
          return;
        }
        setFileUploading(false);
      }
      const url = editingReport
        ? `/api/team-portal/weekly-reports/${editingReport.id}`
        : "/api/team-portal/weekly-reports";
      const method = editingReport ? "PUT" : "POST";
      const body: Record<string, unknown> = {
        teamId: formData.teamId,
        title: formData.title || undefined,
        weekStart: formData.weekStart,
        weekEnd: formData.weekEnd,
        accomplishments: formData.note || "",
        pdfUrl: uploadedFileUrl || undefined,
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
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to submit report");
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

  const availableWeeks = (() => {
    const weekSet = new Map<string, string>();
    reports.forEach((r) => {
      if (r.weekStart && !weekSet.has(r.weekStart)) {
        weekSet.set(r.weekStart, `${r.weekStart} — ${r.weekEnd}`);
      }
    });
    return Array.from(weekSet.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([value]) => ({ value, label: getWeekLabel(value) }));
  })();

  const filteredReports = reports
    .filter((r) => !filterTeam || r.teamId === filterTeam)
    .filter((r) => !filterWeek || r.weekStart === filterWeek);

  const canModify = (report: WeeklyReport) =>
    isFullAccess || report.employeeId === user.id;

  const canSubmit = !!selectedFile || formData.note.trim().length > 0;

  const getFileName = (url: string) => {
    try {
      const parts = url.split("/");
      return decodeURIComponent(parts[parts.length - 1]) || "Attachment";
    } catch {
      return "Attachment";
    }
  };

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
                onClick={() => setMobileMenuOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
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
          <>
            <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 md:hidden shadow-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h1 className="text-lg font-bold text-[#C41E3A]">Team Portal</h1>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100" data-testid="button-close-menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {visibleNav.map((item) => {
                  const isActive = item.path === "/team-portal/weekly-reports";
                  return (
                    <button key={item.path} onClick={() => { setLocation(item.path); setMobileMenuOpen(false); }}
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#C41E3A]/10 text-[#C41E3A]" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-gray-100">
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#C41E3A]" data-testid="button-logout-offcanvas">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          data-testid="input-report-title"
                          placeholder="e.g. Sprint Review Week 7"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                          <select
                            value={formData.teamId}
                            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                            data-testid="select-team"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                          >
                            <option value="">Select team...</option>
                            {availableTeams.map((t) => (
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
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attach File (optional)</label>
                        <p className="text-xs text-gray-400 mb-2">PDF, ZIP, or Word (.pdf, .zip, .doc, .docx) — max 10MB</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <label
                            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer text-sm text-gray-600 hover:border-[#C41E3A] hover:text-[#C41E3A] transition-colors"
                            data-testid="label-file-upload"
                          >
                            <Paperclip className="w-4 h-4" />
                            {selectedFile ? selectedFile.name : "Choose file"}
                            <input
                              type="file"
                              accept=".pdf,.zip,.doc,.docx"
                              className="hidden"
                              data-testid="input-file-upload"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f && f.size > 10 * 1024 * 1024) {
                                  alert("File must be under 10MB");
                                  return;
                                }
                                setSelectedFile(f || null);
                              }}
                            />
                          </label>
                          {selectedFile && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFile(null)}
                              data-testid="button-remove-file"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          {fileUploading && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                        <textarea
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          data-testid="textarea-note"
                          rows={3}
                          placeholder="Add any notes or comments..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A] resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <Button
                          type="submit"
                          disabled={formLoading || !canSubmit}
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

          {isFullAccess && (
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
                    {w.label}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-400" data-testid="text-report-count">
                {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
          )}

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
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card data-testid={`card-report-${report.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {report.title && (
                            <p className="font-semibold text-gray-900 text-sm mb-1" data-testid={`text-report-title-${report.id}`}>
                              {report.title}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`${report.title ? "text-gray-600 text-xs" : "font-semibold text-gray-900 text-sm"}`} data-testid={`text-employee-name-${report.id}`}>
                              {report.employeeName}
                            </span>
                            {report.teamName && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                                {report.teamName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {report.weekStart} — {report.weekEnd}
                          </p>
                          {report.pdfUrl && (
                            <div className="mt-2">
                              <a
                                href={report.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-[#C41E3A] hover:underline"
                                data-testid={`link-file-${report.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Paperclip className="w-4 h-4" />
                                {getFileName(report.pdfUrl)}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {report.accomplishments && (
                            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap" data-testid={`text-note-${report.id}`}>
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
                                onClick={() => handleEdit(report)}
                                data-testid={`button-edit-report-${report.id}`}
                              >
                                <Pencil className="w-4 h-4 text-gray-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(report.id)}
                                data-testid={`button-delete-report-${report.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-gray-400" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
