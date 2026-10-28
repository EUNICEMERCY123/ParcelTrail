// Home landing page with two-column hero, visual mailbox status, and workflow icons (Module 1 & 4)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MailboxStatus from '../components/MailboxStatus';
import { TruckIcon, LockIcon, KeyIcon } from '../components/Icons';

const features = [
  { icon: <LockIcon size={20} />, title: 'Immutable History Log', desc: 'Every deposit, lock, and pickup action is recorded in order with tamper detection.' },
  { icon: <KeyIcon size={20} />, title: 'One-Time Pickup Pass', desc: 'Single-use numeric codes expire after collection or after three failed attempts.' },
  { icon: <TruckIcon size={20} />, title: 'Verified Custody Chain', desc: 'Know precisely who handled the package and when physical custody changed hands.' },
  { icon: <TruckIcon size={20} />, title: 'Pickup Spot Redirection', desc: 'Easily reroute awaiting parcels to verified local neighborhood collection points.' }
];

export default function HomePage() {
  const [trackQuery, setTrackQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    window.location.href = `/track.html?tracking=${encodeURIComponent(trackQuery.trim())}`;
  };

  return (
    <div className="home-container page-fade-in">
      <section className="hero-card mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
          <div style={{ flex: '1 1 240px', minWidth: 0, width: '100%' }}>
            <span className="eyebrow-badge" style={{ color: '#b2e4d9', marginBottom: 12 }}>Smart mailbox &bull; Secure parcels</span>
            <h1 className="hero-title">Know who touched your <em>parcel.</em><br />From doorstep to <em>your hand.</em></h1>
            <p className="hero-tagline">Track delivery drops, one-time unlock codes, and custody history in real time.</p>

            <form onSubmit={handleSearch} className="hero-search-bar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5d6f6a" strokeWidth="2" style={{ marginRight: 8, flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search parcel ID or tracking..."
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                Search
              </button>
            </form>

            <div className="hero-quick-chips">
              <span>Try:</span>
              <button type="button" className="chip-tag" onClick={() => setTrackQuery('PRCL-101')}>PRCL-101</button>
              <button type="button" className="chip-tag" onClick={() => setTrackQuery('TRK-54129-IN')}>TRK-54129-IN</button>
            </div>

            <div className="d-flex align-items-center gap-3">
              <Link to="/my-parcels" className="btn btn-hero-white">See my parcels</Link>
              <a href="/track.html" className="btn btn-hero-ghost">Track a parcel</a>
            </div>
          </div>

          <div style={{ flex: '1 1 240px', maxWidth: 360, minWidth: 0, width: '100%' }} className="mailbox-card-wrapper">
            <span className="status-float-pill floating-hero-badge">
              <span className="green-dot" /> Locked &bull; Protected
            </span>
            <div className="p-3 bg-white rounded-4 shadow-sm text-dark">
              <MailboxStatus status="Locked" />
            </div>
          </div>
        </div>
      </section>

      <div className="steps-row">
        <div className="step-card">
          <div className="step-icon-circle mb-3"><TruckIcon size={22} /></div>
          <span className="eyebrow-badge">Step 1</span>
          <h3 className="step-title">Your parcel arrives</h3>
          <p className="step-desc">The courier places the delivery inside the secure mailbox and the app logs the deposit.</p>
        </div>
        <div className="step-card">
          <div className="step-icon-circle mb-3"><LockIcon size={22} /></div>
          <span className="eyebrow-badge">Step 2</span>
          <h3 className="step-title">The mailbox locks</h3>
          <p className="step-desc">The mailbox latches securely. Nobody can open the door without your one-time code.</p>
        </div>
        <div className="step-card">
          <div className="step-icon-circle mb-3"><KeyIcon size={22} /></div>
          <span className="eyebrow-badge">Step 3</span>
          <h3 className="step-title">Share a pickup code</h3>
          <p className="step-desc">Generate a single-use 6-digit code for yourself or family. It unlocks the door once.</p>
        </div>
      </div>

      <section className="mt-4">
        <span className="eyebrow-badge">Features</span>
        <h2 className="section-heading mb-3">Why choose <em>ParcelTrail?</em></h2>
        <div className="feature-grid-2x2">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="teal-icon-box">{f.icon}</div>
              <h4 className="feature-title">{f.title}</h4>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dark-cta-banner">
        <div>
          <h3 className="hero-title" style={{ fontSize: 28, marginBottom: 6 }}>Ready to collect <em>safely?</em></h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>Check your incoming parcels or generate an instant pickup pass.</p>
        </div>
        <Link to="/my-parcels" className="btn btn-hero-white">Open my parcels</Link>
      </section>

      <footer className="home-footer">
        ParcelTrail &bull; Smart Mailbox & Custody Demo &bull; Simulated in-app events
      </footer>
    </div>
  );
}
