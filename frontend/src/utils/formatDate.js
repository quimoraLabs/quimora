export const formatDate = (isoString) => {
  if (!isoString) return "N/A"; // Guard check agar date na mile
  
  const date = new Date(isoString);
  
  // Format options: "20 May 2026" standard premium look ke liye
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Agar time bhi dikhana ho (e.g., Report Modal ke andar):
export const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true // 12-hour format (AM/PM) ke liye
  });
};