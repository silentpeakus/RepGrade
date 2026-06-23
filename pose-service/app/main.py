"""RepGrade pose-estimation service (FastAPI).

Standalone ML service per Project_Specifications_2.md S5.1 — the Node/Base44
app calls this over HTTP. v1 implements the Back Squat vertical slice; other
exercises plug in as additional analyzers behind the same /analyze contract.
"""

from __future__ import annotations

import os
import tempfile

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from . import preflight
from .pose import extract_frames
from .squat import analyze_squat

app = FastAPI(title="RepGrade Pose Service", version="0.1.0")

ANALYZERS = {
    "back_squat": analyze_squat,
    "squat": analyze_squat,
}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "exercises": sorted(set(ANALYZERS) - {"squat"})}


@app.post("/analyze")
async def analyze(
    video: UploadFile = File(...),
    exercise: str = Form("back_squat"),
) -> dict:
    key = exercise.strip().lower().replace(" ", "_")
    analyzer = ANALYZERS.get(key)
    if analyzer is None:
        raise HTTPException(status_code=400, detail=f"No analyzer for exercise '{exercise}' yet.")

    suffix = os.path.splitext(video.filename or "")[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await video.read())
        path = tmp.name
    try:
        frames, fps, meta = extract_frames(path)
        if not frames:
            raise HTTPException(status_code=422, detail="No frames decoded from video.")

        # Pre-flight gate: reject un-gradeable clips with specific guidance (spec S3/S8).
        check = preflight.check(meta, key)
        if not check["ok"]:
            return {
                "status": "rejected",
                "reason": "preflight_failed",
                "view": check["view"],
                "issues": check["issues"],
                "meta": check["meta_echo"],
            }

        result = analyzer(frames, fps)
        result["status"] = "graded"
        result["fps"] = round(fps, 2)
        result["frames_analyzed"] = len(frames)
        result["preflight"] = check["meta_echo"] | {"view": check["view"]}
        return result
    finally:
        os.unlink(path)
