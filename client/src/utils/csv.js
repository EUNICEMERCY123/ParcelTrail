// Helper functions to generate and trigger CSV file download (Module 2 & 4)

export function formatCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsvText(columns, rows) {
  const header = columns.map((col) => formatCsvValue(col.label || col.key || col)).join(',');
  const lines = rows.map((row) =>
    columns.map((col) => {
      const key = col.key || col;
      return formatCsvValue(row[key]);
    }).join(',')
  );
  return [header, ...lines].join('\r\n');
}

export function downloadCsv(filename, columns, rows) {
  const csvText = buildCsvText(columns, rows);
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
