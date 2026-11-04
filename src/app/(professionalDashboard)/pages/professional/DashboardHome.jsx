// DashboardHome.jsx
import React, { useState, useEffect } from "react";
import {
  BsEye,
  BsMouse,
  BsGraphUpArrow,
  BsPersonPlus,
} from "react-icons/bs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

/* ------------------  Analytics Cards  ------------------ */
const analyticsCards = [
  { id: 1, label: "Page Views", value: "13,647", icon: <BsEye />, bg: "#e0ebff", color: "#0a58ca", trend: "+14.2%" },
  { id: 2, label: "Clicks", value: "9,526", icon: <BsMouse />, bg: "#dff7e2", color: "#0d8040", trend: "+8.5%" },
  { id: 3, label: "Conversions", value: "65.2%", icon: <BsGraphUpArrow />, bg: "#fde3e6", color: "#b91c1c", trend: "+3.8%" },
  { id: 4, label: "New Users", value: "9.5k", icon: <BsPersonPlus />, bg: "#fff3cd", color: "#997404", trend: "+24.0%" },
];

/* ------------------  Mock / static data (unchanged) ------------------ */
const appointmentsOverTime = [
  { month: "Jan", appointments: 24 }, { month: "Feb", appointments: 62 }, { month: "Mar", appointments: 42 },
  { month: "Apr", appointments: 68 }, { month: "May", appointments: 48 }, { month: "Jun", appointments: 58 },
  { month: "Jul", appointments: 36 }, { month: "Aug", appointments: 44 }, { month: "Sep", appointments: 30 },
  { month: "Oct", appointments: 76 }, { month: "Nov", appointments: 54 }, { month: "Dec", appointments: 62 },
];
const conversionPieData = [{ name: "Returning", value: 65.2 }, { name: "New", value: 34.8 }];
const PIE_COLORS = ["#CAAA93", "#E2E8F0"];
const connectedClients = [
  { name: "John Doe", email: "johndoe@gmail.com", lastActive: "2 days ago" },
  { name: "Maya Patel", email: "mayapatel@gmail.com", lastActive: "5 days ago" },
  { name: "Oliver Smith", email: "oliversmith@gmail.com", lastActive: "1 month ago" },
  { name: "Ava Johnson", email: "avajohnson@gmail.com", lastActive: "3 days ago" },
  { name: "Noah Brown", email: "noahbrown@gmail.com", lastActive: "Online" },
  { name: "Sophia Lee", email: "sophialee@gmail.com", lastActive: "2 weeks ago" },
];

