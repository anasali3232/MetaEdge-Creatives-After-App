import { useState, useEffect, useCallback } from "react";

interface ClientUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  company?: string;
}

interface ClientAuth {
  token: string | null;
  user: ClientUser | null;
  isLoading: boolean;
  login: (email: string, password: string, turnstileToken?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, turnstileToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export function useClientAuth(): ClientAuth {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("client_token"));
  const [user, setUser] = useState<ClientUser | null>(() => {
    const saved = localStorage.getItem("client_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("client_token") && !localStorage.getItem("client_user"));

  useEffect(() => {
    if (token && !user) {
      fetch("/api/client/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (!r.ok) throw new Error("Invalid token");
          return r.json();
        })
        .then((data) => {
          setUser(data);
          localStorage.setItem("client_user", JSON.stringify(data));
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem("client_token");
          localStorage.removeItem("client_user");
        })
        .finally(() => setIsLoading(false));
    }
  }, [token, user]);

  const login = useCallback(async (email: string, password: string, turnstileToken?: string) => {
    try {
      const res = await fetch("/api/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        const userData = data.client || data.user;
        setToken(data.token);
        setUser(userData);
        localStorage.setItem("client_token", data.token);
        localStorage.setItem("client_user", JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid credentials" };
    } catch {
      return { success: false, error: "Failed to connect. Please try again." };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, turnstileToken?: string) => {
    try {
      const res = await fetch("/api/client/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, turnstileToken }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        const userData = data.client || data.user;
        setToken(data.token);
        setUser(userData);
        localStorage.setItem("client_token", data.token);
        localStorage.setItem("client_user", JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.error || "Signup failed" };
    } catch {
      return { success: false, error: "Failed to connect. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
  }, []);

  return {
    token,
    user,
    isLoading,
    login,
    signup,
    logout,
  };
}
