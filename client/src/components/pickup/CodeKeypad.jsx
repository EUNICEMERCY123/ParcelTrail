// Simulated physical mailbox keypad input for passcode verification (Module 2 & 4)
import React, { useState } from 'react';
import { verifyPickupPass } from '../../utils/api';

// Mailbox keypad form component allowing user to enter and test pickup passcode
export default function CodeKeypad({ targetId, onVerified }) {
  const [inputCode, setInputCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Verifies the entered 6-digit passcode against the backend
  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFeedback('');
    setLoading(true);
    try {
      const res = await verifyPickupPass(targetId, inputCode.trim());
      onVerified(res.parcel);
      if (res.success) {
        setFeedback('Mailbox opened. Parcel picked up.');
      } else {
        const remaining = res.parcel && res.parcel.pickupPass ? res.parcel.pickupPass.attemptsRemaining : 0;
        if (remaining > 0) {
          setErrorMsg(`Wrong code. ${remaining} tries left.`);
        } else {
          setErrorMsg(res.message || 'Pass locked.');
        }
      }
      setInputCode('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="keypad-section mt-3 pt-2">
      <h6 className="panel-subhead fw-semibold small text-secondary mb-2">Try the mailbox keypad</h6>
      {feedback && <div className="panel-success-line alert alert-success py-1 small">{feedback}</div>}
      {errorMsg && <div className="panel-error-line alert alert-danger py-1 small">{errorMsg}</div>}
      <form onSubmit={handleVerify} className="panel-form">
        <input
          type="text"
          maxLength="6"
          className="keypad-input form-control form-control-lg text-center font-monospace mb-2"
          placeholder="000000"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
          style={{ letterSpacing: 6, fontSize: 24 }}
        />
        <button
          type="submit"
          className="btn-primary-action btn btn-success w-100 py-2 fw-semibold"
          disabled={inputCode.length !== 6 || loading}
        >
          Open the mailbox
        </button>
      </form>
      <p className="panel-note-footer text-muted small mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
        3 tries allowed. Demo only: a real mailbox would send this code by text message.
      </p>
    </div>
  );
}
