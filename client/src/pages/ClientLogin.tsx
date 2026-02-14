import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
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

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useClientAuth();
  const { toast } = useToast();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(email, password, turnstileToken);
    if (result.success) {
      toast({ title: "Welcome back!", description: "Login successful." });
      window.location.href = "/client/dashboard";
    } else {
      toast({ title: "Login failed", description: result.error, variant: "destructive" });
    }
    setLoading(false);
  };

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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to your client portal</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  className={`pl-10 h-11 ${errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
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
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember me</Label>
              </div>
              <Link href="/client/forgot-password">
                <span className="text-sm text-[#C41E3A] hover:text-[#a01830] font-medium cursor-pointer">Forgot password?</span>
              </Link>
            </div>

            <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken("")} />

            <Button type="submit" disabled={loading || !turnstileToken} className="w-full h-11 text-sm font-semibold">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{" "}
            <Link href="/client/signup">
              <span className="text-[#C41E3A] hover:text-[#a01830] font-semibold cursor-pointer">Create account</span>
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
            <h2 className="text-4xl font-bold text-white mb-4">Client Portal</h2>
            <p className="text-white/80 text-lg max-w-sm leading-relaxed">
              Access your projects, track progress, and collaborate with our team — all in one place.
            </p>
            <div className="flex items-center gap-3 mt-10 justify-center">
              <div className="flex -space-x-2">
                {[clientAvatar1, clientAvatar2, clientAvatar3, clientAvatar4].map((avatar, i) => (
                  <img key={i} src={avatar} alt="" className="w-9 h-9 rounded-full border-2 border-white/40 object-cover" />
                ))}
              </div>
              <span className="text-white/70 text-sm">Join 500+ clients</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
