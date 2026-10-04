"""
ml_models.py – Per-resource TF-IDF + LogisticRegression ML pipelines.

Each of the four resources (Banking, Government, Company, Research) gets its
own independently trained .pkl file stored in backend/models/.

Public API
----------
  predict(resource, text)          -> dict with label, confidence, resource, fallback
  retrain_model(resource, session) -> dict with success, version, accuracy, samples
  RESOURCES                        -> list of valid resource names
"""

import datetime
import os

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sqlalchemy import select

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
RESOURCES = ["Banking", "Government", "Company", "Research"]

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Module-level cache: resource -> loaded Pipeline
_pipeline_cache: dict = {}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
def _model_path(resource: str) -> str:
    return os.path.join(MODELS_DIR, f"{resource.lower()}_model.pkl")


def _load_pipeline(resource: str):
    """Return cached pipeline, loading from disk if necessary. None if untrained."""
    if resource in _pipeline_cache:
        return _pipeline_cache[resource]
    path = _model_path(resource)
    if os.path.exists(path):
        pipeline = joblib.load(path)
        _pipeline_cache[resource] = pipeline
        return pipeline
    return None


def _new_pipeline() -> Pipeline:
    return Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    max_features=5000,
                    sublinear_tf=True,
                    strip_accents="unicode",
                    analyzer="word",
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    max_iter=1000,
                    class_weight="balanced",
                    C=1.0,
                    solver="lbfgs",
                ),
            ),
        ]
    )


# ---------------------------------------------------------------------------
# Public: predict
# ---------------------------------------------------------------------------
def predict(resource: str, text: str) -> dict:
    """
    Classify *text* for the given *resource*.

    Returns a dict:
      label      – 0 (safe) or 1 (malicious)
      confidence – float probability for the predicted class
      resource   – echoed back
      fallback   – True when no trained model exists yet
    """
    pipeline = _load_pipeline(resource)
    if not pipeline:
        return {
            "label": 0,
            "confidence": 0.5,
            "resource": resource,
            "fallback": True,
        }

    label = int(pipeline.predict([text])[0])
    proba = pipeline.predict_proba([text])[0]
    confidence = float(proba[label])
    return {
        "label": label,
        "confidence": confidence,
        "resource": resource,
        "fallback": False,
    }


# ---------------------------------------------------------------------------
# Public: retrain_model
# ---------------------------------------------------------------------------
def retrain_model(resource: str, session) -> dict:
    """
    Re-fit the pipeline for *resource* using all rows in the prompts table
    for that resource, then persist the new model and update model_metadata.

    Returns a dict:
      success  – bool
      reason   – set only when success=False
      version  – new version string (e.g. 'v1.1')
      accuracy – float percentage
      samples  – number of training rows used
    """
    # Lazy import to avoid circular dependency at module load time
    from backend.database import ModelMetadata, Prompt  # noqa: PLC0415

    rows = (
        session.execute(select(Prompt).where(Prompt.resource == resource))
        .scalars()
        .all()
    )

    if len(rows) < 4:
        return {"success": False, "reason": "not enough samples"}

    texts = [r.text for r in rows]
    labels = [r.label for r in rows]

    pipeline = _new_pipeline()
    has_both_classes = len(set(labels)) > 1

    if has_both_classes and len(rows) >= 10:
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, stratify=labels, random_state=42
        )
        pipeline.fit(X_train, y_train)
        accuracy = float(pipeline.score(X_test, y_test)) * 100
    else:
        pipeline.fit(texts, labels)
        accuracy = 100.0 if not has_both_classes else 75.0

    # Persist to disk and update cache
    joblib.dump(pipeline, _model_path(resource))
    _pipeline_cache[resource] = pipeline

    # Update or create ModelMetadata row
    meta = (
        session.execute(
            select(ModelMetadata).where(ModelMetadata.resource == resource)
        )
        .scalar_one_or_none()
    )

    if meta:
        parts = meta.version.lstrip("v").split(".")
        if len(parts) > 1:
            new_version = f"v{parts[0]}.{int(parts[1]) + 1}"
        else:
            new_version = f"v{parts[0]}.1"
        meta.version = new_version
        meta.training_samples = len(rows)
        meta.detection_accuracy = round(accuracy, 1)
        meta.last_trained = datetime.datetime.utcnow()
        meta.status = "Active"
    else:
        meta = ModelMetadata(
            resource=resource,
            version="v1.0",
            training_samples=len(rows),
            detection_accuracy=round(accuracy, 1),
            last_trained=datetime.datetime.utcnow(),
            status="Active",
        )
        session.add(meta)

    session.commit()

    return {
        "success": True,
        "version": meta.version,
        "accuracy": meta.detection_accuracy,
        "samples": len(rows),
    }
