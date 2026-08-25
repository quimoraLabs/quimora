/**
 * 🌟 Quimora Export Utility
 * Converts Javascript objects into a downloadable CSV spreadsheet.
 * 
 * @param {Array<Object>} data - Array of row objects
 * @param {string} filename - Desired output filename (without or with .csv)
 * @param {Array<{ label: string, key: string }>} columns - Column definitions
 */
export const exportToCSV = (data, filename = "export.csv", columns) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Determine headers
  const cols =
    columns ||
    Object.keys(data[0]).map((key) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      key,
    }));

  const headers = cols.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");

  const rows = data.map((row) =>
    cols
      .map((col) => {
        let val = row[col.key];
        if (val === null || val === undefined) val = "";
        else if (typeof val === "object") val = JSON.stringify(val);
        else val = String(val);

        // Escape double quotes
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = [headers, ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
