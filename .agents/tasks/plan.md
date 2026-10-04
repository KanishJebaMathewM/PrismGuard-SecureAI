# Implementation Plan — PrismGuard SQLite Backend

## Design Decisions

**CommonJS for server, ESM for frontend.** The root `package.json` is `"type":"module"`. A separate `server/package.json` with `"type":"commonjs"` isolates the Node.js backend so `require()` and `better-sqlite3` (a native addon) work without transpilation.

**better-sqlite3 over sql.js.** better-sqlite3 is synchronous, has no async overhead, and is the de-facto standard for Node.js SQLite. The tradeoff is a native build step (`npm install` in `server/`); this is worth it for the simpler, callback-free route handlers.

**Data.ts kept as fallback.** All 9 screens get a try/catch around their API calls; on failure they fall back to the existing static imports. This means the app never shows a blank screen if the server is down.

**Deterministic security pipeline — no ML.** A keyword/pattern matching engine in `server/services/securityPipeline.js` covers the 6 attack types. It returns `{ status, riskLevel, attackType, blockedLayer, reason, pipelineAnalysis }`. This is clearly a demo engine; the architecture is designed so an ML model can replace it later.

**PORT handling.** `.env` currently has `PORT=8000` (used by a Python backend). The Node.js server uses `SERVER_PORT` from `.env` (not set, so defaults to 3001). This avoids conflict.

**Training simulation.** `POST /api/training/retrain` uses `setInterval` inside the route to advance the job through Queued → Preparing Dataset → Training → Validation → Completed, writing each state to SQLite. The frontend polls GET `/api/training` every second while a job is active.

---

## File List

### New files
| Path | Purpose |
|---|---|
| `server/package.json` | CommonJS server package, better-sqlite3 + express deps |
| `server/index.js` | Express app, route mounting, startup |
| `server/database/schema.sql` | 11-table DDL |
| `server/database/seed.sql` | Full demo data INSERT statements |
| `server/database/database.js` | better-sqlite3 singleton + auto-init |
| `server/services/securityPipeline.js` | Deterministic 4-layer attack engine |
| `server/routes/dashboard.js` | GET /api/dashboard/stats |
| `server/routes/resources.js` | GET /api/resources, GET /api/resources/:id |
| `server/routes/prompts.js` | GET /api/prompts, POST /api/prompts |
| `server/routes/models.js` | GET /api/models, GET /api/models/:id, PATCH /api/models/:id/version |
| `server/routes/research.js` | GET /api/research, GET /api/research/:id |
| `server/routes/admin.js` | GET /api/admin/reviews, POST /api/admin/reviews/:id/classify |
| `server/routes/training.js` | GET /api/training, GET /api/training/models, POST /api/training/retrain |
| `server/routes/attackLab.js` | GET /api/attack-lab/tests, POST /api/attack-lab/test |
| `server/routes/securityLogs.js` | GET /api/security-logs |
| `src/lib/api.ts` | Typed fetch wrappers for all endpoints |
| `README.md` | Setup docs |

### Modified files
| Path | Change |
|---|---|
| `package.json` | Remove @supabase/supabase-js; add dev scripts |
| `vite.config.ts` | Add `/api` proxy to :3001 |
| `.gitignore` | Add server/database/prismguard.db, server/node_modules/ |
| `src/screens/Dashboard.tsx` | Fetch from API, fallback to data.ts |
| `src/screens/Chat.tsx` | POST /api/prompts, map result to ChatMessage |
| `src/screens/Resources.tsx` | Fetch resources + detail from API |
| `src/screens/Models.tsx` | Fetch models, wire retrain to API |
| `src/screens/AdminReview.tsx` | Fetch reviews, classify via API |
| `src/screens/Training.tsx` | Fetch jobs + models from API |
| `src/screens/SecurityLogs.tsx` | Fetch logs from API |
| `src/screens/AttackLab.tsx` | Fetch attack tests + run via API |
| `src/screens/Research.tsx` | Fetch topics from API |

### Unchanged files
`src/data.ts`, `src/types.ts`, `src/App.tsx`, `src/components/*`, `index.html`, `tsconfig*.json`, `tailwind.config.js`, `eslint.config.js`

---

## Implementation Order (dependency-ordered)

