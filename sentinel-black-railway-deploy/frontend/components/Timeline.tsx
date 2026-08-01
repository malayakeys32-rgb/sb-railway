export default function Timeline({ events }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-0 bottom-0 w-px bg-sb-borderStrong" />

      {events.map((e, i) => (
        <div key={i} className="mb-6 relative">
          <div className="
            w-3 h-3 rounded-full bg-sb-blue shadow-neon
            absolute -left-1.5 top-1
          " />
          <div className="ml-4">
            <h4 className="font-semibold">{e.title}</h4>
            <p className="text-sb-textSecondary text-sm">{e.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
