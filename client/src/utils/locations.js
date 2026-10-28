// Mailbox and pickup spot location constants and Google Maps embed URL generator (Module 1 iframe)

export const MAILBOX_LOCATION = {
  name: 'Your mailbox',
  lat: 10.9355,
  lon: 76.7435
};

export function getMapUrl(lat, lon, mode = 'm') {
  const mapMode = mode === 'k' ? 'k' : 'm';
  return `https://www.google.com/maps?q=${lat},${lon}&z=17&output=embed&t=${mapMode}`;
}

export function getLocationCoordinates(locationName, pickupPoints = []) {
  if (locationName && pickupPoints && pickupPoints.length > 0) {
    const match = pickupPoints.find(
      (p) => p.name && p.name.toLowerCase() === locationName.toLowerCase()
    );
    if (match && typeof match.lat === 'number' && typeof match.lon === 'number') {
      return { name: match.name, lat: match.lat, lon: match.lon };
    }
  }
  return MAILBOX_LOCATION;
}
