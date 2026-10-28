// Memoized parcel list tile with status icon, sender, and relative update time (Module 4 React.memo)
import React from 'react';
import { getParcelStatusInfo } from '../utils/labels';
import { BoxIcon } from './Icons';
import { timeAgo } from '../utils/timeAgo';

const TINT_MAP = {
  Expected: { bg: '#f0f2f1', color: '#6b7280' },
  Deposited: { bg: '#eff6ff', color: '#2563eb' },
  Locked: { bg: '#e7f4ec', color: '#1b7f4b' },
  'Tamper Alert': { bg: '#fde8e8', color: '#e5484d' },
  Collected: { bg: '#f1f5f9', color: '#475569' },
  Redirected: { bg: '#fff7ed', color: '#d97706' }
};

// Renders a memoized list item tile representing a single parcel
const ParcelCard = React.memo(function ParcelCard({ parcel, isSelected, onSelect }) {
  const pid = parcel.parcelId || parcel.id;
  const statusInfo = getParcelStatusInfo(parcel);
  const tint = TINT_MAP[parcel.status] || TINT_MAP.Expected;

  let lastTime = parcel.createdAt;
  if (parcel.events && parcel.events.length > 0 && parcel.events[0].timestamp) {
    lastTime = parcel.events[0].timestamp;
  }

  return (
    <div
      className={`parcel-card parcel-card-item d-flex gap-3 align-items-center p-2 mb-2 rounded border bg-white ${isSelected ? 'border-success shadow-sm' : ''}`}
      onClick={() => onSelect(pid)}
      role="button"
      style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
    >
      <div
        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 36, height: 36, backgroundColor: tint.bg, color: tint.color }}
      >
        <BoxIcon size={20} />
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="fw-semibold text-truncate text-dark" style={{ fontSize: 14 }}>
          {parcel.itemDescription}
        </div>
        <div className="small text-muted text-truncate" style={{ fontSize: 12 }}>
          From {parcel.sender}
        </div>
        <div className="d-flex align-items-center justify-content-between mt-1">
          <span className={`status-pill pill-${statusInfo.pill}`} style={{ fontSize: 11, padding: '2px 8px' }}>
            <span className="status-dot" />
            <span>{statusInfo.label}</span>
          </span>
          <span className="text-muted" style={{ fontSize: 11 }}>
            Updated {timeAgo(lastTime)}
          </span>
        </div>
      </div>
    </div>
  );
});

export default ParcelCard;
