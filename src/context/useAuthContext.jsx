import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

const AuthContext = createContext(undefined);
const AUTH_KEY = "_REBACK_AUTH_KEY_";


const API_BASE = import.meta.env.VITE_API_BASE_URL || ""; 
const ME_URL = API_BASE ? `${API_BASE}/api/me` : ""; // leave empty to skip fetch if not configured

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // read session from cookie/localStorage
  const getSession = () => {
    try {
      const cookieValue = getCookie(AUTH_KEY)?.toString();
      if (cookieValue) return JSON.parse(cookieValue);
      if (typeof window !== "undefined") {
        const lsUser = localStorage.getItem("professional");
        const lsToken = localStorage.getItem("token");
        if (lsUser || lsToken) {
          return { user: lsUser ? JSON.parse(lsUser) : undefined, token: lsToken ?? undefined };
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  const session = getSession();
  const [user, setUser] = useState(session?.user);
  const [token, setToken] = useState(session?.token);
  const [loading, setLoading] = useState(true); // wait for initial rehydrate
  const [reloading, setReloading] = useState(false);

  const persist = (u, t, remember = true) => {
    const payload = { user: u, token: t };
    setCookie(AUTH_KEY, JSON.stringify(payload), {
      maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
      sameSite: "lax",
    });
    if (typeof window !== "undefined") {
      try {
        if (u) localStorage.setItem("professional", JSON.stringify(u));
        if (t) localStorage.setItem("token", t);
      } catch {}
    }
  };

  const saveSession = (sessionObj, remember = true) => {
    try {
      persist(sessionObj.user, sessionObj.token, remember);
      setUser(sessionObj.user);
      setToken(sessionObj.token);
    } catch (err) {
      console.error("Error saving session:", err);
    }
  };

  const removeSession = useCallback(() => {
    try {
      deleteCookie(AUTH_KEY);
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("professional");
        localStorage.removeItem("adminToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("adminToken");
      } catch {}
      setUser(undefined);
      setToken(undefined);
      navigate("/auth/sign-in", { replace: true });
    } catch (err) {
      console.error("Error removing session:", err);
      navigate("/auth/sign-in", { replace: true });
    }
  }, [navigate]);

  // Try to fetch current user from backend (if ME_URL is configured)
  const reloadUser = useCallback(async () => {
    if (!ME_URL || reloading) return !!user || !!token; // nothing to call -> consider local state only
    setReloading(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(ME_URL, {
        method: "GET",
        headers,
        credentials: "include", // include cookies if server uses httpOnly cookie
      });

      if (!res.ok) {
        setReloading(false);
        return false;
      }

      const data = await res.json(); // expect { user, token? }
      if (data?.user) {
        setUser(data.user);
        if (data.token) setToken(data.token);
        persist(data.user, data.token ?? token);
        setReloading(false);
        return true;
      }

      setReloading(false);
      return false;
    } catch (e) {
      console.warn("reloadUser failed:", e);
      setReloading(false);
      return false;
    }
  }, [token, user, reloading]);

  // Initial rehydrate on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (ME_URL) {
          await reloadUser();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [reloadUser]);

  const value = {
    user,
    token,
    isAuthenticated: !!user || !!token,
    loading,
    reloadUser,
    saveSession,
    removeSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
