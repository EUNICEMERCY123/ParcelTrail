// Pickup passes lifecycle table with state filter and cancellation (Module 4 React UI)
import React, { useState, useEffect } from 'react';
import { fetchRecordsPasses, cancelPickupPass } from '../../utils/recordsApi';

const BADGE_MAP = {
  active: 'bg-success',
  used: 'bg-secondary',
  expired: 'bg-warning text-dark',
  locked: 'bg-danger'
};

export default function PassesTab({ onDataChanged }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stateFilter, setStateFilter] = useState('');

  const loadPasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecordsPasses(stateFilter ? { state: stateFilter } : {});
      setPasses(data);
    } catch {
      setError('Cannot reach the server. Start it with npm run dev inside the server folder.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadPasses(); }, [stateFilter]);

  const handleCancel = async (parcelId) => {
    if (!window.confirm('Cancel pickup pass for this parcel?')) return;
    try {
      await cancelPickupPass(parcelId);
      loadPasses();
      if (onDataChanged) onDataChanged();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="passes-tab">
      <div className="d-flex gap-2 mb-3">
        <select className="form-select form-select-sm" style={{ width: 170 }} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="">All pass states</option>
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
          <option value="locked">Locked</option>
        </select>
      </div>

      {loading && <div className="text-muted py-3">Loading...</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {!loading && !error && passes.length === 0 && <div className="text-muted py-4 text-center">No pickup passes found.</div>}

      {!loading && !error && passes.length > 0 && (
        <div className="table-responsive bg-white rounded border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted">
              <tr><th>Parcel</th><th>Collector</th><th>Expires</th><th>Tries left</th><th>State</th><th>Action</th></tr>
            </thead>
            <tbody>
              {passes.map((p, idx) => (
                <tr key={`${p.parcelId}-${idx}`}>
                  <td>
                    <div className="fw-semibold text-dark">{p.itemDescription}</div>
                    <div className="small text-muted">{p.parcelId}</div>
                  </td>
                  <td>{p.collectorName || 'Anyone with code'}</td>
                  <td className="small text-muted">{new Date(p.expiresAt).toLocaleString()}</td>
                  <td className="fw-semibold">{p.attemptsRemaining}</td>
                  <td>
                    <span className={`badge ${BADGE_MAP[p.state] || 'bg-secondary'}`}>{p.state}</span>
                  </td>
                  <td>
                    {p.state === 'active' && (
                      <button className="btn btn-link p-0 small text-danger text-decoration-none" onClick={() => handleCancel(p.parcelId)}>Cancel pass</button>
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
