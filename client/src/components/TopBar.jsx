// Sticky top navigation bar with brand logo, nav links and responsive menu (Module 1 & 4)
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/my-parcels', label: 'My parcels' },
    { to: '/records', label: 'Records' },
    { to: '/pickup-points', label: 'Pickup spots' },
    { to: '/track.html', label: 'Track', external: true },
    { to: '/help.html', label: 'Help', external: true }
  ];

  return (
    <header className="top-bar-outer">
      <div className="top-bar-inner">
        <NavLink
          to="/"
          className="brand-logo-group"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
        >
          <div className="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span
              className="brand-name"
              style={{ fontFamily: "'Fraunces', serif", fontSize: '24px', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}
            >
              ParcelTrail
            </span>
            <span
              className="brand-sub"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', marginTop: '2px' }}
            >
              Smart mailbox, secure parcels
            </span>
          </div>
        </NavLink>

        <nav className="desktop-nav-links">
          {navLinks.map((link) => (
            link.external ? (
              <a key={link.to} href={link.to} className="nav-pill-link">
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'nav-pill-link active' : 'nav-pill-link')}
              >
                {link.label}
              </NavLink>
            )
          ))}
        </nav>

        <div className="top-bar-actions">
          <NavLink to="/my-parcels" className="btn btn-primary d-none d-sm-inline-flex" style={{ padding: '8px 18px', fontSize: '14px' }}>
            My parcels
          </NavLink>
          <a href="/track.html" className="btn btn-secondary nav-track-pill d-none d-xl-inline-flex" style={{ padding: '8px 18px', fontSize: '14px' }}>
            Track
          </a>
          <NotificationBell />
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="menu-btn-text">Menu</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-dropdown-card" onClick={() => setMenuOpen(false)}>
          {navLinks.map((link) => (
            link.external ? (
              <a key={link.to} href={link.to} className="dropdown-link-item">
                {link.label}
              </a>
            ) : (
              <NavLink key={link.to} to={link.to} className="dropdown-link-item">
                {link.label}
              </NavLink>
            )
          ))}
        </div>
      )}
    </header>
  );
}