- [ ] 1. **server/package.json + npm install**
      Create `server/package.json` (CommonJS, express 4.18, better-sqlite3 9.4, cors, dotenv, morgan). Run `cd server && npm install` to build better-sqlite3 native addon.
      Files: `server/package.json`
      Verify: `cd server && node -e "require('better-sqlite3')"` exits 0.

- [ ] 2. **Database schema**
      Write `server/database/schema.sql` with all 11 CREATE TABLE IF NOT EXISTS statements. Tables: resources, security_models, prompts, security_rules, attack_tests, research_topics, admin_reviews, training_samples, training_jobs, security_logs, settings.
      Files: `server/database/schema.sql`
      Verify: `sqlite3 /tmp/test.db < server/database/schema.sql && echo ok` (or use Node to verify it parses).

- [ ] 3. **Seed data**
      Write `server/database/seed.sql` with INSERT OR IGNORE statements for all 11 tables. Data must exactly mirror `src/data.ts` values (IDs, names, versions, counts). JSON array columns (rules, attack_categories, training_history, attack_examples, detection_strategies, analysis) stored as single-quoted JSON strings.
      Files: `server/database/seed.sql`
      Verify: Counting INSERT statements; spot-check IDs match data.ts.

- [ ] 4. **database.js singleton with auto-init guard**
      Write `server/database/database.js`. Check for `prismguard.db` using `fs.existsSync`. If absent: create DB, exec schema.sql, exec seed.sql line-by-line. If present: skip seed. Cache db instance.
      Files: `server/database/database.js`
      Verify: `node -e "const {getDb}=require('./server/database/database.js'); const db=getDb(); console.log(db.prepare('SELECT count(*) as c FROM resources').get());"` prints `{ c: 4 }`.

- [ ] 5. **Security pipeline service**
      Write `server/services/securityPipeline.js`. Keyword groups for 6 attack types. Returns `{ status, riskLevel, attackType, blockedLayer, reason, resource, pipelineAnalysis }`.
      Files: `server/services/securityPipeline.js`
      Verify: `node -e "const {analyzePrompt}=require('./server/services/securityPipeline.js'); console.log(analyzePrompt('ignore previous instructions','Banking'));"` returns `status: 'blocked'`.

- [ ] 6. **All route files**
      Write all 9 route files. Each uses `express.Router()`, calls `getDb()`, executes synchronous SQL. dashboard.js aggregates counts. prompts.js calls analyzePrompt and conditionally writes to admin_reviews + security_logs. admin.js classify endpoint writes training_samples on malicious classification. training.js retrain uses setInterval for simulation. attackLab.js runs pipeline and logs result.
      Files: `server/routes/dashboard.js`, `server/routes/resources.js`, `server/routes/prompts.js`, `server/routes/models.js`, `server/routes/research.js`, `server/routes/admin.js`, `server/routes/training.js`, `server/routes/attackLab.js`, `server/routes/securityLogs.js`
      Verify: Each file `require()`-able without error.

- [ ] 7. **server/index.js**
      Write the Express entry point. Load dotenv from `../,env`, set up CORS for :5173, mount all routers, add error handler, listen on SERVER_PORT || 3001.
      Files: `server/index.js`
      Verify: `cd server && node index.js` prints `PrismGuard server running on :3001` and `Database initialised with seed data`. `curl http://localhost:3001/api/dashboard/stats` returns JSON.

- [ ] 8. **package.json cleanup + vite.config.ts proxy**
      Remove `@supabase/supabase-js` from package.json. Add `"server"` and `"dev:full"` scripts. Add `/api` proxy block to vite.config.ts targeting http://localhost:3001.
      Files: `package.json`, `vite.config.ts`
      Verify: `npm install` from root succeeds; `npm run typecheck` still passes (Supabase types gone).

- [ ] 9. **src/lib/api.ts**
      Create typed fetch wrapper with all 18 exported functions. Map snake_case server responses to camelCase types matching `src/types.ts`. Add `DashboardStats` and `PromptResult` inline types. Capitalise status values from server (allowed→Allowed) for `PromptActivity.status`.
      Files: `src/lib/api.ts`
      Verify: `npm run typecheck` passes with 0 errors.

