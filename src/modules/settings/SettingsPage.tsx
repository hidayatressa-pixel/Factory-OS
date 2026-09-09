// System Settings & Factory Configuration
// FACTORY OS - One Platform for the Shop Floor

import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Clock,
  Server,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Factory,
} from 'lucide-react';
import { useData } from '../../core/data/DataContext';
import { useAuth } from '../../core/auth/AuthContext';

export const SettingsPage: React.FC = () => {
  const { resetAllDemoData } = useData();
  const { isDemoMode } = useAuth();
  const [plantName, setPlantName] = useState('Delta Plant #1 (Metal & Assembly Division)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Platform Configuration
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            System Settings & Shop-Floor Parameters
          </h2>
          <p className="text-xs text-slate-400">
            Shift scheduling, database persistence adapter status, and simulation settings
          </p>
        </div>
      </div>

      {/* Demo Mode Status Card */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500 text-slate-950 uppercase">
              DEMO MODE ACTIVE
            </span>
            <span className="text-xs text-slate-300">Deterministic Shop-Floor Data Engine</span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
            Factory OS is currently running in isolated Demo Mode. All modifications (output reports, status transitions, defect logs) are written to local browser storage without altering external production systems.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset all demo data back to factory initial state?')) {
              resetAllDemoData();
            }
          }}
          className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" /> Reset All Demo Data
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plant Settings Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
            <Factory className="w-4 h-4 text-amber-400" />
            <span>Manufacturing Facility Information</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Plant Facility Name
              </label>
              <input
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Timezone Standard
                </label>
                <input
                  type="text"
                  disabled
                  value="UTC+07:00 (Asia/Jakarta / WIB)"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Planned Operating Shifts
                </label>
                <input
                  type="text"
                  disabled
                  value="3 Shifts (24 Hours)"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Parameters Saved
                </span>
              ) : <span />}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
              >
                Update Parameters
              </button>
            </div>
          </form>
        </div>

        {/* Database & Adapter Readiness */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Storage & Adapter Architecture</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Repository Provider Layer</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Current: LocalStorage / Memory Decoupled Repositories
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Cloud Firestore Adapter</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Schema & Interfaces Ready in src/core/data/types.ts
                </div>
              </div>
              <span className="text-slate-400 font-bold text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                SWAPPABLE
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Hardware PLC / Sensor Connectors</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Modbus TCP / OPC UA / Barcode Scanner Stubs
                </div>
              </div>
              <span className="text-amber-400 font-bold text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                STUBBED
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">AI Language Model Service</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  IAiProvider Interface with Deterministic Fallback Engine
                </div>
              </div>
              <span className="text-cyan-300 font-bold text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                CONNECTED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
