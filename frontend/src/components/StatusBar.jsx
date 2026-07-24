export default function StatusBar({ mode }) {
  const items = [
    { label: "backend", value: "disconnected" },
    { label: "mode", value: mode === "sign" ? "sign \u2192 speech" : "speech \u2192 sign" },
    { label: "latency", value: "\u2014" },
    { label: "language", value: "en" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl border border-line bg-panel px-6 py-3 font-mono text-xs text-muted">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="uppercase tracking-widest text-muted/70">
            {item.label}
          </span>
          <span className="text-paper/80">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
