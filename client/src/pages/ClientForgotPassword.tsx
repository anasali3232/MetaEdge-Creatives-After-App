import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/logo-metaedge.webp";
import TurnstileWidget from "@/components/TurnstileWidget";

type Step = "email" | "otp" | "reset" | "success";

export default function ClientForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setErrors({ email: "Email is required" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors({ email: "Enter a valid email" }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/client/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Code sent", description: "Check your email for the verification code." });
        setStep("otp");
      } else {
        toast({ title: "Error", description: data.error || "Failed to send reset code.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to connect. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setErrors({ otp: "Please enter the 6-digit code" }); return; }
    setErrors({});
    setStep("reset");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newPassword) errs.newPassword = "Password is required";
    else if (newPassword.length < 6) errs.newPassword = "Password must be at least 6 characters";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/client/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("success");
      } else {
        toast({ title: "Error", description: data.error || "Failed to reset password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to connect. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 sm:p-10">
          <Link href="/">
            <img src={logoImage} alt="MetaEdge Creatives" className="h-10 object-contain mb-8 cursor-pointer" />
          </Link>

          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send you a verification code to reset your password.</p>
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                      className={`pl-10 h-11 ${errors.email ? "border-red-400" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>
                <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken("")} />

                <Button type="submit" disabled={loading || !turnstileToken} className="w-full h-11 text-sm font-semibold">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</> : <>Send verification code <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter verification code</h1>
              <p className="text-gray-500 text-sm mb-8">We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span></p>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {errors.otp && <p className="text-red-500 text-xs text-center">{errors.otp}</p>}
                <Button type="submit" className="w-full h-11 text-sm font-semibold">
                  Verify code <ArrowRight className="w-4 h-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                >
                  Didn't receive a code? Try again
                </button>
              </form>
            </motion.div>
          )}

          {step === "reset" && (
            <motion.div
              key="reset"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Set new password</h1>
              <p className="text-gray-500 text-sm mb-8">Choose a strong password for your account.</p>
              <form onSubmit={handleResetSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-700">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => { const n = { ...p }; delete n.newPassword; return n; }); }}
                      className={`pl-10 pr-10 h-11 ${errors.newPassword ? "border-red-400" : ""}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-xs">{errors.newPassword}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => { const n = { ...p }; delete n.confirmPassword; return n; }); }}
                      className={`pl-10 pr-10 h-11 ${errors.confirmPassword ? "border-red-400" : ""}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : <>Reset password <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h1>
              <p className="text-gray-500 text-sm mb-8">Your password has been successfully reset. You can now sign in with your new password.</p>
              <Link href="/client/login">
                <Button className="w-full h-11 text-sm font-semibold">
                  Back to sign in <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          )}

          {step !== "success" && (
            <div className="mt-6 text-center">
              <Link href="/client/login">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </span>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
