// Profile.jsx
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageMetaData from "@/components/PageTitle";

import AboutCard from "./components/AboutCard";
import Activity from "./components/Activity";
import Followers from "./components/Followers";
import Messages from "./components/Messages";
import PersonalInfo from "./components/PersonalInfo";
// import Projects from "./components/Projects";
import Skill from "./components/Skill";

import ProfessionalRecentAppointments from "./components/Projects";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/professionals`;
const API_SEARCH = `${API_BASE}/search`; // e.g. /search?id=...
const API_ALL = `${API_BASE}/getAllProfessionals`;

const Profile = () => {
  const { id } = useParams();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No id provided");
      setProfessional(null);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      setLoading(true);
      setError(null);
      setProfessional(null);

      try {
        // 1) Try direct GET /api/professionals/:id (best option if backend supports it)
        let res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { signal });

        if (res.ok) {
          const json = await res.json();
          // Server might return object directly or envelope. Normalize:
          // If it's an envelope, try common fields; otherwise assume it's the object itself.
          let prof = null;
          if (json && typeof json === "object") {
            if (json._id || json.id) {
              prof = json;
            } else if (json.data) {
              // data could be object or array
              prof = Array.isArray(json.data)
                ? json.data.find((p) => p._id === id || p.id === id)
                : json.data;
            } else if (json.professionals && Array.isArray(json.professionals)) {
              prof = json.professionals.find((p) => p._id === id || p.id === id);
            }
          }
          if (prof) {
            setProfessional(prof);
            setError(null);
            setLoading(false);
            return;
          }
          // if we get here, the direct endpoint returned something but we couldn't find the profile
        }

        // 2) Fallback: try search endpoint (example: /search?id=...)
        try {
          const searchRes = await fetch(`${API_SEARCH}?id=${encodeURIComponent(id)}`, { signal });
          if (searchRes.ok) {
            const searchJson = await searchRes.json();
            // server might return { success:true, data: [...] } or { data: {...} } or a single object
            let found = null;
            if (searchJson == null) {
              // nothing
            } else if (searchJson._id || searchJson.id) {
              found = searchJson;
            } else if (Array.isArray(searchJson.data)) {
              found = searchJson.data.find((p) => p._id === id || p.id === id);
            } else if (searchJson.data && typeof searchJson.data === "object") {
              found = searchJson.data;
            } else if (Array.isArray(searchJson)) {
              found = searchJson.find((p) => p._id === id || p.id === id);
            } else if (searchJson.professionals && Array.isArray(searchJson.professionals)) {
              found = searchJson.professionals.find((p) => p._id === id || p.id === id);
            }

            if (found) {
              setProfessional(found);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          // ignore and try next fallback
          if (err.name === "AbortError") throw err;
          console.warn("search fallback failed:", err);
        }

        // 3) Final fallback: fetch all and find by id (heavier, but robust if no search endpoint)
        try {
          const allRes = await fetch(API_ALL, { signal });
          if (!allRes.ok) throw new Error(`Failed to fetch all professionals: ${allRes.status}`);
          const allJson = await allRes.json();
          // Normalize to array:
          let arr = [];
          if (Array.isArray(allJson)) {
            arr = allJson;
          } else if (Array.isArray(allJson.data)) {
            arr = allJson.data;
          } else if (Array.isArray(allJson.professionals)) {
            arr = allJson.professionals;
          } else {
            // maybe envelope with different shape — try common keys
            arr = allJson.data || allJson.professionals || [];
          }

          const found = arr.find((p) => p._id === id || p.id === id);
          if (found) {
            setProfessional(found);
          } else {
            setError("Professional not found");
            setProfessional(null);
          }
        } catch (err) {
          if (err.name === "AbortError") throw err;
          console.error(err);
          setError(err.message || "Failed to load profile");
          setProfessional(null);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // ignore abort
          return;
        }
        console.error(err);
        setError(err.message || "Failed to load profile");
        setProfessional(null);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [id]);

  return (
    <>
      <PageBreadcrumb subName="Pages"  />
<PageMetaData title={professional ? professional.name : "Profile"} />

      {loading && <div>Loading profile...</div>}
      {error && !loading && <div className="text-danger mb-3">{error}</div>}

      {!loading && !error && professional && (
        <Row>
          <Col xxl={4}>
            <Row>
              <Col xs={12}>
               <AboutCard
  professional={professional}
  loading={loading}
  onStatusChange={(updated) => setProfessional(updated)}
/>

                <Skill professional={professional} />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Activity professional={professional} />
              </Col>
            </Row>
          </Col>

          <Col xxl={8}>
            <Row>
              <Col lg={6}>
                <PersonalInfo professional={professional} />
              </Col>
              <Col lg={6}>
                <Followers professional={professional} />
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <ProfessionalRecentAppointments professional={professional} />
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <Messages professional={professional} />
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Profile;
