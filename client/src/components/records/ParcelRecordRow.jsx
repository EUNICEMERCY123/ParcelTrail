// Reusable memoized table row for parcel records with inline edit (Module 4 React.memo)
import React, { useState } from 'react';
import { STATUS_META, RECORD_STATUS_META } from '../../utils/labels';

const ParcelRecordRow = React.memo(function ParcelRecordRow({ item, onOpen, onSaveEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    itemDescription: item.itemDescription,
    sender: item.sender,
    trackingNumber: item.trackingNumber || '',
    expectedDate: item.expectedDate ? item.expectedDate.slice(0, 10) : ''
  });

  const statusMeta = STATUS_META[item.status] || STATUS_META.Expected;

  if (isEditing) {
    return (
      <tr className="bg-light">
        <td><input className="form-control form-control-sm" value={form.itemDescription} onChange={(e) => setForm({ ...form, itemDescription: e.target.value })} /></td>
        <td><input className="form-control form-control-sm" value={form.sender} onChange={(e) => setForm({ ...form, sender: e.target.value })} /></td>
        <td><input className="form-control form-control-sm" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} /></td>
        <td><span className={`badge status-pill ${statusMeta.pill}`}>{statusMeta.label}</span></td>
        <td><input type="date" className="form-control form-control-sm" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} /></td>
        <td className="small text-muted">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
        <td>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-primary py-0 px-2" onClick={() => { onSaveEdit(item.parcelId, form); setIsEditing(false); }}>Save</button>
            <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="fw-semibold text-dark">{item.itemDescription}</td>
      <td className="text-secondary">{item.sender}</td>
      <td className="font-monospace small text-muted">{item.trackingNumber || '-'}</td>
      <td>
        <span className={`badge status-pill ${statusMeta.pill}`}>{statusMeta.label}</span>
      </td>
      <td>
        {item.expectedDate ? new Date(item.expectedDate).toLocaleDateString() : '-'}
        {item.isLate && <span className="badge bg-danger ms-1">Late</span>}
      </td>
      <td className="small text-muted">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
      <td>
        <div className="d-flex gap-1 align-items-center">
          <button className="btn btn-sm btn-outline-green" onClick={() => onOpen(item.parcelId)}>Open</button>
          {item.status !== 'Collected' && (
            <button className="btn btn-sm btn-outline-green" onClick={() => setIsEditing(true)}>Edit</button>
          )}
          {item.status === 'Collected' && (
            <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(item.parcelId)}>Delete</button>
          )}
        </div>
      </td>
    </tr>
  );
});

export default ParcelRecordRow;
