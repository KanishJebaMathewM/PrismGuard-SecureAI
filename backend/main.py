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

import logging
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
from backend.guard_client import check_prompt as guard_check_prompt  # noqa: E402
from backend.llm_client import generate_response as llm_generate  # noqa: E402

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


class ChatRequest(BaseModel):
    text: str
    resource: str


class SecurityStepResult(BaseModel):
    name: str
    status: str  # 'passed' | 'blocked' | 'flagged' | 'unavailable'


class ChatResponse(BaseModel):
    response: str
    blocked: bool
    blocked_reason: Optional[str]
    blocked_layer: Optional[str]
    resource: str
    security_steps: list[SecurityStepResult]
    sent_to_review: bool
    confidence: Optional[float]
    guard_bypassed: bool = False  # True when Guard API was unreachable and skipped


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


# ---------------------------------------------------------------------------
# Keyword blocklist (shared between /api/chat and future routes)
# ---------------------------------------------------------------------------
_KEYWORD_BLOCKLIST = [
    'ignore previous', 'ignore all', 'reveal customer', 'reveal sensitive',
    'export all', 'reveal all', 'bypass', 'admin mode', 'developer mode',
    'grant me access', 'system prompt', 'jailbreak', 'salary', 'payroll',
]

# Maximum allowed prompt length — sourced from .env; enforced before any
# downstream call so oversized inputs never reach the Guard or LLM APIs.
_MAX_INPUT_LENGTH = int(os.getenv("MAX_INPUT_LENGTH", "4000"))


