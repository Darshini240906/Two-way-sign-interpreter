"""
Phase 2.2 — Train a frame-level classifier for the 26 static
fingerspelling letters (A-Z). Static handshapes don't need sequence
modeling, so a dense NN or k-NN on a single frame's landmarks works.

TODO:
  - Load training samples from datasets/landmark_samples/letters/
  - Train a dense NN or k-NN on single-frame landmark vectors.
  - Save to backend/models/letters_clf.pkl (or .h5)
"""

import string

LETTERS = list(string.ascii_uppercase)


def train():
    raise NotImplementedError("Build + train the letter classifier here.")


if __name__ == "__main__":
    train()
