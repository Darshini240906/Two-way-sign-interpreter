import { useCallback, useEffect, useRef, useState } from "react";

const WORDS = ["HELLO", "THANK YOU", "YES", "NO", "PLEASE", "HELP", "NAME", "WATER", "EAT", "GOOD", "BAD", "SORRY", "FRIEND", "LOVE", "STOP", "MORE", "WANT", "WHERE", "HOW", "BYE"];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function DatasetCapture() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [labelType, setLabelType] = useState("word");
  const [label, setLabel] = useState(WORDS[0]);
  const [counts, setCounts] = useState({ words: {}, letters: {} });
  const [countdown, setCountdown] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [status, setStatus] = useState("Starting camera…");
  const [busy, setBusy] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const choices = labelType === "word" ? WORDS : LETTERS;
  const count = counts[`${labelType}s`]?.[label] ?? 0;

  // Guards against React 18 StrictMode's dev-only double-invoke of effects:
  // without this, a second enableCamera() call can interrupt the first
  // video.play() promise mid-flight, surfacing a spurious AbortError.
  const requestIdRef = useRef(0);

  const enableCamera = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setCameraError("");
    setStatus("Requesting camera permission…");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia is unavailable. Open this page on localhost or HTTPS.");
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

      // A newer call started while we were awaiting permission — abandon
      // this stream instead of racing it against the newer one.
      if (requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (!videoRef.current) throw new Error("Camera preview is not available.");
      videoRef.current.srcObject = stream;

      try {
        await videoRef.current.play();
      } catch (playError) {
        // Benign: happens when srcObject changes again before play()
        // resolves (StrictMode remount, or rapid Enable Camera clicks).
        // <video autoPlay> will still start playback on its own.
        if (playError.name !== "AbortError") throw playError;
      }

      if (requestId === requestIdRef.current) setStatus("Camera ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message = `${error.name ?? "CameraError"}: ${error.message ?? "Unable to access camera"}`;
      setCameraError(message);
      setStatus("Camera unavailable");
    }
  }, []);

  useEffect(() => {
    fetch(`${API}/dataset/counts`).then((response) => response.ok ? response.json() : Promise.reject()).then(setCounts).catch(() => setStatus("Could not load counts — is the backend running?"));
    enableCamera();
    return () => {
      requestIdRef.current += 1; // invalidate any in-flight enableCamera call
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [enableCamera]);

  const updateCount = (type, name, nextCount) => setCounts((current) => ({ ...current, [`${type}s`]: { ...current[`${type}s`], [name]: nextCount } }));
  const upload = async (blob, type, name) => {
    setStatus("Saving raw sample…");
    const body = new FormData();
    body.append("file", blob, type === "word" ? "sample.webm" : "sample.jpg");
    body.append("label_type", type); body.append("label", name);
    const response = await fetch(`${API}/dataset/sample`, { method: "POST", body });
    if (!response.ok) throw new Error("Upload failed");
    const saved = await response.json();
    updateCount(type, name, saved.count);
    setLastSaved({ type, label: name });
    setStatus(`Saved ${name}: ${saved.count} samples`);
  };
  const takeLetter = async (type, name) => {
    const video = videoRef.current, canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    await upload(blob, type, name);
  };
  const takeWord = (type, name) => new Promise((resolve, reject) => {
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    const chunks = [];
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    recorder.onerror = () => reject(new Error("Recording failed"));
    recorder.onstop = () => upload(new Blob(chunks, { type: "video/webm" }), type, name).then(resolve, reject);
    recorder.start(); setStatus("Recording 3-second word sample…");
    window.setTimeout(() => recorder.stop(), 3000);
  });
  const beginCapture = (type = labelType, name = label, allowWhileBusy = false) => {
    if (!streamRef.current || (busy && !allowWhileBusy)) {
      setStatus("Enable the camera before recording.");
      return;
    }
    setBusy(true); setCountdown(3); setStatus(`Get ready for ${name}`);
    let remaining = 3;
    const timer = window.setInterval(() => {
      remaining -= 1; setCountdown(remaining || null);
      if (!remaining) { window.clearInterval(timer); (type === "word" ? takeWord(type, name) : takeLetter(type, name)).catch((error) => setStatus(error.message)).finally(() => setBusy(false)); }
    }, 1000);
  };
  const redoLast = async () => {
    if (!lastSaved || busy) return;
    setBusy(true); setStatus(`Discarding last ${lastSaved.label} sample…`);
    try {
      const query = new URLSearchParams({ label_type: lastSaved.type, label: lastSaved.label });
      const response = await fetch(`${API}/dataset/sample/last?${query}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not discard the last sample");
      const result = await response.json(); updateCount(lastSaved.type, lastSaved.label, result.count); setLastSaved(null);
      beginCapture(lastSaved.type, lastSaved.label, true);
    } catch (error) { setStatus(error.message); setBusy(false); }
  };
  const changeType = (type) => { setLabelType(type); setLabel(type === "word" ? WORDS[0] : LETTERS[0]); };

  return <main className="mx-auto min-h-screen max-w-3xl px-6 py-10 text-paper">
    <header className="mb-7"><p className="font-mono text-xs uppercase tracking-widest text-sign">Phase 2 utility</p><h1 className="font-display text-3xl">Recognition data collection</h1><p className="mt-2 text-sm text-muted">Raw webcam media only — Python MediaPipe extracts landmarks later.</p></header>
    <section className="rounded-2xl border border-line bg-panel p-5">
      <div className="mb-4 grid gap-3 sm:grid-cols-2"><label className="font-mono text-xs text-muted">TYPE<select value={labelType} disabled={busy} onChange={(event) => changeType(event.target.value)} className="mt-1 block w-full rounded bg-ink p-2 text-paper"><option value="word">Word (video)</option><option value="letter">Letter (photo)</option></select></label><label className="font-mono text-xs text-muted">LABEL<select value={label} disabled={busy} onChange={(event) => setLabel(event.target.value)} className="mt-1 block w-full rounded bg-ink p-2 text-paper">{choices.map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <div className="mb-4 rounded-lg bg-ink px-4 py-3 font-mono text-lg"><span className="text-sign">{label}</span>: {count}/40</div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black"><video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />{countdown && <div className="absolute inset-0 grid place-items-center bg-black/55 font-display text-8xl text-paper">{countdown}</div>}</div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={enableCamera} className="rounded border border-line px-5 py-2 font-mono text-sm">Enable camera</button><button disabled={busy || !streamRef.current} onClick={() => beginCapture()} className="rounded bg-sign px-5 py-2 font-mono text-sm text-ink disabled:opacity-50">{labelType === "word" ? "Record (3 sec)" : "Capture photo"}</button><button disabled={!lastSaved || busy} onClick={redoLast} className="rounded border border-line px-5 py-2 font-mono text-sm disabled:opacity-50">Redo last</button><span className="font-mono text-xs text-muted">{status}</span></div>
      {cameraError && <p role="alert" className="mt-3 rounded border border-red-500/50 bg-red-950/30 p-3 font-mono text-xs text-red-200">Camera error: {cameraError}</p>}
    </section>
  </main>;
}