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
import {
  bankingDB, bankingRegulations, interestRates,
  governmentDB, governmentPolicies,
  companyDB, financialReports, internalDocs,
  researchDB, datasets,
} from '@/database';
import type { ChatMessage, ResourceType, SecurityCheckStep } from '@/types';

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

const blockedKeywords = ['ignore previous', 'ignore all', 'reveal customer', 'reveal sensitive', 'export all', 'reveal all', 'bypass', 'admin mode', 'developer mode', 'grant me access', 'system prompt', 'jailbreak', 'salary', 'payroll'];

const quickPrompts = [
  { label: 'Get banking insights', text: 'What is the current interest rate for savings accounts?', resource: 'Banking' as ResourceType },
  { label: 'Check government policies', text: 'Show current government policy on data retention.', resource: 'Government' as ResourceType },
  { label: 'Search company resources', text: 'Find the latest quarterly revenue report.', resource: 'Company' as ResourceType },
  { label: 'Research public data', text: 'Find recent papers on quantum computing.', resource: 'Research' as ResourceType },
];

function queryDatabase(text: string, resource: ResourceType): string {
  const lower = text.toLowerCase();

  if (resource === 'Banking') {
    if (lower.includes('interest rate') || lower.includes('interest rates')) {
      return `Current Interest Rates (APY):

• Savings Accounts: ${interestRates.savings}%
• Checking Accounts: ${interestRates.checking}%
• Loan Products: ${interestRates.loan}%
• Investment Accounts: ${interestRates.investment}%

Rates effective as of today. Retrieved securely through the Banking Security Model.`;
    }

    if (lower.includes('regulation') || lower.includes('policy') || lower.includes('compliance')) {
      const list = bankingRegulations.map(r => `• ${r.title} (effective ${r.effectiveDate})\n  ${r.summary}`).join('\n\n');
      return `Banking Regulations & Policies:\n\n${list}\n\nRetrieved securely through the Banking Security Model.`;
    }

    // Account lookup — search by holder name
    const matchedAccounts = bankingDB.filter(acc =>
      lower.split(/\s+/).some(word => word.length > 3 && acc.holder.toLowerCase().includes(word))
    );
    if (lower.includes('account') && matchedAccounts.length > 0) {
      const list = matchedAccounts.map(acc =>
        `• ${acc.accountId} — ${acc.holder} | ${acc.accountType} | Branch: ${acc.branch} | Status: ${acc.status}`
      ).join('\n');
      return `Matching Accounts (non-sensitive fields only):\n\n${list}\n\nBalance and rate details require authenticated access. Retrieved securely through the Banking Security Model.`;
    }

    return `Banking System is ready. You can ask about:\n\n• Interest rates (savings, checking, loan, investment)\n• Banking regulations and compliance policies\n• Account lookup by holder name\n\nAll queries are routed through the Banking Security Model.`;
  }

  if (resource === 'Government') {
    // Classified/Confidential access attempt
    if (lower.includes('classified') || lower.includes('confidential') || lower.includes('secret')) {
      return `Access Denied.\n\nThe records you are querying are classified as Confidential or Classified. Access to these records requires elevated security clearance.\n\nIf you believe you have the required clearance, contact your system administrator.`;
    }

    if (lower.includes('policy') || lower.includes('retention') || lower.includes('foia') || lower.includes('privacy')) {
      const publicPolicies = governmentPolicies.filter(p => p.classification === 'Public');
      const list = publicPolicies.map(p => `• ${p.title}\n  ${p.details}`).join('\n\n');
      return `Public Government Policies:\n\n${list}\n\nRetrieved securely through the Government Security Model.`;
    }

    if (lower.includes('department') || lower.includes('record') || lower.includes('report')) {
      const accessible = governmentDB.filter(r => r.classification === 'Public' || r.classification === 'Internal');
      const list = accessible.map(r =>
        `• [${r.classification}] ${r.title} — ${r.department}\n  ${r.description} (Updated: ${r.lastUpdated})`
      ).join('\n\n');
      return `Government Records (Public & Internal):\n\n${list}\n\nClassified and Confidential records require elevated clearance. Retrieved securely through the Government Security Model.`;
    }

    return `Government Database is ready. You can ask about:\n\n• Government policies (data retention, FOIA, privacy)\n• Department records and reports\n• Public and Internal classification records\n\nClassified records require elevated clearance. All queries routed through the Government Security Model.`;
  }

  if (resource === 'Company') {
    if (lower.includes('revenue') || lower.includes('quarterly') || lower.includes('financial')) {
      const publicReports = financialReports.filter(r => r.public);
      const list = publicReports.map(r =>
        `• ${r.quarter}: $${(r.revenue / 1000000).toFixed(2)}M revenue | Growth: +${r.growth}% YoY (reported ${r.reportDate})`
      ).join('\n');
      return `Quarterly Financial Reports (Public):\n\n${list}\n\nRetrieved securely through the Company Security Model.`;
    }

    if (lower.includes('employee') && !lower.includes('salary') && !lower.includes('payroll')) {
      const activeEmployees = companyDB.filter(e => e.status !== 'Terminated');
      const list = activeEmployees.map(e =>
        `• ${e.name} — ${e.role}, ${e.department} (${e.status})`
      ).join('\n');
      return `Employee Directory (Active & On Leave):\n\n${list}\n\nSalary and compensation data is restricted. Retrieved securely through the Company Security Model.`;
    }

    if (lower.includes('document') || lower.includes('roadmap') || lower.includes('doc')) {
      const list = internalDocs.map(d =>
        `• ${d.title} [${d.sensitivity}] — Last updated: ${d.lastUpdated}`
      ).join('\n');
      return `Internal Document Index:\n\n${list}\n\nDocument contents require appropriate access permissions. Retrieved securely through the Company Security Model.`;
    }

    return `Company Database is ready. You can ask about:\n\n• Quarterly revenue and financial reports\n• Employee directory (names, roles, departments)\n• Internal document index\n\nSalary and payroll data is restricted. All queries routed through the Company Security Model.`;
  }

  if (resource === 'Research') {
    if (lower.includes('dataset') || lower.includes('data set')) {
      const openDatasets = datasets.filter(d => d.access === 'Open');
      const list = openDatasets.map(d =>
        `• ${d.name} — ${d.size} | ${d.records.toLocaleString()} records\n  ${d.description}`
      ).join('\n\n');
      return `Open Research Datasets:\n\n${list}\n\nRestricted datasets require institutional access. Retrieved securely through the Research Security Model.`;
    }

    let papers = researchDB.filter(p => p.access === 'Open');

    if (lower.includes('quantum')) {
      papers = papers.filter(p => p.topic.includes('quantum'));
    } else if (lower.includes('ai') || lower.includes('safety') || lower.includes('alignment')) {
      papers = papers.filter(p => p.topic.includes('AI safety'));
    } else if (lower.includes('crypto') || lower.includes('encryption')) {
      papers = papers.filter(p => p.topic.includes('cryptography'));
    } else if (lower.includes('climate') || lower.includes('environment')) {
      papers = papers.filter(p => p.topic.includes('climate'));
    } else if (lower.includes('genomic') || lower.includes('crispr') || lower.includes('dna')) {
      papers = papers.filter(p => p.topic.includes('genomics'));
    }

    if (papers.length > 0 && (lower.includes('paper') || lower.includes('research') || lower.includes('find') || lower.includes('quantum') || lower.includes('ai') || lower.includes('crypto') || lower.includes('climate') || lower.includes('genomic'))) {
      const label = papers.length === researchDB.filter(p => p.access === 'Open').length
        ? 'Open-access research papers'
        : `papers matching your query`;
      const list = papers.map((p, i) =>
        `${i + 1}. "${p.title}" — ${p.authors.join(', ')} (${p.publishedDate.slice(0, 4)})\n   Abstract: ${p.abstract}\n   Citations: ${p.citations} | Access: ${p.access}`
      ).join('\n\n');
      return `Found ${papers.length} ${label}:\n\n${list}\n\nRetrieved securely through the Research Security Model.`;
    }

    return `Research Resources are ready. You can ask about:\n\n• Research papers (quantum, AI safety, cryptography, climate, genomics)\n• Open datasets\n• Specific topics or author searches\n\nRestricted papers require institutional access. All queries routed through the Research Security Model.`;
  }

  return 'Resource query processed securely through PrismGuard.';
}

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

  function isBlocked(text: string): { blocked: boolean; reason: string; layer: string } {
    const lower = text.toLowerCase();
    for (const kw of blockedKeywords) {
      if (lower.includes(kw)) {
        if (lower.includes('ignore previous') || lower.includes('ignore all') || lower.includes('system prompt') || lower.includes('jailbreak')) {
          return { blocked: true, reason: 'Potential prompt injection detected.', layer: 'Secure AI API Layer' };
        }
        if (lower.includes('reveal customer') || lower.includes('reveal sensitive') || lower.includes('reveal all') || lower.includes('export all')) {
          return { blocked: true, reason: 'Unauthorized data extraction attempt detected.', layer: 'PrismGuard Layer' };
        }
        if (lower.includes('bypass') || lower.includes('admin mode') || lower.includes('developer mode') || lower.includes('grant me access')) {
          return { blocked: true, reason: 'Privilege escalation or jailbreak attempt detected.', layer: 'PrismGuard Layer' };
        }
      }
    }
    return { blocked: false, reason: '', layer: '' };
  }

  async function handleSend(text: string, resource?: ResourceType) {
    if (!text.trim() || processing) return;
    setProcessing(true);

    const resourceType = resource || (selectedResource === 'Auto Detect' ? detectResource(text) : selectedResource);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, resource: resourceType };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    await new Promise((r) => setTimeout(r, 900));

    const check = isBlocked(text);
    if (check.blocked) {
      const steps: SecurityCheckStep[] = pipelineSteps.map((s, i) => {
        if (check.layer.includes(s.name)) return { name: s.name, status: 'blocked' };
        if (i < pipelineSteps.findIndex((s2) => check.layer.includes(s2.name))) return { name: s.name, status: 'passed' };
        return { name: s.name, status: 'processing' };
      });
      const blockedMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: `This prompt was blocked by PrismGuard.\n\nReason: ${check.reason}\nBlocked at: ${check.layer}`,
        securityCheck: steps,
        blocked: true,
        blockedReason: check.reason,
        blockedLayer: check.layer,
        resource: resourceType,
      };
      setMessages((prev) => [...prev, blockedMsg]);
    } else {
      const steps: SecurityCheckStep[] = pipelineSteps.map((s) => ({ name: s.name, status: 'passed' }));
      const responseMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: queryDatabase(text, resourceType),
        securityCheck: steps,
        resource: resourceType,
      };
      setMessages((prev) => [...prev, responseMsg]);
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
