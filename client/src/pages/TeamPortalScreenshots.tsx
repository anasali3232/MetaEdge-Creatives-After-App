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
  Loader2,
  Menu,
  X,
  BarChart3,
  FileText,
  Camera,
  ShieldX,
  Monitor,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTeamAuth } from "@/hooks/use-team-auth";

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Screenshot {
  id: string;
  employeeId: string;
  employeeName?: string;
  imageData?: string;
  appName?: string;
  windowTitle?: string;
  capturedAt: string;
}

interface ScreenshotDetail extends Screenshot {
  imageData: string;
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

export default function TeamPortalScreenshots() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all");
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [screenshotsLoading, setScreenshotsLoading] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<ScreenshotDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchEmployees = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/employees", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEmployees(data);
      })
      .catch(() => {});
  }, [token]);

  const fetchScreenshots = useCallback(() => {
    if (!token) return;
    setScreenshotsLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (selectedEmployeeId && selectedEmployeeId !== "all") {
      params.set("employeeId", selectedEmployeeId);
    }
    fetch(`/api/team-portal/screenshots?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setScreenshots(data);
      })
      .catch(() => {})
      .finally(() => setScreenshotsLoading(false));
  }, [token, selectedEmployeeId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchScreenshots();
  }, [fetchScreenshots]);

  const handleViewScreenshot = async (id: string) => {
    if (!token) return;
    setDetailLoading(true);
    setModalOpen(true);
    setSelectedScreenshot(null);
    try {
      const res = await fetch(`/api/team-portal/screenshots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedScreenshot(data);
      }
    } catch {
      // ignore
    }
    setDetailLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" data-testid="loading-spinner">
        <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
      </div>
    );
  }

  if (!token || !user) {
    setLocation("/team-portal/login");
    return null;
  }

  if (!isFullAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" data-testid="access-denied">
        <div className="text-center p-8">
          <ShieldX className="w-16 h-16 text-[#C41E3A] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You don't have permission to view this page. Only administrators can access screenshots.</p>
          <Button
            onClick={() => setLocation("/team-portal/dashboard")}
            className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
            data-testid="button-back-dashboard"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter((item) => !item.fullAccessOnly || isFullAccess);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return ts;
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
            const isActive = item.path === "/team-portal/screenshots";
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
            className="w-full justify-start text-gray-600 hover:text-[#C41E3A]"
            data-testid="button-logout-sidebar"
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
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block" data-testid="text-page-title">Screenshots</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block" data-testid="text-user-name">{user.name}</span>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#C41E3A]/20"
                  data-testid="img-user-avatar"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#C41E3A] text-white flex items-center justify-center text-xs font-bold" data-testid="text-user-initials">
                  {initials}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="md:hidden text-gray-600"
                data-testid="button-logout-header"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-1">
            {visibleNav.map((item) => {
              const isActive = item.path === "/team-portal/screenshots";
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
            <h3 className="text-2xl font-bold text-gray-900" data-testid="text-heading">Screenshots</h3>
            <p className="text-sm text-gray-500 mt-1">View employee desktop screenshots</p>
          </motion.div>

          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filter by Employee:</label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-full sm:w-64" data-testid="select-employee-filter">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="select-option-all">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id} data-testid={`select-option-employee-${emp.id}`}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {screenshotsLoading ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-screenshots">
              <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
            </div>
          ) : screenshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="empty-screenshots">
              <Camera className="w-16 h-16 text-gray-300 mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-1">No Screenshots Found</h4>
              <p className="text-sm text-gray-400">No screenshots available for the selected filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="screenshots-grid">
              {screenshots.map((shot) => (
                <motion.div
                  key={shot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => handleViewScreenshot(shot.id)}
                    data-testid={`card-screenshot-${shot.id}`}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                        {shot.imageData ? (
                          <img
                            src={shot.imageData.startsWith("data:") ? shot.imageData : `data:image/png;base64,${shot.imageData}`}
                            alt="Screenshot"
                            className="w-full h-full object-cover"
                            data-testid={`img-screenshot-thumb-${shot.id}`}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <ImageIcon className="w-10 h-10" />
                            <span className="text-xs">Preview unavailable</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        {shot.employeeName && (
                          <p className="text-sm font-semibold text-gray-900 truncate" data-testid={`text-employee-name-${shot.id}`}>
                            {shot.employeeName}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5" data-testid={`text-timestamp-${shot.id}`}>
                          {formatTimestamp(shot.capturedAt)}
                        </p>
                        {shot.appName && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Monitor className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 truncate" data-testid={`text-app-name-${shot.id}`}>
                              {shot.appName}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-screenshot-detail">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#C41E3A]" />
              Screenshot Details
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12" data-testid="loading-screenshot-detail">
              <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
            </div>
          ) : selectedScreenshot ? (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {selectedScreenshot.imageData ? (
                  <img
                    src={selectedScreenshot.imageData.startsWith("data:") ? selectedScreenshot.imageData : `data:image/png;base64,${selectedScreenshot.imageData}`}
                    alt="Full screenshot"
                    className="w-full h-auto"
                    data-testid="img-screenshot-full"
                  />
                ) : (
                  <div className="flex items-center justify-center py-20 text-gray-400">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedScreenshot.employeeName && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5" data-testid="text-detail-employee">{selectedScreenshot.employeeName}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Captured At</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5" data-testid="text-detail-timestamp">{formatTimestamp(selectedScreenshot.capturedAt)}</p>
                </div>
                {selectedScreenshot.appName && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Application</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5" data-testid="text-detail-app">{selectedScreenshot.appName}</p>
                  </div>
                )}
                {selectedScreenshot.windowTitle && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Window Title</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5" data-testid="text-detail-window-title">{selectedScreenshot.windowTitle}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <p className="text-sm">Failed to load screenshot details.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}