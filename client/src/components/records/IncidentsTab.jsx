// Incidents table tab with status/type filters and resolution flow (Module 4 React UI)
import React, { useState, useEffect } from 'react';
import { fetchRecordsIncidents, resolveIncident } from '../../utils/recordsApi';

export default function IncidentsTab({ onDataChanged }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [resolvingId, setResolvingId] = useState(null);
  const [note, setNote] = useState('');

  const loadIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecordsIncidents(filters);
      setIncidents(data);
    } catch {
      setError('Cannot reach the server. Start it with npm run dev inside the server folder.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadIncidents(); }, [filters]);

  const handleResolve = async (parcelId, reportId) => {
    try {
      await resolveIncident(parcelId, reportId, note);
      setResolvingId(null);
      setNote('');
      loadIncidents();
      if (onDataChanged) onDataChanged();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="incidents-tab">
      <div className="d-flex gap-2 mb-3">
        <select className="form-select form-select-sm" style={{ width: 160 }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select className="form-select form-select-sm" style={{ width: 180 }} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All types</option>
          <option value="Tamper Alert">Tamper Alert</option>
          <option value="Damage">Damage</option>
          <option value="Late">Late</option>
          <option value="Missing">Missing</option>
        </select>
      </div>

      {loading && <div className="text-muted py-3">Loading...</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {!loading && !error && incidents.length === 0 && <div className="text-muted py-4 text-center">No incidents. All clear.</div>}

      {!loading && !error && incidents.length > 0 && (
        <div className="table-responsive bg-white rounded border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted">
              <tr><th>Parcel</th><th>Type</th><th>Description</th><th>Reported on</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <div className="fw-semibold text-dark">{inc.itemDescription}</div>
                    <div className="small text-muted">{inc.parcelId}</div>
                  </td>
                  <td><span className="badge bg-light text-dark border">{inc.type}</span></td>
                  <td className="small text-secondary" style={{ maxWidth: 280 }}>
                    <div>{inc.description}</div>
                    {inc.resolutionNote && <div className="text-success mt-1 small"><strong>Resolution:</strong> {inc.resolutionNote}</div>}
                  </td>
                  <td className="small text-muted">{new Date(inc.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${inc.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}`}>{inc.status}</span>
                  </td>
                  <td>
                    {inc.status === 'Open' && resolvingId !== inc.id && (
                      <button className="btn btn-sm btn-outline-success py-0 px-2" onClick={() => { setResolvingId(inc.id); setNote(''); }}>Resolve</button>
                    )}
                    {resolvingId === inc.id && (
                      <div className="d-flex flex-column gap-1">
                        <input className="form-control form-control-sm" placeholder="Resolution note (max 200)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-success py-0 px-2" onClick={() => handleResolve(inc.parcelId, inc.id)}>Mark resolved</button>
                          <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setResolvingId(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
