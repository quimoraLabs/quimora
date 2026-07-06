export default function InputGroup({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required,
  icon,
  suffix,
}) {
  return (
    <div className="space-y-2 group">
      <label className="auth-label">
        {label}
      </label>
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-muted flex items-center gap-2">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="auth-input"
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted flex items-center gap-2">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
