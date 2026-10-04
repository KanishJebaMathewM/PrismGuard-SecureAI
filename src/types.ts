export type Screen =
  | 'dashboard'
  | 'chat'
  | 'resources'
  | 'resource-detail'
  | 'attack-lab'
  | 'research'
  | 'research-detail'
  | 'models'
  | 'model-detail'
  | 'admin-review'
  | 'prompt-review'
  | 'training'
  | 'logs'
  | 'settings';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PromptStatus = 'Allowed' | 'Blocked' | 'Review' | 'Suspicious';
export type ResourceType = 'Banking' | 'Government' | 'Company' | 'Research';
export type ReviewStatus = 'Pending Review' | 'Malicious' | 'Safe' | 'False Positive' | 'Needs Investigation';
export type ModelStatus = 'Active' | 'Training' | 'Validation' | 'Deploying';

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  connected: boolean;
  model: string;
  modelVersion: string;
  lastSync: string;
  requestsToday: number;
  totalRequests: number;
  apiStatus: string;
  icon: string;
  rules: string[];
}

export interface SecurityModel {
  id: string;
  name: string;
  version: string;
  status: ModelStatus;
  resource: ResourceType;
  trainingSamples: number;
  detectionAccuracy: number;
  lastTrained: string;
  attacksDetected: number;
  trainingHistory: { version: string; date: string; samples: number }[];
  attackCategories: string[];
  progress: number;
}

export interface PromptActivity {
  id: string;
  prompt: string;
  resource: ResourceType;
  status: PromptStatus;
  risk: RiskLevel;
  time: string;
  detectionLayer?: string;
}

export interface ReviewItem {
  id: string;
  prompt: string;
  resource: ResourceType;
  detectionLayer: string;
  risk: RiskLevel;
  submitted: string;
  status: ReviewStatus;
  analysis: { layer: string; result: 'PASSED' | 'BYPASSED' | 'SUSPICIOUS' | 'BLOCKED' }[];
}

export interface ResearchTopic {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  relatedResource: ResourceType;
  attackExamples: string[];
  detectionStrategies: string[];
}

export interface AttackTest {
  id: string;
  name: string;
  description: string;
  severity: RiskLevel;
  icon: string;
}

export interface SecurityLog {
  id: string;
  title: string;
  resource: ResourceType;
  detail: string;
  risk: RiskLevel;
  time: string;
  category: 'Blocked' | 'Allowed' | 'Suspicious' | 'Critical';
}

export interface TrainingJob {
  id: string;
  modelName: string;
  resource: ResourceType;
  status: ModelStatus;
  progress: number;
  dataset: string;
  datasetSize: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  securityCheck?: SecurityCheckStep[];
  blocked?: boolean;
  blockedReason?: string;
  blockedLayer?: string;
  resource?: ResourceType;
}

export interface SecurityCheckStep {
  name: string;
  status: 'passed' | 'blocked' | 'processing' | 'flagged' | 'unavailable';
}
