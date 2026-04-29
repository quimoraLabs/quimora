
const PrimaryButton = ({ children, onClick, className = "", ...props }) => (
  <button
    onClick={onClick}
    className={`h-10 w-full cursor-pointer rounded-md bg-linear-to-br from-[#7336FF] to-[#3269FF] text-white shadow-md shadow-blue-950 transition-opacity hover:opacity-90 active:scale-[0.98] ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default PrimaryButton;
