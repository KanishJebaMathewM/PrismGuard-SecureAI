import {
  Database,
  Brain,
  CheckCircle2,
  Upload,
  ArrowRight,
  Activity,
  Clock,
  FileText,
} from 'lucide-react';
import { trainingJobs, models } from '@/data';

export function Training() {
  const pipelineStages = [
    { icon: FileText, label: 'Admin-labelled prompts', desc: 'Human-classified prompts from review queue' },
    { icon: Database, label: 'Training Dataset', desc: 'Curated collection of attack patterns' },
    { icon: Brain, label: 'Model Training', desc: 'Resource-specific model retraining' },
    { icon: CheckCircle2, label: 'Validation', desc: 'Accuracy and performance testing' },
    { icon: Upload, label: 'New Model Version', desc: 'Versioned model deployment' },
    { icon: Activity, label: 'Deployment', desc: 'Live model activation' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-700">Training & Continuous Learning</h1>
        <p className="mt-1 text-sm text-ink-400">Admin-labelled prompts feed back into resource-specific models for continuous improvement.</p>
      </div>

      {/* Pipeline */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-ink-700">Training Pipeline</h3>
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="flex min-w-max items-stretch gap-2">
            {pipelineStages.map((stage, i) => (
              <div key={i} className="flex items-stretch gap-2">
                <div className="group flex w-44 flex-col rounded-xl border border-ink-100 bg-white p-4 shadow-card transition-all hover:shadow-card-hover">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-peacock-50 text-peacock-600 transition-colors group-hover:bg-peacock-600 group-hover:text-white">
                    <stage.icon className="h-[18px] w-[18px]" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink-700">{stage.label}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-400">{stage.desc}</p>
                </div>
                {i < pipelineStages.length - 1 && (
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-peacock-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active training jobs */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-ink-700">Active Training Jobs</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {trainingJobs.map((job) => (
            <div key={job.id} className="animate-slide-up rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all hover:shadow-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-peacock-50">
                    <Brain className="h-5 w-5 text-peacock-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-700">{job.modelName}</p>
                    <p className="text-xs text-ink-400">{job.resource} resource</p>
                  </div>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  job.status === 'Training' ? 'bg-info-50 text-info-500 border-info-100' :
                  job.status === 'Validation' ? 'bg-warning-50 text-warning-600 border-warning-100' :
                  'bg-peacock-50 text-peacock-600 border-peacock-100'
                }`}>
                  {job.status}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-400">Progress</span>
                  <span className="font-semibold text-ink-600">{job.progress}%</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      job.status === 'Training' ? 'bg-info-400' :
                      job.status === 'Validation' ? 'bg-warning-400' :
                      'bg-peacock-500'
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-100 pt-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-300">Dataset</p>
                  <p className="mt-0.5 text-sm font-medium text-ink-600">{job.dataset}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-300">Dataset Size</p>
                  <p className="mt-0.5 text-sm font-medium text-ink-600">{job.datasetSize.toLocaleString()} prompts</p>
                </div>
              </div>

              <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 transition-all hover:border-peacock-200 hover:bg-peacock-50 hover:text-peacock-600">
                View Training <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All models status */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-ink-700">Model Training Status</h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          <table className="hidden w-full md:table">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Model</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Resource</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Samples</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Accuracy</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Last Trained</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {models.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-ink-50/50">
                  <td className="px-5 py-3.5 text-sm font-medium text-ink-600">{m.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">{m.resource}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-ink-500">{m.trainingSamples.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-success-600">{m.detectionAccuracy}%</td>
                  <td className="px-5 py-3.5 text-xs text-ink-300">{m.lastTrained}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      m.status === 'Active' ? 'bg-success-50 text-success-600 border-success-100' :
                      m.status === 'Training' ? 'bg-info-50 text-info-500 border-info-100' :
                      'bg-warning-50 text-warning-600 border-warning-100'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="divide-y divide-ink-100 md:hidden">
            {models.map((m) => (
              <div key={m.id} className="p-4">
                <p className="text-sm font-medium text-ink-600">{m.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">{m.resource}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                    m.status === 'Active' ? 'bg-success-50 text-success-600 border-success-100' :
                    m.status === 'Training' ? 'bg-info-50 text-info-500 border-info-100' :
                    'bg-warning-50 text-warning-600 border-warning-100'
                  }`}>{m.status}</span>
                </div>
                <p className="mt-1 text-xs text-ink-300">{m.trainingSamples.toLocaleString()} samples · {m.detectionAccuracy}% accuracy</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback loop info */}
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-peacock-100 bg-peacock-50/40 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peacock-600 text-white">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-peacock-700">Continuous Feedback Loop</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            When PrismGuard detects a suspicious prompt, it's sent to admin review.
            Admin-classified prompts are added to the training dataset, which is used to retrain
            resource-specific models. This creates a continuous improvement cycle where every
            detected attack makes the system smarter.
          </p>
        </div>
      </div>
    </div>
  );
}