- [ ] 10. **Update Dashboard.tsx**
      Replace static imports with API calls. Fetch `dashboardStats` and `resources` in parallel. Wire KPI values to stats. Wire recentActivity table to stats.recentActivity. Keep all JSX/className identical. Add error fallback to data.ts.
      Files: `src/screens/Dashboard.tsx`
      Verify: `npm run typecheck` passes; browser Dashboard shows DB values.

- [ ] 11. **Update Chat.tsx**
      Replace client-side `isBlocked` logic with `sendPrompt()` API call. Map `PromptResult` to `ChatMessage`. Keep `detectResource`, quick prompts, and all UI JSX unchanged. On error, fall back to client-side pipeline.
      Files: `src/screens/Chat.tsx`
      Verify: `npm run typecheck` passes; blocked prompt stored in DB.

- [ ] 12. **Update remaining 7 screens**
      Resources.tsx, Models.tsx, AdminReview.tsx, Training.tsx, SecurityLogs.tsx, AttackLab.tsx, Research.tsx — each: remove data.ts import, add api.ts import, replace useState(staticData) with useState([]) + useEffect fetch, add try/catch fallback to data.ts. No JSX changes.
      Files: all 7 screen files
      Verify: `npm run typecheck` passes; each screen loads from DB in browser.

- [ ] 13. **Update .gitignore + write README.md**
      Add `server/database/prismguard.db` and `server/node_modules/` to .gitignore. Write README.md with setup steps, architecture diagram, API endpoint list.
      Files: `.gitignore`, `README.md`
      Verify: `git status` does not show prismguard.db as tracked.

- [ ] 14. **Git commit**
      Stage all new/modified files. Set author email to `kanishjebamathew.m@gmail.com`. Commit with multi-line message summarising all changes.
      Files: (all changed files via git add)
      Verify: `git log --oneline -1` shows commit; `git show --stat HEAD` lists all expected files.

---

## Database Schema (11 tables)

```sql
-- resources
CREATE TABLE IF NOT EXISTS resources (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  connected     INTEGER DEFAULT 1,
  model         TEXT,
  model_version TEXT,
  last_sync     TEXT,
  requests_today INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  api_status    TEXT DEFAULT 'Operational',
  icon          TEXT,
  rules         TEXT  -- JSON array string
);

-- security_models
CREATE TABLE IF NOT EXISTS security_models (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  version            TEXT NOT NULL,
  status             TEXT DEFAULT 'Active',
  resource           TEXT,
  training_samples   INTEGER DEFAULT 0,
  detection_accuracy REAL DEFAULT 90.0,
  last_trained       TEXT,
  attacks_detected   INTEGER DEFAULT 0,
  training_history   TEXT,  -- JSON array string
  attack_categories  TEXT,  -- JSON array string
  progress           INTEGER DEFAULT 0
);

-- prompts
CREATE TABLE IF NOT EXISTS prompts (
  id              TEXT PRIMARY KEY,
  prompt          TEXT NOT NULL,
  resource        TEXT,
  status          TEXT DEFAULT 'allowed',
  risk            TEXT DEFAULT 'Low',
  time            TEXT,
  detection_layer TEXT,
  attack_type     TEXT,
  blocked_reason  TEXT,
  created_at      INTEGER DEFAULT (strftime('%s','now'))
);

-- security_rules
CREATE TABLE IF NOT EXISTS security_rules (
  id          TEXT PRIMARY KEY,
  resource_id TEXT REFERENCES resources(id),
  rule        TEXT NOT NULL,
  active      INTEGER DEFAULT 1
);

-- attack_tests
CREATE TABLE IF NOT EXISTS attack_tests (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  severity    TEXT,
  icon        TEXT
);

-- research_topics
CREATE TABLE IF NOT EXISTS research_topics (
  id                   TEXT PRIMARY KEY,
  title                TEXT NOT NULL,
  description          TEXT,
  severity             TEXT,
  related_resource     TEXT,
  attack_examples      TEXT,  -- JSON array string
  detection_strategies TEXT   -- JSON array string
);

-- admin_reviews
CREATE TABLE IF NOT EXISTS admin_reviews (
  id              TEXT PRIMARY KEY,
  prompt_id       TEXT REFERENCES prompts(id),
  prompt          TEXT NOT NULL,
  resource        TEXT,
  detection_layer TEXT,
  risk            TEXT,
  submitted       TEXT,
  status          TEXT DEFAULT 'Pending Review',
  analysis        TEXT,  -- JSON array string
  notes           TEXT,
  classification  TEXT,
  category        TEXT
);

-- training_samples
CREATE TABLE IF NOT EXISTS training_samples (
  id               TEXT PRIMARY KEY,
  prompt           TEXT NOT NULL,
  resource         TEXT,
  attack_type      TEXT,
  classification   TEXT,
  source_review_id TEXT,
  created_at       INTEGER DEFAULT (strftime('%s','now'))
);

-- training_jobs
CREATE TABLE IF NOT EXISTS training_jobs (
  id           TEXT PRIMARY KEY,
  model_id     TEXT REFERENCES security_models(id),
  model_name   TEXT,
  resource     TEXT,
  status       TEXT DEFAULT 'Queued',
  progress     INTEGER DEFAULT 0,
  dataset      TEXT,
  dataset_size INTEGER DEFAULT 0,
  started_at   INTEGER,
  completed_at INTEGER,
  created_at   INTEGER DEFAULT (strftime('%s','now'))
);

-- security_logs
CREATE TABLE IF NOT EXISTS security_logs (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  resource   TEXT,
  detail     TEXT,
  risk       TEXT,
  time       TEXT,
  category   TEXT,
  prompt_id  TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

-- settings
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
```

