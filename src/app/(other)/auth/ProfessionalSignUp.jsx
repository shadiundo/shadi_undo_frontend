// ProfessionalSignUp.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Select from "react-select";

import UndertakingCheckboxWithModal from "./UndertakingCheckboxWithModal";
import CreatableSelect from "react-select/creatable";
import "react-datepicker/dist/react-datepicker.css";
import { State } from "country-state-city";
import {
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Spinner,
  Modal,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import logo from "@/assets/images/shadiundo.png";

// ---------------- validation schema ----------------
const schema = yup.object({
  accountType: yup.string().oneOf(["individual", "organisation"]).required("Account type is required"),
  role: yup.string().oneOf(["lawyer", "mediator", "counsellor", "therapist"]).required("Role is required"),
  name: yup.string().required("Name is required"),
  organizationName: yup.string().when("accountType", (accountType, schema) =>
    accountType === "organisation" ? schema.required("Organization name is required for organisations") : schema.nullable()
  ),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  password: yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  specialties: yup.array().of(yup.string()).nullable(),
  location: yup.object({
    country: yup.string().nullable(),
    state: yup.string().nullable(),
    city: yup.string().nullable(),
  }),
  enrollmentNumber: yup.string().when("role", {
    is: "lawyer",
    then: (s) => s.required("Enrollment number is required for lawyers"),
    otherwise: (s) => s.notRequired(),
  }),
  documents: yup.array().of(
    yup.object({
      type: yup.string().required("Type required"),
      fileUrl: yup.string().nullable(),
    })
  ),
  additionalDocuments: yup.array().of(
    yup.object({
      title: yup.string().nullable().notRequired(),
      description: yup.string().nullable().notRequired(),
      fileUrl: yup.string().nullable().notRequired(),
    })
  ).nullable().notRequired(),
  undertaking: yup.bool().oneOf([true], "You must accept the undertaking"),
  terms: yup.bool().oneOf([true], "You must agree to the Terms and Conditions"),
});

// ---------------- upload helper (XHR with progress) ----------------
function uploadFileWithProgressPublic(file, onProgress, extraData = {}) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    try {
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append("file", file);

      // Use PUBLIC upload endpoint
      const base = import.meta.env.VITE_API_URL || "";
      const url = `${base}/api/professionals/upload-public`;

      const safeExtra = { ...(extraData || {}) };
      if (!safeExtra.title || !String(safeExtra.title).trim()) {
        safeExtra.title = file.name || "untitled";
      }
      Object.keys(safeExtra).forEach((k) => {
        const v = safeExtra[k];
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });

      xhr.open("POST", url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && typeof onProgress === "function") {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (!xhr.responseText) {
          return reject(new Error(`Empty upload response (status ${xhr.status})`));
        }
        try {
          const resp = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && (resp?.success || resp?.fileUrl || resp?.relativePath || resp?.filename)) {
            if (resp.fileUrl) return resolve(resp.fileUrl);
            const baseUrl = base.replace(/\/$/, "");
            if (resp.relativePath) return resolve(`${baseUrl}${resp.relativePath}`);
            if (resp.filename) return resolve(`${baseUrl}/uploads/${resp.filename}`);
            return resolve(resp.fileUrl ?? null);
          } else {
            if (resp && (resp.relativePath || resp.filename)) {
              const baseUrl = base.replace(/\/$/, "");
              const candidate = resp.fileUrl ?? (resp.relativePath ? `${baseUrl}${resp.relativePath}` : (resp.filename ? `${baseUrl}/uploads/${resp.filename}` : null));
              if (candidate) return resolve(candidate);
            }
            return reject(new Error(resp?.message || `Upload failed with status ${xhr.status}`));
          }
        } catch (err) {
          return reject(err);
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(fd);
    } catch (err) {
      reject(err);
    }
  });
}

