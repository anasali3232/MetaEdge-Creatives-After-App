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
  X,
  Shield,
  Palette,
  Loader2,
  Menu,
  FileText,
  Camera,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTeamAuth } from "@/hooks/use-team-auth";

interface Team {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  memberCount?: number;
}

interface TeamMember {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  designation: string | null;
  avatarUrl: string | null;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string | null;
  avatarUrl: string | null;
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

const PRESET_COLORS = [
  "#C41E3A", "#E74C3C", "#E67E22", "#F1C40F", "#2ECC71",
  "#1ABC9C", "#3498DB", "#2980B9", "#9B59B6", "#8E44AD",
  "#34495E", "#7F8C8D", "#D35400", "#16A085", "#27AE60",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  color: "#3498DB",
};

export default function TeamPortalTeams() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [addMemberEmployeeId, setAddMemberEmployeeId] = useState("");
  const [addMemberRole, setAddMemberRole] = useState("member");
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const fetchTeams = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/teams", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTeams(data);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [token]);

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

  const fetchTeamMembers = useCallback(
    (teamId: string) => {
      if (!token) return;
      setLoadingMembers(true);
      fetch(`/api/team-portal/teams/${teamId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setTeamMembers(data);
        })
        .catch(() => {})
        .finally(() => setLoadingMembers(false));
    },
    [token]
  );

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, [fetchTeams, fetchEmployees]);

  const handleExpandTeam = (teamId: string) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
      setTeamMembers([]);
    } else {
      setExpandedTeamId(teamId);
      fetchTeamMembers(teamId);
    }
  };

  const openCreateDialog = () => {
    setEditingTeam(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    setForm({
      name: team.name,
      description: team.description || "",
      color: team.color || "#3498DB",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token || !form.name.trim()) return;
    setSaving(true);
    try {
      const url = editingTeam
        ? `/api/team-portal/teams/${editingTeam.id}`
        : "/api/team-portal/teams";
      const method = editingTeam ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          color: form.color,
        }),
      });

      if (res.ok) {
        setDialogOpen(false);
        fetchTeams();
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!token || !deletingTeam) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/team-portal/teams/${deletingTeam.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteDialogOpen(false);
        setDeletingTeam(null);
        if (expandedTeamId === deletingTeam.id) {
          setExpandedTeamId(null);
          setTeamMembers([]);
        }
        fetchTeams();
      }
    } catch {}
    setDeleting(false);
  };

  const handleAddMember = async () => {
    if (!token || !expandedTeamId || !addMemberEmployeeId) return;
    setAddingMember(true);
    try {
      const res = await fetch(`/api/team-portal/teams/${expandedTeamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeId: addMemberEmployeeId, role: addMemberRole }),
      });
      if (res.ok) {
        setAddMemberEmployeeId("");
        setAddMemberRole("member");
        fetchTeamMembers(expandedTeamId);
        fetchTeams();
      }
    } catch {}
    setAddingMember(false);
  };

  const handleRemoveMember = async (employeeId: string) => {
    if (!token || !expandedTeamId) return;
    setRemovingMemberId(employeeId);
    try {
      const res = await fetch(
        `/api/team-portal/teams/${expandedTeamId}/members/${employeeId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        fetchTeamMembers(expandedTeamId);
        fetchTeams();
      }
    } catch {}
    setRemovingMemberId(null);
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

  const memberIds = teamMembers.map((m) => m.employeeId);
  const availableEmployees = employees.filter((e) => !memberIds.includes(e.id));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#C41E3A]">Team Portal</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleNav.map((item) => {
            const isActive = item.path === "/team-portal/teams";
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
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block">Teams</h2>
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
                  const isActive = item.path === "/team-portal/teams";
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

        <main className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Teams</h3>
              <p className="text-sm text-gray-500 mt-1">Manage teams and their members</p>
            </div>
            <Button onClick={openCreateDialog} className="bg-[#C41E3A] hover:bg-[#A3182F] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </motion.div>

          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
            </div>
          ) : teams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardContent className="py-16 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No teams yet</h4>
                  <p className="text-sm text-gray-400 mb-4">Create your first team to get started</p>
                  <Button onClick={openCreateDialog} className="bg-[#C41E3A] hover:bg-[#A3182F] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                  className={expandedTeamId === team.id ? "md:col-span-2 lg:col-span-3" : ""}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <button
                          onClick={() => handleExpandTeam(team.id)}
                          className="flex items-center gap-3 text-left flex-1 min-w-0"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0 border border-gray-200"
                            style={{ backgroundColor: team.color || "#3498DB" }}
                          />
                          <CardTitle className="text-base font-semibold text-gray-900 truncate">
                            {team.name}
                          </CardTitle>
                        </button>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(team);
                            }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingTeam(team);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <button
                        onClick={() => handleExpandTeam(team.id)}
                        className="w-full text-left"
                      >
                        {team.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{team.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{team.memberCount ?? 0} member{(team.memberCount ?? 0) !== 1 ? "s" : ""}</span>
                        </div>
                      </button>

                      {expandedTeamId === team.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 pt-4 border-t border-gray-100"
                        >
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">Team Members</h5>

                          {loadingMembers ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-[#C41E3A]" />
                            </div>
                          ) : (
                            <>
                              {teamMembers.length === 0 ? (
                                <p className="text-sm text-gray-400 py-2">No members in this team</p>
                              ) : (
                                <div className="space-y-2 mb-4">
                                  {teamMembers.map((member) => (
                                    <div
                                      key={member.employeeId}
                                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        {member.avatarUrl ? (
                                          <img
                                            src={member.avatarUrl}
                                            alt={member.name}
                                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                          />
                                        ) : (
                                          <div className="w-7 h-7 rounded-full bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                            {member.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")
                                              .toUpperCase()
                                              .slice(0, 2)}
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {member.name}
                                          </p>
                                          <p className="text-xs text-gray-400 truncate">
                                            {member.designation || member.role}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveMember(member.employeeId)}
                                        disabled={removingMemberId === member.employeeId}
                                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 flex-shrink-0"
                                        title="Remove member"
                                      >
                                        {removingMemberId === member.employeeId ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <X className="w-3.5 h-3.5" />
                                        )}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-3">
                                <select
                                  value={addMemberEmployeeId}
                                  onChange={(e) => setAddMemberEmployeeId(e.target.value)}
                                  className="flex-1 h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/20 focus:border-[#C41E3A]"
                                >
                                  <option value="">Select employee...</option>
                                  {availableEmployees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                      {emp.name} {emp.designation ? `(${emp.designation})` : ""}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size="sm"
                                  onClick={handleAddMember}
                                  disabled={!addMemberEmployeeId || addingMember}
                                  className="bg-[#C41E3A] hover:bg-[#A3182F] text-white h-9 px-3"
                                >
                                  {addingMember ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <UserPlus className="w-4 h-4 mr-1" />
                                      Add
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {visibleNav.slice(0, 5).map((item) => {
            const isActive = item.path === "/team-portal/teams";
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Team" : "Create Team"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Team Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the team"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      form.color === color
                        ? "border-gray-900 scale-110 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingTeam ? "Save Changes" : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to delete <strong>{deletingTeam?.name}</strong>? This action cannot be undone.
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
