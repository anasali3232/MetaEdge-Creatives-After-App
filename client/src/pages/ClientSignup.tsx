import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useClientAuth } from "@/hooks/use-client-auth";
import logoImage from "@/assets/logo-metaedge.webp";
import TurnstileWidget from "@/components/TurnstileWidget";
import clientAvatar1 from "@/assets/client-avatar-1_1.webp";
import clientAvatar2 from "@/assets/client-avatar-1_2.webp";
import clientAvatar3 from "@/assets/client-avatar-1_3.webp";
import clientAvatar4 from "@/assets/client-avatar-1_4.webp";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Strong", color: "bg-green-500" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

export default function ClientSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useClientAuth();
  const { toast } = useToast();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!agreeTerms) e.terms = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await signup(name, email, password, turnstileToken);
    if (result.success) {
      toast({ title: "Account created!", description: "Welcome to MetaEdge." });
      window.location.href = "/client/dashboard";
    } else {
      toast({ title: "Signup failed", description: result.error, variant: "destructive" });
    }
    setLoading(false);
  };

  const clearError = (field: string) => setErrors((p) => { const n = { ...p }; delete n[field]; return n; });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16"
      >
        <div className="w-full max-w-md">
          <Link href="/">
            <img src={logoImage} alt="MetaEdge Creatives" className="h-16 object-contain mb-10 cursor-pointer" />
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 mb-8">Join the MetaEdge client community</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError("name"); }}
                  className={`pl-10 h-11 ${errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  className={`pl-10 h-11 ${errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  className={`pl-10 pr-10 h-11 ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              {password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                  className={`pl-10 pr-10 h-11 ${errors.confirmPassword ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => { setAgreeTerms(checked as boolean); clearError("terms"); }}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-snug">
                  I agree to the{" "}
                  <Link href="/terms-of-service">
                    <span className="text-[#C41E3A] hover:underline">Terms of Service</span>
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy">
                    <span className="text-[#C41E3A] hover:underline">Privacy Policy</span>
                  </Link>
                </Label>
              </div>
              {errors.terms && <p className="text-red-500 text-xs ml-6">{errors.terms}</p>}
            </div>

            <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken("")} />

            <Button type="submit" disabled={loading || !turnstileToken} className="w-full h-11 text-sm font-semibold">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{" "}
            <Link href="/client/login">
              <span className="text-[#C41E3A] hover:text-[#a01830] font-semibold cursor-pointer">Sign in</span>
            </Link>
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="hidden lg:flex flex-1 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#C41E3A] via-[#9a1830] to-[#6b0f22]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/15 blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 mx-auto border border-white/20">
              <img src={logoImage} alt="MetaEdge" className="h-16 object-contain brightness-0 invert" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Get Started</h2>
            <p className="text-white/80 text-lg max-w-sm leading-relaxed">
              Create your free account and start managing your projects with our powerful client portal.
            </p>
            <div className="flex items-center gap-3 mt-8 justify-center">
              <div className="flex -space-x-2">
                {[clientAvatar1, clientAvatar2, clientAvatar3, clientAvatar4].map((avatar, i) => (
                  <img key={i} src={avatar} alt="" className="w-9 h-9 rounded-full border-2 border-white/40 object-cover" />
                ))}
              </div>
              <span className="text-white/70 text-sm">Join 500+ clients</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 text-left max-w-xs mx-auto">
              {["Project Tracking", "Real-time Updates", "Secure Messaging", "Invoice Management"].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
