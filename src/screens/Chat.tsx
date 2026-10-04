import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Shield,
  Filter,
  ShieldCheck,
  BrainCircuit,
  Database,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronDown,
  Lock,
  AlertTriangle,
} from 'lucide-react';

import type { ChatMessage, ResourceType, SecurityCheckStep } from '@/types';
import { chatWithPrismGuard } from '@/api';

const pipelineSteps = [
  { name: 'Keyword Filter', icon: Filter },
  { name: 'Secure AI API', icon: ShieldCheck },
  { name: 'PrismGuard', icon: Shield },
  { name: 'Resource Model', icon: BrainCircuit },
];

const resourceNames: Record<string, string> = {
  Banking: 'Banking Model',
  Government: 'Government Model',
  Company: 'Company Model',
  Research: 'Research Model',
};



const quickPrompts = [
  { label: 'Get banking insights', text: 'What is the current interest rate for savings accounts?', resource: 'Banking' as ResourceType },
  { label: 'Check government policies', text: 'Show current government policy on data retention.', resource: 'Government' as ResourceType },
  { label: 'Search company resources', text: 'Find the latest quarterly revenue report.', resource: 'Company' as ResourceType },
  { label: 'Research public data', text: 'Find recent papers on quantum computing.', resource: 'Research' as ResourceType },
];


