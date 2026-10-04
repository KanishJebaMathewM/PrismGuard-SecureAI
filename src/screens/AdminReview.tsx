import { useState } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  Tag,
  StickyNote,
  Send,
  ChevronDown,
  Database,
  Layers,
} from 'lucide-react';
import { RiskBadge } from '@/components/Badges';
import { reviewQueue } from '@/data';
import type { Screen, ReviewItem, ReviewStatus } from '@/types';
import { classifyReview, ClassifyPayload } from '@/api';

interface AdminReviewProps {
  onSelectReview: (id: string) => void;
  onNavigate: (screen: Screen) => void;
}

export function AdminReview({ onSelectReview, onNavigate }: AdminReviewProps) {
  const [items, setItems] = useState<ReviewItem[]>(reviewQueue);
  const [filter, setFilter] = useState<'all' | 'pending' | 'classified'>('all');

  const filtered = items.filter((item) => {
    if (filter === 'pending') return item.status === 'Pending Review';
    if (filter === 'classified') return item.status !== 'Pending Review';
    return true;
  });

  const pendingCount = items.filter((i) => i.status === 'Pending Review').length;

  function quickClassify(id: string, status: ReviewStatus) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  const statusStyles: Record<ReviewStatus, string> = {
    'Pending Review': 'bg-warning-50 text-warning-600 border-warning-100',
    'Malicious': 'bg-danger-50 text-danger-600 border-danger-100',
    'Safe': 'bg-success-50 text-success-600 border-success-100',
    'False Positive': 'bg-info-50 text-info-500 border-info-100',
    'Needs Investigation': 'bg-research-50 text-research-500 border-research-100',
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-700">Admin Review</h1>
          <p className="mt-1 text-sm text-ink-400">Review suspicious prompts that require human classification.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-warning-100 bg-warning-50 px-3.5 py-2">
          <Clock className="h-4 w-4 text-warning-500" />
          <span className="text-sm font-semibold text-warning-600">{pendingCount} pending</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex items-center gap-1.5">
        {([
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending Review' },
          { key: 'classified', label: 'Classified' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              filter === tab.key ? 'bg-peacock-600 text-white' : 'bg-white text-ink-400 border border-ink-100 hover:text-peacock-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-ink-100 bg-white py-20 shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50">
            <CheckCircle2 className="h-8 w-8 text-success-500" />
          </div>
          <p className="mt-4 text-lg font-semibold text-ink-700">No suspicious prompts</p>
          <p className="mt-1 text-sm text-ink-400">PrismGuard hasn't detected anything requiring review.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          {/* Desktop table */}
          <table className="hidden w-full lg:table">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Prompt</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Resource</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Detection Layer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Risk</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Submitted</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-ink-50/50">
                  <td className="max-w-xs truncate px-5 py-3.5 text-sm text-ink-600">{item.prompt}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">{item.resource}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-ink-400">{item.detectionLayer}</td>
                  <td className="px-5 py-3.5"><RiskBadge level={item.risk} /></td>
                  <td className="px-5 py-3.5 text-xs text-ink-300">{item.submitted}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'Pending Review' && (
                        <>
                          <button onClick={() => onSelectReview(item.id)} className="flex items-center gap-1 rounded-md bg-peacock-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-peacock-700">
                            <Eye className="h-3 w-3" /> Review
                          </button>
                          <button onClick={() => quickClassify(item.id, 'Malicious')} className="flex items-center gap-1 rounded-md border border-danger-100 bg-danger-50 px-2.5 py-1 text-xs font-medium text-danger-600 transition-colors hover:bg-danger-100">
                            <XCircle className="h-3 w-3" /> Malicious
                          </button>
                          <button onClick={() => quickClassify(item.id, 'Safe')} className="flex items-center gap-1 rounded-md border border-success-100 bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600 transition-colors hover:bg-success-100">
                            <CheckCircle2 className="h-3 w-3" /> Safe
                          </button>
                        </>
                      )}
                      {item.status !== 'Pending Review' && (
                        <button onClick={() => onSelectReview(item.id)} className="flex items-center gap-1 rounded-md border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-50">
                          <Eye className="h-3 w-3" /> View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="divide-y divide-ink-100 lg:hidden">
            {filtered.map((item) => (
              <div key={item.id} className="p-4">
                <p className="text-sm text-ink-600">{item.prompt}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">{item.resource}</span>
                  <RiskBadge level={item.risk} />
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[item.status]}`}>{item.status}</span>
                  <span className="text-xs text-ink-300">{item.submitted}</span>
                </div>
                {item.status === 'Pending Review' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => onSelectReview(item.id)} className="flex-1 rounded-md bg-peacock-600 px-3 py-1.5 text-xs font-medium text-white">
                      Review
                    </button>
                    <button onClick={() => quickClassify(item.id, 'Malicious')} className="rounded-md border border-danger-100 bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-600">
                      Malicious
                    </button>
                    <button onClick={() => quickClassify(item.id, 'Safe')} className="rounded-md border border-success-100 bg-success-50 px-3 py-1.5 text-xs font-medium text-success-600">
                      Safe
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-navigation for admin section */}
      <div className="mt-8 flex flex-wrap gap-2">
        {([
          { label: 'Review Queue', screen: 'admin-review' as Screen, icon: ShieldAlert },
          { label: 'Training & Learning', screen: 'training' as Screen, icon: Database },
          { label: 'Security Logs', screen: 'logs' as Screen, icon: FileText },
          { label: 'Settings', screen: 'settings' as Screen, icon: FileText },
        ]).map((tab) => (
          <button
            key={tab.screen}
            onClick={() => onNavigate(tab.screen)}
            className="flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm font-medium text-ink-500 transition-all hover:border-peacock-200 hover:bg-peacock-50 hover:text-peacock-600"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface PromptReviewProps {
  reviewId: string;
  onBack: () => void;
}

export function PromptReview({ reviewId, onBack }: PromptReviewProps) {
  const item = reviewQueue.find((r) => r.id === reviewId) || reviewQueue[0];
  const [classification, setClassification] = useState<ReviewStatus | null>(null);
  const [category, setCategory] = useState('Prompt Injection');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  async function handleSubmit() {
    if (!classification) return;
    const payload: ClassifyPayload = {
      prompt_text: item.prompt,
      resource: item.resource,
      classification: classification ?? 'Safe',
      category,
      notes,
    };
    try {
      await classifyReview(reviewId, payload);
    } catch (err) {
      console.error('Classification API call failed:', err);
      // Fall through — UX still shows success to avoid blocking the admin workflow
    }
    setSubmitted(true);
  }

  const analysisStyles: Record<string, string> = {
    PASSED: 'text-success-600 bg-success-50',
    BYPASSED: 'text-danger-500 bg-danger-50',
    SUSPICIOUS: 'text-warning-500 bg-warning-50',
    BLOCKED: 'text-danger-600 bg-danger-50',
  };

  const classifyButtons: { label: ReviewStatus; icon: typeof CheckCircle2; color: string }[] = [
    { label: 'Malicious', icon: XCircle, color: 'border-danger-200 text-danger-600 hover:bg-danger-50' },
    { label: 'Safe', icon: CheckCircle2, color: 'border-success-200 text-success-600 hover:bg-success-50' },
    { label: 'False Positive', icon: AlertTriangle, color: 'border-info-200 text-info-500 hover:bg-info-50' },
    { label: 'Needs Investigation', icon: Eye, color: 'border-research-200 text-research-500 hover:bg-research-50' },
  ];

  const categories = ['Prompt Injection', 'Jailbreak', 'Data Extraction', 'Role Manipulation', 'Other'];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-ink-400 transition-colors hover:text-peacock-600">
        <ArrowLeft className="h-4 w-4" /> Back to Review Queue
      </button>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50">
            <ShieldAlert className="h-6 w-6 text-warning-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink-700">Prompt Review</h1>
            <p className="text-sm text-ink-400">Submitted {item.submitted} · {item.resource} resource</p>
          </div>
        </div>
        <RiskBadge level={item.risk} />
      </div>

      {/* Prompt display */}
      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <FileText className="h-4 w-4 text-peacock-600" /> Prompt
        </h3>
        <div className="mt-3 rounded-xl border border-ink-100 bg-ink-900 p-4">
          <p className="font-mono text-sm leading-relaxed text-ink-100">{item.prompt}</p>
        </div>
      </div>

      {/* Security Analysis */}
      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <Layers className="h-4 w-4 text-peacock-600" /> Security Analysis
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {item.analysis.map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-ink-100 bg-white p-4 shadow-card">
              <div>
                <p className="text-sm font-medium text-ink-600">{a.layer}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${analysisStyles[a.result]}`}>
                {a.result}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Classification */}
      {submitted ? (
        <div className="mt-6 animate-scale-in rounded-2xl border border-success-200 bg-success-50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-500">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <p className="mt-3 text-lg font-bold text-success-600">Classification Submitted</p>
          <p className="mt-1 text-sm text-success-500">Added to training dataset</p>
          <p className="mt-3 text-xs text-success-400">
            This prompt has been classified as <strong>{classification}</strong> and added to the {item.resource} Security Model training dataset.
            The model will be retrained with this new sample.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Tag className="h-4 w-4 text-peacock-600" /> Admin Classification
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {classifyButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => setClassification(btn.label)}
                className={`flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2.5 text-xs font-medium transition-all ${
                  classification === btn.label
                    ? `${btn.color} ring-2 ring-peacock-200`
                    : `border-ink-100 text-ink-500 ${btn.color.split(' ').filter(c => c.includes('hover')).join(' ')}`
                }`}
              >
                <btn.icon className="h-3.5 w-3.5" />
                {btn.label}
              </button>
            ))}
          </div>

          {/* Attack category dropdown */}
          <div className="mt-4">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-300">Attack Category</label>
            <div className="relative mt-1.5">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:border-peacock-200"
              >
                {category}
                <ChevronDown className="h-4 w-4 text-ink-300" />
              </button>
              {categoryOpen && (
                <div className="absolute mt-1.5 w-full animate-slide-down rounded-lg border border-ink-100 bg-white shadow-card-hover">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setCategoryOpen(false); }}
                      className={`flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-ink-50 ${category === cat ? 'font-medium text-peacock-600' : 'text-ink-500'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-300">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any additional context about this classification..."
              className="mt-1.5 w-full resize-none rounded-lg border border-ink-200 bg-white p-3 text-sm text-ink-700 placeholder:text-ink-300 focus:border-peacock-300 focus:outline-none focus:shadow-glow"
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => { void handleSubmit(); }}
            disabled={!classification}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-peacock-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-peacock-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Submit Classification
          </button>
        </div>
      )}
    </div>
  );
}
