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
  Trash2,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Calendar,
  Flag,
  Send,
  User,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "High" | "Medium" | "Low";
  assigneeId?: string;
  assigneeName?: string;
  teamId: string;
  dueDate?: string;
  commentCount?: number;
}

interface Team {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
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

const COLUMNS = [
  { key: "todo" as const, label: "To Do", color: "bg-gray-500", headerBg: "bg-gray-100", borderColor: "border-gray-300" },
  { key: "in_progress" as const, label: "In Progress", color: "bg-blue-500", headerBg: "bg-blue-50", borderColor: "border-blue-300" },
  { key: "done" as const, label: "Done", color: "bg-green-500", headerBg: "bg-green-50", borderColor: "border-green-300" },
];

const STATUS_ORDER: Task["status"][] = ["todo", "in_progress", "done"];

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

export default function TeamPortalTasks() {
  const { token, user, isLoading, logout, isFullAccess } = useTeamAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const fetchTeams = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/teams", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const teamList = Array.isArray(data) ? data : data.teams || [];
        setTeams(teamList);
        if (teamList.length > 0 && !selectedTeamId) {
          setSelectedTeamId(teamList[0].id);
        }
      })
      .catch(() => {});
  }, [token, selectedTeamId]);

  const fetchEmployees = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/employees", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : data.employees || []);
      })
      .catch(() => {});
  }, [token]);

  const fetchTasks = useCallback(() => {
    if (!token || !selectedTeamId) return;
    setTasksLoading(true);
    fetch(`/api/team-portal/tasks?teamId=${selectedTeamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : data.tasks || []);
      })
      .catch(() => {})
      .finally(() => setTasksLoading(false));
  }, [token, selectedTeamId]);

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, [fetchTeams, fetchEmployees]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const fetchComments = useCallback(
    (taskId: string) => {
      if (!token) return;
      setCommentsLoading(true);
      fetch(`/api/team-portal/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setComments(Array.isArray(data) ? data : data.comments || []);
        })
        .catch(() => {})
        .finally(() => setCommentsLoading(false));
    },
    [token]
  );

  const moveTask = async (taskId: string, newStatus: Task["status"]) => {
    if (!token) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await fetch(`/api/team-portal/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      fetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!token) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await fetch(`/api/team-portal/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchTasks();
    }
  };

  const createTask = async () => {
    if (!token || !newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/team-portal/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          teamId: selectedTeamId,
          assigneeId: newAssignee || undefined,
          priority: newPriority,
          dueDate: newDueDate || undefined,
        }),
      });
      if (res.ok) {
        setAddModalOpen(false);
        setNewTitle("");
        setNewDescription("");
        setNewAssignee("");
        setNewPriority("Medium");
        setNewDueDate("");
        fetchTasks();
      }
    } catch {}
    setCreating(false);
  };

  const addComment = async () => {
    if (!token || !detailTask || !newComment.trim()) return;
    setSendingComment(true);
    try {
      const res = await fetch(`/api/team-portal/tasks/${detailTask.id}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments(detailTask.id);
        fetchTasks();
      }
    } catch {}
    setSendingComment(false);
  };

  const openDetail = (task: Task) => {
    setDetailTask(task);
    setDetailModalOpen(true);
    setComments([]);
    setNewComment("");
    fetchComments(task.id);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#C41E3A]">Team Portal</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleNav.map((item) => {
            const isActive = item.path === "/team-portal/tasks";
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
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block">Tasks</h2>
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
              const isActive = item.path === "/team-portal/tasks";
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
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Tasks</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your team's tasks</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setAddModalOpen(true)}
                  className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
                  disabled={!selectedTeamId}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>
          </motion.div>

          {tasksLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.key);
                return (
                  <div key={col.key} className="flex flex-col">
                    <div className={`${col.headerBg} rounded-t-lg px-4 py-3 border ${col.borderColor}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${col.color}`} />
                        <h4 className="font-semibold text-gray-800 text-sm">{col.label}</h4>
                        <span className="text-xs text-gray-500 ml-auto">{columnTasks.length}</span>
                      </div>
                    </div>
                    <div className={`border border-t-0 ${col.borderColor} rounded-b-lg bg-gray-50/50 p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto`}>
                      {columnTasks.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-8">No tasks</p>
                      )}
                      {columnTasks.map((task, idx) => {
                        const statusIdx = STATUS_ORDER.indexOf(task.status);
                        const canMoveLeft = statusIdx > 0;
                        const canMoveRight = statusIdx < STATUS_ORDER.length - 1;
                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.03 }}
                          >
                            <Card
                              className="p-3 bg-white hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => openDetail(task)}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h5 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                                  {task.title}
                                </h5>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}>
                                  {task.priority}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                {task.assigneeName && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {task.assigneeName}
                                  </span>
                                )}
                                {task.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                {(task.commentCount ?? 0) > 0 && (
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {task.commentCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 justify-end">
                                {canMoveLeft && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveTask(task.id, STATUS_ORDER[statusIdx - 1]);
                                    }}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {canMoveRight && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveTask(task.id, STATUS_ORDER[statusIdx + 1]);
                                    }}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {visibleNav.slice(0, 5).map((item) => {
            const isActive = item.path === "/team-portal/tasks";
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

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Team</label>
              <Select value={selectedTeamId} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Assignee</label>
              <Select value={newAssignee} onValueChange={setNewAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={createTask}
                disabled={creating || !newTitle.trim()}
                className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-6">{detailTask?.title}</DialogTitle>
          </DialogHeader>
          {detailTask && (
            <div className="space-y-4 mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded font-medium ${PRIORITY_COLORS[detailTask.priority] || PRIORITY_COLORS.Medium}`}>
                  <Flag className="w-3 h-3 inline mr-1" />
                  {detailTask.priority}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">
                  {detailTask.status === "todo" ? "To Do" : detailTask.status === "in_progress" ? "In Progress" : "Done"}
                </span>
              </div>
              {detailTask.description && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{detailTask.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {detailTask.assigneeName && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Assignee</label>
                    <p className="text-gray-700 flex items-center gap-1 mt-1">
                      <User className="w-3.5 h-3.5" />
                      {detailTask.assigneeName}
                    </p>
                  </div>
                )}
                {detailTask.dueDate && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Due Date</label>
                    <p className="text-gray-700 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(detailTask.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    deleteTask(detailTask.id);
                    setDetailModalOpen(false);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4" />
                  Comments
                </h4>
                {commentsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No comments yet</p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{c.authorName}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        addComment();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={addComment}
                    disabled={sendingComment || !newComment.trim()}
                    className="bg-[#C41E3A] hover:bg-[#A3182F] text-white"
                  >
                    {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}