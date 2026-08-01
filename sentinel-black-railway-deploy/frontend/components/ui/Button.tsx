export function SBButton({ children, variant = "primary", ...props }) {
  const base =
    "px-4 py-2 rounded-md font-medium transition-all duration-200";

  const variants = {
    primary:
      "bg-sb-blue text-sb-bg hover:shadow-neon active:bg-blue-500",
    secondary:
      "bg-sb-purple text-sb-bg hover:shadow-neonPurple active:bg-purple-500",
    ghost:
      "bg-transparent border border-sb-border text-sb-text hover:bg-sb-surfaceAlt"
  };

  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
