"""
Phase 2.1 — Run MediaPipe Holistic over a video/frame and return a
flat landmark feature vector (pose + both hands + face, as needed).

TODO:
  - Load MediaPipe Holistic.
  - Given a frame (or path to a recorded sample), return landmarks
    as a numpy array of shape [num_landmarks * 3].
  - For a full clip, return shape [frames, num_landmarks * 3] so it
    can feed straight into the LSTM in train_words_lstm.py.
"""

import numpy as np


def extract_landmarks_from_frame(frame) -> np.ndarray:
    raise NotImplementedError("Wire up MediaPipe Holistic here.")


def extract_landmarks_from_clip(path: str) -> np.ndarray:
    raise NotImplementedError("Iterate frames, call extract_landmarks_from_frame.")
