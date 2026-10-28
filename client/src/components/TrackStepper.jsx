// Horizontal courier-style progress tracker with real event timestamps (Module 4 React UI)
import React from 'react';
import { TruckIcon, BoxIcon, LockIcon, CheckIcon, AlertIcon, PinIcon } from './Icons';
import { getStepEventTime } from '../utils/trackHelpers';

// Renders four tracking steps showing progress and timestamps
export default function TrackStepper({ parcel }) {
  const status = (parcel && parcel.status) ? parcel.status : 'Expected';
  const isTamper = status === 'Tamper Alert';
  const isRedirect = status === 'Redirected';

  let stepIndex = 0;
  if (status === 'Collected' || isRedirect) {
    stepIndex = 3;
  } else if (status === 'Locked' || isTamper) {
    stepIndex = 2;
  } else if (status === 'Deposited') {
    stepIndex = 1;
  }

  let step3Label = 'Locked and safe';
  let step3Icon = LockIcon;
  if (isTamper) {
    step3Label = 'Mailbox was shaken';
    step3Icon = AlertIcon;
  }

  let step4Label = 'Picked up';
  let step4Icon = CheckIcon;
  if (isRedirect) {
    const loc = (parcel && parcel.currentLocation) ? parcel.currentLocation : 'spot';
    step4Label = 'Sent to ' + loc;
    step4Icon = PinIcon;
  }

  const nodes = [
    { label: 'On its way', icon: TruckIcon },
    { label: 'In your mailbox', icon: BoxIcon },
    { label: step3Label, icon: step3Icon, isRed: isTamper },
    { label: step4Label, icon: step4Icon, isOrange: isRedirect }
  ];

  return (
    <div className="track-stepper-container py-3">
      <div className="d-flex align-items-center justify-content-between position-relative px-2">
        {nodes.map((node, i) => {
          const isDone = i < stepIndex;
          const isCurrent = i === stepIndex;
          const isUpcoming = i > stepIndex;
          const IconComp = node.icon;
          const time = (isDone || isCurrent) ? getStepEventTime(parcel, i) : '';

          let circleClass = 'bg-secondary text-muted';
          let ringStyle = {};
          if (isDone) {
            circleClass = 'bg-success text-white';
          } else if (isCurrent) {
            if (node.isRed) {
              circleClass = 'bg-danger text-white';
              ringStyle = { boxShadow: '0 0 0 4px #fbd2d3' };
            } else if (node.isOrange) {
              circleClass = 'bg-warning text-dark';
              ringStyle = { boxShadow: '0 0 0 4px #fed7aa' };
            } else {
              circleClass = 'bg-success text-white';
              ringStyle = { boxShadow: '0 0 0 4px #bfe0cc' };
            }
          }

          let barColor = '#e5e8e5';
          if (i <= stepIndex) {
            if (node.isRed) {
              barColor = '#e5484d';
            } else if (node.isOrange) {
              barColor = '#f5a524';
            } else {
              barColor = '#1b7f4b';
            }
          }

          const labelColor = isCurrent ? 'text-dark' : (isUpcoming ? 'text-muted' : 'text-secondary');

          return (
            <React.Fragment key={node.label}>
              {i > 0 && (
                <div
                  className="flex-grow-1"
                  style={{
                    height: 2,
                    backgroundColor: barColor,
                    marginTop: -22
                  }}
                />
              )}
              <div className="d-flex flex-column align-items-center text-center" style={{ width: 85, zIndex: 1 }}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${circleClass}`}
                  style={{
                    width: isCurrent ? 34 : 28,
                    height: isCurrent ? 34 : 28,
                    transition: 'all 0.2s ease',
                    ...ringStyle
                  }}
                >
                  <IconComp size={isCurrent ? 18 : 14} />
                </div>
                <div className={`mt-2 small fw-medium lh-sm ${labelColor}`} style={{ fontSize: '0.78rem' }}>
                  {node.label}
                </div>
                {time && <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>{time}</div>}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
