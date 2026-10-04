# PrismGuard Security Pipeline: LLM + Guard Integration

The change wires a real async security pipeline into a previously static chat interface. A five-step flow — keyword filter, SecureGuard API, PrismGuard ML, resource model, LLM — now runs on every `/api/chat` request, with the frontend falling back to the original local logic when the backend is unreachable. The guard client handles endpoint discovery across four candidate paths and fails open when the API is unavailable. The LLM client wraps OpenAI with a resource-scoped system prompt and falls back silently on failure.

Watch for: **(confirmed)** the fail-open guard design means an attacker who can cause the guard API to be unreachable gets uninspected prompts through to the LLM; **(confirmed)** `salary` and `payroll` appear in the keyword blocklist but are also present in the frontend's `queryDatabase` guard clause — a discrepancy in how the front-end's offline path treats these versus the backend; **(confirmed)** the audit log in `main.py` is written *after* LLM generation with `label=0`, double-logging flagged (0.5–0.7 ML confidence) prompts as safe; **(confirmed)** `context` parameter in `llm_client.generate_response` is never passed by `main.py`, so the f-string branch that appends context is dead code in production; **(possible)** the `_discovered_endpoint` module-level cache is not thread-safe and could memoize a 4xx endpoint incorrectly under concurrent startup load.

**Verdict**: NEEDS_CHANGES

---

## High-level view

The `guard_client` uses a module-level `_discovered_endpoint` cache to avoid re-probing all four candidate paths on every request. The logic that populates this cache treats any `status_code < 500` (including 4xx) as a valid endpoint to lock onto — a 400 or 404 response will permanently cache that endpoint for the process lifetime, skipping discovery of a better one.

The fail-open posture is intentional per the docstring, but the `unavailable` flag returned by the guard never causes the pipeline to fail. Step 2 in `main.py` appends `status="unavailable"` and continues — there is no rate-limiting, alerting, or circuit-breaker logic to signal sustained guard outages. A network-level attacker or misconfigured env will silently route every prompt to the LLM.

The `llm_client` system prompt carries the right security constraints, but the `context` parameter of `generate_response` defaults to `""` and is never supplied by `main.py`'s call site. The f-string that appends context to the user message never executes in production.

The step-6 audit at the end of the happy path records `label=0` unconditionally. A prompt that ML flagged at 0.5–0.7 confidence (`sent_to_review=True`) has no earlier row written; step 6 is the only write and it labels the prompt safe, poisoning the retraining dataset.

---

<details>
<summary>Issues (6)</summary>

1. **Fail-open with no observability** — `guard_result.unavailable` is appended as a step status but never counted, alerted, or circuit-broken. A guard outage is invisible to operators and silently allows all prompts through. Add a metric/log counter on `unavailable` results and consider a configurable hard-fail mode for high-sensitivity resources.

2. **4xx endpoint cached as working** — `_discovered_endpoint` is set on any `status_code < 500`, including 400/401/404. A permanently cached 400-returning endpoint will never be retried, and a real working endpoint later in `_CANDIDATE_ENDPOINTS` will never be reached. Gate the cache write on `2xx` status codes only (or at minimum exclude 404).

3. **Flagged-range prompts mislabelled safe** — When ML confidence is 0.5–0.7, `sent_to_review=True` but no `Prompt` row is written at that point. Step 6 then writes one row with `label=0` and `source="chat-review"`. The review queue receives a prompt marked safe, contradicting the flagging, and any retraining run that ingests these rows will be trained on mislabelled data. The step-6 write should use `label=1` when `sent_to_review` is True.

4. **`context` parameter is dead code** — `main.py` calls `await llm_generate(text, resource)` with no `context` argument. The f-string branch in `llm_client.generate_response` that appends `\n\nContext: {context}` never executes. Either pass a meaningful context string from the backend (e.g., ML result metadata) or remove the parameter to avoid the misleading dead branch.

