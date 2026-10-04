/**
 * demoStore.tsx
 * Shared state for the PrismGuard demo toggle + malicious-prompt notification.
 * Keeps Chat and AdminReview in sync without prop-drilling through App.
 */
import { createContext, useContext, useState, ReactNode } from 'react';
import type { ReviewItem } from '@/types';

export interface DemoNotification {
  id: string;         // notification id
  reviewId: string;   // matching ReviewItem id so Review button can navigate
  prompt: string;
  resource: string;
  timestamp: string;
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
  // New fields for storing classified samples
  addClassifiedSample: (resource: string, prompt: string, classification: string) => void;
  classifiedSamples: Record<string, { prompt: string; classification: string }[]>;
}

const DemoContext = createContext<DemoCtx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [prismGuardEnabled, setPrismGuardEnabled] = useState(true);
  const [pendingNotifications, setPendingNotifications] = useState<DemoNotification[]>([]);
  const [liveReviewItems, setLiveReviewItems] = useState<ReviewItem[]>([]);
  const [retrainingResource, setRetrainingResource] = useState<string | null>(null);
  const [retrainingDone, setRetrainingDone] = useState(false);
  // Store classified prompts per resource for retraining
  const [classifiedSamples, setClassifiedSamples] = useState<Record<string, { prompt: string; classification: string }[]>>({});

  function addClassifiedSample(resource: string, prompt: string, classification: string) {
    setClassifiedSamples((prev) => {
      const existing = prev[resource] ?? [];
      return { ...prev, [resource]: [...existing, { prompt, classification }] };
    });
  }

  function addNotification(n: DemoNotification, item: ReviewItem) {
    setPendingNotifications((prev) => [n, ...prev]);
    setLiveReviewItems((prev) => [item, ...prev]);
  }

  function dismissNotification(id: string) {
    setPendingNotifications((prev) => {
      const notif = prev.find((n) => n.id === id);
      if (notif) {
        // also remove the matching review item
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
        addClassifiedSample,
        classifiedSamples,
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
