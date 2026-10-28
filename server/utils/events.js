// Shared helper to aggregate and sort events across parcels (Module 5 MongoDB)

function collectAllEvents(parcels, { parcelId, type } = {}) {
  const allEvents = [];
  parcels.forEach((p) => {
    if (parcelId && p.parcelId !== parcelId) return;
    (p.events || []).forEach((e) => {
      if (type && !e.eventType.toLowerCase().includes(type.toLowerCase())) return;
      allEvents.push({
        id: e.id,
        parcelId: p.parcelId,
        itemDescription: p.itemDescription,
        timestamp: e.timestamp,
        eventType: e.eventType,
        sensorType: e.sensorType,
        description: e.description,
        isSimulated: e.isSimulated
      });
    });
  });
  allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return allEvents;
}

module.exports = { collectAllEvents };
