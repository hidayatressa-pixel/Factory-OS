import React from 'react';
import { LayoutDashboard, Boxes, Gauge, ShieldAlert, Wrench, Layers, BellRing, BookOpen, Cpu, Repeat, Database, Users, KeyRound, History, Settings, GraduationCap, BarChart3 } from 'lucide-react';
import { ModuleId, ModuleStatus } from '../../types';
import { useAuth } from '../../core/auth/AuthContext';

export interface NavItem { id:ModuleId; label:string; icon:React.ComponentType<{className?:string;size?:number}>; status:ModuleStatus; category:'core'|'operations'|'intelligence'|'management'; }
export const ALL_NAV_ITEMS:NavItem[]=[
 {id:'dashboard',label:'Dashboard',icon:LayoutDashboard,status:'IMPLEMENTED',category:'core'},
 {id:'launcher' as ModuleId,label:'Module Launcher',icon:Boxes,status:'IMPLEMENTED',category:'core'},
 {id:'production',label:'Production',icon:Gauge,status:'IMPLEMENTED',category:'operations'},
 {id:'quality',label:'Quality Control',icon:ShieldAlert,status:'IMPLEMENTED',category:'operations'},
 {id:'maintenance',label:'Maintenance',icon:Wrench,status:'IMPLEMENTED',category:'operations'},
 {id:'material',label:'Material & Kanban',icon:Layers,status:'IMPLEMENTED',category:'operations'},
 {id:'andon',label:'Andon System',icon:BellRing,status:'IMPLEMENTED',category:'operations'},
 {id:'knowledge',label:'Knowledge Vault',icon:BookOpen,status:'FOUNDATION ONLY',category:'intelligence'},
 {id:'poka-yoke',label:'Digital Poka-Yoke',icon:Cpu,status:'FOUNDATION ONLY',category:'intelligence'},
 {id:'handover',label:'Shift Handover',icon:Repeat,status:'FOUNDATION ONLY',category:'intelligence'},
 {id:'people',label:'Skills & People',icon:GraduationCap,status:'PLANNED',category:'intelligence'},
 {id:'analytics',label:'Advanced Analytics',icon:BarChart3,status:'PLANNED',category:'intelligence'},
 {id:'masterdata',label:'Master Data',icon:Database,status:'IMPLEMENTED',category:'management'},
 {id:'users',label:'User Management',icon:Users,status:'IMPLEMENTED',category:'management'},
 {id:'roles',label:'Roles & RBAC',icon:KeyRound,status:'IMPLEMENTED',category:'management'},
 {id:'audit',label:'Activity & Audit Log',icon:History,status:'IMPLEMENTED',category:'management'},
 {id:'settings',label:'System Settings',icon:Settings,status:'IMPLEMENTED',category:'management'},
];
interface SidebarProps { currentModule:ModuleId; onSelectModule:(mod:ModuleId)=>void; collapsed?:boolean; }

export const Sidebar:React.FC<SidebarProps>=({currentModule,onSelectModule})=>{
 const {checkModuleAccess,currentRole}=useAuth();
 const renderSection=(title:string,items:NavItem[])=>{
  const accessibleItems=items.filter(item=>checkModuleAccess(item.id)); if(!accessibleItems.length)return null;
  return <div className="mb-5"><h4 className="px-3 mb-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-[.18em]">{title}</h4><div className="space-y-0.5">{accessibleItems.map(item=>{const Icon=item.icon;const active=currentModule===item.id;return <button key={item.id} onClick={()=>onSelectModule(item.id)} className={`relative w-full min-h-10 flex items-center justify-between px-3 rounded-xl text-[11px] font-medium transition-all group ${active?'bg-cyan-400/[0.09] text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,.09)]':'text-slate-500 hover:text-slate-200 hover:bg-white/[0.035]'}`}>
   {active&&<span className="absolute left-0 w-[3px] h-5 rounded-r-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.45)]"/>}
   <div className="flex items-center gap-2.5 min-w-0"><span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${active?'bg-cyan-300/10 text-cyan-300':'bg-white/[0.025] text-slate-600 group-hover:text-slate-300'}`}><Icon size={15}/></span><span className="truncate text-left">{item.label}</span></div>
   {item.status==='FOUNDATION ONLY'&&<span className="text-[8px] px-1.5 py-0.5 rounded-md uppercase tracking-wide bg-amber-400/[0.07] text-amber-400/70 border border-amber-300/10">Beta</span>}
   {item.status==='PLANNED'&&<span className="w-1.5 h-1.5 rounded-full bg-slate-700"/>}
  </button>})}</div></div>;
 };
 return <aside className="hidden md:flex w-[236px] bg-[#080d18] border-r border-white/[0.06] flex-col h-[calc(100vh-72px)] sticky top-[72px] select-none shrink-0 overflow-hidden">
  <div className="px-2.5 pt-4 pb-2 overflow-y-auto flex-1 custom-scrollbar">
   {renderSection('Workspace',ALL_NAV_ITEMS.filter(i=>i.category==='core'))}
   {renderSection('Operations',ALL_NAV_ITEMS.filter(i=>i.category==='operations'))}
   {renderSection('Intelligence',ALL_NAV_ITEMS.filter(i=>i.category==='intelligence'))}
   {renderSection('Governance',ALL_NAV_ITEMS.filter(i=>i.category==='management'))}
  </div>
  <div className="m-2.5 p-3 rounded-xl bg-white/[0.025] border border-white/[0.055]">
   <div className="flex items-center justify-between text-[10px]"><span className="text-slate-600 font-mono">v0.9.4</span><span className="inline-flex items-center gap-1.5 text-emerald-400/80"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.5)]"/>SYSTEM ONLINE</span></div>
   <div className="mt-2 pt-2 border-t border-white/[0.05] text-[9px] text-slate-600 uppercase tracking-wider">Access · <span className="text-cyan-400/70">{currentRole}</span></div>
  </div>
 </aside>;
};
