import { Calendar } from "lucide-react";

export function InputField({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  required = false,
  helperText,
  ...props
}) {
  const isDatePicker = type === "date" || type === "datetime-local";

  const handleClick = (e) => {
    if (isDatePicker && typeof e.target.showPicker === "function") {
      try {
        e.target.showPicker();
      } catch (error) {
        console.log(error)
        // Fallback handled gracefully by browser default click
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onClick={handleClick}
          required={required}
          className={`w-full rounded-xl border border-main bg-surface px-4 py-2.5 text-sm text-main placeholder-text-muted outline-none transition focus:border-accent ${
            isDatePicker ? "cursor-pointer scheme-dark" : ""
          } ${className}`}
          {...props}
        />

        {isDatePicker && (
          <Calendar
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        )}
      </div>

      {helperText && <p className="mt-1 text-xs text-muted">{helperText}</p>}
    </div>
  );
}