---

## Security Pipeline Logic

```
analyzePrompt(promptText, resource) → PipelineResult

KEYWORD GROUPS (all checked toLowerCase):
  INJECTION:   'ignore previous', 'ignore all instructions', 'system prompt',
               'override instructions', 'new instructions'
  JAILBREAK:   'developer mode', 'jailbreak', 'no restrictions',
               'pretend you are', 'act as if', 'unrestricted'
  OVERRIDE:    '[system]', 'admin has updated', 'new directive',
               'override safety', 'configuration update'
  EXTRACTION:  'export all', 'list all customer', 'reveal all',
               'dump database', 'show raw database', 'tabular format'
  SENSITIVE:   'reveal customer', 'reveal sensitive', 'all passwords',
               'all credentials', 'all account numbers'
  ROLE_MANIP:  'you are now an admin', 'grant me access', 'switch to root',
               'act as administrator', 'full system access'

LAYER EVALUATION (first match wins):
  Layer 1 — Keyword Filter:  INJECTION hit  → blocked, Critical, 'Prompt Injection'
  Layer 1 — Keyword Filter:  JAILBREAK hit  → blocked, High,     'Jailbreak'
  Layer 2 — Secure AI API:   OVERRIDE hit   → blocked, High,     'Instruction Override'
  Layer 3 — PrismGuard:      EXTRACTION hit → blocked, Critical, 'Data Extraction'
  Layer 3 — PrismGuard:      SENSITIVE hit  → blocked, Critical, 'Sensitive Information Request'
  Layer 4 — Resource Model:  ROLE_MANIP hit → review,  High,     'Role Manipulation'
  No match                                  → allowed, Low,      null

pipelineAnalysis array (4 items):
  Each layer before the blocked layer: { layer, result: 'PASSED' }
  Blocked layer: { layer, result: 'BLOCKED' }
  Layers after blocked layer: { layer, result: 'BYPASSED' }
  For 'review' status: flagged layer gets 'SUSPICIOUS', all others 'PASSED'
```

---

## API Routes Summary

