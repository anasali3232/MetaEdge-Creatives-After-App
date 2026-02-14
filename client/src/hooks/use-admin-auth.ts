import { useState, useEffect, useCallback, useRef } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AdminAuth {
  token: string | null;
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string, turnstileToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: boolean;
}

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export function useAdminAuth(): AdminAuth {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("admin_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("admin_token") && !localStorage.getItem("admin_user"));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (token && !user) {
      fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (!r.ok) throw new Error("Invalid token");
          return r.json();
        })
        .then((data) => {
          setUser(data);
          localStorage.setItem("admin_user", JSON.stringify(data));
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
        })
        .finally(() => setIsLoading(false));
    }
  }, [token, user]);

  const doLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }, []);

  useEffect(() => {
    if (!token) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        doLogout();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [token, doLogout]);

  const login = useCallback(async (email: string, password: string, turnstileToken?: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid credentials" };
    } catch {
      return { success: false, error: "Failed to connect. Please try again." };
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      if (user.role === "super_admin") return true;
      return user.permissions.includes(permission);
    },
    [user]
  );

  return {
    token,
    user,
    isLoading,
    login,
    logout: doLogout,
    hasPermission,
    isSuperAdmin: user?.role === "super_admin",
  };
}
