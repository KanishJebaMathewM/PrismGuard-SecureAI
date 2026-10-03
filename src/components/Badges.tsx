import type { RiskLevel, PromptStatus, ModelStatus } from '@/types';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Activity,
  CircleDot,
} from 'lucide-react';

export function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    Low: 'bg-success-50 text-success-600 border-success-100',
    Medium: 'bg-warning-50 text-warning-600 border-warning-100',
    High: 'bg-danger-50 text-danger-500 border-danger-100',
    Critical: 'bg-danger-50 text-danger-600 border-danger-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[level]}`}>
      <CircleDot className="h-3 w-3" />
      {level}
    </span>
  );
}

export function StatusBadge({ status }: { status: PromptStatus }) {
  const styles: Record<PromptStatus, { class: string; icon: typeof ShieldCheck }> = {
    Allowed: { class: 'bg-success-50 text-success-600 border-success-100', icon: ShieldCheck },
    Blocked: { class: 'bg-danger-50 text-danger-600 border-danger-100', icon: ShieldX },
    Review: { class: 'bg-warning-50 text-warning-600 border-warning-100', icon: Clock },
    Suspicious: { class: 'bg-warning-50 text-warning-500 border-warning-100', icon: ShieldAlert },
  };
  const { class: cls, icon: Icon } = styles[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

export function ModelStatusBadge({ status }: { status: ModelStatus }) {
  const styles: Record<ModelStatus, string> = {
    Active: 'bg-success-50 text-success-600 border-success-100',
    Training: 'bg-info-50 text-info-500 border-info-100',
    Validation: 'bg-warning-50 text-warning-600 border-warning-100',
    Deploying: 'bg-peacock-50 text-peacock-600 border-peacock-100',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      <Activity className="h-3 w-3" />
      {status}
    </span>
  );
}

export function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${connected ? 'bg-success-50 text-success-600 border-success-100' : 'bg-ink-100 text-ink-400 border-ink-200'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-success-500 animate-pulse-soft' : 'bg-ink-300'}`} />
      {connected ? 'Connected' : 'Disconnected'}
    </span>
  );
}
