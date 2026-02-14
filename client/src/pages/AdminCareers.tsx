import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import { Link } from "wouter";
import type { Career } from "@shared/schema";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Briefcase,
  Eye,
  EyeOff,
  Bold,
  List,
  Loader2,
  ShieldX,
} from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function CareerEditor({
  job,
  token,
  onClose,
  onSaved,
}: {
  job?: Career;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(job?.title || "");
  const [slug, setSlug] = useState(job?.slug || "");
  const [type, setType] = useState(job?.type || "Full-time");
  const [location, setLocation] = useState(job?.location || "Remote");
  const [description, setDescription] = useState(job?.description || "");
  const [responsibilitiesStr, setResponsibilitiesStr] = useState(
    job?.responsibilities?.join("\n") || ""
  );
  const [requirementsStr, setRequirementsStr] = useState(
    job?.requirements?.join("\n") || ""
  );
  const [published, setPublished] = useState(job?.published ?? true);
  const [autoSlug, setAutoSlug] = useState(!job);
  const { toast } = useToast();

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const responsibilities = responsibilitiesStr
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      const requirements = requirementsStr
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      const body = {
        title,
        slug,
        type,
        location,
        description,
        responsibilities,
        requirements,
        published,
      };

      const url = job ? `/api/admin/careers/${job.id}` : "/api/admin/careers";
      const method = job ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: job ? "Job listing updated" : "Job listing created",
        description: published
          ? "The position is now live on your careers page."
          : "The position has been saved as hidden.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      onSaved();
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

    const insertAtCursor = (textareaId: string, textBefore: string, textAfter: string) => {
      const textarea = document.querySelector(`textarea[data-testid="${textareaId}"]`) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const selectedText = value.substring(start, end);
      const before = value.substring(0, start);
      const after = value.substring(end);

      const newValue = before + textBefore + selectedText + textAfter + after;
      
      if (textareaId === "input-career-description") setDescription(newValue);
      else if (textareaId === "input-career-responsibilities") setResponsibilitiesStr(newValue);
      else if (textareaId === "input-career-requirements") setRequirementsStr(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + textBefore.length,
          start + textBefore.length + selectedText.length
        );
      }, 0);
    };

    return (
      <div className="bg-white min-h-screen">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-career-editor-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !title || !description}
              data-testid="button-save-career"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : job ? "Update" : "Create"}
            </Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Admin Assistant"
                  className="w-full px-4 py-3 text-xl font-bold rounded-xl border border-gray-200 focus:outline-none focus:border-primary/40 transition-colors"
                  data-testid="input-career-title"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Description</label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertAtCursor("input-career-description", "**", "**")}
                      className="h-8 px-2"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, what the person will do, and any other details..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-y"
                  data-testid="input-career-description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Responsibilities{" "}
                  <span className="text-muted-foreground font-normal">
                    (one per line)
                  </span>
                </label>
                <textarea
                  value={responsibilitiesStr}
                  onChange={(e) => setResponsibilitiesStr(e.target.value)}
                  placeholder="Manage daily schedules and appointments
Handle email correspondence
Organize and maintain digital files"
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-y"
                  data-testid="input-career-responsibilities"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Requirements{" "}
                  <span className="text-muted-foreground font-normal">
                    (one per line)
                  </span>
                </label>
                <textarea
                  value={requirementsStr}
                  onChange={(e) => setRequirementsStr(e.target.value)}
                  placeholder="Strong organizational skills
Excellent communication abilities
Proficiency in Microsoft Office"
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-y"
                  data-testid="input-career-requirements"
                />
              </div>
            </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-sm">Position Settings</h3>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  placeholder="job-url-slug"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                  data-testid="input-career-slug"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  /careers/{slug || "..."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                  Job Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors bg-white"
                  data-testid="select-career-type"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, On-site, Hybrid"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                  data-testid="input-career-location"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPublished(!published)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    published ? "bg-primary" : "bg-gray-300"
                  }`}
                  data-testid="toggle-career-publish"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      published ? "translate-x-5" : ""
                    }`}
                  />
                </button>
                <span className="text-sm font-medium">
                  {published ? "Published" : "Hidden"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCareers() {
  const { token, user, isLoading: authLoading, login, logout, hasPermission } = useAdminAuth();
  const [editingJob, setEditingJob] = useState<Career | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { data: jobs = [], isLoading } = useQuery<Career[]>({
    queryKey: ["/api/admin/careers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/careers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      queryClient.removeQueries({ queryKey: ["/api/careers"] });
      toast({ title: "Deleted", description: "Job listing has been deleted." });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({
      id,
      published,
    }: {
      id: string;
      published: boolean;
    }) => {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      queryClient.removeQueries({ queryKey: ["/api/careers"] });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={login} />;
  }

  if (!hasPermission("careers")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <ShieldX className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2" data-testid="heading-careers-access-denied">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You do not have permission to manage careers.</p>
          <Button variant="outline" onClick={logout} data-testid="button-careers-denied-logout">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  if (isCreating || editingJob) {
    return (
      <CareerEditor
        job={editingJob}
        token={token}
        onClose={() => {
          setIsCreating(false);
          setEditingJob(undefined);
        }}
        onSaved={() => {
          setIsCreating(false);
          setEditingJob(undefined);
        }}
      />
    );
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="p-2 rounded-xl bg-primary/10">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold" data-testid="heading-careers-admin">
              Careers Admin
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              onClick={() => setIsCreating(true)}
              data-testid="button-new-career"
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 animate-pulse-subtle"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Position
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              data-testid="button-careers-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {jobs.length} total position{jobs.length !== 1 ? "s" : ""} |{" "}
            {jobs.filter((j) => j.published).length} published |{" "}
            {jobs.filter((j) => !j.published).length} hidden
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse"
              >
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Briefcase className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No job listings yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first job listing to get started.
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              data-testid="button-create-first-career"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Position
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                data-testid={`admin-career-${job.id}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-base truncate">
                        {job.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          job.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {job.published ? "Published" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {job.type} | {job.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {formatDate(job.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        togglePublishMutation.mutate({
                          id: job.id,
                          published: !job.published,
                        })
                      }
                      title={job.published ? "Hide" : "Publish"}
                      data-testid={`button-toggle-career-${job.id}`}
                    >
                      {job.published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingJob(job)}
                      data-testid={`button-edit-career-${job.id}`}
                    >
                      <Briefcase className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this job listing?"
                          )
                        ) {
                          deleteMutation.mutate(job.id);
                        }
                      }}
                      data-testid={`button-delete-career-${job.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
