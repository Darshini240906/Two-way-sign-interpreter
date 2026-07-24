"""
Phase 3 — Whisper speech-to-text wrapper (local, offline).

TODO:
  - Load a whisper model once at startup (base or small).
  - transcribe(audio_bytes) -> {"text": str, "language": str}
"""


def transcribe(audio_bytes: bytes) -> dict:
    raise NotImplementedError("Load whisper model and transcribe here.")
