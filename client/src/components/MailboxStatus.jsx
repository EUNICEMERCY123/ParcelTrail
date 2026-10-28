// Visual cutaway illustration of smart mailbox state (Module 1 SVG & Module 4 React)
import React from 'react';

const CAPTIONS = {
  Expected: 'Waiting for the courier',
  Deposited: 'Parcel inside, not locked yet',
  Locked: 'Parcel inside, locked',
  'Tamper Alert': 'Parcel inside, shake alert',
  Collected: 'Empty, parcel picked up',
  Redirected: 'Empty, sent to another spot'
};

// Renders the mailbox cutaway graphic with LED indicator and caption
export default function MailboxStatus({ status = 'Expected' }) {
  const hasParcel = status === 'Deposited' || status === 'Locked' || status === 'Tamper Alert';

  let ledClass = '';
  if (status === 'Locked') {
    ledClass = 'led-green';
  } else if (status === 'Deposited') {
    ledClass = 'led-amber';
  } else if (status === 'Tamper Alert') {
    ledClass = 'led-red';
  }

  const caption = CAPTIONS[status] || CAPTIONS.Expected;

  return (
    <div className="mailbox-status-widget text-center">
      <div className="mailbox-stage mx-auto">
        <img className="stage-base" src="/assets/mailbox-base.svg" alt="Smart mailbox, cutaway view" />
        {hasParcel && <img className="stage-parcel" src="/assets/parcel.svg" alt="Parcel inside mailbox" />}
        <span className={`stage-led ${ledClass}`} />
        {status === 'Tamper Alert' && <div className="stage-alert" />}
      </div>
      <div className="small text-muted mt-2 fw-medium">{caption}</div>
    </div>
  );
}
