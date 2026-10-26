import { Link } from 'react-router-dom';
import { Button, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const NotificationItem = ({
  from,
  content,
  icon,
  createdAt
}) => {
  return <DropdownItem className="py-3 border-bottom text-wrap">
    <div className="d-flex">
      <div className="flex-shrink-0">
        {icon ? <img src={icon} className="img-fluid me-2 avatar-sm rounded-circle" alt="avatar" style={{ objectFit: "cover" }} /> : <div className="avatar-sm me-2">
          <span className="avatar-title bg-soft-info text-info fs-20 rounded-circle">{from?.charAt(0).toUpperCase()}</span>
        </div>}
      </div>
      <div className="flex-grow-1">
        <p className="mb-0 fw-semibold">{from}</p>
        <p className="mb-0 text-wrap">{content}</p>
        {createdAt && <small className="text-muted">{new Date(createdAt).toLocaleDateString()} {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>}
      </div>
    </div>
  </DropdownItem>;
};

const Notifications = () => {
  const [notificationList, setNotificationList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize lastCleared from localStorage or default to a very old date
  const [lastCleared, setLastCleared] = useState(() => {
    const stored = localStorage.getItem('notificationsLastCleared');
    return stored ? new Date(stored) : new Date(0); // Epoch if never cleared
  });

  const BASE_URL = import.meta.env.VITE_API_URL || "https://shadi-undo-backend.onrender.com";

  const fetchData = useCallback(async () => {
    try {
      // Don't set loading to true on subsequent polls to avoid UI flickering
      // Only set it on initial load if list is empty
      if (notificationList.length === 0 && loading) setLoading(true);

      // Fetch Users
      const usersReq = axios.get(`${BASE_URL}/api/auth/clients`).catch(() => ({ data: { clients: [] } }));

      // Fetch Professionals
      const roles = ['lawyer', 'mediator', 'counsellor', 'therapist'];
      const profReqs = roles.map(role =>
        axios.get(`${BASE_URL}/api/professionals/role/${role}`).catch(() => ({ data: [] }))
      );

      const [usersRes, ...profsRes] = await Promise.all([usersReq, ...profReqs]);

      let allNotifs = [];

      // Process Users
      if (usersRes.data?.clients) {
        const users = usersRes.data.clients.map(user => ({
          from: user.name || "New User",
          content: "New User Registered",
          icon: null,
          createdAt: user.createdAt,
          type: 'user'
        }));
        allNotifs = [...allNotifs, ...users];
      }

      // Process Professionals
      profsRes.forEach((res, index) => {
        const role = roles[index];
        const profs = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        if (Array.isArray(profs)) {
          const profNotifs = profs.map(p => ({
            from: p.name || `New ${role}`,
            content: `New ${role.charAt(0).toUpperCase() + role.slice(1)} Registered`,
            icon: p.image || null,
            createdAt: p.createdAt,
            type: 'professional'
          }));
          allNotifs = [...allNotifs, ...profNotifs];
        }
      });

      // Filter out notifications older than lastCleared
      const validNotifs = allNotifs.filter(n => new Date(n.createdAt) > lastCleared);

      // Sort by newest first
      validNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setTotalCount(validNotifs.length);

      // Take top 10 (or more if needed, but 10 is standard for dropdowns)
      setNotificationList(validNotifs.slice(0, 10));

    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, [lastCleared, BASE_URL]); // dependency on lastCleared ensures refetch/filter if cleared

  useEffect(() => {
    fetchData();

    // Poll every 30 seconds
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleClearAll = () => {
    const now = new Date();
    localStorage.setItem('notificationsLastCleared', now.toISOString());
    setLastCleared(now);
    // The useEffect dependent on lastCleared/fetchData will re-run or we can just clear the list immediately
    setNotificationList([]);
    setTotalCount(0);
  };

  return <Dropdown className="topbar-item" align={'end'}>
    <DropdownToggle as="button" className="content-none topbar-button position-relative" aria-haspopup="true">
      <IconifyIcon icon="iconamoon:notification-duotone" className="fs-24 align-middle" />
      <span className="position-absolute topbar-badge fs-10 translate-middle badge bg-danger rounded-pill">
        {totalCount > 99 ? '99+' : totalCount}
        <span className="visually-hidden">unread messages</span>
      </span>
    </DropdownToggle>
    <DropdownMenu className="py-0 dropdown-lg">
      <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
        <Row className="align-items-center">
          <Col>
            <h6 className="m-0 fs-16 fw-semibold"> Notifications</h6>
          </Col>
          <Col xs="auto">
            <Link to="#" onClick={(e) => { e.preventDefault(); handleClearAll(); }} className="text-dark text-decoration-underline">
              <small>Clear All</small>
            </Link>
          </Col>
        </Row>
      </div>
      <SimplebarReactClient style={{
        maxHeight: 280
      }}>
        {loading ? (
          <div className="text-center py-3"><Spinner size="sm" /></div>
        ) : (
          notificationList.length > 0 ? (
            notificationList.map((notification, idx) => <NotificationItem key={idx} {...notification} />)
          ) : (
            <div className="text-center py-3 text-muted">No new notifications</div>
          )
        )}
      </SimplebarReactClient>
      <div className="text-center py-3">
        <Button size="sm" variant="primary" className="icons-center">
          View All Notification
          <IconifyIcon icon="bx:right-arrow-alt" className="ms-2" />
        </Button>
      </div>
    </DropdownMenu>
  </Dropdown>;
};
export default Notifications;