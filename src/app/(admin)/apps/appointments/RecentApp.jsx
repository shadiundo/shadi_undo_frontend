import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardBody, CardHeader, CardTitle } from "react-bootstrap";
import { currency } from "@/context/constants";

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://shaadi-undo-backend.onrender.com/api/appointments/admin/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllAppointments();
  }, []);

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "success";
      case "ongoing": return "info";
      case "confirmed": return "primary";
      case "requested": return "warning";
      case "rejected": return "danger";
      default: return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Appointments</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="text-center py-4 text-muted">Loading...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 table-centered">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Professional</th>
                  <th>Role</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appt, idx) => (
                    <tr key={idx}>
                      <td>{appt.user}</td>
                      <td>{appt.professional}</td>
                      <td>{capitalize(appt.role)}</td>
                      <td>{new Date(appt.date).toLocaleString()}</td>
                      <td>{currency}{appt.amount}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(appt.status)}`}>
                          {capitalize(appt.status)}
                        </span>
                      </td>
                      <td>{appt.notes || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-3">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AllAppointments;
