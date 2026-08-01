export function SBInput(props) {
  return (
    <input
      {...props}
      className="
        w-full bg-sb-surface border border-sb-border text-sb-text
        placeholder-sb-textMuted rounded-md px-3 py-2
        focus:border-sb-blue focus:shadow-neon outline-none
        transition-all duration-200
      "
    />
  );
}
