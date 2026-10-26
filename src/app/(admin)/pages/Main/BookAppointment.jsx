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
  const apiBase = "https://shadi-undo-backend.onrender.com";

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
    page: { minHeight: "100vh", fontFamily: "Raleway, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", background: "#FBF7F4", color: "#2e241d" },
    topHeader: {
      height: 140,
      background: `linear-gradient(90deg, ${PRIMARY} 0%, #e6c9ad 100%)`,
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      color: "#fff",
      boxSizing: "border-box",
    },
    cardLeft: { background: "#fff", padding: 18, borderRadius: 12, boxShadow: "0 10px 28px rgba(15,12,11,0.06)", borderTop: `6px solid ${PRIMARY}` },
    avatar: { width: 84, height: 84, borderRadius: "50%", objectFit: "cover", marginRight: 12, boxShadow: `0 6px 18px rgba(186,141,108,0.18)` },
    bookingHeader: { background: "#fff", borderRadius: 30, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 8px 20px rgba(15,12,11,0.04)", gap: 8 },
    bookingHeaderLeft: { fontWeight: 900, fontSize: 20 },
    bookingHeaderControls: { display: "flex", gap: 10, alignItems: "center" },
    formCard: { background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 10px 28px rgba(15,12,11,0.06)" },
    input: { width: "100%", padding: "10px 12px", border: "none", borderBottom: "2px solid rgba(0,0,0,0.12)", outline: "none", fontSize: 15, marginBottom: 12, background: "transparent" },
    textarea: { width: "100%", minHeight: 110, padding: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", resize: "vertical", marginTop: 8 },
    pill: { display: "inline-block", padding: "8px 14px", borderRadius: 14, background: "#ececec", marginRight: 8, cursor: "pointer", border: "none" },
    selectedPill: { background: PRIMARY, color: "#fff" },
    smallSelect: { padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
    primaryBtn: { background: PRIMARY, color: "#fff", border: "none", padding: "12px 20px", borderRadius: 28, fontWeight: 800, cursor: "pointer" },
    // use theme color for GET OTP button
    otpBtn: { background: PRIMARY, color: "#fff", border: "none", padding: "10px 14px", borderRadius: 8, fontWeight: 800, cursor: "pointer" },
    verifyBtn: { background: "#49b7ff", color: "#fff", border: "none", padding: "14px 28px", borderRadius: 999, fontWeight: 800, cursor: "pointer" },
    muted: { color: "rgba(46,36,32,0.6)" },
    error: { color: "crimson", marginTop: 8 },
    success: { color: "green", marginTop: 8 },
    leftStepBox: { background: "#FBF7F4", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, padding: 20, minHeight: 180, fontWeight: 900, fontSize: 26, borderLeft: `6px solid ${PRIMARY}` },
    profileMeta: { display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" },
    profileName: { fontSize: 20, fontWeight: 900, color: PRIMARY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    profileRole: { color: "rgba(46,36,32,0.6)" },
    profileStats: { marginTop: 12, color: "rgba(46,36,32,0.75)" },
  };

  return (
    <div style={styles.page}>
      <style>{`
        .bu-container {
          width: 100%;
          box-sizing: border-box;
          padding: 16px;
          margin: 0 auto;
          margin-left:-0.5rem;
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .bu-container {
            grid-template-columns: 320px 1fr 360px;
            gap: 24px;
            padding: 24px;
            max-width: 1200px;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .bu-container {
            grid-template-columns: 1fr 360px;
            gap: 20px;
            padding: 20px;
            max-width: 1000px;
          }
        }
        .bu-bookingHeaderControls > * { min-width: 0; }
        .bu-bookingHeaderControls input[type="date"],
        .bu-bookingHeaderControls input[type="time"] {
          box-sizing: border-box;
        }
        .bu-cardLeft { width: 100%; display: flex; flex-direction: column; gap: 12px; }
        .bu-summary { text-align: left; }
        .bu-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        @media (max-width: 480px) {
          .bu-topHeader { height: 110px !important; padding: 10px !important; }
          .bu-leftStepBox { min-height: 140px !important; font-size: 22px !important; }
          .bu-bookingHeader { padding: 12px !important; border-radius: 18px !important; }
        }
        @media (max-width: 767px) {
          .bu-bookingHeaderControls { flex-wrap: wrap; gap: 8px; }
          .bu-bookingHeaderControls input[type="date"],
          .bu-bookingHeaderControls input[type="time"] {
            width: 100% !important;
          }
          .bu-leftColumnInline { display: none; }
        }
        .auth-tabs { display:flex; gap:8px; margin-top:12px; }
        .auth-tab { padding:8px 14px; border-radius:999px; cursor:pointer; border:1px solid rgba(0,0,0,0.06); background:#fff; font-weight:700; }
        .auth-tab.active { background: ${PRIMARY}; color:#fff; border-color: ${PRIMARY}; }
        .profile-card-accent { background: linear-gradient(90deg, rgba(186,141,108,0.06), rgba(186,141,108,0.02)); padding:12px; border-radius:10px; }
      `}</style>

      <div className="bu-topHeader" style={styles.topHeader}>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 220 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Tired of Waiting ?</div>
            <div style={{ fontWeight: 600 }}>Find the Help You Need—Now</div>
          </div>
          <div className="search-wrap" style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "0 1 420px", minWidth: 180, background: "rgba(255,255,255,0.9)", padding: "8px 12px", borderRadius: 10, color: "#333" }}>
              <input placeholder="Counsellors Near by.." style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
            </div>
            <div style={{ flex: "0 1 420px", minWidth: 180, background: "rgba(255,255,255,0.9)", padding: "8px 12px", borderRadius: 10, color: "#333" }}>
              <input placeholder="Find Counsellors..." style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
            </div>
            <div style={{ textAlign: "center", marginLeft: 8 }}>
              <div style={{ background: "#DDEFFB", display: "inline-block", padding: 8, borderRadius: 999 }}>✓</div>
              <div style={{ fontSize: 12 }}>Verified</div>
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
                    <div style={styles.profileStats}>10+ yrs</div>
                    <div style={styles.profileStats}>1000+ sessions</div>
                  </div>
                </div>
              </div>

              <div className="profile-card-accent" style={{ marginTop: 12 }}>
                <button onClick={() => navigate(`/profile/${professional?._id || professional?.id || bookingDraft?.professionalId}`)} style={{ ...styles.primaryBtn, width: "100%", padding: "12px 16px", borderRadius: 12 }}>
                  View Profile
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="bu-bookingHeader" style={styles.bookingHeader}>
            <div style={styles.bookingHeaderLeft}>Booking Confirmation :</div>
            <div className="bu-bookingHeaderControls" style={{ ...styles.bookingHeaderControls, alignItems: "center" }}>
              <div style={{ width: 160, maxWidth: "40%" }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ ...styles.smallSelect, width: "100%" }}
                />
              </div>
              <div style={{ width: 120, maxWidth: "30%" }}>
                <input
                  type="time"
                  value={selectedStartTime}
                  onChange={(e) => setSelectedStartTime(e.target.value)}
                  style={{ ...styles.smallSelect, width: "100%" }}
                />
              </div>
              <div style={{ width: 120, maxWidth: "30%" }}>
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
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ width: 200, flexShrink: 0 }} className="bu-leftColumnInline">
                <div className="bu-leftStepBox" style={styles.leftStepBox}>Step - 2</div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {isRegistered ? (
                  <>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>You're signed in</div>
                    <div style={styles.muted}>Proceed to confirm your appointment — you may edit date/time, add notes and choose who this appointment is for.</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Step - 1 Register/Login</div>
                    <div style={styles.muted}>Choose Register or Login. Register requires phone.</div>
                  </>
                )}

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 8, fontWeight: 700 }}>Appointment For :</label>
                  <div className="bu-pills">
                    {["Self", "Wife", "Husband", "Mother", "Father", "Other"].map((opt) => {
                      const selected = appointmentFor === opt;
                      return (
                        <button key={opt} onClick={() => setAppointmentFor(opt)} style={{ ...styles.pill, ...(selected ? styles.selectedPill : {}) }}>{opt}</button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 8, fontWeight: 700 }}>Notes</label>
                  <textarea placeholder='E.g. "Initial consultation about stress management."' value={notes} onChange={(e) => setNotes(e.target.value)} style={styles.textarea} />
                </div>

                {!isRegistered && (
                  <div style={{ marginTop: 14 }}>
                    <div className="auth-tabs">
                      <div className={`auth-tab ${authTab === "register" ? "active" : ""}`} onClick={() => { setAuthTab("register"); setRegOtpError(null); }}>
                        Register
                      </div>
                      <div className={`auth-tab ${authTab === "login" ? "active" : ""}`} onClick={() => { setAuthTab("login"); setLoginOtpError(null); }}>
                        Login
                      </div>
                    </div>

                    {authTab === "register" && (
                      <div style={{ marginTop: 12 }}>
                        <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Name</label>
                        <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Full name" style={styles.input} />

                        <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Email</label>
                        <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" style={styles.input} />

                        <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Phone number (required)</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+91 9876543210" style={{ ...styles.input, marginBottom: 0, flex: "1 1 220px" }} />
                          <button onClick={() => requestRegisterOtp()} disabled={regOtpLoading} style={{ ...styles.otpBtn, whiteSpace: "nowrap", flex: "0 0 auto" }}>
                            {regOtpLoading ? "Sending..." : (resendCooldownReg > 0 ? `Wait ${resendCooldownReg}s` : "GET OTP")}
                          </button>
                        </div>

                        {regOtpSent && (
                          <div style={{ marginTop: 12 }}>
                            <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Enter OTP</label>
                            <input value={regOtp} onChange={(e) => setRegOtp(e.target.value)} placeholder="123456" style={styles.input} />
                            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                              <button onClick={verifyRegisterOtp} disabled={regOtpLoading} style={styles.verifyBtn}>{regOtpLoading ? "Verifying..." : "Verify"}</button>
                              <button onClick={() => { setRegOtpSent(false); setRegOtp(""); setRegOtpError(null); }} style={{ padding: "12px 18px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)", background: "#fff", cursor: "pointer" }}>Cancel</button>
                              <button onClick={() => { if (resendCooldownReg === 0) { requestRegisterOtp({ forceResend: true }); } else { setRegOtpError(`Please wait ${resendCooldownReg}s`); } }} disabled={regOtpLoading} style={{ padding: "12px 18px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)", background: "#fff", cursor: "pointer" }}>Resend OTP</button>
                            </div>
                          </div>
                        )}

                        {regOtpError && <div style={styles.error}>{regOtpError}</div>}
                      </div>
                    )}

                    {authTab === "login" && (
                      <div style={{ marginTop: 12 }}>
                        <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Email</label>
                        <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" style={styles.input} />

                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <button onClick={() => requestLoginOtp()} disabled={loginOtpLoading} style={{ ...styles.otpBtn, whiteSpace: "nowrap", flex: "0 0 auto" }}>
                            {loginOtpLoading ? "Sending..." : (resendCooldownLogin > 0 ? `Wait ${resendCooldownLogin}s` : "GET OTP")}
                          </button>
                        </div>

                        {loginOtpSent && (
                          <div style={{ marginTop: 12 }}>
                            <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Enter OTP</label>
                            <input value={loginOtp} onChange={(e) => setLoginOtp(e.target.value)} placeholder="123456" style={styles.input} />
                            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                              <button onClick={verifyLoginOtp} disabled={loginOtpLoading} style={styles.verifyBtn}>{loginOtpLoading ? "Verifying..." : "Verify"}</button>
                              <button onClick={() => { setLoginOtpSent(false); setLoginOtp(""); setLoginOtpError(null); }} style={{ padding: "12px 18px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)", background: "#fff", cursor: "pointer" }}>Cancel</button>
                              <button onClick={() => { if (resendCooldownLogin === 0) { requestLoginOtp(); } else { setLoginOtpError(`Please wait ${resendCooldownLogin}s`); } }} disabled={loginOtpLoading} style={{ padding: "12px 18px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)", background: "#fff", cursor: "pointer" }}>Resend OTP</button>
                            </div>
                          </div>
                        )}

                        {loginOtpError && <div style={styles.error}>{loginOtpError}</div>}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 18 }}>
                  <button onClick={handleConfirmBooking} disabled={bookingLoading} style={{ ...styles.primaryBtn, opacity: bookingLoading ? 0.8 : 1 }}>
                    {bookingLoading ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>

                {bookingError && <div style={styles.error}>{bookingError}</div>}
                {bookingSuccess && <div style={styles.success}>Booked successfully — {bookingSuccess?.appointment?._id ?? bookingSuccess?.appointment?.id ?? bookingSuccess?.id ?? "ID not returned"}</div>}
              </div>
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
