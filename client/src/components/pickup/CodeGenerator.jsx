// Form component to issue a temporary 6-digit pickup code (Module 1 Forms & Module 4 React)
import React, { useState } from 'react';
import { issuePickupPass } from '../../utils/api';
import { KeyIcon } from '../Icons';

export default function CodeGenerator({ targetId, onCreated }) {
  const [collectorName, setCollectorName] = useState('');
  const [minutesValid, setMinutesValid] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!collectorName.trim() || collectorName.trim().length < 2) {
      setErrorMsg('Collector name must be at least 2 letters.');
      return;
    }
    const mins = parseInt(minutesValid, 10);
    if (isNaN(mins) || mins < 1 || mins > 120) {
      setErrorMsg('Validity must be between 1 and 120 minutes.');
      return;
    }
    setLoading(true);
    try {
      const updated = await issuePickupPass(targetId, collectorName.trim(), mins);
      onCreated(updated);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel-form">
      {errorMsg && <div className="panel-error-line">{errorMsg}</div>}
      <label className="form-field-label">Collector name</label>
      <input
        type="text"
        className="panel-input"
        placeholder="e.g. Meera"
        value={collectorName}
        onChange={(e) => setCollectorName(e.target.value)}
      />
      <label className="form-field-label">Valid for (minutes)</label>
      <input
        type="number"
        min="1"
        max="120"
        className="panel-input"
        value={minutesValid}
        onChange={(e) => setMinutesValid(e.target.value)}
      />
      <button type="submit" className="btn-primary-action d-flex align-items-center justify-content-center gap-2" disabled={loading}>
        <KeyIcon size={18} />
        <span>Create code</span>
      </button>
    </form>
  );
}
