import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  BrainCircuit,
  RotateCw,
  Activity,
  Target,
  Clock,
  Database,
  CheckCircle2,
  X,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { ModelStatusBadge } from '@/components/Badges';
import { SkeletonCard } from '@/components/Skeletons';
import { models } from '@/data';
import type { Screen, SecurityModel } from '@/types';

interface ModelsProps {
  onSelectModel: (id: string) => void;
  onNavigate: (screen: Screen) => void;
}

export function Models({ onSelectModel }: ModelsProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-700">Security Models</h1>
        <p className="mt-1 text-sm text-ink-400">Resource-specific models trained to identify attacks relevant to each connected system.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : models.map((m) => (
              <div key={m.id} className="animate-slide-up rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-all hover:shadow-card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-peacock-50">
                      <BrainCircuit className="h-6 w-6 text-peacock-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-ink-700">{m.name}</h3>
                      <p className="text-sm text-peacock-600">Version {m.version}</p>
                    </div>
                  </div>
                  <ModelStatusBadge status={m.status} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-100 pt-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-300">Training Samples</p>
                    <p className="mt-1 text-lg font-bold text-ink-700">{m.trainingSamples.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-300">Detection Accuracy</p>
                    <p className="mt-1 text-lg font-bold text-success-600">{m.detectionAccuracy}%</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-300">Last Trained</p>
                    <p className="mt-1 text-sm font-medium text-ink-600">{m.lastTrained}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-300">Attacks Detected</p>
                    <p className="mt-1 text-sm font-medium text-ink-600">{m.attacksDetected}</p>
                  </div>
                </div>

                {m.status === 'Training' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-info-500">Training in progress</span>
                      <span className="font-semibold text-info-500">{m.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-info-50">
                      <div className="h-full rounded-full bg-info-400 transition-all" style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => onSelectModel(m.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 transition-all hover:border-peacock-200 hover:bg-peacock-50 hover:text-peacock-600"
                  >
                    View Model <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="flex items-center justify-center gap-1.5 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-500 transition-all hover:border-peacock-200 hover:bg-peacock-50 hover:text-peacock-600">
                    <RotateCw className="h-4 w-4" /> Retrain
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

interface ModelDetailProps {
  modelId: string;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export function ModelDetail({ modelId, onBack }: ModelDetailProps) {
  const [model, setModel] = useState<SecurityModel>(() => models.find((m) => m.id === modelId) || models[0]);
  const [showRetrain, setShowRetrain] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);

  function startRetrain() {
    setShowRetrain(false);
    setTraining(true);
    setTrainProgress(0);
    const interval = setInterval(() => {
      setTrainProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTraining(false);
          setModel((m) => ({
            ...m,
            status: 'Active',
            lastTrained: 'Just now',
            version: m.version,
            progress: 0,
          }));
          return 100;
        }
        return p + 5;
      });
    }, 150);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-ink-400 transition-colors hover:text-peacock-600">
        <ArrowLeft className="h-4 w-4" /> Back to Models
      </button>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-peacock-50">
            <BrainCircuit className="h-7 w-7 text-peacock-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-700">{model.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-400">
              Version {model.version} · {model.resource} resource
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ModelStatusBadge status={training ? 'Training' : model.status} />
          <button
            onClick={() => setShowRetrain(true)}
            disabled={training}
            className="flex items-center gap-2 rounded-lg bg-peacock-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-peacock-700 disabled:opacity-50"
          >
            <RotateCw className="h-4 w-4" /> Start Retraining
          </button>
        </div>
      </div>

      {/* Training progress */}
      {training && (
        <div className="mt-6 animate-slide-up rounded-2xl border border-info-100 bg-info-50/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-info-400 border-t-info-100" />
              <span className="text-sm font-semibold text-info-500">Retraining in progress</span>
            </div>
            <span className="text-lg font-bold text-info-500">{trainProgress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-info-100">
            <div className="h-full rounded-full bg-info-400 transition-all duration-150" style={{ width: `${trainProgress}%` }} />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-info-400">
            <span>Dataset: {model.trainingSamples.toLocaleString()} samples</span>
            <span>·</span>
            <span>Validation pending</span>
          </div>
        </div>
      )}

      {/* Overview */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Activity className="h-4 w-4 text-peacock-600" /> Model Overview
          </h3>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Model name', value: model.name },
              { label: 'Version', value: model.version },
              { label: 'Status', value: model.status },
              { label: 'Resource', value: model.resource },
              { label: 'Training dataset', value: `${model.trainingSamples.toLocaleString()} samples` },
              { label: 'Last training', value: model.lastTrained },
              { label: 'Attacks detected', value: `${model.attacksDetected}` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-ink-100 pb-2.5 last:border-0">
                <span className="text-sm text-ink-400">{item.label}</span>
                <span className="text-sm font-medium text-ink-600">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Training History */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Clock className="h-4 w-4 text-peacock-600" /> Training History
          </h3>
          <div className="mt-4 space-y-2">
            {model.trainingHistory.map((h, i) => (
              <div key={i} className={`flex items-center justify-between rounded-lg border p-3 ${i === 0 ? 'border-peacock-200 bg-peacock-50/40' : 'border-ink-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${i === 0 ? 'bg-peacock-600 text-white' : 'bg-ink-50 text-ink-400'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-700">{h.version}</p>
                    <p className="text-xs text-ink-300">{h.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink-600">{h.samples.toLocaleString()}</p>
                  <p className="text-[11px] text-ink-300">samples</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Categories */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Target className="h-4 w-4 text-peacock-600" /> Attack Categories Learned
          </h3>
          <div className="mt-4 space-y-2">
            {model.attackCategories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg border border-ink-100 px-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success-500" />
                <span className="text-sm text-ink-600">{cat}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-peacock-50/40 p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-peacock-600" />
              <span className="text-xs font-medium text-peacock-700">{model.detectionAccuracy}% detection accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retrain modal */}
      {showRetrain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm" onClick={() => setShowRetrain(false)}>
          <div className="mx-4 w-full max-w-md animate-scale-in rounded-2xl border border-ink-100 bg-white p-6 shadow-card-hover" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink-700">Retrain {model.name}?</h3>
              <button onClick={() => setShowRetrain(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 rounded-lg bg-ink-50 p-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-peacock-600" />
                <span className="text-sm font-medium text-ink-600">Training Dataset</span>
              </div>
              <p className="mt-1.5 text-xs text-ink-400">
                {model.trainingSamples.toLocaleString()} samples including {model.attacksDetected} recently detected attacks
                and admin-labelled prompts from the review queue.
              </p>
            </div>
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-warning-100 bg-warning-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning-500" />
              <p className="text-xs text-warning-600">
                The model will be temporarily unavailable during retraining. This typically takes 10-30 minutes.
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShowRetrain(false)} className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50">
                Cancel
              </button>
              <button onClick={startRetrain} className="flex-1 rounded-lg bg-peacock-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-peacock-700">
                Start Retraining
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