# POST /api/chat
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    text = request.text
    resource = _normalise_resource(request.resource)
    lower = text.lower()

    steps: list[SecurityStepResult] = []
    blocked = False
    blocked_reason: Optional[str] = None
    blocked_layer: Optional[str] = None
    sent_to_review = False
    confidence: Optional[float] = None
    response_text = ""
    guard_bypassed = False

    # ------------------------------------------------------------------
    # Input length guard — enforced before any downstream API call
    # ------------------------------------------------------------------
    if len(text) > _MAX_INPUT_LENGTH:
        raise HTTPException(
            status_code=422,
            detail=f"Prompt exceeds maximum allowed length of {_MAX_INPUT_LENGTH} characters.",
        )

    # ------------------------------------------------------------------
    # Step 1 — Keyword Filter
    # ------------------------------------------------------------------
    if any(kw in lower for kw in _KEYWORD_BLOCKLIST):
        steps.append(SecurityStepResult(name="Keyword Filter", status="blocked"))
        blocked = True
        blocked_reason = "Blocked keyword detected in prompt."
        blocked_layer = "Keyword Filter"
        db.add(Prompt(text=text, resource=resource, label=1, risk="High", source="chat"))
        db.commit()
        return ChatResponse(
            response=(
                "This prompt was blocked by PrismGuard.\n\n"
                "Reason: Blocked keyword detected in prompt.\n"
                "Blocked at: Keyword Filter"
            ),
            blocked=True,
            blocked_reason=blocked_reason,
            blocked_layer=blocked_layer,
            resource=resource,
            security_steps=steps,
            sent_to_review=False,
            confidence=None,
            guard_bypassed=False,
        )
    steps.append(SecurityStepResult(name="Keyword Filter", status="passed"))

    # ------------------------------------------------------------------
    # Step 2 — Secure AI Guard API
    # ------------------------------------------------------------------
    try:
        guard_result = await guard_check_prompt(text, resource)
        if guard_result.blocked:
            steps.append(SecurityStepResult(name="Secure AI API", status="blocked"))
            blocked = True
            blocked_reason = guard_result.reason or "Blocked by Secure AI Guard."
            blocked_layer = "Secure AI API Layer"
            confidence = guard_result.confidence or None
            db.add(Prompt(text=text, resource=resource, label=1, risk="High", source="chat"))
            db.commit()
            return ChatResponse(
                response=(
                    f"This prompt was blocked by PrismGuard.\n\n"
                    f"Reason: {blocked_reason}\n"
                    f"Blocked at: {blocked_layer}"
                ),
                blocked=True,
                blocked_reason=blocked_reason,
                blocked_layer=blocked_layer,
                resource=resource,
                security_steps=steps,
                sent_to_review=False,
                confidence=confidence,
                guard_bypassed=False,
            )
        elif guard_result.unavailable:
            logging.warning(
                "guard_unavailable: SecureGuard API unreachable for resource=%s; "
                "failing open and continuing pipeline (event=guard_unavailable)",
                resource,
            )
            steps.append(SecurityStepResult(name="Secure AI API", status="unavailable"))
            guard_bypassed = True
        else:
            steps.append(SecurityStepResult(name="Secure AI API", status="passed"))
    except Exception as exc:
        logging.warning(
            "guard_unavailable: exception calling SecureGuard for resource=%s "
            "(event=guard_unavailable): %s",
            resource, exc,
        )
        steps.append(SecurityStepResult(name="Secure AI API", status="unavailable"))
        guard_bypassed = True

    # ------------------------------------------------------------------
    # Step 3 — ML Model (PrismGuard)
    # ------------------------------------------------------------------
    ml_result = predict(resource, text)
    ml_label = ml_result["label"]
    ml_conf = float(ml_result["confidence"])
    confidence = ml_conf

    if ml_label == 1 and ml_conf > 0.7:
        steps.append(SecurityStepResult(name="PrismGuard", status="blocked"))
        blocked = True
        blocked_reason = "Prompt flagged as malicious by PrismGuard ML model."
        blocked_layer = "PrismGuard ML Layer"
        sent_to_review = True
        db.add(Prompt(text=text, resource=resource, label=1, risk="High", source="chat-review"))
        db.commit()
        return ChatResponse(
            response=(
                f"This prompt was blocked by PrismGuard.\n\n"
                f"Reason: {blocked_reason}\n"
                f"Blocked at: {blocked_layer}"
            ),
            blocked=True,
            blocked_reason=blocked_reason,
            blocked_layer=blocked_layer,
            resource=resource,
            security_steps=steps,
            sent_to_review=True,
            confidence=ml_conf,
            guard_bypassed=guard_bypassed,
        )
    elif ml_label == 1 and 0.5 <= ml_conf <= 0.7:
        steps.append(SecurityStepResult(name="PrismGuard", status="flagged"))
        sent_to_review = True
    else:
        steps.append(SecurityStepResult(name="PrismGuard", status="passed"))

    # ------------------------------------------------------------------
    # Step 4 — Resource Model (display step — model already ran above)
    # ------------------------------------------------------------------
    steps.append(SecurityStepResult(name="Resource Model", status="passed"))

    # ------------------------------------------------------------------
    # Step 5 — LLM Response
    # ------------------------------------------------------------------
    try:
        response_text = await llm_generate(text, resource)
    except Exception as exc:
        logging.warning("LLM unavailable: %s", exc)
        response_text = (
            f"I'm currently unable to process your request for {resource} data. "
            "Please try again shortly."
        )

    # ------------------------------------------------------------------
    # Step 6 — Audit log
    # ------------------------------------------------------------------
    audit_source = "chat-review" if sent_to_review else "chat"
    audit_label = 1 if sent_to_review else 0
    audit_risk = "Medium" if sent_to_review else "Low"
    db.add(Prompt(text=text, resource=resource, label=audit_label, risk=audit_risk, source=audit_source))
    db.commit()

    return ChatResponse(
        response=response_text,
        blocked=False,
        blocked_reason=None,
        blocked_layer=None,
        resource=resource,
        security_steps=steps,
        sent_to_review=sent_to_review,
        confidence=ml_conf,
        guard_bypassed=guard_bypassed,
    )


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
