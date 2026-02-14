import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, UserCog, Plus, Trash2, Edit, Shield, ShieldCheck, Mail, Key, X, Check, Loader2, ShieldX, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import { ADMIN_PERMISSIONS } from "@shared/schema";

interface AdminUserData {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

const PERMISSION_LABELS: Record<string, string> = {
  blog: "Blog Posts",
  careers: "Career Listings",
  team: "Team Members",
  messages: "Form Submissions",
  settings: "Site Settings",
  users: "User Management",
  clients: "Client Management",
  tickets: "Support Tickets",
  applications: "Job Applications",
  faqs: "FAQ Management",
  pages: "Page Manager",
};

function UserEditor({
  token,
  editingUser,
  onClose,
}: {
  token: string;
  editingUser: AdminUserData | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(editingUser?.name || "");
  const [email, setEmail] = useState(editingUser?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(editingUser?.role || "admin");
  const [permissions, setPermissions] = useState<string[]>(editingUser?.permissions || []);
  const [isActive, setIsActive] = useState(editingUser?.isActive ?? true);

  const isEditing = !!editingUser;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEditing) {
        const body: Record<string, any> = { name, email, role, permissions, isActive };
        if (password.trim()) body.password = password;
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update user");
        }
        return res.json();
      } else {
        if (!password.trim()) throw new Error("Password is required for new users");
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, email, password, role, permissions }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create user");
        }
        return res.json();
      }
    },
    onSuccess: () => {
      toast({ title: isEditing ? "User updated" : "User created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const selectAllPermissions = () => {
    setPermissions([...ADMIN_PERMISSIONS]);
  };

  const clearAllPermissions = () => {
    setPermissions([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h3 className="text-lg font-bold text-foreground" data-testid="heading-user-editor">
            {isEditing ? "Edit User" : "Create New User"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-editor">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              data-testid="input-user-name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              data-testid="input-user-email"
              disabled={editingUser?.role === "super_admin"}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              {isEditing ? "New Password (leave empty to keep current)" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? "Leave empty to keep current" : "Minimum 6 characters"}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              data-testid="input-user-password"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
              data-testid="select-user-role"
              disabled={editingUser?.role === "super_admin"}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Super Admins have access to all sections. Regular Admins need specific permissions.
            </p>
          </div>

          {role === "admin" && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <label className="text-sm font-medium text-foreground">Permissions</label>
                <div className="flex gap-2">
                  <button onClick={selectAllPermissions} className="text-xs text-primary hover:underline" data-testid="button-select-all-perms">
                    Select All
                  </button>
                  <button onClick={clearAllPermissions} className="text-xs text-muted-foreground hover:underline" data-testid="button-clear-all-perms">
                    Clear All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ADMIN_PERMISSIONS.map((perm) => (
                  <button
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      permissions.includes(perm)
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-muted-foreground hover:border-gray-300"
                    }`}
                    data-testid={`button-perm-${perm}`}
                  >
                    {permissions.includes(perm) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 rounded border border-gray-300" />
                    )}
                    {PERMISSION_LABELS[perm]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Account Active</label>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? "bg-primary" : "bg-gray-300"
                }`}
                data-testid="toggle-user-active"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !name.trim() || !email.trim()}
              data-testid="button-save-user"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isEditing ? "Update User" : "Create User"}
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-user">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function UserCard({
  user,
  token,
  onEdit,
  index,
}: {
  user: AdminUserData;
  token: string;
  onEdit: (user: AdminUserData) => void;
  index: number;
}) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
    },
    onSuccess: () => {
      toast({ title: "User deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={`p-5 ${!user.isActive ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                {user.role === "super_admin" ? (
                  <ShieldCheck className="w-5 h-5 text-primary" />
                ) : (
                  <Shield className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="font-bold text-foreground" data-testid={`text-user-name-${user.id}`}>
                  {user.name}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === "super_admin"
                    ? "bg-primary/10 text-primary"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {user.role === "super_admin" ? "Super Admin" : "Admin"}
              </span>
              {!user.isActive && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  Inactive
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </div>

            {user.role === "admin" && user.permissions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {user.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                    data-testid={`badge-perm-${user.id}-${perm}`}
                  >
                    {PERMISSION_LABELS[perm] || perm}
                  </span>
                ))}
              </div>
            )}

            {user.role === "super_admin" && (
              <p className="text-xs text-muted-foreground mt-1">Full access to all sections</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(user)}
              data-testid={`button-edit-user-${user.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {user.role !== "super_admin" && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (confirm(`Delete ${user.name}? This cannot be undone.`)) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-user-${user.id}`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function UsersManager({ token }: { token: string }) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);

  const { data: users = [], isLoading } = useQuery<AdminUserData[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const handleEdit = (user: AdminUserData) => {
    setEditingUser(user);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground" data-testid="heading-users-management">Admin Users</h1>
              <p className="text-xs text-muted-foreground">{users.length} user{users.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {!showEditor && (
            <Button onClick={handleCreate} data-testid="button-create-user">
              <Plus className="w-4 h-4 mr-1" />
              Create User
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {showEditor ? (
          <UserEditor
            token={token}
            editingUser={editingUser}
            onClose={handleCloseEditor}
          />
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <Card className="p-12 text-center">
            <UserCog className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No users found</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first admin user.</p>
            <Button onClick={handleCreate} data-testid="button-create-first-user">
              <Plus className="w-4 h-4 mr-1" />
              Create User
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {users.map((user, index) => (
              <UserCard key={user.id} user={user} token={token} onEdit={handleEdit} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminUsers() {
  const { token, user, isLoading, login, logout, isSuperAdmin } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !user) {
    return <AdminLogin onLogin={login} />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <Card className="p-8 text-center max-w-md w-full">
          <ShieldX className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-6">Only Super Admins can manage users.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/admin">
              <Button variant="outline" data-testid="button-back-to-dashboard">Back to Dashboard</Button>
            </Link>
            <Button variant="ghost" onClick={logout} data-testid="button-denied-logout">
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <UsersManager token={token} />;
}
