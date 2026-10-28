// Bottom summary card overlaid on map with TrackStepper and contextual button icons (Module 4 React)
import React from 'react';
import { getParcelStatusInfo } from '../utils/labels';
import TrackStepper from './TrackStepper';
import { BoxIcon, LockIcon, KeyIcon, CheckIcon } from './Icons';

// Renders bottom summary card over map with primary action button and links
function ParcelSummaryCard({ parcel, onPrimaryAction, onOpenPanel, errorMsg }) {
  if (!parcel) return null;

  const statusInfo = getParcelStatusInfo(parcel);

  // Handles click on primary action button based on current status
  const handleButtonClick = () => {
    if (parcel.status === 'Expected') onPrimaryAction('drop');
    else if (parcel.status === 'Deposited') onPrimaryAction('lock');
    else if (parcel.status === 'Locked' || parcel.status === 'Tamper Alert') onOpenPanel('pickup');
    else onOpenPanel('history');
  };

  let ButtonIcon = CheckIcon;
  if (parcel.status === 'Expected') {
    ButtonIcon = BoxIcon;
  } else if (parcel.status === 'Deposited') {
    ButtonIcon = LockIcon;
  } else if (parcel.status === 'Locked' || parcel.status === 'Tamper Alert') {
    ButtonIcon = KeyIcon;
  }

  return (
    <div className="parcel-summary-card">
      <div className="summary-header">
        <div>
          <h4 className="summary-item-title">{parcel.itemDescription}</h4>
          <span className="summary-sender">From {parcel.sender}</span>
        </div>
        <span className={`status-pill pill-${statusInfo.pill}`}>
          <span className="status-dot" />
          <span>{statusInfo.label}</span>
        </span>
      </div>

      <p className="summary-sentence">{statusInfo.sentence}</p>

      <TrackStepper parcel={parcel} />

      {errorMsg && <div className="summary-error-line">{errorMsg}</div>}

      <button type="button" className="btn-primary-action d-flex align-items-center justify-content-center gap-2" onClick={handleButtonClick}>
        <ButtonIcon size={18} />
        <span>{statusInfo.button}</span>
      </button>

      <div className="summary-links-row">
        <button type="button" className="text-link-btn" onClick={() => onOpenPanel('options')}>
          More options
        </button>
        <button type="button" className="text-link-btn" onClick={() => onOpenPanel('history')}>
          See history
        </button>
      </div>
    </div>
  );
}

export default ParcelSummaryCard;
