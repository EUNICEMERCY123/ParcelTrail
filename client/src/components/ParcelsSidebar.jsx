// Left sidebar component for parcel list, search, filter, and add form (Module 4 React)
import React from 'react';
import ParcelCard from './ParcelCard';
import AddParcelForm from './AddParcelForm';
import MailboxStatus from './MailboxStatus';

export default function ParcelsSidebar({
  parcels,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  filterOption,
  onFilterChange,
  showAddForm,
  onToggleAddForm,
  onAddParcel,
  activeStatus,
  onReset
}) {
  return (
    <aside className="parcels-sidebar-list">
      <div className="sidebar-fixed-header">
        <span className="eyebrow-badge">Overview</span>
        <h2 className="sidebar-section-title">Your <em>parcels.</em></h2>
        <div className="quiet-filter-col">
          <input
            type="text"
            className="quiet-search-input"
            placeholder="Search parcels..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <select
            className="quiet-select-input"
            value={filterOption}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="all">All parcels</option>
            <option value="waiting">Waiting</option>
            <option value="picked">Picked up</option>
          </select>
        </div>

        {showAddForm ? (
          <AddParcelForm onAdd={onAddParcel} onCancel={() => onToggleAddForm(false)} />
        ) : (
          <button type="button" className="green-add-link" onClick={() => onToggleAddForm(true)}>
            + Add a parcel
          </button>
        )}
      </div>

      <div className="parcels-scroll-area">
        {parcels.map((p) => {
          const pid = p.parcelId || p.id;
          return (
            <ParcelCard
              key={pid}
              parcel={p}
              isSelected={pid === selectedId}
              onSelect={onSelect}
            />
          );
        })}

        <div className="mailbox-dock-card p-2 rounded-4 bg-white border mt-3">
          <div className="small fw-semibold text-secondary mb-1">Your mailbox right now</div>
          <div style={{ maxWidth: 220, margin: '0 auto' }}>
            <MailboxStatus status={activeStatus} />
          </div>
          <div className="text-center" style={{ marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onReset} style={{ fontSize: '12px', padding: '6px 16px' }}>
              Reset demo data
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
