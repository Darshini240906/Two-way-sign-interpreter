"""
Phase 2.2 — Train an LSTM classifier on landmark sequences for the
20 dynamic word signs.

Input shape:  [frames, num_landmarks * 3]
Output:       1-of-20 class probabilities

TODO:
  - Load training samples from datasets/landmark_samples/words/
  - Pad/truncate sequences to a fixed length.
  - Build + train a small LSTM (Keras) on (X, y).
  - Save to backend/models/words_lstm.h5
"""

WORDS = [
    "HELLO", "THANK YOU", "YES", "NO", "PLEASE", "HELP", "NAME", "WATER",
    "EAT", "GOOD", "BAD", "SORRY", "FRIEND", "LOVE", "STOP", "MORE",
    "WANT", "WHERE", "HOW", "BYE",
]


def train():
    raise NotImplementedError("Build + train the LSTM here.")


if __name__ == "__main__":
    train()