/* ------------------  Component  ------------------ */
export default function DashboardHome() {
  const [range, setRange] = useState("1M");
  return (
    <div className="container-fluid px-0 my-3">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>
            Professional Dashboard
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "14px" }}>
            Overview of your consultations, analytics, and client activity
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => window.print()}
            type="button"
            className="btn btn-sm"
            style={{
              background: "#ffffff",
              border: "1px solid #D1D5DB",
              color: "#374151",
              fontWeight: 600,
              padding: "9px 18px",
              borderRadius: "8px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              cursor: "pointer"
            }}
          >
            Export
          </button>
          <a
            href="/professional/appointments"
            className="btn btn-sm text-decoration-none"
            style={{
              backgroundColor: "#CAAA93",
              border: "none",
              color: "#ffffff",
              fontWeight: 600,
              padding: "9px 20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(202, 170, 147, 0.4)",
              cursor: "pointer"
            }}
          >
            New Appointment
          </a>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="row g-3 mb-4">
        {analyticsCards.map((c) => (
          <div className="col-12 col-sm-6 col-xl-3" key={c.id}>
            <div
              className="card h-100"
              style={{
                background: "#ffffff",
                border: "1px solid #E5E7EB",
                borderRadius: "14px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                padding: "20px"
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: c.bg,
                    color: c.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22
                  }}
                >
                  {c.icon}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#059669",
                    background: "#ECFDF5",
                    padding: "3px 8px",
                    borderRadius: "12px"
                  }}
                >
                  {c.trend}
                </span>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {c.label}
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827", marginTop: "4px", letterSpacing: "-0.5px" }}>
                  {c.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="row g-4">
        {/* Left Column */}
        <div className="col-12 col-lg-8">
          <div
            className="card h-100"
            style={{
              background: "#ffffff",
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
            }}
          >
            <div className="card-body" style={{ padding: "24px" }}>
              <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
                <div>
                  <h5 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
                    Appointments Overview
                  </h5>
                  <div style={{ color: "#64748B", fontSize: "13px", marginTop: "2px" }}>
                    Total appointments, trends and capacity planning
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    background: "#F1F5F9",
                    padding: "4px",
                    borderRadius: "10px",
                    gap: "2px"
                  }}
                >
                  {["ALL", "1M", "6M", "1Y"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      type="button"
                      style={{
                        border: "none",
                        background: range === r ? "#CAAA93" : "transparent",
                        color: range === r ? "#ffffff" : "#64748B",
                        fontWeight: 600,
                        fontSize: "12px",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: range === r ? "0 2px 6px rgba(202, 170, 147, 0.4)" : "none"
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <DashboardChart range={range} />

              {/* Summary boxes */}
              <div className="row mt-4 g-3">
                <DashboardStats range={range} />
              </div>

              {/* Secondary Summary */}
              <div className="row mt-3 g-2">
                <div className="col-12 col-md-4">
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>Active Cases</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginTop: "2px" }}>128</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>No-shows (30d)</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginTop: "2px" }}>8</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>Average Fee</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginTop: "2px" }}>₹ 2,400</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-12 col-lg-4 d-flex flex-column" style={{ gap: 20 }}>
          <div
            className="card"
            style={{
              background: "#ffffff",
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
            }}
          >
            <div className="card-body" style={{ padding: "20px" }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>Conversions</h6>
                <div style={{ fontSize: "12px", color: "#64748B" }}>This month</div>
              </div>

              <div className="d-flex align-items-center" style={{ marginTop: 12 }}>
                <div style={{ width: 110, height: 110, minWidth: 110, minHeight: 110 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={conversionPieData} innerRadius={36} outerRadius={54} dataKey="value" startAngle={90} endAngle={450}>
                        {conversionPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ marginLeft: 16, flex: 1 }}>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: "#111827" }}>65.2%</div>
                  <div style={{ fontSize: "13px", color: "#64748B" }}>Returning Customers</div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px" }}>
                    <div>This week: <strong style={{ color: "#111827" }}>23.5k</strong></div>
                    <div>Last week: <strong style={{ color: "#111827" }}>41.05k</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Clients */}
          <ConnectedClients />
        </div>
      </div>

      {/* Footer Widgets */}
      <div className="row g-3 mt-4">
        {[{ title: "Open Tasks", value: "24" }, { title: "Unread Messages", value: "5" }, { title: "Client Satisfaction", value: "4.8 / 5" }].map((item, i) => (
          <div className="col-12 col-md-4" key={i}>
            <div
              className="card text-center"
              style={{
                background: "#ffffff",
                border: "1px solid #E5E7EB",
                borderRadius: "14px",
                padding: "18px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}
            >
              <div style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}>{item.title}</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------  Dashboard Chart & Stats (Dynamic) ------------------ */
function DashboardChart({ range }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [range]); // Refetch/Recalculate when range changes

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/appointments/professional/recent?limit=1000", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allAppointments = res.data?.success ? (res.data.data || []) : [];
      const currentYear = new Date().getFullYear();

      // Filter based on range
      const now = new Date();
      let filteredAppointments = allAppointments;

      if (range === "1M") {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredAppointments = allAppointments.filter(apt => {
          const d = new Date(apt.scheduledAt || apt.date || apt.createdAt);
          return d >= oneMonthAgo;
        });
      } else if (range === "6M") {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        filteredAppointments = allAppointments.filter(apt => {
          const d = new Date(apt.scheduledAt || apt.date || apt.createdAt);
          return d >= sixMonthsAgo;
        });
      } else if (range === "1Y") {
        const oneYearAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
        filteredAppointments = allAppointments.filter(apt => {
          const d = new Date(apt.scheduledAt || apt.date || apt.createdAt);
          return d >= oneYearAgo;
        });
      }

      // Group by Month (Logic might need adjustment if range spans across years, 
      // but keeping it simple for "Overview" chart which often just shows monthly aggregates)
      // For "ALL", we show data for the current year.
      // For "1M", we might want to show days? But let's stick to monthly aggregation for consistency or maybe switched to days if 1M?
      // Let's keep it simple: "Overview" chart always shows "Appointments per Month" for the selected range's duration, 
      // or if 1M, maybe show per week? 
      // User request was just "button not work". Let's simply apply the date filter to the existing monthly bucket logic.
      // If 1M, we probably won't see much if we only group by month. 
      // NOTE: Original chart was "Jan...Dec".

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const counts = months.map(m => ({ month: m, appointments: 0 }));

      filteredAppointments.forEach(apt => {
        const date = new Date(apt.scheduledAt || apt.date || apt.createdAt);
        // Only count if it falls in the current year for the generic Jan-Dec view
        // OR simply mapping to the month bucket regardless of year if we assume the chart is for "Yearly Overview"
        if (date.getFullYear() === currentYear) {
          const monthIdx = date.getMonth();
          counts[monthIdx].appointments += 1;
        }
      });

      setData(counts);
    } catch (err) {
      console.error("Failed to fetch dashboard chart data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading chart...</div>;

  return (
    <div style={{ height: 340, minHeight: 280, minWidth: 0 }}>
      {/* Key forces re-render/animation on range change if desired, or remove to just update data */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="appointments" fill="#CAAA93" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DashboardStats() {
  const [stats, setStats] = useState({
    thisWeek: 0,
    lastWeek: 0,
    utilization: "0%"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/appointments/professional/recent?limit=500", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const appointments = res.data?.success ? (res.data.data || []) : [];

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfLastWeek = new Date(now.setDate(now.getDate() - 7));
        const endOfLastWeek = new Date(startOfWeek);

        let thisWeekCount = 0;
        let lastWeekCount = 0;

        appointments.forEach(apt => {
          const date = new Date(apt.scheduledAt || apt.date || apt.createdAt);
          if (date >= startOfWeek) {
            thisWeekCount++;
          } else if (date >= startOfLastWeek && date < endOfLastWeek) {
            lastWeekCount++;
          }
        });

        setStats({
          thisWeek: thisWeekCount,
          lastWeek: lastWeekCount,
          utilization: "N/A" // Placeholder as we don't have total slots logic here yet
        });

      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className="col-12 col-md-4">
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}>This Week</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: "4px 0" }}>{stats.thisWeek}</div>
          <div style={{ fontSize: "12px", color: "#94A3B8" }}>Appointments scheduled</div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}>Last Week</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: "4px 0" }}>{stats.lastWeek}</div>
          <div style={{ fontSize: "12px", color: "#94A3B8" }}>Appointments scheduled</div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}>Total (Year)</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: "4px 0" }}>--</div>
          <div style={{ fontSize: "12px", color: "#94A3B8" }}>Appointments</div>
        </div>
      </div>
    </>
  );
}



