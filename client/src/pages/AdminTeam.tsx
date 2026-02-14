import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Plus, Edit2, Trash2, Users, Save, X, ChevronUp, ChevronDown, Upload, Loader2, ShieldX, LogOut, Linkedin, Globe, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useUpload } from "@/hooks/use-upload";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import type { TeamMember } from "@shared/schema";

function MemberEditor({
  member,
  token,
  onClose,
  onSaved,
}: {
  member?: TeamMember;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(member?.name || "");
  const [role, setRole] = useState(member?.role || "");
  const [description, setDescription] = useState(member?.description || "");
  const [imageUrl, setImageUrl] = useState(member?.imageUrl || "");
  const [displayOrder, setDisplayOrder] = useState(member?.displayOrder || "0");
  const [linkedinUrl, setLinkedinUrl] = useState(member?.linkedinUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(member?.twitterUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(member?.instagramUrl || "");
  const [facebookUrl, setFacebookUrl] = useState(member?.facebookUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(member?.websiteUrl || "");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setImageUrl(response.objectPath);
      toast({ title: "Photo uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    },
  });

  const normalizeUrl = (url: string): string | null => {
    if (!url.trim()) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    return `https://${trimmed}`;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name, role, description,
        imageUrl: imageUrl || null,
        displayOrder,
        linkedinUrl: normalizeUrl(linkedinUrl),
        twitterUrl: normalizeUrl(twitterUrl),
        instagramUrl: normalizeUrl(instagramUrl),
        facebookUrl: normalizeUrl(facebookUrl),
        websiteUrl: normalizeUrl(websiteUrl),
      };
      const url = member ? `/api/admin/team/${member.id}` : "/api/admin/team";
      const method = member ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: member ? "Team member updated" : "Team member added" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      onSaved();
    },
    onError: () => {
      toast({ title: "Failed to save team member", variant: "destructive" });
    },
  });

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h3 className="text-lg font-bold text-foreground" data-testid="heading-member-editor">
            {member ? "Edit Team Member" : "Add Team Member"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-editor">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className={inputClass}
                data-testid="input-member-name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Role / Title *</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. CEO & Founder"
                className={inputClass}
                data-testid="input-member-role"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief bio or description..."
              rows={3}
              className={`${inputClass} resize-none`}
              data-testid="input-member-description"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Photo</label>
            <div className="flex items-start gap-4 flex-wrap">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                />
              )}
              <div className="flex-1 min-w-[200px] space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFile(file);
                      e.target.value = "";
                    }}
                    data-testid="input-member-photo-file"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    data-testid="button-upload-member-photo"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-1" />
                    )}
                    {isUploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                  {imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageUrl("")}
                      data-testid="button-remove-member-photo"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste image URL..."
                  className={inputClass}
                  data-testid="input-member-image"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="0"
              min="0"
              className={`${inputClass} max-w-[120px]`}
              data-testid="input-member-order"
            />
          </div>

          <div className="border-t pt-5">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Social Media Links
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className={inputClass}
                  data-testid="input-member-linkedin"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5" /> Twitter / X
                </label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/username"
                  className={inputClass}
                  data-testid="input-member-twitter"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className={inputClass}
                  data-testid="input-member-instagram"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5" /> Facebook
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/username"
                  className={inputClass}
                  data-testid="input-member-facebook"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Website
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={inputClass}
                  data-testid="input-member-website"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-member">
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !name || !role || !description}
              data-testid="button-save-member"
            >
              <Save className="w-4 h-4 mr-1" />
              {saveMutation.isPending ? "Saving..." : "Save Member"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function TeamManager({ token }: { token: string }) {
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/admin/team"],
    queryFn: async () => {
      const res = await fetch("/api/admin/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast({ title: "Team member removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
    },
    onError: () => {
      toast({ title: "Failed to remove team member", variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; displayOrder: number }[]) => {
      const res = await fetch("/api/admin/team/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
    },
    onError: () => {
      toast({ title: "Failed to reorder", variant: "destructive" });
    },
  });

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const current = members[index];
    const above = members[index - 1];
    reorderMutation.mutate([
      { id: current.id, displayOrder: parseInt(above.displayOrder, 10) || index - 1 },
      { id: above.id, displayOrder: parseInt(current.displayOrder, 10) || index },
    ]);
  };

  const moveDown = (index: number) => {
    if (index >= members.length - 1) return;
    const current = members[index];
    const below = members[index + 1];
    reorderMutation.mutate([
      { id: current.id, displayOrder: parseInt(below.displayOrder, 10) || index + 1 },
      { id: below.id, displayOrder: parseInt(current.displayOrder, 10) || index },
    ]);
  };

  const socialIcons = (member: TeamMember) => {
    const links = [
      { url: member.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
      { url: member.twitterUrl, icon: Twitter, label: "Twitter" },
      { url: member.instagramUrl, icon: Instagram, label: "Instagram" },
      { url: member.facebookUrl, icon: Facebook, label: "Facebook" },
      { url: member.websiteUrl, icon: Globe, label: "Website" },
    ].filter(l => l.url);
    if (links.length === 0) return null;
    return (
      <div className="flex items-center gap-1.5 mt-1.5">
        {links.map(l => (
          <a key={l.label} href={l.url!} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title={l.label}>
            <l.icon className="w-3.5 h-3.5" />
          </a>
        ))}
      </div>
    );
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
              <h1 className="text-lg font-bold text-foreground" data-testid="heading-team-management">Team Management</h1>
              <p className="text-xs text-muted-foreground">{members.length} team member{members.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button
            onClick={() => { setIsCreating(true); setEditingMember(undefined); }}
            data-testid="button-add-member"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Member
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {(isCreating || editingMember) && (
          <MemberEditor
            member={editingMember}
            token={token}
            onClose={() => { setIsCreating(false); setEditingMember(undefined); }}
            onSaved={() => { setIsCreating(false); setEditingMember(undefined); }}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : members.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No team members yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Add your first team member to get started.</p>
              <Button onClick={() => setIsCreating(true)} data-testid="button-add-first-member">
                <Plus className="w-4 h-4 mr-1" />
                Add First Member
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-5">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0 || reorderMutation.isPending}
                          className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono text-muted-foreground">#{member.displayOrder}</span>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === members.length - 1 || reorderMutation.isPending}
                          className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {member.name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate" data-testid={`text-member-name-${member.id}`}>
                          {member.name}
                        </h3>
                        <p className="text-sm text-primary font-medium">{member.role}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{member.description}</p>
                        {socialIcons(member)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setEditingMember(member); setIsCreating(false); }}
                          data-testid={`button-edit-member-${member.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Remove ${member.name} from the team?`)) {
                              deleteMutation.mutate(member.id);
                            }
                          }}
                          data-testid={`button-delete-member-${member.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
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

export default function AdminTeam() {
  const { token, user, isLoading, login, logout, hasPermission } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={login} />;
  }

  if (!hasPermission("team")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <ShieldX className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2" data-testid="heading-access-denied">Access Denied</h1>
          <p className="text-muted-foreground text-sm mb-6">You do not have permission to manage team members.</p>
          <div className="flex justify-center gap-2">
            <Link href="/admin">
              <Button variant="outline" data-testid="button-back-to-dashboard">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <Button variant="ghost" onClick={logout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <TeamManager token={token} />;
}
