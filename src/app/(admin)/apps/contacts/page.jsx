// src/pages/apps/AllProfession.jsx
import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageMetaData from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

// avatars (make sure these files exist under src/assets/images/users/)
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

const BASE_URL = import.meta.env.VITE_API_URL;
const API_ALL = `${BASE_URL}/api/professionals/getAllProfessionals`;

const AVATARS = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
];

// Helpers
const capitalizeWords = (str = "") =>
  str
    .toString()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const safeCap = (val, fallback = "N/A") => {
  if (val === undefined || val === null) return fallback;
  const s = String(val).trim();
  return s.length ? capitalizeWords(s) : fallback;
};

function mapProfessional(p, index) {
  const avatar = AVATARS[index % AVATARS.length];
  const roleRaw = p.role || "professional";
  const statusRaw = p.status || "pending";

  return {
    id: p._id || p.id || "",
    name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Unknown",
    role: roleRaw,
    address:
      p.address ||
      (p.location
        ? `${p.location.city || ""}${p.location.country ? " / " + p.location.country : ""}`
        : p.city || p.country || "Unknown"),
    image: avatar,
    phone: p.phone || p.contactNumber || "N/A",
    specialties: p.specialties || p.specialization || [],
    status: statusRaw,
    raw: p,
  };
}

const ContactCard = ({ item }) => {
  const { id, name, role, address, image, phone, specialties, status } = item;

  const statusVariant =
    (status || "").toLowerCase() === "approved"
      ? "success"
      : (status || "").toLowerCase() === "rejected"
      ? "danger"
      : "secondary";

  return (
    <Card>
      <CardBody>
        <div className="text-center">
          <img
            src={image}
            alt={name}
            className="img-fluid avatar-xl img-thumbnail rounded-circle avatar-border"
            onError={(e) => (e.currentTarget.src = AVATARS[0])}
          />
          <h4 className="mt-3 fs-18 text-dark">{safeCap(name, "Unknown")}</h4>

          <div className="mb-1">
            <IconifyIcon icon="bi-person-fill" className="text-danger fs-14 me-1" />
            <strong>{safeCap(role, "Professional")}</strong>{" "}
            <Badge bg={statusVariant} className="ms-2">
              {safeCap(status, "Pending")}
            </Badge>
          </div>

          <div className="mb-1">
            <IconifyIcon icon="bx:location-plus" className="text-danger fs-14 me-1" />
            {address || "Unknown"}
          </div>

          <div className="mb-1">
            <IconifyIcon icon="bx:phone-call" className="text-success fs-14 me-1" />
            {phone || "N/A"}
          </div>

          {specialties?.length > 0 && (
            <div className="mt-2">
              {specialties.slice(0, 3).map((s, i) => (
                <Badge key={i} bg="light" text="dark" className="me-1">
                  {safeCap(s)}
                </Badge>
              ))}
            </div>
          )}

          <Link
            to={`/pages/profile/${id}`}
            className="btn btn-sm btn-outline-primary mt-3"
            style={{
              backgroundColor: "#CAAA93",
              color: "white",
              border: "none",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#B8957F")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#CAAA93")}
          >
            View Profile
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

const AllProfession = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_ALL, { headers: { "Content-Type": "application/json" } });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText} ${txt}`);
        }
        const json = await res.json();
        const arr = Array.isArray(json) ? json : json?.data || json?.professionals || [];
        if (!mounted) return;
        setItems(arr.map((p, i) => mapProfessional(p, i)));
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || "Error fetching professionals");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageBreadcrumb subName="Apps" title="All Professionals" />
      <PageMetaData title="All Professionals" />

      {loading && <div>Loading professionals...</div>}
      {error && <div className="text-danger">Error: {error}</div>}

      <Row className="row-cols-1 row-cols-md-2 row-cols-xl-4 gx-3">
        {items.map((it, idx) => (
          <Col key={it.id || idx} className="mb-3">
            <ContactCard item={it} />
          </Col>
        ))}
      </Row>

      {!loading && items.length === 0 && <div>No professionals found.</div>}
    </>
  );
};

export default AllProfession;
