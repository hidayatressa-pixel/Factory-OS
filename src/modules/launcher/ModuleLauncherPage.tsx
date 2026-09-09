// Module Launcher Catalog
// FACTORY OS - One Platform for the Shop Floor
// Modular architecture allowing independent enabling, upgrading, and licensing

import React, { useState } from 'react';
import {
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
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { ModuleId, ModuleStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../core/auth/AuthContext';

interface ModuleLauncherProps {
  onSelectModule: (mod: ModuleId) => void;
}

interface ModuleCardItem {
  id: ModuleId;
  name: string;
  tagline: string;
  description: string;
  status: ModuleStatus;
  category: 'operations' | 'intelligence' | 'governance';
  icon: React.ComponentType<{ className?: string; size?: number }>;
  capabilities: string[];
}

const MODULE_CATALOG: ModuleCardItem[] = [
  // Operations
  {
    id: 'production',
    name: 'Production Operations',
    tagline: 'Target vs Actual, Takt Time & Hourly Output',
    description: 'Real-time shop-floor execution tracking, takt pacing, line status state machine, downtime event capture, and output reporting.',
    status: 'IMPLEMENTED',
    category: 'operations',
    icon: Gauge,
    capabilities: ['Hourly Tracking', 'Takt Pace', 'Downtime Log', 'Status Transitions'],
  },
  {
    id: 'quality',
    name: 'Quality Management (PICA)',
    tagline: 'Defect Containment, Countermeasure & Pareto',
    description: 'Structured 8D/PICA defect lifecycle from OPEN to CLOSED, containment actions, reject rate analytics, and category Pareto breakdown.',
    status: 'IMPLEMENTED',
    category: 'operations',
    icon: ShieldAlert,
    capabilities: ['PICA Lifecycle', 'Pareto Analysis', 'Containment Sign-off', 'Evidence Archive'],
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Work Orders',
    tagline: 'Breakdown Calls, Tech Dispatch & Downtime',
    description: 'Fast breakdown dispatch, arrival/repair timestamps, downtime duration logging, and MTTR/MTBF architecture metrics.',
    status: 'IMPLEMENTED',
    category: 'operations',
    icon: Wrench,
    capabilities: ['Breakdown Tickets', 'Tech Assignment', 'Downtime Chronology', 'MTTR / MTBF'],
  },
  {
    id: 'material',
    name: 'Material & Shop-Floor Kanban',
    tagline: 'Line-side Stock, Shortage Alerts & FIFO',
    description: 'Real-time line inventory monitoring, Kanban replenishment requests, shortage escalations, and FIFO lot sequence validation.',
    status: 'IMPLEMENTED',
    category: 'operations',
    icon: Layers,
    capabilities: ['Kanban Replenishment', 'Shortage Alarms', 'FIFO Lot Validation', 'WIP Tracking'],
  },
  {
    id: 'andon',
    name: 'Andon Alarm & Response',
    tagline: 'Visual Plant Escalation & Response Timers',
    description: 'Instant multi-channel operator calls (Leader, Machine, Material, Quality) with response SLA timestamping and TV plant display mode.',
    status: 'IMPLEMENTED',
    category: 'operations',
    icon: BellRing,
    capabilities: ['4-Channel Calls', 'Response SLA Timer', 'Shop-Floor TV Mode', 'Full Lifecycle'],
  },

  // Intelligence & Rule Engine
  {
    id: 'knowledge',
    name: 'Manufacturing Knowledge Vault',
    tagline: 'Symptom, Root Cause & Countermeasure Library',
    description: 'Preserves critical operational tribal knowledge across shifts with structured 5Why/symptom indexing and AI adapter interface.',
    status: 'FOUNDATION ONLY',
    category: 'intelligence',
    icon: BookOpen,
    capabilities: ['Structured Troubleshooting', 'Search by Symptom', 'AI Semantic Interface', 'Engineer Sign-off'],
  },
  {
    id: 'poka-yoke',
    name: 'Digital Poka-Yoke Engine',
    tagline: 'Software Interlocks & Digital Mistake Proofing',
    description: 'Rule engine for digital quality gates without touching code: duplicate barcode prevention, FIFO sequence check, and torque threshold validation.',
    status: 'FOUNDATION ONLY',
    category: 'intelligence',
    icon: Cpu,
    capabilities: ['IF-THEN Rule Engine', 'Duplicate Barcode Check', 'FIFO Enforcer', 'Hardware Adapter Ready'],
  },
  {
    id: 'handover',
    name: 'AI Shift Handover',
    tagline: 'Automated Shift Synthesis & Priority Handoff',
    description: 'Deterministic shift synthesis collecting achievements, line stops, open defects, and next shift priorities with AI LLM adapter readiness.',
    status: 'FOUNDATION ONLY',
    category: 'intelligence',
    icon: Repeat,
    capabilities: ['Automated Aggregation', 'Next Shift Priorities', 'Supervisor Sign-off', 'AI Summarizer Ready'],
  },
  {
    id: 'people',
    name: 'People & Skill Matrix',
    tagline: 'Operator Certification & Station Assignment',
    description: 'Station capability matrix, training certifications, and operator qualification gates for critical line processes.',
    status: 'PLANNED',
    category: 'intelligence',
    icon: GraduationCap,
    capabilities: ['Skill Levels 1-4', 'ILUO Matrix', 'Station Interlock', 'Recertification Schedule'],
  },
  {
    id: 'analytics',
    name: 'Plant Reports & Analytics',
    tagline: 'Long-term OEE, Pareto Trends & Scrap Cost',
    description: 'Enterprise operational reporting, historical trend curves, shift comparison benchmarks, and scrap cost analysis.',
    status: 'PLANNED',
    category: 'intelligence',
    icon: BarChart3,
    capabilities: ['Availability / Performance / Quality', 'Scrap Cost Breakdown', 'Shift Comparison', 'Export CSV/PDF'],
  },

  // Governance & Administration
  {
    id: 'masterdata',
    name: 'Shop-Floor Master Data',
    tagline: 'Lines, Machines, Parts & Process Steps',
    description: 'Centralized master data repository for plant hierarchy: lines, machine assets, part catalogs, and cycle time definitions.',
    status: 'IMPLEMENTED',
    category: 'governance',
    icon: Database,
    capabilities: ['Line Definitions', 'Machine Registry', 'Part Numbers', 'Cycle Times'],
  },
  {
    id: 'users',
    name: 'User Management',
    tagline: 'Shop-Floor Operators, Techs & Engineers',
    description: 'Management of shop-floor personnel, badge identification, department assignments, and line role mappings.',
    status: 'IMPLEMENTED',
    category: 'governance',
    icon: Users,
    capabilities: ['Badge Registry', 'Department Allocation', 'Line Assignment', 'Access Control'],
  },
  {
    id: 'roles',
    name: 'Roles & RBAC Matrix',
    tagline: '10 Granular Shop-Floor Roles & Permissions',
    description: 'Centralized Role-Based Access Control matrix ensuring operators, leaders, engineers, and managers only access authorized operations.',
    status: 'IMPLEMENTED',
    category: 'governance',
    icon: KeyRound,
    capabilities: ['10 Factory Roles', 'Granular Permissions', 'Route Protection', 'Audit Compliance'],
  },
  {
    id: 'audit',
    name: 'Activity & Audit Log',
    tagline: 'Immutable Traceability & Action History',
    description: 'Regulatory and operational audit trail logging every status change, defect creation, andon resolution, and parameter edit with user & reason.',
    status: 'IMPLEMENTED',
    category: 'governance',
    icon: History,
    capabilities: ['Immutable Trail', 'Before/After Diff', 'Reason Capture', 'User Attribution'],
  },
  {
    id: 'settings',
    name: 'System Settings',
    tagline: 'Shift Hours, Factory Config & Demo Mode',
    description: 'Factory operating parameters, shift schedule configuration, database adapter selection, and demo mode management.',
    status: 'IMPLEMENTED',
    category: 'governance',
    icon: Settings,
    capabilities: ['Shift Schedules', 'Demo Reset', 'Adapter Status', 'System Diagnostics'],
  },
];

export const ModuleLauncherPage: React.FC<ModuleLauncherProps> = ({ onSelectModule }) => {
  const { checkModuleAccess } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'operations' | 'intelligence' | 'governance'>('all');

  const filtered = MODULE_CATALOG.filter((m) => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Platform Architecture
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Factory OS Module Launcher
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Each module is architected with strict isolation and clean boundaries. Modules can be deployed, enabled, or upgraded independently without monolithic lock-in.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          {(['all', 'operations', 'intelligence', 'governance'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const Icon = item.icon;
          const hasAccess = checkModuleAccess(item.id);
          const isPlanned = item.status === 'PLANNED';

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!isPlanned) onSelectModule(item.id);
              }}
              className={`bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between transition-all group ${
                isPlanned
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:border-amber-500/50 hover:bg-slate-850 cursor-pointer shadow-sm'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Icon size={22} />
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                  {item.name}
                </h3>
                <p className="font-mono text-xs text-amber-400/90 font-medium mb-2">
                  {item.tagline}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Capabilities pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono uppercase text-slate-500">
                  Category: {item.category}
                </span>

                {!isPlanned ? (
                  <span className="text-amber-400 group-hover:text-amber-300 font-bold flex items-center gap-1">
                    Launch Module <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Roadmap Item</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
