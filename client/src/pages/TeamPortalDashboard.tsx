import { useState, useEffect, useCallback, useRef } from "react";
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
  Play,
  Square,
  Timer,
  Loader2,
  Menu,
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Camera,
  Monitor,
  MonitorOff,
  ArrowUp,
  ArrowDown,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamAuth } from "@/hooks/use-team-auth";

interface DashboardData {
  clockedIn: boolean;
  clockEntry: any;
  todayHours: number;
  totalTasks: number;
  pendingTasks: number;
  pendingLeaves: number;
  totalEmployees: number;
  totalTeams: number;
}

interface PerformanceData {
  weeklyHours: { date: string; hours: number; label: string }[];
  totalWeekHours: number;
  avgDailyHours: number;
  taskCompletion: number;
  totalTasksDone: number;
  totalTasksAssigned: number;
  tasksTotal: number;
  lastWeekHours?: number;
}

interface EmployeePerformance {
  id: string;
  name: string;
  email: string;
  designation: string;
  todayHours: number;
  weekHours: number;
  monthHours: number;
  tasksDone: number;
  tasksTotal: number;
  isOnline: boolean;
}

interface HeartbeatData {
  employeeId: string;
  lastActive: string;
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

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatHoursToHMS(totalHours: number): string {
  const totalSeconds = Math.round(totalHours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function BarChart({ data, maxHours }: { data: { label: string; hours: number }[]; maxHours: number }) {
  const effectiveMax = Math.max(maxHours, 1);
  return (
    <div className="flex items-end gap-1.5 h-32 mt-4">
      {data.map((d, i) => {
        const pct = Math.min((d.hours / effectiveMax) * 100, 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500 font-medium">
              {d.hours > 0 ? `${d.hours.toFixed(1)}h` : ""}
            </span>
            <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: "80px" }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#C41E3A] to-[#e85d73] rounded-t-md"
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TeamPortalDashboard() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [perfData, setPerfData] = useState<PerformanceData | null>(null);
  const [empPerformance, setEmpPerformance] = useState<EmployeePerformance[]>([]);
  const [screenshotEnabled, setScreenshotEnabled] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [breakElapsed, setBreakElapsed] = useState(0);
  const breakStartRef = useRef<number | null>(null);
  const breakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [heartbeats, setHeartbeats] = useState<HeartbeatData[]>([]);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const screenshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const heartbeatsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboard = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setDashData(data))
      .catch(() => {});
  }, [token]);

  const fetchPerformance = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/performance", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setPerfData(data))
      .catch(() => {});
  }, [token]);

  const fetchEmployeePerformance = useCallback(() => {
    if (!token || !isFullAccess) return;
    fetch("/api/team-portal/admin/performance", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEmpPerformance(data);
      })
      .catch(() => {});
  }, [token, isFullAccess]);

  const fetchHeartbeats = useCallback(() => {
    if (!token || !isFullAccess) return;
    fetch("/api/team-portal/heartbeats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHeartbeats(data);
      })
      .catch(() => {});
  }, [token, isFullAccess]);

