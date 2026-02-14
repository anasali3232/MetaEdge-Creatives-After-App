import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTeamAuth } from "@/hooks/use-team-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, Mail, Download, Smartphone } from "lucide-react";
import logoImage from "@/assets/logo-metaedge.webp";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function TeamPortalLogin() {
  const [, setLocation] = useLocation();
  const { login, user, isLoading: authLoading } = useTeamAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (user) {
      setLocation("/team-portal/dashboard");
    }
  }, [user, setLocation]);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      deferredPromptRef.current = promptEvent;
      setInstallPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
    deferredPromptRef.current = null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#C41E3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <img src={logoImage} alt="MetaEdge Creatives" className="h-12 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#C41E3A]">Team Portal</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">Sign in to access your team workspace</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C41E3A]/30 focus:border-[#C41E3A]"
                    required
                    disabled={loading}
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C41E3A]/30 focus:border-[#C41E3A]"
                    required
                    disabled={loading}
                    data-testid="input-password"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm" data-testid="text-error">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-6 bg-[#C41E3A] hover:bg-[#A01830] text-white font-medium rounded-lg transition-colors"
                data-testid="button-sign-in"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {installPrompt && !isInstalled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-6 pt-5 border-t"
              >
                <Button
                  onClick={handleInstall}
                  variant="outline"
                  className="w-full h-11 border-[#C41E3A]/30 text-[#C41E3A]"
                  data-testid="button-install-app"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install App on Your Device
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Add to home screen for quick access
                </p>
              </motion.div>
            )}

            {isInstalled && (
              <div className="mt-6 pt-5 border-t text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <Smartphone className="w-4 h-4" />
                  <span>App installed on your device</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          &copy; 2026 MetaEdge Creatives. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
