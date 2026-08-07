export function formatRelativeTime(timestamp) {
  const testDate = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((testDate - now) / 1000); // negative number standard format ke liye

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const minutes = Math.round(diffInSeconds / 60);
  const hours = Math.round(diffInSeconds / 3600);
  const days = Math.round(diffInSeconds / 86400);

  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(days, "day");
}
