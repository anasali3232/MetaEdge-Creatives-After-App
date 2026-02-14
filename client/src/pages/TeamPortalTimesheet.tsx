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
  ChevronLeft,
  ChevronRight,
  Timer,
  Loader2,
  Menu,
  X,
  FileText,
  Camera,
  BarChart3,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamAuth } from "@/hooks/use-team-auth";

interface ClockStatus {
  clockedIn: boolean;
  clockEntry?: {
    id: string;
    clockIn: string;
    notes?: string;
  };
}

interface ClockEntry {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut: string | null;
  notes: string | null;
  employeeName?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
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

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function calcDurationMinutes(clockIn: string, clockOut: string | null): number {
  const start = new Date(clockIn).getTime();
  const end = clockOut ? new Date(clockOut).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 60000));
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function TeamPortalTimesheet() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [clockStatus, setClockStatus] = useState<ClockStatus | null>(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [clockNotes, setClockNotes] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [onBreak, setOnBreak] = useState(false);
  const [breakElapsed, setBreakElapsed] = useState(0);
  const breakStartRef = useRef<number | null>(null);
  const breakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const fetchClockStatus = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/clock/status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setClockStatus(data))
      .catch(() => {});
  }, [token]);

  const fetchEntries = useCallback(() => {
    if (!token) return;
    setEntriesLoading(true);
    const startDate = formatDate(weekStart);
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    const endDate = formatDate(end);

    let url: string;
    if (isFullAccess && selectedEmployeeId) {
      url = `/api/team-portal/clock/entries?employeeId=${selectedEmployeeId}&startDate=${startDate}&endDate=${endDate}`;
    } else if (isFullAccess && selectedEmployeeId === "") {
      url = `/api/team-portal/clock/entries?startDate=${startDate}&endDate=${endDate}`;
    } else {
      url = `/api/team-portal/clock/entries?startDate=${startDate}&endDate=${endDate}`;
    }

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => setEntries([]))
      .finally(() => setEntriesLoading(false));
  }, [token, weekStart, isFullAccess, selectedEmployeeId]);

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
    fetchClockStatus();
  }, [fetchClockStatus]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (clockStatus?.clockedIn && clockStatus.clockEntry?.clockIn && !onBreak) {
      const updateElapsed = () => {
        const start = new Date(clockStatus.clockEntry!.clockIn).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - start) / 1000));
      };
      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 1000);
    } else if (!clockStatus?.clockedIn) {
      setElapsed(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [clockStatus, onBreak]);

  const handleClockIn = async () => {
    if (!token) return;
    setClockLoading(true);
    try {
      await fetch("/api/team-portal/clock/in", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: clockNotes || undefined }),
      });
      setClockNotes("");
      setOnBreak(false);
      setBreakElapsed(0);
      breakStartRef.current = null;
      fetchClockStatus();
      fetchEntries();
    } catch {}
    setClockLoading(false);
  };

  const handleClockOut = async () => {
    if (!token) return;
    setClockLoading(true);
    try {
      await fetch("/api/team-portal/clock/out", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOnBreak(false);
      setBreakElapsed(0);
      breakStartRef.current = null;
      if (breakTimerRef.current) {
        clearInterval(breakTimerRef.current);
        breakTimerRef.current = null;
      }
      fetchClockStatus();
      fetchEntries();
    } catch {}
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
    breakStartRef.current = null;
    setBreakElapsed(0);
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
      breakTimerRef.current = null;
    }
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
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

  const entriesByDate: Record<string, ClockEntry[]> = {};
  entries.forEach((entry) => {
    const dateKey = new Date(entry.clockIn).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    if (!entriesByDate[dateKey]) entriesByDate[dateKey] = [];
    entriesByDate[dateKey].push(entry);
  });

  let weeklyTotalMinutes = 0;
  entries.forEach((entry) => {
    weeklyTotalMinutes += calcDurationMinutes(entry.clockIn, entry.clockOut);
  });

  const weekLabel = `${formatDateLabel(weekStart)} - ${formatDateLabel(weekEnd)}, ${weekEnd.getFullYear()}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#C41E3A]">Team Portal</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleNav.map((item) => {
            const isActive = item.path === "/team-portal/timesheet";
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
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 md:hidden">Team Portal</h2>
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block">My Time</h2>
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
                  const isActive = item.path === "/team-portal/timesheet";
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
            <h3 className="text-2xl font-bold text-gray-900">My Time</h3>
            <p className="text-sm text-gray-500 mt-1">Track your work hours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mb-6"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-[#C41E3A]" />
                    Clock In / Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          onBreak ? "bg-amber-500 animate-pulse" : clockStatus?.clockedIn ? "bg-green-500 animate-pulse" : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={`text-lg font-bold ${
                          onBreak ? "text-amber-600" : clockStatus?.clockedIn ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {onBreak ? "On Break" : clockStatus?.clockedIn ? "Clocked In" : "Clocked Out"}
                      </span>
                    </div>
                    {clockStatus?.clockedIn && !onBreak && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-lg font-semibold text-gray-900">
                          {formatElapsed(elapsed)}
                        </span>
                      </div>
                    )}
                    {onBreak && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <Coffee className="w-4 h-4" />
                        <span className="font-mono text-lg font-semibold text-amber-700">
                          Break: {formatElapsed(breakElapsed)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {!clockStatus?.clockedIn && (
                      <Input
                        placeholder="Notes (optional)"
                        value={clockNotes}
                        onChange={(e) => setClockNotes(e.target.value)}
                        className="w-full sm:w-48"
                      />
                    )}
                    {clockStatus?.clockedIn && !onBreak && (
                      <Button
                        disabled={clockLoading}
                        onClick={handleTakeBreak}
                        data-testid="button-take-break"
                        className="min-w-[140px] bg-amber-500 hover:bg-amber-600 text-white"
                        size="lg"
                      >
                        <Coffee className="w-4 h-4 mr-2" />
                        Take a Break
                      </Button>
                    )}
                    {onBreak && (
                      <Button
                        disabled={clockLoading}
                        onClick={handleResumeWork}
                        data-testid="button-resume-work"
                        className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume Work
                      </Button>
                    )}
                    <Button
                      disabled={clockLoading}
                      onClick={clockStatus?.clockedIn ? handleClockOut : handleClockIn}
                      data-testid="button-clock-toggle"
                      className={`min-w-[140px] ${
                        clockStatus?.clockedIn
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-[#C41E3A] hover:bg-[#A3182F] text-white"
                      }`}
                      size="lg"
                    >
                      {clockLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : clockStatus?.clockedIn ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Clock Out
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Clock In
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {isFullAccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">View Employee:</span>
                    <Select
                      value={selectedEmployeeId}
                      onValueChange={(val) => setSelectedEmployeeId(val === "mine" ? "" : val)}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="My Timesheet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mine">My Timesheet</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={String(emp.id)}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prevWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-semibold text-gray-700">{weekLabel}</span>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {entriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#C41E3A]" />
              </div>
            ) : entries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No time entries for this week</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.keys(entriesByDate).map((dateKey) => {
                  const dayEntries = entriesByDate[dateKey];
                  let dayTotalMinutes = 0;
                  dayEntries.forEach((e) => {
                    dayTotalMinutes += calcDurationMinutes(e.clockIn, e.clockOut);
                  });

                  return (
                    <Card key={dateKey}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-700">
                          {dateKey}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="text-left px-4 py-2 text-gray-500 font-medium">Clock In</th>
                                <th className="text-left px-4 py-2 text-gray-500 font-medium">Clock Out</th>
                                <th className="text-left px-4 py-2 text-gray-500 font-medium">Duration</th>
                                <th className="text-left px-4 py-2 text-gray-500 font-medium">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dayEntries.map((entry) => {
                                const duration = calcDurationMinutes(entry.clockIn, entry.clockOut);
                                return (
                                  <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-4 py-2.5 text-gray-900">{formatTime(entry.clockIn)}</td>
                                    <td className="px-4 py-2.5 text-gray-900">
                                      {entry.clockOut ? formatTime(entry.clockOut) : (
                                        <span className="text-green-600 text-xs font-medium">In Progress</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5 text-gray-900 font-mono">
                                      {formatDuration(duration)}
                                    </td>
                                    <td className="px-4 py-2.5 text-gray-500">
                                      {entry.notes || "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-50">
                                <td colSpan={2} className="px-4 py-2 text-sm font-semibold text-gray-700">
                                  Day Total
                                </td>
                                <td className="px-4 py-2 text-sm font-semibold text-gray-900 font-mono">
                                  {formatDuration(dayTotalMinutes)}
                                </td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <Card className="bg-[#C41E3A]/5 border-[#C41E3A]/20">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Weekly Total</span>
                      <span className="text-lg font-bold text-[#C41E3A] font-mono">
                        {formatDuration(weeklyTotalMinutes)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {visibleNav.slice(0, 5).map((item) => {
            const isActive = item.path === "/team-portal/timesheet";
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