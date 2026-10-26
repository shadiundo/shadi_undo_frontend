// src/routes/router.jsx
import React from "react";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import { useAuthContext } from "@/context/useAuthContext";
import { appRoutes, authRoutes, publicRoutes } from "./index";
import Header from "@/app/(admin)/pages/Main/components/Header"; // adjust path if needed
import Footer from "@/app/(admin)/pages/Main/components/Footer";

const ProfessionalRoutes = React.lazy(() => import("../app/(professionalDashboard)/routes/professionalRoutes"));

export function RoleProtected({ children, allowedRoles = [], fallback = null }) {
  const { isAuthenticated, user, loading, removeSession, reloadUser } = useAuthContext();
  const [attemptingReload, setAttemptingReload] = React.useState(false);

  // ✅ Hooks must be declared before any conditionally returned JSX.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      // If we think we're authenticated but lack a user object, try to reload once
      if (isAuthenticated && !user && typeof reloadUser === "function" && !attemptingReload) {
        setAttemptingReload(true);
        const ok = await reloadUser();
        if (!cancelled) {
          setAttemptingReload(false);
          if (!ok) {
            try { removeSession(); } catch {}
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, user, reloadUser, removeSession, attemptingReload]);

  // Normalized role logic (pure functions are fine to declare here)
  const norm = (s) => (typeof s === "string" ? s.trim().toLowerCase() : "");
  const roleGroups = React.useMemo(() => ({
    professional: ["professional", "lawyer", "therapist", "mediator", "counsellor"].map(norm),

    admin: ["admin", "superadmin"].map(norm),
  }), []);
  const expandRole = (r) => {
    const k = norm(r);
    return roleGroups[k] ?? [k];
  };
  const expandedAllowed = React.useMemo(
    () => new Set(allowedRoles.flatMap((r) => expandRole(r)).map(norm)),
    [allowedRoles]
  );
  const userRole = norm(user?.role ?? "");

  // ✅ Now do the early returns (after hooks)
  if (loading || attemptingReload) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <Navigate
        to={{
          pathname: "/auth/sign-in",
          search: "redirectTo=" + encodeURIComponent(window.location.pathname + window.location.search),
        }}
        replace
      />
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 24, maxWidth: 820, margin: "40px auto", textAlign: "center" }}>
        <h2 style={{ marginBottom: 8 }}>Access denied</h2>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>Your account doesn’t have permission to view this page.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="btn btn-outline-secondary"
            onClick={async () => {
              setAttemptingReload(true);
              const ok = await reloadUser();
              setAttemptingReload(false);
              if (!ok) removeSession();
            }}
          >
            Retry / Refresh session
          </button>
          <button className="btn btn-danger" onClick={() => { removeSession(); }}>
            Sign out
          </button>
        </div>
        {fallback ?? null}
      </div>
    );
  }

  if (expandedAllowed.has(userRole)) return children;

  return (
    <div style={{ padding: 24, maxWidth: 820, margin: "40px auto", textAlign: "center" }}>
      <h2 style={{ marginBottom: 8 }}>Access denied</h2>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        Your account doesn’t have permission to view this page. You are signed in as{" "}
        <strong>{user?.email ?? "Unknown"}</strong> with role <strong>{user?.role ?? "unknown"}</strong>.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-outline-secondary" onClick={async () => { const ok = await reloadUser(); if (!ok) removeSession(); }}>
          Retry / Refresh session
        </button>
        <button className="btn btn-primary" onClick={() => {
          if ((roleGroups.professional || []).includes(userRole)) window.location.href = "/professional";
          else if (userRole === "admin") window.location.href = "/admin";
          else window.location.href = "/";
        }}>
          Go to my area
        </button>
        <button className="btn btn-danger" onClick={() => { removeSession(); }}>
          Sign out
        </button>
      </div>
      {fallback ?? null}
    </div>
  );
}

/* MainLayout: renders the public header + public pages via Outlet */
function MainLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer/>
    </>
  );
}

export default function AppRouter(props) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public site — show Header (MainLayout) */}
        <Route element={<MainLayout />}>
          {(publicRoutes || []).map((route, idx) => (
            <Route
              key={idx + (route.name ?? idx)}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

        {/* Public auth routes */}
        {(authRoutes || []).map((route, idx) => (
          <Route
            key={idx + (route.name ?? idx)}
            path={route.path}
            element={<AuthLayout {...props}>{route.element}</AuthLayout>}
          />
        ))}

        {/* Admin */}
        {(appRoutes || []).map((route, idx) => (
          <Route
            key={idx + (route.name ?? idx)}
            path={route.path}
            element={
              <RoleProtected allowedRoles={["admin"]}>
                <AdminLayout {...props}>{route.element}</AdminLayout>
              </RoleProtected>
            }
          />
        ))}

        {/* Professional area */}
        <Route
          path="/professional/*"
          element={
            <RoleProtected allowedRoles={["professional"]}>
              <ProfessionalRoutes />
            </RoleProtected>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
