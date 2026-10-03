import { User, Filter, ShieldCheck, Shield, BrainCircuit, Database, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ResourceType } from '@/types';

interface PipelineStage {
  icon: typeof User;
  title: string;
  subtitle: string;
  items: string[];
  highlight?: boolean;
}

interface SecurityPipelineProps {
  selectedResource?: ResourceType;
  compact?: boolean;
}

export function SecurityPipeline({ selectedResource = 'Banking', compact = false }: SecurityPipelineProps) {
  const stages: PipelineStage[] = [
    {
      icon: User,
      title: 'User Prompt',
      subtitle: 'Input received',
      items: ['Prompt submitted by user'],
    },
    {
      icon: Filter,
      title: 'Keyword Filter',
      subtitle: 'Basic protection',
      items: ['Sensitive keyword detection', 'Initial sanitization'],
    },
    {
      icon: ShieldCheck,
      title: 'Secure AI API',
      subtitle: 'Advanced validation',
      items: ['Prompt analysis', 'Jailbreak detection', 'Malicious intent detection'],
    },
    {
      icon: Shield,
      title: 'PrismGuard',
      subtitle: 'Secure routing',
      items: ['Resource identification', 'Security enforcement', 'Model routing'],
      highlight: true,
    },
    {
      icon: BrainCircuit,
      title: 'Resource Model',
      subtitle: `${selectedResource} Model`,
      items: ['Resource-specific validation', 'Attack pattern detection'],
    },
    {
      icon: Database,
      title: 'Connected Resource',
      subtitle: selectedResource,
      items: ['Secure data access'],
    },
  ];

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-stretch gap-2">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-stretch gap-2">
            <div
              className={`group relative flex w-44 flex-col rounded-xl border p-4 transition-all hover:shadow-card-hover ${
                stage.highlight
                  ? 'border-peacock-300 bg-gradient-to-br from-peacock-50 to-white shadow-sm'
                  : 'border-ink-100 bg-white'
              }`}
            >
              {stage.highlight && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-peacock-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    Core
                  </span>
                </div>
              )}
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                stage.highlight ? 'bg-peacock-600 text-white' : 'bg-ink-50 text-ink-500 group-hover:bg-peacock-50 group-hover:text-peacock-600'
              }`}>
                <stage.icon className="h-[18px] w-[18px]" />
              </div>
              <p className="mt-3 text-sm font-semibold text-ink-700">{stage.title}</p>
              <p className="text-[11px] font-medium text-peacock-600">{stage.subtitle}</p>
              {!compact && (
                <ul className="mt-2.5 space-y-1">
                  {stage.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-[11px] text-ink-400">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-peacock-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {i < stages.length - 1 && (
              <div className="flex items-center">
                <div className="flow-line h-0.5 w-6 rounded-full bg-peacock-200">
                  <ArrowRight className="absolute h-3 w-3 -translate-y-1/2 translate-x-1.5 text-peacock-400" style={{ marginTop: '2px' }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
