// Management records API client functions (Module 4 React & Module 6 Express)

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Server error' }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchRecordsStats() {
  const res = await fetch('/api/records/stats');
  return handleResponse(res);
}

export async function fetchRecordsParcels(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/records/parcels${qs ? '?' + qs : ''}`);
  return handleResponse(res);
}

export async function fetchRecordsIncidents(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/records/incidents${qs ? '?' + qs : ''}`);
  return handleResponse(res);
}

export async function resolveIncident(parcelId, reportId, note) {
  const res = await fetch(`/api/records/incidents/${parcelId}/${reportId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note })
  });
  return handleResponse(res);
}

export async function fetchRecordsPasses(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/records/passes${qs ? '?' + qs : ''}`);
  return handleResponse(res);
}

export async function cancelPickupPass(parcelId) {
  const res = await fetch(`/api/parcels/${parcelId}/pass/cancel`, { method: 'POST' });
  return handleResponse(res);
}

export async function fetchRecordsActivity(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/records/activity${qs ? '?' + qs : ''}`);
  return handleResponse(res);
}

export async function updateParcel(parcelId, data) {
  const res = await fetch(`/api/parcels/${parcelId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}
