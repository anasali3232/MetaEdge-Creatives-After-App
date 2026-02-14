import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";
import { Link } from "wouter";
import type { Faq } from "@shared/schema";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  HelpCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Loader2,
  ShieldX,
  Pencil,
  X,
} from "lucide-react";

function FAQEditor({
  faq,
  token,
  onClose,
  onSaved,
}: {
  faq?: Faq;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [question, setQuestion] = useState(faq?.question || "");
  const [answer, setAnswer] = useState(faq?.answer || "");
  const [isActive, setIsActive] = useState(faq?.isActive ?? true);
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = faq ? `/api/admin/faqs/${faq.id}` : "/api/admin/faqs";
      const method = faq ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, answer, isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save FAQ");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: faq ? "FAQ updated" : "FAQ created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      onSaved();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {faq ? "Edit FAQ" : "Add New FAQ"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-faq-editor-close">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="Enter the question..."
          data-testid="input-faq-question"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={5}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          placeholder="Enter the answer..."
          data-testid="input-faq-answer"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-primary" : "bg-gray-300"}`}
          data-testid="toggle-faq-active"
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className="text-sm text-muted-foreground">{isActive ? "Active (visible on site)" : "Inactive (hidden from site)"}</span>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!question.trim() || !answer.trim() || saveMutation.isPending}
          data-testid="button-faq-save"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-1" />
          )}
          {faq ? "Update FAQ" : "Create FAQ"}
        </Button>
        <Button variant="outline" onClick={onClose} data-testid="button-faq-cancel">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function FAQManager({ token, hasPermission }: { token: string; hasPermission: (p: string) => boolean }) {
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/admin/faqs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/faqs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch FAQs");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete FAQ");
    },
    onSuccess: () => {
      toast({ title: "FAQ deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, displayOrder }: { id: string; displayOrder: number }) => {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayOrder }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle FAQ");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
    },
  });

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const current = faqs[index];
    const above = faqs[index - 1];
    reorderMutation.mutate({ id: current.id, displayOrder: above.displayOrder });
    reorderMutation.mutate({ id: above.id, displayOrder: current.displayOrder });
  };

  const handleMoveDown = (index: number) => {
    if (index >= faqs.length - 1) return;
    const current = faqs[index];
    const below = faqs[index + 1];
    reorderMutation.mutate({ id: current.id, displayOrder: below.displayOrder });
    reorderMutation.mutate({ id: below.id, displayOrder: current.displayOrder });
  };

  if (!hasPermission("faqs")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldX className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to manage FAQs.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" data-testid="button-back-admin">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">FAQ Manager</h1>
            </div>
          </div>
          <Button
            onClick={() => { setEditingFaq(null); setShowEditor(true); }}
            data-testid="button-add-faq"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add FAQ
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {showEditor && (
          <div className="mb-8">
            <FAQEditor
              faq={editingFaq || undefined}
              token={token}
              onClose={() => { setShowEditor(false); setEditingFaq(null); }}
              onSaved={() => { setShowEditor(false); setEditingFaq(null); }}
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No FAQs yet</h2>
            <p className="text-muted-foreground mb-6">Add your first FAQ to get started.</p>
            <Button onClick={() => setShowEditor(true)} data-testid="button-add-first-faq">
              <Plus className="w-4 h-4 mr-1" />
              Add First FAQ
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`bg-white rounded-xl border ${faq.isActive ? "border-gray-200" : "border-gray-200 opacity-60"} p-5 transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1 pt-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      data-testid={`button-faq-up-${index}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === faqs.length - 1}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      data-testid={`button-faq-down-${index}`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-primary/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {faq.question}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: faq.id, isActive: !faq.isActive })}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title={faq.isActive ? "Hide from site" : "Show on site"}
                      data-testid={`button-faq-toggle-${index}`}
                    >
                      {faq.isActive ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => { setEditingFaq(faq); setShowEditor(true); }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      data-testid={`button-faq-edit-${index}`}
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this FAQ?")) {
                          deleteMutation.mutate(faq.id);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      data-testid={`button-faq-delete-${index}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminFAQs() {
  const { token, user, hasPermission, isLoading, login } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !user) {
    return <AdminLogin onLogin={login} />;
  }

  return <FAQManager token={token} hasPermission={hasPermission} />;
}
