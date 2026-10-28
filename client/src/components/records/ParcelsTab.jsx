// Parcels table tab with search, status filters, inline edit, and CSV export (Module 4 React)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecordsParcels, updateParcel } from '../../utils/recordsApi';
import { deleteParcel } from '../../utils/api';
import { downloadCsv } from '../../utils/csv';
import ParcelRecordRow from './ParcelRecordRow';

export default function ParcelsTab({ onDataChanged }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', from: '', to: '', sort: 'newest' });

  const loadData = async (targetPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecordsParcels({ ...filters, page: targetPage, limit: 8 });
      setItems(res.items || []);
      setTotal(res.total || 0);
      setPage(res.page || 1);
      setPages(res.pages || 1);
    } catch {
      setError('Cannot reach the server. Start it with npm run dev inside the server folder.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(1); }, [filters]);

  const handleSaveEdit = async (parcelId, data) => {
    try {
      await updateParcel(parcelId, data);
      loadData(page);
      if (onDataChanged) onDataChanged();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (parcelId) => {
    if (!window.confirm(`Delete parcel ${parcelId}?`)) return;
    try {
      await deleteParcel(parcelId);
      loadData(page);
      if (onDataChanged) onDataChanged();
    } catch (e) { alert(e.message); }
  };

  const handleDownloadCsv = async () => {
    try {
      const res = await fetchRecordsParcels({ ...filters, limit: 1000 });
      const cols = [
        { label: 'Parcel ID', key: 'parcelId' }, { label: 'Item', key: 'itemDescription' },
        { label: 'Sender', key: 'sender' }, { label: 'Tracking Number', key: 'trackingNumber' },
        { label: 'Status', key: 'status' }, { label: 'Expected Date', key: 'expectedDate' },
        { label: 'Added Date', key: 'createdAt' }
      ];
      downloadCsv('parcels-records.csv', cols, res.items || []);
    } catch (e) { alert('Failed to download CSV: ' + e.message); }
  };

  return (
    <div className="parcels-tab">
      <div className="filter-row d-flex flex-wrap gap-2 mb-3 align-items-center">
        <input className="form-control form-control-sm" style={{ width: 180 }} placeholder="Search item, sender..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select className="form-select form-select-sm" style={{ width: 160 }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="Expected">On its way</option>
          <option value="Deposited">In your mailbox</option>
          <option value="Locked">Locked and safe</option>
          <option value="Tamper Alert">Mailbox was shaken</option>
          <option value="Collected">Picked up</option>
          <option value="Redirected">Sent to pickup spot</option>
        </select>
        <input type="date" className="form-control form-control-sm" style={{ width: 140 }} title="From date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input type="date" className="form-control form-control-sm" style={{ width: 140 }} title="To date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <select className="form-select form-select-sm" style={{ width: 130 }} value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="item">By item</option>
          <option value="status">By status</option>
        </select>
      </div>

      {loading && <div className="text-muted py-3">Loading...</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="text-muted py-4 text-center">No parcels match these filters.</div>}

      {!loading && !error && items.length > 0 && (
        <div className="table-responsive bg-white rounded border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted">
              <tr><th>Item</th><th>Sender</th><th>Tracking no.</th><th>Status</th><th>Expected on</th><th>Added on</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <ParcelRecordRow key={item.parcelId} item={item} onOpen={(id) => navigate(`/my-parcels?select=${id}`)} onSaveEdit={handleSaveEdit} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); loadData(p); }}>Previous</button>
          <span className="small text-muted">Page {page} of {pages}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page >= pages} onClick={() => { const p = page + 1; setPage(p); loadData(p); }}>Next</button>
          <span className="small text-muted ms-2">({total} parcels)</span>
        </div>
        <button className="btn btn-sm btn-outline-success" onClick={handleDownloadCsv}>Download CSV</button>
      </div>
    </div>
  );
}
