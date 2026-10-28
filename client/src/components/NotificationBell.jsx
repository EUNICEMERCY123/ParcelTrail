// Recent activity notification dropdown (Module 4 React Hooks)
import React, { useState, useEffect } from 'react';
import { fetchNotifications } from '../utils/api';

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchNotifications().then(setEvents).catch(() => setEvents([]));
  }, []);

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? String(ts) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="activity-bell-wrapper">
      <button
        type="button"
        className="activity-bell-btn"
        onClick={() => setOpen(!open)}
        aria-label="Recent activity"
        title="Recent activity"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {events.length > 0 && (
          <span className="bell-badge">{events.length}</span>
        )}
      </button>

      {open && (
        <div className="activity-dropdown-card">
          <div className="activity-header">
            <strong>Recent Activity</strong>
            <button type="button" className="close-text-btn" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>

          {events.length === 0 ? (
            <p className="activity-empty">No recent activity logged.</p>
          ) : (
            <ul className="activity-list">
              {events.map((evt, idx) => (
                <li key={evt.id || idx} className="activity-item">
                  <div className="activity-item-title">{evt.eventType}</div>
                  <div className="activity-item-sub">
                    {evt.itemDescription || evt.parcelId} &bull; {formatTime(evt.timestamp)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="activity-footer-note">In-app only, simulated</div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
