import { useState, useEffect } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  ShieldX,
  Database,
  ArrowRight,
  ArrowUpRight,
  FlaskConical,
  BookOpen,
  BrainCircuit,
  ShieldAlert,
  Shield,
  Activity,
} from 'lucide-react';
import { SecurityPipeline } from '@/components/SecurityPipeline';
import { ResourceIcon } from '@/components/ResourceIcon';
import { StatusBadge, RiskBadge, ConnectionBadge } from '@/components/Badges';
import { SkeletonCard, SkeletonRow } from '@/components/Skeletons';
import { resources, recentActivity } from '@/data';
import type { Screen, ResourceType } from '@/types';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  onSelectResource: (id: string) => void;
}

export function Dashboard({ onNavigate, onSelectResource }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<ResourceType>('Banking');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const kpis = [
    { label: 'Total Prompts', value: '1,284', sub: '+12.4% this week', icon: MessageSquare, color: 'text-peacock-600', bg: 'bg-peacock-50', trend: 'up' },
    { label: 'Allowed', value: '1,146', sub: '89.2% of prompts', icon: ShieldCheck, color: 'text-success-500', bg: 'bg-success-50', trend: 'up' },
    { label: 'Blocked', value: '138', sub: '10.8% blocked', icon: ShieldX, color: 'text-danger-500', bg: 'bg-danger-50', trend: 'down' },
    { label: 'Connected Resources', value: '4', sub: 'All systems operational', icon: Database, color: 'text-info-500', bg: 'bg-info-50', trend: 'up' },
  ];

  const quickActions = [
    { title: 'Attack Lab', desc: 'Test PrismGuard against prompt attacks', icon: FlaskConical, screen: 'attack-lab' as Screen, color: 'from-danger-50 to-white', iconColor: 'text-danger-500' },
    { title: 'Security Research', desc: 'Explore prompt hijacking techniques', icon: BookOpen, screen: 'research' as Screen, color: 'from-research-50 to-white', iconColor: 'text-research-500' },
    { title: 'Model Training', desc: 'Manage resource-specific security models', icon: BrainCircuit, screen: 'models' as Screen, color: 'from-peacock-50 to-white', iconColor: 'text-peacock-600' },
    { title: 'Admin Review', desc: 'Review suspicious prompts', icon: ShieldAlert, screen: 'admin-review' as Screen, color: 'from-warning-50 to-white', iconColor: 'text-warning-500' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-700">Good afternoon, Admin</h1>
          <p className="mt-1 text-sm text-ink-400">Monitor secure AI access across your connected resources.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-success-100 bg-success-50 px-3.5 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-500">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-success-600">System Status: Protected</p>
            <p className="text-[11px] text-success-500">All layers active</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((kpi) => (
              <div key={kpi.label} className="animate-slide-up rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all hover:shadow-card-hover">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className={`h-4 w-4 ${kpi.trend === 'up' ? 'text-success-400' : 'text-danger-400'}`} />
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-ink-700">{kpi.value}</p>
                <p className="text-sm font-medium text-ink-500">{kpi.label}</p>
                <p className="mt-1 text-xs text-ink-300">{kpi.sub}</p>
              </div>
            ))}
      </div>

      {/* Connected Resources */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-700">Connected Resources</h2>
          <button onClick={() => onNavigate('resources')} className="flex items-center gap-1 text-sm font-medium text-peacock-600 hover:text-peacock-700">
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectResource(r.id)}
              className="group animate-slide-up rounded-2xl border border-ink-100 bg-white p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-peacock-50 transition-colors group-hover:bg-peacock-100">
                  <ResourceIcon name={r.icon} className="h-5 w-5 text-peacock-600" />
                </div>
                <ConnectionBadge connected={r.connected} />
              </div>
              <p className="mt-4 text-base font-semibold text-ink-700">{r.type}</p>
              <p className="text-[13px] text-ink-400">{r.description}</p>
              <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="text-[11px] text-ink-300">Last checked {r.lastSync}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-peacock-600 opacity-0 transition-opacity group-hover:opacity-100">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Security Pipeline */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-ink-700">How PrismGuard Protects Your Prompt</h2>
        <p className="mt-1 text-sm text-ink-400">Every prompt passes through five security layers before reaching a connected resource.</p>
        <div className="mt-4 flex items-center gap-2">
          {(['Banking', 'Government', 'Company', 'Research'] as ResourceType[]).map((rt) => (
            <button
              key={rt}
              onClick={() => setSelectedResource(rt)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedResource === rt
                  ? 'bg-peacock-600 text-white'
                  : 'bg-white text-ink-400 border border-ink-100 hover:border-peacock-200 hover:text-peacock-600'
              }`}
            >
              {rt}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-ink-100 bg-ink-50/50 p-5">
          {loading ? <div className="skeleton h-24 w-full rounded-xl" /> : <SecurityPipeline selectedResource={selectedResource} />}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-700">Recent Prompt Activity</h2>
          <button onClick={() => onNavigate('logs')} className="flex items-center gap-1 text-sm font-medium text-peacock-600 hover:text-peacock-700">
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          {/* Desktop table */}
          <table className="hidden w-full md:table">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Prompt</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Resource</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Risk</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>)
                : recentActivity.slice(0, 6).map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-ink-50/50">
                      <td className="max-w-md truncate px-5 py-3.5 text-sm text-ink-600">{a.prompt}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">{a.resource}</span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-3.5"><RiskBadge level={a.risk} /></td>
                      <td className="px-5 py-3.5 text-xs text-ink-300">{a.time}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {/* Mobile cards */}
          <div className="divide-y divide-ink-100 md:hidden">
            {recentActivity.slice(0, 6).map((a) => (
              <div key={a.id} className="p-4">
                <p className="text-sm text-ink-600">{a.prompt}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">{a.resource}</span>
                  <StatusBadge status={a.status} />
                  <RiskBadge level={a.risk} />
                  <span className="ml-auto text-xs text-ink-300">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-ink-700">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => onNavigate(action.screen)}
              className={`group flex flex-col rounded-2xl border border-ink-100 bg-gradient-to-br ${action.color} p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover`}
            >
              <div className="flex items-center justify-between">
                <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                <ArrowRight className="h-4 w-4 text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-ink-400" />
              </div>
              <p className="mt-4 text-base font-semibold text-ink-700">{action.title}</p>
              <p className="mt-1 text-sm text-ink-400">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer tagline */}
      <div className="mt-12 flex flex-col items-center gap-1 border-t border-ink-100 pt-8 text-center">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-peacock-600" />
          <span className="text-sm font-semibold text-ink-600">PrismGuard</span>
        </div>
        <p className="text-xs text-ink-400">One secure gateway for AI access to sensitive resources.</p>
        <p className="text-[11px] text-ink-300">Secure. Filter. Route. Protect.</p>
      </div>
    </div>
  );
}
