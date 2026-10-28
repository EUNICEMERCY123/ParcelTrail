// Slide-over history panel with vertical icon timeline and HTML table view (Module 1 & 4)
import React, { useState } from 'react';
import { BoxIcon, LockIcon, CameraIcon, AlertIcon, KeyIcon, CheckIcon, PinIcon, FlagIcon, ClockIcon } from './Icons';
import { timeAgo } from '../utils/timeAgo';
import { getEventCategory } from '../utils/trackHelpers';

const ICON_MAP = {
  box: BoxIcon,
  lock: LockIcon,
  camera: CameraIcon,
  alert: AlertIcon,
  key: KeyIcon,
  check: CheckIcon,
  pin: PinIcon,
  flag: FlagIcon,
  clock: ClockIcon
};

export default function HistoryPanel({ parcel, onClose }) {
  const [viewMode, setViewMode] = useState('list');
  const events = parcel?.events || [];

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? String(ts) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="slide-panel-inner">
      <div className="panel-header d-flex justify-content-between align-items-center mb-3">
        <h5 className="panel-title m-0">History</h5>
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm">
            <button type="button" className={`btn btn-sm ${viewMode === 'list' ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setViewMode('list')}>List</button>
            <button type="button" className={`btn btn-sm ${viewMode === 'table' ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setViewMode('table')}>Table</button>
          </div>
          <button type="button" className="close-text-btn btn btn-link text-decoration-none p-0 text-muted" onClick={onClose}>Close</button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-muted text-center py-4">Nothing has happened yet.</div>
      ) : viewMode === 'list' ? (
        <div className="timeline-container position-relative ps-3" style={{ borderLeft: '2px solid #e5e8e5', marginLeft: 14 }}>
          {events.map((evt, idx) => {
            const cat = getEventCategory(evt.eventType);
            const IconComp = ICON_MAP[cat] || ClockIcon;
            const isCamera = cat === 'camera';

            return (
              <div key={evt.id || idx} className="timeline-item position-relative mb-4 ps-3">
                <div
                  className="rounded-circle bg-white border border-2 border-success d-flex align-items-center justify-content-center position-absolute"
                  style={{ width: 28, height: 28, left: -28, top: 0, color: '#1b7f4b' }}
                >
                  <IconComp size={14} />
                </div>
                <div className="fw-semibold text-dark small">{evt.eventType}</div>
                <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                  {timeAgo(evt.timestamp)} &bull; {formatTime(evt.timestamp)}
                </div>
                <div className="text-secondary small mt-1" style={{ fontSize: '0.78rem' }}>
                  {evt.sensorType || 'Sensor'} &bull; {evt.isSimulated !== false ? 'Simulated' : 'App'}
                </div>
                {evt.description && <div className="small text-muted mt-1">{evt.description}</div>}
                {isCamera && (
                  <div className="mt-2">
                    <img src="/assets/camera-placeholder.svg" alt="Mailbox interior optical frame" className="rounded border" style={{ width: 96, height: 72, objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle small mb-0">
            <thead className="table-light">
              <tr><th>Time</th><th>Event</th><th>Sensor</th><th>Simulated</th></tr>
            </thead>
            <tbody>
              {events.map((evt, idx) => (
                <tr key={evt.id || idx}>
                  <td className="font-monospace text-muted">{formatTime(evt.timestamp)}</td>
                  <td className="fw-medium">{evt.eventType}</td>
                  <td className="text-muted">{evt.sensorType}</td>
                  <td>{evt.isSimulated !== false ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
