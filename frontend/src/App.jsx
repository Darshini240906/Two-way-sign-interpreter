import { useState } from "react";
import WebcamPanel from "./components/WebcamPanel.jsx";
import AvatarPanel from "./components/AvatarPanel.jsx";
import StatusBar from "./components/StatusBar.jsx";

export default function App() {
  const [mode, setMode] = useState("sign"); // "sign" | "speech"

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Two-way interpreter
          </p>
          <h1 className="font-display text-3xl text-paper sm:text-4xl">
            Sign <span className="text-sign">&harr;</span> Speech
          </h1>
        </div>

        <div className="flex rounded-full border border-line bg-panel p-1">
          <button
            onClick={() => setMode("sign")}
            className={`rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
              mode === "sign"
                ? "bg-sign text-ink"
                : "text-muted hover:text-paper"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("speech")}
            className={`rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
              mode === "speech"
                ? "bg-speech text-ink"
                : "text-muted hover:text-paper"
            }`}
          >
            Speak in
          </button>
        </div>
      </header>

      <div className="relative grid auto-rows-[38rem] grid-cols-1 gap-6 md:grid-cols-2">
        {/* Signature element: a live divider between the two directions */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line md:block">
          <div
            className={`absolute left-1/2 top-1/2 h-16 w-px -translate-x-1/2 -translate-y-1/2 signal-pulse ${
              mode === "sign" ? "bg-sign" : "bg-speech"
            }`}
          />
        </div>

        <WebcamPanel active={mode === "sign"} />
        <AvatarPanel active={mode === "speech"} />
      </div>

      <StatusBar mode={mode} />

      <footer className="pb-2 text-center font-mono text-[11px] text-muted/60">
        20 word-signs + 26 fingerspelling letters &middot; local &amp; free stack
      </footer>
    </div>
  );
}