export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello, I'm PrismGuard.\nYour prompts are filtered, validated and securely routed to the appropriate resource.",
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedResource, setSelectedResource] = useState<ResourceType | 'Auto Detect'>('Auto Detect');
  const [resourceDropdown, setResourceDropdown] = useState(false);
  const [processing, setProcessing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function detectResource(text: string): ResourceType {
    const lower = text.toLowerCase();
    if (lower.includes('interest') || lower.includes('bank') || lower.includes('account') || lower.includes('financial')) return 'Banking';
    if (lower.includes('government') || lower.includes('policy') || lower.includes('regulation')) return 'Government';
    if (lower.includes('company') || lower.includes('employee') || lower.includes('revenue') || lower.includes('quarterly')) return 'Company';
    if (lower.includes('research') || lower.includes('paper') || lower.includes('data') || lower.includes('quantum')) return 'Research';
    return 'Banking';
  }

  async function handleSend(text: string, resource?: ResourceType) {
    if (!text.trim() || processing) return;
    setProcessing(true);

    const resourceType = resource || (selectedResource === 'Auto Detect' ? detectResource(text) : selectedResource);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, resource: resourceType };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    await new Promise((r) => setTimeout(r, 900));

    try {
      // Call the PrismGuard backend pipeline — responses always come from the API keys
      const data = await chatWithPrismGuard(text, resourceType);

      const steps: SecurityCheckStep[] = data.security_steps.map((s) => ({
        name: s.name,
        status: s.status as SecurityCheckStep['status'],
      }));

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        securityCheck: steps,
        blocked: data.blocked,
        blockedReason: data.blocked_reason ?? undefined,
        blockedLayer: data.blocked_layer ?? undefined,
        resource: resourceType,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      // Backend is unreachable — surface an error instead of returning local data
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: `PrismGuard backend is unavailable.\n\nPlease ensure the FastAPI server is running on port 8000 and your API keys are configured in .env.\n\nError: ${errorMsg}`,
        blocked: false,
        resource: resourceType,
      }]);
    }

    setProcessing(false);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Chat header */}
      <div className="border-b border-ink-100 bg-white px-4 py-4 lg:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-peacock-500 to-peacock-700">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-ink-700">PrismGuard Chat</h1>
            </div>
            <p className="mt-0.5 text-sm text-ink-400">Ask securely. PrismGuard automatically protects and routes your request.</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setResourceDropdown(!resourceDropdown)}
              className="flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:border-peacock-200"
            >
              <span className={`flex h-2 w-2 rounded-full ${selectedResource === 'Auto Detect' ? 'bg-peacock-500' : 'bg-info-500'}`} />
              {selectedResource}
              <ChevronDown className="h-4 w-4 text-ink-300" />
            </button>
            {resourceDropdown && (
              <div className="absolute right-0 mt-1.5 w-44 animate-slide-down rounded-lg border border-ink-100 bg-white shadow-card-hover">
                {(['Auto Detect', 'Banking', 'Government', 'Company', 'Research'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => { setSelectedResource(r); setResourceDropdown(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-ink-50 ${
                      selectedResource === r ? 'font-medium text-peacock-600' : 'text-ink-500'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${r === 'Auto Detect' ? 'bg-peacock-500' : 'bg-info-500'}`} />
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-ink-50/30">
        <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {processing && <ProcessingIndicator />}
          <div ref={endRef} />
        </div>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && !processing && (
        <div className="border-t border-ink-100 bg-white px-4 py-3 lg:px-6">
          <div className="mx-auto flex max-w-4xl flex-wrap gap-2">
            {quickPrompts.map((qp) => (
              <button
                key={qp.label}
                onClick={() => handleSend(qp.text, qp.resource)}
                className="flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs font-medium text-ink-500 transition-all hover:border-peacock-200 hover:bg-peacock-50 hover:text-peacock-600"
              >
                <Sparkles className="h-3.5 w-3.5 text-peacock-400" />
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-ink-100 bg-white px-4 py-4 lg:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-end gap-2 rounded-xl border border-ink-200 bg-white p-2 transition-colors focus-within:border-peacock-300 focus-within:shadow-glow">
            <Lock className="mb-2.5 ml-2 h-4 w-4 shrink-0 text-peacock-400" />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Ask PrismGuard something..."
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent py-2 text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || processing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-peacock-600 text-white transition-all hover:bg-peacock-700 disabled:opacity-40 disabled:hover:bg-peacock-600"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-ink-300">
            PrismGuard filters and validates every prompt before routing to a connected resource.
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`mb-6 flex animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isUser ? 'bg-ink-100 text-ink-500' : 'bg-gradient-to-br from-peacock-500 to-peacock-700 text-white'
        }`}>
          {isUser ? <span className="text-xs font-semibold">AM</span> : <Shield className="h-4 w-4" />}
        </div>
        {/* Content */}
        <div className={`min-w-0 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? 'bg-peacock-600 text-white'
              : message.blocked
                ? 'border border-danger-100 bg-danger-50 text-ink-600'
                : 'border border-ink-100 bg-white text-ink-600 shadow-card'
          }`}>
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
          {/* Security check visualization */}
          {message.securityCheck && (
            <div className={`mt-2 w-full ${isUser ? '' : ''}`}>
              <SecurityCheckVisualization steps={message.securityCheck} blocked={message.blocked} resource={message.resource} />
            </div>
          )}
          {isUser && message.resource && (
            <span className="mt-1.5 text-[11px] text-ink-300">Routed to: {message.resource}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function SecurityCheckVisualization({ steps, blocked, resource }: { steps: SecurityCheckStep[]; blocked?: boolean; resource?: ResourceType }) {
  const allSteps = [
    { name: 'Prompt received', icon: Filter, status: 'passed' as const },
    ...steps.map(s => ({ name: s.name, icon: pipelineSteps.find(p => p.name === s.name)?.icon || ShieldCheck, status: s.status })),
    { name: resourceNames[resource || 'Banking'], icon: BrainCircuit, status: blocked ? 'blocked' as const : 'passed' as const },
    { name: 'Response', icon: Database, status: blocked ? 'processing' as const : 'passed' as const },
  ];

  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {allSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium ${
              step.status === 'passed' ? 'bg-success-50 text-success-600' :
              step.status === 'blocked' ? 'bg-danger-50 text-danger-600' :
              'bg-ink-100 text-ink-400'
            }`}>
              {step.status === 'passed' ? <CheckCircle2 className="h-3 w-3" /> :
               step.status === 'blocked' ? <XCircle className="h-3 w-3" /> :
               <div className="h-3 w-3 animate-pulse-soft rounded-full bg-current" />}
              {step.name}
            </div>
            {i < allSteps.length - 1 && (
              <div className={`h-3 w-4 ${step.status === 'passed' ? 'bg-success-200' : 'bg-ink-200'} rounded`} style={{ minHeight: '2px' }}>
                <div className="flex items-center">
                  <div className={`h-0.5 w-4 ${step.status === 'passed' ? 'bg-success-300' : 'bg-ink-200'}`} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {blocked && (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-danger-100 bg-white px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-danger-500" />
          <div>
            <p className="text-xs font-semibold text-danger-600">Prompt blocked</p>
            <p className="text-[11px] text-ink-400">Request denied by PrismGuard security layer</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessingIndicator() {
  return (
    <div className="mb-6 flex animate-fade-in justify-start">
      <div className="flex max-w-[85%] gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-peacock-500 to-peacock-700">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-card">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-pulse-soft rounded-full bg-peacock-400" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 animate-pulse-soft rounded-full bg-peacock-400" style={{ animationDelay: '200ms' }} />
            <div className="h-2 w-2 animate-pulse-soft rounded-full bg-peacock-400" style={{ animationDelay: '400ms' }} />
          </div>
          <span className="text-xs text-ink-400">PrismGuard is analyzing your prompt...</span>
        </div>
      </div>
    </div>
  );
}