| Method | Path | SQL / Logic | Response shape |
|---|---|---|---|
| GET | /api/dashboard/stats | COUNT prompts; COUNT by status; COUNT resources WHERE connected=1; SELECT 8 recent prompts | DashboardStats |
| GET | /api/resources | SELECT * FROM resources | Resource[] |
| GET | /api/resources/:id | SELECT resource + rules + 5 recent prompts | Resource & { recentPrompts } |
| GET | /api/prompts | SELECT * ORDER BY created_at DESC LIMIT 50 | PromptActivity[] |
| POST | /api/prompts | analyzePrompt → INSERT prompts [+ admin_reviews/logs] | PromptResult |
| GET | /api/models | SELECT * FROM security_models | SecurityModel[] |
| GET | /api/models/:id | SELECT by id | SecurityModel |
| PATCH | /api/models/:id/version | Bump minor version, set last_trained | SecurityModel |
| GET | /api/research | SELECT * FROM research_topics | ResearchTopic[] |
| GET | /api/research/:id | SELECT by id | ResearchTopic |
| GET | /api/admin/reviews | SELECT * ORDER BY rowid DESC | ReviewItem[] |
| POST | /api/admin/reviews/:id/classify | UPDATE status; if malicious → INSERT training_samples + security_logs | ReviewItem |
| GET | /api/training | SELECT * FROM training_jobs ORDER BY created_at DESC | TrainingJob[] |
| GET | /api/training/models | SELECT * FROM security_models | SecurityModel[] |
| POST | /api/training/retrain | INSERT job; simulate progress via setInterval; bump model version | { jobId, modelId } |
| GET | /api/security-logs | SELECT * ORDER BY created_at DESC LIMIT 100 | SecurityLog[] |
| GET | /api/attack-lab/tests | SELECT * FROM attack_tests | AttackTest[] |
| POST | /api/attack-lab/test | analyzePrompt → INSERT prompts + security_logs | PromptResult |

---

## api.ts Wrapper Design

```typescript
// src/lib/api.ts
// All functions: async, fetch, throw on !ok, return .json()
// Base: import.meta.env.VITE_API_BASE ?? '/api'  (proxy handles in dev; same origin in prod)

export type DashboardStats = { totalPrompts: number; allowed: number; blocked: number; connectedResources: number; recentActivity: PromptActivity[] }
export type PromptResult = { id: string; status: 'allowed'|'blocked'|'review'; riskLevel: RiskLevel; attackType?: string; blockedLayer?: string; reason?: string; resource: ResourceType; pipelineAnalysis: { layer: string; result: string }[] }

// Mapper: server returns status lowercase ('allowed','blocked','review')
// api.ts maps to PromptActivity.status ('Allowed','Blocked','Review')
function capitalise(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1) }

export async function fetchDashboardStats(): Promise<DashboardStats> { ... }
// ... (18 total functions as listed in FEAT-002 Step 3)
```

---

## Screen-by-Screen Changes

### Dashboard.tsx
- **Remove**: `import { resources, recentActivity } from '@/data'`
- **Add**: `import { fetchDashboardStats, fetchResources } from '@/lib/api'`
- **State**: add `stats: DashboardStats | null`, `resourceList: Resource[]`
- **useEffect**: `Promise.all([fetchDashboardStats(), fetchResources()])` with try/catch fallback to data.ts
- **KPIs**: bind `stats.totalPrompts`, `stats.allowed`, `stats.blocked`, `stats.connectedResources`
- **Recent activity**: bind `stats.recentActivity`
- **Resources grid**: bind `resourceList`
- **JSX**: zero changes

### Chat.tsx
- **Remove**: client-side `blockedKeywords`, `isBlocked()` function usage in handleSend
- **Add**: `import { sendPrompt } from '@/lib/api'`
- **handleSend**: call `sendPrompt(text, resourceType)`, map PromptResult to ChatMessage
- **Fallback**: if fetch throws, run existing isBlocked() logic (keep the function)
- **JSX**: zero changes

### Resources.tsx
- **Remove**: `import { resources } from '@/data'`
- **Add**: `import { fetchResources, fetchResource } from '@/lib/api'`
- **Resources**: useState([]) + useEffect fetch, fallback to data.ts `resources`
- **ResourceDetail**: useState(null) + useEffect fetch by resourceId, fallback to `resources.find`
- **JSX**: zero changes

### Models.tsx
- **Remove**: `import { models } from '@/data'`
- **Add**: `import { fetchModels, fetchModel, startRetrain } from '@/lib/api'`
- **Models**: fetch on mount
- **ModelDetail.startRetrain**: call API startRetrain(model.id), then poll GET /api/models/:id every 500ms, stop when status==='Active'
- **JSX**: zero changes

### AdminReview.tsx
- **Remove**: `import { reviewQueue } from '@/data'`
- **Add**: `import { fetchAdminReviews, classifyReview } from '@/lib/api'`
- **AdminReview**: useState([]) + useEffect fetch
- **quickClassify**: call classifyReview then re-fetch full list
- **PromptReview**: look up item from fetched list (pass via prop or re-fetch by id)
- **handleSubmit**: call classifyReview API
- **JSX**: zero changes

