import React, { useEffect, useState, useRef } from "react";
import { useAuthContext } from "@/context/useAuthContext";
import avatarPlaceholder from "@/assets/images/users/avatar-1.jpg";

const DEFAULT_TIMEOUT = 7000;
function fetchWithTimeout(input, init = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const opts = { ...init, signal: controller.signal };
  return fetch(input, opts).finally(() => clearTimeout(timeoutId));
}

export default function Documents() {
  const { user: authUser, token } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const apiBase =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? "http://localhost:5000"
      : "https://shadi-undo-backend.onrender.com");

  useEffect(() => {
    if (!file) return setFilePreview(null);
    if (file.type && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const controller = new AbortController();
    const loadProfile = async () => {
      try {
        setLoading(true);
        if (authUser && authUser._id) {
          setProfile(authUser);
          return;
        }
        const id = authUser?._id ?? authUser?.id;
        const url = id
          ? `${apiBase}/api/professionals/search?id=${encodeURIComponent(id)}`
          : `${apiBase}/api/professionals/me`;

        const headers = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetchWithTimeout(url, { headers });
        if (!res.ok) throw new Error("Failed to load profile");
        const json = await res.json();
        const found = Array.isArray(json.data) ? json.data[0] : json.data;
        setProfile(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
    return () => controller.abort();
  }, [authUser, token, apiBase]);

  const openFile = (url) => {
    if (!url) return setMessage({ type: "error", text: "No file URL available." });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

 // Replace your handleUpload with this function
const handleUpload = async (e) => {
  e.preventDefault();
  setMessage(null);
  if (!file) return setMessage({ type: "error", text: "Please select a file." });
  if (!title.trim()) return setMessage({ type: "error", text: "Please add a title." });
  setUploading(true);

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    // include professional id so backend can push to that profile
    if (profile?._id) formData.append("professionalId", profile._id);

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const url = `${apiBase}/api/professionals/upload`;

    const res = await fetchWithTimeout(url, { method: "POST", headers, body: formData });
    if (!res.ok) {
      let errMsg = "Upload failed";
      try {
        const body = await res.json();
        errMsg = body?.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const json = await res.json();

    // Prefer updated profile if server returns it
    const updatedProfile = json?.profile ?? null;
    const created = json?.created ?? json?.document ?? null;

    if (updatedProfile) {
      // use profile sent by server (best)
      setProfile(updatedProfile);
      resetForm();
      setMessage({ type: "success", text: "Document uploaded and saved to profile." });
    } else if (created) {
      // backend returned created doc only - append it client-side
      const safeCreated = {
        _id: created._id ?? created.id ?? `${Date.now()}`,
        title: created.title || created.originalName || file.name || "Untitled",
        description: created.description ?? description ?? "",
        fileUrl: created.fileUrl ?? created.url ?? null,
        mimeType: created.mimeType ?? file.type,
        size: created.size ?? file.size,
        uploadedAt: created.uploadedAt ?? new Date().toISOString(),
        ...created,
      };

      setProfile((prev) => ({
        ...prev,
        additionalDocuments: [...(prev?.additionalDocuments || []), safeCreated],
      }));

      resetForm();
      setMessage({ type: "success", text: "Document uploaded and saved to profile." });
    } else {
      // Server didn't return created/profile — refetch profile to be safe
      console.warn("Upload response missing created/profile:", json);
      // attempt to reload profile from server
      try {
        const id = profile?._id ?? authUser?._id ?? authUser?.id;
        const profileUrl = id
          ? `${apiBase}/api/professionals/search?id=${encodeURIComponent(id)}`
          : `${apiBase}/api/professionals/me`;
        const headers2 = { Accept: "application/json" };
        if (token) headers2.Authorization = `Bearer ${token}`;
        const r2 = await fetchWithTimeout(profileUrl, { headers: headers2 });
        if (r2.ok) {
          const j2 = await r2.json();
          const found = Array.isArray(j2.data) ? j2.data[0] : j2.data;
          setProfile(found);
        }
      } catch (err) {
        console.warn("Failed to refetch profile after upload:", err);
      }
      resetForm();
      setMessage({ type: "success", text: "Upload succeeded (profile refresh attempted)." });
    }
  } catch (err) {
    setMessage({ type: "error", text: err.message ?? "Upload error" });
  } finally {
    setUploading(false);
  }
};

  const s = {
    container: {
      maxWidth: 950,
      margin: "40px auto",
      padding: "30px",
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    heading: {
      fontSize: 26,
      fontWeight: 700,
      color: "#2d2d2d",
      marginBottom: 24,
      borderBottom: "2px solid #CAAA93",
      paddingBottom: 8,
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      background: "#f9f9f9",
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid #CAAA93",
    },
    name: { fontWeight: 600, fontSize: 18, color: "#333" },
    muted: { color: "#888" },
    card: {
      background: "#fafafa",
      padding: 16,
      borderRadius: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      marginBottom: 16,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    cardHover: { transform: "translateY(-2px)", boxShadow: "0 3px 10px rgba(0,0,0,0.08)" },
    list: { listStyle: "none", padding: 0, margin: 0 },
    listItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #eee",
      padding: "10px 0",
    },
    btnPrimary: {
      backgroundColor: "#CAAA93",
      border: "none",
      padding: "10px 16px",
      borderRadius: 8,
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.2s",
    },
    btnPrimaryHover: { backgroundColor: "#b38e77" },
    btnOutline: {
      background: "#fff",
      border: "1px solid #ccc",
      padding: "8px 14px",
      borderRadius: 8,
      cursor: "pointer",
      transition: "all 0.2s",
    },
    btnOutlineHover: { background: "#f7f7f7" },
    message: {
      padding: "12px 16px",
      borderRadius: 8,
      marginBottom: 16,
      fontWeight: 500,
    },
    form: { display: "grid", gap: 10, marginTop: 20 },
    input: {
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #ccc",
      fontSize: 15,
      outline: "none",
    },
    previewBox: {
      border: "1px dashed #ccc",
      borderRadius: 8,
      padding: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#fdfdfd",
    },
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;
  if (!profile) return <div style={{ padding: 20 }}>No profile found.</div>;

  const sections = [
    { label: "Certificates", items: Array.isArray(profile.certificates) ? profile.certificates : [] },
    { label: "Documents", items: Array.isArray(profile.documents) ? profile.documents : [] },
    {
      label: "Additional Documents",
      items: Array.isArray(profile.additionalDocuments) ? profile.additionalDocuments : [],
    },
  ];

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Documents</h2>

      <div style={s.header}>
        <img src={profile.avatar ?? avatarPlaceholder} alt="avatar" style={s.avatar} />
        <div>
          <div style={s.name}>{profile.name ?? profile.email}</div>
          <div style={s.muted}>{profile.role ?? "Professional"}</div>
        </div>
      </div>

      {message && (
        <div
          style={{
            ...s.message,
            background:
              message.type === "success"
                ? "rgba(46,204,113,0.1)"
                : message.type === "error"
                ? "rgba(231,76,60,0.1)"
                : "rgba(52,152,219,0.1)",
            color:
              message.type === "success"
                ? "#27ae60"
                : message.type === "error"
                ? "#e74c3c"
                : "#2980b9",
            border: `1px solid ${
              message.type === "success"
                ? "#2ecc71"
                : message.type === "error"
                ? "#e74c3c"
                : "#3498db"
            }33`,
          }}
        >
          {message.text}
        </div>
      )}

      {sections.map((sec) => (
        <div key={sec.label} style={s.card}>
          <h4 style={{ marginBottom: 8 }}>{sec.label}</h4>
          {sec.items.length === 0 ? (
            <div style={s.muted}>No {sec.label.toLowerCase()} uploaded.</div>
          ) : (
            <ul style={s.list}>
              {sec.items
                .filter(Boolean) // REMOVE falsy/undefined entries so item is always defined
                .map((item, idx) => (
                  <li
                    key={item?._id ?? item?.fileUrl ?? `${sec.label}-${idx}`}
                    style={s.listItem}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {item?.title ?? item?.type ?? "Untitled"}
                      </div>
                      {item?.description && (
                        <div style={{ color: "#777", fontSize: 13 }}>{item.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => openFile(item?.fileUrl)}
                      style={s.btnOutline}
                      onMouseOver={(e) => Object.assign(e.target.style, s.btnOutlineHover)}
                      onMouseOut={(e) => Object.assign(e.target.style, s.btnOutline)}
                    >
                      Open
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}

      {/* Upload section */}
      <div style={{ ...s.card, marginTop: 30 }}>
        <h4>Upload New Document</h4>
        <form onSubmit={handleUpload} style={s.form}>
          <input
            type="text"
            placeholder="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={s.input}
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ ...s.input, resize: "none" }}
          />
          <div style={s.previewBox}>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{file.name}</div>
                <div style={{ color: "#888", fontSize: 12 }}>
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            )}
          </div>

          {filePreview && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
              <img
                src={filePreview}
                alt="preview"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  objectFit: "cover",
                }}
              />
              <div style={{ color: "#777" }}>Preview</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              type="submit"
              style={s.btnPrimary}
              onMouseOver={(e) => Object.assign(e.target.style, s.btnPrimaryHover)}
              onMouseOut={(e) => Object.assign(e.target.style, s.btnPrimary)}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button
              type="button"
              style={s.btnOutline}
              onMouseOver={(e) => Object.assign(e.target.style, s.btnOutlineHover)}
              onMouseOut={(e) => Object.assign(e.target.style, s.btnOutline)}
              onClick={resetForm}
              disabled={uploading}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
