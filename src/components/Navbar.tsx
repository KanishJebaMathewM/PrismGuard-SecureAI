import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Shield,
  ShieldCheck,
  LayoutDashboard,
  MessageSquare,
  Database,
  FlaskConical,
  BookOpen,
  BrainCircuit,
  ShieldAlert,
  Settings,
  LogOut,
  User,
  CheckCircle2,
  AlertTriangle,
  Brain,
} from 'lucide-react';
import type { Screen } from '@/types';

interface NavbarProps {
  current: Screen;
  onNavigate: (screen: Screen) => void;
}

const navItems: { label: string; screen: Screen; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', screen: 'dashboard', icon: LayoutDashboard },
  { label: 'Chat', screen: 'chat', icon: MessageSquare },
  { label: 'Resources', screen: 'resources', icon: Database },
  { label: 'Attack Lab', screen: 'attack-lab', icon: FlaskConical },
  { label: 'Research', screen: 'research', icon: BookOpen },
  { label: 'Models', screen: 'models', icon: BrainCircuit },
  { label: 'Admin', screen: 'admin-review', icon: ShieldAlert },
];

export function Navbar({ current, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const notifications = [
    { icon: ShieldAlert, text: 'Banking prompt blocked', detail: 'Prompt injection detected', time: '2 min ago', color: 'text-danger-500' },
    { icon: AlertTriangle, text: 'New admin review required', detail: 'Suspicious prompt flagged', time: '5 min ago', color: 'text-warning-500' },
    { icon: Brain, text: 'Banking model retraining completed', detail: 'v2.4 deployed successfully', time: '1 hour ago', color: 'text-peacock-600' },
  ];

  const searchResults = [
    { label: 'Banking Systems', type: 'Resource', screen: 'resources' as Screen },
    { label: 'Banking Security Model v2.4', type: 'Model', screen: 'models' as Screen },
    { label: 'Prompt Injection Attack', type: 'Attack Lab', screen: 'attack-lab' as Screen },
    { label: 'Prompt Injection Research', type: 'Research', screen: 'research' as Screen },
    { label: 'Admin Review Queue', type: 'Admin', screen: 'admin-review' as Screen },
    { label: 'Security Activity Logs', type: 'Logs', screen: 'logs' as Screen },
    { label: 'Training & Learning', type: 'Training', screen: 'training' as Screen },
    { label: 'Settings', type: 'Settings', screen: 'settings' as Screen },
  ];

  function handleNav(screen: Screen) {
    onNavigate(screen);
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-peacock-500 to-peacock-700 shadow-sm">
              <Shield className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl border border-peacock-300/30" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight text-ink-700">PrismGuard</span>
              <span className="hidden text-[10px] font-medium text-peacock-600 sm:block">Secure. Filter. Route. Protect.</span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => {
              const isActive = current === item.screen ||
                (item.screen === 'resources' && current === 'resource-detail') ||
                (item.screen === 'research' && current === 'research-detail') ||
                (item.screen === 'models' && current === 'model-detail') ||
                (item.screen === 'admin-review' && (current === 'prompt-review' || current === 'training' || current === 'logs' || current === 'settings'));
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNav(item.screen)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-peacock-50 text-peacock-700'
                      : 'text-ink-400 hover:bg-ink-50 hover:text-ink-600'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Security status */}
            <div className="hidden items-center gap-2 rounded-lg border border-success-100 bg-success-50 px-3 py-1.5 md:flex">
              <ShieldCheck className="h-4 w-4 text-success-500" />
              <span className="text-xs font-medium text-success-600">All Systems Secure</span>
            </div>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-600"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-600"
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right animate-slide-down rounded-xl border border-ink-100 bg-white shadow-card-hover">
                  <div className="border-b border-ink-100 px-4 py-3">
                    <p className="text-sm font-semibold text-ink-700">3 new security events</p>
                  </div>
                  <div className="divide-y divide-ink-100">
                    {notifications.map((n, i) => (
                      <div key={i} className="flex gap-3 px-4 py-3 transition-colors hover:bg-ink-50">
                        <n.icon className={`mt-0.5 h-5 w-5 shrink-0 ${n.color}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-ink-600">{n.text}</p>
                          <p className="text-xs text-ink-400">{n.detail}</p>
                          <p className="mt-0.5 text-[11px] text-ink-300">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-ink-100 px-4 py-2.5">
                    <button onClick={() => { handleNav('logs'); setNotifOpen(false); }} className="text-xs font-medium text-peacock-600 hover:text-peacock-700">
                      View all activity
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            <div ref={userRef} className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-ink-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-peacock-500 to-peacock-700 text-xs font-semibold text-white">
                  AM
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-[13px] font-semibold leading-none text-ink-600">Admin</p>
                  <p className="mt-0.5 text-[11px] leading-none text-ink-300">Security Admin</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-ink-300 sm:block" />
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right animate-slide-down rounded-xl border border-ink-100 bg-white shadow-card-hover">
                  <div className="border-b border-ink-100 px-4 py-3">
                    <p className="text-sm font-semibold text-ink-700">Admin</p>
                    <p className="text-xs text-ink-400">admin@prismguard.security</p>
                  </div>
                  <div className="py-1.5">
                    <button onClick={() => { handleNav('settings'); setUserOpen(false); }} className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-ink-500 transition-colors hover:bg-ink-50">
                      <Settings className="h-4 w-4" /> Settings
                    </button>
                    <button className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-ink-500 transition-colors hover:bg-ink-50">
                      <User className="h-4 w-4" /> Profile
                    </button>
                    <div className="my-1 border-t border-ink-100" />
                    <button className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-danger-500 transition-colors hover:bg-danger-50">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="animate-slide-down border-t border-ink-100 bg-white lg:hidden">
            <div className="mx-auto max-w-[1400px] px-4 py-3">
              {navItems.map((item) => {
                const isActive = current === item.screen ||
                  (item.screen === 'resources' && current === 'resource-detail') ||
                  (item.screen === 'research' && current === 'research-detail') ||
                  (item.screen === 'models' && current === 'model-detail') ||
                  (item.screen === 'admin-review' && (current === 'prompt-review' || current === 'training' || current === 'logs' || current === 'settings'));
                return (
                  <button
                    key={item.screen}
                    onClick={() => handleNav(item.screen)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive ? 'bg-peacock-50 text-peacock-700' : 'text-ink-400 hover:bg-ink-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-success-100 bg-success-50 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-success-500" />
                <span className="text-xs font-medium text-success-600">All Systems Secure</span>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink-900/30 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="mt-24 w-full max-w-xl animate-scale-in px-4" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card-hover">
              <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
                <Search className="h-5 w-5 text-ink-300" />
                <input
                  autoFocus
                  placeholder="Search prompts, resources, models, incidents, research..."
                  className="flex-1 bg-transparent text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none"
                />
                <kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-400">ESC</kbd>
              </div>
              <div className="max-h-80 overflow-y-auto py-2">
                <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-300">Quick access</p>
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { handleNav(r.screen); setSearchOpen(false); }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-ink-50"
                  >
                    <span className="text-sm text-ink-600">{r.label}</span>
                    <span className="rounded-md bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-400">{r.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
