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

const COUNSELLORS_API = `${BASE_URL}/api/professionals/role/counsellor`;
const AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10];

function mapCounsellor(c, index) {
  const avatar = AVATARS[index % AVATARS.length];
  return {
    id: c._id || c.id || "",
    name: c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unknown",
    role: c.role || "Counsellor",
    address:
      c.address ||
      (c.location ? `${c.location.city || ""}${c.location.country ? " / " + c.location.country : ""}` : c.city || c.country || "Unknown"),
    image: avatar,
    phone: c.phone || c.contactNumber || "N/A",
    specialties: c.specialties || c.specialization || [],
    status: c.status || "pending",
  };
}

const ContactCard = ({ contact }) => {
  const { name, role, address, image, phone, id, specialties, status } = contact;
  const statusVariant = status === "approved" ? "success" : status === "rejected" ? "danger" : "secondary";

  // Utility to capitalize the first letter
  const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  return (
    <Card>
      <CardBody>
        <div className="text-center">
          <img
            src={image}
            alt={name}
            className="img-fluid avatar-xl img-thumbnail rounded-circle avatar-border"
          />
          <h4 className="mt-3 fs-18 text-dark">{name}</h4>

          <div className="mb-1">
            <IconifyIcon icon="bi-person-fill" className="text-danger fs-14 me-1" />
            <strong>{capitalize(role)}</strong>
            <Badge bg={statusVariant} className="ms-2">
              {capitalize(status)}
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
                  {capitalize(s)}
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


const Counsellor = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(COUNSELLORS_API, { headers: { "Content-Type": "application/json" } });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        const arr = Array.isArray(json) ? json : json?.data || [];
        if (!mounted) return;
        setCounsellors(arr.map((c, i) => mapCounsellor(c, i)));
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || "Error fetching counsellors");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <>
      <PageBreadcrumb subName="Apps" title="Counsellors" />
      <PageMetaData title="Counsellors" />

      {loading && <div>Loading counsellors...</div>}
      {error && <div className="text-danger">Error: {error}</div>}

      <Row className="row-cols-1 row-cols-md-2 row-cols-xl-4 gx-3">
        {counsellors.map((c, idx) => (
          <Col key={c.id || idx} className="mb-3">
            <ContactCard contact={c} />
          </Col>
        ))}
      </Row>

      {!loading && counsellors.length === 0 && <div>No counsellors found.</div>}
    </>
  );
};

export default Counsellor;
