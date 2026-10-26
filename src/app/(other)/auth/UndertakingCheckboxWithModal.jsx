import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export default function UndertakingCheckboxWithModal({
  value = false,
  onChange = () => {},
  shortText = "Undertaking —“I do hereby declare and undertake that the personal details provided by me are true and correct in all respects, and I shall be wholly liable for any consequences arising out of any inaccuracy, misstatement or concealment of facts.”",
  agreeLabel = "Agree",
  disagreeLabel = "Disagree",
}) {
  const [showModal, setShowModal] = useState(false);

  const handleCheckboxClick = (e) => {
    if (value) {
      onChange(false);
      return;
    }
    setShowModal(true);
  };

  const handleAgree = () => {
    onChange(true);
    setShowModal(false);
  };

  const handleDisagree = () => {
    onChange(false);
    setShowModal(false);
  };

  const modalContentStyle = {
    background: "linear-gradient(180deg,#CAAA93,#D4B8A2)",
    color: "#2b0f0f",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    maxHeight: "72vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const modalBodyStyle = {
    overflowY: "auto",
    paddingRight: 6,
    marginBottom: 8,
    lineHeight: 1.45,
    color: "#2b0f0f",
  };

  const titleStyle = {
    fontSize: 22,
    fontWeight: 700,
    color: "#2b0f0f",
  };

  const buttonAgreeStyle = {
    background: "linear-gradient(90deg,#7b4b3a,#5b2a25)",
    border: "none",
    color: "#fff",
    fontWeight: 700,
    borderRadius: 8,
    padding: "8px 16px",
  };

  const buttonDisagreeStyle = {
    background: "transparent",
    border: "1px solid rgba(43,15,15,0.12)",
    color: "#2b0f0f",
    fontWeight: 700,
    borderRadius: 8,
    padding: "8px 16px",
  };

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", width: "100%" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none", flex: "1 1 auto" }}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={() => {}}
            onClick={handleCheckboxClick}
            style={{ width: 18, height: 18 }}
          />
          <span style={{ fontSize: 14, color: "#1f1f1f", lineHeight: 1.2 }}>
            {shortText} <span style={{ color: "#b91c1c" }}>*</span>
          </span>
        </label>
       
      </div>

      <Modal show={showModal} onHide={handleDisagree} centered size="lg" dialogClassName="undertaking-modal-dialog">
        <div style={modalContentStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={titleStyle}>Undertaking & Terms for Professionals</div>
            <button onClick={handleDisagree} aria-label="Close" style={{ background: "transparent", border: "none", fontSize: 22, color: "#2b0f0f", cursor: "pointer" }}>×</button>
          </div>

          <div style={modalBodyStyle}>
            <p style={{ marginTop: 0, fontWeight: 700 }}>Please read carefully before agreeing</p>

            <p>By agreeing you confirm that all information and documents uploaded during registration are true, accurate and your own. You agree to comply with Shaadi Undo’s Terms & Conditions for Professionals, to act professionally and ethically in all interactions, and to follow the Platform’s booking, cancellation and dispute processes.</p>

            <h4 style={{ marginBottom: 6 }}>Key Definitions</h4>
            <p><strong>User / Client</strong>: a person who books sessions through the Platform. <strong>Session / Booking</strong>: a scheduled paid appointment arranged via the Platform. <strong>Confirmed Booking</strong>: a booking marked as confirmed by the Platform and (where applicable) paid or authorised by the User.</p>

            <h4 style={{ marginBottom: 6 }}>Registration & Representations</h4>
            <p>You represent and warrant that you hold all licences, qualifications and permissions required to lawfully provide the services you list. You must notify Shaadi Undo immediately if any registration information or documents change.</p>

            <h4 style={{ marginBottom: 6 }}>Professional Conduct</h4>
            <p>You will act professionally and within the scope of your qualifications. You will present accurate session length, fees and cancellation conditions to Users. You are responsible for any professional advice given to Users and for maintaining appropriate insurance if applicable.</p>

            <h4 style={{ marginBottom: 6 }}>Bookings, Payments & Fees</h4>
            <p>Sessions are booked through the Platform. Shaadi Undo may collect fees or commissions and will remit payments to you according to the Platform payout schedule. Platform fees, taxes and any penalties may be deducted from payouts. The Platform may hold or process payments and disburse them as described in payout settings.</p>

            <h4 style={{ marginBottom: 6 }}>Cancellation, Rejection & No-show Policy</h4>
            <p><strong>Professional cancellation:</strong> cancelling a Confirmed Booking without a valid reason (for example, an emergency communicated and verified to the Platform) may attract penalties.</p>
            <p><strong>Repeated rejection/cancellation:</strong> if you reject, cancel or are a no-show for Confirmed Bookings more than <strong>2 times</strong> in any rolling 30-day period, Shaadi Undo may (at its discretion): (a) deduct a penalty of <strong>₹500</strong> per such instance from amounts due to you or charge the payment method on file; (b) temporarily hide or suspend your profile for <strong>7 days</strong> (or until review); (c) apply further sanctions including extended suspension or termination. The Platform will where practicable notify you prior to suspension and provide counts and reasons. You may appeal any penalty by contacting support within 7 days.</p>
            <p><strong>No-show:</strong> failure to join a scheduled session and not notifying the User or Platform will be treated as a cancellation for penalty purposes.</p>
            <p><strong>User cancellations:</strong> User cancellations and refund rules are governed by the User cancellation policy. Valid user refunds may lead to recovery from your payouts.</p>

            <h4 style={{ marginBottom: 6 }}>Refunds & Recovery</h4>
            <p>If the Platform issues a valid refund to a User, Shaadi Undo may recover refunded amounts from future payouts to you or from any account balance. Penalties under the cancellation policy will be itemised on your payout statement.</p>

            <h4 style={{ marginBottom: 6 }}>Suspension & Termination</h4>
            <p>Shaadi Undo may suspend or terminate your access or hide your profile immediately upon reasonable belief of breach of these Terms, fraud, malpractice or actions which pose risk to Users. Outstanding claims, refunds or recoveries remain payable after termination.</p>

            <h4 style={{ marginBottom: 6 }}>Confidentiality & Data</h4>
            <p>You must handle User personal and sensitive information in accordance with applicable laws and the Platform Privacy Policy. You consent to the Platform’s processing of personal data as necessary to operate services, make payouts and enforce these Terms.</p>

            <h4 style={{ marginBottom: 6 }}>Liability & Indemnity</h4>
            <p>You indemnify Shaadi Undo for claims arising from your services, representations, or breach. Shaadi Undo is a technology platform and does not provide professional services; to the extent permitted by law its liability is limited as described in the Platform policies.</p>

            <h4 style={{ marginBottom: 6 }}>Governing Law & Dispute Resolution</h4>
            <p>These Terms are governed by the laws of India (or the jurisdiction specified by the Platform). Parties will first attempt to resolve disputes by negotiation; unresolved disputes may proceed to arbitration or court as set out in Platform policy.</p>

            <h4 style={{ marginBottom: 6 }}>Amendments & Contact</h4>
            <p>Shaadi Undo may update these Terms; material changes will be notified. For questions, appeals or support contact: <a href="mailto:support@shaadiundo.example" style={{ color: "#2b0f0f" }}>support@shaadiundo.example</a>.</p>

            <p style={{ marginBottom: 0, fontSize: 13 }}>By clicking Agree you accept these Terms & Conditions and acknowledge that Shaadi Undo may apply penalties and temporary profile hiding for repeated cancellations, rejections or no-shows as described above. Replace the bracketed policy values (counts, ₹ amounts, days) with your final platform policy where required.</p>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <button onClick={handleDisagree} style={buttonDisagreeStyle}>{disagreeLabel}</button>
            <button onClick={handleAgree} style={buttonAgreeStyle}>{agreeLabel}</button>
          </div>
        </div>
      </Modal>

      <style>{`
        .undertaking-modal-dialog .modal-content { background: transparent; border: none; }
        @media (max-width: 575.98px) {
          .undertaking-modal-dialog { max-width: 94% !important; margin: 12px auto; }
        }
        @media (min-width: 576px) and (max-width: 991.98px) {
          .undertaking-modal-dialog { max-width: 92% !important; }
        }
        @media (min-width: 992px) {
          .undertaking-modal-dialog { max-width: 880px; }
        }
        .undertaking-modal-dialog .modal-body { padding: 0; }
      `}</style>
    </>
  );
}
<style>{`
    .undertaking-modal-dialog .modal-content { background: transparent; border: none; }
    @media (max-width: 575.98px) {
        .undertaking-modal-dialog { max-width: 94% !important; margin: 12px auto; }
    }
    @media (min-width: 576px) and (max-width: 991.98px) {
        .undertaking-modal-dialog { max-width: 92% !important; }
    }
    @media (min-width: 992px) {
        .undertaking-modal-dialog { max-width: 880px; }
    }
    .undertaking-modal-dialog .modal-body { padding: 0; }
    .undertaking-btn-agree {
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(123, 75, 58, 0.3);
    }
    .undertaking-btn-agree:hover {
        background-color: rgba(123, 75, 58, 0.1); /* Light color on hover */
        box-shadow: 0 8px 20px rgba(123, 75, 58, 0.5);
        transform: translateY(-2px);
    }
    .undertaking-btn-disagree {
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(43, 15, 15, 0.1);
    }
    .undertaking-btn-disagree:hover {
        background-color: rgba(43, 15, 15, 0.1); /* Light color on hover */
        box-shadow: 0 6px 16px rgba(43, 15, 15, 0.2);
        transform: translateY(-2px);
    }
`}</style>