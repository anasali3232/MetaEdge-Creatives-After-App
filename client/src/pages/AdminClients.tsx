import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Users, LogOut, Loader2, Building2, Mail, Calendar, ChevronDown, ChevronUp, Plus, Edit, Trash2, ShieldX, ToggleLeft, ToggleRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import logoImage from "@/assets/logo-metaedge.webp";

interface ClientData {
  id: number;
  name: string;
  email: string;
  company: string | null;
  isActive: boolean;
  createdAt: string;
  servicesCount?: number;
}

interface ClientService {
  id: number;
  serviceId: number;
  serviceName: string;
  status: string;
  notes: string | null;
  assignedAt: string;
}

interface ClientDetail extends ClientData {
  services: ClientService[];
}

interface ServiceOption {
  id: number;
  name: string;
}

function ClientDetailView({ client, token, onClose }: { client: ClientData; token: string; onClose: () => void }) {
  const { toast } = useToast();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editingService, setEditingService] = useState<ClientService | null>(null);
  const [assignServiceId, setAssignServiceId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: detail, isLoading } = useQuery<ClientDetail>({
    queryKey: [`/api/admin/clients/${client.id}`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch client details");
      return res.json();
    },
  });

  const { data: services = [] } = useQuery<ServiceOption[]>({
    queryKey: ["/api/admin/services"],
    queryFn: async () => {
      const res = await fetch("/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json();
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/clients/${client.id}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serviceId: parseInt(assignServiceId), notes: assignNotes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to assign service");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Service assigned successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/clients/${client.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clients"] });
      setAssignDialogOpen(false);
      setAssignServiceId("");
      setAssignNotes("");
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      const res = await fetch(`/api/admin/client-services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update service");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Service updated" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/clients/${client.id}`] });
      setEditingService(null);
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const removeServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/client-services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove service");
    },
    onSuccess: () => {
      toast({ title: "Service removed" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/clients/${client.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clients"] });
    },
    onError: () => {
      toast({ title: "Failed to remove service", variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
      if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
      const res = await fetch(`/api/admin/clients/${client.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated successfully" });
      setPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const formatDate = (date: string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-foreground">{client.name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{client.email}</span>
              {client.company && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{client.company}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {formatDate(client.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>
              <KeyRound className="w-4 h-4 mr-1" />
              Reset Password
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h4 className="font-semibold text-foreground">Assigned Services</h4>
          <Button size="sm" onClick={() => setAssignDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Assign Service
          </Button>
        </div>

        {detail?.services && detail.services.length > 0 ? (
          <div className="space-y-3">
            {detail.services.map((svc) => (
              <div key={svc.id} className="border rounded-lg p-4">
                {editingService?.id === svc.id ? (
                  <div className="space-y-3">
                    <p className="font-medium text-foreground">{svc.serviceName}</p>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Status</label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Notes</label>
                      <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateServiceMutation.mutate({ id: svc.id, status: editStatus, notes: editNotes })} disabled={updateServiceMutation.isPending}>
                        {updateServiceMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-foreground">{svc.serviceName}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(svc.status)}`}>
                          {svc.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(svc.assignedAt)}</span>
                      </div>
                      {svc.notes && <p className="text-sm text-muted-foreground mt-1">{svc.notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingService(svc); setEditStatus(svc.status); setEditNotes(svc.notes || ""); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Remove this service?")) removeServiceMutation.mutate(svc.id); }} disabled={removeServiceMutation.isPending}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">No services assigned yet.</p>
        )}

        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Service</DialogTitle>
              <DialogDescription>Select a service to assign to {client.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Service</label>
                <Select value={assignServiceId} onValueChange={setAssignServiceId}>
                  <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <Textarea value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} placeholder="Optional notes..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => assignMutation.mutate()} disabled={!assignServiceId || assignMutation.isPending}>
                {assignMutation.isPending ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>Set a new password for {client.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1 block">New Password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setPasswordDialogOpen(false); setNewPassword(""); setConfirmPassword(""); }}>Cancel</Button>
              <Button onClick={() => resetPasswordMutation.mutate()} disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 6 || resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
}

function ClientsManager({ token, onLogout }: { token: string; onLogout: () => void }) {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const { data: clients = [], isLoading } = useQuery<ClientData[]>({
    queryKey: ["/api/admin/clients"],
    queryFn: async () => {
      const res = await fetch("/api/admin/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/admin/clients/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Client status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clients"] });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const formatDate = (date: string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="MetaEdge Creatives" className="h-10 object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Client Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">View Site</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Client Management</h2>
            <Badge variant="secondary" className="ml-2">{clients.length} clients</Badge>
          </div>

          {selectedClient ? (
            <ClientDetailView client={selectedClient} token={token} onClose={() => setSelectedClient(null)} />
          ) : isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : clients.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No clients yet</h3>
              <p className="text-muted-foreground text-sm">Client accounts will appear here once they sign up.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {clients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedClient(client)}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-bold text-foreground">{client.name}</span>
                          <Badge variant={client.isActive ? "default" : "secondary"} className={client.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600"}>
                            {client.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{client.email}</span>
                          {client.company && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{client.company}</span>}
                          {client.servicesCount !== undefined && (
                            <span className="text-xs">{client.servicesCount} service{client.servicesCount !== 1 ? "s" : ""}</span>
                          )}
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(client.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); toggleStatusMutation.mutate({ id: client.id, isActive: client.isActive }); }}
                        disabled={toggleStatusMutation.isPending}
                      >
                        {client.isActive ? <ToggleRight className="w-4 h-4 mr-1 text-green-600" /> : <ToggleLeft className="w-4 h-4 mr-1 text-gray-400" />}
                        {client.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminClients() {
  const { token, user, isLoading, login, logout, hasPermission } = useAdminAuth();

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

  if (!hasPermission("clients")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="p-8 text-center max-w-md">
          <ShieldX className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to manage clients.</p>
          <Link href="/admin"><Button>Back to Dashboard</Button></Link>
        </Card>
      </div>
    );
  }

  return <ClientsManager token={token} onLogout={logout} />;
}