/* ------------------  RecentAppointments (polished UI) ------------------ */
function RecentAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const tokenHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const capitalize = (s) =>
    typeof s === "string" && s.length ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  const niceDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    // e.g. "Nov 1, 2025 — 12:30 PM"
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const fetchRecentAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/appointments/professional/recent?limit=6", {
        headers: { ...tokenHeader() },
      });
      if (res.data?.success) setAppointments(Array.isArray(res.data.data) ? res.data.data : []);
      else {
        setAppointments([]);
        setError(res.data?.message || "Failed to load");
      }
    } catch (err) {
      console.error("fetch recent:", err);
      setAppointments([]);
      setError(err?.response?.data?.message || err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentAppointments();
    const interval = setInterval(fetchRecentAppointments, 60000);
    return () => clearInterval(interval);
  }, []);

  // ACTIONS (same endpoints as before)
  const respond = async (id, accept) => {
    if (!window.confirm(accept ? "Accept this appointment?" : "Reject this appointment?")) return;
    setActionLoadingId(id);
    try {
      const res = await axios.post(`/api/appointments/${id}/respond`, { accept }, { headers: { ...tokenHeader() } });
      if (res.data?.success) {
        await fetchRecentAppointments();
      } else {
        window.alert(res.data?.message || "Failed to update");
      }
    } catch (err) {
      console.error("respond error:", err);
      window.alert(err?.response?.data?.message || err.message || "Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const startAppointment = async (id) => {
    const minutes = parseInt(window.prompt("Initial reserved minutes (default 30):", "30"), 10) || 30;
    if (!window.confirm(`Start session and place hold for ${minutes} minutes?`)) return;
    setActionLoadingId(id);
    try {
      const res = await axios.post(`/api/appointments/${id}/start`, { initialMinutes: minutes }, { headers: { ...tokenHeader() } });
      if (res.data?.success) await fetchRecentAppointments();
      else window.alert(res.data?.message || "Failed to start session.");
    } catch (err) {
      console.error("start error:", err);
      window.alert(err?.response?.data?.message || err.message || "Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const extendAppointment = async (id) => {
    const minutes = parseInt(window.prompt("Extend by how many minutes?", "15"), 10) || 15;
    if (!window.confirm(`Extend session by ${minutes} minutes?`)) return;
    setActionLoadingId(id);
    try {
      const res = await axios.post(`/api/appointments/${id}/extend`, { minutes }, { headers: { ...tokenHeader() } });
      if (res.data?.success) await fetchRecentAppointments();
      else window.alert(res.data?.message || "Failed to extend.");
    } catch (err) {
      console.error("extend error:", err);
      window.alert(err?.response?.data?.message || err.message || "Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const endAppointment = async (id) => {
    if (!window.confirm("End this session now?")) return;
    setActionLoadingId(id);
    try {
      const res = await axios.post(`/api/appointments/${id}/end`, {}, { headers: { ...tokenHeader() } });
      if (res.data?.success) await fetchRecentAppointments();
      else window.alert(res.data?.message || "Failed to end session.");
    } catch (err) {
      console.error("end error:", err);
      window.alert(err?.response?.data?.message || err.message || "Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // small helper for avatar initials
  const initials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // map status -> badge colors
  const statusStyles = (status) => {
    const k = (status || "").toLowerCase();
    switch (k) {
      case "confirmed":
        return { bg: "#e6ffed", color: "#117a37", border: "1px solid rgba(17,122,55,0.08)" };
      case "pending":
      case "requested":
        return { bg: "#fff7d6", color: "#8a6d00", border: "1px solid rgba(138,109,0,0.06)" };
      case "completed":
        return { bg: "#eef2ff", color: "#0b5ed7", border: "1px solid rgba(11,94,215,0.06)" };
      case "ongoing":
        return { bg: "#e7f3ff", color: "#0b5ed7", border: "1px solid rgba(11,94,215,0.06)" };
      case "rejected":
        return { bg: "#ffe6ea", color: "#a10f0f", border: "1px solid rgba(161,15,15,0.06)" };
      case "canceled":
      case "cancelled":
        return { bg: "#fff0f0", color: "#a10f0f", border: "1px solid rgba(161,15,15,0.06)" };
      default:
        return { bg: "#f1f1f1", color: "#444", border: "1px solid rgba(0,0,0,0.04)" };
    }
  };

  return (
    <div className="card shadow-sm" style={{ marginTop: "50px" }}>
      <div className="card-body" style={{ padding: "16px", marginTop: "10px" }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="card-title mb-0">Recent Appointments</h6>
          <a href="/professional/appointments" className="small text-muted" style={{ textDecoration: "none" }}>View all</a>
        </div>

        {loading ? (
          <div className="text-center py-4 text-muted">Loading...</div>
        ) : error ? (
          <div className="text-center py-3 text-danger">Failed to load: {error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-3 text-muted">No recent appointments</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {appointments.slice(0, 8).map((apt, idx) => {
              const client = apt.user || apt.client || "Unknown";
              const type = apt.type || apt.service || "Session";
              const rawDate = apt.scheduledAt || apt.date || apt.createdAt;
              const dateStr = rawDate ? niceDate(rawDate) : "-";
              const fee = apt.amount ? (typeof apt.amount === "number" ? `₹ ${apt.amount}` : apt.amount) : "-";
              const notes = apt.notes ?? "";
              const statusKey = (apt.status || "").toLowerCase();
              const statusLabel = capitalize(apt.status || "Unknown");
              const isActionLoading = actionLoadingId === apt.id;

              const badgeStyle = statusStyles(statusKey);

              return (
                <div
                  key={apt.id ?? idx}
                  className="d-flex align-items-center"
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "#fff",
                    boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
                    border: "1px solid rgba(16,24,40,0.03)",
                    transition: "transform .08s, box-shadow .08s",
                    ...(idx < appointments.length - 1 ? {} : {}),
                  }}
                >
                  {/* avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "#f3f0ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: "#5b21b6",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {initials(client)}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {client}
                        </div>
                        <div style={{ color: "#6c757d", fontSize: 12 }}>{type}</div>
                      </div>

                      <div style={{ marginTop: 6, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontSize: 13, color: "#6c757d" }}>{dateStr}</div>
                        <div style={{ fontSize: 13, color: "#6c757d" }}>{fee}</div>
                        {notes ? (
                          <div style={{ fontSize: 13, color: "#6c757d", maxWidth: 240, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {notes.length > 80 ? `${notes.slice(0, 80)}…` : notes}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* status + actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                    <div style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, textAlign: "center", minWidth: 86, background: badgeStyle.bg, color: badgeStyle.color, border: badgeStyle.border }}>
                      {statusLabel}
                    </div>

                    {/* action buttons (compact) */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {isActionLoading ? (
                        <button className="btn btn-sm btn-outline-secondary" disabled>Processing…</button>
                      ) : statusKey === "requested" || statusKey === "pending" ? (
                        <>
                          <button className="btn btn-sm btn-success" style={{ backgroundColor: "#1fb155" }} onClick={() => respond(apt.id, true)} title="Accept">Accept</button>
                          <button className="btn btn-sm btn-outline-danger" style={{ backgroundColor: "#ef5f5f ", color: "#FFF" }} onClick={() => respond(apt.id, false)} title="Reject">Reject</button>
                        </>
                      ) : statusKey === "confirmed" ? (
                        <button className="btn btn-sm btn-primary" style={{ backgroundColor: "#Caaa93", color: "#FFF" }} onClick={() => startAppointment(apt.id)} title="Start session">Start Appointment</button>
                      ) : statusKey === "ongoing" ? (
                        <>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => extendAppointment(apt.id)} title="Extend session">Extend</button>
                          <button className="btn btn-sm btn-danger" onClick={() => endAppointment(apt.id)} title="End session">End</button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


/* ------------------  ConnectedClients (Dynamic) ------------------ */
function ConnectedClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/appointments/professional/recent?limit=100", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const appointments = res.data?.success ? (res.data.data || []) : [];
        const uniqueClients = {};

        appointments.forEach(apt => {
          // Identify client
          let user = apt.user || apt.client;
          if (!user) return;

          let id, name, email;

          if (typeof user === 'string') {
            id = user;
            name = user;
            email = "";
          } else {
            id = user._id || user.id || user.email || user.name;
            name = user.name || "Unknown";
            email = user.email || "";
          }

          if (!id) return;

          const date = new Date(apt.scheduledAt || apt.date || apt.createdAt);

          if (!uniqueClients[id]) {
            uniqueClients[id] = {
              id,
              name,
              email,
              lastActiveDate: date,
              lastActive: timeAgo(date)
            };
          } else {
            // Update last active if this appointment is newer
            if (date > uniqueClients[id].lastActiveDate) {
              uniqueClients[id].lastActiveDate = date;
              uniqueClients[id].lastActive = timeAgo(date);
            }
          }
        });

        // Convert to array and sort by most recent
        const sortedClients = Object.values(uniqueClients).sort((a, b) => b.lastActiveDate - a.lastActiveDate);

        setClients(sortedClients);
      } catch (err) {
        console.error("Failed to fetch connected clients", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  const initials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className="card"
      style={{
        background: "#ffffff",
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
      }}
    >
      <div className="card-body" style={{ padding: "20px" }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>Connected Clients</h6>
          <a
            href="/professional/appointments"
            style={{ color: "#CAAA93", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
          >
            View Appointments
          </a>
        </div>

        {loading ? (
          <div className="text-center small py-3" style={{ color: "#64748B" }}>Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="text-center small py-3" style={{ color: "#64748B" }}>No clients found</div>
        ) : (
          <div style={{ maxHeight: 380, overflowY: "auto", scrollbarWidth: "none" }}>
            {clients.map((c, index) => (
              <div
                key={c.id || index}
                className="d-flex align-items-center justify-content-between mb-2 p-2"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #EDF2F7",
                  borderRadius: "10px"
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#F5EBE6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#93684A" }}>{initials(c.name)}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{c.email ? `${c.email} · ` : ""}{c.lastActive}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------  Helpers  ------------------ */
function initials(name) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function StatusBadge({ status }) {
  const baseStyle = { padding: "0.28rem 0.6rem", borderRadius: "999px", fontSize: 12, fontWeight: 700, display: "inline-block", minWidth: 74, textAlign: "center" };
  const key = (status || "").toLowerCase();
  if (key === "confirmed") return <span style={{ ...baseStyle, background: "#e6ffed", color: "#117a37", border: "1px solid rgba(17,122,55,0.08)" }}>{status}</span>;
  if (key === "pending") return <span style={{ ...baseStyle, background: "#fff7d6", color: "#8a6d00", border: "1px solid rgba(138,109,0,0.06)" }}>{status}</span>;
  if (key === "canceled" || key === "cancelled") return <span style={{ ...baseStyle, background: "#ffe6e6", color: "#a10f0f", border: "1px solid rgba(161,15,15,0.06)" }}>{status}</span>;
  if (key === "rejected") return <span style={{ ...baseStyle, background: "#ffe6ea", color: "#a10f0f", border: "1px solid rgba(161,15,15,0.06)" }}>{status}</span>;
  if (key === "ongoing") return <span style={{ ...baseStyle, background: "#e7f3ff", color: "#0b5ed7", border: "1px solid rgba(11,94,215,0.06)" }}>{status}</span>;
  return <span style={{ ...baseStyle, background: "#f1f1f1", color: "#444" }}>{status}</span>;
}
