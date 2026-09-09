// Shop-Floor Sidebar Navigation with RBAC Module Filtering
// FACTORY OS - One Platform for the Shop Floor

import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Gauge,
  ShieldAlert,
  Wrench,
  Layers,
  BellRing,
  BookOpen,
  Cpu,
  Repeat,
  Database,
  Users,
  KeyRound,
  History,
  Settings,
  GraduationCap,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { ModuleId, ModuleStatus } from '../../types';
import { useAuth } from '../../core/auth/AuthContext';

export interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  status: ModuleStatus;
  category: 'core' | 'operations' | 'intelligence' | 'management';
}

export const ALL_NAV_ITEMS: NavItem[] = [
  // Core
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, status: 'IMPLEMENTED', category: 'core' },
  { id: 'launcher' as ModuleId, label: 'Module Launcher', icon: Boxes, status: 'IMPLEMENTED', category: 'core' },

  // Operations Modules
  { id: 'production', label: 'Production', icon: Gauge, status: 'IMPLEMENTED', category: 'operations' },
  { id: 'quality', label: 'Quality Control', icon: ShieldAlert, status: 'IMPLEMENTED', category: 'operations' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, status: 'IMPLEMENTED', category: 'operations' },
  { id: 'material', label: 'Material & Kanban', icon: Layers, status: 'IMPLEMENTED', category: 'operations' },
  { id: 'andon', label: 'Andon System', icon: BellRing, status: 'IMPLEMENTED', category: 'operations' },

  // Intelligence & Poka-Yoke
  { id: 'knowledge', label: 'Knowledge Vault', icon: BookOpen, status: 'FOUNDATION ONLY', category: 'intelligence' },
  { id: 'poka-yoke', label: 'Digital Poka-Yoke', icon: Cpu, status: 'FOUNDATION ONLY', category: 'intelligence' },
  { id: 'handover', label: 'Shift Handover', icon: Repeat, status: 'FOUNDATION ONLY', category: 'intelligence' },
  { id: 'people', label: 'Skills & People', icon: GraduationCap, status: 'PLANNED', category: 'intelligence' },
  { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3, status: 'PLANNED', category: 'intelligence' },

  // Management & Audit
  { id: 'masterdata', label: 'Master Data', icon: Database, status: 'IMPLEMENTED', category: 'management' },
  { id: 'users', label: 'User Management', icon: Users, status: 'IMPLEMENTED', category: 'management' },
  { id: 'roles', label: 'Roles & RBAC', icon: KeyRound, status: 'IMPLEMENTED', category: 'management' },
  { id: 'audit', label: 'Activity & Audit Log', icon: History, status: 'IMPLEMENTED', category: 'management' },
  { id: 'settings', label: 'System Settings', icon: Settings, status: 'IMPLEMENTED', category: 'management' },
];

interface SidebarProps {
  currentModule: ModuleId;
  onSelectModule: (mod: ModuleId) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
}) => {
  const { checkModuleAccess, currentRole } = useAuth();

  const renderSection = (
    title: string,
    items: NavItem[]
  ) => {
    // Filter items based on RBAC check
    const accessibleItems = items.filter((item) => checkModuleAccess(item.id));

    if (accessibleItems.length === 0) return null;

    return (
      <div className="mb-5">
        <h4 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
          {title}
        </h4>
        <div className="space-y-1">
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={17}
                    className={`shrink-0 ${
                      isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span className="truncate text-left">{item.label}</span>
                </div>

                {item.status === 'FOUNDATION ONLY' && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight shrink-0 ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    Found.
                  </span>
                )}

                {item.status === 'PLANNED' && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight shrink-0 ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    Plan
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-hidden">
      <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
        {renderSection(
          'Core Navigation',
          ALL_NAV_ITEMS.filter((i) => i.category === 'core')
        )}
        {renderSection(
          'Operations Modules',
          ALL_NAV_ITEMS.filter((i) => i.category === 'operations')
        )}
        {renderSection(
          'Intelligence & Rules',
          ALL_NAV_ITEMS.filter((i) => i.category === 'intelligence')
        )}
        {renderSection(
          'Governance & Master',
          ALL_NAV_ITEMS.filter((i) => i.category === 'management')
        )}
      </div>

      {/* Footer / System Status */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span className="font-mono font-medium text-slate-400">v0.9.4 Core</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>
        <div className="text-[10px] text-slate-600 truncate mt-0.5">
          Role: <span className="text-amber-400/90 font-mono uppercase">{currentRole}</span>
        </div>
      </div>
    </aside>
  );
};
