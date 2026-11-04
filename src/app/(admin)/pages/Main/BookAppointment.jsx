import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import avatar1 from "@/assets/images/users/avatar-1.jpg";

const PRIMARY = "#BA8D6C";
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


export default function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDraft = location.state?.bookingDraft ?? null;
  const apiBase = import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:5000" : "https://shadi-undo-backend.onrender.com");

  const [professional, setProfessional] = useState(bookingDraft?.professional ?? null);
  const [loadingProfile, setLoadingProfile] = useState(Boolean(!bookingDraft?.professional && bookingDraft?.professionalId));
  const [profileError, setProfileError] = useState(null);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtp, setRegOtp] = useState("");
  const [regOtpLoading, setRegOtpLoading] = useState(false);
  const [regOtpError, setRegOtpError] = useState(null);
  const [resendCooldownReg, setResendCooldownReg] = useState(0);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState("");
  const [loginOtpLoading, setLoginOtpLoading] = useState(false);
  const [loginOtpError, setLoginOtpError] = useState(null);
  const [resendCooldownLogin, setResendCooldownLogin] = useState(0);

  useEffect(() => {
    let t1;
    if (resendCooldownReg > 0) {
      t1 = setInterval(() => setResendCooldownReg((s) => Math.max(0, s - 1)), 1000);
    }
    return () => clearInterval(t1);
  }, [resendCooldownReg]);

  useEffect(() => {
    let t2;
    if (resendCooldownLogin > 0) {
      t2 = setInterval(() => setResendCooldownLogin((s) => Math.max(0, s - 1)), 1000);
    }
    return () => clearInterval(t2);
  }, [resendCooldownLogin]);

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t && t !== token) setToken(t);
  }, [token]);
  const isRegistered = Boolean(token);

  const userPayload = useMemo(() => {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }, [token]);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const [appointmentFor, setAppointmentFor] = useState(bookingDraft?.appointmentFor ?? "Self");
  const [notes, setNotes] = useState(bookingDraft?.notes ?? "");

  const [selectedDate, setSelectedDate] = useState(bookingDraft?.date ?? "");
  const [selectedStartTime, setSelectedStartTime] = useState(bookingDraft?.startTime ?? "");
  const [selectedEndTime, setSelectedEndTime] = useState(bookingDraft?.endTime ?? "");

  const [authTab, setAuthTab] = useState("register");

  useEffect(() => {
    if (professional) return;
    const profId = bookingDraft?.professionalId;
    if (!profId) return;
    let cancelled = false;
    const controller = new AbortController();
    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const url = `${apiBase}/api/professionals/search?id=${encodeURIComponent(profId)}`;
        const res = await fetchWithTimeout(url, { method: "GET", headers: { Accept: "application/json" }, signal: controller.signal }, DEFAULT_TIMEOUT);
        const text = await res.text().catch(() => "");
        let json = null;
        try { json = text ? JSON.parse(text) : null; } catch {}
        if (!res.ok) {
          throw new Error((json && (json.message || json.error)) || `Failed to fetch professional (${res.status}) ${text}`);
        }
        let found = null;
        if (Array.isArray(json?.data)) {
          found = json.data.find((p) => p && (p._id === profId || p.id === profId)) ?? json.data[0] ?? null;
        } else if (json && (json._id === profId || json.id === profId)) {
          found = json;
        } else {
          found = json;
        }
        if (!found) throw new Error("Professional not found");
        if (!cancelled) setProfessional(found);
      } catch (err) {
        if (err.name === "AbortError") return;
        if (!cancelled) setProfileError(err.message || "Failed to load professional");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };
    void loadProfile();
    return () => { cancelled = true; controller.abort(); };
  }, [bookingDraft?.professionalId, professional, apiBase]);

  const canRequestReg = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((regEmail || "").trim());
    const phoneOk = /^\+?[0-9\s-]{7,15}$/.test((regPhone || "").trim());
    return regName?.trim() && emailOk && phoneOk;
  };
  const canRequestLogin = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((loginEmail || "").trim());

  const requestRegisterOtp = async (opts = { forceResend: false }) => {
    setRegOtpError(null);
    if (!canRequestReg()) { setRegOtpError("Please provide a valid name, email and phone to register"); return; }
    if (resendCooldownReg > 0 && !opts.forceResend) { setRegOtpError(`Please wait ${resendCooldownReg}s before resending OTP.`); return; }
    setRegOtpLoading(true);
    try {
      const url = `${apiBase}/api/auth/register`;
      const payload = { name: regName?.trim(), email: regEmail?.trim(), phone: regPhone?.trim() };
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      }, DEFAULT_TIMEOUT);
      const text = await res.text().catch(() => "");
      let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        const msg = (json && (json.message || json.error)) || text || `Error ${res.status}`;
        if (/exists|already registered|already exists/i.test(msg)) {
          setRegOtpError("This email or phone is already registered. Switch to Login.");
          setAuthTab("login");
          return;
        }
        throw new Error(msg);
      }
      // IMPORTANT: backend must NOT return OTPs in production responses. We don't
      // store or display any debug OTP returned by the server.
      setRegOtpSent(true);
      setResendCooldownReg(30);
    } catch (err) {
      setRegOtpError(err.message || "Failed to request OTP");
    } finally { setRegOtpLoading(false); }
  };

  const requestLoginOtp = async () => {
    setLoginOtpError(null);
    if (!canRequestLogin()) { setLoginOtpError("Please provide a valid email to login"); return; }
    setLoginOtpLoading(true);
    try {
      const url = `${apiBase}/api/auth/login`;
      const payload = { email: loginEmail?.trim() };
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      }, DEFAULT_TIMEOUT);
      const text = await res.text().catch(() => "");
      let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        const message = (json && (json.message || json.error)) || `Login OTP request failed: ${res.status} ${text}`;
        throw new Error(message);
      }
      // Do not accept or surface any debug OTPs from server responses here.
      setLoginOtpSent(true);
      setResendCooldownLogin(30);
    } catch (err) {
      setLoginOtpError(err.message || "Failed to request login OTP");
    } finally { setLoginOtpLoading(false); }
  };

  const verifyRegisterOtp = async () => {
    setRegOtpError(null);
    if (!regOtp || !canRequestReg()) { setRegOtpError("Please provide required fields and the OTP."); return; }
    setRegOtpLoading(true);
    try {
      const url = `${apiBase}/api/auth/register/verify`;
      const payload = { name: regName?.trim(), email: regEmail?.trim(), phone: regPhone?.trim(), otp: regOtp?.trim() };
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      }, DEFAULT_TIMEOUT);
      const text = await res.text().catch(() => "");
      let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        const message = (json && (json.message || json.error)) || `Verify failed: ${res.status} ${text}`;
        throw new Error(message);
      }
      const receivedToken = json?.token || json?.accessToken || json?.data?.token || json?.jwt;
      if (receivedToken) {
        // Consider switching to HttpOnly secure cookies for production
        localStorage.setItem("token", receivedToken);
        setToken(receivedToken);
      }
      setRegOtpSent(false);
      setRegOtp("");
    } catch (err) {
      setRegOtpError(err.message || "OTP verification failed");
    } finally { setRegOtpLoading(false); }
  };

  const verifyLoginOtp = async () => {
    setLoginOtpError(null);
    if (!loginOtp || !canRequestLogin()) { setLoginOtpError("Please provide the OTP and the email used to request it."); return; }
    setLoginOtpLoading(true);
    try {
      const url = `${apiBase}/api/auth/login/verify`;
      const payload = { email: loginEmail?.trim(), otp: loginOtp?.trim() };
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      }, DEFAULT_TIMEOUT);
      const text = await res.text().catch(() => "");
      let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        const message = (json && (json.message || json.error)) || `Verify failed: ${res.status} ${text}`;
        throw new Error(message);
      }
      const receivedToken = json?.token || json?.accessToken || json?.data?.token || json?.jwt;
      if (receivedToken) {
        // Consider switching to HttpOnly secure cookies for production
        localStorage.setItem("token", receivedToken);
        setToken(receivedToken);
      }
      setLoginOtpSent(false);
      setLoginOtp("");
    } catch (err) {
      setLoginOtpError(err.message || "OTP verification failed");
    } finally { setLoginOtpLoading(false); }
  };

  const formatTimeWithSeconds = (dateStr, timeHHMM) => {
    try {
      let iso = null;
      if (/T/.test(timeHHMM)) {
        iso = timeHHMM;
      } else {
        iso = `${dateStr}T${timeHHMM}:00`;
      }
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return timeHHMM;
      return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
    } catch {
      return timeHHMM;
    }
  };

  const formattedSlotLabel = useMemo(() => {
    const d = selectedDate || bookingDraft?.date || "";
    const s = selectedStartTime || bookingDraft?.startTime || "";
    const e = selectedEndTime || bookingDraft?.endTime || "";
    if (!d || !s) return "";
    const start = formatTimeWithSeconds(d, s);
    const end = e ? formatTimeWithSeconds(d, e) : "";
    return `${d} · ${start}${end ? ` - ${end}` : ""} (${bookingDraft?.mode ?? "mode N/A"})`;
  }, [selectedDate, selectedStartTime, selectedEndTime, bookingDraft]);

  const handleConfirmBooking = async () => {
    setBookingError(null);
    if (!bookingDraft) { setBookingError("Booking details missing"); return; }
    if (!token) { setBookingError("Please register / verify before confirming a booking."); return; }
    setBookingLoading(true);
    try {
      const url = `${apiBase}/api/appointments`;
      const payload = {
        professionalId: bookingDraft.professionalId,
        date: selectedDate || bookingDraft.date,
        dayOfWeek: bookingDraft.dayOfWeek,
        startTime: selectedStartTime || bookingDraft.startTime,
        endTime: selectedEndTime || bookingDraft.endTime,
        mode: bookingDraft.mode ?? "audio",
        notes: notes || "",
        appointmentFor: appointmentFor || "Self",
        startUtc: bookingDraft.startUtc && !selectedStartTime && !selectedDate ? bookingDraft.startUtc : null,
        endUtc: bookingDraft.endUtc && !selectedStartTime && !selectedDate ? bookingDraft.endUtc : null,
        slotId: (!selectedStartTime && !selectedDate) ? (bookingDraft.slotId ?? bookingDraft.slotRaw?._id ?? bookingDraft.slotRaw?.id ?? null) : null,
        slotDisplayLocal: bookingDraft.slotDisplayLocal ?? bookingDraft.slotRaw?.displayLocal ?? null,
      };
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }, DEFAULT_TIMEOUT);
      const text = await res.text().catch(() => "");
      let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        const message = (json && (json.message || json.error)) || `Booking failed: ${res.status} ${text}`;
        throw new Error(message);
      }
      setBookingSuccess(json);
      setBookingError(null);
    } catch (err) {
      setBookingError(err.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (!bookingDraft) {
      const t = setTimeout(() => navigate("/", { replace: true }), 900);
      return () => clearTimeout(t);
    }
  }, [bookingDraft, navigate]);

  useEffect(() => {
    if (!bookingDraft) return;
    if (!bookingDraft.startTime || !bookingDraft.endTime) return;
    if (!selectedStartTime && !selectedEndTime) {
      setSelectedStartTime(bookingDraft.startTime);
      setSelectedEndTime(bookingDraft.endTime);
      return;
    }
    if (selectedStartTime && (!selectedEndTime || selectedEndTime === bookingDraft.startTime)) {
      try {
        const toMinutes = (t) => {
          if (!t) return null;
          const [h, m] = t.split(":").map(Number);
          return h * 60 + m;
        };
        const s = toMinutes(bookingDraft.startTime);
        const e = toMinutes(bookingDraft.endTime);
        if (s != null && e != null) {
          const dur = e - s;
          const newS = toMinutes(selectedStartTime);
          if (newS != null) {
            const newE = newS + dur;
            const hh = String(Math.floor(newE / 60)).padStart(2, "0");
            const mm = String(newE % 60).padStart(2, "0");
            setSelectedEndTime(`${hh}:${mm}`);
          }
        }
      } catch {}
    }
  }, [selectedStartTime, bookingDraft]);

  const styles = {
    page: {
      minHeight: "100vh",
      fontFamily: "Raleway, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      background: "#FBF7F4",
      color: "#1f2937",
    },
    topHeader: {
      minHeight: 88,
      background: `linear-gradient(90deg, ${PRIMARY} 0%, #e6c9ad 100%)`,
      display: "flex",
      alignItems: "center",
      padding: "16px 24px",
      color: "#fff",
      boxSizing: "border-box",
    },
    cardLeft: {
      background: "#fff",
      padding: 22,
      borderRadius: 14,
      boxShadow: "0 8px 24px rgba(15,12,11,0.06)",
      borderTop: `5px solid ${PRIMARY}`,
      boxSizing: "border-box",
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: "50%",
      objectFit: "cover",
      boxShadow: "0 4px 14px rgba(186,141,108,0.2)",
    },
    bookingHeader: {
      background: "#fff",
      borderRadius: 14,
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 6px 20px rgba(15,12,11,0.04)",
      gap: 12,
      flexWrap: "wrap",
    },
    bookingHeaderLeft: {
      fontWeight: 800,
      fontSize: 18,
      color: "#1f2937",
    },
    bookingHeaderControls: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      flexWrap: "wrap",
    },
    formCard: {
      background: "#fff",
      padding: "24px 26px",
      borderRadius: 14,
      boxShadow: "0 8px 24px rgba(15,12,11,0.06)",
      boxSizing: "border-box",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      border: "1.5px solid #d1d5db",
      borderRadius: 8,
      outline: "none",
      fontSize: 15,
      marginBottom: 14,
      background: "#ffffff",
      backgroundColor: "#ffffff",
      color: "#111827",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    textarea: {
      width: "100%",
      minHeight: 100,
      padding: "12px 14px",
      borderRadius: 8,
      border: "1.5px solid #d1d5db",
      resize: "vertical",
      marginTop: 8,
      background: "#ffffff",
      backgroundColor: "#ffffff",
      color: "#111827",
      fontSize: 15,
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    pill: {
      display: "inline-block",
      padding: "8px 16px",
      borderRadius: 20,
      background: "#f3f4f6",
      color: "#374151",
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
      border: "1px solid #e5e7eb",
      transition: "all 0.18s ease",
    },
    selectedPill: {
      background: PRIMARY,
      color: "#ffffff",
      borderColor: PRIMARY,
      fontWeight: 700,
      boxShadow: "0 2px 8px rgba(202,170,147,0.35)",
    },
    smallSelect: {
      padding: "8px 12px",
      borderRadius: 8,
      border: "1.5px solid #d1d5db",
      background: "#ffffff",
      color: "#111827",
      cursor: "pointer",
      fontSize: 14,
      outline: "none",
    },
    primaryBtn: {
      background: PRIMARY,
      color: "#ffffff",
      border: "none",
      padding: "12px 28px",
      borderRadius: 28,
      fontWeight: 800,
      fontSize: 16,
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(202,170,147,0.35)",
      transition: "all 0.2s ease",
    },
    otpBtn: {
      background: PRIMARY,
      color: "#ffffff",
      border: "none",
      padding: "11px 18px",
      borderRadius: 8,
      fontWeight: 800,
      fontSize: 14,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    verifyBtn: {
      background: "#0284c7",
      color: "#ffffff",
      border: "none",
      padding: "12px 24px",
      borderRadius: 8,
      fontWeight: 800,
      fontSize: 14,
      cursor: "pointer",
    },
    muted: { color: "#6b7280" },
    error: {
      color: "#dc2626",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      padding: "10px 14px",
      borderRadius: 8,
      marginTop: 10,
      fontSize: 14,
      fontWeight: 600,
    },
    success: {
      color: "#16a34a",
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      padding: "10px 14px",
      borderRadius: 8,
      marginTop: 10,
      fontSize: 14,
      fontWeight: 600,
    },
    profileMeta: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    profileName: {
      fontSize: 18,
      fontWeight: 800,
      color: "#1f2937",
    },
    profileRole: { color: "#6b7280", fontSize: 13, marginTop: 2 },
    profileStats: { marginTop: 8, color: "#6b7280", fontSize: 13 },
  };

  return (
    <div style={styles.page}>
      <style>{`
        .bu-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          box-sizing: border-box;
          padding: 24px 20px;
          display: grid;
          grid-template-columns: 280px 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1100px) {
          .bu-container {
            grid-template-columns: 1fr 340px;
            padding: 20px 16px;
          }
          .bu-cardLeft {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 768px) {
          .bu-container {
            grid-template-columns: 1fr;
            padding: 14px;
            gap: 16px;
          }
          .bu-topHeader {
            padding: 12px 16px !important;
          }
          .bu-bookingHeader {
            padding: 12px 14px !important;
            border-radius: 12px !important;
          }
          .bu-bookingHeaderControls {
            width: 100%;
            justify-content: space-between;
          }
          .bu-bookingHeaderControls > div {
            flex: 1 1 30% !important;
            max-width: 100% !important;
            width: auto !important;
          }
        }
        input,
        textarea,
        select {
          color: #111827 !important;
          background-color: #ffffff !important;
          -webkit-text-fill-color: #111827 !important;
          font-family: inherit;
        }
        input::placeholder,
        textarea::placeholder {
          color: #9ca3af !important;
          -webkit-text-fill-color: #9ca3af !important;
          opacity: 1 !important;
        }
        input:focus,
        textarea:focus,
        select:focus {
          border-color: ${PRIMARY} !important;
          box-shadow: 0 0 0 3px rgba(202,170,147,0.25) !important;
          outline: none !important;
        }
        .bu-cardLeft { width: 100%; display: flex; flex-direction: column; gap: 12px; }
        .bu-summary { text-align: left; }
        .bu-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .auth-tabs { display: flex; gap: 10px; margin-top: 14px; margin-bottom: 14px; }
        .auth-tab {
          padding: 9px 22px;
          border-radius: 999px;
          cursor: pointer;
          border: 1.5px solid #d1d5db;
          background: #ffffff;
          color: #374151 !important;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .auth-tab:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        .auth-tab.active {
          background: ${PRIMARY} !important;
          color: #ffffff !important;
          border-color: ${PRIMARY} !important;
          box-shadow: 0 2px 8px rgba(202,170,147,0.35);
        }
        .profile-card-accent {
          background: #fdf8f4;
          border: 1px solid #f3e8df;
          padding: 14px;
          border-radius: 10px;
        }
      `}</style>

      <div className="bu-topHeader" style={styles.topHeader}>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 220 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Tired of Waiting ?</div>
            <div style={{ fontWeight: 600 }}>Find the Help You Need—Now</div>
          </div>
          <div className="search-wrap" style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", marginLeft: 8 }}>
              <div style={{ background: "#DDEFFB", display: "inline-block", padding: "6px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13, color: "#0369a1" }}>
                ✓ Verified Professionals
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="bu-container" role="main" aria-label="Book appointment container">
        <div className="bu-cardLeft" style={styles.cardLeft}>
          {loadingProfile ? (
            <div>Loading professional...</div>
          ) : profileError ? (
            <div style={styles.error}>{profileError}</div>
          ) : (
            <>
              <div style={styles.profileMeta}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img src={professional?.avatar || professional?.photo || avatar1} alt={professional?.name ?? "Professional"} style={styles.avatar} onError={(e) => (e.currentTarget.src = avatar1)} />
                  <div style={{ minWidth: 0 }}>
                    <div style={styles.profileName}>{professional?.name ?? "Professional Name"}</div>
                    <div style={styles.profileRole}>{professional?.role ?? professional?.title ?? "Counsellor / Professional"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800 }}>{professional?.location?.city ?? professional?.location?.address ?? "Unknown location"}</div>
                    <div style={styles.profileStats}>10+ yrs · 1000+ sessions</div>
                  </div>
                </div>
              </div>

              <div className="profile-card-accent" style={{ marginTop: 14 }}>
                <button onClick={() => navigate(`/profile/${professional?._id || professional?.id || bookingDraft?.professionalId}`)} style={{ ...styles.primaryBtn, width: "100%", padding: "10px 16px", borderRadius: 10, fontSize: 14 }}>
                  View Profile
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="bu-bookingHeader" style={styles.bookingHeader}>
            <div style={styles.bookingHeaderLeft}>Consultation Time:</div>
            <div className="bu-bookingHeaderControls" style={{ ...styles.bookingHeaderControls, alignItems: "center" }}>
              <div style={{ minWidth: 150 }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ ...styles.smallSelect, width: "100%" }}
                />
              </div>
              <div style={{ minWidth: 100 }}>
                <input
                  type="time"
                  value={selectedStartTime}
                  onChange={(e) => setSelectedStartTime(e.target.value)}
                  style={{ ...styles.smallSelect, width: "100%" }}
                />
              </div>
              <div style={{ minWidth: 100 }}>
                <input
                  type="time"
                  value={selectedEndTime}
                  onChange={(e) => setSelectedEndTime(e.target.value)}
                  style={{ ...styles.smallSelect, width: "100%" }}
                />
              </div>
            </div>
          </div>

          <div style={styles.formCard}>
            <div style={{ width: "100%" }}>
              {isRegistered ? (
                <div style={{ background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 10, padding: "14px 18px", marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#141c2c" }}>
                        ✓ You are signed in
                      </div>
                      <div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
                        {userPayload?.email ? `Account: ${userPayload.email}` : "Active login session"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("professional");
                        setToken(null);
                      }}
                      style={{
                        background: "#fff",
                        border: "1px solid #dc3545",
                        color: "#dc3545",
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Logout / Switch Account
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 18, borderBottom: "1px solid #f3f4f6", paddingBottom: 14 }}>
                  <div style={{ display: "inline-block", background: "#fdf8f4", color: PRIMARY, border: `1px solid ${PRIMARY}`, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    Step 1 of 2
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>Register or Login to Book</div>
                  <div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
                    New users can register below. If you already have an account, switch to Login.
                  </div>
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                <label style={{ display: "block", fontSize: 14, marginBottom: 8, fontWeight: 700, color: "#1f2937" }}>
                  Appointment For :
                </label>
                <div className="bu-pills">
                  {["Self", "Wife", "Husband", "Mother", "Father", "Other"].map((opt) => {
                    const selected = appointmentFor === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAppointmentFor(opt)}
                        style={{ ...styles.pill, ...(selected ? styles.selectedPill : {}) }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 700, color: "#1f2937" }}>
                  Notes (Optional)
                </label>
                <textarea
                  placeholder='E.g. "Initial consultation about mutual separation and custody."'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              {!isRegistered && (
                <div style={{ marginTop: 18 }}>
                  <div className="auth-tabs">
                    <div
                      className={`auth-tab ${authTab === "register" ? "active" : ""}`}
                      onClick={() => { setAuthTab("register"); setRegOtpError(null); }}
                    >
                      Register (New User)
                    </div>
                    <div
                      className={`auth-tab ${authTab === "login" ? "active" : ""}`}
                      onClick={() => { setAuthTab("login"); setLoginOtpError(null); }}
                    >
                      Login (Existing User)
                    </div>
                  </div>

                  {authTab === "register" && (
                    <div style={{ marginTop: 12 }}>
                      <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 600, color: "#374151" }}>
                        Full Name
                      </label>
                      <input
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Enter your full name"
                        style={styles.input}
                      />

                      <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 600, color: "#374151" }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={styles.input}
                      />

                      <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 600, color: "#374151" }}>
                        Phone Number (Required)
                      </label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          style={{ ...styles.input, marginBottom: 0, flex: "1 1 220px" }}
                        />
                        <button
                          type="button"
                          onClick={() => requestRegisterOtp()}
                          disabled={regOtpLoading}
                          style={{ ...styles.otpBtn, whiteSpace: "nowrap", flex: "0 0 auto" }}
                        >
                          {regOtpLoading ? "Sending..." : (resendCooldownReg > 0 ? `Wait ${resendCooldownReg}s` : "GET OTP")}
                        </button>
                      </div>

                      {regOtpSent && (
                        <div style={{ marginTop: 14, background: "#f9fafb", padding: 16, borderRadius: 10, border: "1px solid #e5e7eb" }}>
                          <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 700, color: "#111827" }}>
                            Enter 6-Digit OTP sent to your email
                          </label>
                          <input
                            value={regOtp}
                            onChange={(e) => setRegOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            style={{ ...styles.input, marginBottom: 12, fontSize: 18, letterSpacing: 2, textAlign: "center" }}
                          />
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={verifyRegisterOtp}
                              disabled={regOtpLoading}
                              style={styles.verifyBtn}
                            >
                              {regOtpLoading ? "Verifying..." : "Verify OTP & Continue"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setRegOtpSent(false); setRegOtp(""); setRegOtpError(null); }}
                              style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", fontWeight: 600 }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => { if (resendCooldownReg === 0) { requestRegisterOtp({ forceResend: true }); } else { setRegOtpError(`Please wait ${resendCooldownReg}s`); } }}
                              disabled={regOtpLoading}
                              style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", fontWeight: 600 }}
                            >
                              Resend OTP
                            </button>
                          </div>
                        </div>
                      )}

                      {regOtpError && <div style={styles.error}>{regOtpError}</div>}
                    </div>
                  )}

                  {authTab === "login" && (
                    <div style={{ marginTop: 12 }}>
                      <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 600, color: "#374151" }}>
                        Registered Email Address
                      </label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="you@example.com"
                          style={{ ...styles.input, marginBottom: 0, flex: "1 1 220px" }}
                        />
                        <button
                          type="button"
                          onClick={() => requestLoginOtp()}
                          disabled={loginOtpLoading}
                          style={{ ...styles.otpBtn, whiteSpace: "nowrap", flex: "0 0 auto" }}
                        >
                          {loginOtpLoading ? "Sending..." : (resendCooldownLogin > 0 ? `Wait ${resendCooldownLogin}s` : "GET OTP")}
                        </button>
                      </div>

                      {loginOtpSent && (
                        <div style={{ marginTop: 14, background: "#f9fafb", padding: 16, borderRadius: 10, border: "1px solid #e5e7eb" }}>
                          <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 700, color: "#111827" }}>
                            Enter 6-Digit OTP sent to your email
                          </label>
                          <input
                            value={loginOtp}
                            onChange={(e) => setLoginOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            style={{ ...styles.input, marginBottom: 12, fontSize: 18, letterSpacing: 2, textAlign: "center" }}
                          />
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={verifyLoginOtp}
                              disabled={loginOtpLoading}
                              style={styles.verifyBtn}
                            >
                              {loginOtpLoading ? "Verifying..." : "Verify OTP & Continue"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setLoginOtpSent(false); setLoginOtp(""); setLoginOtpError(null); }}
                              style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", fontWeight: 600 }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => { if (resendCooldownLogin === 0) { requestLoginOtp(); } else { setLoginOtpError(`Please wait ${resendCooldownLogin}s`); } }}
                              disabled={loginOtpLoading}
                              style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", fontWeight: 600 }}
                            >
                              Resend OTP
                            </button>
                          </div>
                        </div>
                      )}

                      {loginOtpError && <div style={styles.error}>{loginOtpError}</div>}
                    </div>
                  )}
                </div>
              )}

              {bookingSuccess ? (
                <div
                  style={{
                    marginTop: 20,
                    background: "#f0fdf4",
                    border: "1.5px solid #86efac",
                    borderRadius: 14,
                    padding: "24px 20px",
                    textAlign: "center",
                    boxShadow: "0 6px 20px rgba(34,197,94,0.08)",
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#166534" }}>
                    Appointment Booked Successfully!
                  </div>
                  <p style={{ color: "#374151", fontSize: 14, marginTop: 8, marginBottom: 18, lineHeight: 1.5 }}>
                    Aapka consultation confirm ho chuka hai. Time aane par aap apne profile se direct video call join kar sakte hain.
                  </p>

                  <div
                    style={{
                      display: "inline-flex",
                      flexDirection: "column",
                      gap: 6,
                      background: "#ffffff",
                      border: "1px solid #bbf7d0",
                      padding: "12px 18px",
                      borderRadius: 10,
                      marginBottom: 20,
                      textAlign: "left",
                      width: "100%",
                      maxWidth: 380,
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#4b5563" }}>
                      <strong>Consultant:</strong> {professional?.name || "Professional"}
                    </div>
                    <div style={{ fontSize: 13, color: "#4b5563" }}>
                      <strong>Date & Time:</strong> {selectedDate || bookingDraft?.date} ({selectedStartTime || bookingDraft?.startTime} - {selectedEndTime || bookingDraft?.endTime})
                    </div>
                    <div style={{ fontSize: 13, color: "#4b5563" }}>
                      <strong>Booking Reference:</strong> #{String(bookingSuccess?.appointment?._id || bookingSuccess?.appointment?.id || "").slice(-6).toUpperCase()}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => navigate("/user-profile")}
                      style={{
                        background: PRIMARY,
                        color: "#fff",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(202,170,147,0.35)",
                      }}
                    >
                      View My Appointments →
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      style={{
                        background: "#ffffff",
                        color: "#374151",
                        border: "1.5px solid #d1d5db",
                        padding: "12px 20px",
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: "pointer",
                      }}
                    >
                      Home
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginTop: 22 }}>
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={bookingLoading}
                      style={{ ...styles.primaryBtn, width: "100%", opacity: bookingLoading ? 0.8 : 1 }}
                    >
                      {bookingLoading ? "Booking Appointment..." : "Confirm Booking"}
                    </button>
                  </div>

                  {bookingError && (
                    <div style={styles.error}>
                      <div>{bookingError}</div>
                      {bookingError.toLowerCase().includes("wallet") && (
                        <button
                          type="button"
                          onClick={() => navigate("/user-profile")}
                          style={{
                            marginTop: 10,
                            background: "#CAAA93",
                            color: "#03182A",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Go to Wallet & Add Money →
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bu-summary" style={{ background: "#fff", padding: 18, borderRadius: 12, boxShadow: "0 10px 28px rgba(15,12,11,0.06)" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Summary</div>
          <div style={{ marginTop: 12 }}>
            <div><strong>Professional</strong></div>
            <div style={{ marginTop: 6 }}>{professional?.name ?? "—"}</div>

            <div style={{ marginTop: 12 }}><strong>Date & Time</strong></div>
            <div style={{ marginTop: 6, color: "#333" }}>{formattedSlotLabel || "—"}</div>

            <div style={{ marginTop: 12 }}><strong>Appointment For</strong></div>
            <div style={{ marginTop: 6 }}>{appointmentFor}</div>

            <div style={{ marginTop: 12 }}><strong>Notes</strong></div>
            <div style={{ marginTop: 6, color: "#6c757d" }}>{notes || (bookingDraft?.notes ? bookingDraft.notes : "—")}</div>

            <div style={{ marginTop: 12 }}><strong>Contact</strong></div>
            <div style={{ marginTop: 6 }}>{isRegistered ? "From account" : (authTab === "register" ? (regEmail || regPhone || "—") : (loginEmail || "—"))}</div>
          </div>

          {!isRegistered && <div style={{ marginTop: 18 }}><div style={styles.muted}>After verification you will be able to confirm booking.</div></div>}
        </div>
      </div>
    </div>
  );
}
