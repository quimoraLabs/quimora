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
      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-cyan-400 ">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl py-4 flex items-center pl-12 pr-12 text-sm md:text-base outline-hidden transition-all duration-300 focus:border-cyan-400/50 focus:bg-white/8 focus:ring-4 focus:ring-cyan-400/5 backdrop-blur-md placeholder:text-slate-200 dark:placeholder:text-slate-600 dark:text-white/70 text-slate-500"
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 flex items-center gap-2">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
