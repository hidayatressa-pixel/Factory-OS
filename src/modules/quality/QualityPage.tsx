// Quality Management Module
// PICA Architecture, Defect Lifecycle, Pareto Analysis & Containment Actions

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  BarChart3,
  FileText,
  Search,
  CheckCheck,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useData } from '../../core/data/DataContext';
import { useAudit } from '../../core/audit/AuditContext';
import { useAuth } from '../../core/auth/AuthContext';
import {
  QualityDefect,
  DefectLifecycle,
  ManufacturingLine,
  Part,
} from '../../types';

interface QualityPageProps {
  selectedLineId: string;
}

export const QualityPage: React.FC<QualityPageProps> = ({ selectedLineId }) => {
  const { qualityRepo, masterDataRepo, dataVersion, notifyDataChanged } = useData();
  const { recordAudit } = useAudit();
  const { currentUser, currentRole, checkPermission } = useAuth();

  const [defects, setDefects] = useState<QualityDefect[]>([]);
  const [pareto, setPareto] = useState<Array<{ category: string; count: number; percentage: number }>>([]);
  const [lines, setLines] = useState<ManufacturingLine[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<QualityDefect | null>(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

  // Filter
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form State for new defect
  const [newPartId, setNewPartId] = useState('');
  const [newLineId, setNewLineId] = useState(selectedLineId !== 'ALL' ? selectedLineId : 'line-01');
  const [newProcess, setNewProcess] = useState('');
  const [newCategory, setNewCategory] = useState<'DIMENSION' | 'COSMETIC' | 'FUNCTIONAL' | 'ASSEMBLY' | 'CONTAMINATION' | 'OTHER'>('DIMENSION');
  const [newDescription, setNewDescription] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newEvidence, setNewEvidence] = useState('');

  // Form State for advance lifecycle
  const [nextLifecycleStatus, setNextLifecycleStatus] = useState<DefectLifecycle>('CONTAINMENT');
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    async function loadQualityData() {
      const [allDefects, pStats, allLines, allParts] = await Promise.all([
        qualityRepo.getDefects(),
        qualityRepo.getParetoStats(),
        masterDataRepo.getLines(),
        masterDataRepo.getParts(),
      ]);
      setDefects(allDefects);
      setPareto(pStats);
      setLines(allLines);
      setParts(allParts);
      if (allParts.length > 0 && !newPartId) {
        setNewPartId(allParts[0].id);
      }
    }
    loadQualityData();
  }, [dataVersion, qualityRepo, masterDataRepo, newPartId]);

  const filteredDefects = defects.filter((d) => {
    if (selectedLineId !== 'ALL' && d.lineId !== selectedLineId) return false;
    if (categoryFilter !== 'ALL' && d.category !== categoryFilter) return false;
    return true;
  });

  const totalDefectivePieces = defects.reduce((sum, d) => sum + d.quantity, 0);
  const openCount = defects.filter((d) => d.status !== 'CLOSED').length;
  const closedCount = defects.filter((d) => d.status === 'CLOSED').length;

  const handleCreateDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    const selectedPart = parts.find((p) => p.id === newPartId) || parts[0];

    try {
      const created = await qualityRepo.createDefect({
        lineId: newLineId,
        processName: newProcess || 'Inspection Station',
        partId: selectedPart.id,
        partNumber: selectedPart.partNumber,
        category: newCategory,
        description: newDescription,
        quantity: Number(newQty),
        evidenceNotes: newEvidence,
        picId: currentUser?.id || 'usr-005',
        picName: currentUser?.name || 'Rian Kurniawan (QA)',
      });

      recordAudit({
        action: 'CREATE',
        module: 'quality',
        entity: 'QualityDefect',
        entityId: created.defectNumber,
        oldValue: null,
        newValue: `Part: ${created.partNumber}, Qty: ${created.quantity}, Cat: ${created.category}`,
        reason: created.description,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowCreateModal(false);
      setNewDescription('');
      setNewEvidence('');
      setNewQty(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceLifecycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDefect) return;

    const payload: {
      containmentAction?: string;
      countermeasure?: string;
      verificationNotes?: string;
    } = {};

    if (nextLifecycleStatus === 'CONTAINMENT') payload.containmentAction = actionNotes;
    if (nextLifecycleStatus === 'COUNTERMEASURE') payload.countermeasure = actionNotes;
    if (nextLifecycleStatus === 'VERIFICATION' || nextLifecycleStatus === 'CLOSED') payload.verificationNotes = actionNotes;

    try {
      const updated = await qualityRepo.advanceLifecycle(selectedDefect.id, nextLifecycleStatus, payload);

      recordAudit({
        action: 'STATUS_CHANGE',
        module: 'quality',
        entity: 'QualityDefect',
        entityId: selectedDefect.defectNumber,
        oldValue: selectedDefect.status,
        newValue: nextLifecycleStatus,
        reason: actionNotes || `Advanced defect stage to ${nextLifecycleStatus}`,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowAdvanceModal(false);
      setSelectedDefect(null);
      setActionNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const LIFECYCLE_STAGES: DefectLifecycle[] = [
    'OPEN',
    'INVESTIGATING',
    'CONTAINMENT',
    'COUNTERMEASURE',
    'VERIFICATION',
    'CLOSED',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
              Zero Defect Assurance
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Quality Management (PICA & Pareto)
          </h2>
          <p className="text-xs text-slate-400">
            Problem, Identification, Containment & Action defect lifecycle tracking with Pareto root-cause breakdown
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!checkPermission('quality:create_defect')}
          className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Log Defect Incident
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Active Non-Conformances</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {openCount} <span className="text-xs font-normal text-rose-400">Under Action</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires engineering containment/PICA</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Total Scrap / Reject Parts</span>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            {totalDefectivePieces} <span className="text-xs font-normal text-slate-400">pcs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all registered defect logs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Verified & Closed Cases</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {closedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Full countermeasure verification</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Top Failure Mode</span>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1 truncate">
            {pareto.length > 0 ? pareto[0].category : 'None'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {pareto.length > 0 ? `${pareto[0].percentage}% of all defect quantity` : 'No data'}
          </p>
        </div>
      </div>

      {/* Defect Pareto Analysis Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Defect Category Pareto Distribution (80/20 Rule)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Sorted by Total Defect Count
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {pareto.map((item) => (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 font-mono">{item.category}</span>
                <span className="font-mono text-slate-400">
                  <span className="text-white font-bold">{item.count} pcs</span> ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PICA Defect Lifecycle Kanban / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Active Defect Log & PICA Action Board
            </h3>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter defect categories"
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="DIMENSION">DIMENSION</option>
              <option value="FUNCTIONAL">FUNCTIONAL</option>
              <option value="ASSEMBLY">ASSEMBLY</option>
              <option value="COSMETIC">COSMETIC</option>
              <option value="CONTAMINATION">CONTAMINATION</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-3">Ticket</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Part & Line</th>
                <th className="py-3 px-3">Defect Description</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3">PICA Countermeasure</th>
                <th className="py-3 px-3">PIC</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDefects.map((d) => (
                <tr key={d.id} className="hover:bg-slate-850 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                    {d.defectNumber}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={d.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-white block">{d.partNumber}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{d.processName}</span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <span className="font-semibold text-slate-200 block truncate">{d.description}</span>
                    {d.evidenceNotes && (
                      <span className="text-[10px] text-slate-400 line-clamp-1 italic">
                        Evidence: {d.evidenceNotes}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-400 text-right whitespace-nowrap">
                    {d.quantity} pcs
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    {d.countermeasure ? (
                      <span className="text-emerald-300 line-clamp-2">{d.countermeasure}</span>
                    ) : d.containmentAction ? (
                      <span className="text-amber-300 line-clamp-2">Containment: {d.containmentAction}</span>
                    ) : (
                      <span className="text-slate-500 italic">No countermeasure logged yet</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {d.picName}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    {d.status !== 'CLOSED' && (
                      <button
                        onClick={() => {
                          setSelectedDefect(d);
                          // Determine next sensible status
                          const curIdx = LIFECYCLE_STAGES.indexOf(d.status);
                          const next = LIFECYCLE_STAGES[Math.min(curIdx + 1, LIFECYCLE_STAGES.length - 1)];
                          setNextLifecycleStatus(next);
                          setShowAdvanceModal(true);
                        }}
                        disabled={!checkPermission('quality:update_containment')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-[11px] border border-slate-700 transition-colors disabled:opacity-40"
                      >
                        Advance Stage →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Defect Incident */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Log Quality Non-Conformance (Defect)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Registers a defect into the shop-floor PICA lifecycle. PIC will be assigned for containment.
            </p>

            <form onSubmit={handleCreateDefect} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Part Number
                  </label>
                  <select
                    value={newPartId}
                    onChange={(e) => setNewPartId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none"
                  >
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.partNumber} ({p.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Production Line
                  </label>
                  <select
                    value={newLineId}
                    onChange={(e) => setNewLineId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    {lines.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code} - {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category (Pareto)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none"
                  >
                    <option value="DIMENSION">DIMENSION (Tolerance Out)</option>
                    <option value="FUNCTIONAL">FUNCTIONAL (Pressure/Leak)</option>
                    <option value="ASSEMBLY">ASSEMBLY (Flash/Torque)</option>
                    <option value="COSMETIC">COSMETIC (Scratch/Tarnish)</option>
                    <option value="CONTAMINATION">CONTAMINATION (Foreign Object)</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Defective Quantity (pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Process / Station Name
                </label>
                <input
                  type="text"
                  value={newProcess}
                  onChange={(e) => setNewProcess(e.target.value)}
                  placeholder="e.g. Station 2 Flange Stamping"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Defect Symptom & Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe failure mode, dimension deviation, or abnormal condition"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Evidence Notes / Inspection Report Ref
                </label>
                <input
                  type="text"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  placeholder="e.g. CMM Measurement Report #QA-0909 attached"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow"
                >
                  Save & Initiate PICA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Advance Defect Lifecycle */}
      {showAdvanceModal && selectedDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Advance Lifecycle: {selectedDefect.defectNumber}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Current Stage: <span className="font-mono text-amber-300 font-bold">{selectedDefect.status}</span>
            </p>

            <form onSubmit={handleAdvanceLifecycle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Target Lifecycle Stage
                </label>
                <select
                  value={nextLifecycleStatus}
                  onChange={(e) => setNextLifecycleStatus(e.target.value as DefectLifecycle)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
                >
                  {LIFECYCLE_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Action Taken / Containment / Countermeasure Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={`Provide engineering details for ${nextLifecycleStatus} stage...`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:outline-none"
                  required
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
                  Update Stage & Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
