import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, CardTitle } from "react-bootstrap";
import axios from "axios";
import { currency } from "@/context/constants";

const RecentAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found in localStorage — please log in first.");
        setAppointments([]);
        setLoading(false);
        return;
      }

      const res = await axios.get("https://shadi-undo-backend.onrender.com/api/appointments/admin/recent", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setAppointments(res.data.data || []);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Error fetching recent appointments:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentAppointments();
    const interval = setInterval(fetchRecentAppointments, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);


  const capitalize = (str) =>
    typeof str === "string" && str.length > 0
      ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      : "";

  //  Helper: choose badge color based on status
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "ongoing":
        return "info";
      case "confirmed":
        return "primary";
      case "requested":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>Recent Appointments</CardTitle>
        <Button
          variant="light"
          size="sm"
          onClick={() => (window.location.href = "recent/appointments")}
        >
          View All
        </Button>
      </CardHeader>

      <CardBody>
        {loading ? (
          <div className="text-center py-4 text-muted">Loading...</div>
        ) : (
          <>
           
            <style>
              {`
                .table-responsive {
                  overflow-x: auto;
                  -ms-overflow-style: none; /* IE and Edge */
                  scrollbar-width: none; /* Firefox */
                }
                .table-responsive::-webkit-scrollbar {
                  display: none; /* Chrome, Safari, Opera */
                }
              `}
            </style>

            <div className="table-responsive">
              <table className="table table-hover mb-0 table-centered">
                <thead>
                  <tr>
                    <th className="py-1">User</th>
                    <th className="py-1">Professional</th>
                    <th className="py-1">Role</th>
                    <th className="py-1">Date</th>
                    <th className="py-1">Amount</th>
                    <th className="py-1">Status</th>
                    <th className="py-1">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.slice(0, 5).map((appt, idx) => (
                      <tr key={idx}>
                        <td>{appt.user}</td>
                        <td>{appt.professional}</td>
                        <td>{capitalize(appt.role)}</td>
                        <td>{new Date(appt.date).toLocaleString()}</td>
                        <td>
                          {currency}
                          {appt.amount}
                        </td>
                        <td>
                          <span className={`badge bg-${getStatusBadge(appt.status)}`}>
                            {capitalize(appt.status)}
                          </span>
                        </td>
                        <td
                          style={{
                            maxWidth: 320,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {appt.notes ?? "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-3">
                        No recent appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentAppointments;