5. **`salary`/`payroll` keyword asymmetry** — Both keywords are in the backend blocklist and will be hard-blocked at step 1. The frontend `queryDatabase` for `Company` explicitly excludes salary/payroll queries from the employee directory path, implying these were expected to reach the database layer. Online behaviour is correct (hard-blocked), but the frontend guard clause implies a different design intent. Confirm the hard-block is deliberate for these keywords.

6. **`flagged`/`unavailable` rendered as `processing`** — `SecurityCheckVisualization` maps both `'flagged'` and `'unavailable'` to the same grey/pulse style as `'processing'`, so users cannot distinguish a suspicious-but-allowed prompt from one still in flight. Add distinct visual states for these two statuses.

</details>

---

<details>
<summary>Details</summary>

## Endpoint discovery cache and 4xx locking

The discovery loop in `check_prompt` walks `_CANDIDATE_ENDPOINTS` and sets `_discovered_endpoint = ep` on the first response with `status_code < 500`. This includes 400 Bad Request and 401 Unauthorized. If the guard API returns 401 on `/guard` (authentication rejected, misconfigured token), that endpoint is permanently cached and the `Authorization` header is sent to a path that will always reject it. The other candidates — `/check`, `/analyze`, `/v1/guard` — are never tried again for the process lifetime. The fix is to require a 2xx before caching, so a 4xx on one endpoint doesn't prevent discovery of another.

The module-level `_discovered_endpoint` is also a potential race under concurrent async execution at startup: two coroutines can both find `_discovered_endpoint is None`, both probe, and one overwrites the other's result. In practice the GIL and the sequential await makes this unlikely, but it's worth noting it isn't protected.

## Audit log label on flagged prompts

Step 3 in `main.py` handles the 0.5–0.7 ML confidence range by setting `sent_to_review = True` and appending a `flagged` step, then falling through to step 6. Step 6 writes:

```python
audit_source = "chat-review" if sent_to_review else "chat"
db.add(Prompt(text=text, resource=resource, label=0, risk="Low", source=audit_source))
```

`label=0` is hardcoded. A prompt the ML model considers suspicious (confidence ≥ 0.5) lands in the database as safe. Any downstream retraining pipeline that ingests `label=0` rows from `source="chat-review"` will be trained on mislabelled data. The label should be `1` when `sent_to_review` is True.

## Guard fail-open: silent pass-through

When `guard_result.unavailable` is True, the pipeline appends `status="unavailable"` and continues to the ML and LLM steps. This is intentional for availability, but there is no log aggregation or counter that distinguishes "guard checked and passed" from "guard was not reachable." An env misconfiguration (wrong `SECURE_GUARD_API_URL`) produces the same runtime behaviour as a passing guard check. A structured log entry at WARNING level with a distinct event key on every unavailable result would allow operators to catch this.

## `context` dead branch in llm_client

```python
async def generate_response(prompt: str, resource: str, context: str = "") -> str:
    user_content = f"{prompt}\n\nContext: {context}" if context else prompt
```

`main.py` calls `await llm_generate(text, resource)`. `context` is always `""`, so `user_content` is always `prompt`. The f-string branch is unreachable from the current call site. This is low-severity but leaves a confusing signature that suggests context injection is happening when it isn't.

## Frontend status rendering gap

`SecurityCheckVisualization` in `Chat.tsx` renders `'flagged'` and `'unavailable'` with the same grey/processing style it uses for `'processing'`. A flagged prompt (ML confidence 0.5–0.7) looks visually identical to a prompt still in flight — users see no distinction between "passed", "still checking", and "suspicious but allowed through". The status union in `types.ts` has the right values; the rendering switch just needs a branch for `'flagged'` and `'unavailable'`.

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `backend/guard_client.py` | New async SecureGuard client with candidate-endpoint discovery, retry logic, and fail-open behaviour |
| `backend/llm_client.py` | New async OpenAI client with resource-scoped system prompt and static fallback |
| `backend/main.py` | New async `/api/chat` route wiring keyword filter → guard → ML → LLM → audit log |
| `src/api.ts` | New `ChatResponse` interface and `chatWithPrismGuard` fetch function |
| `src/screens/Chat.tsx` | `handleSend` updated to call backend pipeline; offline fallback preserved in `catch` block |

