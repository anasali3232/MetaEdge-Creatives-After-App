import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  X,
  BookOpen,
  FileText,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
  ChevronDown,
  Image as ImageIcon,
  Upload,
  Loader2,
  ShieldAlert,
} from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function BlogEditor({
  post,
  token,
  onClose,
  onSaved,
}: {
  post?: BlogPost;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [tagsStr, setTagsStr] = useState(post?.tags?.join(", ") || "");
  const [published, setPublished] = useState(post?.published || false);
  const [autoSlug, setAutoSlug] = useState(!post);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const { toast } = useToast();
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { uploadFile: uploadCoverImage, isUploading: isCoverUploading } = useUpload({
    onSuccess: (response) => {
      setCoverImage(response.objectPath);
      toast({ title: "Cover image uploaded" });
    },
    onError: () => {
      toast({ title: "Failed to upload cover image", variant: "destructive" });
    },
  });
  const { uploadFile: uploadInlineImage, isUploading: isInlineUploading } = useUpload({
    onSuccess: (response) => {
      insertAtCursor(`![image](${response.objectPath})`, "");
      toast({ title: "Image inserted" });
    },
    onError: () => {
      toast({ title: "Failed to upload image", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const saveMutation = useMutation({
    mutationFn: async (shouldPublish: boolean) => {
      const tags = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const body = {
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImage || null,
        tags,
        published: shouldPublish,
        publishedAt: shouldPublish ? new Date().toISOString() : null,
      };

      const url = post ? `/api/admin/blog/${post.id}` : "/api/admin/blog";
      const method = post ? "PATCH" : "POST";

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
        title: post ? "Blog post updated" : "Blog post created",
        description: published
          ? "The post is now live on your blog."
          : "The post has been saved as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
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

    const insertAtCursor = (textBefore: string, textAfter: string) => {
      const textarea = document.querySelector('textarea[data-testid="input-blog-content"]') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const selectedText = value.substring(start, end);
      const before = value.substring(0, start);
      const after = value.substring(end);

      const newValue = before + textBefore + selectedText + textAfter + after;
      setContent(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + textBefore.length,
          start + textBefore.length + selectedText.length
        );
      }, 0);
    };

    const replaceSelection = (replacement: string) => {
      const textarea = document.querySelector('textarea[data-testid="input-blog-content"]') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const before = value.substring(0, start);
      const after = value.substring(end);

      const newValue = before + replacement + after;
      setContent(newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
      }, 0);
    };

    return (
      <div className="bg-white min-h-screen">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-editor-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPublished(false);
                  saveMutation.mutate(false);
                }}
                disabled={saveMutation.isPending || !title || !content}
                data-testid="button-save-draft"
              >
                <FileText className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setPublished(true);
                  saveMutation.mutate(true);
                }}
                disabled={saveMutation.isPending || !title || !content || !excerpt}
                data-testid="button-publish"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending
                  ? "Saving..."
                  : published
                  ? "Update & Publish"
                  : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog post title..."
                  className="w-full px-4 py-3 text-xl font-bold rounded-xl border border-gray-200 focus:outline-none focus:border-primary/40 transition-colors"
                  data-testid="input-blog-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Write a brief summary of the post..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-none"
                  data-testid="input-blog-excerpt"
                />
              </div>

              <div>
                <div className="mb-2">
                  <label className="text-sm font-medium block mb-2">
                    Content{" "}
                    <span className="text-muted-foreground font-normal">
                      (Markdown supported)
                    </span>
                  </label>
                  <div className="flex items-center gap-1 flex-wrap bg-gray-50 border border-gray-200 rounded-t-xl px-2 py-1.5">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                        className="h-8 px-2 text-xs font-medium gap-1"
                        title="Headings"
                      >
                        <Heading1 className="w-4 h-4" />
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                      {showHeadingMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 min-w-[140px]">
                          {[
                            { label: "Heading 1", prefix: "# ", icon: Heading1 },
                            { label: "Heading 2", prefix: "## ", icon: Heading2 },
                            { label: "Heading 3", prefix: "### ", icon: Heading3 },
                            { label: "Heading 4", prefix: "#### ", icon: Heading4 },
                            { label: "Heading 5", prefix: "##### ", icon: Heading5 },
                            { label: "Heading 6", prefix: "###### ", icon: Heading6 },
                          ].map((h) => (
                            <button
                              key={h.label}
                              type="button"
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
                              onClick={() => {
                                insertAtCursor(h.prefix, "");
                                setShowHeadingMenu(false);
                              }}
                            >
                              <h.icon className="w-4 h-4" />
                              {h.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertAtCursor("\n\n", "")}
                      className="h-8 px-2"
                      title="Paragraph"
                    >
                      <Pilcrow className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-5 bg-gray-300 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertAtCursor("**", "**")}
                      className="h-8 px-2"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertAtCursor("*", "*")}
                      className="h-8 px-2"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertAtCursor("<u>", "</u>")}
                      className="h-8 px-2"
                      title="Underline"
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-5 bg-gray-300 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[data-testid="input-blog-content"]') as HTMLTextAreaElement;
                        const selectedText = textarea ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) : "";
                        const url = prompt("Enter URL:", "https://");
                        if (url) {
                          replaceSelection(`[${selectedText || "link text"}](${url})`);
                        }
                      }}
                      className="h-8 px-2"
                      title="Insert Link"
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertAtCursor("- ", "")}
                      className="h-8 px-2"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <input
                      ref={inlineImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadInlineImage(file);
                        e.target.value = "";
                      }}
                      data-testid="input-inline-image-file"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => inlineImageInputRef.current?.click()}
                      disabled={isInlineUploading}
                      className="h-8 px-2"
                      title="Upload & Insert Image"
                      data-testid="button-insert-image"
                    >
                      {isInlineUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post content here..."
                  rows={20}
                  className="w-full px-4 py-3 rounded-b-xl border border-t-0 border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-y font-mono leading-relaxed"
                  data-testid="input-blog-content"
                />
              </div>
            </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-sm">Post Settings</h3>

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
                  placeholder="post-url-slug"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                  data-testid="input-blog-slug"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  /blog/{slug || "..."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                  Cover Image
                </label>
                {coverImage && (
                  <div className="relative mb-2 rounded-lg overflow-hidden">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 bg-black/50 text-white"
                      onClick={() => setCoverImage("")}
                      data-testid="button-remove-cover"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadCoverImage(file);
                    e.target.value = "";
                  }}
                  data-testid="input-blog-cover-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mb-2"
                  onClick={() => coverFileInputRef.current?.click()}
                  disabled={isCoverUploading}
                  data-testid="button-upload-cover"
                >
                  {isCoverUploading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  {isCoverUploading ? "Uploading..." : "Upload Image"}
                </Button>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Or paste image URL..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                  data-testid="input-blog-cover"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="Web Development, SEO, Tips"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                  data-testid="input-blog-tags"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPublished(!published)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    published ? "bg-primary" : "bg-gray-300"
                  }`}
                  data-testid="toggle-publish"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      published ? "translate-x-5" : ""
                    }`}
                  />
                </button>
                <span className="text-sm font-medium">
                  {published ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            {content && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-sm mb-3">Preview</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Words: ~{content.split(/\s+/).filter(Boolean).length}
                  </p>
                  <p>
                    Read time: ~
                    {Math.max(
                      1,
                      Math.ceil(
                        content.split(/\s+/).filter(Boolean).length / 200
                      )
                    )}{" "}
                    min
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlog() {
  const { token, user, isLoading: authLoading, login, logout, hasPermission } = useAdminAuth();
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blog", {
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
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Deleted", description: "Blog post has been deleted." });
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
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          published,
          publishedAt: published ? new Date().toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={login} />;
  }

  if (!hasPermission("blog")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2" data-testid="heading-access-denied">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You do not have permission to manage blog posts.</p>
          <Button variant="outline" onClick={logout} data-testid="button-logout-denied">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  if (isCreating || editingPost) {
    return (
      <BlogEditor
        post={editingPost}
        token={token}
        onClose={() => {
          setIsCreating(false);
          setEditingPost(undefined);
        }}
        onSaved={() => {
          setIsCreating(false);
          setEditingPost(undefined);
        }}
      />
    );
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return "—";
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
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold" data-testid="heading-admin-dashboard">
              Blog Admin
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              onClick={() => setIsCreating(true)}
              data-testid="button-new-post"
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 animate-pulse-subtle"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Post
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {posts.length} total post{posts.length !== 1 ? "s" : ""} |{" "}
            {posts.filter((p) => p.published).length} published |{" "}
            {posts.filter((p) => !p.published).length} drafts
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse"
              >
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No blog posts yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first blog post to get started.
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              data-testid="button-create-first"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                data-testid={`admin-post-${post.id}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-base truncate">
                        {post.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          post.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>
                        Created: {formatDate(post.createdAt)}
                      </span>
                      {post.publishedAt && (
                        <span>
                          Published: {formatDate(post.publishedAt)}
                        </span>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-primary/5 text-primary rounded text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        togglePublishMutation.mutate({
                          id: post.id,
                          published: !post.published,
                        })
                      }
                      title={post.published ? "Unpublish" : "Publish"}
                      data-testid={`button-toggle-${post.id}`}
                    >
                      {post.published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPost(post)}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this post?"
                          )
                        ) {
                          deleteMutation.mutate(post.id);
                        }
                      }}
                      data-testid={`button-delete-${post.id}`}
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
