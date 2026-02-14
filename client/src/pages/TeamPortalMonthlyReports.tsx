import { useState, useEffect, useCallback, useRef } from "react";
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

interface MonthlyReport {
  id: string;
  employeeId: string;
  employeeName: string;
  teamId: string;
  teamName: string;
  title: string | null;
  month: string;
  summary: string;
  pdfUrl: string | null;
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

async function downloadFile(url: string, token: string) {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
  } catch {
    alert("Failed to download file");
  }
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

const ACCEPTED_TYPES = ".pdf,.zip,.doc,.docx";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function TeamPortalMonthlyReports() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterTeam, setFilterTeam] = useState("");
  const [editingReport, setEditingReport] = useState<MonthlyReport | null>(null);

  const [formData, setFormData] = useState({
    teamId: "",
    title: "",
    month: new Date().toISOString().slice(0, 7),
    note: "",
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      title: "",
      month: new Date().toISOString().slice(0, 7),
      note: "",
    });
    setPdfFile(null);
    setEditingReport(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.teamId) {
      alert("Please select a team");
      return;
    }
    if (!pdfFile && !formData.note.trim()) return;

    setSubmitting(true);
    try {
      let pdfUrl: string | undefined;

      if (pdfFile) {
        setPdfUploading(true);
        try {
          pdfUrl = await uploadFile(pdfFile, token);
        } catch (err) {
          setPdfUploading(false);
          setSubmitting(false);
          alert("File upload failed. Please try again.");
          return;
        }
        setPdfUploading(false);
      }

      const body: any = {
        teamId: formData.teamId,
        title: formData.title || undefined,
        month: formData.month,
        summary: formData.note.trim() || "",
      };

      if (pdfUrl) {
        body.pdfUrl = pdfUrl;
      }

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
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to submit report");
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
      title: report.title || "",
      month: report.month || "",
      note: report.summary || "",
    });
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPdfFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be under 10MB");
      e.target.value = "";
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
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

  const availableTeams = isFullAccess
    ? teams
    : teams.filter((t) => user.accessTeams.includes(t.id));

  const canSubmit = !submitting && (!!pdfFile || formData.note.trim().length > 0);

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
                onClick={() => setMobileMenuOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
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
                  const isActive = item.path === "/team-portal/monthly-reports";
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
                  Monthly Reports
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Upload and manage monthly performance reports
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          data-testid="input-report-title"
                          placeholder="e.g. February Performance Summary"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                        />
                      </div>
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
                            {availableTeams.map((t) => (
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
                          Attach File
                        </label>
                        <div className="flex items-center gap-3">
                          <label
                            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                            data-testid="label-file-upload"
                          >
                            <Upload className="w-4 h-4" />
                            Choose File
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept={ACCEPTED_TYPES}
                              onChange={handleFileChange}
                              className="hidden"
                              data-testid="input-file-upload"
                            />
                          </label>
                          {pdfFile && (
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Paperclip className="w-3 h-3" />
                              {pdfFile.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, ZIP, Word (.doc, .docx) - Max 10MB
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Note (optional)
                        </label>
                        <textarea
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                          placeholder="Add a note about this report..."
                          data-testid="textarea-note"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={!canSubmit}
                          className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
                          data-testid="button-submit-report"
                        >
                          {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          {pdfUploading
                            ? "Uploading..."
                            : editingReport
                            ? "Update Report"
                            : "Submit Report"}
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

          {isFullAccess && (
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
          )}

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
                const canModify = isFullAccess || report.employeeId === user.id;
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card data-testid={`card-report-${report.id}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {report.title && (
                              <p className="font-semibold text-gray-900 text-sm mb-1" data-testid={`text-report-title-${report.id}`}>
                                {report.title}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`${report.title ? "text-gray-600 text-xs" : "font-medium text-gray-900"}`} data-testid={`text-employee-name-${report.id}`}>
                                {report.employeeName}
                              </span>
                              {report.teamName && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#C41E3A]/10 text-[#C41E3A]" data-testid={`badge-team-${report.id}`}>
                                  {report.teamName}
                                </span>
                              )}
                              <span className="text-sm text-gray-500" data-testid={`text-month-${report.id}`}>
                                {formatMonth(report.month)}
                              </span>
                            </div>

                            {report.pdfUrl && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1.5 text-sm text-[#C41E3A] hover:underline cursor-pointer"
                                  data-testid={`link-attachment-${report.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (token) downloadFile(report.pdfUrl!, token);
                                  }}
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                  View Attachment
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {report.summary && (
                              <p className="mt-2 text-sm text-gray-600" data-testid={`text-note-${report.id}`}>
                                {report.summary}
                              </p>
                            )}
                          </div>

                          {canModify && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(report)}
                                data-testid={`button-edit-${report.id}`}
                              >
                                <Pencil className="w-4 h-4 text-gray-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(report.id)}
                                data-testid={`button-delete-${report.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
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
