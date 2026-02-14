import { useState, useEffect, useCallback, useRef } from "react";

interface TeamUser {
  id: string;
  email: string;
  name: string;
  role: string;
  designation: string | null;
  description: string | null;
  accessLevel: string;
  accessTeams: string[];
  avatarUrl: string | null;
}

interface TeamAuth {
  token: string | null;
  user: TeamUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
  isFullAccess: boolean;
  canAccessTeam: (teamId: string) => boolean;
}

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export function useTeamAuth(): TeamAuth {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("team_token"));
  const [user, setUser] = useState<TeamUser | null>(() => {
    const saved = localStorage.getItem("team_user");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem("team_user");
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(() => {
    const savedToken = localStorage.getItem("team_token");
    const savedUser = localStorage.getItem("team_user");
    if (!savedToken) return false;
    if (!savedUser) return true;
    try {
      JSON.parse(savedUser);
      return false;
    } catch {
      return true;
    }
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (token && !user) {
      fetch("/api/team-portal/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (!r.ok) throw new Error("Invalid token");
          return r.json();
        })
        .then((data) => {
          setUser(data);
          localStorage.setItem("team_user", JSON.stringify(data));
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem("team_token");
          localStorage.removeItem("team_user");
        })
        .finally(() => setIsLoading(false));
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user) {
      fetch("/api/team-portal/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (!r.ok) throw new Error("Invalid token");
          return r.json();
        })
        .then((data) => {
          setUser(data);
          localStorage.setItem("team_user", JSON.stringify(data));
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem("team_token");
          localStorage.removeItem("team_user");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("team_token");
    localStorage.removeItem("team_user");
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

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/team-portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("team_token", data.token);
        localStorage.setItem("team_user", JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid credentials" };
    } catch {
      return { success: false, error: "Failed to connect. Please try again." };
    }
  }, []);

  const refreshUser = useCallback(() => {
    if (!token) return;
    fetch("/api/team-portal/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Invalid token");
        return r.json();
      })
      .then((data) => {
        setUser(data);
        localStorage.setItem("team_user", JSON.stringify(data));
      })
      .catch(() => {});
  }, [token]);

  const canAccessTeam = useCallback(
    (teamId: string) => {
      if (!user) return false;
      if (user.accessLevel === "full") return true;
      return user.accessTeams.includes(teamId);
    },
    [user]
  );

  return {
    token,
    user,
    isLoading,
    login,
    logout: doLogout,
    refreshUser,
    isFullAccess: user?.accessLevel === "full" || false,
    canAccessTeam,
  };
}
