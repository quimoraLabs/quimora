/**
 * 🌟 Quimora Unified StatsGrid Container
 * Provides consistent grid layout (auto-responsive 1, 2, or 4 columns) for StatCards.
 */
export default function StatsGrid({
  children,
  stats = [],
  columns = "4", // "2" | "3" | "4"
  className = "",
}) {
  const colClasses = {
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${colClasses} gap-4 w-full ${className}`}>
      {children}
    </div>
  );
}
