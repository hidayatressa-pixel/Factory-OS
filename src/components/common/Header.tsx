// Shop-Floor Header & Status Bar
// FACTORY OS - One Platform for the Shop Floor

import React, { useState, useEffect } from 'react';
import {
  Factory,
  Clock,
  BellRing,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  FlaskConical,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../core/auth/AuthContext';
import { RoleType } from '../../types';

interface HeaderProps {
  selectedLineId: string;
  onSelectLineId: (lineId: string) => void;
  onOpenTestModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLineId,
  onSelectLineId,
  onOpenTestModal,
}) => {
  const { currentUser, currentRole, switchRoleDirectly, loginAs, isDemoMode } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles: RoleType[] = [
    'OPERATOR',
    'LEADER',
    'SUPERVISOR',
    'PRODUCTION',
    'QUALITY',
    'ENGINEERING',
    'MAINTENANCE',
    'MATERIAL',
    'MANAGER',
    'ADMIN',
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Factory Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-wider text-lg text-white font-mono">
                FACTORY OS
              </span>
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  DEMO MODE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              One Platform for the Shop Floor
            </p>
          </div>
        </div>

        {/* Shop-Floor Context: Line & Shift */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400 font-medium mr-2">Line:</span>
            <select
              value={selectedLineId}
              onChange={(e) => onSelectLineId(e.target.value)}
              aria-label="Filter by Line"
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-800 text-white">All Lines (Plant Overview)</option>
              <option value="line-01" className="bg-slate-800 text-white">Line 1: Stamping Press (L-STP-01)</option>
              <option value="line-02" className="bg-slate-800 text-white">Line 2: Robotic Welding (L-WLD-02)</option>
              <option value="line-03" className="bg-slate-800 text-white">Line 3: Enclosure Assembly (L-ASY-03)</option>
              <option value="line-04" className="bg-slate-800 text-white">Line 4: Testing & Packing (L-TST-04)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-medium">Shift A</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-cyan-300 font-bold">{timeStr || '07:00:00'}</span>
          </div>
        </div>

        {/* Right Action & User / Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Test Suite Trigger */}
          <button
            onClick={onOpenTestModal}
            className="flex items-center gap-1.5 text-xs bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 px-3 py-1.5 rounded-lg transition-colors font-semibold"
            title="Execute Pure Business Logic Verification Suite"
          >
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Run Tests</span>
          </button>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-[11px]">
                {currentRole.slice(0, 2)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-white font-bold text-xs leading-none">
                  {currentUser?.name || 'Shop Floor User'}
                </div>
                <div className="text-[10px] text-amber-400 font-mono tracking-wider">
                  [{currentRole}]
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                    Role Simulation (RBAC Switcher)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Switch role to test centralized permissions
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {DEMO_USERS.map((usr) => (
                    <button
                      key={usr.id}
                      onClick={() => loginAs(usr.id)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800 transition-colors text-xs ${
                        currentUser?.id === usr.id ? 'bg-amber-500/10 text-amber-300 font-bold' : ''
                      }`}
                    >
                      <div>
                        <div className="text-white font-medium">{usr.name}</div>
                        <div className="text-[10px] text-slate-400">{usr.department}</div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {usr.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
