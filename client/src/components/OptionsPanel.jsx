// Slide-over options panel for mailbox actions, report form, and deletion (Module 1, 2 & 4)
import React, { useState, useRef } from 'react';
import { reportProblem } from '../utils/api';

function OptionsPanel({ parcel, onClose, onSimulate, flashOn, onToggleFlash, onDelete }) {
  const audioRef = useRef(null);
  const [photoVisible, setPhotoVisible] = useState(false);
  const [issueType, setIssueType] = useState('Missing parcel');
  const [description, setDescription] = useState('');
  const [reportMsg, setReportMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const targetId = parcel?.parcelId || parcel?.id;

  const handleAction = async (type) => {
    setErrorMsg('');
    try {
      if (type === 'tamper' && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      if (type === 'snapshot') setPhotoVisible(true);
      await onSimulate(type);
    } catch (err) { setErrorMsg(err.message); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setReportMsg('');
    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('Description must be at least 10 characters.');
      return;
    }
    try {
      await reportProblem(targetId, issueType, description.trim());
      setReportMsg('Report recorded in MongoDB custody history.');
      setDescription('');
    } catch (err) { setErrorMsg(err.message); }
  };

  return (
    <div className="slide-panel-inner">
      <audio ref={audioRef} src="/assets/alert-sound.wav" preload="auto" />
      <div className="panel-header">
        <h5 className="panel-title">Try the mailbox (demo)</h5>
        <button type="button" className="close-text-btn" onClick={onClose}>Close</button>
      </div>

      {errorMsg && <div className="panel-error-line">{errorMsg}</div>}

      <div className="action-buttons-group">
        <button type="button" className="btn-action-card" onClick={() => handleAction('drop')}>
          <span className="btn-action-label">Courier drops a parcel</span>
          <span className="btn-action-hint">Simulated ultrasonic sensor</span>
        </button>
        <button type="button" className="btn-action-card" onClick={() => handleAction('lock')}>
          <span className="btn-action-label">Lock the mailbox</span>
          <span className="btn-action-hint">Simulated servo, relay and solenoid lock</span>
        </button>
        <button type="button" className="btn-action-card" onClick={() => handleAction('snapshot')}>
          <span className="btn-action-label">Take a photo</span>
          <span className="btn-action-hint">Simulated /photo command (ESP32-CAM)</span>
        </button>
        <button type="button" className="btn-action-card" onClick={onToggleFlash}>
          <span className="btn-action-label">Flash on / off</span>
          <span className="btn-action-hint">Simulated /flash command, currently {flashOn ? 'ON' : 'OFF'}</span>
        </button>
        <button type="button" className="btn-action-card" onClick={() => handleAction('tamper')}>
          <span className="btn-action-label">Shake the mailbox</span>
          <span className="btn-action-hint">Simulated shake alert (extra feature)</span>
        </button>
      </div>

      {photoVisible && (
        <div className="photo-preview-box">
          <img src={parcel?.photoUrl || '/assets/camera-placeholder.svg'} alt="ESP32-CAM" className="preview-img" />
          <span className="preview-caption">ESP32-CAM optical capture (/photo)</span>
        </div>
      )}

      <hr className="panel-divider" />
      <h6 className="panel-subhead">Report a problem</h6>
      {reportMsg && <div className="panel-success-line">{reportMsg}</div>}
      <form onSubmit={handleReport} className="panel-form">
        <select className="panel-select" value={issueType} onChange={(e) => setIssueType(e.target.value)}>
          <option value="Missing parcel">Missing parcel</option>
          <option value="Damaged">Damaged</option>
          <option value="Suspicious activity">Suspicious activity</option>
        </select>
        <textarea
          className="panel-textarea"
          rows="3"
          placeholder="Describe the issue (min 10 characters)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" className="btn-secondary-action">Send report</button>
      </form>

      {parcel?.status === 'Collected' && (
        <div className="panel-delete-zone">
          <button type="button" className="danger-text-btn" onClick={onDelete}>Delete this record</button>
        </div>
      )}
    </div>
  );
}

export default OptionsPanel;
