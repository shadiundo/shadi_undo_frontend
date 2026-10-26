// src/pages/apps/profile/components/AboutCard.jsx
import React, { useState } from "react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import avatar1 from "@/assets/images/users/avatar-1.jpg";
import avatar2 from "@/assets/images/users/avatar-2.jpg";
import avatar3 from "@/assets/images/users/avatar-3.jpg";
import avatar4 from "@/assets/images/users/avatar-4.jpg";
import avatar5 from "@/assets/images/users/avatar-5.jpg";
import avatar6 from "@/assets/images/users/avatar-6.jpg";
import avatar7 from "@/assets/images/users/avatar-7.jpg";
import avatar8 from "@/assets/images/users/avatar-8.jpg";
import avatar9 from "@/assets/images/users/avatar-9.jpg";
import avatar10 from "@/assets/images/users/avatar-10.jpg";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Modal,
  Form,
  Alert
} from "react-bootstrap";

const AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10];

function avatarForId(id) {
  if (!id) return AVATARS[0];
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return AVATARS[sum % AVATARS.length];
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

/**
 * Small, safe JWT payload decoder (no verification) — used only to read claims like `role`.
 * Returns payload object or null on failure.
 */
function decodeJwt(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1];
    // atob might throw on invalid base64
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  } catch (err) {
    
    return null;
  }
}

function getStoredTokenInfo() {
  function normalize(t) {
    if (!t) return "";
    t = t.toString().trim();
    if (!t) return "";
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      t = t.slice(1, -1).trim();
    }
    if (t.toLowerCase().startsWith("bearer ")) {
      t = t.split(" ").slice(1).join(" ").trim();
    }
    return t;
  }

  // helper to read from both storages
  function readKey(key) {
    try {
      const l = localStorage.getItem(key);
      if (l) return normalize(l);
    } catch (e) {
      // ignore access errors (e.g. private mode)
    }
    try {
      const s = sessionStorage.getItem(key);
      if (s) return normalize(s);
    } catch (e) {}
    return "";
  }

  // prefer adminToken from either storage
  const adminToken = readKey("adminToken");
  if (adminToken) {
    const payload = decodeJwt(adminToken);
    return { token: adminToken || null, source: "adminToken", payload };
  }

  // fallback to general token
  const token = readKey("token");
  const payload = decodeJwt(token);
  return { token: token || null, source: token ? "token" : null, payload };
}


