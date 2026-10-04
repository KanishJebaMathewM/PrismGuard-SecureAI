import { createContext, useContext, useState, ReactNode } from 'react';
import type { ReviewItem, Resource, SecurityModel } from '@/types';
import { resources as initialResources, models as initialModels } from '@/data';

export interface DemoNotification {
  id: string;         // notification id
  reviewId: string;   // matching ReviewItem id so Review button can navigate
  prompt: string;
  resource: string;
  timestamp: string;
}

export interface NewResourceInput {
  name: string;
  type: string;
  description: string;
  icon?: string;
  rules?: string[];
  samplePrompts?: { text: string; label: 'Malicious' | 'Safe' }[];
}

interface DemoCtx {
  prismGuardEnabled: boolean;
  setPrismGuardEnabled: (v: boolean) => void;
  pendingNotifications: DemoNotification[];
  liveReviewItems: ReviewItem[];
  addNotification: (n: DemoNotification, item: ReviewItem) => void;
  dismissNotification: (id: string) => void;
  retrainingResource: string | null;
  triggerRetraining: (resource: string) => void;
  retrainingDone: boolean;
  clearRetraining: () => void;
  // Resource & Model management
  resourcesList: Resource[];
  modelsList: SecurityModel[];
  connectNewResource: (input: NewResourceInput) => { resource: Resource; model: SecurityModel };
  updateModel: (modelId: string, updates: Partial<SecurityModel>) => void;
  // Classified samples storage for retraining
  addClassifiedSample: (resource: string, prompt: string, classification: string) => void;
  classifiedSamples: Record<string, { prompt: string; classification: string }[]>;
  customResources: Record<string, string[]>;
  addCustomResource: (resource: string, prompts: string[]) => void;
}

const DemoContext = createContext<DemoCtx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [prismGuardEnabled, setPrismGuardEnabled] = useState(true);
  const [pendingNotifications, setPendingNotifications] = useState<DemoNotification[]>([]);
  const [liveReviewItems, setLiveReviewItems] = useState<ReviewItem[]>([]);
  const [retrainingResource, setRetrainingResource] = useState<string | null>(null);
  const [retrainingDone, setRetrainingDone] = useState(false);
  const [customResources, setCustomResources] = useState<Record<string, string[]>>({});
  const [classifiedSamples, setClassifiedSamples] = useState<Record<string, { prompt: string; classification: string }[]>>({});

  // Dynamic resources & models state
  const [resourcesList, setResourcesList] = useState<Resource[]>(initialResources);
  const [modelsList, setModelsList] = useState<SecurityModel[]>(initialModels);

  function addCustomResource(resource: string, prompts: string[]) {
    setCustomResources((prev) => ({ ...prev, [resource]: prompts }));
  }

  function addClassifiedSample(resource: string, prompt: string, classification: string) {
    setClassifiedSamples((prev) => {
      const existing = prev[resource] ?? [];
      return { ...prev, [resource]: [...existing, { prompt, classification }] };
    });
  }

  function connectNewResource(input: NewResourceInput) {
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `resource-${Date.now()}`;
    const resourceId = `${slug}-${Date.now().toString().slice(-4)}`;
    const modelId = `${slug}-model`;
    const modelName = `${input.name} Security Model`;
    const resType = input.type || input.name;
    const promptCount = input.samplePrompts?.length || 0;
    const initialSamples = promptCount > 0 ? promptCount * 120 + 850 : 1250;

    const newResource: Resource = {
      id: resourceId,
      type: resType,
      name: input.name,
      description: input.description || 'Connected resource protected by PrismGuard',
      connected: true,
      model: modelName,
      modelVersion: 'v1.0',
      lastSync: 'Just now',
      requestsToday: 0,
      totalRequests: 0,
      apiStatus: 'Operational',
      icon: input.icon || 'database',
      rules: input.rules && input.rules.length > 0 ? input.rules : [
        'Sensitive account data extraction',
        'Credential and authorization requests',
        'Prompt injection & jailbreak defense',
        'System instruction override attempts',
      ],
    };

    const newModel: SecurityModel = {
      id: modelId,
      name: modelName,
      version: 'v1.0',
      status: 'Active',
      resource: resType,
      trainingSamples: initialSamples,
      detectionAccuracy: 95.8,
      lastTrained: 'Just now',
      attacksDetected: 0,
      trainingHistory: [
        { version: 'v1.0', date: 'Today', samples: initialSamples },
      ],
      attackCategories: [
        'Prompt Injection',
        'Jailbreak Attempts',
        'Unauthorized Data Extraction',
        'Instruction Override',
      ],
      progress: 0,
    };

    setResourcesList((prev) => [...prev, newResource]);
    setModelsList((prev) => [...prev, newModel]);

    if (input.samplePrompts && input.samplePrompts.length > 0) {
      input.samplePrompts.forEach((p) => {
        addClassifiedSample(resType, p.text, p.label);
      });
      addCustomResource(resType, input.samplePrompts.map((p) => p.text));
    }

    return { resource: newResource, model: newModel };
  }

  function updateModel(modelId: string, updates: Partial<SecurityModel>) {
    setModelsList((prev) => prev.map((m) => (m.id === modelId ? { ...m, ...updates } : m)));
  }

  function addNotification(n: DemoNotification, item: ReviewItem) {
    setPendingNotifications((prev) => [n, ...prev]);
    setLiveReviewItems((prev) => [item, ...prev]);
  }

  function dismissNotification(id: string) {
    setPendingNotifications((prev) => {
      const notif = prev.find((n) => n.id === id);
      if (notif) {
        setLiveReviewItems((items) => items.filter((r) => r.id !== notif.reviewId));
      }
      return prev.filter((n) => n.id !== id);
    });
  }

  function triggerRetraining(resource: string) {
    setRetrainingResource(resource);
    setRetrainingDone(false);
    setTimeout(() => {
      setRetrainingDone(true);
      // Bump model version & accuracy in modelsList
      setModelsList((prev) =>
        prev.map((m) => {
          if (m.resource.toLowerCase() === resource.toLowerCase()) {
            const currentVerNum = parseFloat(m.version.replace('v', '')) || 1.0;
            const newVer = `v${(currentVerNum + 0.1).toFixed(1)}`;
            const newSamples = m.trainingSamples + (classifiedSamples[resource]?.length || 1);
            return {
              ...m,
              version: newVer,
              trainingSamples: newSamples,
              detectionAccuracy: Math.min(99.4, Number((m.detectionAccuracy + 0.3).toFixed(1))),
              lastTrained: 'Just now',
              trainingHistory: [{ version: newVer, date: 'Today', samples: newSamples }, ...m.trainingHistory],
            };
          }
          return m;
        })
      );
      setTimeout(() => {
        setRetrainingResource(null);
        setRetrainingDone(false);
      }, 3000);
    }, 3000);
  }

  function clearRetraining() {
    setRetrainingResource(null);
    setRetrainingDone(false);
  }

  return (
    <DemoContext.Provider
      value={{
        prismGuardEnabled,
        setPrismGuardEnabled,
        pendingNotifications,
        liveReviewItems,
        addNotification,
        dismissNotification,
        retrainingResource,
        triggerRetraining,
        retrainingDone,
        clearRetraining,
        resourcesList,
        modelsList,
        connectNewResource,
        updateModel,
        addClassifiedSample,
        classifiedSamples,
        customResources,
        addCustomResource,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoStore() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoStore must be used inside DemoProvider');
  return ctx;
}
