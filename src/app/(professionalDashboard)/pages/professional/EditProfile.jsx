// src/pages/professional/EditProfile.jsx
import React, { useEffect, useState, useRef } from "react";
import { Button, Form, Row, Col, Alert, Image, Spinner, Card, Container, ProgressBar } from "react-bootstrap";
import { FaLock, FaMoneyBillWave, FaClock, FaPlus, FaTrash, FaRegCalendarAlt } from "react-icons/fa";

const API_BASE = "https://shadi-undo-backend.onrender.com";

const STATUS_COLORS = {
  completed: "#28a745",   // green
  pending: "#e9ecef",     // light gray
  dot: "#adb5bd",
};

const SECTION_COLORS = {
  "Basic Info": "#0d6efd",      // blue
  "Professional": "#20c997",    // teal
  "Tier & Rate": "#6f42c1",     // purple
  "Documents": "#fd7e14",       // orange
  "Availability": "#198754",    // green
};

const getIntensity = (percentage) => {
  if (percentage >= 80) return 1;
  if (percentage >= 60) return 0.85;
  if (percentage >= 40) return 0.7;
  if (percentage >= 20) return 0.55;
  return 0.35;
};


const getProgressColor = (percentage) => {
  if (percentage >= 100) return "#28a745"; // green
  if (percentage >= 80) return "#20c997";  // teal
  if (percentage >= 60) return "#0d6efd";  // blue
  if (percentage >= 40) return "#fd7e14";  // orange
  if (percentage >= 20) return "#6f42c1";  // purple
  return "#adb5bd"; // grey (very low / start)
};



// Tier System Constants
const ROLE_TIER_RATES = {
  lawyer: {
    A: { rate: 1100, profile: "Early-practice lawyer / District court (non-metro)." },
    B: { rate: 1100, profile: "District Court lawyer (5–7 yrs) in metro areas." },
    C: { rate: 1100, profile: "High Court lawyer / firm partner (7–10 yrs)." },
    D: { rate: 1100, profile: "Senior practitioner / High Court specialist." },
    E: { rate: 1100, profile: "Senior Advocate / Supreme Court / 20+ yrs." },
  },
  mediator: {
    A: { rate: 1100, profile: "Newly certified mediator." },
    B: { rate: 1100, profile: "Court-empanelled mediator (3–5 yrs)." },
    C: { rate: 1100, profile: "Senior mediator (8–10 yrs)." },
    D: { rate: 1100, profile: "Expert mediator." },
  },
  counsellor: {
    A: { rate: 1100, profile: "Junior counsellor." },
    B: { rate: 1100, profile: "Certified counsellor (3–5 yrs)." },
    C: { rate: 1100, profile: "Senior counsellor." },
    D: { rate: 1100, profile: "Clinical psychologist." },
  },
  therapist: {
    A: { rate: 1100, profile: "Junior therapist." },
    B: { rate: 1100, profile: "Certified therapist (3–5 yrs)." },
    C: { rate: 1100, profile: "Senior therapist." },
    D: { rate: 1100, profile: "Clinical psychologist." },
  },
};

