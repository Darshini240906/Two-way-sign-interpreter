"""
Phase 4 — Multilingual text-to-speech wrapper. Coqui TTS primary,
gTTS as a lighter fallback.

TODO:
  - Load a multilingual Coqui TTS model
    (e.g. tts_models/multilingual/multi-dataset/your_tts).
  - synthesize(text, lang) -> audio bytes (wav/mp3)
"""


def synthesize(text: str, lang: str = "en") -> bytes:
    raise NotImplementedError("Wire up Coqui TTS (or gTTS fallback) here.")
