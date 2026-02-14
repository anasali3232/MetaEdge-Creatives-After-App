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
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Loader2,
  Menu,
  X,
  FileText,
  Camera,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamAuth } from "@/hooks/use-team-auth";

interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string | null;
  phone: string | null;
  role: string;
  accessLevel: string;
  accessTeams: string[];
  isActive: boolean;
  avatarUrl: string | null;
}

interface Team {
  id: string;
  name: string;
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

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  designation: "",
  phone: "",
  role: "",
  accessLevel: "team_only",
  accessTeams: [] as string[],
};

export default function TeamPortalEmployees() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchEmployees = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/employees", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEmployees(data);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [token]);

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

  useEffect(() => {
    fetchEmployees();
    fetchTeams();
  }, [fetchEmployees, fetchTeams]);

  const openAddDialog = () => {
    setEditingEmployee(null);
    setForm({ ...EMPTY_FORM });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const openEditDialog = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      password: "",
      designation: emp.designation || "",
      phone: emp.phone || "",
      role: emp.role,
      accessLevel: emp.accessLevel,
      accessTeams: emp.accessTeams || [],
    });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const body: any = {
        name: form.name,
        email: form.email,
        role: form.role,
        designation: form.designation || null,
        phone: form.phone || null,
        accessLevel: form.accessLevel,
        accessTeams: form.accessTeams,
      };
      if (form.password) body.password = form.password;

      const url = editingEmployee
        ? `/api/team-portal/employees/${editingEmployee.id}`
        : "/api/team-portal/employees";
      const method = editingEmployee ? "PATCH" : "POST";

      if (!editingEmployee && !form.password) {
        setSaving(false);
        return;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setDialogOpen(false);
        fetchEmployees();
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!token || !deletingEmployee) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/team-portal/employees/${deletingEmployee.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteDialogOpen(false);
        setDeletingEmployee(null);
        fetchEmployees();
      }
    } catch {}
    setDeleting(false);
  };

  const toggleActive = async (emp: Employee) => {
    if (!token) return;
    setTogglingId(emp.id);
    try {
      await fetch(`/api/team-portal/employees/${emp.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !emp.isActive }),
      });
      fetchEmployees();
    } catch {}
    setTogglingId(null);
  };

  const toggleTeam = (teamId: string) => {
    setForm((prev) => ({
      ...prev,
      accessTeams: prev.accessTeams.includes(teamId)
        ? prev.accessTeams.filter((t) => t !== teamId)
        : [...prev.accessTeams, teamId],
    }));
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

  if (!isFullAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-[#C41E3A] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-4">You do not have permission to access this page.</p>
            <Button onClick={() => setLocation("/team-portal/dashboard")} className="bg-[#C41E3A] hover:bg-[#A3182F] text-white">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
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

  const accessLevelLabel = (level: string) => {
    switch (level) {
      case "full": return "Full Access";
      case "multi_team": return "Multi-Team";
      case "team_only": return "Team Only";
      default: return level;
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
            const isActive = item.path === "/team-portal/employees";
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
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block">Employees</h2>
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
              const isActive = item.path === "/team-portal/employees";
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
            className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Employees</h3>
              <p className="text-sm text-gray-500 mt-1">Manage team members and their access</p>
            </div>
            <Button onClick={openAddDialog} className="bg-[#C41E3A] hover:bg-[#A3182F] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </motion.div>

          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Email</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Designation</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Role</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Access Level</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-gray-400">
                              No employees found
                            </td>
                          </tr>
                        ) : (
                          employees.map((emp) => (
                            <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {emp.avatarUrl ? (
                                    <img src={emp.avatarUrl} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center text-xs font-bold">
                                      {emp.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                    </div>
                                  )}
                                  <span className="font-medium text-gray-900">{emp.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{emp.email}</td>
                              <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{emp.designation || "—"}</td>
                              <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{emp.role}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  emp.accessLevel === "full"
                                    ? "bg-purple-100 text-purple-700"
                                    : emp.accessLevel === "multi_team"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {accessLevelLabel(emp.accessLevel)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  emp.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {emp.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleActive(emp)}
                                    disabled={togglingId === emp.id}
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                                    title={emp.isActive ? "Deactivate" : "Activate"}
                                  >
                                    {togglingId === emp.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : emp.isActive ? (
                                      <Eye className="w-4 h-4" />
                                    ) : (
                                      <EyeOff className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(emp)}
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setDeletingEmployee(emp);
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
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
            const isActive = item.path === "/team-portal/employees";
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {editingEmployee ? "Change Password (leave blank to keep)" : "Password *"}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingEmployee ? "Leave blank to keep current" : "Password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Designation</label>
              <Input
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Developer, Manager"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Access Level *</label>
              <Select value={form.accessLevel} onValueChange={(v) => setForm({ ...form, accessLevel: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Access</SelectItem>
                  <SelectItem value="multi_team">Multi-Team</SelectItem>
                  <SelectItem value="team_only">Team Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.accessLevel !== "full" && teams.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Teams</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {teams.map((team) => (
                    <label key={team.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.accessTeams.includes(team.id)}
                        onChange={() => toggleTeam(team.id)}
                        className="rounded border-gray-300 text-[#C41E3A] focus:ring-[#C41E3A]"
                      />
                      <span className="text-sm text-gray-700">{team.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.email || (!editingEmployee && !form.password)}
              className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingEmployee ? "Save Changes" : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to delete <strong>{deletingEmployee?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}