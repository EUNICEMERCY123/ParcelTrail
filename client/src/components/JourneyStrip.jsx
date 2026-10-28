// Simulated parcel journey progress strip on map (Module 1 CSS & Module 4 React)
import React, { useMemo } from 'react';

export default function JourneyStrip({ parcel }) {
  const isRedirected = parcel?.status === 'Redirected';

  const stops = useMemo(() => {
    if (isRedirected) {
      return ['Courier hub', 'Your mailbox', 'Pickup spot', 'Collected'];
    }
    return ['Courier hub', 'Your mailbox', 'Collected'];
  }, [isRedirected]);

  const { activeIndex, dotClass } = useMemo(() => {
    const s = parcel?.status || 'Expected';
    if (s === 'Expected') {
      return { activeIndex: 0.5, dotClass: 'dot-in-transit' };
    }
    if (s === 'Deposited' || s === 'Locked' || s === 'Tamper Alert') {
      return { activeIndex: 1, dotClass: 'dot-mailbox' };
    }
    if (s === 'Redirected') {
      return { activeIndex: 2, dotClass: 'dot-redirected' };
    }
    if (s === 'Collected') {
      return { activeIndex: stops.length - 1, dotClass: 'dot-collected' };
    }
    return { activeIndex: 0, dotClass: '' };
  }, [parcel?.status, stops.length]);

  const leftPercent = useMemo(() => {
    const total = stops.length - 1;
    return Math.min(100, Math.max(0, (activeIndex / total) * 100));
  }, [activeIndex, stops.length]);

  return (
    <div className="journey-strip-card">
      <div className="journey-strip-header">
        <span className="journey-label">Parcel journey</span>
        <span className="journey-tag">Simulated movement</span>
      </div>

      <div className="journey-track-area">
        <div className="journey-track-line-bg" />
        <div
          className={`journey-track-line-fill ${isRedirected ? 'dashed-active' : ''}`}
          style={{ width: `${leftPercent}%` }}
        />

        <div
          className={`journey-dot ${dotClass}`}
          style={{ left: `${leftPercent}%` }}
        >
          {parcel?.status === 'Collected' ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /></svg>
          )}
        </div>

        <div className="journey-stops-row">
          {stops.map((label, idx) => {
            const isCompleted = activeIndex >= idx;
            return (
              <div key={label} className={`journey-stop-node ${isCompleted ? 'completed' : ''}`}>
                <div className="stop-dot" />
                <span className="stop-text">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
