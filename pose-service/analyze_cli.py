"""Local Phase 0 validation runner — no HTTP needed.

Usage:
    python analyze_cli.py path/to/squat.mp4 [exercise]

Prints the grade JSON so you can eyeball pipeline output against what a coach
would say for the same clip (Project_Specifications_2.md S6 / S8).
"""

import json
import sys

from app import preflight
from app.pose import extract_frames
from app.squat import analyze_squat

ANALYZERS = {"back_squat": analyze_squat, "squat": analyze_squat}


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    path = sys.argv[1]
    exercise = (sys.argv[2] if len(sys.argv) > 2 else "back_squat").lower()
    analyzer = ANALYZERS.get(exercise)
    if analyzer is None:
        print(f"No analyzer for '{exercise}'. Available: {sorted(set(ANALYZERS) - {'squat'})}")
        sys.exit(1)

    print(f"Extracting pose from {path} ...", file=sys.stderr)
    frames, fps, meta = extract_frames(path)
    print(f"Decoded {len(frames)} frames at {fps:.1f} fps.", file=sys.stderr)

    check = preflight.check(meta, exercise)
    if not check["ok"]:
        print(f"Pre-flight REJECTED (view={check['view']}). Not grading.", file=sys.stderr)
        print(json.dumps({
            "status": "rejected",
            "reason": "preflight_failed",
            "view": check["view"],
            "issues": check["issues"],
            "meta": check["meta_echo"],
        }, indent=2))
        return

    print("Pre-flight OK. Analyzing ...", file=sys.stderr)
    result = analyzer(frames, fps)
    result["status"] = "graded"
    result["fps"] = round(fps, 2)
    result["frames_analyzed"] = len(frames)
    result["preflight"] = check["meta_echo"] | {"view": check["view"]}
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