// ---------------- FileInput component ----------------
const FileInput = ({ id, onFileSelected, uploadedUrl, uploadingState }) => {
  const inputRef = useRef(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
      <input
        id={id}
        type="file"
        ref={inputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && typeof onFileSelected === "function") onFileSelected(f);
        }}
        style={{ display: "none" }}
      />

      <label
        htmlFor={id}
        role="button"
        className="btn-upload"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 700,
          border: "none",
          background: "linear-gradient(90deg,#CAAA93,#B07D5A)",
          color: "#fff",
        }}
      >
        Upload
      </label>

      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
        {uploadingState?.uploading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Uploading</div>
            <div style={{ width: 100, height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${uploadingState.progress || 0}%`, height: "100%", background: "linear-gradient(90deg,#CAAA93,#b07d5a)" }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{uploadingState.progress || 0}%</div>
          </div>
        ) : uploadedUrl ? (
          <a className="view-link small" href={uploadedUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: "#2f6f6a" }}>
            View
          </a>
        ) : (
          <div style={{ color: "#98a2ad", fontSize: 13 }}>No file added</div>
        )}
      </div>
    </div>
  );
};

// ---------------- Main component ----------------
const ProfessionalSignUp = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      accountType: "individual",
      role: "lawyer",
      name: "",
      organizationName: "",
      email: "",
      phone: "",
      password: "",
      enrollmentNumber: "",
      specialties: [],
      location: { country: "IN", state: "", city: "" },
      documents: [{ type: "", fileUrl: "" }],
      additionalDocuments: [],
      undertaking: false,
      terms: false,
    },
  });

  const { fields: docFields, append: appendDoc, remove: removeDoc } = useFieldArray({ control, name: "documents" });
  const { fields: addDocFields, append: appendAddDoc, remove: removeAddDoc } = useFieldArray({ control, name: "additionalDocuments" });

  const [uploadingMap, setUploadingMap] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Email OTP Verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const setUploadState = useCallback((key, patch) => {
    setUploadingMap((m) => ({ ...(m || {}), [key]: { ...(m?.[key] || {}), ...patch } }));
  }, []);

  const handleFileChangeAndSet = async (file, formFieldPath, extraData = {}) => {
    if (!file || !formFieldPath) return;
    setUploadState(formFieldPath, { uploading: true, progress: 0 });

    try {
      const fileUrl = await uploadFileWithProgressPublic(
        file,
        (percent) => setUploadState(formFieldPath, { progress: percent, uploading: true }),
        extraData
      );

      if (fileUrl) {
        setValue(formFieldPath, fileUrl, { shouldDirty: true, shouldValidate: true });
      } else {
        throw new Error("Upload finished but server returned no file URL");
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploadState(formFieldPath, { uploading: false, progress: 0 });
    }
  };

  const idFromPath = (path) => path.replace(/\./g, "-").replace(/\[/g, "-").replace(/\]/g, "");

  const specialtiesOptions = useMemo(
    () => [
      { value: "family law", label: "Family Law" },
      { value: "divorce mediation", label: "Divorce Mediation" },
      { value: "child custody", label: "Child Custody" },
      { value: "domestic violence", label: "Domestic Violence" },
      { value: "maintenance", label: "Maintenance" },
      { value: "trauma counselling", label: "Trauma Counselling" },

    ],
    []
  );

  const accountType = watch("accountType");
  const watchRole = watch("role");

  // helper: check if any file uploads are in progress
  const anyUploadInProgress = () => {
    return Object.values(uploadingMap || {}).some((v) => v?.uploading);
  };

  // --- helper to fetch with timeout ---
  async function fetchWithTimeout(url, opts = {}, ms = 20000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const resp = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(id);
      return resp;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  // --- 1. Step 1: Validate Form & Send Email OTP ---
  const onSubmit = async (data) => {
    if (anyUploadInProgress()) {
      alert("Please wait until all uploads finish.");
      return;
    }

    setSubmitting(true);
    try {
      const base = import.meta.env.VITE_API_URL || "";
      const sendOtpUrl = `${base}/api/professionals/send-registration-otp`;

      console.log("[send-registration-otp] sending request to", sendOtpUrl);
      const res = await fetchWithTimeout(
        sendOtpUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, name: data.name, role: data.role }),
        },
        20000
      );

      const result = await res.json().catch(() => ({}));
      if (res.ok && result?.success) {
        setPendingData(data);
        setOtpValue("");
        setOtpError("");
        setShowOtpModal(true);
        setResendTimer(30);
        toast.info(result.message || `Verification code sent to ${data.email}`);
      } else {
        alert(result?.message || "Failed to send verification code. Please try again.");
      }
    } catch (err) {
      console.error("[send-registration-otp] error:", err);
      alert(err.message || "Network error while sending verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- 2. Resend Email OTP ---
  const handleResendOtp = async () => {
    if (!pendingData?.email || resendTimer > 0) return;
    setResending(true);
    setOtpError("");
    try {
      const base = import.meta.env.VITE_API_URL || "";
      const res = await fetchWithTimeout(
        `${base}/api/professionals/send-registration-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: pendingData.email, name: pendingData.name, role: pendingData.role }),
        },
        20000
      );
      const result = await res.json().catch(() => ({}));
      if (res.ok && result?.success) {
        setResendTimer(30);
        toast.success(result.message || "New OTP sent to your email!");
      } else {
        setOtpError(result.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setOtpError(err.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  // --- 3. Step 2: Verify OTP & Create Account ---
  const handleVerifyAndRegister = async () => {
    if (!otpValue || otpValue.trim().length !== 6) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }

    setVerifying(true);
    setOtpError("");
    try {
      const payload = {
        ...pendingData,
        otp: otpValue.trim(),
        defaultRate: 1100, // Set default rate to 1100
        tier: "A", // Default tier
        specialties: (pendingData.specialties || []).map((s) => s.value || s.label || s),
        additionalDocuments: (pendingData.additionalDocuments || []).filter(
          (doc) => doc && doc.title && doc.fileUrl
        ),
      };

      const base = import.meta.env.VITE_API_URL || "";
      const url = `${base}/api/professionals/register`;

      console.log("[register] sending verified request to", url);
      const start = Date.now();
      const res = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        30000
      );
      console.log("[register] status:", res.status, "after", Date.now() - start, "ms");

      const textBody = await res.text().catch(() => "");
      let result = {};
      if (textBody) {
        try {
          result = JSON.parse(textBody);
        } catch {
          result = { message: textBody };
        }
      }
      console.log("[register] response:", result);

      if (res.status === 201 || res.status === 200 || result?.success) {
        toast.success(result?.message || "Registered successfully!");
        if (result?.token) localStorage.setItem("token", result.token);

        if (result?.professional?.profileCompletion != null) {
          localStorage.setItem("profileCompletion", result.professional.profileCompletion);
        }

        setShowOtpModal(false);
        alert("Email verified and account registered successfully! You can now log in.");

        // reset form
        reset({
          accountType: "individual",
          role: "lawyer",
          name: "",
          organizationName: "",
          email: "",
          phone: "",
          password: "",
          specialties: [],
          location: { country: "IN", state: "", city: "" },
          documents: [{ type: "", fileUrl: "" }],
          additionalDocuments: [],
          undertaking: false,
          terms: false,
        });

        setUploadingMap({});
        setTimeout(() => navigate("/auth/professional-login"), 800);
      } else {
        setOtpError(result?.message || "Verification failed. Please check the OTP.");
      }
    } catch (err) {
      console.error("[register] verify error:", err);
      if (err.name === "AbortError") {
        setOtpError("Request timed out — server did not respond in time.");
      } else {
        setOtpError(err?.message || "Registration error. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  // styles
  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg,#CAAA93,#D4B8A2)"
  };

  const containerStyle = {
    width: "100%",
    maxWidth: 1200,
    padding: "28px"
  };

  const cardStyle = {
    borderRadius: 14,
    overflow: "hidden"
  };

  const inputStyle = (val) => ({
    borderColor: val ? "#2f6f6a" : "#ced4da",
    backgroundColor: val ? "rgba(47,111,106,0.08)" : "#fff",
    boxShadow: val ? "0 0 0 3px rgba(47,111,106,0.06)" : "none",
    transition: "all 0.15s ease-in-out",
  });

  const DOCUMENT_LABELS = {
    bar_council_id: "Bar Council ID",
    enrollment_certificate: "Enrollment Certificate",
    certificate_of_practice: "Certificate of Practice",
    aadhaar: "Aadhaar Card",
    voter_id: "Voter ID",
    driving_licence: "Driving Licence",
  };

  const ADDITIONAL_DOC_OPTIONS = [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "voter_id", label: "Voter ID" },
    { value: "driving_licence", label: "Driving Licence" },
  ];

  const indiaStates = useMemo(() => State.getStatesOfCountry("IN").map((s) => ({ value: s.isoCode, label: s.name })), []);

  return (
    <div style={pageStyle}>
      <ToastContainer position="top-right" autoClose={2000} />

      <div style={containerStyle}>
        <Card style={cardStyle} className="shadow-lg auth-card">
          <CardHeader style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "16px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <CardTitle as="h4" style={{ margin: 0, fontWeight: 700, color: "#141C2C" }}>Professional Sign Up</CardTitle>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Register as a lawyer, mediator, counsellor or therapist</div>
              </div>

              <Link to="/" title="Shaadi Undo - Home" style={{ display: "inline-flex", alignItems: "center" }}>
                <img
                  src={logo}
                  alt="Shaadi Undo"
                  style={{ height: 48, maxHeight: 48, width: "auto", objectFit: "contain" }}
                />
              </Link>
            </div>
          </CardHeader>

          <CardBody style={{ padding: 24, background: "#fff" }}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Account type + Role */}
              <Row className="mb-3" style={{ gap: 12 }}>
                <Col md style={{ minWidth: 320 }}>
                  <Form.Group>
                    <Form.Label>
                      Account Type <span style={{ color: "#dc2626" }}>*</span>
                    </Form.Label>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <Form.Check
                        inline
                        label="Individual"
                        type="radio"
                        id="acc-ind"
                        value="individual"
                        {...register("accountType")}
                        checked={watch("accountType") === "individual"}
                        onChange={(e) => {
                          setValue("accountType", e.target.value);
                          setValue("organizationName", "");
                        }}
                      />
                      <Form.Check
                        inline
                        label="Organisation"
                        type="radio"
                        id="acc-org"
                        value="organisation"
                        {...register("accountType")}
                        checked={watch("accountType") === "organisation"}
                        onChange={(e) => setValue("accountType", e.target.value)}
                      />
                    </div>
                    <div style={{ color: "#dc2626", fontSize: 12 }}>
                      {errors.accountType?.message}
                    </div>
                  </Form.Group>
                </Col>

                <Col md style={{ minWidth: 320 }}>
                  <Form.Group>
                    <Form.Label>
                      Role <span style={{ color: "#dc2626" }}>*</span>
                    </Form.Label>
                    <Form.Select {...register("role")} style={inputStyle(watch("role"))}>
                      <option value="lawyer">Lawyer</option>
                      <option value="mediator">Mediator</option>
                      <option value="counsellor">Counsellor</option>
                      <option value="therapist">Therapist</option>
                    </Form.Select>
                    <div style={{ color: "#dc2626", fontSize: 12 }}>
                      {errors.role?.message}
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Organisation name (conditionally visible) */}
              {watch("accountType") === "organisation" && (
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Organisation Name <span style={{ color: "#dc2626" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        placeholder="Enter organisation name"
                        {...register("organizationName")}
                        style={inputStyle(watch("organizationName"))}
                      />
                      <div style={{ color: "#dc2626", fontSize: 12 }}>
                        {errors.organizationName?.message}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* basic fields (name, email, phone, password) */}
              <Row className="mb-3" style={{ gap: 12 }}>
                <Col md style={{ minWidth: 320 }}>
                  <Form.Group>
                    <Form.Label>Name <span style={{ color: "#dc2626" }}>*</span></Form.Label>
                    <Form.Control placeholder="Full name" {...register("name")} style={inputStyle(watch("name"))} />
                    <div style={{ color: "#dc2626", fontSize: 12 }}>{errors.name?.message}</div>
                  </Form.Group>
                </Col>

                <Col md style={{ minWidth: 320 }}>
                  <Form.Group>
                    <Form.Label>Email <span style={{ color: "#dc2626" }}>*</span></Form.Label>
                    <Form.Control placeholder="Email" {...register("email")} style={inputStyle(watch("email"))} />
                    <div style={{ color: "#dc2626", fontSize: 12 }}>{errors.email?.message}</div>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3" style={{ gap: 12 }}>
                <Col md style={{ minWidth: 320 }}>
                  <Form.Group>
                    <Form.Label>Phone <span style={{ color: "#dc2626" }}>*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text
                        style={{
                          backgroundColor: "#f9f9f9",
                          borderRight: "none",
                          fontWeight: 600,
                        }}
                      >
                        +91
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        placeholder="Enter mobile number"
                        {...register("phone")}
                        onChange={(e) => {
                          const val = e.target.value.replace(/^\+?91/, "").trim();
                          setValue("phone", val, { shouldValidate: true });
                        }}
                        value={watch("phone")}
                        style={{
                          ...inputStyle(watch("phone")),
                          borderLeftStyle: "none",
                        }}
                      />
                    </InputGroup>
                    <div style={{ color: "#dc2626", fontSize: 12 }}>
                      {errors.phone?.message}
                    </div>
                  </Form.Group>
                </Col>

                <Col md style={{ minWidth: 320 }}>
                  <Form.Group>
                    <Form.Label>Password <span style={{ color: "#dc2626" }}>*</span></Form.Label>
                    <InputGroup>
                      <Form.Control type={showPassword ? "text" : "password"} placeholder="Password" {...register("password")} isInvalid={!!errors.password} style={inputStyle(watch("password"))} />
                      <Button variant="outline-secondary" type="button" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "Hide" : "Show"}</Button>
                    </InputGroup>
                    <div style={{ color: "#dc2626", fontSize: 12 }}>{errors.password?.message}</div>
                  </Form.Group>
                </Col>
              </Row>

              {watchRole === "lawyer" && (
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Enrollment Number <span style={{ color: "#dc2626" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        placeholder="Enrollment Number"
                        {...register("enrollmentNumber")}
                        style={inputStyle(watch("enrollmentNumber"))}
                      />
                      <div style={{ color: "#dc2626", fontSize: 12 }}>
                        {errors.enrollmentNumber?.message}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* Specialties (creatable multi-select) */}
              <Row className="mb-3">
                <Col md style={{ minWidth: 320 }}>
                  <Form.Group>
                    <Form.Label>Specialties</Form.Label>
                    <Controller
                      control={control}
                      name="specialties"
                      render={({ field }) => {
                        const value = (field.value || []).map((v) => (typeof v === "string" ? { value: v, label: v } : v));
                        return (
                          <CreatableSelect
                            isMulti
                            options={specialtiesOptions}
                            value={value}
                            onChange={(vals) => field.onChange((vals || []).map((v) => v.value || v.label))}
                            placeholder="Type and press enter to add (e.g. family law, mediation)"
                          />
                        );
                      }}
                    />
                    <div style={{ color: "#dc2626", fontSize: 12 }}>{errors.specialties?.message}</div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Location */}
              <Row className="mb-4">
                <Col md>
                  <Form.Group>
                    <Form.Label>Country</Form.Label>
                    <Controller
                      control={control}
                      name="location.country"
                      defaultValue="IN"
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[{ value: "IN", label: "India" }]}
                          isDisabled
                          value={{ value: "IN", label: "India" }}
                        />
                      )}
                    />
                  </Form.Group>
                </Col>
                <Col md>
                  <Form.Group>
                    <Form.Label>State</Form.Label>
                    <Controller
                      control={control}
                      name="location.state"
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={indiaStates}
                          onChange={(val) => field.onChange(val?.value || "")}
                          value={indiaStates.find((s) => s.value === field.value) || null}
                          placeholder="Select state"
                        />
                      )}
                    />
                  </Form.Group>
                </Col>
                <Col md>
                  <Form.Group>
                    <Form.Label>City</Form.Label>
                    <Form.Control {...register("location.city")} placeholder="City" style={inputStyle(watch("location.city"))} />
                  </Form.Group>
                </Col>
              </Row>

              {/* Documents Section */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 16,
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <h4 style={{ margin: 0, color: "#5d7186" }}>
                    Documents (ID Proofs etc.)
                  </h4>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => appendDoc({ type: "", fileUrl: "" })}
                  >
                    + Add
                  </Button>
                </div>

                {docFields.map((f, idx) => {
                  const fieldTypePath = `documents.${idx}.type`;
                  const fieldFilePath = `documents.${idx}.fileUrl`;
                  const uploaded = watch(fieldFilePath);
                  const uploadingState = uploadingMap[fieldFilePath] || {
                    uploading: false,
                    progress: 0,
                  };
                  const domId = idFromPath(fieldFilePath);

                  const documentOptions =
                    watchRole === "lawyer"
                      ? [
                        "bar_council_id",
                        "enrollment_certificate",
                        "certificate_of_practice",
                      ]
                      : [
                        "aadhaar",
                        "voter_id",
                        "driving_licence",
                      ];

                  return (
                    <div
                      key={f.id}
                      style={{
                        marginBottom: 12,
                        paddingBottom: 8,
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <Row className="align-items-center">
                        {/* Document Type Dropdown */}
                        <Col md style={{ minWidth: 260 }}>
                          <Form.Group>
                            <Form.Label>
                              Document Type <span style={{ color: "#dc2626" }}>*</span>
                            </Form.Label>
                            <Form.Select
                              {...register(fieldTypePath)}
                              style={inputStyle(watch(fieldTypePath))}
                              defaultValue=""
                            >
                              <option value="">Select Document Type</option>
                              {documentOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {DOCUMENT_LABELS[opt] || opt}
                                </option>
                              ))}
                            </Form.Select>
                            <div
                              style={{ color: "#dc2626", fontSize: 12 }}
                            >
                              {errors.documents?.[idx]?.type?.message}
                            </div>
                          </Form.Group>
                        </Col>

                        {/* File Upload */}
                        <Col md style={{ minWidth: 420 }}>
                          <Form.Group>
                            <Form.Label>
                              Upload File <span style={{ color: "#dc2626" }}>*</span>
                            </Form.Label>
                            <div style={inputStyle(uploaded)}>
                              <FileInput
                                id={domId}
                                onFileSelected={(file) =>
                                  handleFileChangeAndSet(file, fieldFilePath, {
                                    title: watch(fieldTypePath),
                                  })
                                }
                                uploadedUrl={uploaded}
                                uploadingState={uploadingState}
                              />
                            </div>
                          </Form.Group>
                        </Col>

                        {/* Remove button */}
                        <Col md style={{ minWidth: 120, textAlign: "right" }}>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeDoc(idx)}
                          >
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>

              {/* Additional Documents */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 16,
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <h4 style={{ margin: 0, color: "#5d7186" }}>
                    Additional Documents <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 400 }}>(Optional)</span>
                  </h4>

                  <Button
                    variant="link"
                    size="sm"
                    onClick={() =>
                      appendAddDoc({ title: "", description: "", fileUrl: "" })
                    }
                  >
                    + Add
                  </Button>
                </div>

                {addDocFields.map((f, idx) => {
                  const titlePath = `additionalDocuments.${idx}.title`;
                  const descPath = `additionalDocuments.${idx}.description`;
                  const filePath = `additionalDocuments.${idx}.fileUrl`;

                  const uploaded = watch(filePath);
                  const uploadingState = uploadingMap[filePath] || {
                    uploading: false,
                    progress: 0,
                  };

                  const domId = idFromPath(filePath);

                  return (
                    <div
                      key={f.id}
                      style={{
                        marginBottom: 12,
                        paddingBottom: 8,
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <Row className="align-items-center">
                        {/* Document Type Dropdown */}
                        <Col md style={{ minWidth: 220 }}>
                          <Form.Select
                            {...register(titlePath)}
                            style={inputStyle(watch(titlePath))}
                            defaultValue=""
                          >
                            <option value="">Select Document</option>
                            {ADDITIONAL_DOC_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>

                        {/* File Upload */}
                        <Col md style={{ minWidth: 260 }}>
                          <div style={inputStyle(uploaded)}>
                            <FileInput
                              id={domId}
                              onFileSelected={(file) => {
                                const selectedValue = watch(titlePath);
                                const titleLabel =
                                  ADDITIONAL_DOC_OPTIONS.find(o => o.value === selectedValue)?.label ||
                                  file.name ||
                                  "untitled";

                                const descVal = watch(descPath) || "";

                                handleFileChangeAndSet(file, filePath, {
                                  title: titleLabel,
                                  description: descVal,
                                });
                              }}
                              uploadedUrl={uploaded}
                              uploadingState={uploadingState}
                            />
                          </div>
                        </Col>

                        {/* Remove */}
                        <Col md style={{ minWidth: 80, textAlign: "right" }}>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeAddDoc(idx)}
                          >
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>

              {/* Undertaking & Terms */}
              <div style={{ marginBottom: 12 }}>
                <Form.Group style={{ marginBottom: 12 }}>
                  <Controller
                    control={control}
                    name="undertaking"
                    render={({ field }) => (
                      <UndertakingCheckboxWithModal
                        value={!!field.value}
                        onChange={(v) => field.onChange(v)}
                      />
                    )}
                  />
                  <div style={{ color: "#dc2626", fontSize: 12 }}>{errors.undertaking?.message}</div>
                </Form.Group>
                <Form.Group style={{ marginTop: 8 }}>
                  <Form.Check type="checkbox" label={<span>I agree - Terms and Conditions <span style={{ color: "#dc2626" }}>*</span></span>} {...register("terms")} />
                  <div style={{ color: "#dc2626", fontSize: 12 }}>{errors.terms?.message}</div>
                </Form.Group>
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                <Button variant="primary" type="submit" disabled={isSubmitting || submitting} style={{ padding: "10px 22px", borderRadius: 10 }}>
                  {(isSubmitting || submitting) ? (<><Spinner animation="border" size="sm" /> {(submitting && !isSubmitting) ? "Registering..." : "Registering..."}</>) : ("Sign Up as Professional")}
                </Button>
              </div>

              <p style={{ textAlign: "center", color: "#6b7280", marginTop: 18 }}>
                Have an account? <a href="/auth/professional-login" style={{ fontWeight: 700 }}>Sign In</a>
              </p>
            </Form>
          </CardBody>
        </Card>

        {/* Email Verification OTP Modal */}
        <Modal
          show={showOtpModal}
          onHide={() => !verifying && setShowOtpModal(false)}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton={!verifying} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "16px 24px" }}>
            <Modal.Title style={{ fontWeight: 700, color: "#141C2C", fontSize: 18 }}>
              Email Verification
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "28px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(202, 170, 147, 0.18)",
                  color: "#b89882",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  marginBottom: 12,
                }}
              >
                ✉️
              </div>
              <h5 style={{ fontWeight: 700, color: "#141C2C", marginBottom: 6 }}>
                Check Your Inbox
              </h5>
              <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                We've sent a 6-digit verification code to
              </p>
              <div style={{ fontWeight: 700, color: "#141C2C", fontSize: 15, marginTop: 4 }}>
                {pendingData?.email}
              </div>
            </div>

            {otpError && (
              <div
                className="alert alert-danger py-2 text-center"
                style={{ fontSize: 13, borderRadius: 8, marginBottom: 16 }}
              >
                {otpError}
              </div>
            )}

            <Form.Group style={{ marginBottom: 16 }}>
              <Form.Control
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otpValue}
                onChange={(e) => {
                  setOtpValue(e.target.value.replace(/\D/g, ""));
                  setOtpError("");
                }}
                style={{
                  textAlign: "center",
                  fontSize: 26,
                  letterSpacing: 10,
                  fontWeight: 700,
                  padding: "12px",
                  borderRadius: 10,
                  borderColor: otpError ? "#dc2626" : "#CAAA93",
                  boxShadow: "0 0 0 3px rgba(202, 170, 147, 0.15)",
                }}
                autoFocus
              />
            </Form.Group>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              <span>Didn't receive the email?</span>
              {resendTimer > 0 ? (
                <span style={{ fontWeight: 600 }}>Resend in {resendTimer}s</span>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={resending}
                  style={{ padding: 0, fontWeight: 700, color: "#CAAA93", textDecoration: "none" }}
                >
                  {resending ? "Sending..." : "Resend OTP"}
                </Button>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "14px 24px", display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outline-secondary"
              onClick={() => setShowOtpModal(false)}
              disabled={verifying}
              style={{ borderRadius: 8, padding: "8px 16px", fontSize: 14 }}
            >
              Edit Details
            </Button>
            <Button
              variant="primary"
              onClick={handleVerifyAndRegister}
              disabled={verifying || otpValue.trim().length !== 6}
              style={{
                background: "#CAAA93",
                borderColor: "#CAAA93",
                borderRadius: 8,
                padding: "8px 20px",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {verifying ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" /> Verifying...
                </>
              ) : (
                "Verify & Register"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

// inject responsive CSS and export component
const _injectProfessionalSignupResponsiveCSS = (() => {
  try {
    if (typeof document === "undefined") return;
    if (document.getElementById("professional-signup-responsive-css")) return;

    const css = `
/* Desktop: do not change layout (styles below only apply under breakpoints) */

/* Large tablets and below: gentle adjustments */
@media (max-width: 1200px) {
  .auth-card {
    margin: 12px !important;
  }
  .auth-card .card-body {
    padding: 20px !important;
  }
  .auth-card .row {
    gap: 10px !important;
  }
}

/* Tablet / small desktop -> stack columns for narrow widths */
@media (max-width: 991.98px) {
  /* make card use full width of container */
  .auth-card {
    width: calc(100% - 24px) !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }

  /* stack all rows inside the auth card */
  .auth-card .row {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  /* allow columns to take full width */
  .auth-card .row > [class*="col"] {
    min-width: auto !important;
    width: 100% !important;
    flex-basis: 100% !important;
  }

  /* form controls and selects full width */
  .auth-card .form-control,
  .auth-card .form-select,
  .auth-card .react-datepicker-wrapper,
  .auth-card .react-datepicker__input-container > input,
  .auth-card .btn-upload,
  .auth-card .view-link,
  .auth-card .input-group,
  .auth-card .form-check,
  .auth-card .form-label {
    width: 100% !important;
  }

  /* input groups: place prefix inline but let input grow */
  .auth-card .input-group {
    display: flex !important;
    gap: 6px;
  }
  .auth-card .input-group .form-control {
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }

  /* make upload button and view link more compact on small screens */
  .auth-card .btn-upload {
    display: inline-flex !important;
    justify-content: center !important;
    width: 140px !important;
    padding: 8px 10px !important;
    box-sizing: border-box;
  }
  .auth-card .view-link {
    display: inline-block !important;
    margin-top: 6px !important;
  }

  /* availability: stack slot controls */
  .auth-card .align-items-center {
    align-items: flex-start !important;
  }

  /* reduce spacing inside repeatable blocks */
  .auth-card > div[style*="border"] {
    padding: 10px !important;
  }
}

/* Mobile: strong stacking and touch-friendly sizes */
@media (max-width: 575.98px) {
  .auth-card {
    border-radius: 8px !important;
    box-shadow: 0 6px 18px rgba(16,24,40,0.06) !important;
  }
  .auth-card .card-header {
    padding: 12px !important;
  }
  .auth-card .card-body {
    padding: 12px !important;
  }
  .auth-card .card-title {
    font-size: 18px !important;
    line-height: 1.1 !important;
  }
  .auth-card .form-label {
    font-size: 13px !important;
  }
  .auth-card .form-control,
  .auth-card .form-select,
  .auth-card .react-datepicker-wrapper,
  .auth-card .react-datepicker__input-container > input {
    font-size: 14px !important;
    padding: 8px 10px !important;
  }
  .auth-card .btn {
    padding: 8px 12px !important;
    font-size: 14px !important;
  }
  .auth-card .btn-link {
    padding: 0 !important;
    font-size: 13px !important;
  }

  /* Make file input row vertical and compact */
  .auth-card .btn-upload {
    width: 120px !important;
    padding: 7px 10px !important;
    justify-content: center !important;
  }
  .auth-card .file-input-row,
  .auth-card .file-input-inline {
    flex-direction: row !important;
    gap: 8px !important;
    align-items: center !important;
  }

  /* Make tier rows wrap cleanly */
  .auth-card .align-items-center[style] {
    align-items: stretch !important;
  }

  /* availability slots: inputs full width and stacked */
  .auth-card input[type="time"],
  .auth-card select {
    width: 100% !important;
  }
  .auth-card .row .col-md {
    padding-left: 0.25rem !important;
    padding-right: 0.25rem !important;
  }

  /* reduce margin on overall container */
  body .auth-card + div {
    margin-top: 6px !important;
  }
}

/* small accessibility improvements */
.auth-card .form-control:focus {
  box-shadow: 0 0 0 3px rgba(47,111,106,0.06) !important;
  outline: none !important;
}
`;

    const style = document.createElement("style");
    style.id = "professional-signup-responsive-css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  } catch (e) {
    // fail silently
  }
  return true;
})();

export default ProfessionalSignUp;