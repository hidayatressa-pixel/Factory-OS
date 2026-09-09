// Roles & RBAC Matrix Management
// Centralized Security Architecture for 10 Shop-Floor Personas

import React from 'react';
import { KeyRound, ShieldCheck, Check, X, Lock } from 'lucide-react';
import { ROLE_PERMISSIONS, Permission } from '../../core/auth/rbac';
import { RoleType } from '../../types';

export const RolePermissionPage: React.FC = () => {
  const allRoles: RoleType[] = [
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

  const keyPermissions: { key: Permission; label: string; category: string }[] = [
    { key: 'production:change_status', label: 'Start / Stop Production Line', category: 'Production' },
    { key: 'production:report_output', label: 'Report Hourly Output & Scrap', category: 'Production' },
    { key: 'production:edit_target', label: 'Edit Production Order Targets', category: 'Production' },
    { key: 'quality:create_defect', label: 'Log Defect / Incident', category: 'Quality' },
    { key: 'quality:update_containment', label: 'Advance Containment Action', category: 'Quality' },
    { key: 'quality:verify_close', label: 'Verify & Close Defect Ticket', category: 'Quality' },
    { key: 'maintenance:create_call', label: 'Trigger Breakdown Ticket', category: 'Maintenance' },
    { key: 'maintenance:assign_tech', label: 'Dispatch Technician', category: 'Maintenance' },
    { key: 'maintenance:log_repair', label: 'Log Repair & Downtime', category: 'Maintenance' },
    { key: 'material:create_request', label: 'Trigger Kanban Call', category: 'Material' },
    { key: 'material:adjust_stock', label: 'Adjust Buffer Stock Inventory', category: 'Material' },
    { key: 'andon:create_call', label: 'Trigger Andon Alarm', category: 'Andon' },
    { key: 'andon:acknowledge', label: 'Acknowledge Andon Call', category: 'Andon' },
    { key: 'andon:resolve', label: 'Resolve Andon Escalation', category: 'Andon' },
    { key: 'handover:generate', label: 'Generate Shift Handover', category: 'Handover' },
    { key: 'handover:sign_off', label: 'Sign-Off Shift Handover', category: 'Handover' },
    { key: 'pokayoke:create_rule', label: 'Configure Poka-Yoke Rules', category: 'Poka-Yoke' },
    { key: 'pokayoke:toggle_rule', label: 'Arm / Bypass Interlock', category: 'Poka-Yoke' },
    { key: 'masterdata:manage', label: 'Manage Plant Master Data', category: 'Governance' },
    { key: 'roles:manage', label: 'Configure Roles & Security', category: 'Governance' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Access Governance
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Role-Based Access Control (RBAC) Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Centralized matrix mapping 10 dedicated shop-floor personas to explicit operational privileges
          </p>
        </div>
      </div>

      {/* Architecture Note */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-1">
        <p className="font-bold text-amber-400 font-mono flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Decoupled Security Model
        </p>
        <p className="text-slate-400">
          Authorization logic is decoupled from individual UI components. All permissions are evaluated through the centralized <code className="text-amber-300">hasPermission(role, action)</code> engine and <code className="text-amber-300">canAccessModule(role, module)</code> guard.
        </p>
      </div>

      {/* RBAC Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-[10px] text-slate-400 uppercase">
              <th className="py-3 px-3 min-w-[220px]">Permission Action</th>
              {allRoles.map((r) => (
                <th key={r} className="py-3 px-2 text-center font-bold">
                  {r.slice(0, 5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {keyPermissions.map((perm) => (
              <tr key={perm.key} className="hover:bg-slate-850">
                <td className="py-2.5 px-3">
                  <span className="font-semibold text-white block">{perm.label}</span>
                  <span className="font-mono text-[10px] text-slate-500">{perm.key}</span>
                </td>
                {allRoles.map((role) => {
                  const allowed = (ROLE_PERMISSIONS[role] as readonly string[]).includes(perm.key);
                  return (
                    <td key={role} className="py-2.5 px-2 text-center">
                      {allowed ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 font-bold mx-auto">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-950 text-slate-700 mx-auto">
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
