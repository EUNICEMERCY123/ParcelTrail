// Shared MongoDB filter builder for search, status, and createdAt dates (Module 5 MongoDB)

function buildParcelFilter({ search, status, from, to }) {
  const filter = {};

  if (search && search.trim()) {
    const s = search.trim();
    const regex = new RegExp(s, 'i');
    filter.$or = [
      { itemDescription: { $regex: regex } },
      { sender: { $regex: regex } },
      { trackingNumber: { $regex: regex } },
      { parcelId: { $regex: regex } }
    ];
  }

  if (status && status.trim()) {
    const list = status.split(',').map((st) => st.trim()).filter(Boolean);
    if (list.length > 0) {
      filter.status = { $in: list };
    }
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  return filter;
}

module.exports = { buildParcelFilter };
