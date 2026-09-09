// Digital Poka-Yoke Engine
// Software Interlocks, Mistake-Proofing Rule Engine & Shop-Floor Simulator

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Play,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Zap,
  Sliders,
  Terminal,
  Barcode,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useData } from '../../core/data/DataContext';
import { useAudit } from '../../core/audit/AuditContext';
import { useAuth } from '../../core/auth/AuthContext';
import { PokaYokeRule, RuleConditionOperator, RuleActionType } from '../../types';
import { evaluatePokaYokeRule } from '../../core/tests/businessLogic';

export const PokaYokePage: React.FC = () => {
  const { pokaYokeRepo, dataVersion, notifyDataChanged } = useData();
  const { recordAudit } = useAudit();
  const { currentUser, currentRole, checkPermission } = useAuth();

  const [rules, setRules] = useState<PokaYokeRule[]>([]);
  const [activeRuleId, setActiveRuleId] = useState<string>('');

  // Interactive Simulator State
  const [simRuleId, setSimRuleId] = useState<string>('');
  const [simInputVal, setSimInputVal] = useState<string>('SN-778901');
  const [simLog, setSimLog] = useState<Array<{ timestamp: string; rule: string; input: string; passed: boolean; message: string }>>([
    {
      timestamp: '10:14:02',
      rule: 'PYK-BARCODE-01',
      input: 'SN-778900',
      passed: true,
      message: 'Serial number verified unique. Packaging gate released.',
    },
  ]);

  // Create Rule Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [station, setStation] = useState('Station 1: Feeder');
  const [conditionField, setConditionField] = useState('barcode');
  const [operator, setOperator] = useState<RuleConditionOperator>('GREATER_THAN');
  const [expectedValue, setExpectedValue] = useState('4.5');
  const [action, setAction] = useState<RuleActionType>('BLOCK_PROCESS');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');

  useEffect(() => {
    async function loadRules() {
      const allRules = await pokaYokeRepo.getRules();
      setRules(allRules);
      if (allRules.length > 0 && !activeRuleId) {
        setActiveRuleId(allRules[0].id);
        setSimRuleId(allRules[0].id);
      }
    }
    loadRules();
  }, [dataVersion, pokaYokeRepo, activeRuleId]);

  const handleToggleRule = async (rule: PokaYokeRule) => {
    try {
      const updated = await pokaYokeRepo.toggleRule(rule.id, !rule.enabled);

      recordAudit({
        action: 'UPDATE',
        module: 'poka-yoke',
        entity: 'PokaYokeRule',
        entityId: rule.ruleCode,
        oldValue: `Enabled: ${rule.enabled}`,
        newValue: `Enabled: ${updated.enabled}`,
        reason: `Changed Poka-Yoke interlock status to ${updated.enabled ? 'ACTIVE' : 'BYPASSED'}`,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunSimulation = () => {
    const rule = rules.find((r) => r.id === simRuleId);
    if (!rule) return;

    const evaluation = evaluatePokaYokeRule(
      rule.operator as 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IS_DUPLICATE',
      rule.expectedValue,
      simInputVal
    );
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setSimLog([
      {
        timestamp: now,
        rule: rule.ruleCode,
        input: simInputVal,
        passed: evaluation.passed,
        message: evaluation.passed ? 'Process released: Rule satisfied.' : `INTERLOCK ENGAGED: ${evaluation.message}`,
      },
      ...simLog,
    ]);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await pokaYokeRepo.createRule({
        name,
        description,
        station,
        conditionField,
        operator,
        expectedValue,
        action,
        priority,
        enabled: true,
      });

      recordAudit({
        action: 'CREATE',
        module: 'poka-yoke',
        entity: 'PokaYokeRule',
        entityId: created.ruleCode,
        oldValue: null,
        newValue: `Action: ${action}, Expected: ${expectedValue}`,
        reason: 'Configured new digital mistake-proofing interlock rule',
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowCreateModal(false);
      setName('');
      setDescription('');
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
            <Cpu className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Digital Quality Gates
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              FOUNDATION ONLY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Digital Poka-Yoke Engine
          </h2>
          <p className="text-xs text-slate-400">
            Software-based mistake proofing: Duplicate barcode blocking, torque verification gates, and sequence interlocks
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!checkPermission('pokayoke:create_rule')}
          className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Define Interlock Rule
        </button>
      </div>

      {/* Simulator Card */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Shop-Floor Sensor / Barcode Interlock Simulator
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
            Real-Time Engine Test
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Test rule evaluation logic against mock operator inputs before arming on physical station gates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Interlock Rule</label>
            <select
              value={simRuleId}
              onChange={(e) => setSimRuleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {rules.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.ruleCode} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Test Payload Value</label>
            <input
              type="text"
              value={simInputVal}
              onChange={(e) => setSimInputVal(e.target.value)}
              placeholder="e.g. SN-778901 or 4.2"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSimulation}
              disabled={!checkPermission('pokayoke:test_rule')}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shadow"
            >
              <Play className="w-3.5 h-3.5" /> Evaluate Interlock
            </button>
          </div>
        </div>

        {/* Simulator Audit Stream */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs max-h-40 overflow-y-auto space-y-1.5">
          {simLog.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span className="text-amber-400 font-bold shrink-0">{log.rule}:</span>
              <span className="text-slate-300 shrink-0">Input='{log.input}'</span>
              <span className={log.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Configured Digital Interlock Rules ({rules.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-3">Rule #</th>
                <th className="py-3 px-3">Name & Description</th>
                <th className="py-3 px-3">Station</th>
                <th className="py-3 px-3">Condition Check</th>
                <th className="py-3 px-3">Fail Action</th>
                <th className="py-3 px-3 text-right">Violations</th>
                <th className="py-3 px-3 text-right">Interlock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-850 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                    {r.ruleCode}
                  </td>
                  <td className="py-3 px-3">
                    <strong className="text-white block">{r.name}</strong>
                    <span className="text-slate-400 text-[11px]">{r.description}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-300 whitespace-nowrap">
                    {r.station}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                    {r.conditionField} {r.operator} {r.expectedValue}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={r.action} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                    {r.triggerCount}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleToggleRule(r)}
                      disabled={!checkPermission('pokayoke:toggle_rule')}
                      className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all ${
                        r.enabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {r.enabled ? 'ACTIVE (ARMED)' : 'BYPASSED'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Rule */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Configure Digital Mistake-Proofing Rule
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Block defects from advancing by enforcing parameter checks and software interlocks.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Torque Nut Tightening Threshold Gate"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Requires calibrated torque tool to reach at least 4.5 Nm before part unclamp"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Station</label>
                  <input
                    type="text"
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Condition Field</label>
                  <input
                    type="text"
                    value={conditionField}
                    onChange={(e) => setConditionField(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Operator</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as RuleConditionOperator)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="EQUALS">EQUALS</option>
                    <option value="NOT_EQUALS">NOT_EQUALS</option>
                    <option value="GREATER_THAN">GREATER_THAN</option>
                    <option value="LESS_THAN">LESS_THAN</option>
                    <option value="CONTAINS">CONTAINS</option>
                    <option value="IS_DUPLICATE">IS_DUPLICATE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Value</label>
                  <input
                    type="text"
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Action on Failure</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as RuleActionType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="BLOCK_PROCESS">BLOCK_PROCESS</option>
                    <option value="SHOW_ALERT">SHOW_ALERT</option>
                    <option value="TRIGGER_ANDON">TRIGGER_ANDON</option>
                    <option value="LOG_WARNING">LOG_WARNING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'CRITICAL' | 'HIGH' | 'MEDIUM')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
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
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow"
                >
                  Arm Interlock Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
