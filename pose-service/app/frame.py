"""The keypoint data model — deliberately dependency-free.

Lives apart from pose.py so that downstream grading logic (squat.py) and its
tests can run without importing MediaPipe/OpenCV. The pose backend can be swapped
without touching this contract.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class Frame:
    """One video frame's keypoints, in normalized image coordinates.

    x, y are 0..1 (origin top-left, so larger y = lower on screen).
    Each point is stored as (x, y, visibility).
    """

    t: float  # timestamp in seconds
    points: dict  # name -> (x, y, visibility)

    def xy(self, name: str) -> Optional[tuple]:
        p = self.points.get(name)
        if p is None or p[2] < 0.5:  # low-visibility keypoint -> treat as missing
            return None
        return (p[0], p[1])