const deriveTierFromExperience = (years) => {
  if (years >= 20) return "E";
  if (years >= 10) return "D";
  if (years >= 7) return "C";
  if (years >= 3) return "B";
  return "A";
};

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [selectedTier, setSelectedTier] = useState("A");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "lawyer",
    tier: "A",
    overview: "",
    yearsExperience: 0,
    defaultRate: 0,
    languages: [],
    specialties: [],
    location: {
      country: "",
      state: "",
      city: "",
      locality: ""
    },
    education: [],
    certificates: [],
    experience: [],
    documents: [],
    additionalDocuments: [],
    availability: [],
    isInstantAvailable: false,
    minInstantMinutes: 30,
    maxInstantMinutes: 120
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [currentSpecialty, setCurrentSpecialty] = useState("");

  // Parse JWT token to get user info
  const parseJwt = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error parsing token:", e);
      return null;
    }
  };

  // Get token and user ID
  const getAuthInfo = () => {
    const token = localStorage.getItem("token");
    if (!token) return { token: null, userId: null };

    const decoded = parseJwt(token);
    console.log("Decoded token:", decoded);

    return {
      token,
      userId: decoded?.id || decoded?.userId || decoded?.user?._id || decoded?._id
    };
  };

  // Auto-update tier and rate based on experience
  useEffect(() => {
    if (!form.role) return;

    const derivedTier = deriveTierFromExperience(form.yearsExperience || 0);
    const tierData = ROLE_TIER_RATES[form.role]?.[derivedTier];

    if (!tierData) return;

    setSelectedTier(derivedTier);
    setForm(prev => ({
      ...prev,
      tier: derivedTier,
      defaultRate: 1100 // Enforce 1100
    }));
  }, [form.yearsExperience, form.role]);

  // Helper functions for availability
  const addAvailabilitySlot = (day) => {
    setForm(prev => {
      const availability = [...prev.availability];
      const dayIndex = availability.findIndex(d => d.dayOfWeek === day);

      if (dayIndex === -1) {
        availability.push({
          dayOfWeek: day,
          slots: [{ startTime: "", endTime: "", mode: "audio" }]
        });
      } else {
        availability[dayIndex].slots.push({ startTime: "", endTime: "", mode: "audio" });
      }

      return { ...prev, availability };
    });
  };

  const updateAvailability = (day, idx, field, value) => {
    setForm(prev => {
      const availability = [...prev.availability];
      const dayIndex = availability.findIndex(d => d.dayOfWeek === day);
      if (availability[dayIndex] && availability[dayIndex].slots[idx]) {
        availability[dayIndex].slots[idx][field] = value;
      }
      return { ...prev, availability };
    });
  };

  const removeAvailabilitySlot = (day, idx) => {
    setForm(prev => {
      const availability = [...prev.availability];
      const dayIndex = availability.findIndex(d => d.dayOfWeek === day);
      if (availability[dayIndex]) {
        availability[dayIndex].slots.splice(idx, 1);
        if (availability[dayIndex].slots.length === 0) {
          availability.splice(dayIndex, 1);
        }
      }
      return { ...prev, availability };
    });
  };

  // Helper function for documents
  const addDocument = () => {
    setForm(prev => ({
      ...prev,
      documents: [...prev.documents, { type: "", fileUrl: "" }]
    }));
  };

  const updateDocument = (index, field, value) => {
    setForm(prev => {
      const newDocuments = [...prev.documents];
      newDocuments[index] = { ...newDocuments[index], [field]: value };
      return { ...prev, documents: newDocuments };
    });
  };

  const removeDocument = (index) => {
    setForm(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Helper function for additional documents
  const addAdditionalDocument = () => {
    setForm(prev => ({
      ...prev,
      additionalDocuments: [...prev.additionalDocuments, { title: "", description: "", fileUrl: "" }]
    }));
  };

  const updateAdditionalDocument = (index, field, value) => {
    setForm(prev => {
      const newAdditionalDocuments = [...prev.additionalDocuments];
      newAdditionalDocuments[index] = { ...newAdditionalDocuments[index], [field]: value };
      return { ...prev, additionalDocuments: newAdditionalDocuments };
    });
  };

  const removeAdditionalDocument = (index) => {
    setForm(prev => ({
      ...prev,
      additionalDocuments: prev.additionalDocuments.filter((_, i) => i !== index)
    }));
  };

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const authInfo = getAuthInfo();
        console.log("Auth info:", authInfo);

        if (!authInfo.token) {
          throw new Error("No authentication token found. Please login.");
        }

        if (!authInfo.userId) {
          throw new Error("Could not extract user ID from token");
        }

        const res = await fetch(`${API_BASE}/api/professionals/${authInfo.userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authInfo.token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        console.log("Profile response:", data);

        if (!res.ok) {
          const res2 = await fetch(`${API_BASE}/api/professionals/`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${authInfo.token}`,
              "Content-Type": "application/json"
            }
          });

          const data2 = await res2.json();
          console.log("Alternative response:", data2);

          if (!res2.ok) {
            throw new Error(data2?.message || `Failed to load profile (${res2.status})`);
          }

          let professional;
          if (Array.isArray(data2)) {
            professional = data2.find(p => p._id === authInfo.userId || p.email === authInfo.email);
          } else if (data2.data && Array.isArray(data2.data)) {
            professional = data2.data.find(p => p._id === authInfo.userId);
          } else {
            professional = data2;
          }

          if (!professional) {
            throw new Error("Could not find your profile in the list");
          }

          setFormData(professional);
          return;
        }

        const professional = data.data || data.professional || data;
        setFormData(professional);

      } catch (err) {
        console.error("Load profile error:", err);
        setErrorMsg(err.message || "Failed to load profile. Please try logging out and back in.");
      } finally {
        setLoading(false);
      }
    };

    const setFormData = (professional) => {
      setForm({
        name: professional.name || "",
        email: professional.email || "",
        phone: professional.phone || "",
        role: professional.role || "lawyer",
        tier: professional.tier || "A",
        overview: professional.overview || "",
        yearsExperience: professional.yearsExperience || 0,
        defaultRate: 1100, // Enforce 1100
        languages: Array.isArray(professional.languages) ? professional.languages : [],
        specialties: Array.isArray(professional.specialties) ? professional.specialties : [],
        location: professional.location || {
          country: "",
          state: "",
          city: "",
          locality: ""
        },
        education: Array.isArray(professional.education) ? professional.education : [],
        certificates: Array.isArray(professional.certificates) ? professional.certificates : [],
        experience: Array.isArray(professional.experience) ? professional.experience : [],
        documents: Array.isArray(professional.documents) ? professional.documents : [],
        additionalDocuments: Array.isArray(professional.additionalDocuments) ? professional.additionalDocuments : [],
        availability: Array.isArray(professional.availability) ? professional.availability : [],
        isInstantAvailable: professional.isInstantAvailable || false,
        minInstantMinutes: professional.minInstantMinutes || 30,
        maxInstantMinutes: professional.maxInstantMinutes || 120
      });

      // Set selected tier from loaded data
      setSelectedTier(professional.tier || "A");

      if (professional.profilePhoto) {
        setPhotoPreview(professional.profilePhoto);
      } else if (professional.avatar) {
        setPhotoPreview(professional.avatar);
      }

      setProfileCompletion(professional.profileCompletion || 0);
    };

    loadProfile();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Add to array field
  const addToArray = (field, value) => {
    if (value.trim()) {
      setForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  // Remove from array field
  const removeFromArray = (field, index) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Add education entry
  const addEducation = () => {
    setForm(prev => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "" }]
    }));
  };

  // Update education entry
  const updateEducation = (index, field, value) => {
    setForm(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return { ...prev, education: newEducation };
    });
  };

  // Remove education entry
  const removeEducation = (index) => {
    setForm(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Add certificate
  const addCertificate = () => {
    setForm(prev => ({
      ...prev,
      certificates: [...prev.certificates, { title: "", issuedBy: "", year: "" }]
    }));
  };

  // Update certificate
  const updateCertificate = (index, field, value) => {
    setForm(prev => {
      const newCertificates = [...prev.certificates];
      newCertificates[index] = { ...newCertificates[index], [field]: value };
      return { ...prev, certificates: newCertificates };
    });
  };

  // Remove certificate
  const removeCertificate = (index) => {
    setForm(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  // Add experience
  const addExperience = () => {
    setForm(prev => ({
      ...prev,
      experience: [...prev.experience, { firm: "", role: "", years: 0, description: "" }]
    }));
  };

  // Update experience
  const updateExperience = (index, field, value) => {
    setForm(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      return { ...prev, experience: newExperience };
    });
  };

  // Remove experience
  const removeExperience = (index) => {
    setForm(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // Handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const authInfo = getAuthInfo();
      if (!authInfo.token) {
        throw new Error("Please login to update profile");
      }

      const formData = new FormData();

      const fieldsToSend = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        tier: form.tier,
        overview: form.overview,
        yearsExperience: form.yearsExperience,
        defaultRate: form.defaultRate,
        languages: form.languages,
        specialties: form.specialties,
        location: form.location,
        education: form.education,
        certificates: form.certificates,
        experience: form.experience,
        documents: form.documents,
        additionalDocuments: form.additionalDocuments,
        availability: form.availability,
        isInstantAvailable: form.isInstantAvailable,
        minInstantMinutes: form.minInstantMinutes,
        maxInstantMinutes: form.maxInstantMinutes
      };

      Object.keys(fieldsToSend).forEach(key => {
        if (typeof fieldsToSend[key] === 'object') {
          formData.append(key, JSON.stringify(fieldsToSend[key]));
        } else {
          formData.append(key, fieldsToSend[key].toString());
        }
      });

      if (photoFile) {
        formData.append("profilePhoto", photoFile);
      }

      console.log("Sending form data...");

      const response = await fetch(`${API_BASE}/api/professionals/edit-profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authInfo.token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log("Update response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccessMsg(data.message || "Profile updated successfully!");

      if (data.data?.profilePhoto) {
        setPhotoPreview(data.data.profilePhoto);
      }

      if (data.data?.profileCompletion !== undefined) {
        setProfileCompletion(data.data.profileCompletion);
      }

      setPhotoFile(null);

    } catch (error) {
      console.error("Update error:", error);
      setErrorMsg(error.message || "An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  const progressColor = getProgressColor(profileCompletion);

  return (
    <Container className="py-4">
      {/* Enhanced Profile Completion Card */}
      <Card className="mb-4 shadow-lg border-0" style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
        overflow: "hidden"
      }}>
        <Card.Body className="p-0">
          <div className="row g-0 align-items-center">
            {/* Left side - Progress circle */}
            <div className="col-12 col-md-4 text-center p-4" style={{ backgroundColor: "#f8f9fa" }}>
              <div className="position-relative d-inline-block">
                <div
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    background: `conic-gradient(
      ${progressColor} ${profileCompletion * 3.6}deg,
      #e9ecef 0deg
    )`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.6s ease",
                  }}
                >

                  <div style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      fontWeight: "700",
                      color: progressColor,

                      lineHeight: "1"
                    }}>
                      {profileCompletion}%
                    </div>
                    <div className="small text-muted mt-1">Complete</div>
                  </div>
                </div>

                {/* Decorative dots */}
                <div style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#2f6f6a",
                  opacity: "0.6"
                }}></div>
                <div style={{
                  position: "absolute",
                  bottom: "15px",
                  left: "10px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#CAAA93",
                  opacity: "0.6"
                }}></div>
              </div>
            </div>

            {/* Right side - Details */}
            <div className="col-12 col-md-8 p-4">
              <div className="row">
                <div className="col-12 mb-3">
                  <h4 className="mb-1" style={{ color: "#2f6f6a", fontWeight: "600" }}>
                    Profile Strength
                  </h4>
                  <p className="text-muted mb-0">
                    Complete your profile to boost credibility and attract more clients
                  </p>
                </div>


                {/* Progress breakdown */}

                <div className="col-12">

                  <div className="row g-3">
                    {[
                      { label: "Basic Info", value: 25, completed: form.name && form.email },
                      { label: "Professional", value: 30, completed: form.overview && form.yearsExperience > 0 },
                      { label: "Documents", value: 25, completed: form.documents.length > 0 },
                      { label: "Availability", value: 20, completed: form.availability.length > 0 },
                    ].map((item, index) => {
                      const isDone = item.completed;
                      const baseColor = SECTION_COLORS[item.label];
                      const intensity = getIntensity(profileCompletion);

                      return (
                        <div key={index} className="col-12 col-md-6">
                          <div
                            className="d-flex align-items-center px-3 py-2 rounded-3 profile-strength-row"

                            style={{
                              background: isDone
                                ? `linear-gradient(90deg, ${baseColor}10, transparent)`
                                : "#f8f9fa",
                              border: `1px solid ${isDone ? baseColor + "30" : "#e9ecef"}`,
                              transition: "all 0.3s ease",
                            }}
                          >

                            {/* Status Icon */}
                            <div className="me-2">
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  background: isDone
                                    ? `linear-gradient(135deg, ${baseColor}, ${baseColor}cc)`
                                    : "#e9ecef",
                                  boxShadow: isDone
                                    ? `0 4px 12px ${baseColor}55`
                                    : "none",

                                  opacity: isDone ? intensity : 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.3s ease",
                                }}
                              >
                                {isDone ? (
                                  <i className="bi bi-check" style={{ fontSize: "12px", color: "white" }} />
                                ) : (
                                  <div
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      backgroundColor: "#adb5bd",
                                    }}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Label + Progress */}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between mb-1">
                                <span
                                  className="small"
                                  style={{
                                    fontWeight: isDone ? 600 : 400,
                                    letterSpacing: "0.2px",
                                    color: isDone ? baseColor : "#6c757d",
                                    opacity: isDone ? intensity : 1,
                                  }}
                                >
                                  {item.label}
                                </span>
                                <span className="small fw-semibold text-muted">{item.value}%</span>

                              </div>

                              <div
                                className="progress"
                                style={{
                                  height: "6px",
                                  backgroundColor: "#eef1f4",
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                }}
                              >

                                <div
                                  className="progress-bar"
                                  style={{
                                    width: isDone ? "100%" : "0%",
                                    background: `linear-gradient(90deg, ${baseColor}, ${baseColor}cc)`,
                                    boxShadow: `0 0 8px ${baseColor}55`,

                                    opacity: intensity,
                                    transition: "width 0.4s ease",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>


                {/* Completion message */}
                <div className="col-12 mt-4">
                  <div
                    className="p-3 rounded-3"
                    style={{
                      background: "linear-gradient(135deg, #f8f9fa, #ffffff)",
                      border: "1px solid #e9ecef",
                    }}
                  >

                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <i
                          className="bi bi-star-fill"
                          style={{
                            color: "#CAAA93",
                            fontSize: "22px",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                          }}
                        />

                      </div>
                      <div>
                        <h6 className="alert-heading mb-1">
                          {profileCompletion >= 80 ? "Excellent!" :
                            profileCompletion >= 60 ? "Good Progress!" :
                              profileCompletion >= 40 ? "Keep Going!" : "Let's Get Started!"}
                        </h6>
                        <p className="mb-0 small text-muted">
                          {profileCompletion >= 80 ? "Your profile looks great! You're ready to attract clients." :
                            profileCompletion >= 60 ? "You're more than halfway there! Complete a few more sections." :
                              profileCompletion >= 40 ? "You're making good progress. Complete more sections to improve visibility." :
                                "Start by filling out your basic information and professional details."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <h2 className="mb-4">Edit Profile</h2>

      {errorMsg && (
        <Alert variant="danger" onClose={() => setErrorMsg("")} dismissible>
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert variant="success" onClose={() => setSuccessMsg("")} dismissible>
          {successMsg}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Basic Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col lg={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Professional Role *</Form.Label>
                  <Form.Select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="lawyer">Lawyer</option>
                    <option value="mediator">Mediator</option>
                    <option value="counsellor">Counsellor</option>
                    <option value="therapist">Therapist</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Professional Overview</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="overview"
                    value={form.overview}
                    onChange={handleChange}
                    placeholder="Tell clients about your experience, expertise, and approach..."
                  />
                </Form.Group>

                <Row>
                  {/* <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Years of Experience</Form.Label>
                      <Form.Control
                        type="number"
                        name="yearsExperience"
                        value={form.yearsExperience}
                        onChange={handleChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col> */}

                </Row>
              </Col>

              <Col lg={4}>
                <div className="text-center mb-3">
                  <div className="profile-photo-container mb-3">
                    {photoPreview ? (
                      <Image
                        src={photoPreview}
                        roundedCircle
                        style={{ width: "150px", height: "150px", objectFit: "cover", border: "3px solid #CAAA93" }}
                        className="img-fluid"
                      />
                    ) : (
                      <div className="placeholder-photo d-flex align-items-center justify-content-center"
                        style={{
                          width: "150px",
                          height: "150px",
                          borderRadius: "50%",
                          backgroundColor: "#f0f0f0",
                          margin: "0 auto",
                          border: "3px solid #ddd"
                        }}>
                        <span className="text-muted">No Photo</span>
                      </div>
                    )}
                  </div>

                  <Form.Group>
                    <Form.Label>Profile Photo</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      ref={photoInputRef}
                      className="mb-2"
                    />
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                      {photoPreview && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={removePhoto}
                        >
                          Remove
                        </Button>
                      )}
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </Form.Group>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Service Rate Section */}
        <Card className="mb-4 shadow-sm border-0" style={{ overflow: "hidden" }}>
          <Card.Header className="bg-white border-bottom p-3">
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 4, height: 24, background: "#2f6f6a", borderRadius: 2 }}></div>
              <h5 className="mb-0 fw-bold" style={{ color: "#2e241d" }}>Service Pricing</h5>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <Row>
              <Col md={12}>
                <div className="pricing-card-content">
                  <div className="pricing-icon-box">
                    <FaMoneyBillWave />
                  </div>
                  <div className="pricing-details">
                    <label className="pricing-label">Standard Service Rate</label>
                    <div className="pricing-value">
                      ₹ 1,100 <span className="pricing-sub-value">/ 30 min</span>
                    </div>

                  </div>
                  <div className="pricing-badge-container">
                    <div className="pricing-badge">
                      <FaLock size={10} /> FIXED RATE
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Location Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Location</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} lg={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    name="location.country"
                    value={form.location.country}
                    onChange={handleChange}
                    placeholder="e.g., India"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    name="location.state"
                    value={form.location.state}
                    onChange={handleChange}
                    placeholder="e.g., Maharashtra"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="location.city"
                    value={form.location.city}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Locality</Form.Label>
                  <Form.Control
                    type="text"
                    name="location.locality"
                    value={form.location.locality}
                    onChange={handleChange}
                    placeholder="e.g., Bandra West"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Languages & Specialties Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Languages & Specialties</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Languages</Form.Label>
                  <div className="d-flex mb-2">
                    <Form.Control
                      type="text"
                      value={currentLanguage}
                      onChange={(e) => setCurrentLanguage(e.target.value)}
                      placeholder="Add a language (e.g., English)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray("languages", currentLanguage);
                          setCurrentLanguage("");
                        }
                      }}
                    />
                    <Button
                      variant="outline-primary"
                      className="ms-2"
                      onClick={() => {
                        addToArray("languages", currentLanguage);
                        setCurrentLanguage("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="language-tags mt-2">
                    {form.languages.map((lang, index) => (
                      <span key={index} className="badge bg-primary me-2 mb-2 p-2 d-inline-flex align-items-center">
                        {lang}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          aria-label="Close"
                          onClick={() => removeFromArray("languages", index)}
                          style={{ fontSize: "10px" }}
                        />
                      </span>
                    ))}
                    {form.languages.length === 0 && (
                      <p className="text-muted small">No languages added yet</p>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Specialties</Form.Label>
                  <div className="d-flex mb-2">
                    <Form.Control
                      type="text"
                      value={currentSpecialty}
                      onChange={(e) => setCurrentSpecialty(e.target.value)}
                      placeholder="Add a specialty (e.g., Family Law)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray("specialties", currentSpecialty);
                          setCurrentSpecialty("");
                        }
                      }}
                    />
                    <Button
                      variant="outline-primary"
                      className="ms-2"
                      onClick={() => {
                        addToArray("specialties", currentSpecialty);
                        setCurrentSpecialty("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="specialty-tags mt-2">
                    {form.specialties.map((spec, index) => (
                      <span key={index} className="badge bg-info me-2 mb-2 p-2 d-inline-flex align-items-center">
                        {spec}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          aria-label="Close"
                          onClick={() => removeFromArray("specialties", index)}
                          style={{ fontSize: "10px" }}
                        />
                      </span>
                    ))}
                    {form.specialties.length === 0 && (
                      <p className="text-muted small">No specialties added yet</p>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Documents Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Documents</h5>
            <Button variant="outline-primary" size="sm" onClick={addDocument}>
              + Add Document
            </Button>
          </Card.Header>
          <Card.Body>
            {form.documents.length === 0 ? (
              <p className="text-muted text-center">No documents added yet</p>
            ) : (
              form.documents.map((doc, index) => (
                <div key={index} className="mb-3 p-3 border rounded">
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Document Type</Form.Label>
                        <Form.Control
                          placeholder="e.g., Bar Council ID"
                          value={doc.type || ""}
                          onChange={(e) => updateDocument(index, "type", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>File URL</Form.Label>
                        <Form.Control
                          placeholder="e.g., https://example.com/doc.pdf"
                          value={doc.fileUrl || ""}
                          onChange={(e) => updateDocument(index, "fileUrl", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="text-end mt-2">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeDocument(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>

        {/* Additional Documents Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Additional Documents</h5>
            <Button variant="outline-primary" size="sm" onClick={addAdditionalDocument}>
              + Add Additional Document
            </Button>
          </Card.Header>
          <Card.Body>
            {form.additionalDocuments.length === 0 ? (
              <p className="text-muted text-center">No additional documents added yet</p>
            ) : (
              form.additionalDocuments.map((doc, index) => (
                <div key={index} className="mb-3 p-3 border rounded">
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          placeholder="e.g., Aadhaar Card"
                          value={doc.title || ""}
                          onChange={(e) => updateAdditionalDocument(index, "title", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          placeholder="e.g., ID Proof"
                          value={doc.description || ""}
                          onChange={(e) => updateAdditionalDocument(index, "description", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>File URL</Form.Label>
                        <Form.Control
                          placeholder="e.g., https://example.com/aadhaar.pdf"
                          value={doc.fileUrl || ""}
                          onChange={(e) => updateAdditionalDocument(index, "fileUrl", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="text-end mt-2">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeAdditionalDocument(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>

        {/* Education Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Education</h5>
            <Button variant="outline-primary" size="sm" onClick={addEducation}>
              + Add Education
            </Button>
          </Card.Header>
          <Card.Body>
            {form.education.length === 0 ? (
              <p className="text-muted text-center">No education entries added yet</p>
            ) : (
              form.education.map((edu, index) => (
                <div key={index} className="mb-3 p-3 border rounded">
                  <Row className="mb-2">
                    <Col md={12} lg={5}>
                      <Form.Group>
                        <Form.Label>Degree</Form.Label>
                        <Form.Control
                          placeholder="e.g., Bachelor of Laws"
                          value={edu.degree || ""}
                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} lg={5}>
                      <Form.Group>
                        <Form.Label>Institution</Form.Label>
                        <Form.Control
                          placeholder="e.g., University of Mumbai"
                          value={edu.institution || ""}
                          onChange={(e) => updateEducation(index, "institution", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} lg={2}>
                      <Form.Group>
                        <Form.Label>Year</Form.Label>
                        <Form.Control
                          placeholder="e.g., 2015"
                          value={edu.year || ""}
                          onChange={(e) => updateEducation(index, "year", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>

        {/* Certificates Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Certificates</h5>
            <Button variant="outline-primary" size="sm" onClick={addCertificate}>
              + Add Certificate
            </Button>
          </Card.Header>
          <Card.Body>
            {form.certificates.length === 0 ? (
              <p className="text-muted text-center">No certificates added yet</p>
            ) : (
              form.certificates.map((cert, index) => (
                <div key={index} className="mb-3 p-3 border rounded">
                  <Row className="mb-2">
                    <Col md={12} lg={5}>
                      <Form.Group>
                        <Form.Label>Certificate Title</Form.Label>
                        <Form.Control
                          placeholder="e.g., Certified Mediator"
                          value={cert.title || ""}
                          onChange={(e) => updateCertificate(index, "title", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} lg={5}>
                      <Form.Group>
                        <Form.Label>Issued By</Form.Label>
                        <Form.Control
                          placeholder="e.g., Supreme Court of India"
                          value={cert.issuedBy || ""}
                          onChange={(e) => updateCertificate(index, "issuedBy", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} lg={2}>
                      <Form.Group>
                        <Form.Label>Year</Form.Label>
                        <Form.Control
                          placeholder="e.g., 2020"
                          value={cert.year || ""}
                          onChange={(e) => updateCertificate(index, "year", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeCertificate(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>

        {/* Experience Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Professional Experience</h5>
            <Button variant="outline-primary" size="sm" onClick={addExperience}>
              + Add Experience
            </Button>
          </Card.Header>
          <Card.Body>
            {form.experience.length === 0 ? (
              <p className="text-muted text-center">No experience entries added yet</p>
            ) : (
              form.experience.map((exp, index) => (
                <div key={index} className="mb-3 p-3 border rounded">
                  <Row className="mb-2">
                    <Col md={12} lg={6}>
                      <Form.Group>
                        <Form.Label>Firm/Organization</Form.Label>
                        <Form.Control
                          placeholder="e.g., ABC Law Firm"
                          value={exp.firm || ""}
                          onChange={(e) => updateExperience(index, "firm", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} lg={6}>
                      <Form.Group>
                        <Form.Label>Role/Position</Form.Label>
                        <Form.Control
                          placeholder="e.g., Senior Lawyer"
                          value={exp.role || ""}
                          onChange={(e) => updateExperience(index, "role", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={12} lg={6}>
                      <Form.Group>
                        <Form.Label>Years</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="e.g., 5"
                          value={exp.years || 0}
                          onChange={(e) => updateExperience(index, "years", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-2">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description || ""}
                      onChange={(e) => updateExperience(index, "description", e.target.value)}
                    />
                  </Form.Group>
                  <div className="text-end">
                    <Button
                      variant="outline-danger"
                      onClick={() => removeExperience(index)}
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>

        {/* Weekly Availability Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Weekly Availability</h5>
          </Card.Header>
          <Card.Body>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
              const dayData = form.availability.find(a => a.dayOfWeek === day) || { dayOfWeek: day, slots: [] };

              return (
                <div key={day} className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{day}</h6>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => addAvailabilitySlot(day)}
                    >
                      + Add Slot
                    </Button>
                  </div>

                  {dayData.slots.length === 0 ? (
                    <p className="text-muted small text-center mb-0">No time slots added for this day</p>
                  ) : (
                    dayData.slots.map((slot, idx) => (
                      <div key={idx} className="mb-3 p-2 border rounded bg-light">
                        <Row className="align-items-center g-2">
                          <Col xs={12} sm={5} md={4}>
                            <Form.Group>
                              <Form.Label className="small mb-1">Start Time</Form.Label>
                              <Form.Control
                                type="time"
                                value={slot.startTime || ""}
                                onChange={(e) => updateAvailability(day, idx, "startTime", e.target.value)}
                                className="form-control-sm"
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={12} sm={5} md={4}>
                            <Form.Group>
                              <Form.Label className="small mb-1">End Time</Form.Label>
                              <Form.Control
                                type="time"
                                value={slot.endTime || ""}
                                onChange={(e) => updateAvailability(day, idx, "endTime", e.target.value)}
                                className="form-control-sm"
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={12} sm={5} md={3}>
                            <Form.Group>
                              <Form.Label className="small mb-1">Mode</Form.Label>
                              <Form.Select
                                value={slot.mode || "audio"}
                                onChange={(e) => updateAvailability(day, idx, "mode", e.target.value)}
                                className="form-control-sm"
                              >
                                <option value="audio">Audio</option>
                                <option value="video">Video</option>
                                <option value="chat">Chat</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col xs={12} sm={2} md={1}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeAvailabilitySlot(day, idx)}
                              className="w-100"
                            >
                              ✕
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </Card.Body>
        </Card>

        {/* Instant Booking Settings */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Instant Booking Settings</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Enable Instant Booking"
                name="isInstantAvailable"
                checked={form.isInstantAvailable}
                onChange={handleChange}
                id="instantBookingToggle"
              />
              <Form.Text className="text-muted">
                Allow clients to book instant sessions with you
              </Form.Text>
            </Form.Group>

            {form.isInstantAvailable && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Session Duration (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      name="minInstantMinutes"
                      value={form.minInstantMinutes}
                      onChange={handleChange}
                      min="5"
                    />
                    <Form.Text className="text-muted">
                      Minimum length for instant booking sessions
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum Session Duration (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxInstantMinutes"
                      value={form.maxInstantMinutes}
                      onChange={handleChange}
                      min={form.minInstantMinutes}
                    />
                    <Form.Text className="text-muted">
                      Maximum length for instant booking sessions
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* Submit Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4 p-3 bg-light rounded">
          <div className="mb-3 mb-sm-0">
            <Button
              variant="outline-secondary"
              onClick={() => window.history.back()}
              className="w-100 w-sm-auto"
            >
              Cancel
            </Button>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto">
            <Button
              variant="outline-primary"
              className="w-100 w-sm-auto"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: "#CAAA93",
                borderColor: "#CAAA93",
                minWidth: "120px"
              }}
              className="w-100 w-sm-auto"
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </div>
        </div>
      </Form>

      {/* Responsive CSS */}
      <style jsx="true">{`
        @media (max-width: 768px) {
          .card-header h5 {
            font-size: 1.1rem;
          }
          
          .btn {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }
          
          .form-control, .form-select {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }
          
          .badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            margin-bottom: 0.25rem;
          }
          
          .container {
            padding-left: 15px;
            padding-right: 15px;
          }
          
          .card {
            margin-bottom: 1rem;
          }
          
          .row {
            margin-left: -8px;
            margin-right: -8px;
          }
          
          .col, .col-md, .col-lg, .col-sm, .col-xs {
            padding-left: 8px;
            padding-right: 8px;
          }
          
          .tier-selection .d-none.d-md-block {
            display: block !important;
            margin-top: 0.5rem;
            font-size: 0.875rem;
          }
          
          .tier-selection .col-12 > div {
            margin-bottom: 0.5rem;
          }
          
          .profile-completion-breakdown .col-12 {
            margin-bottom: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          h2 {
            font-size: 1.5rem;
          }
          
          .card-body {
            padding: 1rem;
          }
          
          .profile-photo-container {
            width: 120px;
            height: 120px;
            margin: 0 auto;
          }
          
          .btn-group-vertical {
            width: 100%;
          }
          
          .btn-group-vertical > .btn {
            width: 100%;
            margin-bottom: 0.5rem;
          }
          
          .d-flex {
            flex-direction: column;
          }
          
          .ms-2, .me-2 {
            margin-left: 0.25rem !important;
            margin-right: 0.25rem !important;
          }
          
          .mt-2, .mb-2 {
            margin-top: 0.5rem !important;
            margin-bottom: 0.5rem !important;
          }
          
          .p-3 {
            padding: 1rem !important;
          }
          
          .border.rounded {
            border-radius: 0.5rem !important;
          }
        }
        
        @media (max-width: 360px) {
          .container {
            padding-left: 10px;
            padding-right: 10px;
          }
          
          .btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }
          
          .form-control, .form-select {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }
          
          .badge {
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
          }
        }
        
        /* Tier Card Hover Effects */
        .tier-selection .col-12 > div {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .tier-selection .col-12 > div:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        
        /* Progress Bar Animation */
        .progress-bar {
          transition: width 0.6s ease;
        }
        
        /* Print styles */
        @media print {
          .tier-selection .btn,
          .alert,
          .profile-completion-breakdown .progress {
            display: none !important;
          }
          
          .btn, .form-check-input, input[type="file"] {
            display: none !important;
          }
          
          .card {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
          
          .card-header {
            background-color: #f8f9fa !important;
          }
        }
          .profile-strength-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
      `}</style>
    </Container>
  );
};

export default EditProfile;