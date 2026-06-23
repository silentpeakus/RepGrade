# RepGrade Pose Service

Standalone Python ML service that turns a lift video into objective, rubric-scored
metrics. This is the Phase 0 grading core (`Project_Specifications_2.md` §5/§6) —
the Node/Base44 app calls it over HTTP; it is intentionally **not** part of the
Node backend (§5.1).

**v1 scope:** Back Squat vertical slice. Other exercises plug in behind the same
`/analyze` contract as their analyzers are written.

## Architecture

```
video → pose.py (MediaPipe Pose keypoints) → squat.py (rep detection + rubric
faults + Form grade) → JSON
```

- `app/pose.py` — the only MediaPipe-dependent module. Video → per-frame keypoints.
- `app/squat.py` — rep boundaries + depth / back-rounding / heel-lift faults +
  Form grade, per `rubrics/Back_Squat_Rubric_v1_1.md`.
- `app/main.py` — FastAPI service (`POST /analyze`, `GET /health`).
- `analyze_cli.py` — run the pipeline on a local file, print JSON. Use this for
  Phase 0 validation against coach judgment before wiring any UI.

> **Calibration:** every threshold in `squat.py` is a Phase 0 hypothesis (rubric
> §6), not a validated number. Tuning them against real coach-reviewed video *is*
> Phase 0's job — don't trust the grades until that's done.

## Setup

```bash
cd pose-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

Local validation (no server):

```bash
python analyze_cli.py /path/to/squat.mp4
```

HTTP service:

```bash
uvicorn app.main:app --reload --port 8000
# then:
curl -F "video=@/path/to/squat.mp4" -F "exercise=back_squat" http://localhost:8000/analyze
```

## Requirements

- Python 3.9–3.11 (MediaPipe constraint)
- A **side-view** (sagittal) clip for squat — the rubric grades sagittal-plane
  faults only; knee valgus is intentionally excluded (rubric §1).
