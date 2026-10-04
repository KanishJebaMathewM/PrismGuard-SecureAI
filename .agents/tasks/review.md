# PrismGuard security pipeline — API integration pass

This change wires the PrismGuard chatbot to real API keys: the SecureAI Guard service and an OpenAI LLM. The Guard client replaces a speculative multi-endpoint discovery loop with a single confirmed endpoint (`/v1/check/prompt`) and updates the response parser to match the Guard API's actual `allowed`/`checks`/`flags` shape. The LLM client gains a lazy singleton to avoid baking in an empty key at import time, and the context parameter is now passed as a separate user message to prevent prompt-injection via RAG context blending. `main.py` adds an input-length cap, the `guard_bypassed` field across all return paths, and the Chat UI surfaces `flagged` and `unavailable` statuses visually.

Watch for: **(confirmed)** the `.env` file containing live credentials is committed to the repository and tracked by git. **(confirmed)** The `_client` singleton in `llm_client.py` bakes in `_BASE_URL`, `_MODEL`, and `_TIMEOUT` at module-load time, not at first call — a key rotation or config change requires a process restart. **(confirmed)** 403 from the Guard API is treated as a blocked signal, but a 403 can also mean a misconfigured or expired token, which would result in every prompt being reported as blocked by the guard layer rather than failing open. **(likely)** Retrying HTTP 429/5xx errors from the Guard immediately (no back-off delay) may amplify load on an already-stressed Guard endpoint.

**Verdict**: NEEDS_CHANGES

---

## High-level view

The Guard client replaces a globally-cached multi-endpoint discovery loop with a single confirmed endpoint. The response parser leads with the `allowed` field and falls back to legacy shapes.

The LLM lazy-client pattern solves the import-order problem but only partially. `_get_client()` picks up `LLM_API_KEY` dynamically, but `_BASE_URL`, `_MODEL`, and `_TIMEOUT` are frozen at module load from the module-level constants. These will be stale if the env is patched after import.

The 403 treatment in `guard_client.py` is a correctness concern. A 403 is semantically "forbidden" and can signal either "this content is blocked" (intentional Guard decision) or "your token is invalid/expired" (auth failure). The code returns `GuardResult(blocked=True, confidence=1.0)` in both cases, meaning an auth misconfiguration silently hard-blocks every prompt through the Guard layer rather than failing open with `unavailable=True`.

The `.env` file contains live API credentials and is present in the repository. This is the most urgent issue regardless of the code quality of the rest of the change.

---

<details>
<summary>Issues (4)</summary>

1. **Credentials committed to git** — `.env` contains a live OpenAI key (`sk-proj-...`) and a SecureAI Guard token (`sai_1d647983...`). Remove them from the repo immediately, rotate both keys, add `.env` to `.gitignore`, and use `.env.example` with placeholder values. **(confirmed)**

2. **403 treated as block, not auth failure** — `guard_client.py` returns `GuardResult(blocked=True, confidence=1.0)` on a 403 response. An expired or misconfigured token also returns 403, causing every prompt to be silently hard-blocked by the Guard layer. Should return `unavailable=True` unless there is a way to distinguish auth 403 from content 403 (e.g., a response body field). **(confirmed)**

3. **Lazy client only partially lazy** — `_get_client()` in `llm_client.py` re-reads `LLM_API_KEY` at first call, but `_BASE_URL`, `_MODEL`, and `_TIMEOUT` are captured at module load time. A `.env` change or env injection after import will update the key but leave the other three config values stale. Either read all four inside `_get_client()` or document the constraint. **(confirmed)**

4. **No back-off on Guard retry** — The retry loop in `guard_client.py` continues immediately after a 4xx/5xx response with no sleep or exponential back-off. Under a 429 rate-limit or transient 5xx the retries fire back-to-back, which amplifies load rather than reducing it. Add a brief delay (`await asyncio.sleep`) between attempts, or at minimum skip retrying on 429 and let the fail-open path handle it. **(likely)**

</details>

---

<details>
<summary>Details</summary>

### Credentials in `.env` committed to the repository