const AboutCard = ({ professional, loading, onStatusChange }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'danger', text }

  if (loading) return <Card><CardBody>Loading...</CardBody></Card>;
  if (!professional) return <Card><CardBody>No profile found.</CardBody></Card>;

  const {
    _id,
    name,
    role,
    overview,
    specialties = [],
    languages = [],
    status,
    rejectionReason,
    reviewedBy,
    reviewedAt
  } = professional;

  const avatar = professional.image || avatarForId(_id);

  // API endpoints (matches your routes file)
  const APPROVE_URL = `https://shadi-undo-backend.onrender.com/api/professionals/${_id}/approve`;
  const REJECT_URL = `https://shadi-undo-backend.onrender.com/api/professionals/${_id}/reject`;

  async function callApprove() {
    if (!window.confirm(`Approve profile of ${name}?`)) return;
    setBusy(true);
    setMessage(null);

    const { token, source, payload } = getStoredTokenInfo();
    console.log("[AboutCard] Approve - token preview (first 12 chars):", token ? token.slice(0, 12) + "..." : "(no token)", "source:", source, "decodedRole:", payload?.role);

    if (!token) {
      setMessage({ type: "danger", text: "No auth token found. Please sign in as admin." });
      setBusy(false);
      return;
    }

    if (payload?.role && payload.role !== "admin") {
      setMessage({ type: "danger", text: "You are not an admin. Please sign in with an admin account to approve profiles." });
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(APPROVE_URL, {
        method: "PUT",
        mode: "cors", // explicit; keep if backend is CORS-enabled
        // credentials: 'include', // uncomment only if backend uses cookie-based session auth
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("[AboutCard] Approve response status:", res.status);

      // attempt to parse JSON; if not JSON, capture text for debugging
      let json;
      try {
        json = await res.json();
      } catch (err) {
        const text = await res.text().catch(() => "");
        console.warn("[AboutCard] Non-JSON response body:", text);
        json = { success: false, message: text || "Non-JSON response" };
      }

      if (res.status === 401) {
        const errMsg = json.message || "Unauthorized — admin access required";
        setMessage({ type: "danger", text: `Approve failed — ${errMsg}` });
        return;
      }

      if (!res.ok || !json.success) {
        const errMsg = json.message || json.error || `HTTP ${res.status}`;
        setMessage({ type: "danger", text: `Approve failed — ${errMsg}` });
        return;
      }

      const updated = json.professional || json.data || null;
      if (updated && onStatusChange) onStatusChange(updated);
      setMessage({ type: "success", text: "Profile approved." });
    } catch (err) {
      console.error("[AboutCard] Approve error:", err);
      setMessage({ type: "danger", text: err.message || "Network error" });
    } finally {
      setBusy(false);
    }
  }

  async function submitReject(e) {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setMessage({ type: "danger", text: "Please provide a rejection reason." });
      return;
    }

    setBusy(true);
    setMessage(null);

    const { token, source, payload } = getStoredTokenInfo();
    console.log("[AboutCard] Reject - token preview (first 12 chars):", token ? token.slice(0, 12) + "..." : "(no token)", "source:", source, "decodedRole:", payload?.role);

    if (!token) {
      setMessage({ type: "danger", text: "No auth token found. Please sign in as admin." });
      setBusy(false);
      return;
    }

    if (payload?.role && payload.role !== "admin") {
      setMessage({ type: "danger", text: "You are not an admin. Please sign in with an admin account to reject profiles." });
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(REJECT_URL, {
        method: "PUT",
        mode: "cors",
        // credentials: 'include', // uncomment only if backend uses cookie-based session auth
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectReason.trim() })
      });

      console.log("[AboutCard] Reject response status:", res.status);

      let json;
      try {
        json = await res.json();
      } catch (err) {
        const text = await res.text().catch(() => "");
        console.warn("[AboutCard] Non-JSON response body:", text);
        json = { success: false, message: text || "Non-JSON response" };
      }

      if (res.status === 401) {
        const errMsg = json.message || "Unauthorized — admin access required";
        setMessage({ type: "danger", text: `Reject failed — ${errMsg}` });
        return;
      }

      if (!res.ok || !json.success) {
        const errMsg = json.message || json.error || `HTTP ${res.status}`;
        setMessage({ type: "danger", text: `Reject failed — ${errMsg}` });
        return;
      }

      const updated = json.professional || json.data || null;
      if (updated && onStatusChange) onStatusChange(updated);
      setMessage({ type: "success", text: "Profile rejected." });
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err) {
      console.error("[AboutCard] Reject error:", err);
      setMessage({ type: "danger", text: err.message || "Network error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card>
        <div className="position-relative">
          <img
            src={avatar}
            alt="avatar"
            className="avatar-lg rounded-circle position-absolute top-100 start-0 translate-middle-y ms-3 border border-light border-3"
            style={{ objectFit: "cover" }}
          />
        </div>

        <CardBody className="mt-4">
          <div className="d-flex align-items-center">
            <div className="d-block">
              <h4 className="mb-1 d-flex align-items-center gap-2">
                {name || "Unknown"}
                {/* status badge */}
                {status === "approved" && <span className="badge bg-success text-white ms-2">Approved</span>}
                {status === "rejected" && <span className="badge bg-danger text-white ms-2">Rejected</span>}
                {status === "pending" && <span className="badge bg-secondary text-white ms-2">Pending</span>}
              </h4>
              <p className="fs-14 mb-0">{role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}</p>
            </div>

            <div className="ms-auto">
              <Dropdown>
                <DropdownToggle as={"a"} role="button" className="arrow-none">
                  <IconifyIcon icon="bx:dots-vertical-rounded" className="fs-18 text-dark" />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem>
                    <IconifyIcon icon="bx:edit-alt" className="me-2" />
                    Edit Profile
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {message && (
            <Alert variant={message.type === "success" ? "success" : "danger"} className="mt-3">
              {message.text}
            </Alert>
          )}

          <Row className="mt-3">
            <Col xs={12}>
              <div className="mb-3">
                {/* previous buttons - kept for compatibility */}
                {status === "approved" && <Button variant="success" disabled>Approved</Button>}
                {status === "rejected" && <Button variant="danger" disabled>Rejected</Button>}
                {status === "pending" && <Button variant="outline-secondary" disabled>Pending</Button>}
              </div>

              <CardTitle as="h5" className="mt-2 badge bg-light text-secondary py-1 px-2 fs-13 mb-3 border-start border-secondary border-2 rounded-1">
                About Me
              </CardTitle>

              <p className="fs-15 mb-0 text-muted">{overview || "No overview provided."}</p>

              <div className="mt-3">
                <div className="d-flex gap-2 flex-wrap">
                  {specialties.length ? specialties.map((s, i) => (
                    <span key={i} className="badge text-secondary py-1 px-2 fs-14 border rounded-1">{s}</span>
                  )) : <span className="text-muted">No specializations listed</span>}
                </div>

                {/* <div className="mt-2">
                  {languages && languages.length > 0 && <small className="text-muted">Languages: {languages.join(", ")}</small>}
                </div> */}
              </div>

              {/* Admin actions */}
              <div className="mt-4">
                {status === "pending" && (
                  <div className="d-flex gap-2">
                    <Button variant="primary" onClick={callApprove} disabled={busy}>
                      <IconifyIcon icon="iconamoon:check-duotone" /> {busy ? "Processing..." : "Approve"}
                    </Button>

                    <Button variant="danger" onClick={() => setShowRejectModal(true)} disabled={busy}>
                      <IconifyIcon icon="iconamoon:close-duotone" /> Reject
                    </Button>
                  </div>
                )}

                {status === "rejected" && rejectionReason && (
                  <div className="mt-3">
                    <h6 className="mb-1">Rejection reason</h6>
                    <p className="text-muted mb-1">{rejectionReason}</p>
                    {reviewedBy && <p className="text-muted mb-0"><strong>Reviewed by:</strong>Shaadi Undo</p>}
                    {reviewedAt && <p className="text-muted mb-0"><strong>Reviewed at:</strong> {formatDate(reviewedAt)}</p>}
                  </div>
                )}

                {status === "approved" && (reviewedBy || reviewedAt) && (
                  <div className="mt-3">
                    {reviewedBy && <p className="text-muted mb-0"><strong>Reviewed by:</strong> Shaadi Undo</p>}
                    {reviewedAt && <p className="text-muted mb-0"><strong>Reviewed at:</strong> {formatDate(reviewedAt)}</p>}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </CardBody>

        <CardFooter className="bg-light-subtle">
          <Row className="g-2 mb-1">
            <Col lg={12}>
              <Button
                className="w-100"
                style={{
                  backgroundColor: "#EA5455",
                  color: "#fff",
                  border: "none",
                  fontWeight: 500,
                  borderRadius: "6px",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#D13B3C";
                  e.currentTarget.style.boxShadow = "0 3px 6px rgba(234, 84, 85, 0.3)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#EA5455";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                onClick={() => {
                  const el = document.getElementById("documents-section");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                View Documents
              </Button>
            </Col>
          </Row>
        </CardFooter>
      </Card>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Profile — {name}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={submitReject}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Reason for rejection</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why profile is rejected (e.g. missing certificate, invalid ID, etc.)"
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={busy}>Cancel</Button>
            <Button variant="danger" type="submit" disabled={busy}>
              {busy ? "Submitting..." : "Reject Profile"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AboutCard;
