// AI Shift Handover Module
// Automated Shop-Floor Shift Synthesis, Urgent Priorities & Supervisor Sign-off

import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileCheck,
  Calendar,
  Layers,
  Wrench,
  ShieldAlert,
  Gauge,
  BellRing,
} from 'lucide-react';
import { useData } from '../../core/data/DataContext';
import { useAudit } from '../../core/audit/AuditContext';
import { useAuth } from '../../core/auth/AuthContext';
import { ShiftHandover } from '../../types';

export const HandoverPage: React.FC = () => {
  const {
    shiftHandoverRepo,
    productionRepo,
    qualityRepo,
    maintenanceRepo,
    materialRepo,
    andonRepo,
    masterDataRepo,
    aiService,
    dataVersion,
    notifyDataChanged,
  } = useData();
  const { recordAudit } = useAudit();
  const { currentUser, currentRole, checkPermission } = useAuth();

  const [handovers, setHandovers] = useState<ShiftHandover[]>([]);
  const [selectedHandover, setSelectedHandover] = useState<ShiftHandover | null>(null);

  // New Handover Generator State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [outgoingShift, setOutgoingShift] = useState('Shift A');
  const [incomingShift, setIncomingShift] = useState('Shift B');
  const [previewSummary, setPreviewSummary] = useState('');
  const [previewPriorities, setPreviewPriorities] = useState<string[]>([]);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  useEffect(() => {
    async function loadHandovers() {
      const all = await shiftHandoverRepo.getHandovers();
      setHandovers(all);
      if (all.length > 0 && !selectedHandover) {
        setSelectedHandover(all[0]);
      }
    }
    loadHandovers();
  }, [dataVersion, shiftHandoverRepo, selectedHandover]);

  // Aggregate current operational data and run deterministic/AI synthesis
  const handleGenerateHandover = async () => {
    setIsSynthesizing(true);
    try {
      const [lines, orders, downtimes, defects, andons] = await Promise.all([
        masterDataRepo.getLines(),
        productionRepo.getOrders(),
        productionRepo.getDowntimes(),
        qualityRepo.getDefects(),
        andonRepo.getCalls(),
      ]);

      const line = lines[0] || { name: 'Main Assembly Line 01' };
      const totalTarget = orders.reduce((s, o) => s + o.targetQuantity, 0);
      const totalActual = orders.reduce((s, o) => s + o.actualQuantity, 0);
      const achievement = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 1000) / 10 : 92.4;

      const synthesized = await aiService.generateShiftHandoverSummary({
        lineName: line.name,
        shiftFrom: outgoingShift,
        shiftTo: incomingShift,
        achievementPct: achievement,
        actualQty: totalActual,
        targetQty: totalTarget,
        downtimes: downtimes.map((d) => ({ reason: d.description, duration: d.durationMinutes })),
        defects: defects.map((d) => ({ defect: d.description, qty: d.quantity })),
        openIssues: andons
          .filter((a) => a.status !== 'CLOSED')
          .map((a) => ({ title: `${a.stationOrMachine}: ${a.description}`, pic: a.responderName || 'Unassigned' })),
      });

      setPreviewSummary(synthesized.summaryText);
      setPreviewPriorities(synthesized.suggestedMitigations);
      setShowGeneratorModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCommitHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewSummary.trim()) return;

    try {
      const lines = await masterDataRepo.getLines();
      const lineId = lines.length > 0 ? lines[0].id : 'line-01';

      const created = await shiftHandoverRepo.generateDeterministicHandover({
        lineId,
        shiftFrom: outgoingShift,
        shiftTo: incomingShift,
        preparedBy: currentUser?.name || 'Shift Supervisor',
        preparedRole: currentRole,
      });

      // Update customized text and priorities if edited in modal
      created.generatedSummaryText = previewSummary;
      created.prioritiesForNextShift = previewPriorities;

      recordAudit({
        action: 'CREATE',
        module: 'handover',
        entity: 'ShiftHandover',
        entityId: created.handoverCode,
        oldValue: null,
        newValue: `${outgoingShift} → ${incomingShift}`,
        reason: 'Shift synthesis published and signed by outgoing supervisor',
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowGeneratorModal(false);
      setSelectedHandover(created);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledgeHandover = async (handoverId: string) => {
    try {
      const updated = await shiftHandoverRepo.signOffHandover(
        handoverId,
        currentUser?.name || 'Incoming Supervisor'
      );

      recordAudit({
        action: 'SIGN_OFF',
        module: 'handover',
        entity: 'ShiftHandover',
        entityId: updated.handoverCode,
        oldValue: 'PENDING_ACK',
        newValue: 'ACKNOWLEDGED',
        reason: 'Incoming shift supervisor confirmed and assumed operational responsibility',
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setSelectedHandover(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Repeat className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Shift Transition Continuity
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              FOUNDATION ONLY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            AI Shift Handover Synthesizer
          </h2>
          <p className="text-xs text-slate-400">
            Automatically aggregates production achievements, downtime, open defects, and prioritizes handover points
          </p>
        </div>

        <button
          onClick={handleGenerateHandover}
          disabled={isSynthesizing || !checkPermission('handover:generate')}
          className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow transition-colors disabled:opacity-40"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSynthesizing ? 'Aggregating Shift...' : 'Synthesize Handover'}</span>
        </button>
      </div>

      {/* Two Column Layout: Historical Handovers & Active Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Handover Reports List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3">
            Handover Archive & Log
          </h3>

          <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
            {handovers.map((h) => {
              const isSelected = selectedHandover?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedHandover(h)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-amber-400">
                      {h.handoverCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{h.date}</span>
                  </div>
                  <h4 className="font-bold text-white mb-1">
                    {h.shiftFrom} → {h.shiftTo}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Ach: <strong className="text-emerald-400">{h.productionAchievementPct}%</strong></span>
                    <span>Stops: <strong className="text-rose-400">{h.lineStopsCount}</strong></span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Out: {h.preparedBy}</span>
                    {h.acknowledgedBy ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold">Pending Ack</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Handover Detail Report */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {selectedHandover ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {selectedHandover.handoverCode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Handover Date: {selectedHandover.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedHandover.shiftFrom} to {selectedHandover.shiftTo}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Outgoing Supervisor: <strong className="text-slate-200">{selectedHandover.preparedBy}</strong> ({selectedHandover.preparedRole})
                </p>
              </div>

              {/* Aggregated Shop Floor Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Achievement</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {selectedHandover.productionAchievementPct}%
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Line Stops</span>
                  <span className="text-xl font-black font-mono text-rose-400">
                    {selectedHandover.lineStopsCount} ({selectedHandover.totalDowntimeMinutes}m)
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Open Issues</span>
                  <span className="text-xl font-black font-mono text-amber-400">
                    {selectedHandover.openIssues ? selectedHandover.openIssues.length : 0}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Shortages</span>
                  <span className="text-xl font-black font-mono text-orange-400">
                    {selectedHandover.materialShortages ? selectedHandover.materialShortages.length : 0}
                  </span>
                </div>
              </div>

              {/* Synthesized Narrative Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase font-mono mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Shift Operational Synthesis
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-mono">
                  {selectedHandover.generatedSummaryText}
                </p>
              </div>

              {/* Urgent Priorities for Next Shift */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-cyan-400 uppercase font-mono mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Immediate Incoming Priorities (First 60 Minutes)
                </h4>
                <ul className="space-y-2 text-xs text-slate-200 font-medium">
                  {selectedHandover.prioritiesForNextShift?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span className="leading-snug pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dual Sign-Off Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Incoming Acceptance:</span>
                  {selectedHandover.acknowledgedBy ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Acknowledged by {selectedHandover.acknowledgedBy} at {new Date(selectedHandover.signedOffAt || '').toLocaleTimeString()}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold">Awaiting Incoming Supervisor Sign-off</span>
                  )}
                </div>

                {!selectedHandover.acknowledgedBy && (
                  <button
                    onClick={() => handleAcknowledgeHandover(selectedHandover.id)}
                    disabled={!checkPermission('handover:sign_off')}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors disabled:opacity-40"
                  >
                    Accept & Assume Shift
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a shift handover report from the archive to review details.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Review & Commit Generated Handover */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Review AI Synthesized Shift Handover
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Review and edit the aggregated shift narrative before publishing for incoming shift sign-off.
            </p>

            <form onSubmit={handleCommitHandover} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Outgoing Shift
                  </label>
                  <input
                    type="text"
                    value={outgoingShift}
                    onChange={(e) => setOutgoingShift(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Incoming Shift
                  </label>
                  <input
                    type="text"
                    value={incomingShift}
                    onChange={(e) => setIncomingShift(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Synthesized Shift Narrative (Editable)
                </label>
                <textarea
                  rows={6}
                  value={previewSummary}
                  onChange={(e) => setPreviewSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Priorities for Incoming Shift
                </label>
                <div className="space-y-1.5">
                  {previewPriorities.map((item, idx) => (
                    <div key={idx} className="flex gap-2 text-xs">
                      <span className="font-mono text-cyan-400 font-bold">{idx + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const copy = [...previewPriorities];
                          copy[idx] = e.target.value;
                          setPreviewPriorities(copy);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow"
                >
                  Publish & Sign Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
