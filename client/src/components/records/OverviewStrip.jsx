// Metric summary cards strip for management records (Module 4 React Components)
import React from 'react';

// Renders four metric summary cards for parcel statistics
export default function OverviewStrip({ stats }) {
  const s = stats || {};
  const cards = [
    { label: 'Total parcels', value: s.total || 0 },
    { label: 'Waiting for pickup', value: s.waiting || 0 },
    { label: 'Open incidents', value: s.openIncidents || 0 },
    { label: 'Active pickup codes', value: s.activePasses || 0 }
  ];

  return (
    <div className="overview-strip d-flex gap-3 mb-4 flex-wrap">
      {cards.map((c) => (
        <div key={c.label} className="overview-card p-3 rounded bg-white flex-grow-1 border">
          <div className="overview-num fs-3 fw-bold text-dark">{c.value}</div>
          <div className="overview-lbl text-muted small">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
