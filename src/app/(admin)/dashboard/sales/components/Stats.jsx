// src/components/Stats.jsx
import React, { useEffect, useState } from "react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, Col, Row, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const StatCard = ({ stat }) => {
  const { amount, change, changeColor, badgeIcon, icon, iconColor, title, link } = stat;

  return (
    <Link to={link || "#"} style={{ textDecoration: "none", color: "inherit" }}>
      <Card className="h-100" role="button">
        <CardBody className="overflow-hidden position-relative">
          <IconifyIcon icon={icon} className={`fs-36 text-${iconColor}`} />
          <h3 className="mb-0 fw-bold mt-3 mb-1">{amount}</h3>
          <p className="text-muted">{title}</p>
          {change !== undefined && (
            <span className={`badge fs-12 badge-soft-${changeColor}`}>{change}%</span>
          )}
          {badgeIcon && <IconifyIcon icon={badgeIcon} className="widget-icon" />}
        </CardBody>
      </Card>
    </Link>
  );
};

const Stats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = "https://shaadi-undo-backend.onrender.com/api/professionals/stats/123";

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }

        const data = await res.json();
        const mapped = [
          {
            title: "Total Professionals",
            amount: data.totalProfessionals ?? 0,
            change: 8.72, 
            changeColor: "success",
            badgeIcon: "ic:round-emoji-events", 
            icon: "ic:baseline-assignment-ind", 
            iconColor: "warning",
            link: "/apps/professionals",
          },
          {
            title: "Total Lawyers",
            amount: data.lawyers ?? 0,
            change: 8.72,
            changeColor: "success",
            badgeIcon: "ic:outline-gavel",
            icon: "ic:baseline-people",
            iconColor: "info",
            link: "/apps/lawyers",
          },
          {
            title: "Total Mediators",
            amount: data.mediators ?? 0,
            change: 3.28,
            changeColor: "danger",
            badgeIcon: "ic:outline-people",
            icon: "ic:baseline-people",
            iconColor: "success",
            link: "/apps/mediators",
          },
          {
            title: "Total Therapists",
            amount: data.therapists ?? 0,
            change: 10.58,
            changeColor: "success",
            badgeIcon: "ic:outline-healing",
            icon: "ic:baseline-people",
            iconColor: "danger",
            link: "/apps/therapists",
          },
          {
            title: "Total Counsellors",
            amount: data.counsellors ?? 0,
            change: 5.69,
            changeColor: "danger",
            badgeIcon: "ic:outline-record-voice-over",
            icon: "ic:baseline-people",
            iconColor: "primary",
            link: "/apps/counsellors",
          },
        ];

        if (mounted) {
          setStats(mapped);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load stats");
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        Failed to load stats: {error}
      </Alert>
    );
  }

  return (
    <Row>
      {stats.map((stat, idx) => (
        <Col lg={4} md={6} className="col-xl" key={idx}>
          <StatCard stat={stat} />
        </Col>
      ))}
    </Row>
  );
};

export default Stats;
