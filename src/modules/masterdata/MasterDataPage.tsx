// Shop-Floor Master Data Management
// Lines, Machines, Parts & Manufacturing Processes

import React, { useState, useEffect } from 'react';
import {
  Database,
  Factory,
  Cpu,
  Package,
  Layers,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useData } from '../../core/data/DataContext';
import { ManufacturingLine, Machine, Part } from '../../types';

export const MasterDataPage: React.FC = () => {
  const { masterDataRepo, dataVersion } = useData();

  const [tab, setTab] = useState<'lines' | 'machines' | 'parts'>('lines');
  const [lines, setLines] = useState<ManufacturingLine[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      const [l, m, p] = await Promise.all([
        masterDataRepo.getLines(),
        masterDataRepo.getMachines(),
        masterDataRepo.getParts(),
      ]);
      setLines(l);
      setMachines(m);
      setParts(p);
    }
    loadData();
  }, [dataVersion, masterDataRepo]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Plant Hierarchy & Assets
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Shop-Floor Master Data Catalog
          </h2>
          <p className="text-xs text-slate-400">
            Centralized registry for manufacturing lines, machine equipment, part numbers, and standard cycle times
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setTab('lines')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === 'lines' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lines ({lines.length})
          </button>
          <button
            onClick={() => setTab('machines')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === 'machines' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Machines ({machines.length})
          </button>
          <button
            onClick={() => setTab('parts')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === 'parts' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Parts ({parts.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        {tab === 'lines' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Factory className="w-4 h-4 text-amber-400" />
              <span>Manufacturing Production Lines</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lines.map((l) => (
                <div key={l.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400">{l.code}</span>
                      <StatusBadge status={l.status} size="sm" />
                    </div>
                    <h4 className="font-bold text-base text-white">{l.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Area: {l.area}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-mono text-slate-400">
                      <span>Takt Pace: <strong className="text-cyan-300">{l.taktTimeSec}s</strong></span>
                      <span>Target Rate: <strong className="text-emerald-400">{l.targetPacePerHour} pcs/hr</strong></span>
                      <span>Shift: <strong className="text-slate-200">{l.currentShift}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'machines' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Machinery Assets & Technical Specifications</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machines.map((m) => (
                <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400">{m.code}</span>
                      <StatusBadge status={m.status} size="sm" />
                    </div>
                    <h4 className="font-bold text-sm text-white">{m.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{m.model}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">SN: {m.serialNumber}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Interval: {m.maintenanceIntervalHours}h</span>
                    <span>Last: {m.lastMaintenanceDate || 'None'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'parts' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Finished Goods & Subassembly Part Catalog</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase">
                    <th className="py-3 px-3">Part Number</th>
                    <th className="py-3 px-3">Part Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Standard Cycle Time</th>
                    <th className="py-3 px-3">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {parts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-850">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">{p.partNumber}</td>
                      <td className="py-3 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-3 px-3 text-slate-400">{p.category}</td>
                      <td className="py-3 px-3 font-mono text-cyan-300">{p.standardCycleTimeSec} sec/pc</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
