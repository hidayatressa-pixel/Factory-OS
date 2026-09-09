// Andon Alarm & Plant Escalation System
// 4-Channel Operator Call, Response Timers, TV Plant Mode & Industrial Lifecycle

import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Plus,
  Tv,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Wrench,
  Layers,
  ShieldAlert,
  Users,
  Maximize2,
  Minimize2,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useData } from '../../core/data/DataContext';
import { useAudit } from '../../core/audit/AuditContext';
import { useAuth } from '../../core/auth/AuthContext';
import {
  AndonCall,
  AndonStatus,
  AndonCallType,
  ManufacturingLine,
} from '../../types';
import { getNextAndonStatus } from '../../core/tests/businessLogic';

interface AndonPageProps {
  selectedLineId: string;
}

export const AndonPage: React.FC<AndonPageProps> = ({ selectedLineId }) => {
  const { andonRepo, masterDataRepo, dataVersion, notifyDataChanged } = useData();
  const { recordAudit } = useAudit();
  const { currentUser, currentRole, checkPermission } = useAuth();

  const [calls, setCalls] = useState<AndonCall[]>([]);
  const [lines, setLines] = useState<ManufacturingLine[]>([]);
  const [isTvMode, setIsTvMode] = useState(false);

  // Trigger Call Modal
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedLineForCall, setSelectedLineForCall] = useState(
    selectedLineId !== 'ALL' ? selectedLineId : 'line-01'
  );
  const [selectedType, setSelectedType] = useState<AndonCallType>('LEADER');
  const [stationName, setStationName] = useState('Station 1');
  const [description, setDescription] = useState('');

  // Advance Lifecycle Modal
  const [selectedCall, setSelectedCall] = useState<AndonCall | null>(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    async function loadAndonData() {
      const [allCalls, allLines] = await Promise.all([
        andonRepo.getCalls(),
        masterDataRepo.getLines(),
      ]);
      setCalls(allCalls);
      setLines(allLines);
    }
    loadAndonData();
  }, [dataVersion, andonRepo, masterDataRepo]);

  const filteredCalls = selectedLineId === 'ALL'
    ? calls
    : calls.filter((c) => c.lineId === selectedLineId);

  const activeCalls = filteredCalls.filter((c) => c.status !== 'CLOSED');
  const closedCalls = filteredCalls.filter((c) => c.status === 'CLOSED');

  // Trigger new Andon Call
  const handleTriggerAndon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const line = lines.find((l) => l.id === selectedLineForCall) || lines[0];

    try {
      const created = await andonRepo.createCall({
        lineId: line.id,
        lineName: line.name,
        stationOrMachine: stationName,
        type: selectedType,
        description,
        operatorId: currentUser?.id || 'usr-001',
        operatorName: currentUser?.name || 'Operator',
      });

      recordAudit({
        action: 'CREATE',
        module: 'andon',
        entity: 'AndonCall',
        entityId: created.callNumber,
        oldValue: null,
        newValue: `Type: ${selectedType}, Line: ${line.code}, Station: ${stationName}`,
        reason: description,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowCallModal(false);
      setDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  // Advance Andon Status Lifecycle
  const handleAdvanceStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCall) return;

    const next = getNextAndonStatus(selectedCall.status);
    if (!next) return;

    try {
      const updated = await andonRepo.advanceStatus(
        selectedCall.id,
        next,
        currentUser ? { id: currentUser.id, name: currentUser.name } : undefined,
        actionNotes
      );

      recordAudit({
        action: 'STATUS_CHANGE',
        module: 'andon',
        entity: 'AndonCall',
        entityId: selectedCall.callNumber,
        oldValue: selectedCall.status,
        newValue: next,
        reason: actionNotes || `Andon progressed to ${next}`,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowAdvanceModal(false);
      setSelectedCall(null);
      setActionNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const getCallTypeStyle = (type: AndonCallType) => {
    switch (type) {
      case 'LEADER':
        return { color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40', icon: Users };
      case 'MACHINE':
        return { color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/40', icon: Wrench };
      case 'MATERIAL':
        return { color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/40', icon: Layers };
      case 'QUALITY':
        return { color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/40', icon: ShieldAlert };
    }
  };

  return (
    <div className={`space-y-6 ${isTvMode ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : 'pb-12'}`}>
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BellRing className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Visual Shop-Floor Escalation
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Andon Alarm & Escalation System
          </h2>
          <p className="text-xs text-slate-400">
            Real-time 4-channel operator calling, response SLA timers, and shop-floor TV display board
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTvMode(!isTvMode)}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors border border-slate-700"
          >
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>{isTvMode ? 'Exit TV Mode' : 'Shop-Floor TV Mode'}</span>
          </button>

          <button
            onClick={() => setShowCallModal(true)}
            disabled={!checkPermission('andon:create_call')}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow transition-colors disabled:opacity-40"
          >
            <AlertOctagon className="w-4 h-4" /> Trigger Andon Call
          </button>
        </div>
      </div>

      {/* Active Andon Alarms Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Active Escalation Calls ({activeCalls.length})</span>
          </h3>
        </div>

        {activeCalls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCalls.map((call) => {
              const typeCfg = getCallTypeStyle(call.type);
              const Icon = typeCfg.icon;

              return (
                <div
                  key={call.id}
                  className="bg-slate-900 border-2 border-rose-500/50 hover:border-rose-500 rounded-xl p-5 flex flex-col justify-between shadow-lg transition-all"
                >
                  <div>
                    {/* Call Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg border ${typeCfg.bg} ${typeCfg.color}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-400 block">
                            {call.callNumber}
                          </span>
                          <span className={`font-bold text-sm ${typeCfg.color}`}>
                            {call.type} CALL
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={call.status} size="sm" />
                    </div>

                    <h4 className="font-bold text-base text-white mb-1">
                      {call.lineName}
                    </h4>
                    <p className="text-xs text-amber-300 font-mono mb-2">
                      Station: {call.stationOrMachine}
                    </p>
                    <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-relaxed mb-3">
                      {call.description}
                    </p>

                    {/* Timestamps */}
                    <div className="space-y-1 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Triggered:</span>
                        <span className="text-slate-200">
                          {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {call.acknowledgedAt && (
                        <div className="flex justify-between">
                          <span>Ack Time:</span>
                          <span className="text-cyan-300">
                            {new Date(call.acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      {call.arrivedAt && (
                        <div className="flex justify-between">
                          <span>Arrival Time:</span>
                          <span className="text-emerald-300">
                            {new Date(call.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions to advance lifecycle */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      By: <strong className="text-slate-300">{call.operatorName}</strong>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedCall(call);
                        setShowAdvanceModal(true);
                      }}
                      disabled={!checkPermission('andon:acknowledge') && !checkPermission('andon:arrive') && !checkPermission('andon:resolve') && !checkPermission('andon:close')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition-colors disabled:opacity-40"
                    >
                      <span>Advance to {getNextAndonStatus(call.status)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-sm text-white">All Clear — No Active Andon Interlocking Calls</p>
            <p className="text-xs text-slate-400 mt-1">Shop-floor lines running without open emergency escalations</p>
          </div>
        )}
      </div>

      {/* Historic Closed Andon Calls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Andon Call Resolution History & SLA Duration</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-3">Call #</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Line & Station</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-3">Responder</th>
                <th className="py-3 px-3">Resolution Countermeasure</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {closedCalls.map((c) => (
                <tr key={c.id} className="hover:bg-slate-850 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                    {c.callNumber}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {c.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-white">
                    {c.lineName} - {c.stationOrMachine}
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-slate-300">
                    {c.description}
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {c.operatorName}
                  </td>
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap font-medium">
                    {c.responderName || 'Resolved'}
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-emerald-300">
                    {c.notes || 'Countermeasure completed'}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <StatusBadge status="CLOSED" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Trigger Andon Call */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Trigger Emergency Andon Call
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select channel type. This instantly alerts supervisors, maintenance, or warehouse on the shop-floor board.
            </p>

            <form onSubmit={handleTriggerAndon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Line
                </label>
                <select
                  value={selectedLineForCall}
                  onChange={(e) => setSelectedLineForCall(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                >
                  {lines.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.code} - {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Call Channel Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['LEADER', 'MACHINE', 'MATERIAL', 'QUALITY'] as AndonCallType[]).map((t) => {
                    const cfg = getCallTypeStyle(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedType(t)}
                        className={`p-3 rounded-lg border text-xs font-bold text-left transition-all ${
                          selectedType === t
                            ? `${cfg.bg} ${cfg.color} border-current ring-1 ring-amber-400 shadow`
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-mono">{t}</div>
                        <div className="text-[10px] font-normal opacity-80 mt-0.5">
                          {t === 'LEADER' && 'Assistance / Safety'}
                          {t === 'MACHINE' && 'Breakdown / Jam'}
                          {t === 'MATERIAL' && 'Buffer Depleted'}
                          {t === 'QUALITY' && 'Abnormal Defect'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Station or Machine
                </label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="e.g. Station 2 Flange Press"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Call <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe abnormal situation requiring immediate assistance"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow"
                >
                  Broadcast Andon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Advance Andon Lifecycle */}
      {showAdvanceModal && selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Advance Andon: {selectedCall.callNumber}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Current: <span className="font-mono text-amber-300 font-bold">{selectedCall.status}</span> → Next:{' '}
              <span className="font-mono text-emerald-400 font-bold">
                {getNextAndonStatus(selectedCall.status)}
              </span>
            </p>

            <form onSubmit={handleAdvanceStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Action Taken / Notes
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g. Arrived on station, inspecting guide pin alignment..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow"
                >
                  Confirm Stage Advancement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
