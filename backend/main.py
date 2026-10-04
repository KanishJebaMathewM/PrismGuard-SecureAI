"""
main.py – FastAPI application for PrismGuard ML backend.

Routes
------
  GET  /api/health
  GET  /api/models
  GET  /api/models/{resource}
  POST /api/models/{resource}/retrain
  GET  /api/prompts
  GET  /api/prompts/{resource}
  POST /api/prompts/predict
  POST /api/admin/reviews/{review_id}/classify
  GET  /api/stats

Start:
    uvicorn backend.main:app --reload --port 8000
"""

import os
from pathlib import Path
from typing import Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

# Load .env from the project root before anything else
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_PROJECT_ROOT / ".env")

from backend.database import ModelMetadata, Prompt, get_db  # noqa: E402
from backend.ml_models import RESOURCES, predict, retrain_model  # noqa: E402

# ---------------------------------------------------------------------------
# App + CORS
# ---------------------------------------------------------------------------
app = FastAPI(title="PrismGuard ML Backend", version="1.0.0")

_cors_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
)
_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    text: str
    resource: str


class ClassifyRequest(BaseModel):
    prompt_text: str
    resource: str
    classification: str          # "Malicious" | "Safe"
    category: str = ""
    notes: str = ""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _normalise_resource(resource: str) -> str:
    """Return the canonical capitalised resource name, or raise 404."""
    for r in RESOURCES:
        if r.lower() == resource.lower():
            return r
    raise HTTPException(status_code=404, detail=f"Unknown resource '{resource}'")


def _model_pkl_exists(resource: str) -> bool:
    from backend.ml_models import _model_path  # local import to avoid circular

    return os.path.exists(_model_path(resource))


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

# GET /api/health
@app.get("/api/health")
def health():
    models_loaded = [r for r in RESOURCES if _model_pkl_exists(r)]
    return {"status": "ok", "models_loaded": models_loaded}


# GET /api/models
@app.get("/api/models")
def get_models(db: Session = Depends(get_db)):
    results = []
    for resource in RESOURCES:
        meta = db.execute(
            select(ModelMetadata).where(ModelMetadata.resource == resource)
        ).scalar_one_or_none()

        if meta:
            results.append(
                {
                    "resource": meta.resource,
                    "version": meta.version,
                    "status": meta.status,
                    "training_samples": meta.training_samples,
                    "detection_accuracy": meta.detection_accuracy,
                    "last_trained": meta.last_trained.isoformat() if meta.last_trained else None,
                    "attacks_detected": meta.attacks_detected,
                }
            )
        else:
            results.append(
                {
                    "resource": resource,
                    "version": "v0.0",
                    "status": "Untrained",
                    "training_samples": 0,
                    "detection_accuracy": 0.0,
                    "last_trained": None,
                    "attacks_detected": 0,
                }
            )
    return results


# GET /api/models/{resource}
@app.get("/api/models/{resource}")
def get_model(resource: str, db: Session = Depends(get_db)):
    resource = _normalise_resource(resource)
    meta = db.execute(
        select(ModelMetadata).where(ModelMetadata.resource == resource)
    ).scalar_one_or_none()

    if not meta:
        raise HTTPException(status_code=404, detail=f"No metadata for resource '{resource}'")

    return {
        "resource": meta.resource,
        "version": meta.version,
        "status": meta.status,
        "training_samples": meta.training_samples,
        "detection_accuracy": meta.detection_accuracy,
        "last_trained": meta.last_trained.isoformat() if meta.last_trained else None,
        "attacks_detected": meta.attacks_detected,
    }


# POST /api/models/{resource}/retrain
@app.post("/api/models/{resource}/retrain")
def retrain(resource: str, db: Session = Depends(get_db)):
    resource = _normalise_resource(resource)
    result = retrain_model(resource, db)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("reason", "retrain failed"))
    return result


# GET /api/prompts
@app.get("/api/prompts")
def get_prompts(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(Prompt).order_by(Prompt.created_at.desc()).limit(100)
        )
        .scalars()
        .all()
    )
    return [
        {
            "id": r.id,
            "text": r.text,
            "resource": r.resource,
            "label": r.label,
            "category": r.category,
            "risk": r.risk,
            "source": r.source,
            "notes": r.notes,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


# GET /api/prompts/{resource}
@app.get("/api/prompts/{resource}")
def get_prompts_by_resource(resource: str, db: Session = Depends(get_db)):
    resource = _normalise_resource(resource)
    rows = (
        db.execute(
            select(Prompt)
            .where(Prompt.resource == resource)
            .order_by(Prompt.created_at.desc())
        )
        .scalars()
        .all()
    )
    return [
        {
            "id": r.id,
            "text": r.text,
            "resource": r.resource,
            "label": r.label,
            "category": r.category,
            "risk": r.risk,
            "source": r.source,
            "notes": r.notes,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


# POST /api/prompts/predict
@app.post("/api/prompts/predict")
def predict_prompt(request: PredictRequest):
    resource = _normalise_resource(request.resource)
    result = predict(resource, request.text)
    return result


# POST /api/admin/reviews/{review_id}/classify
@app.post("/api/admin/reviews/{review_id}/classify")
def classify_review(
    review_id: str,
    request: ClassifyRequest,
    db: Session = Depends(get_db),
):
    resource = _normalise_resource(request.resource)
    label = 1 if request.classification.strip().lower() == "malicious" else 0

    prompt_row = Prompt(
        text=request.prompt_text,
        resource=resource,
        label=label,
        category=request.category or None,
        risk="High" if label == 1 else "Low",
        source="admin",
        notes=request.notes or None,
    )
    db.add(prompt_row)
    db.commit()
    db.refresh(prompt_row)

    retrain_result = retrain_model(resource, db)
    retrained = bool(retrain_result.get("success", False))

    if retrained:
        message = (
            f"Prompt classified as {request.classification} and stored. "
            f"Model retrained to {retrain_result.get('version')} "
            f"with {retrain_result.get('samples')} samples."
        )
    else:
        message = (
            f"Prompt classified as {request.classification} and stored. "
            f"Retrain skipped: {retrain_result.get('reason', 'unknown reason')}."
        )

    return {
        "stored_id": prompt_row.id,
        "resource": resource,
        "retrained": retrained,
        "new_version": retrain_result.get("version") if retrained else None,
        "accuracy": retrain_result.get("accuracy"),
        "message": message,
    }


# GET /api/stats
@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.execute(select(func.count()).select_from(Prompt)).scalar()
    malicious = db.execute(
        select(func.count()).select_from(Prompt).where(Prompt.label == 1)
    ).scalar()
    safe = db.execute(
        select(func.count()).select_from(Prompt).where(Prompt.label == 0)
    ).scalar()

    breakdown = {}
    for resource in RESOURCES:
        r_total = db.execute(
            select(func.count()).select_from(Prompt).where(Prompt.resource == resource)
        ).scalar()
        r_malicious = db.execute(
            select(func.count())
            .select_from(Prompt)
            .where(Prompt.resource == resource, Prompt.label == 1)
        ).scalar()
        breakdown[resource] = {"total": r_total, "malicious": r_malicious, "safe": r_total - r_malicious}

    return {
        "total_prompts": total,
        "malicious": malicious,
        "safe": safe,
        "by_resource": breakdown,
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