  useEffect(() => {
    fetchDashboard();
    fetchPerformance();
    fetchEmployeePerformance();
    fetchHeartbeats();
  }, [fetchDashboard, fetchPerformance, fetchEmployeePerformance, fetchHeartbeats]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (dashData?.clockedIn && dashData.clockEntry?.clockIn && !onBreak) {
      const updateElapsed = () => {
        const start = new Date(dashData.clockEntry.clockIn).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - start) / 1000));
      };
      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 1000);
    } else if (!dashData?.clockedIn) {
      setElapsed(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dashData?.clockedIn, dashData?.clockEntry, onBreak]);

  useEffect(() => {
    if (!token || onBreak) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      return;
    }

    const sendHeartbeat = () => {
      try {
        fetch("/api/team-portal/heartbeat", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }).catch(() => {});
      } catch {}
    };

    sendHeartbeat();
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 2 * 60 * 1000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [token, onBreak]);

  useEffect(() => {
    if (!token || !screenshotEnabled) {
      if (screenshotIntervalRef.current) {
        clearInterval(screenshotIntervalRef.current);
        screenshotIntervalRef.current = null;
      }
      if (!screenshotEnabled && mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    const captureAndUpload = async () => {
      try {
        let stream = mediaStreamRef.current;
        if (!stream || !stream.active) {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          mediaStreamRef.current = stream;
        }

        const track = stream.getVideoTracks()[0];
        if (!track) return;

        const imageCapture = new (window as any).ImageCapture(track);
        const bitmap = await imageCapture.grabFrame();

        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(bitmap, 0, 0);

        const base64String = canvas.toDataURL("image/jpeg", 0.7);

        await fetch("/api/team-portal/screenshots", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageData: base64String }),
        }).catch(() => {});
      } catch {
      }
    };

    captureAndUpload();
    screenshotIntervalRef.current = setInterval(captureAndUpload, 10 * 60 * 1000);

    return () => {
      if (screenshotIntervalRef.current) {
        clearInterval(screenshotIntervalRef.current);
        screenshotIntervalRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [token, screenshotEnabled]);

  useEffect(() => {
    if (!token || !isFullAccess) return;

    heartbeatsIntervalRef.current = setInterval(fetchHeartbeats, 30 * 1000);

    return () => {
      if (heartbeatsIntervalRef.current) {
        clearInterval(heartbeatsIntervalRef.current);
        heartbeatsIntervalRef.current = null;
      }
    };
  }, [token, isFullAccess, fetchHeartbeats]);

  const handleClock = async (action: "in" | "out") => {
    if (!token) return;
    setClockLoading(true);
    try {
      const res = await fetch(`/api/team-portal/clock/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Clock error:", data.error || res.statusText);
      }
      if (action === "in") {
        setScreenshotEnabled(true);
        setOnBreak(false);
        setBreakElapsed(0);
        breakStartRef.current = null;
      }
      if (action === "out") {
        setScreenshotEnabled(false);
        setOnBreak(false);
        setBreakElapsed(0);
        breakStartRef.current = null;
        if (breakTimerRef.current) {
          clearInterval(breakTimerRef.current);
          breakTimerRef.current = null;
        }
      }
      fetchDashboard();
      fetchPerformance();
    } catch (err) {
      console.error("Clock request failed:", err);
    }
    setClockLoading(false);
  };

  useEffect(() => {
    return () => {
      if (breakTimerRef.current) {
        clearInterval(breakTimerRef.current);
        breakTimerRef.current = null;
      }
    };
  }, []);

  const handleTakeBreak = () => {
    setOnBreak(true);
    setScreenshotEnabled(false);
    breakStartRef.current = Date.now();
    setBreakElapsed(0);
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    breakTimerRef.current = setInterval(() => {
      if (breakStartRef.current) {
        setBreakElapsed(Math.floor((Date.now() - breakStartRef.current) / 1000));
      }
    }, 1000);
  };

  const handleResumeWork = () => {
    setOnBreak(false);
    setScreenshotEnabled(true);
    breakStartRef.current = null;
    setBreakElapsed(0);
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
      breakTimerRef.current = null;
    }
  };

  const getEmployeeActivityStatus = (employeeId: string): "active" | "inactive" | "unknown" => {
    const hb = heartbeats.find((h) => h.employeeId === employeeId);
    if (!hb) return "unknown";
    const lastActive = new Date(hb.lastActive).getTime();
    const now = Date.now();
    const diffMinutes = (now - lastActive) / (1000 * 60);
    return diffMinutes > 10 ? "inactive" : "active";
  };

  const getTrendData = () => {
    if (!perfData) return null;
    const lastWeek = perfData.lastWeekHours ?? 0;
    const thisWeek = perfData.totalWeekHours;
    if (lastWeek === 0 && thisWeek === 0) return { direction: "neutral" as const, percentage: 0 };
    if (lastWeek === 0) return { direction: "up" as const, percentage: 100 };
    const change = ((thisWeek - lastWeek) / lastWeek) * 100;
    return {
      direction: change >= 0 ? ("up" as const) : ("down" as const),
      percentage: Math.abs(Math.round(change)),
    };
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

  const trendData = getTrendData();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#C41E3A]">Team Portal</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleNav.map((item) => {
            const isActive = item.path === "/team-portal/dashboard";
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
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block">Dashboard</h2>
            </div>
            <div className="flex items-center gap-3">
              {dashData?.clockedIn && (
                <div
                  data-testid="status-screen-sharing"
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                    onBreak
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : screenshotEnabled
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-500 border border-gray-200"
                  }`}
                >
                  {onBreak ? (
                    <MonitorOff className="w-3.5 h-3.5" />
                  ) : screenshotEnabled ? (
                    <Monitor className="w-3.5 h-3.5" />
                  ) : (
                    <MonitorOff className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {onBreak ? "On Break" : screenshotEnabled ? "Sharing" : "Starting..."}
                  </span>
                </div>
              )}
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
              const isActive = item.path === "/team-portal/dashboard";
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

        <main className="p-4 md:p-6 pb-24 md:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <h3 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name.split(" ")[0]}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Here's your overview for today
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#C41E3A]" />
                    Clock Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-lg font-bold ${
                        onBreak ? "text-amber-600" : dashData?.clockedIn ? "text-green-600" : "text-gray-400"
                      }`}>
                        {onBreak ? "On Break" : dashData?.clockedIn ? "Clocked In" : "Clocked Out"}
                      </p>
                      {dashData?.clockedIn && !onBreak && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="font-mono text-xl font-bold text-gray-900">
                            {formatElapsed(elapsed)}
                          </span>
                        </div>
                      )}
                      {onBreak && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="font-mono text-sm text-amber-700">
                            Break: {formatElapsed(breakElapsed)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {dashData?.clockedIn && !onBreak && (
                        <Button
                          size="sm"
                          disabled={clockLoading}
                          onClick={handleTakeBreak}
                          data-testid="button-take-break"
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <Coffee className="w-3 h-3 mr-1" />
                          Take a Break
                        </Button>
                      )}
                      {onBreak && (
                        <Button
                          size="sm"
                          disabled={clockLoading}
                          onClick={handleResumeWork}
                          data-testid="button-resume-work"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume Work
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={clockLoading}
                        onClick={() => handleClock(dashData?.clockedIn ? "out" : "in")}
                        data-testid="button-clock-toggle"
                        className={
                          dashData?.clockedIn
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-[#C41E3A] hover:bg-[#A3182F] text-white"
                        }
                      >
                        {clockLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : dashData?.clockedIn ? (
                          <>
                            <Square className="w-3 h-3 mr-1" />
                            Clock Out
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Clock In
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-[#C41E3A]" />
                    Today's Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 font-mono">
                    {dashData ? formatHoursToHMS(dashData.todayHours) : "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Hours worked today</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#C41E3A]" />
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashData?.pendingTasks ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Tasks to complete</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#C41E3A]" />
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashData?.totalTasks ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">All assigned tasks</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#C41E3A]" />
                    Pending Leaves
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashData?.pendingLeaves ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isFullAccess ? "All pending requests" : "Your pending requests"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C41E3A]" />
                    {isFullAccess ? "Team Members" : "My Teams"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {isFullAccess
                      ? (dashData?.totalEmployees ?? "—")
                      : (dashData?.totalTeams ?? "—")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isFullAccess ? "Active employees" : "Teams you belong to"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {perfData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="mb-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#C41E3A]" />
                      Weekly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{perfData.totalWeekHours.toFixed(1)}h</p>
                        <p className="text-xs text-gray-400">This week</p>
                      </div>
                      <div className="h-8 w-px bg-gray-200" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{perfData.avgDailyHours.toFixed(1)}h</p>
                        <p className="text-xs text-gray-400">Daily avg</p>
                      </div>
                      {trendData && (
                        <>
                          <div className="h-8 w-px bg-gray-200" />
                          <div className="flex items-center gap-1.5">
                            {trendData.direction === "up" ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <ArrowUp className="w-4 h-4" />
                                <span className="text-sm font-bold">{trendData.percentage}%</span>
                              </div>
                            ) : trendData.direction === "down" ? (
                              <div className="flex items-center gap-1 text-red-600">
                                <ArrowDown className="w-4 h-4" />
                                <span className="text-sm font-bold">{trendData.percentage}%</span>
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-gray-400">—</span>
                            )}
                            <span className="text-[10px] text-gray-400">vs last week</span>
                          </div>
                        </>
                      )}
                    </div>
                    <BarChart
                      data={perfData.weeklyHours.map((d) => ({ label: d.label, hours: d.hours }))}
                      maxHours={10}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#C41E3A]" />
                      Task Completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="relative w-24 h-24">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                          <motion.circle
                            cx="50" cy="50" r="40" fill="none" stroke="#C41E3A" strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${perfData.taskCompletion * 2.51} 251`}
                            initial={{ strokeDasharray: "0 251" }}
                            animate={{ strokeDasharray: `${perfData.taskCompletion * 2.51} 251` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-900">{perfData.taskCompletion}%</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Completed</span>
                            <span className="font-semibold text-gray-900">{perfData.totalTasksDone}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-green-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${perfData.tasksTotal > 0 ? (perfData.totalTasksDone / perfData.totalTasksAssigned) * 100 : 0}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Remaining</span>
                            <span className="font-semibold text-gray-900">{perfData.totalTasksAssigned - perfData.totalTasksDone}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-amber-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${perfData.totalTasksAssigned > 0 ? ((perfData.totalTasksAssigned - perfData.totalTasksDone) / perfData.totalTasksAssigned) * 100 : 0}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {isFullAccess && empPerformance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#C41E3A]" />
                    Team Performance Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left px-4 py-3 text-gray-600 font-semibold">Employee</th>
                          <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                          <th className="text-left px-4 py-3 text-gray-600 font-semibold">Today</th>
                          <th className="text-left px-4 py-3 text-gray-600 font-semibold">This Week</th>
                          <th className="text-left px-4 py-3 text-gray-600 font-semibold">This Month</th>
                          <th className="text-left px-4 py-3 text-gray-600 font-semibold">Tasks</th>
                          <th className="text-left px-4 py-3 text-gray-600 font-semibold">Productivity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empPerformance.map((emp) => {
                          const taskPct = emp.tasksTotal > 0 ? Math.round((emp.tasksDone / emp.tasksTotal) * 100) : 0;
                          const activityStatus = getEmployeeActivityStatus(emp.id);
                          const empInitials = emp.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);
                          const ringColor =
                            activityStatus === "active"
                              ? "ring-green-500"
                              : activityStatus === "inactive"
                              ? "ring-red-800"
                              : "ring-gray-300";
                          return (
                            <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50/50" data-testid={`row-employee-${emp.id}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-full bg-[#C41E3A] text-white flex items-center justify-center text-xs font-bold ring-2 ${ringColor}`}
                                    data-testid={`avatar-employee-${emp.id}`}
                                  >
                                    {empInitials}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{emp.name}</p>
                                    <p className="text-xs text-gray-400">{emp.designation}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full ${emp.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                                  <span className={`text-xs font-medium ${emp.isOnline ? "text-green-600" : "text-gray-400"}`}>
                                    {emp.isOnline ? "Online" : "Offline"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-mono text-gray-900">
                                {formatHoursToHMS(emp.todayHours)}
                              </td>
                              <td className="px-4 py-3 font-mono text-gray-900">
                                {formatHoursToHMS(emp.weekHours)}
                              </td>
                              <td className="px-4 py-3 font-mono text-gray-900">
                                {formatHoursToHMS(emp.monthHours)}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-900 font-medium">{emp.tasksDone}/{emp.tasksTotal}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                                    <div
                                      className={`h-full rounded-full ${
                                        taskPct >= 75 ? "bg-green-500" : taskPct >= 50 ? "bg-amber-500" : "bg-red-500"
                                      }`}
                                      style={{ width: `${taskPct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600">{taskPct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {visibleNav.slice(0, 5).map((item) => {
            const isActive = item.path === "/team-portal/dashboard";
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
