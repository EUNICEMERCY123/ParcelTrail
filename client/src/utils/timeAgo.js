// Formats relative time elapsed for parcel status updates (Module 2 JavaScript)

export function timeAgo(dateInput) {
  if (!dateInput) return '';
  const now = Date.now();
  const past = new Date(dateInput).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
}
