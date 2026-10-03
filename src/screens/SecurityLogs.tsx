import { useState } from 'react';
import {
  Search,
  ShieldX,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowLeft,
  X,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { securityLogs } from '@/data';
import type { SecurityLog } from '@/types';

export function SecurityLogs() {
  const [filter, setFilter] = useState<'All' | 'Allowed' | 'Blocked' | 'Suspicious' | 'Critical'>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SecurityLog | null>(null);

  const filtered = securityLogs.filter((log) => {
    if (filter !== 'All' && log.category !== filter) return false;
    if (search && !log.title.toLowerCase().includes(search.toLowerCase()) && !log.detail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters = ['All', 'Allowed', 'Blocked', 'Suspicious', 'Critical'] as const;

  const categoryConfig = {
    Critical: { icon: AlertCircle, color: 'text-danger-500', bg: 'bg-danger-50', border: 'border-danger-100' },
    Blocked: { icon: ShieldX, color: 'text-danger-500', bg: 'bg-danger-50', border: 'border-danger-100' },
    Allowed: { icon: ShieldCheck, color: 'text-success-500', bg: 'bg-success-50', border: 'border-success-100' },
    Suspicious: { icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-50', border: 'border-warning-100' },
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-700">Security Activity</h1>
        <p className="mt-1 text-sm text-ink-400">Complete log of all security events across connected resources.</p>
      </div>

      {/* Filters and search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-ink-300" />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                filter === f ? 'bg-peacock-600 text-white' : 'bg-white text-ink-400 border border-ink-100 hover:text-peacock-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm text-ink-700 placeholder:text-ink-300 focus:border-peacock-300 focus:outline-none focus:shadow-glow sm:w-64"
          />
        </div>
      </div>

      {/* Log list */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-ink-100 bg-white py-20 shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50">
            <ShieldCheck className="h-8 w-8 text-ink-300" />
          </div>
          <p className="mt-4 text-lg font-semibold text-ink-700">No logs found</p>
          <p className="mt-1 text-sm text-ink-400">No security events match your current filters.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          <div className="divide-y divide-ink-100">
            {filtered.map((log) => {
              const config = categoryConfig[log.category];
              return (
                <button
                  key={log.id}
                  onClick={() => setSelected(log)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-ink-50/50"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                    <config.icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-700">{log.title}</p>
                    <p className="truncate text-xs text-ink-400">{log.detail}</p>
                  </div>
                  <div className="hidden items-center gap-3 sm:flex">
                    <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">{log.resource}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color} ${config.border}`}>
                      {log.risk}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-300">
                      <Clock className="h-3 w-3" /> {log.time}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="mx-4 w-full max-w-lg animate-scale-in rounded-2xl border border-ink-100 bg-white p-6 shadow-card-hover" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${categoryConfig[selected.category].bg}`}>
                  {(() => {
                    const Icon = categoryConfig[selected.category].icon;
                    return <Icon className={`h-5 w-5 ${categoryConfig[selected.category].color}`} />;
                  })()}
                </div>
                <h3 className="text-base font-semibold text-ink-700">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: 'Resource', value: selected.resource },
                { label: 'Detail', value: selected.detail },
                { label: 'Risk Level', value: selected.risk },
                { label: 'Category', value: selected.category },
                { label: 'Timestamp', value: selected.time },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-ink-100 pb-2.5">
                  <span className="text-sm text-ink-400">{item.label}</span>
                  <span className="text-sm font-medium text-ink-600">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-ink-50 p-3">
              <p className="text-xs text-ink-400">
                This event was logged by PrismGuard's security layer. Events are retained for audit purposes
                and may be used for model training if classified by an administrator.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
