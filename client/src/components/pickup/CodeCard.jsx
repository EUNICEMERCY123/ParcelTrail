// Displays the active 6-digit pickup pass with live countdown timer (Module 4 React Hooks)
import React, { useState, useEffect } from 'react';

// Formats a 6-digit string with a space in the middle
function formatCode(code) {
  if (!code) return '';
  return code.slice(0, 3) + ' ' + code.slice(3, 6);
}

// Renders the active pickup pass card with countdown clock
export default function CodeCard({ pass }) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!pass || !pass.expiresAt) {
      setSecondsLeft(0);
      return;
    }
    const tick = () => {
      const exp = new Date(pass.expiresAt).getTime();
      setSecondsLeft(Math.max(0, Math.floor((exp - Date.now()) / 1000)));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [pass]);

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const timeFormatted = `${m}:${s.toString().padStart(2, '0')}`;
  const collector = (pass && pass.collectorName) ? pass.collectorName : 'Anyone';
  const initial = collector.charAt(0).toUpperCase();
  const codeVal = (pass && pass.code) ? pass.code : '';

  return (
    <div className="code-display-card p-3 rounded bg-light border text-center mb-3">
      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
        <div
          className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center"
          style={{ width: 32, height: 32, fontSize: 14 }}
        >
          {initial}
        </div>
        <div className="fw-semibold text-dark">{collector}</div>
      </div>
      <div className="code-value large-pickup-code font-monospace fs-1 fw-bold text-success my-2" style={{ letterSpacing: 4 }}>
        {formatCode(codeVal)}
      </div>
      <div className="text-muted small">
        Valid for <strong className="text-dark">{timeFormatted}</strong> more minutes
      </div>
      <div className="text-muted small mt-1">Works one time only.</div>
    </div>
  );
}
