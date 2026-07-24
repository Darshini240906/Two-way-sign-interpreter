export default function WebcamPanel({ active }) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border transition-colors duration-300 ${
        active ? "border-sign/60 bg-sign-dim/20" : "border-line bg-panel"
      }`}
    >
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sign">
            Direction A
          </p>
          <h2 className="font-display text-xl text-paper">Sign &rarr; Speech</h2>
        </div>
        <span
          className={`h-2 w-2 rounded-full ${
            active ? "bg-sign signal-pulse" : "bg-muted/40"
          }`}
        />
      </div>

      <div className="mx-6 my-5 flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-line/80 bg-ink/60">
        <div className="text-center">
          <p className="font-mono text-xs text-muted">webcam feed</p>
          <p className="mt-1 font-mono text-[11px] text-muted/60">
            {/* TODO: <video> element + MediaPipe landmark overlay */}
            not connected
          </p>
        </div>
      </div>

      <div className="border-t border-line px-6 py-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
          Recognized text
        </p>
        <p className="mt-2 min-h-[1.5rem] font-body text-paper/90">
          {/* TODO: live recognized word/letter buffer */}
          &nbsp;
        </p>
      </div>
    </div>
  );
}