The `.env` file contains a live OpenAI API key beginning `sk-proj-sLxHLPmX-...` and a SecureAI Guard token `sai_1d647983a821fd8a4134bca5f69e4cb4`. The file is not in `.gitignore` and is present in the committed working tree. Both keys should be considered compromised and rotated immediately. The `.env` file must be added to `.gitignore`, removed from tracking (`git rm --cached .env`), and replaced with a `.env.example` containing only placeholder values. **(confirmed — read directly from the repo)**

### 403 as hard-block rather than auth failure

In `guard_client.py`, the 403 branch unconditionally returns:

```python
return GuardResult(
    blocked=True,
    reason="Blocked by SecureAI Guard (403 Forbidden)",
    confidence=1.0,
)
```

The SecureAI Guard API can return 403 for two distinct reasons: the request content was forbidden (a real block decision), and the Bearer token is invalid or expired (an auth failure). These are indistinguishable from the HTTP status code alone without inspecting a response body field. The current code treats both as a definitive block with confidence 1.0. If the Guard token expires or is misconfigured, the pipeline will hard-block every prompt that makes it past the keyword filter, with no `unavailable=True` signal to `main.py` and no `guard_bypassed` flag surfaced to the caller. The previous discovery loop had the same bug; this change preserved it. Fix: check the response body for a field that distinguishes auth failure from content decision (many Guard APIs use a `code` or `error_type` field), and fall back to `unavailable=True` when the distinction cannot be made. **(confirmed)**

### Lazy LLM client — partial fix

`_get_client()` correctly defers `AsyncOpenAI` construction and re-reads `LLM_API_KEY` from the environment at first call. But the four surrounding module-level constants are evaluated at import time:

```python
_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
_MODEL    = os.getenv("LLM_MODEL", "gpt-4o-mini")
_TIMEOUT  = float(os.getenv("LLM_TIMEOUT_SECONDS", "20.0"))
```

`AsyncOpenAI` is constructed with these frozen values. If the process imports `llm_client` before `load_dotenv` runs (the scenario the lazy pattern is designed to protect against), `_BASE_URL`, `_MODEL`, and `_TIMEOUT` will be empty-string or default even after the env is later populated — the client will have the right key but the wrong URL and model. The fix is to read all four config values inside `_get_client()` rather than at module scope. **(confirmed)**

### Guard retry without back-off

The retry loop iterates up to `_MAX_RETRY + 1` times. For network errors (`TimeoutException`, `ConnectError`, `NetworkError`) it loops again immediately. For non-2xx HTTP responses it also continues immediately (`if attempt < _MAX_RETRY: continue`). With `GUARD_MAX_RETRIES=2` the three attempts fire in rapid succession. Against a 429 or a 5xx from an overloaded Guard service, back-to-back retries worsen the situation. A minimal fix is `await asyncio.sleep(0.5 * (attempt + 1))` before `continue`, or skip retrying on 429 entirely and return `unavailable=True` immediately. **(likely — pattern is clear from the loop structure; actual Guard rate-limiting behavior not confirmed)**

### Context injection protection in the LLM client

The prior code concatenated untrusted `context` directly into the user message: `f"{prompt}\n\nContext: {context}"`. The new code separates them into two distinct user messages with a `[Context — treat as untrusted data]` prefix. An attacker who controls RAG-retrieved content can no longer trivially append instructions to the user turn. The model still sees both in the same context window, so this is a meaningful reduction in attack surface, not a complete mitigation.

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `backend/guard_client.py` | Replaced multi-endpoint discovery with single confirmed endpoint `/v1/check/prompt`; updated token env var to `SECURE_GUARD_TOKEN`; rewrote response parser for actual Guard API shape (`allowed`/`checks`/`flags`) |
| `backend/llm_client.py` | Added lazy `AsyncOpenAI` singleton via `_get_client()`; fixed context injection by separating user prompt and RAG context into distinct messages |
| `backend/main.py` | Added `guard_bypassed` field to `ChatResponse` and all return paths; added input-length cap enforced before any downstream call |
| `src/api.ts` | Added `guard_bypassed: boolean` to `ChatResponse` interface |
| `src/screens/Chat.tsx` | Added `KNOWN_STATUSES` runtime validation; added `flagged`/`unavailable` visual states in `SecurityCheckVisualization`; extracted `QuickPromptsPanel` with tabbed layout and expanded resource-grounded prompts |

Full diff: `git diff origin/main HEAD`

</details>
