import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Spinner,
} from "react-bootstrap";
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

function avatarForId(id) {
  if (!id) return AVATARS[0];
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return AVATARS[sum % AVATARS.length];
}

function formatDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

const Accounts = ({ limit = 8, pollIntervalMs = 15000 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mounted = useRef(false);
  const navigate = useNavigate();

  const fetchRecent = async () => {
    try {
      setError("");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/professionals/getAllProfessionals`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json.professionals || [];
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const top = list.slice(0, limit);
      if (mounted.current) setItems(top);
      setLoading(false);
    } catch (err) {
      console.error("Accounts fetch error:", err);
      if (mounted.current) {
        setError(err.message || "Failed to fetch");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    fetchRecent();
    const id = setInterval(fetchRecent, pollIntervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>New Accounts</CardTitle>

        {/*  View All button opens /apps/contacts */}
        <Button
          variant="light"
          size="sm"
          onClick={() => navigate("/apps/professionals")}
        >
          View All
        </Button>
      </CardHeader>

      <CardBody className="pb-1">
        {loading ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <div className="text-danger p-3">Error: {error}</div>
        ) : items.length === 0 ? (
          <div className="text-muted p-3">No new accounts</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 table-centered">
              <thead>
                <tr>
                  <th className="py-1">ID</th>
                  <th className="py-1">Date</th>
                  <th className="py-1">Name</th>
                  <th className="py-1">Status</th>
                  <th className="py-1">Profession</th>
                </tr>
              </thead>
              <tbody>
                {items.map((acct, idx) => {
                  const avatar = avatarForId(acct._id);
                  const name = acct.name || acct.email || "Unknown";
                  const date = acct.createdAt;
                  const status = acct.status || "pending";
                  const profession = acct.role || "-";
                    return (() => {
                    const professionText =
                      profession && profession !== "-"
                      ? profession.charAt(0).toUpperCase() + profession.slice(1)
                      : "-";

                    return (
                      <tr key={acct._id || idx}>
                      <td><small>{(acct._id || "").slice(0, 8)}</small></td>
                      <td><small>{formatDate(date)}</small></td>
                      <td>
                        <Link to={`/pages/profile/${acct._id}`} className="d-flex align-items-center">
                        <img src={avatar} alt="avatar" className="img-fluid avatar-xs rounded-circle" />
                        <span className="align-middle ms-1">{name}</span>
                        </Link>
                      </td>
                      <td>
                        <span
                        className={`badge badge-soft-${
                          status === "approved"
                          ? "success"
                          : status === "rejected"
                          ? "danger"
                          : "warning"
                        }`}
                        >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td>{professionText}</td>
                      </tr>
                    );
                    })();
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default Accounts;
