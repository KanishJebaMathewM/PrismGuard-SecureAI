// Typed async fetch client for the PrismGuard FastAPI backend.
// All types are defined here — do NOT move to src/types.ts.

export interface ModelStats {
  resource: string;
  version: string;
  status: string;
  training_samples: number;
  detection_accuracy: number;
  last_trained: string | null;
  attacks_detected: number;
}

export interface PromptRecord {
  id: number;
  text: string;
  resource: string;
  label: number;
  category: string | null;
  risk: string;
  source: string;
  created_at: string;
}

export interface PredictResponse {
  label: number;
  confidence: number;
  resource: string;
  fallback: boolean;
}

export interface ClassifyPayload {
  prompt_text: string;
  resource: string;
  classification: string;
  category: string;
  notes: string;
}

export interface ClassifyResponse {
  stored_id: number;
  resource: string;
  retrained: boolean;
  new_version: string | null;
  message: string;
}

export interface StatsResponse {
  total_prompts: number;
  malicious: number;
  safe: number;
  by_resource: Record<string, { total: number; malicious: number }>;
}

export interface HealthResponse {
  status: string;
  models_loaded: string[];
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Exported API functions
// ---------------------------------------------------------------------------

export const fetchHealth = () => request<HealthResponse>('/health');

export const fetchModels = () => request<ModelStats[]>('/models');

export const fetchModelStats = (resource: string) =>
  request<ModelStats>(`/models/${resource}`);

export const retrainModel = (resource: string) =>
  request<Record<string, unknown>>(`/models/${resource}/retrain`, { method: 'POST' });

export const fetchPrompts = () => request<PromptRecord[]>('/prompts');

export const fetchPromptsByResource = (resource: string) =>
  request<PromptRecord[]>(`/prompts/${resource}`);

export const predictPrompt = (text: string, resource: string) =>
  request<PredictResponse>('/prompts/predict', {
    method: 'POST',
    body: JSON.stringify({ text, resource }),
  });

export const classifyReview = (id: string, payload: ClassifyPayload) =>
  request<ClassifyResponse>(`/admin/reviews/${id}/classify`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchStats = () => request<StatsResponse>('/stats');

// ---------------------------------------------------------------------------
// Chat pipeline
// ---------------------------------------------------------------------------

export interface SecurityStep {
  name: string;
  status: 'passed' | 'blocked' | 'flagged' | 'unavailable';
}

export interface ChatResponse {
  response: string;
  blocked: boolean;
  blocked_reason: string | null;
  blocked_layer: string | null;
  resource: string;
  security_steps: SecurityStep[];
  sent_to_review: boolean;
  confidence: number | null;
  guard_bypassed: boolean;
}

export const chatWithPrismGuard = (text: string, resource: string, prismguard_enabled: boolean = true) =>
  request<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ text, resource, prismguard_enabled }),
  });