### Training.tsx
- **Remove**: `import { trainingJobs, models } from '@/data'`
- **Add**: `import { fetchTrainingJobs, fetchTrainingModels } from '@/lib/api'`
- **Both lists**: fetch on mount via Promise.all
- **JSX**: zero changes

### SecurityLogs.tsx
- **Remove**: `import { securityLogs } from '@/data'`
- **Add**: `import { fetchSecurityLogs } from '@/lib/api'`
- **Replace**: useState(securityLogs) → useState([]) + useEffect fetch
- **JSX**: zero changes

### AttackLab.tsx
- **Remove**: `import { attackTests } from '@/data'`
- **Add**: `import { fetchAttackTests, runAttackTest } from '@/lib/api'`
- **attackTests state**: fetch on mount, fallback to data.ts
- **runTest**: call runAttackTest API, map AnalysisResult from response
- **JSX**: zero changes

### Research.tsx
- **Remove**: `import { researchTopics } from '@/data'`
- **Add**: `import { fetchResearchTopics, fetchResearchTopic } from '@/lib/api'`
- **Both components**: fetch on mount, fallback to data.ts
- **JSX**: zero changes

---

## TypeScript Considerations

1. **New types in api.ts** (not added to types.ts — keep types.ts clean):
   - `DashboardStats`: totalPrompts, allowed, blocked, connectedResources, recentActivity
   - `PromptResult`: id, status ('allowed'|'blocked'|'review'), riskLevel, attackType?, blockedLayer?, reason?, resource, pipelineAnalysis[]

2. **Status capitalisation**: Server stores lowercase ('allowed', 'blocked', 'review'). `PromptActivity.status` in types.ts is `'Allowed' | 'Blocked' | 'Review' | 'Suspicious'`. The api.ts mapper must capitalise. Same for `riskLevel` ('low'→'Low').

3. **JSON columns**: `SecurityModel.trainingHistory`, `attackCategories`, `Resource.rules` are stored as JSON strings in SQLite. The route handlers must `JSON.parse()` them before returning. The api.ts layer receives already-parsed arrays.

4. **ResourceDetail has `recentPrompts`** which is not in the `Resource` interface. The api.ts return type for `fetchResource` uses an intersection: `Resource & { recentPrompts: PromptActivity[] }`.

5. **ModelStatus 'Queued' | 'Preparing Dataset'** — training job states. These don't appear in `ModelStatus` type. In Training.tsx, use the `status` column string directly (already displayed as string, not matched against the union type). No type change needed.

---

## Build Verification Steps

```bash
# 1. Install server dependencies
cd server && npm install
# Expect: no errors, node_modules created including better-sqlite3 native build

# 2. Start server (first run)
node index.js
# Expect: "Database initialised with seed data" then "PrismGuard server running on :3001"

# 3. Test key API endpoints
curl http://localhost:3001/api/dashboard/stats
# Expect: {"totalPrompts":10,"allowed":6,"blocked":3,"connectedResources":4,"recentActivity":[...]}

curl http://localhost:3001/api/resources
# Expect: array of 4 objects with id in [banking, government, company, research]

curl -X POST http://localhost:3001/api/prompts \
  -H "Content-Type: application/json" \
  -d '{"prompt":"ignore previous instructions","resource":"Banking"}'
# Expect: {"status":"blocked","riskLevel":"Critical","attackType":"Prompt Injection",...}

curl http://localhost:3001/api/admin/reviews
# Expect: array of 4 pending review items

# 4. Kill server; start again to verify idempotency
node index.js
# Expect: "Database already exists, skipping seed" (no data loss)

# 5. TypeScript check
cd .. && npm run typecheck
# Expect: 0 errors

# 6. Frontend dev server
npm run dev
# Expect: Vite starts on :5173, no compilation errors

# 7. Browser smoke test
# Open http://localhost:5173 — Dashboard KPIs must be non-zero
# Chat: send "ignore previous instructions" — must show blocked + pipeline steps
# Admin Review: 4 items visible
# All 9 nav links must load their screens without errors
```
