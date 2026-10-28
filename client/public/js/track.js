// Vanilla JavaScript parcel tracking client and localStorage history (Module 2 JavaScript)
const STATUS_LABELS = { Expected: 'On its way', Deposited: 'In your mailbox', Locked: 'Locked and safe', 'Tamper Alert': 'Mailbox was shaken', Collected: 'Picked up', Redirected: 'Sent to pickup spot' };
const STATUS_BADGES = { Expected: 'bg-secondary', Deposited: 'bg-primary', Locked: 'bg-success', 'Tamper Alert': 'bg-danger', Collected: 'bg-dark', Redirected: 'bg-warning' };

// Shows feedback alert message with bootstrap alert styles
function showAlert(message, type) {
  const alertBox = document.getElementById('track-alert');
  alertBox.textContent = message;
  alertBox.className = 'alert alert-' + type;
}

// Loads stored searches array from localStorage safely
function getStoredSearches() {
  try {
    const raw = localStorage.getItem('parcelTrail_recentSearches');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

// Stores searched tracking number in localStorage (up to 5 items)
function saveRecentSearch(num) {
  const list = getStoredSearches().filter((item) => item !== num);
  list.unshift(num);
  if (list.length > 5) list.length = 5;
  localStorage.setItem('parcelTrail_recentSearches', JSON.stringify(list));
}

// Renders clickable recent search chips from localStorage
function renderRecentChips() {
  const container = document.getElementById('recent-chips');
  const box = document.getElementById('recent-searches-box');
  container.textContent = '';
  const list = getStoredSearches();
  if (list.length === 0) return;
  box.classList.remove('d-none');
  list.forEach((num) => {
    const chip = document.createElement('button');
    chip.textContent = num;
    chip.className = 'btn btn-sm btn-outline-secondary py-0 px-2';
    chip.addEventListener('click', () => {
      document.getElementById('tracking-input').value = num;
      searchTracking(num);
    });
    container.appendChild(chip);
  });
}

// Builds a single timeline event list item
function createEventItem(ev) {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-center small';
  const title = document.createElement('span');
  title.textContent = ev.eventType + ' (Simulated)';
  title.className = 'fw-semibold text-dark';
  const time = document.createElement('span');
  const d = new Date(ev.timestamp);
  time.textContent = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  time.className = 'text-muted';
  li.appendChild(title); li.appendChild(time); return li;
}

// Sets element text by ID
function setEl(id, val) { document.getElementById(id).textContent = val; }

// Fills DOM result card with tracking details
function renderTrackingCard(data) {
  setEl('result-item', data.itemDescription); setEl('result-sender', data.sender);
  setEl('result-tracking', data.trackingNumber); setEl('result-location', data.currentLocation || 'Main Smart Mailbox');
  setEl('result-expected', data.expectedDate ? new Date(data.expectedDate).toLocaleDateString() : 'Not specified');
  const badge = document.getElementById('result-badge');
  badge.textContent = STATUS_LABELS[data.status] || data.status;
  badge.className = 'badge py-2 px-3 fs-6 ' + (STATUS_BADGES[data.status] || 'bg-secondary');
  const eventsList = document.getElementById('result-events');
  eventsList.textContent = '';
  const events = data.events || [];
  if (events.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.textContent = 'No custody events logged yet.';
    emptyLi.className = 'list-group-item text-muted small';
    eventsList.appendChild(emptyLi);
  } else {
    events.forEach((ev) => eventsList.appendChild(createEventItem(ev)));
  }
  document.getElementById('track-result-card').classList.remove('d-none');
}

// Fetches tracking data from server and populates DOM
async function searchTracking(num) {
  document.getElementById('track-result-card').classList.add('d-none');
  if (!/^[A-Za-z0-9-]{6,20}$/.test(num)) {
    showAlert('Tracking number must be 6 to 20 letters, numbers, or dashes.', 'danger');
    return;
  }
  showAlert('Looking up parcel details...', 'info');
  try {
    const res = await fetch('/api/track/' + encodeURIComponent(num));
    if (res.status === 404) { showAlert('No parcel found with that tracking number.', 'danger'); return; }
    if (!res.ok) throw new Error();
    const data = await res.json();
    document.getElementById('track-alert').classList.add('d-none');
    saveRecentSearch(num);
    renderRecentChips();
    renderTrackingCard(data);
  } catch (err) {
    showAlert('Cannot reach the server. Start it with npm run dev inside the server folder.', 'danger');
  }
}

// Initialise form and search events
document.addEventListener('DOMContentLoaded', () => {
  renderRecentChips();
  document.getElementById('track-form').addEventListener('submit', (e) => {
    e.preventDefault();
    searchTracking(document.getElementById('tracking-input').value.trim());
  });
});
