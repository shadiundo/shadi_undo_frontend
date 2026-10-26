import React, { useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Button,
  Badge
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

// API base (Vite env or fallback)
const API_BASE = (import.meta.env.VITE_API_BASE || "https://shadi-undo-backend.onrender.com").replace(/\/$/, "");

/** Build absolute URL and sanitize */
function ensureAbsoluteUrl(maybeUrl) {
  if (!maybeUrl) return null;
  let s = String(maybeUrl).trim();
  s = s.replace(/^['"]+|['"]+$/g, ""); // strip wrapping quotes

  // If already absolute
  try {
    const u = new URL(s);
    return u.toString();
  } catch (e) { }

  // If relative uploads path (legacy)
  if (s.startsWith("/uploads/") || s.startsWith("uploads/")) {
    const filename = s.split("/").pop();
    if (!filename) return null;
    return `${API_BASE}/api/professionals/files/${encodeURIComponent(filename)}`;
  }

  // If looks like just a filename
  if (!s.includes("/") && s.match(/^[\w\-.]+$/)) {
    return `${API_BASE}/api/professionals/files/${encodeURIComponent(s)}`;
  }

  // Generic relative path
  const pathStr = s.startsWith("/") ? s : `/${s}`;
  return `${API_BASE}${pathStr}`;
}

const FileCard = ({ title, subTitle, date, fileUrl, type }) => {
  const absUrl = ensureAbsoluteUrl(fileUrl);
  const canOpen = Boolean(absUrl);

  // Determine icon and color based on file type or context
  let icon = "iconamoon:file-document-duotone";
  let colorClass = "text-primary";
  let bgClass = "bg-primary-subtle";

  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("certificate") || type === "certificates") {
    icon = "iconamoon:certificate-badge-duotone";
    colorClass = "text-warning";
    bgClass = "bg-warning-subtle";
  } else if (lowerTitle.includes("degree") || type === "education") {
    icon = "iconamoon:profile-circle-duotone";
    colorClass = "text-info";
    bgClass = "bg-info-subtle";
  } else if (lowerTitle.includes("id") || lowerTitle.includes("proof")) {
    icon = "iconamoon:id-card-duotone";
    colorClass = "text-success";
    bgClass = "bg-success-subtle";
  }

  return (
    <Col xs={12} sm={6} xl={12} className="d-flex">
      <div className="card w-100 shadow-sm border border-light-subtle h-100 file-card-hover" style={{ transition: "all 0.2s ease" }}>
        <div className="card-body p-3 d-flex align-items-center gap-3">
          <div className={`rounded-3 p-3 flex-shrink-0 ${bgClass} ${colorClass}`}>
            <IconifyIcon icon={icon} className="fs-24" />
          </div>

          <div className="flex-grow-1 min-w-0">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <h6 className="fw-semibold text-dark mb-0 text-truncate w-100" title={title}>{title}</h6>
              {date && (
                <small className="text-muted ms-2 flex-shrink-0" style={{ fontSize: '0.75rem' }}>
                  {new Date(date).toLocaleDateString()}
                </small>
              )}
            </div>
            {subTitle && <p className="text-muted fs-13 mb-2 text-truncate">{subTitle}</p>}

            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none"
              disabled={!canOpen}
              onClick={() => canOpen && window.open(absUrl, "_blank", "noopener,noreferrer")}
            >
              <div className="d-flex align-items-center gap-1">
                <IconifyIcon icon="iconamoon:eye-light" className="fs-16" />
                <span className="fw-medium">View Document</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </Col>
  );
};

const Activity = ({ professional }) => {
  const allDocuments = useMemo(() => {
    if (!professional) return [];

    const docs = [];

    // Helper to push docs
    const addDoc = (fileUrl, title, subTitle, date, type) => {
      if (fileUrl) {
        docs.push({
          fileUrl,
          title: title || "Untitled Document",
          subTitle,
          date: date || professional.createdAt,
          type
        });
      }
    };

    // 1. Main Documents
    (professional.documents || []).forEach(d => {
      addDoc(d.fileUrl || d.url, d.type || "Document", d.note, d.uploadedAt, "documents");
    });

    // 2. Additional Documents
    (professional.additionalDocuments || []).forEach(d => {
      addDoc(d.fileUrl, d.title, d.description, d.createdAt, "additional");
    });

    // 3. Certificates
    (professional.certificates || []).forEach(c => {
      addDoc(c.fileUrl, c.title || "Certificate", c.issuedBy, c.year || c.issuedAt, "certificates");
    });

    // 4. Education (if file attached)
    (professional.education || []).forEach(e => {
      addDoc(e.fileUrl, e.degree, e.institution, e.year, "education");
    });

    // 5. Experience (if file attached)
    (professional.experience || []).forEach(e => {
      addDoc(e.fileUrl, e.role ? `${e.role} @ ${e.firm}` : "Experience Letter", e.firm, e.years, "experience");
    });

    // 6. Attachments
    (professional.attachments || []).forEach(a => {
      addDoc(a.fileUrl || a.url, a.title || "Attachment", a.note, a.uploadedAt, "attachments");
    });

    return docs;
  }, [professional]);

  if (!professional) return null;

  return (
    <Card id="documents-section" className="border-0 shadow-none bg-transparent">
      <div className="d-flex align-items-center justify-content-between mb-3 px-1">
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: "4px", height: "24px", backgroundColor: "#EA5455", borderRadius: "2px" }}></div>
          <h4 className="mb-0 fw-bold text-dark">Documents</h4>
          <span className="badge bg-danger-subtle text-danger rounded-pill px-2">
            {allDocuments.length}
          </span>
        </div>
      </div>

      {allDocuments.length === 0 ? (
        <Card className="shadow-sm border-0">
          <CardBody className="text-center py-5">
            <div className="avatar-lg bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3">
              <IconifyIcon icon="iconamoon:file-remove-light" className="fs-32 text-muted" />
            </div>
            <h5 className="text-muted">No documents found</h5>
          </CardBody>
        </Card>
      ) : (
        <Row className="g-3">
          {allDocuments.map((doc, idx) => (
            <FileCard key={idx} {...doc} />
          ))}
        </Row>
      )}

      <style>{`
          .file-card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 .5rem 1.5rem rgba(0,0,0,.08) !important;
            border-color: #EA5455 !important;
          }
        `}</style>
    </Card>
  );
};

export default Activity;
