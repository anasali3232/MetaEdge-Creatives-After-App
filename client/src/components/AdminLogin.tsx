import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo-metaedge.webp";
import TurnstileWidget from "@/components/TurnstileWidget";

interface AdminLoginProps {
  onLogin: (email: string, password: string, turnstileToken?: string) => Promise<{ success: boolean; error?: string }>;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await onLogin(email, password, turnstileToken);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="flex justify-center mb-6">
            <img src={logoImage} alt="MetaEdge Creatives" className="h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2" data-testid="heading-admin-login">Admin Portal</h1>
          <p className="text-muted-foreground text-center text-sm mb-8">Sign in to access the dashboard</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              data-testid="input-admin-email"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              data-testid="input-admin-password"
              required
            />
            {error && <p className="text-red-500 text-sm" data-testid="text-login-error">{error}</p>}
            <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken("")} />
            <Button
              type="submit"
              disabled={loading || !turnstileToken}
              className="w-full"
              data-testid="button-admin-login"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
