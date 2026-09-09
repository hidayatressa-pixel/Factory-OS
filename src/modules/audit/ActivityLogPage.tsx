// Activity & Audit Log Module
// Immutable Traceability for Status Changes, Downtime, Quality Defects & Parameter Edits

import React, { useState } from 'react';
import { History, Filter, Search, Download, ShieldCheck } from 'lucide-react';
import { useAudit } from '../../core/audit/AuditContext';
import { ModuleId, AuditAction } from '../../types';

export const ActivityLogPage: React.FC = () => {
  const { logs, clearAuditLogs } = useAudit();

  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((l) => {
    if (moduleFilter !== 'ALL' && l.module !== moduleFilter) return false;
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.userName.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        (l.entityId && l.entityId.toLowerCase().includes(q)) ||
        (l.reason && l.reason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const exportCsv = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Entity', 'EntityID', 'OldValue', 'NewValue', 'Reason'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      `"${l.userName}"`,
      l.role,
      l.action,
      l.module,
      l.entity,
      l.entityId || '',
      `"${String(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${String(l.newValue || '').replace(/"/g, '""')}"`,
      `"${String(l.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `factory_os_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Immutable Traceability
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Shop-Floor Activity & Audit Trail
          </h2>
          <p className="text-xs text-slate-400">
            Immutable audit record capturing every line status transition, defect containment, work order, and stock change
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-colors shadow"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Module Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Module:</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Modules</option>
              <option value="production">Production</option>
              <option value="quality">Quality</option>
              <option value="maintenance">Maintenance</option>
              <option value="material">Material</option>
              <option value="andon">Andon</option>
              <option value="knowledge">Knowledge</option>
              <option value="poka-yoke">Poka-Yoke</option>
              <option value="handover">Handover</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="STATUS_CHANGE">STATUS_CHANGE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        {/* Text Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by user, entity, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 w-64"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredLogs.length} audit records
          </span>
          <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Cryptographically Indexed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-[10px] text-slate-400 uppercase">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">User & Role</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Entity ID</th>
                <th className="py-3 px-3">Values (Old → New)</th>
                <th className="py-3 px-3">Mandatory Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-850">
                  <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-white block">{l.userName}</span>
                    <span className="text-[10px] font-mono text-amber-400">[{l.role}]</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        l.action === 'STATUS_CHANGE'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : l.action === 'CREATE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 uppercase text-[10px] whitespace-nowrap">
                    {l.module}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                    {l.entity}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-300 whitespace-nowrap">
                    {l.entityId || '-'}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs text-[11px] font-mono">
                    {l.oldValue && <span className="text-rose-400">{String(l.oldValue)} → </span>}
                    <span className="text-emerald-300 font-bold">{String(l.newValue)}</span>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs text-slate-300 italic text-[11px]">
                    {l.reason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
