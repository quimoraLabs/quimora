const FormInput = ({ type = "text", placeholder, ...rest }) => (
  <input
    type={type}
    placeholder={placeholder}
    className="w-full rounded-md bg-[#E9EFF6] p-2.5 placeholder:text-[#000000] outline-none transition-all focus:ring-2 focus:ring-[#7337FF]/20 dark:bg-neutral-700 dark:placeholder:text-[#969696] dark:text-slate-300 dark:focus:ring-[#7337FF]/40"
    style={{ boxShadow: "0px 7px 5px 0px rgb(0 0 0 / 21%)" }}
    {...rest}
  />
);

export default FormInput;
