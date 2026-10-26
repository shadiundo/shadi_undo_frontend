'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import DailyCall from "@/app/(admin)/apps/appointments/DailyCall.jsx";
import logo from "@/assets/images/shaadi-logo.png";
import { socket } from "@/lib/socket";


const API_URL = import.meta.env.VITE_API_URL || "";

const ACTIVE_CALL_KEY = "activeCall_v1";


function showPopup(message) {
  const div = document.createElement("div");
  div.textContent = message;

  Object.assign(div.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#111827",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "8px",
    zIndex: 99999,
    boxShadow: "0 10px 30px rgba(0,0,0,.4)",
    fontSize: "14px",
  });

  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}


// Responsive breakpoints
const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

function InlineModal({ visible, title, children, onClose }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(8px, 4vw, 16px)"
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.4)"
      }} onClick={onClose} />
      <div style={{
        zIndex: 100000,
        width: "min(calc(100vw - 32px), 500px)",
        maxHeight: "min(90vh, 600px)",
        overflow: "auto",
        background: "#fff",
        borderRadius: "clamp(8px, 1.5vw, 12px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
        padding: "clamp(16px, 3vw, 20px)",
        margin: "0 clamp(8px, 2vw, 16px)"
      }}>
        {title && <div style={{
          fontWeight: 700,
          fontSize: "clamp(16px, 2vw, 18px)",
          marginBottom: "clamp(12px, 2vw, 16px)",
          lineHeight: 1.3
        }}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function Appointments() {
  return (
    <div style={{
      padding: "clamp(12px, 3vw, 20px) clamp(12px, 2vw, 16px)",
      maxWidth: "min(100%, 1100px)",
      margin: "0 auto",
      width: "100%",
      boxSizing: "border-box"
    }}>
      <RecentAppointments />
    </div>
  );
}

/* --------------------------- RecentAppointments -------------------------- */
function RecentAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const abortRef = useRef(null);
  const intervalRef = useRef(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [notifications, setNotifications] = useState([]);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);



  // call/session state
  const [activeCall, setActiveCallRaw] = useState(null);
  const activeCallRef = useRef(null);
  const jitsiRef = useRef(null);

  // 🔌 Socket listeners for User actions (Moved here to avoid ReferenceError)
  useEffect(() => {
    if (!activeCall) return;

    // Join the socket room for this appointment
    socket.emit("join-session", {
      appointmentId: activeCall.id,
      role: "professional"
    });

    const onUserJoined = (data) => {
      console.log("Socket: user-joined", data);
      showPopup(`User ${data.user?.name || ""} has joined the session`);
    };

    const onUserLeft = (data) => {
      console.log("Socket: user-left", data);
      showPopup(`User ${data.user?.name || ""} has left the session`);
    };

    const onSessionEnded = (data) => {
      console.log("Socket: session-ended", data);
      showPopup("Session ended by user");
    };

    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("session-ended", onSessionEnded);

    return () => {
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("session-ended", onSessionEnded);
      socket.emit("leave-session", { appointmentId: activeCall.id });
    };
  }, [activeCall]);

  // Add refs for participant tracking
  const prevParticipantsRef = useRef({});
  const participantTrackingInitializedRef = useRef(false);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    const handler = (data) => {
      console.log("🔔 Notification:", data);

      setNotifications((prev) => [
        {
          id: Date.now(),
          message: data.message,
          appointmentId: data.appointmentId,
        },
        ...prev,
      ]);

      // Optional toast
      showPopup(data.message);
    };

    socket.on("notify-professional", handler);

    return () => {
      socket.off("notify-professional", handler);
    };
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected:", reason);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const [remainingMs, setRemainingMs] = useState(null);
  const countdownIntervalRef = useRef(null);
  const sessionFallbackTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const [modal, setModal] = useState({ visible: false });
  const modalResolveRef = useRef(null);

  // Responsive helpers
  const isXS = windowWidth < BREAKPOINTS.xs;
  const isSM = windowWidth < BREAKPOINTS.sm;
  const isMD = windowWidth < BREAKPOINTS.md;
  const isLG = windowWidth < BREAKPOINTS.lg;
  const isXL = windowWidth >= BREAKPOINTS.xl;

  // Handle window resize with debounce
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close drawer on window resize above md
  useEffect(() => {
    if (!isMD && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [windowWidth, isMD, isDrawerOpen]);

  const openModal = (options) =>
    new Promise((resolve) => {
      modalResolveRef.current = resolve;
      setModal({ visible: true, ...options });
    });

  const closeModal = (result) => {
    setModal({ visible: false });
    const r = modalResolveRef.current;
    modalResolveRef.current = null;
    if (r) r(result);
  };

  const tokenHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const safeNumber = (v) => {
    if (v == null) return NaN;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const isBeforeMinEnd = (call) => {
    if (!call) return false;
    const m = safeNumber(call.minEndTime);
    if (!Number.isFinite(m)) return false;
    return Date.now() < m;
  };

  const toPaise = (rupees) => Math.round(Number(rupees ?? 0) * 100);
  const fromPaise = (paise) => Number(paise) / 100;
  const formatINR = (valueRupees) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      }).format(valueRupees);
    } catch {
      return `₹${Number(valueRupees || 0).toFixed(2)}`;
    }
  };

  const resolveUrl = (url) => {
    if (!url || typeof url !== "string") return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (API_URL) {
      return `${API_URL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
    }
    return url;
  };

  const doFetch = async (url, opts = {}) => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (opts.attachToGlobalAbort) {
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch { }
      }
      abortRef.current = controller;
    }

    const fullUrl = resolveUrl(url);

    const headers = { "Content-Type": "application/json", ...(opts.headers || {}), ...tokenHeader() };

    const fetchOpts = {
      ...opts,
      headers,
      signal,
    };

    const res = await fetch(fullUrl, fetchOpts);
    return res;
  };

  const parseJsonSafe = async (resp) => {
    try { return await resp.json(); } catch { return null; }
  };

  const computeAmountPaiseFromRaw = (raw) => {
    const duration = Number(raw?.durationMinutesRequested ?? raw?.durationMinutes ?? 30);
    const ps = raw?.priceSnapshot || {};
    if (typeof ps.ratePer30m === "number") return Math.round((ps.ratePer30m * 100 * duration) / 30);
    if (typeof ps.ratePerMinute === "number") return Math.round(ps.ratePerMinute * 100 * duration);
    if (typeof raw?.amount === "number") return toPaise(raw.amount);
    if (typeof ps.ratePer30m === "string" && !isNaN(Number(ps.ratePer30m))) return Math.round((Number(ps.ratePer30m) * 100 * duration) / 30);
    return 0;
  };

  const fetchRecentAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doFetch("/api/appointments/professional/recent?limit=50", { method: "GET" });
      if (!res.ok) {
        const body = await parseJsonSafe(res);
        setAppointments([]);
        setError(body?.message || `Request failed: ${res.status}`);
        return;
      }
      const body = await parseJsonSafe(res);
      if (!body?.success) {
        setAppointments([]);
        setError(body?.message || "Failed to load");
        return;
      }
      const normalized = (Array.isArray(body.data) ? body.data : []).map((a) => {
        const raw = a.raw ?? a;
        const amountPaise = computeAmountPaiseFromRaw(raw);
        const displayAmountRupees = fromPaise(amountPaise);

        const profResponseMessage =
          raw?.profResponse?.message || raw?.rejection?.message || (a.profResponse && a.profResponse.message) || "";

        return {
          raw,
          id: a.id || a._id || (a._id && a._id.toString ? a._id.toString() : undefined),
          client: a.user?.name || a.user || a.client || a.user?.email || "Unknown",
          type: a.type || a.service || "Session",
          scheduledAt: a.scheduledAt || a.date || a.createdAt,
          amountPaise,
          amountLabel: formatINR(displayAmountRupees),
          notes: a.notes || "",
          status: (a.status || "pending").toString(),
          profResponseMessage,
        };
      });

      setAppointments(normalized);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("fetch recent:", err);
      setAppointments([]);
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchRecentAppointments();
    intervalRef.current = setInterval(fetchRecentAppointments, 60000);

    try {
      const raw = typeof window !== "undefined"
        ? localStorage.getItem(ACTIVE_CALL_KEY)
        : null;

      if (!raw || raw === "undefined" || raw === "null") {
        localStorage.removeItem(ACTIVE_CALL_KEY);
        return;
      }

      const parsed = JSON.parse(raw);

      if (parsed && parsed.roomName && parsed.id) {
        if (parsed.expiresAt) parsed.expiresAt = Number(parsed.expiresAt);
        if (parsed.minEndTime) parsed.minEndTime = Number(parsed.minEndTime);
        setActiveCallInternal(parsed);
        if (parsed.expiresAt && parsed.countdownStarted) {
          startOrUpdateCountdown(parsed.expiresAt);
        }
      }
    } catch (e) {
      console.warn("restore activeCall failed", e);
    }

    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (sessionFallbackTimerRef.current) clearTimeout(sessionFallbackTimerRef.current);
      // Clear participant tracking
      prevParticipantsRef.current = {};
      participantTrackingInitializedRef.current = false;
    };
  }, [fetchRecentAppointments]);

  const setActiveCallInternal = useCallback((valOrUpdater) => {
    setActiveCallRaw((prev) => {
      const next =
        typeof valOrUpdater === "function"
          ? valOrUpdater(prev)
          : valOrUpdater;

      try {
        if (typeof window !== "undefined") {
          if (next) localStorage.setItem(ACTIVE_CALL_KEY, JSON.stringify(next));
          else localStorage.removeItem(ACTIVE_CALL_KEY);
        }
      } catch (e) {
        console.warn("persist activeCall failed", e);
      }

      return next;
    });
  }, []);

  const doPostAction = useCallback(async (endpoint, bodyObj = {}, optimisticId = null) => {
    setActionLoadingId(optimisticId || true);
    try {
      const res = await doFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(bodyObj),
        headers: { ...tokenHeader() },
        attachToGlobalAbort: true,
      });
      if (!res.ok) {
        const b = await parseJsonSafe(res);
        throw new Error(b?.message || `Request failed: ${res.status}`);
      }
      const b = await parseJsonSafe(res);
      if (!b?.success) throw new Error(b?.message || "Action failed");
      await fetchRecentAppointments();
      return b;
    } catch (err) {
      if (err.name === "AbortError") return null;
      console.error("action error:", err);
      window.alert(err.message || "Network error");
      return null;
    } finally {
      setActionLoadingId(null);
    }
  }, [fetchRecentAppointments]);

  const respond = useCallback(async (id, accept) => {
    let message = "";
    if (!accept) {
      const reason = await openModal({ title: "Reject appointment", render: "reason" });
      if (reason == null) return;
      message = String(reason || "").trim();
    } else {
      const confirmed = await openModal({ title: "Accept appointment", render: "confirm" });
      if (!confirmed) return;
    }
    await doPostAction(`/api/appointments/${id}/respond`, { accept, message }, id);
  }, [doPostAction]);

  const extendAppointment = useCallback(async (id) => {
    const minutes = await openModal({ title: "Extend session", render: "extend", default: 15 });
    if (!minutes) return;
    if (![15, 30].includes(Number(minutes))) {
      window.alert("Only 15 or 30 allowed.");
      return;
    }
    setActionLoadingId(id);
    try {
      const res = await doFetch(`/api/appointments/${id}/extend`, {
        method: "POST",
        body: JSON.stringify({ minutes: Number(minutes) }),
        headers: { ...tokenHeader() },
        attachToGlobalAbort: true,
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data) throw new Error(data?.message || `Extend failed: ${res.status}`);
      if (!data.success) throw new Error(data.message || "Extend failed");

      const newExpiresAt = data.reserved?.expiresAt || (data.reserved?.expiresAtIso ? Date.parse(data.reserved.expiresAtIso) : null);
      if (newExpiresAt) {
        setActiveCallInternal((c) => {
          const updated = c ? { ...c, expiresAt: Number(newExpiresAt), twoMinutePromptShown: false } : c;
          if (updated && updated.countdownStarted) startOrUpdateCountdown(updated.expiresAt);
          return updated;
        });
      } else {
        await fetchRecentAppointments();
      }
      window.alert(`Extended by ${minutes} minutes.`);
    } catch (e) {
      console.error("extend error", e);
      window.alert(e.message || "Failed to extend");
    } finally {
      setActionLoadingId(null);
    }
  }, [fetchRecentAppointments, setActiveCallInternal]);

  const endAppointment = useCallback(async (id) => {
    if (activeCall && activeCall.id === id && isBeforeMinEnd(activeCall)) {
      const waitSec = Math.ceil((Number(activeCall.minEndTime) - Date.now()) / 1000);
      window.alert(`Minimum reserved time not finished. Wait ${Math.ceil(waitSec / 60)} minute(s) or let the timer run.`);
      return;
    }

    const confirmed = await openModal({ title: "End session", render: "confirmEnd" });
    if (!confirmed) return;

    try {
      if (jitsiRef.current && typeof jitsiRef.current.hangup === "function") {
        try { await jitsiRef.current.hangup(); } catch (e) { console.warn('hangup api error', e); }
        try { if (jitsiRef.current.dispose) jitsiRef.current.dispose(); } catch (e) { }
      } else {
        const possibleSelectors = [];
        if (activeCall?.roomName) possibleSelectors.push(`iframe[src*='${activeCall.roomName}']`);
        possibleSelectors.push("iframe[src*='meet.jit.si']", "iframe[src*='8x8.vc']", "iframe[src*='jitsi.']");
        let removed = false;
        for (const sel of possibleSelectors) {
          const iframe = document.querySelector(sel);
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
            removed = true;
          }
        }
        if (!removed) {
          const appIframe = document.querySelector("iframe");
          if (appIframe && appIframe.parentNode) appIframe.parentNode.removeChild(appIframe);
        }
      }
    } catch (e) {
      console.warn("hangup failed", e);
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (sessionFallbackTimerRef.current) {
      clearTimeout(sessionFallbackTimerRef.current);
      sessionFallbackTimerRef.current = null;
    }

    // Clear participant tracking for this session
    if (activeCall?.id) {
      delete prevParticipantsRef.current[activeCall.id];
    }
    participantTrackingInitializedRef.current = false;

    setActiveCallInternal(null);
    setRemainingMs(null);

    await doPostAction(`/api/appointments/${id}/end`, {}, id);
  }, [activeCall, setActiveCallInternal, doPostAction]);

  const reportParticipantsToServer = useCallback(async (id, { professionalJoined, userJoined, userLeft } = {}) => {
    if (!id) return;
    try {
      await doFetch(`/api/appointments/${id}/participants`, {
        method: "POST",
        body: JSON.stringify({ professionalJoined, userJoined, userLeft }),
        headers: { ...tokenHeader() },
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      console.warn("reportParticipants failed", err);
    }
  }, []);

  const startAppointment = useCallback(async (id) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) { window.alert("Appointment not found"); return; }

    const initialMinutes = Number(apt.raw?.durationMinutesRequested ?? apt.raw?.durationMinutes ?? 30) || 30;
    const minInitial = Math.max(30, initialMinutes);

    const confirmed = await openModal({
      title: "Start session",
      render: "confirmStart",
      details: `Start session and place initial ${minInitial}-minute hold of ${apt.amountLabel}?`
    });

    if (!confirmed) return;

    setActionLoadingId(id);
    try {
      const startResp = await doFetch(`/api/appointments/${id}/start`, {
        method: "POST",
        body: JSON.stringify({ initialMinutes: minInitial }),
        headers: { ...tokenHeader() },
        attachToGlobalAbort: true,
      });

      const startBody = await parseJsonSafe(startResp);
      if (!startResp.ok || !startBody) {
        throw new Error(startBody?.message || `Failed to start: ${startResp.status}`);
      }
      if (!startBody.success) {
        throw new Error(startBody.message || "Failed to start");
      }

      const sessionResp = await doFetch(`/api/appointments/${id}/start-session`, {
        method: "POST",
        headers: { ...tokenHeader() },
        attachToGlobalAbort: true,
      });

      const sessionBody = await parseJsonSafe(sessionResp);
      if (!sessionResp.ok || !sessionBody) {
        throw new Error(sessionBody?.message || `Failed to start session: ${sessionResp.status}`);
      }
      if (!sessionBody.success) {
        throw new Error(sessionBody.message || "Failed to create session");
      }

      const data = sessionBody.data || {};
      const roomName = data.roomName;
      const token = data.token;

      if (!roomName || !token) {
        throw new Error("Server did not return roomName or token for session");
      }

      const serverExpires = startBody.session?.expiresAt ||
        (startBody.session?.expiresAtIso ? Date.parse(startBody.session.expiresAtIso) : null);
      const fallbackExpiresAt = Date.now() + minInitial * 60 * 1000;
      const expiresAt = serverExpires ? Number(serverExpires) : fallbackExpiresAt;
      const minEndTime = Date.now() + 30 * 60 * 1000;

      const newActive = {
        id,
        roomName,
        token,
        initialMinutes: minInitial,
        expiresAt,
        minEndTime,
        countdownStarted: false,
        twoMinutePromptShown: false,
      };

      // Initialize participant tracking for this session
      prevParticipantsRef.current[id] = { count: 1, userJoined: false };
      participantTrackingInitializedRef.current = false;

      setActiveCallInternal(newActive);

      if (serverExpires) {
        const remaining = Number(serverExpires) - Date.now();
        if (remaining > 0) {
          if (sessionFallbackTimerRef.current) clearTimeout(sessionFallbackTimerRef.current);
          sessionFallbackTimerRef.current = setTimeout(async () => {
            try {
              await doPostAction(`/api/appointments/${id}/end`, {}, id);
            } catch (e) { console.warn("fallback auto-end failed", e); }
            setActiveCallInternal(null);
            setRemainingMs(null);
          }, remaining);
        }
      }

      await reportParticipantsToServer(id, { professionalJoined: true });

    } catch (err) {
      console.error("Start appointment error:", err);
      window.alert(err.message || "Failed to start session");
    } finally {
      setActionLoadingId(null);
    }
  }, [appointments, setActiveCallInternal, doPostAction, reportParticipantsToServer]);

  const handleBothJoined = useCallback(async () => {
    if (!activeCall) return;
    const id = activeCall.id;

    try {
      const res = await doFetch(`/api/appointments/${id}`, { method: "GET", headers: { ...tokenHeader() } });
      const body = await parseJsonSafe(res);
      let serverExpires = null;
      if (res.ok && body?.success) {
        const appt = body.appointment;
        serverExpires = appt?.session?.holds?.length ? (appt.session.holds[appt.session.holds.length - 1]?.expiresAt || null) : null;
        if (!serverExpires && appt?.session?.expiresAt) serverExpires = appt.session.expiresAt;
      }

      const joinTime = Date.now();
      // Only reset minEndTime if countdown hasn't started yet, otherwise keep existing
      const minEndTime = (activeCall.minEndTime && activeCall.countdownStarted)
        ? activeCall.minEndTime
        : joinTime + (activeCall.initialMinutes ?? 30) * 60 * 1000;

      const baseExpires = serverExpires ? Number(serverExpires) : activeCall.expiresAt || Date.now() + (activeCall.initialMinutes ?? 30) * 60 * 1000;
      // Ensure expiresAt is not less than minEndTime
      const expiresAt = Math.max(baseExpires, minEndTime);

      const updated = { ...activeCall, expiresAt: Number(expiresAt), minEndTime: Number(minEndTime), countdownStarted: true };
      setActiveCallInternal(updated);
      startOrUpdateCountdown(updated.expiresAt);
      reportParticipantsToServer(id, { professionalJoined: true, userJoined: true }).catch((e) => console.warn("report participants failed", e));
    } catch (e) {
      console.warn("handleBothJoined fetch failed", e);
      const joinTime = Date.now();
      const minEndTime = joinTime + (activeCall.initialMinutes ?? 30) * 60 * 1000;
      // Ensure expiresAt is at least minEndTime to prevent 00:00 timer while lock-in is active
      const calcedExpiresIt = activeCall.expiresAt || Date.now() + (activeCall.initialMinutes ?? 30) * 60 * 1000;
      const expiresAt = Math.max(Number(calcedExpiresIt), minEndTime);

      const updated = { ...activeCall, expiresAt: Number(expiresAt), minEndTime: Number(minEndTime), countdownStarted: true };
      setActiveCallInternal(updated);
      startOrUpdateCountdown(updated.expiresAt);
      reportParticipantsToServer(id, { professionalJoined: true, userJoined: true }).catch((e) => console.warn("report participants failed", e));
    }
  }, [activeCall, setActiveCallInternal]);

  const handleParticipantsUpdate = useCallback((count, participants) => {
    if (!activeCall) return;

    const id = activeCall.id;
    const prev = prevParticipantsRef.current[id] || { count: 1, userJoined: false };

    console.log(`Participant update: ${prev.count} -> ${count}`);

    // Determine if user joined or left
    let userJoined = false;
    let userLeft = false;

    if (count > prev.count) {
      // Someone joined
      userJoined = true;
      console.log("User joined the session");
    } else if (count < prev.count && count >= 1) {
      // Someone left (but not the last person)
      userLeft = true;
      console.log("User left the session");
    }

    // Update previous state
    const newUserJoined = prev.userJoined || userJoined;
    prevParticipantsRef.current[id] = {
      count,
      userJoined: newUserJoined,
      lastUpdate: Date.now()
    };

    // Report to server
    reportParticipantsToServer(id, {
      professionalJoined: true,
      userJoined: userJoined ? true : undefined,
      userLeft: userLeft ? true : undefined
    }).catch((e) => console.warn("report participants failed", e));

    // Show notification for user leaving
    if (userLeft) {
      const notification = {
        id: Date.now(),
        message: "User has left the session",
        appointmentId: id,
      };

      setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
      showPopup("User has left the session");
    }

    // Show notification for user joining (only once)
    if (userJoined && !prev.userJoined) {
      const notification = {
        id: Date.now(),
        message: "User has joined the session",
        appointmentId: id,
      };

      setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
      showPopup("User has joined the session");
    }

    // If count drops to 1 (only professional left), show notification
    if (count === 1 && prev.count > 1) {
      const notification = {
        id: Date.now(),
        message: "User has disconnected from the session",
        appointmentId: id,
      };

      setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
      showPopup("User has disconnected from the session");
    }

  }, [activeCall, reportParticipantsToServer]);

  // Setup participant tracking when Jitsi is ready
  const setupParticipantTracking = useCallback(() => {
    if (!activeCall || !jitsiRef.current || participantTrackingInitializedRef.current) return;

    try {
      // Check if Jitsi API is available
      const api = jitsiRef.current;

      // Try to set up Jitsi event listeners if available
      if (api.on && typeof api.on === 'function') {
        api.on('participantJoined', (participant) => {
          console.log('Participant joined via Jitsi API:', participant);
          // Force update participant count
          handleParticipantsUpdate(2, { userJoined: true });
        });

        api.on('participantLeft', (participant) => {
          console.log('Participant left via Jitsi API:', participant);
          // Force update participant count
          handleParticipantsUpdate(1, { userLeft: true });
        });

        participantTrackingInitializedRef.current = true;
        console.log('Jitsi participant tracking initialized');
      }
    } catch (error) {
      console.warn('Could not set up Jitsi participant tracking:', error);
    }
  }, [activeCall, handleParticipantsUpdate]);

  // Monitor for Jitsi initialization
  useEffect(() => {
    if (activeCall && jitsiRef.current) {
      // Try to set up tracking after a delay to ensure Jitsi is loaded
      const timer = setTimeout(setupParticipantTracking, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeCall, jitsiRef.current, setupParticipantTracking]);

  // 🔄 Poll for remote session end (e.g. if User ends it)
  useEffect(() => {
    if (!activeCall) return;
    const interval = setInterval(async () => {
      try {
        const res = await doFetch(`/api/appointments/${activeCall.id}`, {
          method: "GET",
          headers: { ...tokenHeader() }
        });
        const body = await parseJsonSafe(res);
        if (res.ok && body?.success) {
          const status = String(body.appointment?.status || "").toLowerCase();
          if (["completed", "cancelled", "rejected", "failed"].includes(status)) {
            console.log("Remote session end detected:", status);
            setActiveCallInternal(null);
            setRemainingMs(null);
            window.alert("The session has been ended by the user.");
          }
        }
      } catch (e) {
        console.warn("Poll remote status failed", e);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeCall, setActiveCallInternal, tokenHeader]);

  const startOrUpdateCountdown = useCallback((expiresAtMs) => {
    if (!expiresAtMs) return;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setRemainingMs(Math.max(0, expiresAtMs - Date.now()));

    countdownIntervalRef.current = setInterval(() => {
      setRemainingMs((prev) => {
        const next = (prev ?? Math.max(0, expiresAtMs - Date.now())) - 1000;
        const call = activeCallRef.current;

        if (next <= 2 * 60 * 1000 && call && !call.twoMinutePromptShown) {

          setActiveCallInternal((c) => (c ? { ...c, twoMinutePromptShown: true } : c));
          openModal({ title: "Session ending soon", render: "extendPrompt" }).then((choice) => {
            if ([15, 30].includes(Number(choice))) {
              extendAppointment(call.id);

            }
          }).catch(() => { });
        }

        if (next <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          if (call && call.id) {
            doPostAction(`/api/appointments/${call.id}/end`, {}, call.id);
            setActiveCallInternal(null);
            setRemainingMs(null);
          }
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [activeCall, extendAppointment, doPostAction, setActiveCallInternal]);

  const formatRemaining = (ms) => {
    if (!ms || ms <= 0) return "00:00";
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = Math.floor(total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const statusStyles = (status) => {
    const k = (status || "").toLowerCase();
    switch (k) {
      case "confirmed": return { bg: "#e6ffed", color: "#117a37", border: "1px solid rgba(17,122,55,0.08)" };
      case "pending": case "requested": return { bg: "#fff7d6", color: "#8a6d00", border: "1px solid rgba(138,109,0,0.06)" };
      case "completed": return { bg: "#eef2ff", color: "#0b5ed7", border: "1px solid rgba(11,94,215,0.06)" };
      case "ongoing": return { bg: "#e7f3ff", color: "#0b5ed7", border: "1px solid rgba(11,94,215,0.06)" };
      case "rejected": return { bg: "#ffe6ea", color: "#a10f0f", border: "1px solid rgba(161,15,15,0.06)" };
      case "canceled": case "cancelled": return { bg: "#fff0f0", color: "#a10f0f", border: "1px solid rgba(161,15,15,0.06)" };
      default: return { bg: "#f1f1f1", color: "#444", border: "1px solid rgba(0,0,0,0.04)" };
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const arr = appointments.filter((a) => {
      if (statusFilter !== "all" && (a.status || "").toLowerCase() !== statusFilter) return false;
      if (!q) return true;
      const hay = `${a.client} ${a.type} ${a.notes}`.toLowerCase();
      return hay.includes(q);
    });
    if (sortBy === "nearest") arr.sort((x, y) => new Date(x.scheduledAt) - new Date(y.scheduledAt));
    else arr.sort((x, y) => new Date(y.scheduledAt) - new Date(x.scheduledAt));
    return arr;
  }, [appointments, search, statusFilter, sortBy]);

  // Filter dropdown for mobile
  const FilterDropdown = () => (
    <div style={{
      display: 'flex',
      flexDirection: isSM ? 'column' : 'row',
      gap: '8px',
      width: '100%',
      marginBottom: isSM ? '16px' : '0'
    }}>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{
          padding: "clamp(10px, 2.5vw, 12px) clamp(10px, 2vw, 16px)",
          borderRadius: "clamp(6px, 1vw, 8px)",
          flex: 1,
          fontSize: "clamp(13px, 1.5vw, 14px)",
          minHeight: "44px",
          border: "1px solid #e1e1e1",
          background: "#fff"
        }}
      >
        <option value="all">All Status</option>
        <option value="requested">Requested</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={{
          padding: "clamp(10px, 2.5vw, 12px) clamp(10px, 2vw, 16px)",
          borderRadius: "clamp(6px, 1vw, 8px)",
          flex: 1,
          fontSize: "clamp(13px, 1.5vw, 14px)",
          minHeight: "44px",
          border: "1px solid #e1e1e1",
          background: "#fff"
        }}
      >
        <option value="newest">Newest First</option>
        <option value="nearest">Nearest First</option>
      </select>
    </div>
  );

  return (
    <div style={{
      background: "#f7f7fb",
      borderRadius: "clamp(10px, 2vw, 12px)",
      padding: "clamp(12px, 3vw, 18px)",
      width: "100%",
      overflow: "hidden",
      boxSizing: "border-box"
    }}>
      {/* Mobile Filter Drawer */}
      {isDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '85%',
            maxWidth: '300px',
            background: '#fff',
            padding: '20px',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            <FilterDropdown />
            <button
              onClick={() => setIsDrawerOpen(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                marginTop: '20px'
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* header */}
      <div style={{
        display: "flex",
        flexDirection: isSM ? "column" : "row",
        gap: "clamp(12px, 3vw, 16px)",
        alignItems: isSM ? "stretch" : "center",
        marginBottom: "clamp(16px, 3vw, 20px)",
        position: 'relative'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isSM ? "12px" : "8px"
          }}>
            <h4 style={{
              margin: 0,
              fontSize: "clamp(18px, 3vw, 22px)",
              lineHeight: 1.2,
              fontWeight: 700,
              color: "#1f2937"
            }}>Appointments</h4>
            {isSM && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                style={{
                  background: "#fff",
                  border: "1px solid #e1e1e1",
                  borderRadius: "8px",
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <IconifyIcon icon="mdi:filter" style={{ fontSize: "20px" }} />
              </button>
            )}
          </div>
          <div style={{
            color: "#6c757d",
            fontSize: "clamp(13px, 1.8vw, 14px)",
            lineHeight: 1.4
          }}>Manage your upcoming sessions</div>
        </div>

        {/* Search and Controls - Hidden on mobile when drawer is used */}
        <div style={{
          display: isSM ? "none" : "flex",
          flexDirection: isMD ? "column" : "row",
          gap: "clamp(8px, 2vw, 12px)",
          alignItems: "stretch",
          width: isMD ? "100%" : "auto",
          minWidth: isMD ? "auto" : "300px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(6px, 1vw, 8px)",
            background: "#fff",
            padding: "clamp(8px, 2vw, 10px) clamp(12px, 2vw, 16px)",
            borderRadius: "clamp(6px, 1vw, 8px)",
            flex: isMD ? 1 : "none",
            border: "1px solid #e1e1e1",
            minWidth: isMD ? "auto" : "200px"
          }}>
            <IconifyIcon icon="mdi:magnify" style={{ fontSize: "clamp(16px, 2vw, 18px)", color: "#6c757d", flexShrink: 0 }} />
            <input
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "clamp(13px, 1.5vw, 14px)",
                minWidth: 0,
                background: "transparent"
              }}
            />
          </div>

          {!isSM && (
            <>
              <FilterDropdown />
              <button
                onClick={() => fetchRecentAppointments()}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(16,24,40,0.06)",
                  padding: "clamp(10px, 2vw, 12px)",
                  borderRadius: "clamp(6px, 1vw, 8px)",
                  flexShrink: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "44px",
                  transition: "all 0.2s ease"
                }}
              >
                <IconifyIcon icon="solar:refresh-line-duotone" style={{ fontSize: "clamp(16px, 2vw, 18px)", color: "#4f46e5" }} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Search Bar */}
        {isSM && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#fff",
            padding: "12px 16px",
            borderRadius: "8px",
            width: "100%",
            border: "1px solid #e1e1e1"
          }}>
            <IconifyIcon icon="mdi:magnify" style={{ fontSize: "18px", color: "#6c757d", flexShrink: 0 }} />
            <input
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                minWidth: 0,
                background: "transparent"
              }}
            />
          </div>
        )}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {notifications.slice(0, 3).map((n) => (
            <div
              key={n.id}
              style={{
                padding: "12px 14px",
                background: "linear-gradient(135deg, #fff7ed, #fffbeb)",
                border: "1px solid #fed7aa",
                borderRadius: 10,
                fontSize: 14,
                color: "#9a3412",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{ flex: 1 }}>{n.message}</span>
              <button
                onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9a3412",
                  cursor: "pointer",
                  fontSize: 18,
                  padding: 0,
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active call area */}
      {activeCall && (
        <div style={{
          marginBottom: "clamp(16px, 3vw, 24px)",
          width: "100%"
        }}>
          <div style={{
            display: "flex",
            flexDirection: isSM ? "column" : "row",
            gap: isSM ? "12px" : "16px",
            alignItems: isSM ? "flex-start" : "center",
            justifyContent: "space-between",
            marginBottom: "clamp(12px, 2vw, 16px)"
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                color: "#374151",
                margin: "0 0 8px 0",
                fontSize: "clamp(16px, 2.5vw, 18px)",
                fontWeight: 600
              }}>Ongoing Session</h4>
              <div style={{
                display: "flex",
                flexDirection: isSM ? "column" : "row",
                gap: isSM ? "4px" : "12px",
                alignItems: isSM ? "flex-start" : "center",
                flexWrap: "wrap"
              }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: "clamp(14px, 2vw, 15px)",
                  color: "#1f2937",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%"
                }}>
                  {/* {`Session: ${activeCall.roomName?.split('/').pop() || activeCall.id?.slice(-8) || 'Active'}`} */}
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "clamp(13px, 1.8vw, 14px)",
                  color: "#6c757d",
                  backgroundColor: isSM ? "#f0f7ff" : "transparent",
                  padding: isSM ? "6px 12px" : "0",
                  borderRadius: isSM ? "20px" : "0"
                }}>
                  <IconifyIcon icon="mdi:clock-outline" style={{ fontSize: "14px" }} />
                  Remaining: <strong style={{ color: "#dc2626", minWidth: "45px" }}>{formatRemaining(remainingMs)}</strong>
                </div>
              </div>
            </div>
            <div style={{
              display: "flex",
              gap: "clamp(8px, 2vw, 12px)",
              width: isSM ? "100%" : "auto"
            }}>
              <button
                onClick={() => extendAppointment(activeCall.id)}
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                  borderRadius: "clamp(6px, 1vw, 8px)",
                  background: "#fff",
                  border: "1px solid rgba(16,24,40,0.12)",
                  fontSize: "clamp(13px, 1.5vw, 14px)",
                  flex: isSM ? 1 : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontWeight: 500,
                  transition: "all 0.2s ease"
                }}
              >
                <IconifyIcon icon="mdi:clock-plus-outline" style={{ fontSize: "16px" }} />
                {!isXS && "Extend"}
              </button>
              <button
                onClick={() => endAppointment(activeCall.id)}
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                  borderRadius: "clamp(6px, 1vw, 8px)",
                  background: isBeforeMinEnd(activeCall) ? "#f3f4f6" : "#ef4444",
                  color: isBeforeMinEnd(activeCall) ? "#9ca3af" : "#fff",
                  border: "none",
                  cursor: isBeforeMinEnd(activeCall) ? "not-allowed" : "pointer",
                  fontSize: "clamp(13px, 1.5vw, 14px)",
                  flex: isSM ? 1 : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontWeight: 500,
                  transition: "all 0.2s ease"
                }}
                disabled={isBeforeMinEnd(activeCall)}
                title={isBeforeMinEnd(activeCall) ? "Minimum reserved time not finished" : "End session"}
              >
                <IconifyIcon icon="mdi:phone-hangup" style={{ fontSize: "16px" }} />
                {!isXS && "End"}
              </button>
            </div>
          </div>

          <div style={{
            width: "100%",
            height: isSM ? "480px" : isMD ? "500px" : isLG ? "450px" : "500px",
            borderRadius: "clamp(8px, 1.5vw, 12px)",
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            <DailyCall
              ref={jitsiRef}
              roomName={activeCall.roomName}
              token={activeCall.token || activeCall.jwt}
              mode="video"
              user={{ name: "Professional" }}
              headerText="Privileged and Confidential"
              logoUrl={null}
              onParticipantsUpdate={(count, participants) => handleParticipantsUpdate(count, participants)}
              onBothJoined={handleBothJoined}
              onCallEnd={() => {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                if (sessionFallbackTimerRef.current) clearTimeout(sessionFallbackTimerRef.current);
                setActiveCallInternal(null);
                setRemainingMs(null);

                // Clear participant tracking for this session
                if (activeCall?.id) {
                  delete prevParticipantsRef.current[activeCall.id];
                }
                participantTrackingInitializedRef.current = false;
              }}
              onConferenceFailed={(error) => {
                console.error("Conference failed:", error);
                alert(`Failed to join session: ${error?.message || "Unknown error"}. Please try refreshing or contact support.`);
              }}
            />
          </div>
        </div>
      )}

      {/* appointment list */}
      <div>
        {loading ? (
          <div style={{
            padding: "clamp(32px, 8vw, 48px)",
            textAlign: "center",
            color: "#6c757d",
            fontSize: "clamp(14px, 2vw, 16px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid #f3f4f6",
              borderTopColor: "#4f46e5",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            Loading appointments…
            <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
          </div>
        ) : error ? (
          <div style={{
            padding: "clamp(20px, 5vw, 32px)",
            textAlign: "center",
            color: "#dc2626",
            fontSize: "clamp(14px, 2vw, 16px)",
            background: "#fee2e2",
            borderRadius: "8px",
            margin: "16px 0"
          }}>
            <IconifyIcon icon="mdi:alert-circle-outline" style={{ fontSize: "24px", marginBottom: "12px" }} />
            <div>Failed to load: {error}</div>
            <button
              onClick={() => fetchRecentAppointments()}
              style={{
                marginTop: "16px",
                padding: "10px 20px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: "clamp(32px, 8vw, 48px)",
            textAlign: "center",
            color: "#6c757d",
            fontSize: "clamp(14px, 2vw, 16px)",
            background: "#f9fafb",
            borderRadius: "8px",
            border: "1px dashed #d1d5db"
          }}>
            <IconifyIcon icon="mdi:calendar-remove-outline" style={{ fontSize: "48px", marginBottom: "16px", color: "#9ca3af" }} />
            <div style={{ fontWeight: 500, marginBottom: "8px" }}>No appointments found</div>
            <div style={{ fontSize: "14px" }}>Try changing your filters or check back later</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: isSM ? "1fr" : isLG ? "repeat(auto-fill, minmax(450px, 1fr))" : "1fr",
            gap: "clamp(12px, 2vw, 16px)"
          }}>
            {filtered.map((apt) => {
              const id = apt.id;
              const dateStr = apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : "-";
              const badgeStyle = statusStyles(apt.status);
              const statusKey = (apt.status || "").toLowerCase();

              return (
                <div
                  key={id}
                  style={{
                    background: "#fff",
                    borderRadius: "clamp(8px, 1.5vw, 12px)",
                    padding: "clamp(16px, 3vw, 20px)",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "clamp(12px, 2vw, 16px)"
                  }}
                >
                  {/* Header section */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "clamp(12px, 2vw, 16px)",
                    width: "100%"
                  }}>
                    <div style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        width: "clamp(44px, 6vw, 56px)",
                        height: "clamp(44px, 6vw, 56px)",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <IconifyIcon
                          icon={statusKey === "completed" ? "solar:check-circle-bold" :
                            statusKey === "ongoing" ? "solar:clock-circle-bold" :
                              "mdi:calendar-clock"}
                          style={{ fontSize: "clamp(20px, 3vw, 24px)", color: "#fff" }}
                        />
                      </div>
                    </div>

                    <div style={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}>
                      <div style={{
                        display: "flex",
                        flexDirection: isXS ? "column" : "row",
                        alignItems: isXS ? "flex-start" : "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        width: "100%"
                      }}>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          flex: 1,
                          minWidth: 0
                        }}>
                          <div style={{
                            fontWeight: 700,
                            fontSize: "clamp(15px, 2vw, 16px)",
                            color: "#1f2937",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>{apt.client}</div>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap"
                          }}>
                            <span style={{
                              color: "#6c757d",
                              fontSize: "clamp(13px, 1.8vw, 14px)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              <IconifyIcon icon="mdi:tag-outline" style={{ fontSize: "14px" }} />
                              {apt.type}
                            </span>
                            <span style={{
                              color: "#059669",
                              fontSize: "clamp(13px, 1.8vw, 14px)",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              <IconifyIcon icon="mdi:currency-inr" style={{ fontSize: "12px" }} />
                              {apt.amountLabel}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          minWidth: isXS ? "100%" : "auto"
                        }}>
                          <div style={{
                            display: "inline-block",
                            padding: "6px clamp(10px, 2vw, 14px)",
                            borderRadius: "20px",
                            fontSize: "clamp(12px, 1.5vw, 13px)",
                            fontWeight: 600,
                            background: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: badgeStyle.border,
                            whiteSpace: "nowrap"
                          }}>
                            {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : "Unknown"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details section */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "clamp(8px, 2vw, 12px)",
                      color: "#6c757d",
                      fontSize: "clamp(13px, 1.8vw, 14px)",
                      flexWrap: "wrap"
                    }}>
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexShrink: 0
                      }}>
                        <IconifyIcon icon="mdi:calendar-clock" style={{ fontSize: "16px" }} />
                        {dateStr}
                      </span>
                    </div>

                    {apt.notes && (
                      <div style={{
                        padding: "12px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        fontSize: "clamp(13px, 1.8vw, 14px)",
                        color: "#4b5563",
                        lineHeight: 1.5
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: "4px", color: "#374151" }}>
                          <IconifyIcon icon="mdi:note-text-outline" style={{ marginRight: "6px", fontSize: "14px" }} />
                          Notes
                        </div>
                        {apt.notes}
                      </div>
                    )}

                    {apt.profResponseMessage && (
                      <div style={{
                        padding: "12px",
                        background: "#fef2f2",
                        borderRadius: "8px",
                        fontSize: "clamp(13px, 1.8vw, 14px)",
                        color: "#991b1b",
                        lineHeight: 1.5,
                        border: "1px solid #fecaca"
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                          <IconifyIcon icon="mdi:alert-circle-outline" style={{ marginRight: "6px", fontSize: "14px" }} />
                          Rejection Note
                        </div>
                        {apt.profResponseMessage}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{
                    display: "flex",
                    gap: "clamp(8px, 2vw, 12px)",
                    marginTop: "8px",
                    flexDirection: isXS ? "column" : "row"
                  }}>
                    {actionLoadingId === id ? (
                      <button
                        disabled
                        style={{
                          padding: "clamp(10px, 2vw, 12px)",
                          borderRadius: "clamp(6px, 1vw, 8px)",
                          fontSize: "clamp(13px, 1.5vw, 14px)",
                          background: "#f3f4f6",
                          color: "#9ca3af",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          cursor: "not-allowed"
                        }}
                      >
                        <div style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #e5e7eb",
                          borderTopColor: "#9ca3af",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite"
                        }} />
                        Processing…
                      </button>
                    ) : statusKey === "requested" || statusKey === "pending" ? (
                      <>
                        <button
                          onClick={() => respond(id, true)}
                          style={{
                            padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                            borderRadius: "clamp(6px, 1vw, 8px)",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "#fff",
                            border: "none",
                            fontSize: "clamp(13px, 1.5vw, 14px)",
                            flex: isXS ? 1 : "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            fontWeight: 600,
                            transition: "all 0.2s ease"
                          }}
                        >
                          <IconifyIcon icon="mdi:check-circle-outline" style={{ fontSize: "16px" }} />
                          Accept
                        </button>
                        <button
                          onClick={() => respond(id, false)}
                          style={{
                            padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                            borderRadius: "clamp(6px, 1vw, 8px)",
                            background: isXS ? "#f3f4f6" : "transparent",
                            color: isXS ? "#dc2626" : "#dc2626",
                            border: isXS ? "none" : "1px solid #dc2626",
                            fontSize: "clamp(13px, 1.5vw, 14px)",
                            flex: isXS ? 1 : "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            fontWeight: 600,
                            transition: "all 0.2s ease"
                          }}
                        >
                          <IconifyIcon icon="mdi:close-circle-outline" style={{ fontSize: "16px" }} />
                          Reject
                        </button>
                      </>
                    ) : statusKey === "confirmed" ? (
                      <button
                        onClick={() => startAppointment(id)}
                        style={{
                          padding: "clamp(12px, 2vw, 14px) clamp(16px, 3vw, 20px)",
                          borderRadius: "clamp(6px, 1vw, 8px)",
                          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                          color: "#fff",
                          border: "none",
                          fontSize: "clamp(14px, 2vw, 15px)",
                          width: "100%",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          fontWeight: 600,
                          transition: "all 0.2s ease"
                        }}
                      >
                        <IconifyIcon icon="solar:play-circle-bold" style={{ fontSize: "20px" }} />
                        Start Session
                      </button>
                    ) : statusKey === "ongoing" ? (
                      <div style={{
                        display: "flex",
                        gap: "clamp(8px, 2vw, 12px)",
                        width: "100%"
                      }}>
                        <button
                          onClick={() => extendAppointment(id)}
                          style={{
                            padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                            borderRadius: "clamp(6px, 1vw, 8px)",
                            background: "#fff",
                            border: "1px solid #d1d5db",
                            fontSize: "clamp(13px, 1.5vw, 14px)",
                            flex: 1,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            fontWeight: 500,
                            transition: "all 0.2s ease"
                          }}
                        >
                          <IconifyIcon icon="mdi:clock-plus-outline" style={{ fontSize: "16px" }} />
                          Extend
                        </button>
                        <button
                          onClick={() => endAppointment(id)}
                          style={{
                            padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                            borderRadius: "clamp(6px, 1vw, 8px)",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            fontSize: "clamp(13px, 1.5vw, 14px)",
                            flex: 1,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            fontWeight: 500,
                            transition: "all 0.2s ease"
                          }}
                        >
                          <IconifyIcon icon="mdi:phone-hangup" style={{ fontSize: "16px" }} />
                          End
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inline modal */}
      <InlineModal visible={modal.visible} title={modal.title} onClose={() => closeModal(null)}>
        {modal.render === "reason" && <ReasonModalContent onSubmit={(v) => closeModal(v)} onCancel={() => closeModal(null)} isMobile={isSM} />}
        {modal.render === "confirm" && <ConfirmModalContent text={modal.text} onConfirm={() => closeModal(true)} onCancel={() => closeModal(false)} isMobile={isSM} />}
        {modal.render === "confirmStart" && <ConfirmModalContent text={modal.details} onConfirm={() => closeModal(true)} onCancel={() => closeModal(false)} isMobile={isSM} />}
        {modal.render === "confirmEnd" && <ConfirmModalContent text={"End session now?"} onConfirm={() => closeModal(true)} onCancel={() => closeModal(false)} isMobile={isSM} />}
        {modal.render === "extend" && <ExtendModalContent defaultMinutes={modal.default} onSubmit={(v) => closeModal(v)} onCancel={() => closeModal(null)} isMobile={isSM} />}
        {modal.render === "extendPrompt" && <ExtendModalContent defaultMinutes={15} onSubmit={(v) => closeModal(v)} onCancel={() => closeModal(null)} isMobile={isSM} />}
      </InlineModal>
    </div>
  );
}

/* Small modal pieces */
function ReasonModalContent({ onSubmit, onCancel, isMobile }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <div style={{
        marginBottom: "clamp(12px, 3vw, 16px)",
        fontSize: "clamp(14px, 2vw, 15px)",
        lineHeight: 1.5,
        color: "#4b5563"
      }}>
        Please enter a reason for rejecting (optional)
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: "100%",
          minHeight: "clamp(80px, 20vw, 120px)",
          marginBottom: "clamp(12px, 3vw, 16px)",
          padding: "clamp(12px, 3vw, 16px)",
          borderRadius: "clamp(6px, 1.5vw, 8px)",
          border: "1px solid #d1d5db",
          fontSize: "clamp(14px, 2vw, 15px)",
          resize: "vertical",
          boxSizing: "border-box"
        }}
        placeholder="Enter reason..."
      />
      <div style={{
        display: "flex",
        gap: "clamp(8px, 2vw, 12px)",
        justifyContent: "flex-end",
        flexDirection: isMobile ? "column" : "row"
      }}>
        <button
          onClick={onCancel}
          style={{
            padding: "clamp(12px, 3vw, 14px) clamp(16px, 4vw, 20px)",
            borderRadius: "clamp(6px, 1.5vw, 8px)",
            border: "1px solid #d1d5db",
            background: "#fff",
            fontSize: "clamp(14px, 2vw, 15px)",
            width: isMobile ? "100%" : "auto",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.2s ease"
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(value)}
          style={{
            padding: "clamp(12px, 3vw, 14px) clamp(16px, 4vw, 20px)",
            borderRadius: "clamp(6px, 1.5vw, 8px)",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "#fff",
            border: "none",
            fontSize: "clamp(14px, 2vw, 15px)",
            width: isMobile ? "100%" : "auto",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s ease"
          }}
        >
          Reject Appointment
        </button>
      </div>
    </div>
  );
}

function ConfirmModalContent({ text, onConfirm, onCancel, isMobile }) {
  return (
    <div>
      <div style={{
        marginBottom: "clamp(16px, 4vw, 24px)",
        fontSize: "clamp(15px, 2.5vw, 16px)",
        lineHeight: 1.6,
        color: "#374151",
        textAlign: "center",
        padding: "0 clamp(8px, 2vw, 16px)"
      }}>
        {text || "Are you sure?"}
      </div>
      <div style={{
        display: "flex",
        gap: "clamp(8px, 2vw, 12px)",
        justifyContent: "center",
        flexDirection: isMobile ? "column" : "row"
      }}>
        <button
          onClick={onCancel}
          style={{
            padding: "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)",
            borderRadius: "clamp(6px, 1.5vw, 8px)",
            border: "1px solid #d1d5db",
            background: "#fff",
            fontSize: "clamp(14px, 2vw, 15px)",
            width: isMobile ? "100%" : "auto",
            minWidth: "120px",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.2s ease"
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)",
            borderRadius: "clamp(6px, 1.5vw, 8px)",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "#fff",
            border: "none",
            fontSize: "clamp(14px, 2vw, 15px)",
            width: isMobile ? "100%" : "auto",
            minWidth: "120px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s ease"
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

function ExtendModalContent({ defaultMinutes = 15, onSubmit, onCancel, isMobile }) {
  const [val, setVal] = useState(defaultMinutes);
  return (
    <div>
      <div style={{
        marginBottom: "clamp(12px, 3vw, 16px)",
        fontSize: "clamp(15px, 2.5vw, 16px)",
        lineHeight: 1.5,
        color: "#374151",
        textAlign: "center"
      }}>
        Extend session by:
      </div>
      <div style={{
        display: "flex",
        gap: "clamp(8px, 2vw, 12px)",
        marginBottom: "clamp(16px, 4vw, 24px)",
        flexDirection: isMobile ? "column" : "row"
      }}>
        <button
          onClick={() => setVal(15)}
          style={{
            padding: "clamp(16px, 4vw, 20px)",
            borderRadius: "clamp(8px, 2vw, 12px)",
            background: val === 15 ? "linear-gradient(135deg, #Caaa93 0%, #a0785c 100%)" : "#f9fafb",
            color: val === 15 ? "#fff" : "#374151",
            border: val === 15 ? "none" : "1px solid #d1d5db",
            fontSize: "clamp(14px, 2vw, 15px)",
            flex: 1,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            fontWeight: val === 15 ? 600 : 500,
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: "bold" }}>15</div>
          <div>minutes</div>
        </button>
        <button
          onClick={() => setVal(30)}
          style={{
            padding: "clamp(16px, 4vw, 20px)",
            borderRadius: "clamp(8px, 2vw, 12px)",
            background: val === 30 ? "linear-gradient(135deg, #Caaa93 0%, #a0785c 100%)" : "#f9fafb",
            color: val === 30 ? "#fff" : "#374151",
            border: val === 30 ? "none" : "1px solid #d1d5db",
            fontSize: "clamp(14px, 2vw, 15px)",
            flex: 1,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            fontWeight: val === 30 ? 600 : 500,
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: "bold" }}>30</div>
          <div>minutes</div>
        </button>
      </div>
      <div style={{
        display: "flex",
        gap: "clamp(8px, 2vw, 12px)",
        justifyContent: "center",
        flexDirection: isMobile ? "column" : "row"
      }}>
        <button
          onClick={onCancel}
          style={{
            padding: "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)",
            borderRadius: "clamp(6px, 1.5vw, 8px)",
            border: "1px solid #d1d5db",
            background: "#fff",
            fontSize: "clamp(14px, 2vw, 15px)",
            width: isMobile ? "100%" : "auto",
            minWidth: "120px",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.2s ease"
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(val)}
          style={{
            padding: "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)",
            borderRadius: "clamp(6px, 1.5vw, 8px)",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#fff",
            border: "none",
            fontSize: "clamp(14px, 2vw, 15px)",
            width: isMobile ? "100%" : "auto",
            minWidth: "120px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s ease"
          }}
        >
          Extend Session
        </button>
      </div>
    </div>
  );
}