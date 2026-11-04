'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FaWallet } from "react-icons/fa";
import DailyCall from "../../apps/appointments/DailyCall";
import logo from "@/assets/images/shaadi-logo.png";
import { socket } from "@/lib/socket";





const theme = {
  bg: "#fbf7f4",
  card: "#ffffff",
  muted: "#6b7280",
  primary: "#ba8d6c",
  danger: "#ef4444",
  border: "#e5e7eb",
};

const formatDate = (d) => (d ? new Date(d).toLocaleString() : "-");
const formatCurrency = (amount) => {
  if (amount == null) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusColors = (status) => {
  const s = String(status || "").toLowerCase();
  const map = {
    requested: { bg: "#fff7ed", color: "#92400e" },
    confirmed: { bg: "#ecfdf5", color: "#166534" },
    rejected: { bg: "#fff1f2", color: "#881337" },
    cancelled: { bg: "#f3f4f6", color: "#374151" },
    ongoing: { bg: "#eef2ff", color: "#3730a3" },
    completed: { bg: "#ecfdf5", color: "#166534" },
    pending_payment: { bg: "#fff7ed", color: "#92400e" },
    success: { bg: "#ecfdf5", color: "#166534" },
    failed: { bg: "#fff1f2", color: "#881337" },
    hold: { bg: "#fff7ed", color: "#92400e" },
    release: { bg: "#eef2ff", color: "#3730a3" },
    credit: { bg: "#ecfdf5", color: "#166534" },
    debit: { bg: "#fff1f2", color: "#881337" },
  };
  return map[s] || { bg: "#f1f5f9", color: "#0f172a" };
};


const RENDER_API = import.meta.env.VITE_API_URL || "https://shadi-undo-backend.onrender.com"; // e.g. "https://shadi-undo-backend.onrender.com"
function buildUrl(path) {
  if (!path || typeof path !== "string") return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (RENDER_API) {
    return `${RENDER_API.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }
  return path;
}

export function EditProfile({ apiBase = "/api" }) {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(buildUrl(`${apiBase}/profile/me`), {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          // If your server sets cookies for auth (httpOnly) enable credentials:
          // credentials: 'include'
        });
        const json = await res.json().catch(() => null);
        if (mounted && json?.success) {
          setProfile({
            name: json.data.name || "",
            email: json.data.email || "",
            phone: json.data.phone || "",
          });
        }
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [apiBase]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      await fetch(buildUrl(`${apiBase}/profile/me`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(profile),
      });
      navigate("/user-profile");
    } catch (err) {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditWrap s>
      <h2>Edit Profile</h2>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <form onSubmit={save}>
          <Label>
            Name
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </Label>
          <Label>
            Email
            <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </Label>
          <Label>
            Phone
            <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </Label>

          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryBtn type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </PrimaryBtn>
            <SecondaryBtn type="button" onClick={() => navigate(-1)}>
              Cancel
            </SecondaryBtn>
          </div>
        </form>
      )}
    </EditWrap>
  );
}

export default function UserProfile({ apiBase = "/api" }) {
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);


  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("Appointments");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const handleStartEdit = () => {
    setEditForm({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });
    setEditError(null);
    setActive("Profile");
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(buildUrl(`${apiBase}/profile/me`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(editForm),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setProfile((prev) => ({
          ...prev,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        }));
        setIsEditing(false);
      } else {
        setEditError(json?.message || "Failed to save profile changes");
      }
    } catch (err) {
      setEditError(err.message || "Network error saving profile");
    } finally {
      setEditSaving(false);
    }
  };

  const [authTab, setAuthTab] = useState("login"); // "login" | "register"
  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authOtpSent, setAuthOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);
  const [authCooldown, setAuthCooldown] = useState(0);

  useEffect(() => {
    if (authCooldown <= 0) return;
    const timer = setInterval(() => {
      setAuthCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [authCooldown]);

  const handleSendLoginOtp = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    if (!authEmail.trim()) {
      setAuthError("Please enter your registered email address.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(buildUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setAuthOtpSent(true);
        setAuthCooldown(30);
        setAuthSuccess(data?.message || "OTP sent to your email!");
      } else {
        setAuthError(data?.message || "Failed to send OTP. Please check your email.");
      }
    } catch (err) {
      setAuthError(err.message || "Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyLoginOtp = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    if (!authOtp.trim() || authOtp.trim().length < 4) {
      setAuthError("Please enter the 6-digit OTP.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(buildUrl("/api/auth/login/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail.trim(), otp: authOtp.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        setAuthOtpSent(false);
        setAuthOtp("");
        setAuthSuccess("Login successful!");
        setActive("Appointments");
        await loadProfile();
      } else {
        setAuthError(data?.message || "Invalid or expired OTP.");
      }
    } catch (err) {
      setAuthError(err.message || "Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendRegisterOtp = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    if (!authName.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }
    if (!authEmail.trim()) {
      setAuthError("Please enter your email address.");
      return;
    }
    if (!authPhone.trim() || authPhone.trim().length < 10) {
      setAuthError("Please enter a valid 10-digit phone number.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(buildUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName.trim(),
          email: authEmail.trim(),
          phone: authPhone.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setAuthOtpSent(true);
        setAuthCooldown(30);
        setAuthSuccess(data?.message || "OTP sent to your email!");
      } else {
        if (/already registered|already exists/i.test(data?.message || "")) {
          setAuthError("This email or phone is already registered. Please switch to Login.");
          setAuthTab("login");
        } else {
          setAuthError(data?.message || "Failed to send OTP.");
        }
      }
    } catch (err) {
      setAuthError(err.message || "Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyRegisterOtp = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    if (!authOtp.trim()) {
      setAuthError("Please enter the 6-digit OTP.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(buildUrl("/api/auth/register/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName.trim(),
          email: authEmail.trim(),
          phone: authPhone.trim(),
          otp: authOtp.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        setAuthOtpSent(false);
        setAuthOtp("");
        setAuthSuccess("Registration successful!");
        setActive("Appointments");
        await loadProfile();
      } else {
        setAuthError(data?.message || "Invalid or expired OTP.");
      }
    } catch (err) {
      setAuthError(err.message || "Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname.includes("profile/edit")) {
      handleStartEdit();
      navigate("/user-profile", { replace: true });
    }
  }, [location.pathname]);


  const [activeSession, setActiveSession] = useState(null);
  const userNotifiedRef = useRef(false);

  useEffect(() => {
    if (!activeSession?.appointmentId) return;

    const payload = {
      appointmentId: activeSession.appointmentId,
      user: {
        name: profile?.name || "User",
      },
    };

    socket.emit("join-session", {
      appointmentId: activeSession.appointmentId,
      role: "user",
    });

    socket.emit("user-joined", payload);

    return () => {
      socket.emit("user-left", payload);
    };
  }, [activeSession?.appointmentId]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ User socket connected:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);




  const [joining, setJoining] = useState(false);
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0, totalSeconds: 0 });
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendPending, setExtendPending] = useState(false);
  const [extendError, setExtendError] = useState(null);
  const [needsTopup, setNeedsTopup] = useState(false);
  const [conferenceError, setConferenceError] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);


  const dailyCallRef = useRef(null);
  const countdownRef = useRef(null);
  const pollSessionRoomRef = useRef(null);
  const pollBothJoinedRef = useRef(null);

  const joiningRef = useRef(new Set());
  const endedRef = useRef(new Set());

  useEffect(() => {
    if (!window.Razorpay) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const onDoc = () => setDropdownOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []); // eslint-disable-line

  async function loadProfile() {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(buildUrl(`${apiBase}/profile/me`), {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const json = await res.json().catch(() => null);
      console.log("loadProfile: appointments raw:", json?.data?.appointments);
      if (json?.success && json?.data) {
        const data = json.data;
        setProfile({
          name: data.name || "User",
          email: data.email || "",
          phone: data.phone || "",
          wallet: data.wallet || null,
          appointments: (data.appointments || []).map((a) => ({
            ...a,
            id: a.id || a._id || (a._id && a._id.$oid) || null,
          })),
          recentTransactions: data.recentTransactions || [],
        });
        setEditForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } else {
        localStorage.removeItem("token");
        setProfile(null);
      }
    } catch (err) {
      console.error("loadProfile error", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfile(null);
    setIsEditing(false);
    setAuthOtpSent(false);
    setAuthOtp("");
    setAuthError(null);
    setAuthSuccess(null);
    setActive("Login");
  }

  function decodeJwtPayload(token) {
    try {
      const p = token.split('.')[1];
      return JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    } catch (e) {
      return null;
    }
  }

  async function handleWalletTopup(amountNum) {
    if (!amountNum || amountNum <= 0) {
      alert("Invalid amount");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login");

    const createRes = await fetch(buildUrl("/api/appointments/wallet/topup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: amountNum }),
    });

    const created = await createRes.json();
    if (!created?.success) return alert("Order creation failed");

    const { orderId, amount: amountPaise, keyId } = created.data;

    const rzp = new window.Razorpay({
      key: keyId,
      amount: amountPaise,
      currency: "INR",
      name: "Shaadi Undo Wallet",
      description: `Add ₹${amountNum}`,
      order_id: orderId,
      redirect: true, // mobile-safe
      handler: async (response) => {
        await fetch(buildUrl("/api/appointments/wallet/topup/verify"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(response),
        });
        await loadProfile();
        alert("Wallet topped up!");
      },
    });

    rzp.open();
  }

  async function createWalletOrder(amountNum) {
    const token = localStorage.getItem("token");
    const res = await fetch(buildUrl("/api/appointments/wallet/topup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: amountNum }),
    });

    const json = await res.json();
    if (!json?.success) throw new Error("Order creation failed");
    return json.data;
  }


  const pollSessionRoom = useCallback(
    async (appointmentId) => {
      if (!appointmentId) return null;
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(buildUrl(`${apiBase}/appointments/${appointmentId}/session-room`), {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const json = await res.json().catch(() => null);
        return { status: res.status, body: json };
      } catch (err) {
        console.error("pollSessionRoom error", err);
        return null;
      }
    },
    [apiBase]
  );

  const callJoinSession = useCallback(
    async (appointmentId) => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(buildUrl(`${apiBase}/appointments/${appointmentId}/join-session`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json().catch(() => null);
        console.log("[callJoinSession] fetched", appointmentId, "status:", res.status, "body:", json);
        return { status: res.status, body: json };
      } catch (err) {
        console.error("callJoinSession error", err);
        return { status: 0, body: null };
      }
    },
    [apiBase]
  );

  const postParticipants = useCallback(
    async (appointmentId, body = {}) => {
      const token = localStorage.getItem("token");
      try {
        await fetch(buildUrl(`${apiBase}/appointments/${appointmentId}/participants`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(body),
        });
      } catch (err) { }
    },
    [apiBase]
  );

  const callEndAppointment = useCallback(
    async (appointmentId) => {
      if (!appointmentId) return;
      if (endedRef.current.has(appointmentId)) {
        console.info("callEndAppointment: already ended", appointmentId);
        return;
      }
      endedRef.current.add(appointmentId);

      const token = localStorage.getItem("token");
      try {
        const res = await fetch(buildUrl(`${apiBase}/appointments/${appointmentId}/end`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ endedAt: new Date().toISOString() }),
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => null);
          console.error("callEndAppointment server error", res.status, errBody);
          endedRef.current.delete(appointmentId);
          return;
        }
        try {
          await res.json().catch(() => null);
        } catch (e) { }
      } catch (err) {
        console.error("callEndAppointment network error", err);
        endedRef.current.delete(appointmentId);
      }
    },
    [apiBase]
  );
  async function submitReview() {
    if (!reviewTarget?.id) return;

    const token = localStorage.getItem("token");
    setReviewSubmitting(true);

    try {
      const res = await fetch(buildUrl("/api/reviews"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          appointmentId: reviewTarget.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        alert(json?.message || "Failed to submit review");
        return;
      }

      alert("Thank you for your feedback!");
      setShowReviewModal(false);
      setReviewTarget(null);
      setReviewComment("");
      setReviewRating(5);

      await loadProfile(); // refresh UI
    } catch (err) {
      alert("Network error submitting review");
    } finally {
      setReviewSubmitting(false);
    }
  }


  const callExtend = useCallback(
    async (appointmentId, minutes) => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(buildUrl(`${apiBase}/appointments/${appointmentId}/extend`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ minutes }),
        });
        const json = await res.json().catch(() => null);
        return json;
      } catch (err) {
        return { success: false, message: err.message || "Network error" };
      }
    },
    [apiBase]
  );

  const handleStartJoinFlow = useCallback(
    async (appointment) => {
      const appointmentId = appointment?.id || appointment?._id || null;
      if (!appointmentId) {
        console.warn("handleStartJoinFlow: missing appointmentId", appointment);
        return;
      }

      if (activeSession && activeSession.appointmentId === appointmentId) {
        console.info("handleStartJoinFlow: already active for appointment", appointmentId);
        return;
      }

      if (joiningRef.current.has(appointmentId)) {
        console.info("handleStartJoinFlow: join already in progress for", appointmentId);
        return;
      }

      joiningRef.current.add(appointmentId);
      setJoining(true);
      setConferenceError(null);

      try {
        if (pollSessionRoomRef.current) {
          clearInterval(pollSessionRoomRef.current);
          pollSessionRoomRef.current = null;
        }

        const pollOnce = async () => {
          const jsonWrap = await pollSessionRoom(appointmentId);
          console.log("[pollSessionRoom]", appointmentId, jsonWrap);
          if (!jsonWrap) return;
          const { status: pollStatus, body: pollBody } = jsonWrap;

          if (pollBody && pollBody.started) {
            if (pollSessionRoomRef.current) {
              clearInterval(pollSessionRoomRef.current);
              pollSessionRoomRef.current = null;
            }

            const joinWrap = await callJoinSession(appointmentId);
            console.log("[DEBUG join-session result full]", appointmentId, joinWrap);

            if (joinWrap && joinWrap.status === 401) {
              const ok = window.confirm("You must be logged in to join this session. Log in now?");
              if (ok) {
                window.location.href = "/login";
              }
              joiningRef.current.delete(appointmentId);
              setJoining(false);
              return;
            }

            let tokenValue = undefined;
            if (joinWrap && joinWrap.status === 200 && joinWrap.body) {
              tokenValue =
                joinWrap.body.token ||
                joinWrap.body.data?.token ||
                joinWrap.body.data?.tokenValue ||
                joinWrap.body.data?.jwt ||
                undefined;
            }
            console.log("Token received:", {
              hasToken: !!tokenValue,
              tokenLength: tokenValue?.length,
              tokenPreview: tokenValue ? tokenValue.substring(0, 50) + "..." : "none"
            });
            if (!tokenValue && pollBody) {
              tokenValue = pollBody.token || pollBody.session?.token || undefined;
            }

            let roomName = null,
              meetingUrl = null,
              mode = "audio",
              session = pollBody.session || {},
              participants = session.participants || {};
            if (joinWrap && joinWrap.status === 200 && joinWrap.body && (joinWrap.body.started || joinWrap.body.data)) {
              roomName = joinWrap.body.roomName || joinWrap.body.data?.roomName || pollBody.roomName;
              meetingUrl = joinWrap.body.meetingUrl || joinWrap.body.data?.meetingUrl || pollBody.meetingUrl;
              mode = joinWrap.body.mode || pollBody.mode || "audio";
              session = joinWrap.body.session || joinWrap.body.data?.session || session;
              participants = joinWrap.body.participants || session.participants || participants;
            } else if (pollBody.roomName) {
              roomName = pollBody.roomName;
              meetingUrl = pollBody.meetingUrl;
              mode = pollBody.mode || "audio";
            } else {
              alert("Session hasn't been started properly — no room available. Ask the professional to start the session.");
              joiningRef.current.delete(appointmentId);
              setJoining(false);
              return;
            }

            // log for debugging
            console.log("[JOIN FLOW] got roomName, meetingUrl, token:", {
              appointmentId,
              roomName,
              meetingUrl,
              tokenValue,
              session,
              participants,
            });

            // Get role from the response if available
            let userRole = "user"; // default
            let permissions = {};
            if (joinWrap && joinWrap.body && joinWrap.body.data) {
              userRole = joinWrap.body.data.role || joinWrap.body.role || "user";
              permissions = joinWrap.body.data.permissions || joinWrap.body.permissions || {};
            }

            setActiveSession((prev) => {
              if (prev && prev.appointmentId === appointmentId) return prev;
              return {
                appointmentId,
                roomName,
                token: tokenValue,
                meetingUrl,
                mode,
                session,
                participants,
                role: userRole,
                permissions,
              };
            });

            // 📜 Auto-scroll to active session at bottom
            setTimeout(() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }, 500);

            postParticipants(appointmentId, { userJoined: true }).catch(() => { });

            if (!pollBothJoinedRef.current) {
              pollBothJoinedRef.current = setInterval(async () => {
                const s = await pollSessionRoom(appointmentId);
                if (!s || !s.body) return;
                setActiveSession((prev) => {
                  if (!prev) {
                    return {
                      appointmentId,
                      roomName: s.body.roomName,
                      meetingUrl: s.body.meetingUrl,
                      mode: s.body.mode,
                      session: s.body.session,
                      participants: s.body.session?.participants,
                    };
                  }
                  return {
                    ...prev,
                    session: s.body.session,
                    participants: s.body.session?.participants,
                  };
                });
              }, 2000);
            }

            joiningRef.current.delete(appointmentId);
            setJoining(false);
          }
        };

        await pollOnce();
        pollSessionRoomRef.current = setInterval(pollOnce, 3000);
      } catch (err) {
        console.error("handleStartJoinFlow error", err);
        alert("Failed to join session: " + (err?.message || "Unknown error"));
        joiningRef.current.delete(appointmentId);
        setJoining(false);
      }
    },
    [pollSessionRoom, callJoinSession, postParticipants, activeSession]
  );

  useEffect(() => {
    if (!activeSession || !activeSession.session) {
      clearInterval(countdownRef.current);
      setTimer({ minutes: 0, seconds: 0, totalSeconds: 0 });
      return;
    }

    const { session, participants } = activeSession;
    const bothJoined = !!(participants && (participants.bothJoinedAt || (participants.professionalJoined && participants.userJoined)));
    if (!bothJoined || !session.expiresAt) {
      clearInterval(countdownRef.current);
      setTimer({ minutes: 0, seconds: 0, totalSeconds: 0 });
      return;
    }

    const computeSecondsLeft = () => {
      const now = new Date();
      const expires = new Date(session.expiresAt);
      const diffSec = Math.max(0, Math.ceil((expires - now) / 1000));
      return diffSec;
    };

    const initial = computeSecondsLeft();
    setTimer({ minutes: Math.floor(initial / 60), seconds: initial % 60, totalSeconds: initial });
    clearInterval(countdownRef.current);

    countdownRef.current = setInterval(async () => {
      const left = computeSecondsLeft();
      setTimer({ minutes: Math.floor(left / 60), seconds: left % 60, totalSeconds: left });

      if (left <= 300 && left > 0) {
        setShowExtendModal(true);
      }

      if (left <= 0) {
        clearInterval(countdownRef.current);
        setShowExtendModal(false);
        if (activeSession && activeSession.appointmentId) {
          await callEndAppointment(activeSession.appointmentId);
        }
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(countdownRef.current);
  }, [activeSession, callEndAppointment]);

  const handleParticipantsUpdate = async (count, participants) => {
    if (!activeSession || !activeSession.appointmentId) return;
    try {
      await fetch(buildUrl(`${apiBase}/appointments/${activeSession.appointmentId}/participants`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ userJoined: true }),
      });
    } catch (err) { }
  };

  function handleConferenceFailed(err) {
    const code = (err && (err.name || err.error || err));
    if (String(code).toLowerCase().includes("membersonly") || String(code).toLowerCase().includes("members_only")) {
      setConferenceError({ reason: "membersOnly", detail: err });
    } else {
      setConferenceError({ reason: "other", detail: err });
    }
  }

  const handleExtend = async (minutes) => {
    if (!activeSession || !activeSession.appointmentId) return;

    setExtendPending(true);
    setExtendError(null);
    setNeedsTopup(false);

    try {
      const res = await callExtend(activeSession.appointmentId, minutes);

      // ✅ SUCCESS
      if (res?.success && res?.reserved?.expiresAt) {
        setActiveSession(prev =>
          prev ? {
            ...prev,
            session: {
              ...prev.session,
              expiresAt: res.reserved.expiresAt
            }
          } : prev
        );

        setShowExtendModal(false);
        return;
      }

      // ❌ INSUFFICIENT BALANCE
      const msg = res?.message || res?.error || "";

      if (
        res?.code === "INSUFFICIENT_BALANCE" ||
        msg.toLowerCase().includes("insufficient")
      ) {
        setNeedsTopup(true);
        setExtendError("Insufficient wallet balance");
        return;
      }


      // ❌ OTHER ERROR
      setExtendError(res?.message || "Failed to extend session");

    } catch (err) {
      setExtendError(err.message || "Network error");
    } finally {
      setExtendPending(false);
    }
  };


  const AppointmentActions = ({ apt }) => {
    const isJoinable = ["confirmed", "ongoing"].includes((apt.status || "").toLowerCase());
    const inProgress = activeSession && activeSession.appointmentId === apt.id;
    const token = localStorage.getItem("token");

    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {isJoinable ? (
          <PrimaryBtn
            onClick={async () => {
              const appointmentId = apt.id || apt._id || null;
              console.log("Join button clicked for appointment:", appointmentId, { apt });
              if (!appointmentId) {
                alert("Unable to join: appointment id missing. Check console for details.");
                return;
              }
              try {
                await handleStartJoinFlow({ ...apt, id: appointmentId });
              } catch (e) {
                console.error("handleStartJoinFlow threw", e);
              }
            }}
            disabled={joining || inProgress || !token}
            title={inProgress ? "In session" : "Join session"}
          >
            {!token ? "Login to join" : inProgress ? "In session" : joining ? "Joining…" : "Join Session"}
          </PrimaryBtn>
        ) : (
          <SecondaryBtn disabled>Not startable</SecondaryBtn>
        )}
      </div>
    );
  };

  const copyMeetingUrl = async () => {
    if (!activeSession || !activeSession.meetingUrl) return alert("No meeting URL available");
    try {
      await navigator.clipboard.writeText(activeSession.meetingUrl);
      alert("Meeting URL copied to clipboard. Send it to the professional or open in a new tab.");
    } catch (err) {
      alert("Failed to copy. Meeting URL: " + activeSession.meetingUrl);
    }
  };

  if (loading) return <TopCenter>Loading…</TopCenter>;
  const isLoggedIn = Boolean(profile);

  return (
    <Page>
      <Header>
        <Brand onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Shaadi Undo</Brand>

        <HeaderRight>
          {isLoggedIn ? (
            <DropWrap
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
            >
              <AvatarSmall>{(profile?.name || "U")[0]?.toUpperCase()}</AvatarSmall>

              {dropdownOpen && (
                <Dropdown>
                  <DropHeader>
                    <strong>{profile?.name}</strong>
                    <div style={{ color: theme.muted, fontSize: 13 }}>{profile?.email}</div>
                  </DropHeader>

                  <DropLinks>
                    <DropLink to="/user-profile" onClick={() => setActive("Profile")}>
                      Profile
                    </DropLink>
                    <DropLink to="/user-profile" onClick={() => setActive("Appointments")}>
                      Appointments
                    </DropLink>
                    <DropLink to="/user-profile" onClick={() => setActive("Wallet")}>
                      Wallet
                    </DropLink>
                    <DropLink to="/user-profile" onClick={() => setActive("Transactions")}>
                      Transactions
                    </DropLink>
                    <DropBtn onClick={signOut}>Logout</DropBtn>
                  </DropLinks>
                </Dropdown>
              )}
            </DropWrap>
          ) : (
            <ActionBtn
              onClick={() => { setActive("Login"); setAuthTab("login"); }}
              style={{ padding: "8px 18px", fontSize: 14 }}
            >
              🔑 Sign In
            </ActionBtn>
          )}
        </HeaderRight>
      </Header>

      <Main>
        <LeftCol>
          <LeftCard>
            <LeftRow>
              <AvatarLarge style={{ background: isLoggedIn ? "#fdf4ec" : "#f3f4f6", color: isLoggedIn ? "#8e6241" : "#6b7280" }}>
                {isLoggedIn ? (profile?.name || "U")[0]?.toUpperCase() : "👤"}
              </AvatarLarge>
              <div>
                <Name>{isLoggedIn ? profile?.name : "Guest User"}</Name>
                <Muted>{isLoggedIn ? profile?.email : "Not signed in"}</Muted>
                {isLoggedIn && profile?.phone && <Muted>{profile?.phone}</Muted>}
              </div>
            </LeftRow>

            <LeftActions>
              {isLoggedIn ? (
                <>
                  <ActionBtn onClick={handleStartEdit}>Edit Profile</ActionBtn>
                  <ActionBtnOutline onClick={signOut}>Sign out</ActionBtnOutline>
                </>
              ) : (
                <ActionBtn
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => { setActive("Login"); }}
                >
                  🔑 Sign In / Register
                </ActionBtn>
              )}
            </LeftActions>
          </LeftCard>

          <WalletPanel>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FaWallet size={20} style={{ color: "#ba8d6c" }} />
              <WalletTitle>Wallet</WalletTitle>
            </div>

            {isLoggedIn && profile?.wallet ? (
              <div style={{ marginTop: 12 }}>
                <div>
                  <SmallMuted>Available Balance</SmallMuted>
                  <BigBalance style={{ marginTop: 6, color: theme.primary }}>{formatCurrency(profile.wallet.balance)}</BigBalance>
                </div>

                <div style={{ marginTop: 12 }}>
                  <ViewWallet onClick={() => setActive("Wallet")}>View Details</ViewWallet>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <SmallMuted>{isLoggedIn ? "No wallet found." : "Sign in to view wallet & balance."}</SmallMuted>
                <div style={{ marginTop: 8 }}>
                  {isLoggedIn ? (
                    <PrimaryBtn
                      style={{ padding: "6px 14px", fontSize: 13, fontWeight: 700 }}
                      onClick={() => setShowTopup(true)}
                    >
                      Add Money
                    </PrimaryBtn>
                  ) : (
                    <PrimaryBtn
                      style={{ padding: "6px 14px", fontSize: 13, fontWeight: 700 }}
                      onClick={() => { setActive("Login"); }}
                    >
                      Sign In
                    </PrimaryBtn>
                  )}
                </div>
              </div>
            )}
          </WalletPanel>

          <LeftNav>
            {(isLoggedIn ? ["Profile", "Appointments", "Wallet", "Transactions"] : ["Sign In / Register", "Appointments", "Profile", "Wallet"]).map((label) => {
              const isItemActive = (label === "Sign In / Register" && active === "Login") || active === label;
              return (
                <NavItem
                  key={label}
                  active={isItemActive}
                  onClick={() => {
                    if (label === "Sign In / Register") {
                      setActive("Login");
                    } else if (!isLoggedIn) {
                      setActive("Login");
                    } else {
                      setActive(label);
                      setIsEditing(false);
                    }
                  }}
                >
                  {label}
                </NavItem>
              );
            })}
          </LeftNav>
        </LeftCol>

        <RightCol>
          <RightCard>
            {!isLoggedIn || active === "Login" ? (
              <AuthCardContainer>
                {active !== "Login" && !isLoggedIn && (
                  <div style={{ background: "#fdf8f4", border: "1.5px solid #e7d8cc", borderRadius: 8, padding: "12px 18px", color: "#8e6241", fontWeight: 600, fontSize: 14 }}>
                    🔒 Please sign in to view your <strong>{active}</strong>.
                  </div>
                )}
                <AuthTabsHeader>
                  <AuthTabBtn
                    $active={authTab === "login"}
                    onClick={() => { setAuthTab("login"); setAuthOtpSent(false); setAuthError(null); setAuthSuccess(null); }}
                  >
                    🔑 Login (Existing User)
                  </AuthTabBtn>
                  <AuthTabBtn
                    $active={authTab === "register"}
                    onClick={() => { setAuthTab("register"); setAuthOtpSent(false); setAuthError(null); setAuthSuccess(null); }}
                  >
                    📝 Register (New User)
                  </AuthTabBtn>
                </AuthTabsHeader>

                {authTab === "login" ? (
                  <AuthFormWrapper>
                    <H2>Sign In with OTP</H2>
                    <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
                      Apna registered email address enter karein. Hum aapko login karne ke liye 6-digit OTP bhejenge.
                    </div>

                    {authError && (
                      <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
                        ⚠️ {authError}
                      </div>
                    )}
                    {authSuccess && (
                      <div style={{ color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
                        ✅ {authSuccess}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                          Registered Email Address
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="email"
                            placeholder="Enter your email (e.g. ahaadmail7065@gmail.com)"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            disabled={authOtpSent || authLoading}
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              borderRadius: 8,
                              border: "1.5px solid #d1d5db",
                              background: "#ffffff",
                              color: "#111827",
                              WebkitTextFillColor: "#111827",
                              fontSize: 15,
                              outline: "none",
                            }}
                          />
                          {!authOtpSent && (
                            <button
                              type="button"
                              onClick={handleSendLoginOtp}
                              disabled={authLoading || authCooldown > 0}
                              style={{
                                background: authCooldown > 0 ? "#9ca3af" : "#ba8d6c",
                                color: "#ffffff",
                                border: "none",
                                padding: "10px 18px",
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: authCooldown > 0 ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {authLoading ? "Sending..." : authCooldown > 0 ? `Wait ${authCooldown}s` : "GET OTP"}
                            </button>
                          )}
                        </div>
                      </div>

                      {authOtpSent && (
                        <div>
                          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                            Enter 6-Digit OTP sent to your email
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            value={authOtp}
                            onChange={(e) => setAuthOtp(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 14px",
                              borderRadius: 8,
                              border: "2px solid #ba8d6c",
                              background: "#ffffff",
                              color: "#111827",
                              WebkitTextFillColor: "#111827",
                              fontSize: 18,
                              fontWeight: 700,
                              letterSpacing: 4,
                              boxSizing: "border-box",
                              outline: "none",
                              marginBottom: 12,
                            }}
                          />

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={handleVerifyLoginOtp}
                              disabled={authLoading}
                              style={{
                                background: "#ba8d6c",
                                color: "#ffffff",
                                border: "none",
                                padding: "11px 22px",
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: "pointer",
                              }}
                            >
                              {authLoading ? "Verifying..." : "Verify OTP & Continue"}
                            </button>

                            <button
                              type="button"
                              onClick={handleSendLoginOtp}
                              disabled={authLoading || authCooldown > 0}
                              style={{
                                background: "#ffffff",
                                color: "#374151",
                                border: "1.5px solid #d1d5db",
                                padding: "11px 16px",
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: authCooldown > 0 ? "not-allowed" : "pointer",
                              }}
                            >
                              {authCooldown > 0 ? `Resend (${authCooldown}s)` : "Resend OTP"}
                            </button>

                            <button
                              type="button"
                              onClick={() => { setAuthOtpSent(false); setAuthOtp(""); setAuthError(null); }}
                              style={{
                                background: "transparent",
                                color: "#6b7280",
                                border: "none",
                                padding: "11px 12px",
                                fontSize: 14,
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              Change Email
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </AuthFormWrapper>
                ) : (
                  <AuthFormWrapper>
                    <H2>Register (New User)</H2>
                    <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
                      Apna naam, email aur phone number enter karein account create karne ke liye.
                    </div>

                    {authError && (
                      <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
                        ⚠️ {authError}
                      </div>
                    )}
                    {authSuccess && (
                      <div style={{ color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
                        ✅ {authSuccess}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          disabled={authOtpSent || authLoading}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: "1.5px solid #d1d5db",
                            background: "#ffffff",
                            color: "#111827",
                            WebkitTextFillColor: "#111827",
                            fontSize: 15,
                            boxSizing: "border-box",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          disabled={authOtpSent || authLoading}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: "1.5px solid #d1d5db",
                            background: "#ffffff",
                            color: "#111827",
                            WebkitTextFillColor: "#111827",
                            fontSize: 15,
                            boxSizing: "border-box",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                          Phone Number (Required)
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            disabled={authOtpSent || authLoading}
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              borderRadius: 8,
                              border: "1.5px solid #d1d5db",
                              background: "#ffffff",
                              color: "#111827",
                              WebkitTextFillColor: "#111827",
                              fontSize: 15,
                              outline: "none",
                            }}
                          />
                          {!authOtpSent && (
                            <button
                              type="button"
                              onClick={handleSendRegisterOtp}
                              disabled={authLoading || authCooldown > 0}
                              style={{
                                background: authCooldown > 0 ? "#9ca3af" : "#ba8d6c",
                                color: "#ffffff",
                                border: "none",
                                padding: "10px 18px",
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: authCooldown > 0 ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {authLoading ? "Sending..." : authCooldown > 0 ? `Wait ${authCooldown}s` : "GET OTP"}
                            </button>
                          )}
                        </div>
                      </div>

                      {authOtpSent && (
                        <div>
                          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                            Enter 6-Digit OTP sent to your email
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            value={authOtp}
                            onChange={(e) => setAuthOtp(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 14px",
                              borderRadius: 8,
                              border: "2px solid #ba8d6c",
                              background: "#ffffff",
                              color: "#111827",
                              WebkitTextFillColor: "#111827",
                              fontSize: 18,
                              fontWeight: 700,
                              letterSpacing: 4,
                              boxSizing: "border-box",
                              outline: "none",
                              marginBottom: 12,
                            }}
                          />

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={handleVerifyRegisterOtp}
                              disabled={authLoading}
                              style={{
                                background: "#ba8d6c",
                                color: "#ffffff",
                                border: "none",
                                padding: "11px 22px",
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: "pointer",
                              }}
                            >
                              {authLoading ? "Verifying..." : "Verify OTP & Continue"}
                            </button>

                            <button
                              type="button"
                              onClick={handleSendRegisterOtp}
                              disabled={authLoading || authCooldown > 0}
                              style={{
                                background: "#ffffff",
                                color: "#374151",
                                border: "1.5px solid #d1d5db",
                                padding: "11px 16px",
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: authCooldown > 0 ? "not-allowed" : "pointer",
                              }}
                            >
                              {authCooldown > 0 ? `Resend (${authCooldown}s)` : "Resend OTP"}
                            </button>

                            <button
                              type="button"
                              onClick={() => { setAuthOtpSent(false); setAuthOtp(""); setAuthError(null); }}
                              style={{
                                background: "transparent",
                                color: "#6b7280",
                                border: "none",
                                padding: "11px 12px",
                                fontSize: 14,
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              Change Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </AuthFormWrapper>
                )}
              </AuthCardContainer>
            ) : (
              <>
            {active === "Profile" && (
              isEditing ? (
                <>
                  <H2>Edit Profile Details</H2>
                  <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
                    Apni personal details update karke Save Changes par click karein.
                  </div>
                  <Section>
                    <form onSubmit={handleSaveEdit}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 8,
                              border: "1.5px solid #d1d5db",
                              background: "#ffffff",
                              backgroundColor: "#ffffff",
                              color: "#111827",
                              WebkitTextFillColor: "#111827",
                              fontSize: 15,
                              boxSizing: "border-box",
                              outline: "none",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                            Email Address <span style={{ fontSize: 12, fontWeight: 400, color: "#9ca3af" }}>(Cannot be changed)</span>
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            disabled
                            readOnly
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 8,
                              border: "1.5px solid #e5e7eb",
                              background: "#f3f4f6",
                              backgroundColor: "#f3f4f6",
                              color: "#6b7280",
                              WebkitTextFillColor: "#6b7280",
                              fontSize: 15,
                              boxSizing: "border-box",
                              outline: "none",
                              cursor: "not-allowed",
                            }}
                          />
                          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                            🔒 Email address is linked to your account and cannot be modified.
                          </div>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 8,
                              border: "1.5px solid #d1d5db",
                              background: "#ffffff",
                              backgroundColor: "#ffffff",
                              color: "#111827",
                              WebkitTextFillColor: "#111827",
                              fontSize: 15,
                              boxSizing: "border-box",
                              outline: "none",
                            }}
                          />
                        </div>

                        {editError && (
                          <div style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: 8, fontSize: 14 }}>
                            {editError}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                          <button
                            type="submit"
                            disabled={editSaving}
                            style={{
                              background: "#ba8d6c",
                              color: "#ffffff",
                              border: "none",
                              padding: "11px 24px",
                              borderRadius: 8,
                              fontWeight: 700,
                              fontSize: 14,
                              cursor: "pointer",
                              boxShadow: "0 2px 6px rgba(186,141,108,0.3)",
                            }}
                          >
                            {editSaving ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsEditing(false); setEditError(null); }}
                            style={{
                              background: "#ffffff",
                              color: "#374151",
                              border: "1.5px solid #d1d5db",
                              padding: "11px 20px",
                              borderRadius: 8,
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </Section>
                </>
              ) : (
                <>
                  <H2>Profile Details</H2>
                  <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
                    Manage your personal details and account information.
                  </div>
                  <Section>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 20,
                        background: "#fdf8f4",
                        border: "1px solid #f3e8df",
                        borderRadius: 12,
                        padding: "20px 24px",
                      }}
                    >
                      <div>
                        <SmallMuted>Full Name</SmallMuted>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>
                          {profile.name || "—"}
                        </div>
                      </div>
                      <div>
                        <SmallMuted>Email Address</SmallMuted>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>
                          {profile.email || "—"}
                        </div>
                      </div>
                      <div>
                        <SmallMuted>Phone Number</SmallMuted>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>
                          {profile.phone || "—"}
                        </div>
                      </div>
                      <div>
                        <SmallMuted>Account Type</SmallMuted>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>
                          Client / User
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 24 }}>
                      <ActionBtn
                        onClick={handleStartEdit}
                        style={{
                          background: "#ba8d6c",
                          color: "#ffffff !important",
                          border: "none",
                          padding: "10px 22px",
                          fontWeight: 700,
                          fontSize: 14,
                          borderRadius: 10,
                          boxShadow: "0 2px 8px rgba(186,141,108,0.3)",
                        }}
                      >
                        ✏️ Edit Profile Details
                      </ActionBtn>
                    </div>
                  </Section>
                </>
              )
            )}

            {active === "Appointments" && (
              <>
                <H2>My Appointments</H2>
                {(!profile.appointments || profile.appointments.length === 0) ? (
                  <EmptyCenter>
                    <EmptyImg src={""} alt="" />
                    <Muted>Sorry, you don't have any appointments</Muted>
                  </EmptyCenter>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {profile.appointments.map((apt, i) => {
                      const normalizedId = apt?.id || apt?._id || i;
                      const normalized = { ...apt, id: normalizedId };
                      return (
                        <AptRow key={normalized.id || i}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{formatDate(normalized.scheduledAt || normalized.date)}</div>
                            <div style={{ fontSize: 13, color: theme.muted }}>{normalized.professional?.name || normalized.roleSnapshot} • {normalized.mode}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <StatusChip status={normalized.status}>{normalized.status}</StatusChip>
                            <div style={{ fontSize: 12, color: theme.muted, marginTop: 6 }}>{normalized.durationMinutesRequested || 30} min</div>
                            <div style={{ marginTop: 8 }}>
                              <AppointmentActions apt={normalized} />
                            </div>
                            {String(normalized.status).toLowerCase() === "completed" && (
                              <SecondaryBtn
                                style={{ marginTop: 6, width: "100%" }}
                                onClick={() => {
                                  setReviewTarget(normalized);
                                  setShowReviewModal(true);
                                }}
                              >
                                {normalized.review ? "View Review" : "Rate Session"}
                              </SecondaryBtn>
                            )}


                          </div>
                        </AptRow>
                      );
                    })}
                  </div>
                )}

              </>
            )}

            {active === "Wallet" && (
              <>
                <H2>Wallet Details</H2>
                <Section>
                  {profile.wallet ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 8, border: `1px solid ${theme.border}`, background: "#ffffff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <FaWallet size={28} />
                          <div>
                            <SmallMuted>Total Balance</SmallMuted>
                            <BigBalance style={{ marginTop: 4, color: theme.primary }}>{formatCurrency(profile.wallet.balance)}</BigBalance>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: theme.primary }}>{profile.wallet.currency || "INR"}</div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 12 }}>
                        {/* <div style={{ padding: 12, borderRadius: 8, border: `1px solid ${theme.border}`, background: "#ffffff" }}>
                          <SmallMuted>Reserved Amount</SmallMuted>
                          <div style={{ fontWeight: 700, marginTop: 6 }}>{formatCurrency(profile.wallet.reservedAmount ?? 0)}</div>
                        </div> */}
                        <div style={{ padding: 12, borderRadius: 8, border: `1px solid ${theme.border}`, background: "#ffffff" }}>
                          <SmallMuted>Wallet ID</SmallMuted>
                          <div style={{ marginTop: 6, fontSize: 13 }}>{profile.wallet.id || "—"}</div>
                        </div>
                        <div style={{ padding: 12, borderRadius: 8, border: `1px solid ${theme.border}`, background: "#ffffff" }}>
                          <SmallMuted>Created At</SmallMuted>
                          <div style={{ marginTop: 6 }}>{formatDate(profile.wallet.createdAt)}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 20 }}>
                        <PrimaryBtn
                          style={{ padding: "10px 16px", fontWeight: 700 }}
                          onClick={() => setShowTopup(true)}
                        >
                          Add Money
                        </PrimaryBtn>

                      </div>
                    </>
                  ) : (
                    <EmptyCenter>
                      <EmptyImg src={""} alt="" />
                      <Muted>No wallet found.</Muted>
                      <div style={{ marginTop: 14 }}>
                        <PrimaryBtn
                          style={{ padding: "10px 18px", fontWeight: 700 }}
                          onClick={() => setShowTopup(true)}
                        >
                          Add Money / Top up Wallet
                        </PrimaryBtn>
                      </div>
                    </EmptyCenter>
                  )}
                </Section>
              </>
            )}

            {active === "Transactions" && (
              <>
                <H2>Recent Transactions</H2>
                {(!profile.recentTransactions || profile.recentTransactions.length === 0) ? (
                  <EmptyCenter>
                    <EmptyImg src={""} alt="" />
                    <Muted>No transactions yet.</Muted>
                  </EmptyCenter>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {profile.recentTransactions.map((t, i) => (
                      <Txn key={i}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ fontSize: 18 }}>{t.type === "credit" || t.type === "release" ? "➕" : "➖"}</div>
                          <div>
                            <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{t.type}</div>
                            <div style={{ fontSize: 13, color: theme.muted }}>{t.reference ? `Ref: ${t.reference}` : "—"}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: (t.type === "credit" || t.type === "release") ? "#16a34a" : "#ef4444" }}>
                            {(t.type === "credit" || t.type === "release") ? "+" : "-"}{formatCurrency(t.amount)}
                          </div>
                          <div style={{ fontSize: 12, color: theme.muted, marginTop: 6 }}>{formatDate(t.createdAt)}</div>
                          <div style={{ marginTop: 6 }}>
                            <StatusChip status={t.status}>{t.status}</StatusChip>
                          </div>
                        </div>
                      </Txn>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeSession && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${theme.border}` }}>
                <H2>Active Session</H2>
                <div style={{ padding: 12, border: `1px solid ${theme.border}`, borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{profile.appointments.find(a => a.id === activeSession.appointmentId)?.professional?.name || "Professional"}</div>
                      <div style={{ color: theme.muted, fontSize: 13 }}>{activeSession.mode} • Room: {activeSession.roomName}</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: theme.muted }}>Time left</div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{String(timer.minutes).padStart(2, "0")}:{String(timer.seconds).padStart(2, "0")}</div>
                      <button
                        onClick={async () => {
                          if (!confirm("Are you sure you want to end this session?")) return;
                          try {
                            if (dailyCallRef.current) await dailyCallRef.current.leave();
                            await callEndAppointment(activeSession.appointmentId);
                          } catch (e) { console.error(e); }

                          const finishedApt = profile.appointments.find(
                            (a) => a.id === activeSession.appointmentId
                          );
                          setActiveSession(null);
                          await loadProfile();
                          if (finishedApt) {
                            setReviewTarget(finishedApt);
                            setShowReviewModal(true);
                          }
                        }}
                        style={{
                          marginTop: 8,
                          padding: "6px 12px",
                          fontSize: 12,
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontWeight: 600
                        }}
                      >
                        End Session
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        width: "100%",
                        minHeight: "360px",
                        height: "min(75vh, 650px)",
                        borderRadius: 8,
                        background: "#000",
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      <DailyCall
                        ref={dailyCallRef}
                        logoUrl={null}
                        headerText="Privileged and Confidential"
                        roomName={activeSession.roomName}
                        meetingUrl={activeSession.meetingUrl}
                        token={typeof activeSession.token === "string" && activeSession.token.trim() !== "" ? activeSession.token : undefined}
                        mode={activeSession.mode}
                        height="min(75vh, 650px)"
                        autoJoin={true}
                        role={activeSession.role || "user"}
                        permissions={activeSession.permissions || {}}
                        user={{ name: profile?.name || "User" }}
                        onCallEnd={async (err) => {
                          try {
                            await callEndAppointment(activeSession.appointmentId);
                          } catch { }

                          const finishedApt = profile.appointments.find(
                            (a) => a.id === activeSession.appointmentId
                          );

                          setActiveSession(null);
                          await loadProfile();

                          if (finishedApt) {
                            setReviewTarget(finishedApt);
                            setShowReviewModal(true);
                          }
                        }}
                        onParticipantsUpdate={handleParticipantsUpdate}
                        onBothJoined={() => { }}
                        onConferenceFailed={handleConferenceFailed}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </RightCard>
        </RightCol>
      </Main>

      

      {showExtendModal && activeSession && (
        <ModalOverlay
          onClick={() => {
            setShowExtendModal(false);
            setNeedsTopup(false);
            setExtendError(null);
          }}
        >

          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Extend session</h3>
            <p style={{ color: theme.muted }}>Your session is about to end. Choose an extension:</p>

            {extendError && <div style={{ color: theme.danger, marginBottom: 8 }}>{extendError}</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <PrimaryBtn
                onClick={() => handleExtend(15)}
                disabled={extendPending}
              >
                Extend 15 min
              </PrimaryBtn>

              <PrimaryBtn
                onClick={() => handleExtend(30)}
                disabled={extendPending}
              >
                Extend 30 min
              </PrimaryBtn>

              {needsTopup && (
                <PrimaryBtn
                  style={{ background: "#16a34a", borderColor: "#16a34a" }}
                  onClick={() => {
                    setShowExtendModal(false);
                    setShowTopup(true);
                  }}
                >
                  Add Money
                </PrimaryBtn>
              )}

              <SecondaryBtn
                onClick={() => {
                  setShowExtendModal(false);
                  setNeedsTopup(false);
                  setExtendError(null);
                }}
              >
                No thanks
              </SecondaryBtn>

            </div>


            <div style={{ marginTop: 12 }}>
              <SmallMuted>Note: Extension requires sufficient wallet balance.</SmallMuted>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {conferenceError && activeSession && (
        <ModalOverlay onClick={() => setConferenceError(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Waiting for professional</h3>
            <p style={{ color: theme.muted }}>
              This meeting requires a moderator to admit participants. The professional must log in and admit you (or join as moderator).
            </p>

            <div style={{ marginTop: 10 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Meeting:</strong> {activeSession.roomName}
              </div>

              {activeSession.meetingUrl && (
                <div style={{ marginBottom: 12 }}>
                  <PrimaryBtn onClick={copyMeetingUrl}>Copy meeting URL</PrimaryBtn>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <PrimaryBtn
                  onClick={() => {
                    alert("Please ask the professional to log in and admit you from their dashboard.");
                  }}
                >
                  Notify professional
                </PrimaryBtn>
              </div>

              <div style={{ marginTop: 12 }}>
                <SmallMuted>
                  Tip: The professional should sign in on their dashboard (or open the meeting URL in a new tab and sign in) then admit waiting participants.
                </SmallMuted>
              </div>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
      {showTopup && (
        <ModalOverlay onClick={() => setShowTopup(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Add money to wallet</h3>

            <Label>Amount (INR)</Label>
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter amount"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {[100, 500, 1000].map((amt) => (
                <SecondaryBtn
                  key={amt}
                  onClick={() => setTopupAmount(String(amt))}
                >
                  ₹{amt}
                </SecondaryBtn>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <PrimaryBtn
                disabled={topupLoading}
                onClick={async () => {
                  const amt = Number(topupAmount);
                  if (!amt || amt <= 0) {
                    alert("Enter a valid amount");
                    return;
                  }

                  try {
                    setTopupLoading(true);

                    // 1️⃣ create order FIRST
                    const { orderId, amount, keyId } = await createWalletOrder(amt);

                    // 2️⃣ OPEN RAZORPAY DIRECTLY (no await before this)
                    const rzp = new window.Razorpay({
                      key: keyId,
                      amount,
                      currency: "INR",
                      name: "Shaadi Undo Wallet",
                      description: `Add ₹${amt}`,
                      order_id: orderId,
                      redirect: true, // mobile-safe
                      handler: async (response) => {
                        await fetch(buildUrl("/api/appointments/wallet/topup/verify"), {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                          },
                          body: JSON.stringify(response),
                        });

                        await loadProfile();
                        alert("Wallet topped up!");
                      },
                    });

                    rzp.open(); // ✅ now mobile-safe
                    setShowTopup(false);
                    setTopupAmount("");
                  } catch (e) {
                    alert(e.message);
                  } finally {
                    setTopupLoading(false);
                  }
                }}
              >
                {topupLoading ? "Processing…" : "Proceed to Pay"}
              </PrimaryBtn>


              <SecondaryBtn onClick={() => setShowTopup(false)}>
                Cancel
              </SecondaryBtn>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
      {showReviewModal && reviewTarget && (
        <ModalOverlay onClick={() => setShowReviewModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>
              {reviewTarget.review ? "Your Review" : "Rate Your Session"}
            </h3>

            <p style={{ color: theme.muted, fontSize: 14 }}>
              Session with{" "}
              <strong>
                {reviewTarget.professional?.name || reviewTarget.roleSnapshot}
              </strong>
            </p>

            {/* ⭐ STAR RATING */}
            <div
              style={{
                display: "flex",
                gap: 6,
                margin: "12px 0",
                justifyContent: "center",
              }}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  disabled={!!reviewTarget.review}
                  onClick={() => setReviewRating(n)}
                  style={{
                    fontSize: 28,
                    background: "none",
                    border: "none",
                    cursor: reviewTarget.review ? "default" : "pointer",
                    color:
                      n <= (reviewTarget.review?.rating ?? reviewRating)
                        ? "#f59e0b"
                        : "#cbd5e1",
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            {/* 💬 COMMENT */}
            <Label>Comment</Label>
            <textarea
              rows={3}
              value={
                reviewTarget.review
                  ? reviewTarget.review.comment || ""
                  : reviewComment
              }
              disabled={!!reviewTarget.review}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience…"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                resize: "vertical",
                background: reviewTarget.review ? "#f8fafc" : "white",
              }}
            />

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {!reviewTarget.review ? (
                <PrimaryBtn
                  disabled={reviewSubmitting}
                  onClick={submitReview}
                >
                  {reviewSubmitting ? "Submitting…" : "Submit Review"}
                </PrimaryBtn>
              ) : (
                <SecondaryBtn disabled>Review Submitted</SecondaryBtn>
              )}

              <SecondaryBtn onClick={() => setShowReviewModal(false)}>
                Close
              </SecondaryBtn>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}


    </Page>
  );
}

/* ========================= Styled components ========================= */

const StatusSpan = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  line-height: 1;
`;

const StatusChip = ({ status, children }) => {
  const c = statusColors(status);
  return (
    <StatusSpan style={{ background: c.bg, color: c.color }}>
      {children}
    </StatusSpan>
  );
};




const TopCenter = styled.div`
  padding: 60px;
  text-align: center;
  color: ${theme.muted};
  font-size: 16px;
`;

/* ... rest of styled components (unchanged) ... */
/* I kept the same styled components below — paste the rest as-is from your original file */

const Page = styled.div`
  background: ${theme.bg};
  min-height: 100vh;
`;

const Header = styled.header`
  background: ${theme.card};
  padding: 12px 20px;
  border-bottom: 1px solid ${theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Brand = styled.div`
  font-weight: 800;
  font-size: 20px;
  color: ${theme.primary};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DropWrap = styled.div`
  position: relative;
  cursor: pointer;
`;

const AvatarSmall = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #e0f2fe;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 44px;
  width: 220px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid ${theme.border};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  z-index: 40;
`;

const DropHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid ${theme.border};
`;

const DropLinks = styled.div`
  display: flex;
  flex-direction: column;
`;

const DropLink = styled(Link)`
  padding: 12px 16px;
  color: #0f172a;
  text-decoration: none;
`;

const DropBtn = styled.button`
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${theme.danger};
  text-align: left;
`;

const Main = styled.main`
  width: 100%;
  max-width: 1400px;
  margin: 24px auto;
  padding: 0 16px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const LeftCol = styled.aside``;

const LeftCard = styled.div`
  background: ${theme.card};
  border-radius: 12px;
  border: 1px solid ${theme.border};
  padding: 16px;
`;

const LeftRow = styled.div`
  display: flex;
  gap: 12px;
`;

const AvatarLarge = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: #fdf4ec;
  color: #8e6241 !important;
  border: 1.5px solid #fed7aa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 26px;
  box-shadow: 0 4px 12px rgba(186,141,108,0.15);
`;

const Name = styled.div`
  font-weight: 800;
  font-size: 19px;
  color: #111827 !important;
  line-height: 1.2;
`;

const SmallMuted = styled.div`
  font-size: 13px;
  color: #4b5563 !important;
  margin-top: 4px;
  word-break: break-all;
`;

const Muted = styled.div`
  font-size: 13px;
  color: #6b7280 !important;
  margin-top: 2px;
`;

const LeftActions = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 10px;
`;

const ActionBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1.5px solid #d1d5db;
  background: #ffffff;
  color: #1f2937 !important;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #111827 !important;
  }
`;

const ActionBtnOutline = styled(ActionBtn)`
  color: #dc2626 !important;
  border-color: #fecaca;
  background: #fef2f2;
  &:hover {
    background: #fee2e2;
    border-color: #f87171;
    color: #b91c1c !important;
  }
`;

const WalletPanel = styled.div`
  background: ${theme.card};
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  margin-top: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
`;

const WalletTitle = styled.div`
  font-weight: 800;
  font-size: 16px;
  color: #111827 !important;
`;

const ViewWallet = styled.button`
  margin-top: 10px;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: #ba8d6c;
  color: #ffffff !important;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(186,141,108,0.3);
  transition: all 0.2s ease;
  &:hover {
    background: #a87958;
  }
`;

const BigBalance = styled.div`
  font-weight: 900;
  font-size: 24px;
  color: #111827 !important;
`;

const LeftNav = styled.nav`
  margin-top: 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
`;

const NavItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})`
  padding: 14px 18px;
  font-size: 15px;
  cursor: pointer;
  background: ${(p) => (p.active ? "#fdf8f4" : "#ffffff")};
  color: ${(p) => (p.active ? "#8e6241" : "#4b5563")} !important;
  border-left: ${(p) => (p.active ? "4px solid #ba8d6c" : "4px solid transparent")};
  font-weight: ${(p) => (p.active ? 800 : 500)};
  transition: all 0.15s ease;
  &:hover {
    background: ${(p) => (p.active ? "#fdf8f4" : "#f9fafb")};
    color: ${(p) => (p.active ? "#8e6241" : "#111827")} !important;
  }
`;

const RightCol = styled.section``;

const RightCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 32px;
  width: 100%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const H2 = styled.h2`
  margin-top: 0;
  color: #111827 !important;
  font-weight: 800;
  font-size: 24px;
`;

const Section = styled.div`
  padding: 12px 0;
  color: #1f2937;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 14px;
  }
`;

const AptRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid ${theme.border};
  background: #ffffff;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const Txn = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${theme.border};
  align-items: center;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
`;

const EmptyCenter = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.muted};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

const EmptyImg = styled.img`
  width: 140px;
  max-width: 40%;
  opacity: 0.98;
`;

const EditWrap = styled.div`
  max-width: 600px;
  margin: 32px auto;
  // margin-top: -200px;
  background: ${theme.card};
  padding: 20px;
  border-radius: 10px;
  border: 1px solid ${theme.border};
`;

const Label = styled.label`
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${theme.border};
  border-radius: 8px;
  margin-top: 6px;
  box-sizing: border-box;
`;

const PrimaryBtn = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${theme.primary};
  background: ${theme.primary};
  color: #fff;
`;

const SecondaryBtn = styled(PrimaryBtn)`
  background: #fff;
  color: #0f172a;
  border: 1px solid ${theme.border};
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 12, 18, 0.45);
  z-index: 2000;
`;

const ModalContent = styled.div`
  width: 420px;
  max-width: 92%;
  background: white;
  padding: 18px;
  border-radius: 10px;
`;

const AuthCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AuthTabsHeader = styled.div`
  display: flex;
  gap: 12px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 12px;
  margin-bottom: 8px;
`;

const AuthTabBtn = styled.button`
  background: ${({ $active }) => ($active ? "#ba8d6c" : "#f3f4f6")} !important;
  color: ${({ $active }) => ($active ? "#ffffff" : "#4b5563")} !important;
  border: 1.5px solid ${({ $active }) => ($active ? "#ba8d6c" : "#d1d5db")} !important;
  padding: 10px 22px !important;
  border-radius: 999px !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;

  &:hover {
    background: ${({ $active }) => ($active ? "#ba8d6c" : "#e5e7eb")} !important;
  }
`;

const AuthFormWrapper = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 8px 0;
`;
