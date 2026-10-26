// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";
import avatar1 from "@/assets/images/users/avatar-1.jpg";
import educationIcon from "@/assets/images/educates 1.png";
import experienceIcon from "@/assets/images/laws 1.png";
import { FaBalanceScale, FaBolt, FaMoneyBillWave, FaStopwatch } from "react-icons/fa";
import BookingCategories from "./homeComponents/BookingCategories";

const DEFAULT_TIMEOUT = 7000;
function fetchWithTimeout(input, init = {}, timeout = DEFAULT_TIMEOUT) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
  let onInitAbort = null;
  if (init.signal) {
    if (init.signal.aborted) {
      timeoutController.abort();
    } else {
      onInitAbort = () => timeoutController.abort();
      init.signal.addEventListener("abort", onInitAbort);
    }
  }
  const opts = { ...init, signal: timeoutController.signal };
  return fetch(input, opts).finally(() => {
    clearTimeout(timeoutId);
    if (init.signal && onInitAbort) {
      init.signal.removeEventListener("abort", onInitAbort);
    }
  });
}

function MiniCalendar({ selectedDate, onSelectDate, monthOffset = 0, compact = false, isDateAvailable }) {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = firstOfMonth.getFullYear();
  const month = firstOfMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const cells = new Array(startWeekday).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const weeks = [];
  const temp = [...cells];
  while (temp.length) weeks.push(temp.splice(0, 7));
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const cellStyle = {
    padding: compact ? "6px 4px" : "10px 6px",
    fontSize: compact ? 12 : 13,
  };
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 8 }}>
        {weekdays.map((d, i) => (
          <div key={`wd-${month}-${i}`} style={{ textAlign: "center", color: "var(--muted)", fontWeight: 800, fontSize: 12 }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: compact ? 6 : 8 }}>
        {weeks.flat().map((day, idx) => {
          if (!day) return <div key={`cell-${month}-${idx}`} />;
          const cellDate = new Date(year, month, day);
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === cellDate.getFullYear() &&
            selectedDate.getMonth() === cellDate.getMonth() &&
            selectedDate.getDate() === cellDate.getDate();
          const available = typeof isDateAvailable === "function" ? isDateAvailable(cellDate) : false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isPast = cellDate < today;
          return (
            <div
              key={`cell-${month}-${idx}-${day}`}
              onClick={() => {
                if (isPast) return;
                onSelectDate(cellDate);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" ? (!isPast && onSelectDate(cellDate)) : null)}
              style={{
                ...cellStyle,
                textAlign: "center",
                borderRadius: 8,
                cursor: isPast ? "not-allowed" : "pointer",
                backgroundColor: isSelected ? "#CAAA93" : available ? "rgba(46,165,90,0.06)" : "transparent",
                color: isSelected ? "#fff" : available ? "#194d2d" : isPast ? "rgba(46,36,32,0.28)" : "var(--text)",
                boxShadow: isSelected ? "0 4px 12px rgba(202,170,148,0.18)" : "none",
                border: `1px solid ${isSelected ? "transparent" : "var(--border)"}`,
                fontWeight: 600,
                position: "relative",
                minHeight: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%", textAlign: "center" }}>{day}</div>
              {available && !isSelected && !isPast && (
                <div style={{ position: "absolute", bottom: 6, right: 6, width: 8, height: 8, borderRadius: 999, background: "#2ea95a" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { id: routeId } = useParams();
  const { user: authUser, token } = useAuthContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState(null);
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(Boolean(routeId));
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [availableSlots, setAvailableSlots] = useState([]); // will store raw API slot objects
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [timeSlotsForSelectedDate, setTimeSlotsForSelectedDate] = useState([]);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = vw < 640;
  const isTablet = vw >= 640 && vw < 992;

  const baseStyles = useMemo(
    () => ({
      page: {
        width: "100%",
        minHeight: "100vh",
        paddingTop: 18,
        paddingBottom: 48,
        backgroundColor: "#FBF7F4",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        color: "var(--text)",
        fontFamily: "Raleway, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      },
      container: {
        width: "100%",
        maxWidth: 1200,
        backgroundColor: "transparent",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "max-width 200ms ease",
      },
      topStrip: { height: 84, background: "linear-gradient(90deg, #CFAE99 0%, #BA8D6C 100%)", boxShadow: "none" },
      header: { display: "flex", alignItems: "center", gap: 18, padding: "24px 28px", background: "transparent" },
      avatarWrap: {
        width: 134,
        height: 134,
        borderRadius: 999,
        padding: 6,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        border: "6px solid #FBF7F4",
        marginTop: -48,
      },
      avatar: { width: 116, height: 116, borderRadius: "50%", objectFit: "cover", border: "4px solid #fff" },
      headerText: { color: "#2e241d", lineHeight: 1.05 },
      name: { margin: 0, fontSize: 36, fontWeight: 900, color: "#2e241d" },
      subtitle: { margin: "6px 0 0 0", color: "rgba(46,36,32,0.85)", fontSize: 15 },
      location: { margin: "8px 0 0 0", color: "rgba(46,36,32,0.6)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 },
      actionWrap: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 },
      bookButton: {
        background: "#BA8D6C",
        color: "#fff",
        border: "none",
        padding: "10px 20px",
        borderRadius: 28,
        fontWeight: 800,
        boxShadow: "0 8px 20px rgba(202,170,148,0.18)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      },
      tabsRow: {
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 28px",
        borderBottom: "1px solid rgba(46,36,32,0.08)",
        background: "transparent",
        flexWrap: "wrap",
      },
      tabBtn: (active) => ({
        background: "transparent",
        border: "none",
        padding: "10px 6px",
        cursor: "pointer",
        fontWeight: active ? 800 : 700,
        color: active ? "#9a6d52" : "rgba(46,36,32,0.6)",
        fontSize: 18,
        position: "relative",
        outline: "none",
      }),
      activeUnderline: {
        height: 4,
        width: 44,
        background: "#CFAE99",
        borderRadius: 4,
        position: "absolute",
        bottom: -14,
        left: "50%",
        transform: "translateX(-50%)",
      },
      reviewCountPill: {
        display: "inline-block",
        background: "#2ea95a",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
        marginLeft: 8,
      },
      body: {
        display: "flex",
        gap: 28,
        padding: "26px 28px 40px 28px",
        alignItems: "flex-start",
        boxSizing: "border-box",
        background: "transparent",
      },
      leftCol: { flex: 1, minWidth: 560 },
      rightCol: { width: 320, flexShrink: 0 },
      cardBig: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 28,
        boxShadow: "0 10px 28px rgba(15,12,11,0.06)",
        border: "1px solid rgba(18,18,18,0.03)",
        marginBottom: 18,
      },
      smallCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 18,
        boxShadow: "0 8px 20px rgba(15,12,11,0.04)",
        border: "1px solid rgba(18,18,18,0.04)",
        marginBottom: 18,
      },
      heading: { fontSize: 18, fontWeight: 900, marginBottom: 12, color: "#2e241d" },
      paragraph: { color: "rgba(46,36,32,0.7)", lineHeight: 1.7, marginBottom: 12, fontSize: 15 },
      recGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24, alignItems: "stretch", gridAutoRows: "1fr" },
      recCard: {
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid rgba(18,18,18,0.04)",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: 340,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      },
      recTop: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 },
      recAvatarWrap: { position: "relative", width: 100, marginBottom: 8 },
      recAvatar: { width: 100, height: 100, objectFit: "cover", borderRadius: "50%", border: "4px solid #fff", boxShadow: "0 8px 16px rgba(0,0,0,0.08)" },
      ratingPill: {
        position: "absolute",
        bottom: -6,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "4px 10px",
        borderRadius: 20,
        fontWeight: 800,
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
      },
      recName: { fontWeight: 900, fontSize: 20, color: "#2e241d", textDecoration: "none" },
      recRole: { color: "#BA8D6C", fontSize: 13, fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" },
      recLocation: { marginTop: 8, color: "rgba(46,36,32,0.6)", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
      recMetaGrid: { display: "flex", gap: 12, marginTop: 8, color: "rgba(46,36,32,0.7)", fontSize: 12, justifyContent: "center" },
      tagsWrap: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16, justifyContent: "center" },
      tag: { background: "#F3F4F6", color: "#374151", padding: "6px 12px", borderRadius: 8, fontWeight: 600, fontSize: 11, border: "1px solid #E5E7EB" },
      recActionWrap: { marginTop: 24, width: "100%" },
      recButton: {
        background: "#b77e62",
        color: "#fff",
        border: "none",
        padding: "12px 0",
        borderRadius: 12,
        fontWeight: 700,
        width: "100%",
        cursor: "pointer",
        transition: "background 0.2s",
      },
      instantPill: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, fontWeight: 800, fontSize: 13, boxShadow: "0 6px 14px rgba(0,0,0,0.06)" },
      recSection: { width: "100%", boxSizing: "border-box", padding: "28px", background: "transparent" },
      recSectionCard: { borderRadius: 12, padding: 28, boxShadow: "0 10px 28px rgba(15,12,11,0.06)", border: "1px solid rgba(18,18,18,0.03)" },
      calendarHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, backgroundColor: "#BA8D6C", padding: "6px 12px", borderRadius: 8 },
      monthNavButton: { background: "transparent", border: "none", cursor: "pointer", fontWeight: 800, fontSize: 18, color: "#FFF" },
      timeSelect: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(18,18,18,0.06)", fontSize: 14, background: "#fff", color: "#2e241d" },
      proceedBtn: { width: "100%", backgroundColor: "#BA8D6C", border: "none", color: "#fff", padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 800, marginTop: 12, boxShadow: "0 6px 18px rgba(122,81,55,0.12)" },
      smallMuted: { color: "rgba(46,36,32,0.6)", fontSize: 13 },
      reviewsPanel: {},
      reviewsListItemFull: { display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0" },
      reviewsLeft: { width: 60 },
      reviewsAvatar: { width: 48, height: 48, borderRadius: 999 },
      reviewsBody: { flex: 1 },
      reviewsHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
      reviewsName: { fontWeight: 900 },
      reviewsStars: { color: "#F59E0B" },
      reviewsText: { marginTop: 8, color: "rgba(46,36,32,0.7)" },
      reviewsDivider: { marginTop: 10, borderTop: "1px solid rgba(46,36,32,0.06)" },
      expItemRow: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 },
      expIconWrap: { width: 48, height: 48, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
      expContent: { flex: 1 },
      expTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
      expTitle: { margin: 0, fontWeight: 800 },
      expCompany: { color: "rgba(46,36,32,0.6)" },
      expDesc: { marginTop: 8, color: "rgba(46,36,32,0.7)" },
      expSeparator: { height: 1, background: "rgba(46,36,32,0.04)", margin: "12px 0" },
      eduItemRow: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 },
      eduIconWrap: { width: 48, height: 48, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
      eduContent: { flex: 1 },
      eduTitle: { margin: 0, fontWeight: 800 },
      eduSub: { color: "rgba(46,36,32,0.6)" },
      eduDesc: { marginTop: 8, color: "rgba(46,36,32,0.7)" },
      contactLine: { marginTop: 8, color: "rgba(46,36,32,0.7)" },
    }),
    []
  );

  const styles = useMemo(() => {
    const s = { ...baseStyles };
    if (isMobile) {
      s.container = { ...s.container, padding: 12, maxWidth: "100%" };
      s.header = { ...s.header, padding: "16px 14px", flexDirection: "column", alignItems: "center", gap: 12 };
      s.avatarWrap = { ...s.avatarWrap, width: 96, height: 96, marginTop: -48 };
      s.avatar = { ...s.avatar, width: 80, height: 80 };
      s.name = { ...s.name, fontSize: 22, textAlign: "center" };
      s.subtitle = { ...s.subtitle, textAlign: "center" };
      s.actionWrap = { ...s.actionWrap, marginLeft: 0, width: "100%", justifyContent: "center" };
      s.tabsRow = { ...s.tabsRow, padding: "10px 14px", gap: 8 };
      s.body = { ...s.body, flexDirection: "column", padding: "16px", gap: 14 };
      s.leftCol = { ...s.leftCol, minWidth: "100%" };
      s.rightCol = { ...s.rightCol, width: "100%", flexShrink: 0 };
      s.cardBig = { ...s.cardBig, padding: 18 };
      s.smallCard = { ...s.smallCard, padding: 14 };
      s.calendarHeader = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        backgroundColor: "#BA8D6C",
        padding: "8px 10px",
        borderRadius: 8,
      };
      s.recGrid = { display: "grid", gridTemplateColumns: "1fr", gap: 12, alignItems: "stretch", gridAutoRows: "1fr" };
      s.recSection = { ...s.recSection, padding: 14 };
      s.recSectionCard = { ...s.recSectionCard, padding: 18 };
      s.recCard = { ...s.recCard, minHeight: 260, padding: 16 };
      s.recAvatar = { ...s.recAvatar, width: 68, height: 68 };
      s.recName = { ...s.recName, fontSize: 18 };
      s.recButton = { ...s.recButton, padding: "12px 18px", maxWidth: "100%" };
    } else if (isTablet) {
      s.container = { ...s.container, maxWidth: 920 };
      s.header = { ...s.header, padding: "20px 20px" };
      s.avatarWrap = { ...s.avatarWrap, width: 110, height: 110 };
      s.avatar = { ...s.avatar, width: 92, height: 92 };
      s.name = { ...s.name, fontSize: 28 };
      s.leftCol = { ...s.leftCol, minWidth: 420 };
      s.rightCol = { ...s.rightCol, width: 300 };
      s.body = { ...s.body, padding: "20px" };
      s.recGrid = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16, alignItems: "stretch", gridAutoRows: "1fr" };
      s.recSection = { ...s.recSection, padding: 20 };
      s.recSectionCard = { ...s.recSectionCard, padding: 20 };
      s.recCard = { ...s.recCard, minHeight: 300 };
      s.recButton = { ...s.recButton, maxWidth: 360 };
    } else {
      s.container = { ...s.container, maxWidth: 1200 };
    }
    return s;
  }, [baseStyles, isMobile, isTablet]);

  const timeSlots = useMemo(() => ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"], []);
  const monthLabel = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [monthOffset]);

  const specialties = useMemo(() => {
    if (!profile) return null;
    const raw =
      profile.specialties ?? profile.specializations ?? profile.specialisation ?? profile.speciality ?? profile.specialtiesList ?? profile.specialty ?? profile.specializationsList ?? null;
    if (!raw) return null;
    if (Array.isArray(raw)) {
      return raw
        .map((s) => {
          if (!s) return null;
          if (typeof s === "string") return s.trim();
          if (typeof s === "object") return s.name ?? s.title ?? null;
          return String(s);
        })
        .filter(Boolean);
    }
    if (typeof raw === "string") {
      return raw.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    }
    if (typeof raw === "object") {
      const arr = Array.isArray(raw) ? raw : Object.values(raw);
      return arr.map((x) => {
        if (!x) return null;
        if (typeof x === "string") return x.trim();
        if (typeof x === "object") return x.name ?? x.title ?? null;
        return String(x);
      }).filter(Boolean);
    }
    return null;
  }, [profile]);

  const totalYears = useMemo(() => {
    if (!profile && !experience) return null;
    if (profile?.yearsExperience != null && !Number.isNaN(Number(profile.yearsExperience))) {
      return Number(profile.yearsExperience);
    }
    const arr = Array.isArray(experience) ? experience : Array.isArray(profile?.experience) ? profile.experience : [];
    const yrs = arr.map((e) => {
      const n = Number(e?.years ?? 0);
      return Number.isNaN(n) ? 0 : n;
    }).filter((n) => n > 0);
    if (yrs.length > 0) return Math.max(...yrs);
    return null;
  }, [profile, experience]);

  const casesHandled = useMemo(() => {
    if (!profile) return null;
    if (profile.casesHandled != null && !Number.isNaN(Number(profile.casesHandled))) return Number(profile.casesHandled);
    if (profile.cases != null && !Number.isNaN(Number(profile.cases))) return Number(profile.cases);
    if (profile.casesCount != null && !Number.isNaN(Number(profile.casesCount))) return Number(profile.casesCount);
    if (profile.casesHandledCount != null && !Number.isNaN(Number(profile.casesHandledCount))) return Number(profile.casesHandledCount);
    const expArr = Array.isArray(experience) ? experience : Array.isArray(profile?.experience) ? profile.experience : [];
    if (expArr.length > 0) return null;
    return null;
  }, [profile, experience]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!routeId) {
          if (authUser) {
            setProfile(authUser);
            setEducation(Array.isArray(authUser.education) ? authUser.education : null);
            setExperience(Array.isArray(authUser.experience) ? authUser.experience : null);
            return;
          }
          setError("No id provided and no authenticated user.");
          setTimeout(() => {
            if (!cancelled) navigate("/auth/sign-in");
          }, 1000);
          return;
        }
        const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://shadi-undo-backend.onrender.com");
        const url = `${apiBase}/api/professionals/search?id=${encodeURIComponent(routeId)}`;
        const headers = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetchWithTimeout(url, { method: "GET", headers, signal: controller.signal }, DEFAULT_TIMEOUT);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`API error ${res.status}${txt ? `: ${txt}` : ""}`);
        }
        const json = await res.json();
        let found = null;
        if (Array.isArray(json.data)) {
          found = json.data.find((p) => p && (p._id === routeId || p.id === routeId)) ?? json.data[0] ?? null;
        } else if (json && (json._id === routeId || json.id === routeId)) {
          found = json;
        }
        if (!found) throw new Error("Profile not found");
        if (!cancelled) {
          setProfile(found);
          setEducation(Array.isArray(found.education) ? found.education : null);
          setExperience(Array.isArray(found.experience) ? found.experience : null);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Profile load error:", err);
        if (!cancelled) setError(err.message ?? "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; controller.abort(); };
  }, [routeId, authUser, token, navigate]);

  // -----------------------
  // Load available slots from API and keep raw slot objects
  // -----------------------
  useEffect(() => {
    if (!profile || !(profile._id || profile.id)) {
      setAvailableSlots([]);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const loadSlots = async () => {
      try {
        setSlotsLoading(true);
        setSlotsError(null);
        const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://shadi-undo-backend.onrender.com");
        const profId = encodeURIComponent(profile._id || profile.id);
        const from = new Date();
        const to = new Date();
        to.setDate(from.getDate() + 30);
        const url = `${apiBase}/api/professionals/${profId}/available-slots?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&duration=${profile?.defaultDuration ?? 30}&step=30`;
        const headers = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetchWithTimeout(url, { method: "GET", headers, signal: controller.signal }, DEFAULT_TIMEOUT);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`API error ${res.status}${txt ? `: ${txt}` : ""}`);
        }
        const json = await res.json();
        if (!cancelled) {
          // ensure we have an array; preserve API order but convert to a safe array
          const slotsArr = Array.isArray(json.slots) ? json.slots.slice() : Array.isArray(json.data) ? json.data.slice() : [];
          // Normalize: ensure startUtc/endUtc exist and are valid dates; filter out malformed
          const normalized = slotsArr
            .map((s) => {
              if (!s) return null;
              // ensure we have consistent keys
              const start = s.startUtc ?? s.start ?? s.from;
              const end = s.endUtc ?? s.end ?? s.to;
              if (!start || !end) return null;
              const sd = new Date(start);
              const ed = new Date(end);
              if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) return null;
              return { ...s, startUtc: sd.toISOString(), endUtc: ed.toISOString() };
            })
            .filter(Boolean);
          // Sort ascending by startUtc so AM comes before PM and sequence is chronological
          normalized.sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc));
          setAvailableSlots(normalized);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Available slots error", err);
        if (!cancelled) setSlotsError(err.message || "Failed to load slots");
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };
    void loadSlots();
    return () => { cancelled = true; controller.abort(); };
  }, [profile, token]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const loadRelated = async () => {
      try {
        setRelatedLoading(true);
        setRelated([]);
        const apiBase =
          import.meta.env.VITE_API_URL ||
          (import.meta.env.DEV ? "http://localhost:5000" : "https://shadi-undo-backend.onrender.com");
        const endpoints = [
          `${apiBase}/api/auth/professionals`,
          `${apiBase}/api/professionals`,
          `${apiBase}/api/professionals/getAllProfessionals`,
          `${apiBase}/api/professionals?limit=50`,
        ];
        let items = [];
        let lastErr = null;
        for (const url of endpoints) {
          if (cancelled) break;
          try {
            const headers = { Accept: "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;
            const res = await fetchWithTimeout(url, { method: "GET", headers, signal: controller.signal }, DEFAULT_TIMEOUT);
            const text = await res.text().catch(() => "");
            let json;
            try {
              json = text ? JSON.parse(text) : null;
            } catch (e) {
              json = null;
            }
            if (!res.ok) {
              lastErr = new Error(`Status ${res.status} from ${url}`);
              continue;
            }
            if (Array.isArray(json)) {
              items = json;
            } else if (Array.isArray(json?.professionals)) {
              items = json.professionals;
            } else if (Array.isArray(json?.data)) {
              items = json.data;
            } else if (Array.isArray(json?.results)) {
              items = json.results;
            } else if (Array.isArray(json?.users)) {
              items = json.users;
            } else {
              const arrCandidate = Object.values(json || {}).find((v) => Array.isArray(v));
              if (arrCandidate) items = arrCandidate;
            }
            if (Array.isArray(items) && items.length > 0) {
              break;
            } else {
              lastErr = new Error(`No array or empty array from ${url}`);
              items = [];
              continue;
            }
          } catch (err) {
            lastErr = err;
            continue;
          }
        }
        if (!items || items.length === 0) {
          setRelated([]);
          return;
        }
        const currentId = profile?._id || profile?.id || routeId || null;
        const mapped = items
          .filter((p) => p && (p._id || p.id || "") !== (currentId || ""))
          .map((p, i) => {
            const specialties =
              Array.isArray(p.specialties) ? p.specialties : (typeof p.specialties === "string" ? p.specialties.split(/[,;\n]/).map(s => s.trim()).filter(Boolean) : (Array.isArray(p.specialization) ? p.specialization : []));
            return {
              id: p._id || p.id || `r-${i}`,
              _id: p._id || p.id || `r-${i}`,
              name: p.name || p.title || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Unknown",
              avatar: p.avatarUrl || p.avatar || p.photo || p.image || p.profileImage || avatar1,
              role: p.role || p.title || p.profession || "Professional",
              specialties: specialties || [],
              location: p.location || p.address || (p.city ? { city: p.city } : null),
              raw: p,
            };
          })
          .slice(0, 3);
        if (!cancelled) {
          setRelated(mapped);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Related load error (fatal)", err);
        if (!cancelled) setRelated([]);
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    };
    if (profile) {
      void loadRelated();
    } else {
      setRelated([]);
      setRelatedLoading(false);
    }
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [profile, token, routeId]);

  const toLocalTimeLabel = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  // check availability using UTC day bounds (avoids local timezone mismatches)
  const isDateAvailable = (date) => {
    if (!availableSlots || !availableSlots.length) return false;
    const nowMs = Date.now();

    // get UTC midnight of this date
    const dayStartUtcMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEndUtcMs = dayStartUtcMs + 24 * 60 * 60 * 1000;

    return availableSlots.some((s) => {
      const slotStartMs = new Date(s.startUtc).getTime(); // ms since epoch (UTC)
      return slotStartMs >= dayStartUtcMs && slotStartMs < dayEndUtcMs && slotStartMs >= nowMs;
    });
  };

  useEffect(() => {
    if (!selectedDate) {
      setTimeSlotsForSelectedDate([]);
      setSelectedTime("");
      return;
    }

    const nowMs = Date.now();
    // compute UTC day bounds for selectedDate
    const dayStartUtcMs = Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const dayEndUtcMs = dayStartUtcMs + 24 * 60 * 60 * 1000;

    const slotsForDay = (availableSlots || []).filter((s) => {
      const slotStartMs = new Date(s.startUtc).getTime(); // UTC ms
      // include only slots that start within selected UTC day and are not in the past
      return slotStartMs >= dayStartUtcMs && slotStartMs < dayEndUtcMs && slotStartMs >= nowMs;
    });

    // keep chronological order (defensive)
    slotsForDay.sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc));

    const formatted = slotsForDay.map((s) => {
      const display = s.displayLocal ? s.displayLocal : `${toLocalTimeLabel(s.startUtc)} - ${toLocalTimeLabel(s.endUtc)}`;
      const displayShort = typeof display === "string" ? display.replace(/^[\d/]+\s*,\s*/, "") : display;
      return {
        value: s.startUtc,
        endUtc: s.endUtc,
        mode: s.mode,
        label: displayShort,
        raw: s,
      };
    });

    setTimeSlotsForSelectedDate(formatted);
    if (formatted.length) {
      const exists = formatted.find((f) => f.value === selectedTime);
      if (!exists) {
        setSelectedTime(formatted[0].value);
      }
    } else {
      setSelectedTime("");
    }
  }, [selectedDate, availableSlots]);


  const handleProceedToBook = () => {
    if (!selectedDate) {
      alert("Please select a date (today or after).");
      return;
    }
    if (!selectedTime) {
      alert("Please select a time slot.");
      return;
    }
    const slot = timeSlotsForSelectedDate.find((s) => s.value === selectedTime);
    if (!slot) {
      alert("Selected slot is not available. Please select another slot.");
      return;
    }
    const startUtc = slot.value;
    const endUtc = slot.endUtc;
    const d = new Date(startUtc);
    const dateStr = d.toISOString().slice(0, 10); // UTC date
    const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "long" }); // fine
    const sTime = new Date(startUtc);
    const eTime = new Date(endUtc);
    const pad = (n) => String(n).padStart(2, "0");
    // Use UTC hours/minutes so startTime represents the UTC hh:mm the backend expects
    const startTimeSimple = `${pad(sTime.getUTCHours())}:${pad(sTime.getUTCMinutes())}`;
    const endTimeSimple = `${pad(eTime.getUTCHours())}:${pad(eTime.getUTCMinutes())}`;

    const bookingDraft = {
      professionalId: profile._id || profile.id,
      date: dateStr,
      dayOfWeek,
      startTime: startTimeSimple,
      endTime: endTimeSimple,
      mode: slot.mode || "audio",
      notes: "",
      startUtc,
      endUtc,
      // include the full slot object returned by API so downstream booking page has displayLocal etc.
      slotRaw: slot.raw,
      // add a convenient slot id (if present) for backend use
      slotId: slot.raw?._id ?? slot.raw?.id ?? null,
      slotDisplayLocal: slot.raw?.displayLocal ?? `${toLocalTimeLabel(startUtc)} — ${toLocalTimeLabel(endUtc)}`,
    };
    navigate("/book-appointment", { state: { bookingDraft } });
  };

  if (loading) return <div style={{ padding: 16 }}>Loading profile...</div>;
  if (error) return <div style={{ padding: 16, color: "var(--muted)" }}>Error: {error}</div>;
  if (!profile) return <div style={{ padding: 16 }}>No profile found.</div>;

  const profStatus = profile && profile.status ? String(profile.status).toLowerCase() : null;
  const statusMap = { approved: { label: "Verified" }, pending: { label: "Pending", sub: "Under review" }, rejected: { label: "Rejected", sub: "Contact support" } };
  const mapped = profStatus && statusMap[profStatus] ? statusMap[profStatus] : { label: "Unknown", sub: "" };

  const hardcodedReviews = [
    { id: "r1", name: "Priya Sharma", rating: 5, text: "Very professional and helpful. Highly recommended.", when: "2 days ago" },
    { id: "r2", name: "Rohit Verma", rating: 4, text: "Good guidance and quick response.", when: "1 week ago" },
    { id: "r3", name: "Neha Gupta", rating: 5, text: "Excellent experience. Resolved my case efficiently.", when: "1 month ago" },
  ];

  const RecCard = ({ item }) => {
    const rating = Number(item.raw?.rating ?? item.raw?.avgRating ?? item.raw?.score ?? 4.6);
    const tags = Array.isArray(item.specialties) ? item.specialties : (item.raw?.specialties || []).slice?.(0, 4) || [];
    const ratingBg = rating >= 4.6 ? "#F3C34C" : rating >= 3.5 ? "#F59E0B" : "#F04438";
    const profileLink = `/profile/${item._id || item.id}`;

    // Safely calculate experience
    const getExperienceLabel = () => {
      const raw = item.raw || {};
      if (raw.yearsExperience != null && !Number.isNaN(Number(raw.yearsExperience))) {
        return `${raw.yearsExperience} yrs`;
      }
      const expArr = Array.isArray(raw.experience) ? raw.experience : [];
      if (expArr.length > 0) {
        // try to find max years
        const years = expArr.map(e => Number(e?.years || 0)).filter(n => n > 0);
        if (years.length > 0) return `${Math.max(...years)} yrs`;
        return `${expArr.length} jobs`;
      }
      return "N/A";
    };

    const expLabel = getExperienceLabel();

    return (
      <div style={styles.recCard}>
        <div style={{ ...styles.recTop, flex: 1 }}> {/* Added flex: 1 to fill space */}
          <Link to={profileLink} style={{ textDecoration: "none", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={styles.recAvatarWrap}>
              <img src={item.avatar || avatar1} alt={item.name} style={styles.recAvatar} onError={(e) => (e.currentTarget.src = avatar1)} />
              <div style={{ ...styles.ratingPill, background: ratingBg }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false"><path fill="currentColor" d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.201 4.665 24 6 15.595 0 9.748l8.332-1.73L12 .587z" /></svg>
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={styles.recName}>{item.name}</div>
              <div style={styles.recRole}>{item.role}</div>
            </div>
          </Link>

          <div style={{ width: "100%", flex: 1 }}>
            <div style={styles.recLocation}>
              <div>📍 {item.location?.city ?? item.location?.address ?? "Unknown"}</div>
            </div>
            <div style={styles.recMetaGrid}>
              <span>{expLabel} exp</span>
              <span>•</span>
              <span>{item.raw?.casesAdjusted ?? "1000+"} Consults</span>
            </div>
            <div style={styles.tagsWrap}>
              {tags.slice(0, 3).map((t, i) => (
                <div key={i} style={styles.tag}>{t}</div>
              ))}
              {!!(item.specialties?.length > 3) && <div style={styles.tag}>+more</div>}
            </div>
          </div>
        </div>

        <div style={styles.recActionWrap}>
          <Link to={profileLink} style={{ textDecoration: "none", width: "100%" }}>
            <button style={styles.recButton}>Book Consultation</button>
          </Link>
        </div>
      </div>
    );
  };

  const SlotsList = () => {
    if (slotsLoading) {
      return <div style={styles.smallMuted}>Loading available slots...</div>;
    }
    if (slotsError) {
      return <div style={{ color: "red" }}>{slotsError}</div>;
    }
    if (!selectedDate) {
      return <div style={styles.smallMuted}>Select a date from the calendar to see available slots.</div>;
    }
    if (timeSlotsForSelectedDate.length === 0) {
      return <div style={styles.smallMuted}>No available slots on this date.</div>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {timeSlotsForSelectedDate.map((t) => {
          const active = selectedTime === t.value;
          return (
            <div
              key={t.value}
              onClick={() => setSelectedTime(t.value)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" ? setSelectedTime(t.value) : null)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 10,
                background: active ? "linear-gradient(90deg,#CAAA93,#B58C6D)" : "#F7F7F7",
                color: active ? "#fff" : "#2e241d",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              <div>{t.raw?.displayLocal ? t.raw.displayLocal.replace(/^[\d/]+,\s*/, "") : t.label}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>{t.mode ?? (t.raw?.mode ?? "")}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topStrip} />
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, width: "100%", justifyContent: isMobile ? "center" : "flex-start" }}>
            <div style={styles.avatarWrap}>
              <img src={profile.avatar ?? avatar1} alt={profile.name ?? "Profile"} style={styles.avatar} />
            </div>
            <div style={styles.headerText}>
              {profile.name && <h1 style={styles.name}>{profile.name}</h1>}
              {(profile.role || profile.title) && <div style={styles.subtitle}>{profile.role ?? profile.title}</div>}
              <div style={styles.location}>
                <span>➤</span>
                <span>
                  {profile.location?.city ?? ""}
                  {profile.location?.country ? `, ${profile.location.country}` : ""}
                </span>
              </div>
            </div>
          </div>
          <div style={styles.actionWrap}>
            <div style={{ textAlign: "right", color: "rgba(46,36,32,0.6)" }}>
              <div style={{ fontWeight: 800 }}>{mapped.label}</div>
              {mapped.sub && <div style={{ fontSize: 12 }}>{mapped.sub}</div>}
            </div>
            <button style={styles.bookButton} onClick={() => window.scrollTo({ top: 9999, behavior: "smooth" })}>Book Consultation</button>
          </div>
        </div>
        <div style={styles.tabsRow}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setActiveTab("overview")} style={styles.tabBtn(activeTab === "overview")} aria-pressed={activeTab === "overview"}>Overview</button>
            {activeTab === "overview" && <div style={styles.activeUnderline} />}
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <button onClick={() => setActiveTab("reviews")} style={styles.tabBtn(activeTab === "reviews")} aria-pressed={activeTab === "reviews"}>Reviews</button>
            <span style={styles.reviewCountPill}>{hardcodedReviews.length}</span>
            {activeTab === "reviews" && <div style={{ ...styles.activeUnderline, left: "56%", transform: "translateX(-50%)" }} />}
          </div>
        </div>
        <div style={styles.body}>
          <div style={styles.leftCol}>
            {activeTab === "overview" && (
              <div style={styles.cardBig}>
                {profile.overview && (
                  <>
                    <h3 style={{ marginTop: 0, ...styles.heading }}>Overview</h3>
                    <p style={styles.paragraph}>{profile.overview}</p>
                  </>
                )}
                {Array.isArray(specialties) && specialties.length > 0 && (
                  <>
                    <h4 style={{ ...styles.heading, fontSize: 16 }}>Specialist</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      {specialties.map((s, i) => (
                        <span key={`${s}-${i}`} style={{ display: "inline-block", backgroundColor: "#D9D9D9", color: "#141C2C", padding: "8px 14px", borderRadius: 999, marginRight: 8, marginBottom: 8, fontSize: 13, fontWeight: 800, border: "1px solid rgba(202,170,148,0.12)" }}>{s}</span>
                      ))}
                    </div>
                  </>
                )}
                {Array.isArray(profile.languages) && profile.languages.length > 0 && (
                  <>
                    <h4 style={{ ...styles.heading, fontSize: 16 }}>Languages</h4>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {profile.languages.map((l, idx) => (
                        <div key={`lang-${idx}`} style={{ padding: "8px 12px", borderRadius: 999, background: "#fff", border: "1px solid rgba(18,18,18,0.04)", fontWeight: 800, color: "#5b4335" }}>🌐 {l}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {activeTab === "reviews" && (
              <div style={styles.reviewsPanel}>
                <h3 style={{ marginTop: 0, ...styles.heading }}>Reviews</h3>
                {hardcodedReviews.length === 0 ? (
                  <div style={{ color: "rgba(46,36,32,0.6)" }}>No reviews yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {hardcodedReviews.map((r) => (
                      <div key={r.id} style={styles.reviewsListItemFull}>
                        <div style={styles.reviewsLeft}>
                          <img src={avatar1} alt={r.name} style={styles.reviewsAvatar} />
                        </div>
                        <div style={styles.reviewsBody}>
                          <div style={styles.reviewsHead}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={styles.reviewsName}>{r.name}</div>
                              <div style={styles.reviewsStars}>{Array.from({ length: r.rating }).map((_, i) => "⭐").join("")}</div>
                            </div>
                            <div style={{ color: "rgba(46,36,32,0.55)", fontSize: 12 }}>{r.when}</div>
                          </div>
                          <div style={styles.reviewsText}>{r.text}</div>
                          <div style={styles.reviewsDivider} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "overview" && Array.isArray(experience) && experience.length > 0 && (
              <div style={{ ...styles.cardBig, marginBottom: 18 }}>
                <h3 style={{ marginTop: 0, ...styles.heading }}>Experience</h3>
                {experience.map((exp, i) => (
                  <div key={exp._id ?? `exp-${i}`}>
                    <div style={styles.expItemRow}>
                      <div style={styles.expIconWrap}>
                        <img src={experienceIcon} alt="Experience" style={{ width: 36, height: 36, objectFit: "contain" }} />
                      </div>
                      <div style={styles.expContent}>
                        <div style={styles.expTitleRow}>
                          <div>
                            <h4 style={styles.expTitle}>{exp.role || exp.title || exp.position}</h4>
                            <div style={styles.expCompany}>{exp.firm ?? exp.company ?? exp.org}</div>
                          </div>
                          <div style={{ whiteSpace: "nowrap", marginLeft: 12, color: "#1f1f1f", fontWeight: 800 }}>{exp.years ? `${exp.years} years` : exp.start ? `${exp.start} – ${exp.end ?? "Present"}` : ""}</div>
                        </div>
                        {exp.description && <div style={styles.expDesc}>{exp.description}</div>}
                      </div>
                    </div>
                    {i !== experience.length - 1 && <div style={styles.expSeparator} />}
                  </div>
                ))}
              </div>
            )}
            {activeTab === "overview" && Array.isArray(education) && education.length > 0 && (
              <div style={styles.cardBig}>
                <h3 style={{ marginTop: 0, ...styles.heading }}>Education</h3>
                {education.map((edu, i) => (
                  <div key={edu._id ?? `edu-${i}`}>
                    <div style={styles.eduItemRow}>
                      <div style={styles.eduIconWrap}>
                        <img src={educationIcon} alt="Education" style={{ width: 36, height: 36, objectFit: "contain" }} />
                      </div>
                      <div style={styles.eduContent}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <div>
                            <h4 style={styles.eduTitle}>{edu.degree ?? edu.title ?? edu.program}</h4>
                            <div style={styles.eduSub}>{edu.institution ?? edu.school}{edu.location ? ` • ${edu.location}` : ""}</div>
                          </div>
                          <div style={{ whiteSpace: "nowrap", marginLeft: 12, color: "#1f1f1f", fontWeight: 800 }}>{edu.year ?? ""}</div>
                        </div>
                        {edu.description && <div style={styles.eduDesc}>{edu.description}</div>}
                      </div>
                    </div>
                    {i !== education.length - 1 && <div style={styles.expSeparator} />}
                  </div>
                ))}
              </div>
            )}
            {activeTab === "overview" && (
              <div style={{ ...styles.cardBig }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, marginRight: 12, background: "rgba(202,170,148,0.06)", color: "#CAAA93" }}>
                    <FaBalanceScale size={18} />
                  </div>
                  <h4 style={{ margin: 0, fontWeight: 900, color: "#2e241d" }}>Service Pricing</h4>
                </div>
                <div style={{ paddingLeft: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <FaMoneyBillWave className="text-success" />
                    <div>
                      <small style={{ color: "rgba(46,36,32,0.6)" }}>Default Rate</small>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontWeight: 700 }}>
                        <span style={{ fontSize: 20, color: "#6c757d", fontWeight: 800 }}>₹{Number(profile?.defaultRate ?? profile?.rate ?? 2500).toLocaleString()}</span>
                        <span style={{ fontSize: 13, color: "#6c757d" }}>{profile?.defaultDuration ?? "30 minutes"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FaBolt style={{ color: profile?.isInstantAvailable ? "#fff" : "#fff" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <small style={{ color: "rgba(46,36,32,0.6)" }}>Instant Booking</small>
                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ ...styles.instantPill, background: profile?.isInstantAvailable ? "linear-gradient(90deg,#2ea95a,#25a74b)" : "#E7E7E7", color: profile?.isInstantAvailable ? "#fff" : "rgba(46,36,32,0.6)" }} aria-live="polite">
                          <FaBolt style={{ width: 14, height: 14, opacity: 0.95 }} />
                          {profile?.isInstantAvailable ? <span>{`Available — ${profile?.minInstantMinutes ?? 30} – ${profile?.maxInstantMinutes ?? 120} min`}</span> : <span>Not Available</span>}
                        </div>
                        {profile?.isInstantAvailable && <div style={{ color: "rgba(46,36,32,0.6)", fontSize: 13 }}>Book instantly for a quick session</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div style={styles.rightCol}>
            <div style={styles.smallCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: "#2e241d" }}>Professional Statistics</div>
                </div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#EEF8FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🚀</div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#2e241d", fontSize: 16 }}>{totalYears ? `${totalYears} years` : "N/A"}</div>
                    <div style={{ color: "rgba(46,36,32,0.6)", fontSize: 13 }}>of experience in practice</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F9F0F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✨</div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#2e241d", fontSize: 16 }}>{casesHandled != null ? (typeof casesHandled === "number" ? casesHandled.toLocaleString() : casesHandled) : (Array.isArray(experience) ? experience.length : (Array.isArray(profile?.experience) ? profile.experience.length : 0))}</div>
                    <div style={{ color: "rgba(46,36,32,0.6)", fontSize: 13 }}>cases handled</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.smallCard}>
              <div style={styles.calendarHeader}>
                <div>
                  <div style={{ fontWeight: 900, color: "#FFF" }}>{monthLabel}</div>
                  <div style={{ color: "#FFF", fontSize: 13 }}>
                    {profile.location?.city ?? ""}
                    {profile.location?.country ? `, ${profile.location.country}` : ""}
                  </div>
                </div>
                <div>
                  <button onClick={() => setMonthOffset((m) => m - 1)} style={styles.monthNavButton} aria-label="Previous month">←</button>
                  <button onClick={() => setMonthOffset((m) => m + 1)} style={{ ...styles.monthNavButton, marginLeft: 8 }} aria-label="Next month">→</button>
                </div>
              </div>
              <MiniCalendar
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const sel = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                  if (sel < today) {
                    return;
                  }
                  setSelectedDate(sel);
                }}
                monthOffset={monthOffset}
                compact={isMobile}
                isDateAvailable={isDateAvailable}
              />
              <div style={{ marginTop: 14 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 8, color: "rgba(46,36,32,0.6)" }}>Available times</label>
                <div style={{ marginBottom: 8 }}>
                  <SlotsList />
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: "rgba(46,36,32,0.6)" }}>
                  {selectedDate ? (
                    <div>
                      <strong>Selected date:</strong> {selectedDate.toDateString()}
                      {selectedTime ? (
                        <div style={{ marginTop: 6 }}><strong>Selected slot:</strong> {timeSlotsForSelectedDate.find((t) => t.value === selectedTime)?.raw?.displayLocal ?? timeSlotsForSelectedDate.find((t) => t.value === selectedTime)?.label}</div>
                      ) : null}
                    </div>
                  ) : (
                    <div>Please select a date.</div>
                  )}
                </div>
                <button
                  disabled={!selectedTime}
                  onClick={handleProceedToBook}
                  style={{ ...styles.proceedBtn, opacity: !selectedTime ? 0.6 : 1 }}
                >
                  Proceed to Book
                </button>
              </div>
            </div>
            <div style={styles.smallCard}>
              {/* <h4 style={{ ...styles.heading, margin: 0, fontSize: 16 }}>Contact</h4> */}
              {/* {profile.email && <div style={styles.contactLine}>{profile.email}</div>} */}
              {/* {profile.phone && <div style={styles.contactLine}>+91 {profile.phone}</div>} */}
              {profile.location && (
                <div style={styles.contactLine}>
                  {profile.location.city ?? ""}
                  {profile.location.state ? `, ${profile.location.state}` : ""}
                  {profile.location.country ? `, ${profile.location.country}` : ""}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={styles.recSection}>
          <div style={styles.recSectionCard}>
            <h3 style={{ marginTop: 0, ...styles.heading }}>Other recommendations</h3>
            {(() => {
              const demoRelated = [
                {
                  id: "demo-1",
                  name: "Dr. Anita Mehra",
                  avatar: avatar1,
                  role: "Relationship Counselor",
                  specialties: ["Mediation", "Family Law"],
                  location: { city: "Mumbai" },
                  raw: {},
                },
                {
                  id: "demo-2",
                  name: "Adv. Karan Singh",
                  avatar: avatar1,
                  role: "Legal Advisor",
                  specialties: ["Divorce", "Child Custody"],
                  location: { city: "Delhi" },
                  raw: {},
                },
                {
                  id: "demo-3",
                  name: "Counsellor Priya",
                  avatar: avatar1,
                  role: "Therapist",
                  specialties: ["Counselling", "Conflict Resolution"],
                  location: { city: "Bengaluru" },
                  raw: {},
                },
              ];
              const relatedToShow = (related && related.length > 0) ? related : demoRelated;
              return relatedLoading ? (
                <div>Loading recommendations...</div>
              ) : (
                <div style={styles.recGrid}>
                  {relatedToShow.map((r) => (
                    <div key={r.id || r._id} style={{ width: "100%", height: "100%" }}>
                      <RecCard item={r} />
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
        <BookingCategories />
      </div>
    </div>
  );
}
