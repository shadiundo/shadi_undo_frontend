import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageMetaData from "@/components/PageTitle";
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
const BASE_URL = import.meta.env.VITE_API_URL;
const LAWYERS_API = `${BASE_URL}/api/professionals/role/lawyer`;

const AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10];

function mapLawyer(lawyer, index) {
  const avatar = AVATARS[index % AVATARS.length];
  return {
    id: lawyer._id || lawyer.id || "",
    name: lawyer.name || `${lawyer.firstName || ""} ${lawyer.lastName || ""}`.trim() || "Unknown",
    role: lawyer.role || "Lawyer",
    address:
      lawyer.address ||
      (lawyer.location
        ? `${lawyer.location.city || ""}${lawyer.location.country ? " / " + lawyer.location.country : ""}`
        : lawyer.city || lawyer.country || "Unknown"),
    image: avatar,
    phone: lawyer.phone || lawyer.contactNumber || "N/A",
    specialties: lawyer.specialties || lawyer.specialization || [], // support both keys
    status: lawyer.status || "Pending",
  };
}

const ContactCard = ({ contact }) => {
  const { name, role, address, image, phone, id, specialties, status } = contact;
  const statusVariant = status === "approved" ? "success" : status === "rejected" ? "danger" : "secondary";

  return (
    <Card>
      <CardBody>
        <div className="text-center">
          <img src={image} alt={name} className="img-fluid avatar-xl img-thumbnail rounded-circle avatar-border" />
          <h4 className="mt-3 fs-18 text-dark">{name}</h4>

          <div className="mb-1">
            <IconifyIcon icon="bi-person-fill" className="text-danger fs-14 me-1" />
            <strong>{role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}</strong>
<Badge bg={statusVariant} className="ms-2">
  {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
</Badge>

          </div>

          <div className="mb-1">
            <IconifyIcon icon="bx:location-plus" className="text-danger fs-14 me-1" />
            {address}
          </div>

          <div className="mb-1">
            <IconifyIcon icon="bx:phone-call" className="text-success fs-14 me-1" />
            {phone}
          </div>

          {specialties?.length > 0 && (
            <div className="mt-2">
              {specialties.slice(0, 3).map((s, i) => (
                <Badge key={i} bg="light" text="dark" className="me-1">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          <Link to={`/pages/profile/${id}`} className="btn btn-sm btn-outline-primary mt-3" style={{
    backgroundColor: "#CAAA93",
    color: "white",
    border: "none",
    transition: "background-color 0.3s ease",
  }}
  onMouseEnter={(e) => (e.target.style.backgroundColor = "#B8957F")} // darker shade
  onMouseLeave={(e) => (e.target.style.backgroundColor = "#CAAA93")}>
            View Profile
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

const Lawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(LAWYERS_API, { headers: { "Content-Type": "application/json" } });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        const arr = Array.isArray(json) ? json : json?.data || [];
        if (!mounted) return;
        setLawyers(arr.map((l, i) => mapLawyer(l, i)));
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || "Error fetching lawyers");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <>
      <PageBreadcrumb subName="Apps" title="Lawyers" />
      <PageMetaData title="Lawyers" />

      {loading && <div>Loading lawyers...</div>}
      {error && <div className="text-danger">Error: {error}</div>}

      <Row className="row-cols-1 row-cols-md-2 row-cols-xl-4 gx-3">
        {lawyers.map((lawyer, idx) => (
          <Col key={lawyer.id || idx} className="mb-3">
            <ContactCard contact={lawyer} />
          </Col>
        ))}
      </Row>

      {!loading && lawyers.length === 0 && <div>No lawyers found.</div>}
    </>
  );
};

export default Lawyers;
