import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Settings, 
  CreditCard, 
  LogOut, 
  Menu,
  X,
  Compass,
  FileCode2,
  Sparkles
} from 'lucide-react';
import { AppState } from '../types';
import { GapHunterLogo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  badge,
  active, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  badge?: string;
  active: boolean; 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-lumina-orange text-white shadow-[0_2px_12px_rgba(232,93,34,0.3)] font-semibold' 
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-zinc-400'}`} />
      <span className="tracking-tight">{label}</span>
    </div>
    {badge && (
      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-lumina-orange/15 text-lumina-orange'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // If on landing page, don't show the dashboard layout
  if (activeState === AppState.LANDING) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-lumina-dark flex text-white font-sans antialiased selection:bg-lumina-orange selection:text-white">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-lumina-surface border-r border-lumina-border transform transition-transform duration-200 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-lumina-border">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => {
              onNavigate(AppState.LANDING);
              setIsMobileMenuOpen(false);
            }}
          >
            <GapHunterLogo className="w-6 h-6" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold tracking-tight text-white group-hover:text-lumina-orange transition-colors">
                GapHunter
              </span>
              <span className="text-[10px] font-mono font-bold text-lumina-orange">
                SYS
              </span>
            </div>
          </div>
          <button 
            className="lg:hidden text-zinc-400 hover:text-white p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
              Opportunity Engine
            </div>
            <div className="space-y-1">
              <SidebarItem 
                icon={Search} 
                label="Competitor Scanner" 
                badge="AI"
                active={activeState === AppState.ANALYZER_INPUT || activeState === AppState.ANALYZING} 
                onClick={() => {
                  onNavigate(AppState.ANALYZER_INPUT);
                  setIsMobileMenuOpen(false);
                }}
              />
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Radar Dashboard" 
                active={activeState === AppState.DASHBOARD || activeState === AppState.INSIGHTS} 
                onClick={() => {
                  onNavigate(AppState.DASHBOARD);
                  setIsMobileMenuOpen(false);
                }}
              />
              <SidebarItem 
                icon={FileCode2} 
                label="Product Blueprints" 
                active={activeState === AppState.BLUEPRINT} 
                onClick={() => {
                  onNavigate(AppState.BLUEPRINT);
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
              Management
            </div>
            <div className="space-y-1">
              <SidebarItem 
                icon={CreditCard} 
                label="Subscription" 
                badge="Pro"
                active={activeState === AppState.SETTINGS} 
                onClick={() => {
                  onNavigate(AppState.SETTINGS);
                  setIsMobileMenuOpen(false);
                }}
              />
              <SidebarItem 
                icon={Settings} 
                label="Settings" 
                active={false} 
                onClick={() => {
                  onNavigate(AppState.SETTINGS);
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-lumina-border bg-lumina-surfaceSubtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-lumina-orange/20 border border-lumina-orange/40 flex items-center justify-center text-xs font-mono font-bold text-lumina-orange">
              GH
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Founder Studio</p>
              <p className="text-[11px] text-zinc-400 font-mono truncate">Lumina Tier · Live</p>
            </div>
            <button 
              title="Return to Home"
              onClick={() => onNavigate(AppState.LANDING)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col h-screen bg-lumina-dark">
        {/* Top Header */}
        <header className="h-16 border-b border-lumina-border flex items-center justify-between px-6 bg-lumina-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-1.5 rounded-lg border border-lumina-border text-zinc-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="text-lumina-orange font-bold">LUMINA SYS</span>
              <span>/</span>
              <span className="text-zinc-200 capitalize">
                {activeState.toLowerCase().replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate(AppState.ANALYZER_INPUT)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-lumina-orange text-white hover:bg-lumina-accent transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan Competitor</span>
            </button>
          </div>
        </header>
        
        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};