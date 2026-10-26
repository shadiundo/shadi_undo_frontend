import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Spinner,
} from "react-bootstrap";

const PAGE_SIZE = 10;
const MAX_VISIBLE_PAGES = 5; // how many page numbers to show

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------- FETCH USERS ----------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "https://shadi-undo-backend.onrender.com/api/auth/clients"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data.clients || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [users, currentPage]);

  // page numbers with ...
  const paginationRange = useMemo(() => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);

    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);

    return pages;
  }, [totalPages, currentPage]);

  // ---------------- RENDER ----------------
  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>New Users</CardTitle>
        <Button variant="light" size="sm">
          View All
        </Button>
      </CardHeader>

      <CardBody className="pb-2">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" /> Loading users...
          </div>
        ) : error ? (
          <div className="text-danger text-center py-3">{error}</div>
        ) : paginatedUsers.length === 0 ? (
          <div className="text-center text-muted py-3">No users found.</div>
        ) : (
          <>
            {/* USERS TABLE */}
            <div className="table-responsive">
              <table className="table table-hover mb-0 table-centered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, idx) => (
                    <tr key={user._id || idx}>
                      <td>
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td>
                        <Link
                          to="/pages/profile"
                          className="d-flex align-items-center text-decoration-none"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              user.name
                            )}`}
                            alt="avatar"
                            className="img-fluid avatar-xs rounded-circle"
                          />
                          <span className="ms-2">
                            {user.name.charAt(0).toUpperCase() +
                              user.name.slice(1)}
                          </span>
                        </Link>
                      </td>
                      <td>{user.email || "—"}</td>
                      <td>{user.phone || "—"}</td>
                      <td>
                        <span className="badge bg-success">
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-1 mt-3 flex-wrap">
                <Button
                  size="sm"
                  variant="soft-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Prev
                </Button>

                {paginationRange.map((p, i) =>
                  p === "..." ? (
                    <span key={i} className="px-2 text-muted">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={p}
                      size="sm"
                      variant={
                        currentPage === p
                          ? "primary"
                          : "soft-secondary"
                      }
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </Button>
                  )
                )}

                <Button
                  size="sm"
                  variant="soft-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default Users;
