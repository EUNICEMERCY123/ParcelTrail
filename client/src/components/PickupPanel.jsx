// Slide-over pickup container rendering generator or active code and keypad (Module 4 React)
import React from 'react';
import { hasActivePass } from '../utils/labels';
import CodeGenerator from './pickup/CodeGenerator';
import CodeCard from './pickup/CodeCard';
import CodeKeypad from './pickup/CodeKeypad';

// Renders the pickup management slide-over panel with pass creation and keypad verification
export default function PickupPanel({ parcel, onClose, onUpdateParcel }) {
  const pass = parcel ? parcel.pickupPass : null;
  const isPassActive = hasActivePass(parcel);
  const targetId = parcel ? (parcel.parcelId || parcel.id) : '';
  const isCollected = parcel && parcel.status === 'Collected';

  let title = 'Who is collecting?';
  if (isCollected) {
    title = 'Parcel collected';
  } else if (isPassActive && pass) {
    title = `Pickup code for ${pass.collectorName}`;
  }

  return (
    <div className="slide-panel-inner p-3">
      <div className="panel-header d-flex justify-content-between align-items-center mb-3">
        <h5 className="panel-title m-0">{title}</h5>
        <button type="button" className="close-text-btn btn btn-link text-decoration-none text-muted p-0" onClick={onClose}>
          Close
        </button>
      </div>

      {isCollected ? (
        <div className="collected-feedback text-center py-3">
          <div className="panel-success-line alert alert-success py-2 fw-semibold">
            Mailbox opened. Parcel picked up.
          </div>
          <p className="text-muted small mt-2">
            The 12V solenoid lock opened and the parcel was safely retrieved.
          </p>
        </div>
      ) : isPassActive ? (
        <div className="pickup-active-view">
          <CodeCard pass={pass} />
          <CodeKeypad targetId={targetId} onVerified={onUpdateParcel} />
        </div>
      ) : (
        <CodeGenerator targetId={targetId} onCreated={onUpdateParcel} />
      )}
    </div>
  );
}
