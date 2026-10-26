import React, { useEffect, useState } from "react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, CardHeader, CardTitle } from "react-bootstrap";
import { FaBalanceScale, FaBolt, FaMoneyBillWave, FaStopwatch } from "react-icons/fa";

const PersonalInfo = ({ professional }) => {


  if (!professional)
    return (
      <Card>
        <CardHeader>
          <CardTitle as={"h5"}>Personal Info</CardTitle>
        </CardHeader>
        <CardBody>Loading...</CardBody>
      </Card>
    );

  const {
    name,
    email,
    phone,
    role,
    location = {},
    education = [],
    experience = [],
    languages = [],
    defaultRate,
    ratePerMinute,
    isInstantAvailable,
    minInstantMinutes,
    maxInstantMinutes,
    tier = "Standard", // default if missing
  } = professional;

  const totalYears = experience?.reduce((acc, e) => acc + (e.years || 0), 0);
  const formattedLocation = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle as={"h5"}>Personal Info</CardTitle>
      </CardHeader>
      <CardBody>
        <ul className="list-group">
          {/* BASIC DETAILS */}
          <li className="list-group-item border-0 border-bottom px-0 pt-0">
            <div className="d-flex flex-wrap align-items-center">
              <h5 className="me-2 fw-medium mb-0">Name :</h5>
              <span className="fs-14 text-muted">{name || "-"}</span>
            </div>
          </li>

          <li className="list-group-item border-0 border-bottom px-0">
            <div className="d-flex flex-wrap align-items-center">
              <h5 className="me-2 fw-medium mb-0">Email :</h5>
              <span className="fs-14 text-muted">{email || "-"}</span>
            </div>
          </li>

          <li className="list-group-item border-0 border-bottom px-0">
            <div className="d-flex flex-wrap align-items-center">
              <h5 className="me-2 mb-0 fw-medium">Phone :</h5>
              <span className="fs-14 text-muted">{phone || "-"}</span>
            </div>
          </li>

          <li className="list-group-item border-0 border-bottom px-0">
            <div className="d-flex flex-wrap align-items-start">
              <h5 className="me-2 mb-0 fw-medium">Location :</h5>
              <span className="fs-14 text-muted d-flex align-items-center gap-1">
                <IconifyIcon icon="mdi:map-marker-outline" className="text-warning fs-5" />
                {formattedLocation || "-"}
              </span>
            </div>
          </li>

          <li className="list-group-item border-0 border-bottom px-0">
            <div className="d-flex flex-wrap align-items-center">
              <h5 className="me-2 mb-0 fw-medium">Designation :</h5>
              <span className="fs-14 text-muted">
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : "-"}
              </span>
            </div>
          </li>



          {/* EDUCATION */}
          <li className="list-group-item border-0 border-bottom px-0">
            <div className="d-flex flex-wrap align-items-center mb-2">
              <h5 className="me-2 mb-0 fw-medium">Education :</h5>
              <span className="fs-14 text-muted">
                {education.length > 0 ? (
                  education.map((edu, index) => (
                    <div key={index} className="mb-1">
                      🎓 {edu.degree || "N/A"} — {edu.institution || "Unknown"}{" "}
                      {edu.year && <small>({edu.year})</small>}
                    </div>
                  ))
                ) : (
                  <span className="text-muted">No education details</span>
                )}
              </span>
            </div>
          </li>

          {/* EXPERIENCE SUMMARY */}
          <li className="list-group-item border-0 border-bottom px-0">
            <div className="d-flex flex-wrap align-items-center">
              <h5 className="me-2 mb-0 fw-medium">Experience :</h5>
              <span className="fs-14 text-muted">
                {totalYears ? `${totalYears} Years` : "-"}
              </span>
            </div>
          </li>



          {/* RATE DISPLAY */}
          <li className="list-group-item border-0 border-bottom px-0">
            <div className="d-flex flex-wrap align-items-center">
              <h5 className="me-2 mb-0 fw-medium">Service Rate :</h5>
              <span className="fs-14 fw-bold text-dark d-flex align-items-center gap-2">
                <FaMoneyBillWave className="text-success" />
                ₹ {defaultRate ? defaultRate.toLocaleString() : "1,100"} <span className="text-muted fw-normal">/ 30 min</span>
              </span>
            </div>
          </li>

          {/* LANGUAGES */}
          <li className="list-group-item border-0 px-0 pb-0">
            <div className="mt-3 pt-2 pb-2 px-3 bg-light rounded-3 border w-100">
              <div className="fw-semibold text-dark mb-2">Languages</div>
              <div className="d-flex flex-wrap gap-3">
                {languages.length > 0 ? (
                  languages.map((lang, i) => (
                    <span
                      key={i}
                      className="px-3 py-2 bg-white border rounded-pill shadow-sm text-dark fw-medium"
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">No languages listed</span>
                )}
              </div>
            </div>
          </li>
        </ul>
      </CardBody>
    </Card>
  );
};

export default PersonalInfo;
