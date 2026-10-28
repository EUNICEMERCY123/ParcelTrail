// Helper functions for timeline tracking nodes, event matching, and icon selection (Module 4 React UI)

export function formatStepTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getStepEventTime(parcel, stepIndex) {
  if (!parcel) return '';
  if (stepIndex === 0) {
    return parcel.createdAt ? formatStepTime(parcel.createdAt) : '';
  }
  const events = parcel.events || [];
  if (stepIndex === 1) {
    const ev = events.find((e) => e.eventType === 'Parcel Deposited');
    return ev ? formatStepTime(ev.timestamp) : '';
  }
  if (stepIndex === 2) {
    const ev = events.find((e) => e.eventType === 'Lid Locked' || e.eventType === 'Tamper Alert Triggered' || e.eventType === 'Security Lockdown');
    return ev ? formatStepTime(ev.timestamp) : '';
  }
  if (stepIndex === 3) {
    const ev = events.find((e) => e.eventType === 'Parcel Collected' || e.eventType === 'Parcel Redirected');
    return ev ? formatStepTime(ev.timestamp) : '';
  }
  return '';
}

export function getEventCategory(eventType = '') {
  const str = eventType.toLowerCase();
  if (str.includes('deposit') || str.includes('drop')) return 'box';
  if (str.includes('lock') && !str.includes('tamper') && !str.includes('lockdown')) return 'lock';
  if (str.includes('camera') || str.includes('photo') || str.includes('flash')) return 'camera';
  if (str.includes('tamper') || str.includes('shake') || str.includes('lockdown')) return 'alert';
  if (str.includes('pass')) return 'key';
  if (str.includes('collect')) return 'check';
  if (str.includes('redirect')) return 'pin';
  if (str.includes('report') || str.includes('incident') || str.includes('concern')) return 'flag';
  return 'clock';
}
