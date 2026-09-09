// Shop-Floor Operations Dashboard
// FACTORY OS - One Platform for the Shop Floor

import React, { useState, useEffect } from 'react';
import {
  Gauge,
  ShieldAlert,
  Wrench,
  Layers,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Play,
  Square,
  AlertOctagon,
  TrendingUp,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useData } from '../../core/data/DataContext';
import { useAudit } from '../../core/audit/AuditContext';
import { useAuth } from '../../core/auth/AuthContext';
import {
  ManufacturingLine,
  ProductionOrder,
  AndonCall,
  QualityDefect,
  MaintenanceRequest,
  MaterialItem,
  ModuleId,
} from '../../types';

interface DashboardPageProps {
  selectedLineId: string;
  onNavigate: (module: ModuleId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  selectedLineId,
  onNavigate,
}) => {
  const {
    masterDataRepo,
    productionRepo,
    andonRepo,
    qualityRepo,
    maintenanceRepo,
    materialRepo,
    dataVersion,
  } = useData();
  const { logs } = useAudit();
  const { currentRole } = useAuth();

  const [lines, setLines] = useState<ManufacturingLine[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [andons, setAndons] = useState<AndonCall[]>([]);
  const [defects, setDefects] = useState<QualityDefect[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const [l, o, a, d, m, mat] = await Promise.all([
        masterDataRepo.getLines(),
        productionRepo.getOrders(),
        andonRepo.getCalls(),
        qualityRepo.getDefects(),
        maintenanceRepo.getRequests(),
        materialRepo.getItems(),
      ]);
      setLines(l);
      setOrders(o);
      setAndons(a);
      setDefects(d);
      setMaintenance(m);
      setMaterials(mat);
      setLoading(false);
    }
    loadDashboardData();
  }, [dataVersion, masterDataRepo, productionRepo, andonRepo, qualityRepo, maintenanceRepo, materialRepo]);

  // Filter if specific line selected
  const filteredLines =
    selectedLineId === 'ALL'
      ? lines
      : lines.filter((l) => l.id === selectedLineId);

  const activeAndons = andons.filter((a) => a.status !== 'CLOSED');
  const activeDefects = defects.filter((d) => d.status !== 'CLOSED');
  const activeMaintenance = maintenance.filter((m) => m.status !== 'CLOSED' && m.status !== 'RESOLVED');
  const materialShortages = materials.filter((m) => m.status === 'SHORTAGE');

  // Overall Plant KPI calculations
  const totalTarget = orders.reduce((sum, o) => sum + o.targetQuantity, 0);
  const totalActual = orders.reduce((sum, o) => sum + o.actualQuantity, 0);
  const plantAchievement = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 1000) / 10 : 0;
  const stoppedLinesCount = lines.filter((l) => l.status === 'STOPPED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Shop-Floor Ticker / Alert Banner */}
      {(stoppedLinesCount > 0 || activeAndons.length > 0 || materialShortages.length > 0) && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-rose-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600/30 border border-rose-500 flex items-center justify-center text-rose-400 shrink-0">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Active Shop-Floor Interruptions:</span>
                {stoppedLinesCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-xs font-mono">
                    {stoppedLinesCount} Line Stop{stoppedLinesCount > 1 ? 's' : ''}
                  </span>
                )}
                {activeAndons.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-xs font-mono">
                    {activeAndons.length} Open Andon{activeAndons.length > 1 ? 's' : ''}
                  </span>
                )}
                {materialShortages.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-orange-600 text-white text-xs font-mono">
                    {materialShortages.length} Shortage
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Line 3 (Enclosure Assembly) halted on Ultrasonic Welder alarm. Torx screw buffer critically depleted.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => onNavigate('andon')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow"
            >
              Open Andon Board
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plant Achievement */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Plant Output Target</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-mono font-black text-white">
              {plantAchievement}%
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {totalActual.toLocaleString()} / {totalTarget.toLocaleString()} pcs
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                plantAchievement >= 90 ? 'bg-emerald-500' : plantAchievement >= 80 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(plantAchievement, 100)}%` }}
            />
          </div>
        </div>

        {/* Active Lines */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Production Lines</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-mono font-black text-white">
              {lines.filter((l) => l.status === 'RUNNING').length} / {lines.length}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {stoppedLinesCount > 0 ? (
                <span className="text-rose-400 font-semibold">{stoppedLinesCount} STOPPED</span>
              ) : (
                <span className="text-emerald-400 font-semibold">All Lines Running</span>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigate('production')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 self-start"
          >
            Production Control <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Open Andon Calls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Open Andon Calls</span>
            <BellRing className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-mono font-black text-white">
              {activeAndons.length}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Avg Response: <span className="font-mono text-cyan-300 font-bold">1 min 55 sec</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('andon')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 self-start"
          >
            Manage Andon Calls <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quality & Maintenance Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Quality & Maint. Tickets</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-mono font-black text-white flex items-center gap-2">
              <span>{activeDefects.length}</span>
              <span className="text-sm font-normal text-slate-500">QA</span>
              <span className="text-slate-600">/</span>
              <span>{activeMaintenance.length}</span>
              <span className="text-sm font-normal text-slate-500">MT</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {activeDefects.length + activeMaintenance.length} requires engineering action
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-amber-400">
            <button onClick={() => onNavigate('quality')} className="hover:underline">
              Quality
            </button>
            <span className="text-slate-600">•</span>
            <button onClick={() => onNavigate('maintenance')} className="hover:underline">
              Maintenance
            </button>
          </div>
        </div>
      </div>

      {/* Production Lines Overview Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span>Line Operations Status</span>
            <span className="text-xs font-normal text-slate-400">
              ({filteredLines.length} line{filteredLines.length > 1 ? 's' : ''})
            </span>
          </h3>
          <button
            onClick={() => onNavigate('production')}
            className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1"
          >
            Detailed Line Monitoring <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLines.map((line) => {
            const order = orders.find((o) => o.lineId === line.id);
            const achievement =
              order && order.targetQuantity > 0
                ? Math.round((order.actualQuantity / order.targetQuantity) * 1000) / 10
                : 0;

            return (
              <div
                key={line.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Line Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-xs text-amber-400 font-bold block">
                        {line.code}
                      </span>
                      <h4 className="font-bold text-sm text-white leading-tight">
                        {line.name}
                      </h4>
                    </div>
                    <StatusBadge status={line.status} size="sm" />
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3">{line.area}</p>

                  {/* Active Order Details */}
                  {order ? (
                    <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono text-[10px]">Part:</span>
                        <span className="font-mono font-bold text-slate-200 truncate ml-2">
                          {order.partNumber}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Output:</span>
                        <span className="font-mono font-bold text-white">
                          {order.actualQuantity}{' '}
                          <span className="text-slate-500 text-[10px]">/ {order.targetQuantity}</span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>Achievement</span>
                          <span
                            className={`font-mono font-bold ${
                              achievement >= 90 ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {achievement}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              achievement >= 90
                                ? 'bg-emerald-500'
                                : achievement >= 80
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(achievement, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 rounded-lg p-3 text-center text-xs text-slate-500 mb-3">
                      No active production order
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" /> Takt: {line.taktTimeSec}s
                  </span>
                  <button
                    onClick={() => onNavigate('production')}
                    className="text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    View Line →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Active Issues & Activity Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Issues Matrix (Andon + Quality + Maintenance + Material) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Active Shop-Floor Issues
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {activeAndons.length + activeDefects.length + activeMaintenance.length} Open
              </span>
            </div>

            <div className="space-y-3">
              {/* Andon Calls */}
              {activeAndons.map((call) => (
                <div
                  key={call.id}
                  onClick={() => onNavigate('andon')}
                  className="p-3 bg-slate-950/80 border border-amber-500/30 hover:border-amber-500/60 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 font-mono">
                        ANDON [{call.type}]
                      </span>
                      <span className="font-bold text-xs text-white truncate max-w-[200px]">
                        {call.lineName}
                      </span>
                    </div>
                    <StatusBadge status={call.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">{call.description}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span>Station: {call.stationOrMachine}</span>
                    <span>Operator: {call.operatorName}</span>
                  </div>
                </div>
              ))}

              {/* Maintenance breakdown */}
              {activeMaintenance.map((maint) => (
                <div
                  key={maint.id}
                  onClick={() => onNavigate('maintenance')}
                  className="p-3 bg-slate-950/80 border border-rose-500/30 hover:border-rose-500/60 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 font-mono">
                        MAINTENANCE
                      </span>
                      <span className="font-bold text-xs text-white truncate max-w-[200px]">
                        {maint.machineName}
                      </span>
                    </div>
                    <StatusBadge status={maint.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">{maint.symptom}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span>Tech: {maint.technicianName || 'Unassigned'}</span>
                    <span className="text-rose-400 font-mono font-bold">Severity: {maint.severity}</span>
                  </div>
                </div>
              ))}

              {/* Material Shortage */}
              {materialShortages.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => onNavigate('material')}
                  className="p-3 bg-slate-950/80 border border-orange-500/30 hover:border-orange-500/60 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 font-mono">
                        MATERIAL SHORTAGE
                      </span>
                      <span className="font-mono text-xs text-white font-bold">{mat.partNumber}</span>
                    </div>
                    <StatusBadge status="SHORTAGE" size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">{mat.description}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span>Current: {mat.currentStock} {mat.unit}</span>
                    <span className="text-rose-400 font-mono">Safety: {mat.safetyStock} {mat.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('andon')}
            className="w-full mt-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            Launch Emergency Andon Call Form
          </button>
        </div>

        {/* Right: Traceable Activity & Audit Log Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Traceability & Activity Log
                </h3>
              </div>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Full Audit Trail →
              </button>
            </div>

            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 text-[10px] uppercase">
                        [{log.module}]
                      </span>
                      <span className="text-white font-semibold">{log.userName}</span>
                      <span className="text-[10px] font-mono text-slate-500">({log.role})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-slate-300 text-xs">
                    <span className="font-mono text-amber-300 font-medium mr-1.5">
                      {log.action}
                    </span>
                    on <span className="text-white font-medium">{log.entity}</span>
                    {log.entityId ? ` (${log.entityId})` : ''}
                  </div>

                  {log.reason && (
                    <div className="mt-1 text-[11px] text-slate-400 italic bg-slate-900/60 px-2 py-1 rounded">
                      Reason: {log.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Immutable audit events recorded</span>
            <span className="font-mono text-slate-300">{logs.length} Total Events</span>
          </div>
        </div>
      </div>
    </div>
  );
};
