// Plain language status labels, sentences, buttons, and progress steps (Module 4 React UI)

export const STATUS_META = {
  Expected: {
    label: 'On its way',
    pill: 'grey',
    sentence: "It's on its way to your mailbox.",
    button: 'Courier drops it in the mailbox',
    step: 'Step 1 of 4',
    percent: 25,
    barColor: 'green'
  },
  Deposited: {
    label: 'In your mailbox',
    pill: 'blue',
    sentence: "It's in your mailbox. Lock it to keep it safe.",
    button: 'Lock the mailbox',
    step: 'Step 2 of 4',
    percent: 50,
    barColor: 'green'
  },
  Locked: {
    label: 'Locked and safe',
    pill: 'green',
    sentence: "It's locked safely in your mailbox.",
    button: 'Let someone collect it',
    step: 'Step 3 of 4',
    percent: 75,
    barColor: 'green'
  },
  'Tamper Alert': {
    label: 'Mailbox was shaken',
    pill: 'red',
    sentence: 'Someone shook your mailbox. Please check your parcel.',
    button: 'Let someone collect it',
    step: 'Step 3 of 4',
    percent: 75,
    barColor: 'red'
  },
  Collected: {
    label: 'Picked up',
    pill: 'dark slate',
    sentence: 'This parcel has been picked up.',
    button: 'See history',
    step: 'Step 4 of 4',
    percent: 100,
    barColor: 'green'
  },
  Redirected: {
    label: 'Sent to pickup spot',
    pill: 'orange',
    sentence: 'It was sent to pickup spot for pickup.',
    button: 'See history',
    step: 'Step 4 of 4',
    percent: 100,
    barColor: 'orange'
  }
};

export function hasActivePass(parcel) {
  if (!parcel || !parcel.pickupPass) return false;
  const pass = parcel.pickupPass;
  if (pass.isUsed) return false;
  if (typeof pass.attemptsRemaining === 'number' && pass.attemptsRemaining <= 0) return false;
  if (pass.expiresAt && new Date(pass.expiresAt).getTime() <= Date.now()) return false;
  return Boolean(pass.code);
}

export function getParcelStatusInfo(parcelOrStatus) {
  const isObj = parcelOrStatus && typeof parcelOrStatus === 'object';
  const status = isObj ? parcelOrStatus.status : parcelOrStatus;
  const base = STATUS_META[status] || STATUS_META.Expected;
  const info = { ...base };

  if (isObj && status === 'Redirected' && parcelOrStatus.currentLocation) {
    info.label = `Sent to ${parcelOrStatus.currentLocation}`;
    info.sentence = `It was sent to ${parcelOrStatus.currentLocation} for pickup.`;
  }

  if (isObj && (status === 'Locked' || status === 'Tamper Alert')) {
    if (hasActivePass(parcelOrStatus)) {
      info.button = 'Show pickup code';
    }
  }

  return info;
}

export const RECORD_STATUS_META = {
  Late: { label: 'Late', badgeClass: 'pill-red' },
  Open: { label: 'Open', badgeClass: 'pill-amber' },
  Resolved: { label: 'Resolved', badgeClass: 'pill-green' },
  active: { label: 'Active', badgeClass: 'pill-green' },
  used: { label: 'Used', badgeClass: 'pill-grey' },
  expired: { label: 'Expired', badgeClass: 'pill-amber' },
  locked: { label: 'Locked', badgeClass: 'pill-red' }
};

export function getStepProgress(status) {
  const meta = STATUS_META[status] || STATUS_META.Expected;
  return {
    step: meta.step,
    percent: meta.percent,
    barColor: meta.barColor
  };
}
