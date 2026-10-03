import { useState } from 'react';
import {
  Shield,
  Database,
  Code,
  Bell,
  Users,
  Eye,
  Plus,
  KeyRound,
  Trash2,
  Clock,
} from 'lucide-react';

export function Settings() {
  const [keywordFilters, setKeywordFilters] = useState(true);
  const [injectionDetection, setInjectionDetection] = useState(true);
  const [jailbreakDetection, setJailbreakDetection] = useState(true);
  const [promptLengthLimit, setPromptLengthLimit] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [trainingNotifications, setTrainingNotifications] = useState(false);

  const adminUsers = [
    { name: 'Admin', email: 'admin@prismguard.security', role: 'Security Admin', initials: 'AM' },
    { name: 'Sarah Chen', email: 'sarah.chen@prismguard.security', role: 'Security Analyst', initials: 'SC' },
    { name: 'Marcus Reid', email: 'marcus.reid@prismguard.security', role: 'AI Engineer', initials: 'MR' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-700">Settings</h1>
        <p className="mt-1 text-sm text-ink-400">Configure PrismGuard security rules, resource access, and platform settings.</p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Security Rules */}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Shield className="h-4 w-4 text-peacock-600" /> Security Rules
          </h3>
          <div className="mt-4 space-y-1">
            <ToggleRow label="Keyword filters" desc="Enable sensitive keyword detection at the first security layer" value={keywordFilters} onChange={setKeywordFilters} />
            <ToggleRow label="Prompt length limits" desc="Reject prompts exceeding the maximum allowed length" value={promptLengthLimit} onChange={setPromptLengthLimit} />
            <ToggleRow label="Injection detection" desc="Detect prompt injection attempts using pattern and semantic analysis" value={injectionDetection} onChange={setInjectionDetection} />
            <ToggleRow label="Jailbreak detection" desc="Identify jailbreak and safety bypass attempts" value={jailbreakDetection} onChange={setJailbreakDetection} />
          </div>
        </section>

        {/* Resource Access */}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Database className="h-4 w-4 text-peacock-600" /> Resource Access
          </h3>
          <div className="mt-4 space-y-2">
            {['Banking Systems', 'Government Database', 'Company Database', 'Research Resources'].map((r) => (
              <div key={r} className="flex items-center justify-between rounded-lg border border-ink-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-peacock-50">
                    <Database className="h-4 w-4 text-peacock-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-600">{r}</p>
                    <p className="text-xs text-success-500">Connected & active</p>
                  </div>
                </div>
                <button className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-50">
                  Manage
                </button>
              </div>
            ))}
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 py-3 text-sm font-medium text-ink-400 transition-all hover:border-peacock-300 hover:bg-peacock-50/50 hover:text-peacock-600">
              <Plus className="h-4 w-4" /> Connect New Resource
            </button>
          </div>
        </section>

        {/* API Configuration */}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Code className="h-4 w-4 text-peacock-600" /> API Configuration
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="API endpoint" value="https://api.prismguard.security/v1" icon={Code} />
            <Field label="API key" value="pg_••••••••••••••••3f9a" icon={KeyRound} />
            <Field label="Request timeout" value="30 seconds" icon={Clock} />
            <Field label="Max prompts per minute" value="100" icon={Eye} />
          </div>
          <button className="mt-4 rounded-lg bg-peacock-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-peacock-700">
            Save Configuration
          </button>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Bell className="h-4 w-4 text-peacock-600" /> Notifications
          </h3>
          <div className="mt-4 space-y-1">
            <ToggleRow label="Email alerts" desc="Receive security alerts via email" value={emailAlerts} onChange={setEmailAlerts} />
            <ToggleRow label="Critical incident alerts" desc="Immediate notification for critical security events" value={criticalAlerts} onChange={setCriticalAlerts} />
            <ToggleRow label="Training notifications" desc="Notify when model training completes" value={trainingNotifications} onChange={setTrainingNotifications} />
          </div>
        </section>

        {/* Admin Users */}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <Users className="h-4 w-4 text-peacock-600" /> Admin Users
            </h3>
            <button className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-50">
              <Plus className="h-3.5 w-3.5" /> Add User
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {adminUsers.map((user) => (
              <div key={user.email} className="flex items-center justify-between rounded-lg border border-ink-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-peacock-500 to-peacock-700 text-xs font-semibold text-white">
                    {user.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-600">{user.name}</p>
                    <p className="text-xs text-ink-300">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-peacock-50 px-2 py-0.5 text-xs font-medium text-peacock-600">{user.role}</span>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-danger-50 hover:text-danger-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-ink-600">{label}</p>
        <p className="text-xs text-ink-400">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-peacock-600' : 'bg-ink-200'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Code }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-ink-300">{label}</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50/30 px-3 py-2.5">
        <Icon className="h-4 w-4 text-ink-300" />
        <span className="font-mono text-sm text-ink-600">{value}</span>
      </div>
    </div>
  );
}


