import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Settings, 
  CreditCard, 
  LogOut, 
  Menu,
  X
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
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors duration-200 border-l-2 ${
      active 
        ? 'bg-white text-black border-white' 
        : 'text-gray-500 hover:text-white hover:bg-[#111] border-transparent'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-black' : 'text-gray-500 group-hover:text-white'}`} />
    <span className="tracking-wide">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // If on landing page, don't show the dashboard layout
  if (activeState === AppState.LANDING) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black flex text-white font-mono">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-black border-r border-[#333] transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center px-6 border-b border-[#333]">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate(AppState.LANDING)}>
              <GapHunterLogo className="w-6 h-6 text-white" />
              <span className="text-lg font-bold tracking-widest text-white uppercase">GapHunter</span>
            </div>
            <button 
              className="ml-auto lg:hidden text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-1">
            <div className="px-6 mb-3 text-xs font-bold text-gray-600 uppercase tracking-widest">
              Workspace
            </div>
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeState === AppState.DASHBOARD} 
              onClick={() => onNavigate(AppState.DASHBOARD)}
            />
            <SidebarItem 
              icon={Search} 
              label="New Analysis" 
              active={activeState === AppState.ANALYZER_INPUT || activeState === AppState.ANALYZING || activeState === AppState.INSIGHTS || activeState === AppState.BLUEPRINT} 
              onClick={() => onNavigate(AppState.ANALYZER_INPUT)}
            />

            <div className="px-6 mt-8 mb-3 text-xs font-bold text-gray-600 uppercase tracking-widest">
              Account
            </div>
            <SidebarItem 
              icon={CreditCard} 
              label="Billing" 
              active={activeState === AppState.SETTINGS} 
              onClick={() => onNavigate(AppState.SETTINGS)}
            />
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={false} 
              onClick={() => onNavigate(AppState.SETTINGS)}
            />
          </div>

          <div className="mt-auto p-6 border-t border-[#333]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black flex items-center justify-center text-xs font-bold text-white border border-[#333]">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate font-mono">PRO_PLAN_V1</p>
              </div>
              <LogOut className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" onClick={() => onNavigate(AppState.LANDING)} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col h-screen bg-black">
        <header className="lg:hidden h-16 border-b border-[#333] flex items-center justify-between px-4 bg-black">
          <div className="flex items-center space-x-2">
            <GapHunterLogo className="w-5 h-5 text-white" />
            <span className="text-lg font-bold text-white uppercase tracking-widest">GapHunter</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-gray-400" />
          </button>
        </header>
        
        <div className="flex-1 overflow-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};