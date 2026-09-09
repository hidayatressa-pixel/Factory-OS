// Roles & RBAC Matrix Management
// Role is hierarchy; department is functional ownership; scope is physical responsibility.
import React from 'react';
import { KeyRound, ShieldCheck, Check, X } from 'lucide-react';
import { ROLE_PERMISSIONS, Permission } from '../../core/auth/rbac';
import { RoleType } from '../../types';

export const RolePermissionPage:React.FC=()=>{
 const allRoles:RoleType[]=['OPERATOR','LEADER','SUPERVISOR','MANAGER','ADMIN'];
 const keyPermissions:{key:Permission;label:string;category:string}[]=[
  {key:'production:change_status',label:'Start / Stop Production Line',category:'Production'},{key:'production:report_output',label:'Report Hourly Output & Scrap',category:'Production'},{key:'production:edit_target',label:'Edit Production Order Targets',category:'Production'},
  {key:'quality:create_defect',label:'Log Defect / Incident',category:'Quality'},{key:'quality:update_containment',label:'Advance Containment Action',category:'Quality'},{key:'quality:verify_close',label:'Verify & Close Defect Ticket',category:'Quality'},
  {key:'maintenance:create_call',label:'Trigger Breakdown Ticket',category:'Maintenance'},{key:'maintenance:assign_tech',label:'Dispatch Technician',category:'Maintenance'},{key:'maintenance:log_repair',label:'Log Repair & Downtime',category:'Maintenance'},
  {key:'material:create_request',label:'Trigger Kanban Call',category:'Material'},{key:'material:adjust_stock',label:'Adjust Buffer Stock Inventory',category:'Material'},
  {key:'andon:create_call',label:'Trigger Andon Alarm',category:'Andon'},{key:'andon:acknowledge',label:'Acknowledge Andon Call',category:'Andon'},{key:'andon:resolve',label:'Resolve Andon Escalation',category:'Andon'},
  {key:'handover:generate',label:'Generate Shift Handover',category:'Handover'},{key:'handover:sign_off',label:'Sign-Off Shift Handover',category:'Handover'},
  {key:'pokayoke:create_rule',label:'Configure Poka-Yoke Rules',category:'Poka-Yoke'},{key:'pokayoke:toggle_rule',label:'Arm / Bypass Interlock',category:'Poka-Yoke'},
  {key:'masterdata:manage',label:'Manage Plant Master Data',category:'Governance'},{key:'roles:manage',label:'Configure Roles & Security',category:'Governance'}
 ];
 return <div className="space-y-6 pb-12">
  <div className="glass-panel rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"><div><div className="flex items-center gap-2 mb-1"><KeyRound className="w-5 h-5 text-cyan-300"/><span className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-widest">Access Governance</span></div><h2 className="text-xl font-bold text-white tracking-tight">Role-Based Access Control Matrix</h2><p className="text-xs text-slate-400">Authority roles are evaluated together with department ownership and physical scope.</p></div></div>
  <div className="glass-panel rounded-2xl p-4 text-xs text-slate-300 leading-relaxed space-y-1"><p className="font-bold text-cyan-300 font-mono flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400"/>Role × Department × Scope</p><p className="text-slate-400">Production, Quality, Engineering, Maintenance and Material are departments—not authority roles. Final authorization combines the hierarchy permission, department permission and resource scope.</p></div>
  <div className="glass-panel rounded-2xl p-5 overflow-x-auto"><table className="w-full text-left text-xs text-slate-300 border-collapse"><thead><tr className="border-b border-white/[0.07] bg-black/10 font-mono text-[10px] text-slate-400 uppercase"><th className="py-3 px-3 min-w-[220px]">Permission Action</th>{allRoles.map(r=><th key={r} className="py-3 px-2 text-center font-bold">{r}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.06]">{keyPermissions.map(perm=><tr key={perm.key} className="hover:bg-white/[0.025]"><td className="py-2.5 px-3"><span className="font-semibold text-white block">{perm.label}</span><span className="font-mono text-[10px] text-slate-500">{perm.key}</span></td>{allRoles.map(role=>{const allowed=(ROLE_PERMISSIONS[role] as readonly string[]).includes(perm.key);return <td key={role} className="py-2.5 px-2 text-center">{allowed?<span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 mx-auto"><Check className="w-3.5 h-3.5"/></span>:<span className="inline-flex items-center justify-center w-5 h-5 rounded bg-black/20 text-slate-700 mx-auto"><X className="w-3 h-3"/></span>}</td>})}</tr>)}</tbody></table></div>
 </div>;
};
