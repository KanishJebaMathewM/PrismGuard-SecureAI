import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  Shield,
  Target,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { RiskBadge } from '@/components/Badges';
import { researchTopics } from '@/data';
import type { Screen, ResearchTopic } from '@/types';

interface ResearchProps {
  onSelectTopic: (id: string) => void;
  onNavigate: (screen: Screen) => void;
}

export function Research({ onSelectTopic }: ResearchProps) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-700">Security Research</h1>
        <p className="mt-1 text-sm text-ink-400">Study traditional prompt attacks and improve PrismGuard detection.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {researchTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.id)}
            className="group animate-slide-up rounded-2xl border border-ink-100 bg-white p-6 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-research-50">
                <BookOpen className="h-5 w-5 text-research-500" />
              </div>
              <RiskBadge level={topic.severity} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink-700">{topic.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{topic.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">{topic.relatedResource}</span>
                <span className="text-xs text-ink-300">{topic.attackExamples.length} attack examples</span>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-research-500 opacity-0 transition-opacity group-hover:opacity-100">
                View Research <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ResearchDetailProps {
  topicId: string;
  onBack: () => void;
}

export function ResearchDetail({ topicId, onBack }: ResearchDetailProps) {
  const topic = researchTopics.find((t) => t.id === topicId) || researchTopics[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-ink-400 transition-colors hover:text-peacock-600">
        <ArrowLeft className="h-4 w-4" /> Back to Research
      </button>

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-research-50">
              <BookOpen className="h-7 w-7 text-research-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-700">{topic.title}</h1>
              <p className="mt-1 text-sm text-ink-400">Related resource: {topic.relatedResource}</p>
            </div>
          </div>
          <RiskBadge level={topic.severity} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-500">{topic.description}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Attack examples */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <AlertTriangle className="h-4 w-4 text-danger-500" /> Attack Examples
          </h3>
          <div className="mt-4 space-y-3">
            {topic.attackExamples.map((ex, i) => (
              <div key={i} className="rounded-lg border border-ink-100 bg-ink-50/30 p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-danger-50 text-[10px] font-bold text-danger-500">
                    {i + 1}
                  </span>
                  <p className="font-mono text-[13px] leading-relaxed text-ink-600">{ex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detection strategies */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Shield className="h-4 w-4 text-peacock-600" /> Detection Strategies
          </h3>
          <div className="mt-4 space-y-3">
            {topic.detectionStrategies.map((strat, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg border border-success-100 bg-success-50/40 p-3">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                <p className="text-[13px] leading-relaxed text-ink-600">{strat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Severity & resource */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50">
            <AlertTriangle className="h-5 w-5 text-warning-500" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Severity</p>
            <p className="text-sm font-semibold text-ink-700">{topic.severity}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-peacock-50">
            <Target className="h-5 w-5 text-peacock-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Related Resource</p>
            <p className="text-sm font-semibold text-ink-700">{topic.relatedResource}</p>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-research-100 bg-research-50/40 p-5">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-research-500" />
        <div>
          <p className="text-sm font-medium text-research-500">Research Insight</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            Findings from this research are incorporated into the {topic.relatedResource} Security Model's training dataset,
            improving its ability to detect and block similar attack patterns in production.
          </p>
        </div>
      </div>
    </div>
  );
}
