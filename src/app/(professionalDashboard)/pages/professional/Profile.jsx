import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";
import avatar1 from "@/assets/images/users/avatar-1.jpg";
import { FaBalanceScale, FaBolt, FaMoneyBillWave, FaStopwatch } from "react-icons/fa";
import "./Profile.css";

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

function isDarkMode() {
  try {
    const body = document.body;
    return body.classList.contains("dark-mode") || body.getAttribute("data-layout-mode") === "dark";
  } catch {
    return false;
  }
}

function MiniCalendar({ selectedDate, onSelectDate, monthOffset = 0, appointments = [] }) {
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

  // Helper function to check if a date has appointments
  const hasAppointmentsOnDate = (date) => {
    if (!appointments || appointments.length === 0) return false;

    const targetDateStr = date.toISOString().split('T')[0];
    return appointments.some(apt => {
      if (!apt.scheduledAt) return false;
      const aptDate = new Date(apt.scheduledAt);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      return aptDateStr === targetDateStr;
    });
  };

  // Helper function to get appointments count for a date
  const getAppointmentsCount = (date) => {
    if (!appointments || appointments.length === 0) return 0;

    const targetDateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      if (!apt.scheduledAt) return false;
      const aptDate = new Date(apt.scheduledAt);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      return aptDateStr === targetDateStr;
    }).length;
  };

  // Helper function to get appointment status for styling
  const getAppointmentStatusForDate = (date) => {
    if (!appointments || appointments.length === 0) return null;

    const targetDateStr = date.toISOString().split('T')[0];
    const dateAppointments = appointments.filter(apt => {
      if (!apt.scheduledAt) return false;
      const aptDate = new Date(apt.scheduledAt);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      return aptDateStr === targetDateStr;
    });

    if (dateAppointments.length === 0) return null;

    // Return the most prominent status
    const statusOrder = {
      'ongoing': 5,
      'confirmed': 4,
      'completed': 3,
      'pending': 2,
      'requested': 1,
      'cancelled': 0
    };

    return dateAppointments.sort((a, b) =>
      statusOrder[b.status?.toLowerCase()] - statusOrder[a.status?.toLowerCase()]
    )[0].status?.toLowerCase();
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 }}>
        {weekdays.map((d, i) => (
          <div key={`wd-${month}-${i}`} style={{ textAlign: "center", color: "var(--muted)", fontWeight: 700 }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {weeks.flat().map((day, idx) => {
          if (!day) return <div key={`cell-${month}-${idx}`} />;

          const cellDate = new Date(year, month, day);
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === cellDate.getFullYear() &&
            selectedDate.getMonth() === cellDate.getMonth() &&
            selectedDate.getDate() === cellDate.getDate();

          const hasAppointments = hasAppointmentsOnDate(cellDate);
          const appointmentCount = getAppointmentsCount(cellDate);
          const appointmentStatus = getAppointmentStatusForDate(cellDate);

          // Determine badge color based on appointment status
          const getStatusColor = (status) => {
            switch (status) {
              case 'ongoing': return '#3b82f6'; // blue
              case 'confirmed': return '#10b981'; // green
              case 'completed': return '#6b7280'; // gray
              case 'pending': case 'requested': return '#f59e0b'; // amber
              case 'cancelled': return '#ef4444'; // red
              default: return '#8b5cf6'; // purple
            }
          };

          const statusColor = appointmentStatus ? getStatusColor(appointmentStatus) : null;

          return (
            <div
              key={`cell-${month}-${idx}-${day}`}
              onClick={() => onSelectDate(cellDate)}
              style={{
                position: 'relative',
                padding: "8px 6px",
                textAlign: "center",
                borderRadius: 6,
                cursor: "pointer",
                backgroundColor: isSelected ? "var(--accent)" : "transparent",
                color: isSelected ? "var(--panel)" : "var(--text)",
                boxShadow: isSelected ? "0 2px 6px rgba(0,0,0,0.12)" : "none",
                border: `1px solid ${isSelected ? "transparent" : "var(--border)"}`,
                minHeight: '40px',
              }}
            >
              {day}

              {/* Appointment indicator */}
              {hasAppointments && (
                <div style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: statusColor || '#8b5cf6',
                  boxShadow: '0 0 0 2px var(--panel)'
                }} />
              )}

              {/* Appointment count badge for multiple appointments */}
              {appointmentCount > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: statusColor || '#8b5cf6',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 1px var(--panel)'
                }}>
                  {appointmentCount > 9 ? '9+' : appointmentCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Profile() {
  const { id: routeId } = useParams();
  const { user: authUser, token } = useAuthContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState(null);
  const [experience, setExperience] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(Boolean(routeId));
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [monthOffset, setMonthOffset] = useState(0);

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
      return raw
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (typeof raw === "object") {
      const arr = Array.isArray(raw) ? raw : Object.values(raw);
      return arr
        .map((x) => {
          if (!x) return null;
          if (typeof x === "string") return x.trim();
          if (typeof x === "object") return x.name ?? x.title ?? null;
          return String(x);
        })
        .filter(Boolean);
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
    if (yrs.length > 0) {
      return Math.max(...yrs);
    }
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

        const apiBase =
          import.meta.env.VITE_API_URL ||
          (import.meta.env.DEV ? "http://localhost:5000" : "https://shadi-undo-backend.onrender.com");
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

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [routeId, authUser, token, navigate]);

  // Fetch appointments for the professional
  // Update the fetchAppointments useEffect to:
  useEffect(() => {
    if (!profile || !profile._id) return;

    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const apiBase =
          import.meta.env.VITE_API_URL ||
          (import.meta.env.DEV ? "http://localhost:5000" : "https://shadi-undo-backend.onrender.com");

        // Fetch appointments for this professional
        const url = `${apiBase}/api/appointments/professional/recent?limit=100`;
        const headers = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetchWithTimeout(url, {
          method: "GET",
          headers
        }, DEFAULT_TIMEOUT);

        if (!res.ok) {
          console.error('Failed to fetch appointments:', res.status);
          return;
        }

        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          // Filter appointments for this specific professional
          const professionalAppointments = json.data.filter(apt => {
            // Check professional ID in different possible locations
            const aptProfessionalId =
              apt.professionalId ||
              apt.professional?._id ||
              apt.professional?.id;

            // Check if appointment belongs to this professional
            return aptProfessionalId === profile._id ||
              aptProfessionalId === profile.id;
          });

          // Normalize appointments to have consistent structure
          const normalizedAppointments = professionalAppointments.map(apt => {
            // Extract date from multiple possible fields
            const scheduledAt =
              apt.scheduledAt ||
              apt.date ||
              apt.createdAt ||
              (apt.raw && (apt.raw.scheduledAt || apt.raw.date || apt.raw.createdAt));

            // Extract client name
            const client =
              apt.user?.name ||
              apt.user ||
              apt.client ||
              'Unknown Client';

            // Extract status
            const status = (apt.status || 'pending').toLowerCase();

            // Extract amount label
            const amountLabel = apt.amountLabel || 'Free';

            // Extract type
            const type = apt.type || apt.service || 'Session';

            return {
              id: apt.id || apt._id || `apt-${Math.random()}`,
              client,
              type,
              scheduledAt,
              status,
              amountLabel,
              raw: apt
            };
          }).filter(apt => apt.scheduledAt); // Only keep appointments with dates

          console.log('Normalized appointments with dates:', normalizedAppointments);
          setAppointments(normalizedAppointments);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [profile, token]);

  // Helper function to get appointments for selected date
  const getAppointmentsForSelectedDate = useMemo(() => {
    if (!selectedDate || !appointments.length) return [];

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return appointments.filter(apt => {
      if (!apt.scheduledAt) return false;
      const aptDate = new Date(apt.scheduledAt);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      return aptDateStr === selectedDateStr;
    });
  }, [selectedDate, appointments]);

  const handleBook = () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    alert(`Booked on ${selectedDate.toDateString()} at ${selectedTime}`);
  };

  if (loading) return <div style={{ padding: 16 }}>Loading profile...</div>;
  if (error) return <div style={{ padding: 16, color: "var(--muted)" }}>Error: {error}</div>;
  if (!profile) return <div style={{ padding: 16 }}>No profile found.</div>;

  const hardcodedReviews = [
    { id: "r1", name: "Priya Sharma", rating: 5, text: "Very professional and helpful. Highly recommended.", when: "2 days ago" },
    { id: "r2", name: "Rohit Verma", rating: 4, text: "Good guidance and quick response.", when: "1 week ago" },
    { id: "r3", name: "Neha Gupta", rating: 5, text: "Excellent experience. Resolved my case efficiently.", when: "1 month ago" },
  ];

  const dark = isDarkMode();

  const SelectedDateAppointments = () => {
    if (!selectedDate) return null;

    const dateAppointments = getAppointmentsForSelectedDate;

    // Add debugging
    console.log('Selected date appointments:', dateAppointments);

    if (dateAppointments.length === 0) {
      return (
        <div style={{ marginTop: 16, padding: 12, background: 'var(--panel)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No appointments on {selectedDate.toLocaleDateString()}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>This day is available for booking</div>
        </div>
      );
    }

    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
          Appointments on {selectedDate.toLocaleDateString()} ({dateAppointments.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dateAppointments.map((apt, index) => {
            // Parse the date properly
            const parseDate = (dateValue) => {
              if (!dateValue) return null;
              try {
                return new Date(dateValue);
              } catch {
                return null;
              }
            };

            const aptDate = parseDate(apt.scheduledAt);
            const timeStr = aptDate ? aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time not set';
            const dateStr = aptDate ? aptDate.toLocaleDateString() : 'Date not set';

            const statusStyles = {
              'confirmed': { bg: '#e6ffed', color: '#117a37' },
              'pending': { bg: '#fff7d6', color: '#8a6d00' },
              'requested': { bg: '#fff7d6', color: '#8a6d00' },
              'ongoing': { bg: '#e7f3ff', color: '#0b5ed7' },
              'completed': { bg: '#eef2ff', color: '#0b5ed7' },
              'cancelled': { bg: '#ffe6ea', color: '#a10f0f' }
            };

            const status = (apt.status || '').toLowerCase();
            const style = statusStyles[status] || { bg: '#f1f1f1', color: '#444' };

            return (
              <div key={apt.id || index} style={{
                padding: 12,
                background: 'var(--panel)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    {apt.client || 'Unknown Client'}
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {timeStr} • {apt.type || 'Session'}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: style.bg,
                      color: style.color
                    }}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {/* {apt.amountLabel || 'Free'} */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const profStatus = (profile && profile.status) ? String(profile.status).toLowerCase() : null;

  const statusMap = {
    approved: { label: "Verified" },
    pending: { label: "Pending for verification", sub: "Under review" },
    rejected: { label: "Rejected", sub: "Contact support" },
  };

  const mapped = profStatus && statusMap[profStatus] ? statusMap[profStatus] : { label: "Unknown", sub: "Status unavailable" };

  return (
    <div className="profile-page">
      <div className="profile-container">

        <div className="profile-header">
          <div className="header-left">
            <img src={profile.avatar ?? avatar1} alt={profile.name ?? "Profile"} className="profile-avatar" />
            <div className="header-text">
              {profile.name && <h1 className="profile-name">{profile.name}</h1>}
              {profile.role && <p className="profile-subtitle">{profile.role}</p>}
              {profile.title && <p className="profile-subtitle">{profile.title}</p>}
              {profile.location && (
                <p className="profile-subtitle">
                  {profile.location.city ?? ""}{profile.location.country ? `, ${profile.location.country}` : ""}
                </p>
              )}
            </div>
          </div>

          <div
            role="status"
            aria-label={`Professional status: ${mapped.label}${mapped.sub ? ` - ${mapped.sub}` : ""}`}
            title={`Professional status: ${mapped.label}${mapped.sub ? ` - ${mapped.sub}` : ""}`}
            className="status-badge"
            style={{
              background: profStatus === "approved" ? "#22c55e" :
                profStatus === "pending" ? "#D97706" :
                  profStatus === "rejected" ? "#be0f0fff" :
                    "rgba(255,255,255,0.2)"
            }}
          >
            <div style={{ fontSize: 15 }}>{mapped.label}</div>
            {mapped.sub && <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 600 }}>{mapped.sub}</div>}
          </div>
        </div>


        <div className="profile-body-row">
          <div className="profile-left-col">

            <div className="profile-card">
              {typeof profile.overview !== "undefined" && (
                <>
                  <h5 className="profile-heading">Overview</h5>
                  <p className="profile-paragraph">{profile.overview}</p>
                </>
              )}
              {specialties && specialties.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h5 className="profile-heading">Specialties &amp; Expertise</h5>
                  <div>
                    {specialties.map((s, i) => (
                      <span key={i} className="badge-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Experience */}
            {(experience?.length > 0 || education?.length > 0) && (
              <div className="profile-card">
                {experience?.length > 0 && (
                  <>
                    <h5 className="profile-heading">Work Experience</h5>
                    <div>
                      {experience.map((exp, i) => (
                        <div key={i} className="exp-item">
                          <div className="exp-icon">
                            <FaBalanceScale color="var(--accent)" />
                          </div>
                          <div>
                            <h6 className="exp-title">{exp.firm ?? exp.company ?? "Unknown Firm"}</h6>
                            <p className="exp-meta">{exp.role ?? exp.position ?? "Role"}</p>
                            {exp.description && <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{exp.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {education?.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h5 className="profile-heading">Education</h5>
                    {education.map((edu, i) => (
                      <div key={i} className="education-item">
                        <div style={{ paddingTop: 4 }}><FaBolt color="var(--accent)" /></div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{edu.degree}</div>
                          <div style={{ fontSize: 13, color: "var(--muted)" }}>{edu.institution}, {edu.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Added missing Profile Insights section */}
            {Array.isArray(profile.insights) && profile.insights.length > 0 && (
              <div className="profile-card">
                <h5 className="profile-heading">Profile Insights</h5>
                <div style={{ width: "100%", overflowX: "auto", marginBottom: 12 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, color: "var(--muted)" }}>
                    <tbody>
                      {profile.insights.map(([label, value], idx) => (
                        <tr key={`insight-${idx}`}>
                          <td style={{ fontWeight: 600, width: "50%", padding: 10, border: "1px solid var(--border)" }}>{label}</td>
                          <td style={{ padding: 10, border: "1px solid var(--border)" }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* Service Rates */}
            <div className="profile-card">
              <div style={{ display: "flex", alignItems: "center", marginBottom: 14, gap: 10 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: "#F3E8E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#CAAA93",
                  }}
                >
                  <FaBalanceScale size={20} />
                </div>
                <h4 style={{ margin: 0, fontWeight: 800, color: "var(--text)", fontSize: 17 }}>
                  Service Rates
                </h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="pricing-item">
                  <FaMoneyBillWave style={{ color: "#CAAA93", fontSize: 20, flexShrink: 0 }} />
                  <div className="pricing-info">
                    <div className="pricing-label">Default Rate</div>
                    <div className="pricing-value">
                      ₹{(profile.defaultRate ?? 2500).toLocaleString()} <span style={{ fontWeight: 500, color: "var(--muted)", fontSize: "0.9em" }}>/ 30 min</span>
                    </div>
                  </div>
                </div>

                <div className="pricing-item">
                  <FaBolt
                    style={{
                      color: profile.isInstantAvailable ? "#22c55e" : "#ef4444",
                      fontSize: 20,
                      flexShrink: 0
                    }}
                  />
                  <div className="pricing-info">
                    <div className="pricing-label">Instant Booking</div>
                    <div
                      className="pricing-value"
                      style={{
                        color: profile.isInstantAvailable ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {profile.isInstantAvailable ? "Available" : "Not Available"}
                    </div>
                  </div>
                </div>

                {profile.isInstantAvailable && (
                  <div className="pricing-item">
                    <FaStopwatch style={{ color: "#CAAA93", fontSize: 20, flexShrink: 0 }} />
                    <div className="pricing-info">
                      <div className="pricing-label">Instant Duration</div>
                      <div className="pricing-value">
                        {profile.minInstantMinutes ?? 30} – {profile.maxInstantMinutes ?? 120} mins
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Reviews */}
            <div className="profile-card">
              <div className="review-header">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>User Reviews</div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>What clients say about this professional</div>
                </div>

                <div className="rating-bubble">
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>4.9</div>
                  <div className="star-row">★★★★★</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{hardcodedReviews.length} reviews</div>
                </div>
              </div>

              <div className="reviews-container">
                {hardcodedReviews.map((r) => (
                  <div key={r.id} className="review-item">
                    <div className="reviewer-avatar">{r.name.split(" ").map(s => s[0]).slice(0, 2).join("")}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontWeight: 700, color: "var(--text)" }}>{r.name}</div>
                        <div style={{ color: "#f5c518", fontWeight: 700 }}>{'★'.repeat(r.rating)}</div>
                      </div>
                      <div className="review-text">{r.text}</div>
                      <div className="review-meta">{r.when}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="profile-right-col">

            {/* Stats */}
            <div className="profile-card">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="stats-box">
                  <div className="stat-block">
                    <div className="stat-icon-wrap"><FaMoneyBillWave /></div>
                    <div className="stat-text">
                      <div className="stat-value">₹{profile.rate ?? profile.defaultRate ?? 1100}</div>
                      <div className="stat-label">Session Fee (30m)</div>
                    </div>
                  </div>
                  {/* Added button to book session if needed? No, separate card */}
                </div>

                <div className="stats-box">
                  <div className="stat-block">
                    <div className="stat-icon-wrap"><FaStopwatch /></div>
                    <div className="stat-text">
                      <div className="stat-value">{totalYears ?? 0}+ Years</div>
                      <div className="stat-label">Experience</div>
                    </div>
                  </div>
                </div>

                <div className="stats-box">
                  <div className="stat-block">
                    <div className="stat-icon-wrap"><FaBolt /></div>
                    <div className="stat-text">
                      <div className="stat-value">{casesHandled ?? 0}+</div>
                      <div className="stat-label">Cases Handled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar / Booking */}
            <div className="profile-card">
              <div className="calendar-header">
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text)" }}>{monthLabel}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>{profile.location?.city ?? ""}{profile.location?.country ? `, ${profile.location.country}` : ""}</div>
                </div>

                <div>
                  <button onClick={() => setMonthOffset((m) => m - 1)} className="month-nav-btn" aria-label="Previous month">←</button>
                  <button onClick={() => setMonthOffset((m) => m + 1)} className="month-nav-btn" style={{ marginLeft: 8 }} aria-label="Next month">→</button>
                </div>
              </div>

              {/* Show loading indicator for appointments */}
              {loadingAppointments && (
                <div style={{ textAlign: 'center', padding: '8px', color: 'var(--muted)', fontSize: 13 }}>
                  Loading appointments...
                </div>
              )}

              <MiniCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                monthOffset={monthOffset}
                appointments={appointments}
              />

              {/* Calendar legend */}
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                  <span style={{ color: 'var(--muted)' }}>Ongoing</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ color: 'var(--muted)' }}>Confirmed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <span style={{ color: 'var(--muted)' }}>Pending</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <span style={{ color: 'var(--muted)' }}>Cancelled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6b7280' }} />
                  <span style={{ color: 'var(--muted)' }}>Completed</span>
                </div>
              </div>

              {/* Show appointments for selected date */}
              <SelectedDateAppointments />


            </div>

            <div className="profile-card">
              <h5 className="profile-heading">Contact</h5>
              {profile.email && <p style={{ color: "var(--muted)", fontSize: 13, margin: "6px 0" }}>{profile.email}</p>}
              {profile.phone && <p style={{ color: "var(--muted)", fontSize: 13, margin: "6px 0" }}>{profile.phone}</p>}
              {profile.location && (
                <p style={{ color: "var(--muted)", fontSize: 13, margin: "6px 0" }}>
                  {profile.location.city ?? ""}{profile.location.state ? `, ${profile.location.state}` : ""}{profile.location.country ? `, ${profile.location.country}` : ""}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}