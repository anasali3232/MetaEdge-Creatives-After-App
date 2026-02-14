import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useUpload } from "@/hooks/use-upload";
import AdminLogin from "@/components/AdminLogin";
import { Link } from "wouter";
import type { PageMeta } from "@shared/schema";
import {
  ArrowLeft,
  FileText,
  Save,
  X,
  Search,
  Globe,
  Tag,
  Type,
  AlignLeft,
  Image,
  Loader2,
  ShieldX,
  LogOut,
  ChevronDown,
  ChevronUp,
  Upload,
  Link2,
} from "lucide-react";

function PageEditor({
  page,
  token,
  onClose,
  onSaved,
}: {
  page: PageMeta;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pageName, setPageName] = useState(page.pageName || "");
  const [title, setTitle] = useState(page.title || "");
  const [metaTitle, setMetaTitle] = useState(page.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(page.metaDescription || "");
  const [description, setDescription] = useState(page.description || "");
  const [ogImage, setOgImage] = useState(page.ogImage || "");
  const [keywords, setKeywords] = useState(page.keywords || "");
  const { toast } = useToast();
  const ogFileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile: uploadOgImage, isUploading: isOgUploading } = useUpload({
    onSuccess: (response) => {
      setOgImage(response.objectPath);
      toast({ title: "Image uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to upload image", variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/pages/${encodeURIComponent(page.pageSlug)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pageName,
          title: title || null,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          description: description || null,
          ogImage: ogImage || null,
          keywords: keywords || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Page settings saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      onSaved();
    },
    onError: () => {
      toast({ title: "Failed to save page settings", variant: "destructive" });
    },
  });

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-page-editor-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !pageName}
            data-testid="button-save-page"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground" data-testid="heading-editing-page">
            Editing: {page.pageName}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Slug:</span>
            <code className="text-sm bg-gray-100 px-2 py-0.5 rounded font-mono" data-testid="text-page-slug">
              /{page.pageSlug}
            </code>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Basic Info
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Page Name</label>
                <input
                  type="text"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. Home, About Us"
                  data-testid="input-page-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Page Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. MetaEdge Creatives - Innovate, Create, Elevate"
                  data-testid="input-page-title"
                />
                <p className="text-xs text-muted-foreground mt-1">Shown in the browser tab</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="A short description of this page"
                  data-testid="input-page-description"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" />
              SEO Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="SEO title (shown in search results)"
                  data-testid="input-meta-title"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metaTitle.length}/60 characters (recommended max 60)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="SEO description (shown in search results)"
                  data-testid="input-meta-description"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metaDescription.length}/160 characters (recommended max 160)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. web development, digital marketing, SEO"
                  data-testid="input-keywords"
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated keywords for SEO</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Social Media / Open Graph
            </h3>
            <div>
              <label className="block text-sm font-medium mb-2">OG Image</label>
              {ogImage && (
                <div className="relative mb-3 inline-block">
                  <img
                    src={ogImage}
                    alt="OG Preview"
                    className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200"
                    data-testid="img-og-preview"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 bg-white/80 h-6 w-6"
                    onClick={() => setOgImage("")}
                    data-testid="button-remove-og-image"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <input
                ref={ogFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadOgImage(file);
                  e.target.value = "";
                }}
                data-testid="input-og-file"
              />
              <div className="flex items-center gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => ogFileInputRef.current?.click()}
                  disabled={isOgUploading}
                  data-testid="button-upload-og-image"
                >
                  {isOgUploading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  {isOgUploading ? "Uploading..." : "Upload Image"}
                </Button>
                {ogImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOgImage("")}
                    data-testid="button-clear-og"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Or paste image URL..."
                data-testid="input-og-image"
              />
              <p className="text-xs text-muted-foreground mt-1">Image shown when shared on social media (recommended: 1200x630px)</p>
            </div>
          </Card>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Result Preview
            </h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-blue-700 text-lg font-medium truncate">
                {metaTitle || title || `${pageName} | MetaEdge Creatives`}
              </p>
              <p className="text-green-700 text-sm">
                metaedgecreatives.com/{page.pageSlug === "home" ? "" : page.pageSlug}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {metaDescription || description || "No description set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PagesList({
  token,
  logout,
  hasPermission,
}: {
  token: string;
  logout: () => void;
  hasPermission: (p: string) => boolean;
}) {
  const [editingPage, setEditingPage] = useState<PageMeta | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    main: true,
    services: true,
    platforms: false,
    legal: false,
  });
  const { toast } = useToast();

  const { data: pages = [], isLoading } = useQuery<PageMeta[]>({
    queryKey: ["/api/admin/pages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pages");
      return res.json();
    },
  });

  if (editingPage) {
    return (
      <PageEditor
        page={editingPage}
        token={token}
        onClose={() => setEditingPage(undefined)}
        onSaved={() => setEditingPage(undefined)}
      />
    );
  }

  const mainPages = pages.filter(
    (p) =>
      !p.pageSlug.startsWith("services/") &&
      !p.pageSlug.startsWith("platforms/") &&
      !["privacy-policy", "terms-of-service", "workspace-policy"].includes(p.pageSlug)
  );
  const servicePages = pages.filter((p) => p.pageSlug.startsWith("services/"));
  const platformPages = pages.filter((p) => p.pageSlug.startsWith("platforms/"));
  const legalPages = pages.filter((p) =>
    ["privacy-policy", "terms-of-service", "workspace-policy"].includes(p.pageSlug)
  );

  const filterPages = (list: PageMeta[]) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.pageName.toLowerCase().includes(q) ||
        p.pageSlug.toLowerCase().includes(q)
    );
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const getCompletionStatus = (page: PageMeta) => {
    const fields = [page.title, page.metaTitle, page.metaDescription, page.description, page.keywords];
    const filled = fields.filter((f) => f && f.trim()).length;
    return { filled, total: fields.length };
  };

  const renderPageGroup = (label: string, groupKey: string, groupPages: PageMeta[]) => {
    const filtered = filterPages(groupPages);
    if (filtered.length === 0 && searchQuery) return null;
    const isExpanded = expandedGroups[groupKey];

    return (
      <div key={groupKey} className="mb-6">
        <button
          onClick={() => toggleGroup(groupKey)}
          className="flex items-center gap-2 mb-3 w-full text-left"
          data-testid={`button-toggle-group-${groupKey}`}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="text-xs text-muted-foreground">({filtered.length})</span>
        </button>
        {isExpanded && (
          <div className="space-y-2">
            {filtered.map((page) => {
              const status = getCompletionStatus(page);
              return (
                <Card
                  key={page.id}
                  className="p-4 cursor-pointer hover-elevate transition-all duration-200"
                  onClick={() => setEditingPage(page)}
                  data-testid={`card-page-${page.pageSlug}`}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <h3 className="font-semibold text-sm">{page.pageName}</h3>
                        <span className="text-xs text-muted-foreground">/{page.pageSlug}</span>
                      </div>
                      {page.metaTitle && (
                        <p className="text-xs text-muted-foreground mt-1 truncate ml-6">
                          {page.metaTitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: status.total }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-4 rounded-full ${
                              i < status.filled ? "bg-green-500" : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {status.filled}/{status.total}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
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
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold" data-testid="heading-pages-admin">
              Page Manager
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              data-testid="button-pages-logout"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              data-testid="input-search-pages"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Globe className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No pages found</h3>
            <p className="text-muted-foreground">Pages will appear here once the server seeds them.</p>
          </div>
        ) : (
          <>
            {renderPageGroup("Main Pages", "main", mainPages)}
            {renderPageGroup("Service Pages", "services", servicePages)}
            {renderPageGroup("Platform Pages", "platforms", platformPages)}
            {renderPageGroup("Legal Pages", "legal", legalPages)}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminPages() {
  const { token, user, isLoading, login, logout, hasPermission, isSuperAdmin } = useAdminAuth();

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

  if (!hasPermission("pages")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="p-8 max-w-md text-center">
          <ShieldX className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to manage pages.</p>
          <Link href="/admin">
            <Button data-testid="button-back-to-dashboard">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <PagesList token={token} logout={logout} hasPermission={hasPermission} />;
}
