import React, { useEffect, useState } from 'react';
import { Factory, Clock3, ChevronDown, FlaskConical, Radio, MapPin } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../core/auth/AuthContext';

interface HeaderProps { selectedLineId:string; onSelectLineId:(lineId:string)=>void; onOpenTestModal:()=>void; }

export const Header:React.FC<HeaderProps>=({selectedLineId,onSelectLineId,onOpenTestModal})=>{
 const {currentUser,currentRole,loginAs,isDemoMode}=useAuth();
 const [timeStr,setTimeStr]=useState('');
 const [showRoleMenu,setShowRoleMenu]=useState(false);
 useEffect(()=>{const update=()=>setTimeStr(new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}));update();const id=setInterval(update,1000);return()=>clearInterval(id);},[]);

 return <header className="sticky top-0 z-40 h-[72px] border-b border-white/[0.07] bg-[#080d18]/90 text-slate-100 backdrop-blur-xl">
  <div className="h-full px-4 sm:px-6 flex items-center gap-4">
   <div className="flex items-center gap-3 min-w-[230px] shrink-0">
    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-400/[0.03] border border-cyan-300/20 flex items-center justify-center shadow-[0_0_28px_rgba(34,211,238,.08)]">
     <Factory className="w-5 h-5 text-cyan-300"/><span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080d18]"/>
    </div>
    <div><div className="flex items-center gap-2"><span className="font-extrabold tracking-[.16em] text-[15px] text-white">FACTORY OS</span>{isDemoMode&&<span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider bg-amber-400/10 text-amber-300 border border-amber-300/15">DEMO</span>}</div><p className="text-[10px] text-slate-500 tracking-wide mt-0.5">SHOP FLOOR COMMAND CENTER</p></div>
   </div>

   <div className="hidden lg:flex flex-1 items-center justify-center gap-2">
    <div className="h-10 flex items-center gap-2 rounded-xl bg-white/[0.035] border border-white/[0.07] px-3">
     <MapPin className="w-3.5 h-3.5 text-slate-500"/><span className="text-[10px] uppercase tracking-wider text-slate-500">Scope</span>
     <select value={selectedLineId} onChange={e=>onSelectLineId(e.target.value)} aria-label="Filter by Line" className="bg-transparent text-xs text-slate-200 font-semibold outline-none cursor-pointer">
      <option value="ALL">Plant Overview</option><option value="line-01">Line 1 · Stamping Press</option><option value="line-02">Line 2 · Robotic Welding</option><option value="line-03">Line 3 · Enclosure Assembly</option><option value="line-04">Line 4 · Testing & Packing</option>
     </select>
    </div>
    <div className="h-10 flex items-center gap-2 rounded-xl bg-white/[0.035] border border-white/[0.07] px-3 text-xs">
     <Radio className="w-3.5 h-3.5 text-emerald-400"/><span className="text-slate-500">Shift A</span><span className="w-px h-4 bg-white/10"/><Clock3 className="w-3.5 h-3.5 text-cyan-400"/><span className="font-mono text-cyan-200 font-semibold tracking-wider">{timeStr||'07:00:00'}</span>
    </div>
   </div>

   <div className="ml-auto flex items-center gap-2">
    <button onClick={onOpenTestModal} className="h-10 px-3 rounded-xl border border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.07] text-slate-400 hover:text-cyan-200 transition-colors flex items-center gap-2 text-xs"><FlaskConical className="w-4 h-4"/><span className="hidden xl:inline">System Test</span></button>
    <div className="relative">
     <button onClick={()=>setShowRoleMenu(!showRoleMenu)} className="h-10 flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.07] pl-2 pr-3 transition-colors">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/10 border border-cyan-300/15 text-cyan-200 flex items-center justify-center font-bold text-[10px]">{currentRole.slice(0,2)}</div>
      <div className="text-left hidden sm:block max-w-36"><div className="text-slate-100 font-semibold text-[11px] truncate">{currentUser?.name||'Shop Floor User'}</div><div className="text-[9px] text-slate-500 truncate">{currentRole} · {currentUser?.department}</div></div><ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showRoleMenu?'rotate-180':''}`}/>
     </button>
     {showRoleMenu&&<div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl glass-panel shadow-2xl z-50" onClick={()=>setShowRoleMenu(false)}>
      <div className="px-4 py-3 border-b border-white/[0.07]"><p className="text-[10px] uppercase tracking-[.16em] font-bold text-cyan-300">Persona Simulation</p><p className="text-[10px] text-slate-500 mt-1">Role · Department · Scope authorization</p></div>
      <div className="max-h-72 overflow-y-auto custom-scrollbar p-1.5">{DEMO_USERS.map(usr=><button key={usr.id} onClick={()=>loginAs(usr.id)} className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${currentUser?.id===usr.id?'bg-cyan-400/[0.08]':'hover:bg-white/[0.05]'}`}><div><div className="text-slate-100 font-medium">{usr.name}</div><div className="text-[10px] text-slate-500 mt-0.5">{usr.department} · {usr.accessScope.type}</div></div><span className="text-[9px] tracking-wide px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] text-slate-400">{usr.role}</span></button>)}</div>
     </div>}
    </div>
   </div>
  </div>
 </header>;
};
