import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Send,
  X,
  Upload,
  Loader2,
  LinkIcon,
  User,
  Mail,
  Phone,
  MapPinIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Career } from "@shared/schema";
import CTA from "@/components/CTA";
import portfolioBg from "@/assets/bg-portfolio.webp";
import TurnstileWidget from "@/components/TurnstileWidget";

async function uploadFileWithPresignedUrl(file: File): Promise<string> {
  const metaRes = await fetch("/api/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!metaRes.ok) {
    const errData = await metaRes.json().catch(() => ({}));
    console.error("Upload URL request failed:", errData);
    throw new Error(errData.error || "Failed to get upload URL");
  }
  const { uploadURL, objectPath } = await metaRes.json();

  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error("File upload failed:", errText);
    throw new Error("Failed to upload file");
  }

  return objectPath;
}

function ApplicationForm({ job, onClose }: { job: Career; onClose: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);
      let uploadedCvUrl: string | null = null;
      let finalPortfolioUrl: string | null = portfolioUrl || null;

      try {
        if (cvFile) {
          uploadedCvUrl = await uploadFileWithPresignedUrl(cvFile);
        }
      } catch {
        toast({ title: "CV upload failed", description: "Could not upload your CV. Your application will be submitted without it.", variant: "destructive" });
      }

      try {
        if (portfolioFile) {
          const uploadedPortfolioPath = await uploadFileWithPresignedUrl(portfolioFile);
          if (!finalPortfolioUrl) {
            finalPortfolioUrl = uploadedPortfolioPath;
          } else {
            finalPortfolioUrl = JSON.stringify({
              link: portfolioUrl,
              file: uploadedPortfolioPath,
            });
          }
        }
      } catch {
        toast({ title: "Portfolio upload failed", description: "Could not upload your portfolio file.", variant: "destructive" });
      }

      const res = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerId: job.id,
          firstName,
          lastName,
          email,
          phone,
          address,
          cvUrl: uploadedCvUrl || null,
          portfolioUrl: finalPortfolioUrl || null,
          turnstileToken,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      setIsUploading(false);
      toast({
        title: "Application Submitted!",
        description: "Thank you for applying. We'll review your application and get back to you soon.",
      });
      onClose();
    },
    onError: (err: Error) => {
      setIsUploading(false);
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const isValid = firstName && lastName && email && phone && address;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pt-20 pb-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-auto"
      >
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Apply Now</h2>
            <p className="text-sm text-muted-foreground">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your full address"
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Upload CV / Resume
            </label>
            <div className="relative">
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/40 transition-colors cursor-pointer bg-gray-50/50">
                <Upload className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  {cvFile ? (
                    <span className="text-sm font-medium text-foreground truncate block">{cvFile.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Click to upload PDF, DOC, or DOCX</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        toast({ title: "File too large", description: "Please upload a file under 10MB.", variant: "destructive" });
                        return;
                      }
                      setCvFile(file);
                    }
                  }}
                />
              </label>
              {cvFile && (
                <button
                  onClick={() => setCvFile(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white shadow hover:bg-gray-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Max file size: 10MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Portfolio <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">You can add a link, upload a file, or both</p>
            <div className="space-y-3">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://your-portfolio.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <div className="relative">
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/40 transition-colors cursor-pointer bg-gray-50/50">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    {portfolioFile ? (
                      <span className="text-sm font-medium text-foreground truncate block">{portfolioFile.name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Or upload portfolio file (PDF, ZIP, images)</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.zip,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 25 * 1024 * 1024) {
                          toast({ title: "File too large", description: "Please upload a file under 25MB.", variant: "destructive" });
                          return;
                        }
                        setPortfolioFile(file);
                      }
                    }}
                  />
                </label>
                {portfolioFile && (
                  <button
                    onClick={() => setPortfolioFile(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-white shadow hover:bg-gray-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken("")} />

          <div className="pt-2">
            <Button
              className="w-full"
              size="lg"
              onClick={() => submitMutation.mutate()}
              disabled={!isValid || submitMutation.isPending || isUploading || !turnstileToken}
            >
              {submitMutation.isPending || isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isUploading ? "Uploading files..." : "Submitting..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Application
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CareerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [showForm, setShowForm] = useState(false);

  const { data: job, isLoading } = useQuery<Career>({
    queryKey: ["/api/careers", slug],
  });

  if (isLoading) {
    return (
      <div className="relative pt-20">
        <div className="max-w-4xl mx-auto px-4 py-24 animate-pulse">
          <div className="h-8 bg-gray-100 rounded w-1/3 mb-4" />
          <div className="h-6 bg-gray-100 rounded w-2/3 mb-8" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="relative pt-20">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <Briefcase className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Position Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This job listing may have been removed or is no longer available.
          </p>
          <Link href="/careers">
            <Button data-testid="button-back-careers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View All Openings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-12 md:pt-16">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${portfolioBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.15,
        }}
      />
      <div className="relative z-[1]">
        <section className="relative py-12 md:py-20 bg-gradient-to-b from-primary/5 via-transparent to-transparent overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <Link href="/careers">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-6"
                  data-testid="button-back-to-careers"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All Openings
                </Button>
              </Link>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary"
            >
              <Briefcase className="w-4 h-4" />
              Open Position
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.15 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              data-testid="heading-career-title"
            >
              {job.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.25 }}
              className="flex items-center gap-4 text-muted-foreground flex-wrap"
            >
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary/60" />
                {job.type}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary/60" />
                {job.location}
              </span>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-10">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-xl font-bold mb-4">About This Role</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </motion.div>

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h2 className="text-xl font-bold mb-4">
                      Responsibilities
                    </h2>
                    <ul className="space-y-3">
                      {job.responsibilities.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h2 className="text-xl font-bold mb-4">Requirements</h2>
                    <ul className="space-y-3">
                      {job.requirements.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="sticky top-24"
                >
                  <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-white to-primary/5 border border-primary/10">
                    <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                      <Send className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Ready to Apply?</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Submit your application with your CV and portfolio. We'll review it and get back to you soon.
                    </p>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setShowForm(true)}
                      data-testid="button-apply-now"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {showForm && (
            <ApplicationForm job={job} onClose={() => setShowForm(false)} />
          )}
        </AnimatePresence>

        <CTA />
      </div>
    </div>
  );
}
