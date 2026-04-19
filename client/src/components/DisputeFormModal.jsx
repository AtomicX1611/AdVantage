import React, { useState } from "react";

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "16px",
};

const modalCardStyle = {
  width: "100%",
  maxWidth: "640px",
  background: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 18px 50px rgba(0, 0, 0, 0.2)",
  padding: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "6px",
  display: "block",
  color: "#374151",
};

const DisputeFormModal = ({ isOpen, onClose, onSubmit, submitting }) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      alert("Subject and detailed description are required.");
      return;
    }

    await onSubmit({
      subject: subject.trim(),
      description: description.trim(),
      files,
    });

    setSubject("");
    setDescription("");
    setFiles([]);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalCardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: "8px", fontSize: "22px" }}>
          Raise Dispute
        </h3>
        <p style={{ marginTop: 0, color: "#6b7280", fontSize: "14px" }}>
          Describe the issue clearly and upload supporting proof files if available.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label htmlFor="dispute-subject" style={labelStyle}>Subject</label>
            <input
              id="dispute-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              style={inputStyle}
              placeholder="Short title of the issue"
              required
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label htmlFor="dispute-description" style={labelStyle}>Detailed Description</label>
            <textarea
              id="dispute-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              style={{ ...inputStyle, minHeight: "140px", resize: "vertical" }}
              placeholder="Explain timeline, defect/fraud signs, communication attempts, and what resolution you expect"
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="dispute-proofs" style={labelStyle}>Proof Uploads (optional)</label>
            <input
              id="dispute-proofs"
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            <p style={{ marginTop: "8px", marginBottom: 0, fontSize: "12px", color: "#6b7280" }}>
              You can attach images or PDF documents as evidence.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: "none",
                background: "#dc2626",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Dispute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeFormModal;
