// Production Module Foundation
// TARGET vs ACTUAL = ACHIEVEMENT %, Takt Time, Hourly Output, State Machine & Downtime

import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Play,
  AlertTriangle,
  Square,
  RefreshCw,
  PowerOff,
  Plus,
  Clock,
  CheckCircle2,
  AlertOctagon,
  History,
  TrendingUp,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useData } from '../../core/data/DataContext';
import { useAudit } from '../../core/audit/AuditContext';
import { useAuth } from '../../core/auth/AuthContext';
import {
  ManufacturingLine,
  ProductionOrder,
  LineDowntimeEvent,
  ProductionStatus,
} from '../../types';
import { calculateAchievement } from '../../core/tests/businessLogic';

interface ProductionPageProps {
  selectedLineId: string;
}

export const ProductionPage: React.FC<ProductionPageProps> = ({ selectedLineId }) => {
  const { masterDataRepo, productionRepo, dataVersion, notifyDataChanged } = useData();
  const { recordAudit } = useAudit();
  const { currentUser, currentRole, checkPermission } = useAuth();

  const [lines, setLines] = useState<ManufacturingLine[]>([]);
  const [activeLineId, setActiveLineId] = useState<string>(
    selectedLineId !== 'ALL' ? selectedLineId : 'line-01'
  );
  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [downtimes, setDowntimes] = useState<LineDowntimeEvent[]>([]);

  // Modals / Input States
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [outputQty, setOutputQty] = useState<number>(10);
  const [scrapQty, setScrapQty] = useState<number>(0);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ProductionStatus>('RUNNING');
  const [statusChangeReason, setStatusChangeReason] = useState<string>('');

  const [showDowntimeModal, setShowDowntimeModal] = useState(false);
  const [downtimeCategory, setDowntimeCategory] = useState<'MACHINE' | 'QUALITY' | 'MATERIAL' | 'CHANGEOVER' | 'OPERATIONAL'>('MACHINE');
  const [downtimeDuration, setDowntimeDuration] = useState<number>(15);
  const [downtimeDescription, setDowntimeDescription] = useState<string>('');

  useEffect(() => {
    if (selectedLineId !== 'ALL') {
      setActiveLineId(selectedLineId);
    }
  }, [selectedLineId]);

  useEffect(() => {
    async function loadData() {
      const [allLines, ord, dt] = await Promise.all([
        masterDataRepo.getLines(),
        productionRepo.getOrderByLineId(activeLineId),
        productionRepo.getDowntimes(activeLineId),
      ]);
      setLines(allLines);
      setOrder(ord);
      setDowntimes(dt);
    }
    loadData();
  }, [activeLineId, dataVersion, masterDataRepo, productionRepo]);

  const activeLine = lines.find((l) => l.id === activeLineId) || lines[0];

  const achievement = order ? calculateAchievement(order.actualQuantity, order.targetQuantity) : 0;
  const scrapRate = order && order.actualQuantity > 0
    ? Math.round((order.scrapQuantity / (order.actualQuantity + order.scrapQuantity)) * 1000) / 10
    : 0;

  // Handle reporting actual production output
  const handleReportOutput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      const updated = await productionRepo.reportActualOutput(order.id, Number(outputQty), Number(scrapQty));
      setOrder(updated);

      recordAudit({
        action: 'UPDATE',
        module: 'production',
        entity: 'ProductionOrder',
        entityId: order.orderNumber,
        oldValue: `Actual: ${order.actualQuantity}, Scrap: ${order.scrapQuantity}`,
        newValue: `Actual: ${updated.actualQuantity}, Scrap: ${updated.scrapQuantity}`,
        reason: `Reported +${outputQty} pcs output (+${scrapQty} scrap) on line ${activeLine?.name}`,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowOutputModal(false);
      setOutputQty(10);
      setScrapQty(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle changing production line status
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLine || !order) return;
    if (!statusChangeReason.trim()) return;

    try {
      const oldStatus = activeLine.status;
      await masterDataRepo.updateLineStatus(activeLine.id, targetStatus);
      await productionRepo.updateOrderStatus(order.id, targetStatus);

      recordAudit({
        action: 'STATUS_CHANGE',
        module: 'production',
        entity: 'ProductionLine',
        entityId: activeLine.code,
        oldValue: oldStatus,
        newValue: targetStatus,
        reason: statusChangeReason,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowStatusModal(false);
      setStatusChangeReason('');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle logging downtime
  const handleLogDowntime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLine) return;
    if (!downtimeDescription.trim()) return;

    try {
      const newDt = await productionRepo.logDowntime({
        lineId: activeLine.id,
        orderId: order?.id,
        startTime: new Date().toISOString(),
        durationMinutes: Number(downtimeDuration),
        reasonCategory: downtimeCategory,
        description: downtimeDescription,
        reportedBy: currentUser?.name || 'Operator',
      });

      recordAudit({
        action: 'CREATE',
        module: 'production',
        entity: 'LineDowntimeEvent',
        entityId: newDt.id,
        oldValue: null,
        newValue: `Category: ${downtimeCategory}, Duration: ${downtimeDuration}m`,
        reason: downtimeDescription,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      setDowntimes([newDt, ...downtimes]);
      notifyDataChanged();
      setShowDowntimeModal(false);
      setDowntimeDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const maxHourlyVal = order
    ? Math.max(...order.hourlyOutput.map((h) => Math.max(h.target, h.actual)), 100)
    : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Line Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Shop Floor Execution
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Production Control Center
          </h2>
          <p className="text-xs text-slate-400">
            Real-time Target vs. Actual achievement, cycle takt pacing, and downtime logging
          </p>
        </div>

        {/* Line Switcher Pills */}
        <div className="flex flex-wrap gap-2">
          {lines.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLineId(l.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                activeLineId === l.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{l.code}</span>
              <StatusBadge status={l.status} size="sm" showIcon={false} />
            </button>
          ))}
        </div>
      </div>

      {activeLine && order ? (
        <>
          {/* Active Order Card & Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Status & Actions Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-mono">Current Status</span>
                  <StatusBadge status={activeLine.status} size="md" />
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {activeLine.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Order: <span className="text-amber-300 font-bold">{order.orderNumber}</span>
                </p>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  {order.partNumber} - {order.partName}
                </p>
              </div>

              {/* Status Change Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    setTargetStatus('RUNNING');
                    setShowStatusModal(true);
                  }}
                  disabled={!checkPermission('production:change_status')}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5" /> Start / Resume Line
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setTargetStatus('WARNING');
                      setShowStatusModal(true);
                    }}
                    disabled={!checkPermission('production:change_status')}
                    className="py-1.5 px-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-40"
                  >
                    <AlertTriangle className="w-3 h-3" /> Warning
                  </button>

                  <button
                    onClick={() => {
                      setTargetStatus('STOPPED');
                      setShowStatusModal(true);
                    }}
                    disabled={!checkPermission('production:change_status')}
                    className="py-1.5 px-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-40"
                  >
                    <Square className="w-3 h-3" /> Stop Line
                  </button>
                </div>
              </div>
            </div>

            {/* Achievement KPI Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Achievement Rate</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white my-2">
                  {achievement}%
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Actual: <span className="text-emerald-400 font-bold">{order.actualQuantity}</span> / Target:{' '}
                  <span className="text-white font-bold">{order.targetQuantity}</span> pcs
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 mt-4">
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      achievement >= 90
                        ? 'bg-emerald-500'
                        : achievement >= 80
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(achievement, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Remaining: {Math.max(order.targetQuantity - order.actualQuantity, 0)} pcs</span>
                  <span>Scrap: {order.scrapQuantity} pcs ({scrapRate}%)</span>
                </div>
              </div>

              {/* Touch Output Report Button */}
              <button
                onClick={() => setShowOutputModal(true)}
                disabled={!checkPermission('production:report_output')}
                className="mt-4 w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" /> Report Produced Output
              </button>
            </div>

            {/* Takt Time & Pace Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Takt Time & Pace</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-black font-mono text-cyan-300 my-2">
                  {activeLine.taktTimeSec} <span className="text-sm font-normal text-slate-400">sec/pc</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Available shift time (480 mins) divided by demand requirement.
                </p>
              </div>

              <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/80 space-y-1 mt-4 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Target Rate:</span>
                  <span className="text-white font-bold">{Math.round(3600 / activeLine.taktTimeSec)} pcs/hr</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Operating Shift:</span>
                  <span className="text-amber-300 font-bold">{activeLine.currentShift}</span>
                </div>
              </div>

              <button
                onClick={() => setShowDowntimeModal(true)}
                disabled={!checkPermission('production:log_downtime')}
                className="mt-4 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> Log Line Downtime
              </button>
            </div>

            {/* Shift Breakdown Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Line Stoppages</span>
                  <History className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-black font-mono text-rose-400 my-2">
                  {downtimes.reduce((sum, d) => sum + d.durationMinutes, 0)}{' '}
                  <span className="text-sm font-normal text-slate-400">min</span>
                </div>
                <p className="text-xs text-slate-400">
                  Total cumulative downtime across {downtimes.length} event{downtimes.length > 1 ? 's' : ''} on this shift.
                </p>
              </div>

              <div className="space-y-2 mt-4 max-h-32 overflow-y-auto pr-1">
                {downtimes.slice(0, 3).map((dt) => (
                  <div
                    key={dt.id}
                    className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-rose-300">[{dt.reasonCategory}]</span>{' '}
                      <span className="text-slate-300 truncate max-w-[130px] inline-block align-bottom">
                        {dt.description}
                      </span>
                    </div>
                    <span className="font-mono text-slate-400 font-bold shrink-0">
                      {dt.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hourly Output Bar Visualizer (Clean Industrial SVG) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Hourly Production Output vs. Target
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 rounded-sm bg-slate-700"></span> Target
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500"></span> Actual Output
                </span>
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <span className="w-3 h-3 rounded-sm bg-rose-500"></span> Scrap
                </span>
              </div>
            </div>

            {/* SVG Hourly Bar Chart */}
            <div className="grid grid-cols-8 gap-3 pt-4 border-t border-slate-800">
              {order.hourlyOutput.map((hour, idx) => {
                const targetPct = (hour.target / maxHourlyVal) * 100;
                const actualPct = (hour.actual / maxHourlyVal) * 100;
                const scrapPct = (hour.scrap / maxHourlyVal) * 100;
                const achievedHour = hour.target > 0 && hour.actual >= hour.target;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    {/* Bar Area */}
                    <div className="w-full h-36 bg-slate-950/60 rounded-lg p-1.5 flex items-end justify-center gap-1.5 relative group border border-slate-800/80">
                      {/* Target Guide Bar */}
                      <div
                        className="w-1/2 bg-slate-700/80 rounded-t-sm transition-all"
                        style={{ height: `${Math.min(targetPct, 100)}%` }}
                        title={`Target: ${hour.target} pcs`}
                      />

                      {/* Actual Bar with Scrap on top */}
                      <div
                        className={`w-1/2 rounded-t-sm transition-all relative flex flex-col justify-end ${
                          hour.actual > 0
                            ? achievedHour
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                            : 'bg-slate-800'
                        }`}
                        style={{ height: `${Math.min(actualPct, 100)}%` }}
                        title={`Actual: ${hour.actual} pcs (Scrap: ${hour.scrap})`}
                      >
                        {hour.scrap > 0 && (
                          <div
                            className="w-full bg-rose-500 rounded-t-sm shrink-0"
                            style={{ height: `${Math.min(scrapPct * 4, 30)}%` }}
                          />
                        )}
                      </div>

                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 border border-slate-700 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap">
                        Act: {hour.actual} / Tgt: {hour.target}
                      </div>
                    </div>

                    {/* Hour Label */}
                    <span className="font-mono text-xs font-bold text-slate-400 mt-2">
                      {hour.hourLabel}
                    </span>
                    <span className="font-mono text-[11px] text-slate-300 font-semibold">
                      {hour.actual} pcs
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          No active production order assigned to {activeLine?.name || 'this line'}.
        </div>
      )}

      {/* Modal: Report Actual Output */}
      {showOutputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Report Production Output
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter good piece count and defect scrap count for {order?.partNumber}
            </p>

            <form onSubmit={handleReportOutput} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Good Finished Parts Produced (+ Quantity)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 25, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setOutputQty(preset)}
                      className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-amber-300"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={outputQty}
                  onChange={(e) => setOutputQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Scrap / NG Parts Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scrapQty}
                  onChange={(e) => setScrapQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOutputModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow"
                >
                  Confirm & Commit Output
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Line Status with Mandatory Reason */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Transition Line Status to {targetStatus}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Every status transition is logged to the immutable audit trail with your badge number.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Selected Status
                </label>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{targetStatus}</span>
                  <StatusBadge status={targetStatus} size="sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reason for Status Change <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="e.g. Die replacement verified, safety gate reset, starting mass run"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow"
                >
                  Confirm Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Downtime Event */}
      {showDowntimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Log Line Downtime Event
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Record interruption cause and lost operating minutes for OEE loss calculation.
            </p>

            <form onSubmit={handleLogDowntime} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reason Category
                </label>
                <select
                  value={downtimeCategory}
                  onChange={(e) => setDowntimeCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="MACHINE">MACHINE (Equipment Jam / Sensor Trip)</option>
                  <option value="QUALITY">QUALITY (Inspection / Defect Hold)</option>
                  <option value="MATERIAL">MATERIAL (Buffer Out / Shortage)</option>
                  <option value="CHANGEOVER">CHANGEOVER (Tool / Die / Reel Change)</option>
                  <option value="OPERATIONAL">OPERATIONAL (Meeting / 5S / Operator Absence)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Downtime Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={downtimeDuration}
                  onChange={(e) => setDowntimeDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Interruption Description / Root Cause <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={downtimeDescription}
                  onChange={(e) => setDowntimeDescription(e.target.value)}
                  placeholder="e.g. Feeder track jamming due to coil thickness variation"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDowntimeModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow"
                >
                  Log Downtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
