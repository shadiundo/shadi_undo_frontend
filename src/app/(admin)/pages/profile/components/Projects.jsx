import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  OverlayTrigger,
  Row,
  Tooltip,
  Badge,
} from "react-bootstrap";

/* --------------------------- Appointment Card --------------------------- */
const AppointmentCard = ({ appointment }) => {
  const { user, professional, role, date, amount, status } = appointment;

  const formattedDate = date
    ? new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    : "-";

  const lowerStatus = (status || "").toLowerCase();
  const variant =
    lowerStatus === "completed"
      ? "success"
      : lowerStatus === "ongoing"
        ? "info"
        : lowerStatus === "confirmed"
          ? "primary"
          : lowerStatus === "rejected" || lowerStatus === "cancelled"
            ? "danger"
            : lowerStatus === "pending" || lowerStatus === "requested"
              ? "warning"
              : "secondary";

  const icon =
    lowerStatus === "completed"
      ? "solar:check-circle-linear"
      : lowerStatus === "ongoing"
        ? "solar:hourglass-line-duotone"
        : lowerStatus === "confirmed"
          ? "solar:calendar-line-duotone"
          : lowerStatus === "pending"
            ? "solar:clock-circle-linear"
            : lowerStatus === "rejected"
              ? "solar:close-circle-line-duotone"
              : "solar:info-circle-line-duotone";

  return (
    <Card className="shadow-none mb-0 border-0 bg-white h-100">
      <CardBody className="p-3">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="avatar-md flex-shrink-0">
            <span className="avatar-title bg-light rounded-circle">
              <IconifyIcon icon={icon} className={`text-${variant} fs-28`} />
            </span>
          </div>
          <div className="flex-grow-1">
            <h6 className="fw-bold mb-1 text-dark">{user || "Unknown Client"}</h6>
            <small className="text-muted">
              With {professional || "N/A"} ({role || "Professional"})
            </small>
          </div>
          <OverlayTrigger overlay={<Tooltip>View details</Tooltip>} placement="bottom">
            <span role="button" className="fw-medium text-muted fs-18">
              <IconifyIcon icon="solar:eye-linear" />
            </span>
          </OverlayTrigger>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Badge bg={`${variant}-subtle`} text={variant} className="rounded-pill px-3 py-2">
              <IconifyIcon icon={icon} className="me-1" />
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
            </Badge>
          </div>
          <div className="text-end">
            <div className="fw-semibold text-dark">₹{amount ?? 0}</div>
            <small className="text-muted">{formattedDate}</small>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

/* ------------------------ Utilities ------------------------ */

function parseJwt(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    console.warn("Failed to parse JWT:", e);
    return null;
  }
}


const AdminRecentAppointments = ({ professionalId: propProfessionalId }) => {
  const params = useParams();
  const routeProfessionalId = params?.id ?? params?.professionalId ?? null;
  const professionalId = propProfessionalId ?? routeProfessionalId ?? null;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // local backend only
  const API_BASE = "https://shaadi-undo-backend.onrender.com";

  // token only from localStorage
  const token = localStorage.getItem("token");
  const payload = parseJwt(token);
  const role = (payload?.role || "").toString().toLowerCase();

  const buildEndpoint = () => {
    const PROFESSIONAL_ROLES = ["professional", "counsellor", "counselor", "therapist", "mediator", "lawyer"];
    const ADMIN_ROLES = ["admin", "administrator", "superadmin"];

    if (PROFESSIONAL_ROLES.includes(role)) {
      return `${API_BASE}/api/appointments/professional/recent?limit=8`;
    }
    if (ADMIN_ROLES.includes(role)) {
      // admin must provide professionalId
      if (!professionalId) return null;
      return `${API_BASE}/api/appointments/professional/recent?professionalId=${encodeURIComponent(professionalId)}&limit=8`;
    }
    return null;
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    setAppointments([]);

    if (!token) {
      setError("Missing auth token. Please log in.");
      setLoading(false);
      return;
    }

    const endpoint = buildEndpoint();
    if (!endpoint) {
      if (role === "admin" && !professionalId) {
        setError("Admin must provide professionalId (prop or route param).");
      } else {
        setError("You do not have permission to view these appointments.");
      }
      setLoading(false);
      return;
    }

    try {
      console.debug("Fetching appointments", { endpoint, role, professionalId });
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      let body = null;
      try { body = await res.clone().json(); } catch (e) { /* ignore */ }

      if (res.status === 401) {
        setError(body?.message || "Unauthorized: please log in again.");
        setLoading(false);
        return;
      }
      if (res.status === 403) {
        setError(body?.message || "Access denied");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(body?.message || `Failed to fetch (${res.status})`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setAppointments(data.data);
      } else {
        setAppointments([]);
        if (data?.message) setError(data.message);
      }

      // Fetch Total Earnings (separate call to get all completed appointments)
      if (professionalId) {
        fetchTotalEarnings(professionalId);
      }

    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Error fetching appointments:", err);
      setError(err.message || "Network error");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const [totalEarnings, setTotalEarnings] = useState(0);

  const fetchTotalEarnings = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/appointments/professional/recent?professionalId=${id}&limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.data) {
          const total = data.data
            .filter(app => app.status && app.status.toLowerCase() === 'completed')
            .reduce((sum, app) => sum + (Number(app.amount) || 0), 0);
          setTotalEarnings(total);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch total earnings", e);
    }
  }

  useEffect(() => {
    void fetchAppointments();

    const interval = setInterval(() => {
      void fetchAppointments();
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalId, token]); // refetch when professionalId or token changes

  return (
    <Card>
      <CardHeader className="d-flex align-items-center">
        <div className="d-flex flex-column gap-1">
          <CardTitle as="h5" className="mb-0">Total Appointments</CardTitle>
          {totalEarnings > 0 && (
            <div className="d-flex align-items-center text-success">
              <IconifyIcon icon="solar:wallet-money-bold-duotone" className="fs-16 me-1" />
              <span className="fw-bold fs-13">Total Earnings: ₹{totalEarnings.toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="ms-auto">
          <Dropdown>
            <DropdownToggle as="a" role="button" className="arrow-none">
              <IconifyIcon icon="bx:dots-vertical-rounded" className="fs-18 text-dark" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => void fetchAppointments()}>
                <IconifyIcon icon="solar:refresh-line-duotone" className="me-2" />
                Refresh
              </DropdownItem>
              {/* <DropdownItem href="/admin/appointments">
                <IconifyIcon icon="solar:calendar-line-duotone" className="me-2" />
                View All
              </DropdownItem> */}
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>

      <CardBody>
        {/* <div className="mb-2 small text-muted">Role: {role ?? "unknown"}</div>
        <div className="mb-2 small text-muted">Professional ID: {professionalId ?? "—"}</div> */}

        {loading ? (
          <div className="text-center py-3 text-muted">Loading appointments...</div>
        ) : error ? (
          <div className="text-center py-3 text-danger">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-3 text-muted">No recent appointments found</div>
        ) : (
          <Row className="g-3">
            {appointments.map((apt) => (
              <Col lg={6} key={apt.id ?? apt._id ?? Math.random()}>
                <AppointmentCard appointment={apt} />
              </Col>
            ))}
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

export default AdminRecentAppointments;
