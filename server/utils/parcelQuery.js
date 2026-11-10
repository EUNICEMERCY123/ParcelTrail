// Shared MongoDB filter builder for search, status, and createdAt dates (Module 5 MongoDB)

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildParcelFilter({ search, status, from, to } = {}) {
  const filter = {};

  if (search && search.trim()) {
    const s = escapeRegex(search.trim());
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
    const dateRange = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) dateRange.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) dateRange.$lte = toDate;
    }
    if (Object.keys(dateRange).length > 0) {
      filter.createdAt = dateRange;
    }
  }

  return filter;
}

module.exports = { buildParcelFilter, escapeRegex };
