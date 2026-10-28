// Records and audit management page (Module 4 React UI)
import React, { useState, useEffect } from 'react';
import OverviewStrip from '../components/records/OverviewStrip';
import ParcelsTab from '../components/records/ParcelsTab';
import IncidentsTab from '../components/records/IncidentsTab';
import PassesTab from '../components/records/PassesTab';
import ActivityTab from '../components/records/ActivityTab';
import { fetchRecordsStats } from '../utils/recordsApi';

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState('parcels');
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    try {
      const data = await fetchRecordsStats();
      setStats(data);
    } catch { /* Handled in tabs */ }
  };

  useEffect(() => { loadStats(); }, []);

  const tabs = [
    { key: 'parcels', label: 'Parcels' },
    { key: 'incidents', label: 'Incidents' },
    { key: 'passes', label: 'Passes' },
    { key: 'activity', label: 'Activity' }
  ];

  return (
    <div className="container py-4 page-fade-in">
      <div className="mb-4">
        <span className="eyebrow-badge">Audit & Records</span>
        <h2 className="section-heading mb-1">Records and <em>custody.</em></h2>
        <p className="text-muted small mb-0">Track all mailbox parcels, unresolved incidents, active codes, and device events.</p>
      </div>

      <OverviewStrip stats={stats} />

      <ul className="nav nav-pills mb-4 gap-2">
        {tabs.map((t) => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === 'parcels' && <ParcelsTab onDataChanged={loadStats} />}
      {activeTab === 'incidents' && <IncidentsTab onDataChanged={loadStats} />}
      {activeTab === 'passes' && <PassesTab onDataChanged={loadStats} />}
      {activeTab === 'activity' && <ActivityTab />}
    </div>
  );
}
