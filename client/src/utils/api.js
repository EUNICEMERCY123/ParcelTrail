// Client-side API service connecting React to Express backend (Module 3 Fetch & Module 6)

const API_BASE = '/api';

export async function fetchParcels(search = '', status = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/parcels${qs}`);
  if (!res.ok) throw new Error('Failed to load parcels from server');
  return res.json();
}

export async function fetchParcelById(id) {
  const res = await fetch(`${API_BASE}/parcels/${id}`);
  if (!res.ok) throw new Error('Failed to load parcel details');
  return res.json();
}

export async function createParcel(data) {
  const res = await fetch(`${API_BASE}/parcels`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create parcel');
  return res.json();
}

export async function simulateSensorEvent(parcelId, eventType) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType }) });
  if (!res.ok) throw new Error('Simulation failed on server');
  return res.json();
}

export async function issuePickupPass(parcelId, collectorName, expiryMinutes) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/pass/issue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collectorName, expiryMinutes }) });
  if (!res.ok) throw new Error('Failed to issue pickup pass');
  return res.json();
}

export async function verifyPickupPass(parcelId, inputCode) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/pass/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputCode }) });
  return res.json();
}

export async function redirectParcel(parcelId, locationName, address) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/redirect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locationName, address }) });
  if (!res.ok) throw new Error('Failed to redirect parcel');
  return res.json();
}

export async function reportProblem(parcelId, type, description) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, description }) });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to file report');
  return res.json();
}

export async function deleteParcel(parcelId) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete parcel');
  return res.json();
}

export async function resetParcels() {
  const res = await fetch(`${API_BASE}/parcels/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset parcels');
  return res.json();
}

export async function fetchPickupPoints() {
  const res = await fetch(`${API_BASE}/pickup-points`);
  if (!res.ok) throw new Error('Failed to load pickup points');
  return res.json();
}

export async function fetchNotifications() {
  const res = await fetch(`${API_BASE}/notifications`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchActivePasses() {
  const res = await fetch(`${API_BASE}/passes/active`);
  if (!res.ok) return { activePasses: 0 };
  return res.json();
}

export async function getFlashStatus() {
  const res = await fetch(`${API_BASE}/mailbox/flash`);
  if (!res.ok) return { flashOn: false };
  return res.json();
}

export async function toggleFlashStatus() {
  const res = await fetch(`${API_BASE}/mailbox/flash/toggle`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to toggle flash');
  return res.json();
}
