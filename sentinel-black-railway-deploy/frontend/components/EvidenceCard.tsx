export default function EvidenceCard({ title, meta, children }) {
  return (
    <div className="
      bg-sb-surface border border-sb-border rounded-md p-4
      hover:border-sb-blue hover:shadow-neon transition-all
    ">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs text-sb-textSecondary">{meta}</span>
      </div>
      {children}
    </div>
  );
}
