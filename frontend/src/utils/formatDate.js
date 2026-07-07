export const formatDate = (isoString) => {
  if (!isoString) return "N/A"; // Guard check in case the date is missing.
  
  const date = new Date(isoString);
  
  // Format options: "20 May 2026" for a clean, polished display.
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// If you also want to show the time (for example, inside a report modal):
export const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true // 12-hour format (AM/PM)
  });
};