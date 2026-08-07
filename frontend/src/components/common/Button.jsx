import { Button } from "@headlessui/react";
import Loader from "./Loader"; // Adjust path if needed

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
  className = "",
  ...props
}) {
  const isInactive = disabled || isLoading;

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={isInactive}
      className={`
        h-11 w-full rounded-xl font-semibold text-white select-none
        flex items-center justify-center gap-2 px-5 text-sm
        bg-linear-to-br from-brand-purple to-brand-blue
        shadow-card focus:outline-none focus:ring-2 focus:ring-brand-mid/50 focus:ring-offset-2
        data-disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:transform-none
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader size="sm" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
