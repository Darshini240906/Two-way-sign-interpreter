"""
FastAPI backend for the two-way sign language interpreter.

Two WebSocket streams:
  /ws/webcam  -> receives video frames, will eventually return
                 recognized word/letter + confidence (Phase 2)
  /ws/mic     -> receives audio chunks, will eventually return
                 a queue of sign clip names to play on the avatar (Phase 3)

Everything below is a working, minimal skeleton: real landmark
extraction / model inference / STT / TTS are stubbed with TODOs
that map directly to the phases in the build spec.
"""

import re
import shutil
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sign Interpreter API")

WORDS = (
    "HELLO", "THANK YOU", "YES", "NO", "PLEASE", "HELP", "NAME", "WATER",
    "EAT", "GOOD", "BAD", "SORRY", "FRIEND", "LOVE", "STOP", "MORE", "WANT",
    "WHERE", "HOW", "BYE",
)
LETTERS = tuple("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
DATASET_ROOT = Path(__file__).resolve().parent.parent / "datasets" / "landmark_samples"
DATASET_LOCK = Lock()


def _label_directory(label_type: str, label: str) -> Path:
    """Validate a requested class and return its raw-media directory."""
    normalized_type = label_type.lower()
    normalized_label = label.strip().upper()
    allowed = WORDS if normalized_type == "word" else LETTERS if normalized_type == "letter" else ()
    if normalized_label not in allowed:
        raise HTTPException(status_code=422, detail="Unknown label for label_type")
    return DATASET_ROOT / f"{normalized_type}s" / normalized_label


def _sample_count(directory: Path, suffix: str) -> int:
    return len(list(directory.glob(f"take_*{suffix}"))) if directory.exists() else 0


def _next_take_number(directory: Path, suffix: str) -> int:
    numbers = [int(match.group(1)) for path in directory.glob(f"take_*{suffix}") if (match := re.fullmatch(r"take_(\d+)", path.stem))]
    return max(numbers, default=0) + 1

# Wide-open CORS for local dev. Tighten before deploying anywhere real.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/dataset/counts")
def dataset_counts():
    """Current raw training-media count for every supported class."""
    return {
        "words": {label: _sample_count(DATASET_ROOT / "words" / label, ".webm") for label in WORDS},
        "letters": {label: _sample_count(DATASET_ROOT / "letters" / label, ".jpg") for label in LETTERS},
    }


@app.post("/dataset/sample")
async def upload_dataset_sample(
    file: UploadFile = File(...),
    label_type: str = Form(...),
    label: str = Form(...),
):
    """Store raw webcam media. Landmark extraction intentionally happens later in Python."""
    directory = _label_directory(label_type, label)
    suffix = ".webm" if label_type.lower() == "word" else ".jpg"
    with DATASET_LOCK:
        directory.mkdir(parents=True, exist_ok=True)
        take_number = _next_take_number(directory, suffix)
        destination = directory / f"take_{take_number}{suffix}"
        with destination.open("wb") as output:
            shutil.copyfileobj(file.file, output)
        count = _sample_count(directory, suffix)
    return {"label_type": label_type.lower(), "label": label.strip().upper(), "count": count, "filename": destination.name}


@app.delete("/dataset/sample/last")
def discard_last_dataset_sample(label_type: str, label: str):
    """Remove the latest local take so the collection UI can redo it."""
    directory = _label_directory(label_type, label)
    suffix = ".webm" if label_type.lower() == "word" else ".jpg"
    with DATASET_LOCK:
        takes = sorted(directory.glob(f"take_*{suffix}"), key=lambda path: int(re.fullmatch(r"take_(\d+)", path.stem).group(1))) if directory.exists() else []
        if not takes:
            raise HTTPException(status_code=404, detail="No sample exists for this label")
        takes[-1].unlink()
        count = _sample_count(directory, suffix)
    return {"label_type": label_type.lower(), "label": label.strip().upper(), "count": count}


@app.websocket("/ws/webcam")
async def webcam_stream(websocket: WebSocket):
    """Direction A: Sign -> Speech/Text.

    TODO (Phase 2):
      1. Decode incoming frame bytes.
      2. Run MediaPipe Holistic -> landmarks.
      3. Feed landmark sequence into the trained word/letter
         classifiers (recognition/train_words_lstm.py,
         recognition/train_letters_clf.py).
      4. Apply confidence thresholding/stabilization.
      5. Send back {"label": str, "confidence": float}.
    """
    await websocket.accept()
    try:
        while True:
            frame_bytes = await websocket.receive_bytes()
            # Placeholder echo so the frontend has something to render
            # against before recognition is wired up.
            await websocket.send_json({"label": None, "confidence": 0.0})
    except WebSocketDisconnect:
        pass


@app.websocket("/ws/mic")
async def mic_stream(websocket: WebSocket):
    """Direction B: Speech -> Sign.

    TODO (Phase 3):
      1. Buffer incoming audio chunks.
      2. Run Whisper (stt.py) -> transcript.
      3. Run argos-translate (translate.py) if needed.
      4. Tokenize transcript, map each word to a sign clip name
         or letter-by-letter fallback.
      5. Send back {"clips": ["hello", "f", "r", "i", "e", "n", "d"]}.
    """
    await websocket.accept()
    try:
        while True:
            audio_chunk = await websocket.receive_bytes()
            await websocket.send_json({"transcript": "", "clips": []})
    except WebSocketDisconnect:
        pass
