// Activity audit trail table tab with event type and parcel filters (Module 4 React UI)
import React, { useState, useEffect } from 'react';
import { fetchRecordsActivity } from '../../utils/recordsApi';

export default function ActivityTab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ parcelId: '', type: '' });

  const loadData = async (targetPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecordsActivity({ ...filters, page: targetPage, limit: 10 });
      setItems(res.items || []);
      setTotal(res.total || 0);
      setPage(res.page || 1);
      setPages(res.pages || 1);
    } catch {
      setError('Cannot reach the server. Start it with npm run dev inside the server folder.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(1); }, [filters]);

  return (
    <div className="activity-tab">
      <div className="d-flex gap-2 mb-3">
        <input className="form-control form-control-sm" style={{ width: 170 }} placeholder="Filter parcel ID..." value={filters.parcelId} onChange={(e) => setFilters({ ...filters, parcelId: e.target.value })} />
        <input className="form-control form-control-sm" style={{ width: 170 }} placeholder="Filter event type..." value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} />
      </div>

      {loading && <div className="text-muted py-3">Loading...</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="text-muted py-4 text-center">No activity events recorded.</div>}

      {!loading && !error && items.length > 0 && (
        <div className="table-responsive bg-white rounded border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted">
              <tr><th>Time</th><th>Parcel</th><th>Event</th><th>Source</th><th>Description</th></tr>
            </thead>
            <tbody>
              {items.map((ev, idx) => (
                <tr key={`${ev.id || idx}`}>
                  <td className="small text-muted text-nowrap">{new Date(ev.timestamp).toLocaleString()}</td>
                  <td>
                    <div className="fw-semibold text-dark">{ev.itemDescription}</div>
                    <div className="small text-muted">{ev.parcelId}</div>
                  </td>
                  <td><span className="badge bg-light text-dark border">{ev.eventType}</span></td>
                  <td>
                    <span className="small text-secondary">{ev.sensorType === 'App' ? 'App' : 'Simulated sensor'}</span>
                  </td>
                  <td className="small text-secondary">{ev.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex align-items-center gap-2 mt-3 pt-2">
        <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); loadData(p); }}>Previous</button>
        <span className="small text-muted">Page {page} of {pages}</span>
        <button className="btn btn-sm btn-outline-secondary" disabled={page >= pages} onClick={() => { const p = page + 1; setPage(p); loadData(p); }}>Next</button>
        <span className="small text-muted ms-2">({total} events)</span>
      </div>
    </div>
  );
}
