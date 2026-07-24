# Two-Way Sign Language Interpreter

Scaffold: a clean UI shell + backend skeleton. Nothing ML-related is
wired up yet — every stub says exactly what goes there and which
phase of the build spec it belongs to.

## What's here

```
backend/
  main.py                  # FastAPI app, /ws/webcam and /ws/mic (stubbed)
  recognition/
    extract_landmarks.py   # Phase 2.1 — MediaPipe landmark extraction
    train_words_lstm.py    # Phase 2.2 — 20-word LSTM classifier
    train_letters_clf.py   # Phase 2.2 — 26-letter static classifier
  stt.py                   # Phase 3 — Whisper wrapper
  translate.py             # Phase 3 — argos-translate wrapper
  tts.py                   # Phase 4 — Coqui TTS / gTTS wrapper
capture-tool/
  index.html               # Phase 1.3 — one-time offline capture utility
frontend/
  src/App.jsx               # layout + mode toggle
  src/components/
    WebcamPanel.jsx         # Direction A: Sign -> Speech
    AvatarPanel.jsx          # Direction B: Speech -> Sign
    StatusBar.jsx
assets/
  avatar.glb                # Mixamo-compatible Y Bot, T-pose
  animation-clip.schema.json # contract for all captured clips
  signs/, letters/          # JSON animation clips
datasets/
  landmark_samples/         # training data for recognition models
```

## Run the frontend

```
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. It's a static shell right now — the
webcam/avatar panels are placeholders, nothing is connected to the
backend yet.

## Run the backend

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Serves on `http://localhost:8000`. `/health` should return `{"status": "ok"}`.
The two WebSocket routes accept connections and echo empty responses
until the recognition/STT/TTS pieces are filled in.

## Phase 2 data collection

With the frontend and backend running, open `http://localhost:5173/dataset-capture`.
It records three-second word videos or captures still letter handshapes and saves raw
media under `datasets/landmark_samples/`. The browser does not run MediaPipe here;
`recognition/extract_landmarks.py` processes the data later.

## What's NOT built yet

Everything marked `TODO` / `NotImplementedError`, following the
phases in the original build spec:

1. Avatar rig + Kalidokit capture pipeline → 46 JSON animation clips
2. Sign recognition (MediaPipe landmarks → LSTM/classifier → live text)
3. Speech → sign lookup (Whisper → translate → clip queue → avatar playback)
4. Multilingual TTS output

The frontend is intentionally minimal so you can restyle it freely —
none of the phases above depend on the current UI code.

## Phase 1 capture and playback

`assets/avatar.glb` is the rig used by both the capture preview and the React
avatar panel. `capture-tool/index.html` is an offline browser utility (serve
the repository with any static web server, then open `/capture-tool/`) that
accepts a video file, evaluates MediaPipe Holistic, previews Kalidokit-driven
bone rotations, and exports a clip. It records this format, formally defined
in `assets/animation-clip.schema.json`:

```json
{"version":1,"fps":30,"duration":0.5,"source":"hello.mp4","frames":[{"time":0,"bones":{"mixamorigHips":[0,0,0,1]}}]}
```

Put a captured clip in `assets/signs/` or `assets/letters/` and pass its served
path (for example `/signs/hello.json`) as `clipUrl` to `AvatarPanel`. The panel
loads `/avatar.glb` through `GLTFLoader` and applies its named bone quaternions
one frame at a time. The default clip is optional, so the avatar still loads
before the first capture.
