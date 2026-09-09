// Centralized Authentication & Session Management
// DEMO MODE ONLY: production authentication must be server-backed.
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleType, ModuleId } from '../../types';
import { authorize, canAccessModuleForUser, Permission, ResourceScope } from './rbac';

export const DEMO_USERS: User[] = [
  { id:'usr-001', name:'Teguh Prasetyo', badgeNumber:'OP-8821', email:'teguh.p@factory.local', role:'OPERATOR', department:'PRODUCTION', accessScope:{type:'LINE',lineIds:['line-01']}, assignedLineId:'line-01', active:true },
  { id:'usr-002', name:'Budi Santoso', badgeNumber:'LD-4412', email:'budi.s@factory.local', role:'LEADER', department:'PRODUCTION', accessScope:{type:'LINE',lineIds:['line-01']}, assignedLineId:'line-01', active:true },
  { id:'usr-003', name:'Hadi Wijaya', badgeNumber:'SP-1002', email:'hadi.w@factory.local', role:'SUPERVISOR', department:'PRODUCTION', accessScope:{type:'AREA',areaIds:['shop-floor-1']}, active:true },
  { id:'usr-004', name:'Dewi Lestari', badgeNumber:'SP-3021', email:'dewi.l@factory.local', role:'SUPERVISOR', department:'PPIC', accessScope:{type:'PLANT',plantId:'plant-01'}, active:true },
  { id:'usr-005', name:'Rian Kurniawan', badgeNumber:'SP-5509', email:'rian.k@factory.local', role:'SUPERVISOR', department:'QUALITY', accessScope:{type:'PLANT',plantId:'plant-01'}, active:true },
  { id:'usr-006', name:'Ahmad Fauzi', badgeNumber:'LD-7704', email:'ahmad.f@factory.local', role:'LEADER', department:'ENGINEERING', accessScope:{type:'PLANT',plantId:'plant-01'}, active:true },
  { id:'usr-007', name:'Surya Pratama', badgeNumber:'LD-6601', email:'surya.p@factory.local', role:'LEADER', department:'MAINTENANCE', accessScope:{type:'PLANT',plantId:'plant-01'}, active:true },
  { id:'usr-008', name:'Nita Rahmawati', badgeNumber:'LD-2210', email:'nita.r@factory.local', role:'LEADER', department:'MATERIAL', accessScope:{type:'PLANT',plantId:'plant-01'}, active:true },
  { id:'usr-009', name:'Ir. Hendra Gunawan', badgeNumber:'MG-0010', email:'hendra.g@factory.local', role:'MANAGER', department:'PRODUCTION', accessScope:{type:'PLANT',plantId:'plant-01'}, active:true },
  { id:'usr-010', name:'Admin System', badgeNumber:'AD-0001', email:'admin@factoryos.local', role:'ADMIN', department:'IT', accessScope:{type:'PLANT',plantId:'plant-01'}, active:true },
];

interface AuthContextType { currentUser:User|null; currentRole:RoleType; allUsers:User[]; loginAs:(userId:string)=>void; switchRoleDirectly:(role:RoleType)=>void; logout:()=>void; checkPermission:(perm:Permission, resource?:ResourceScope)=>boolean; checkModuleAccess:(modId:ModuleId, resource?:ResourceScope)=>boolean; isDemoMode:boolean; toggleDemoMode:(val?:boolean)=>void; }
const AuthContext=createContext<AuthContextType|undefined>(undefined);
const AUTH_STORAGE_KEY='factory_os_active_user_id'; const DEMO_MODE_KEY='factory_os_demo_mode';

export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
  const [users]=useState<User[]>(DEMO_USERS);
  const [currentUser,setCurrentUser]=useState<User|null>(()=>{ const savedId=localStorage.getItem(AUTH_STORAGE_KEY); return DEMO_USERS.find(u=>u.id===savedId)||DEMO_USERS[1]; });
  const [isDemoMode,setIsDemoMode]=useState<boolean>(()=>{ const saved=localStorage.getItem(DEMO_MODE_KEY); return saved!==null?saved==='true':true; });
  useEffect(()=>{ if(currentUser)localStorage.setItem(AUTH_STORAGE_KEY,currentUser.id); else localStorage.removeItem(AUTH_STORAGE_KEY); },[currentUser]);
  const loginAs=(userId:string)=>{ const user=users.find(u=>u.id===userId); if(user?.active)setCurrentUser(user); };
  const switchRoleDirectly=(role:RoleType)=>{ if(!isDemoMode)return; const existing=users.find(u=>u.role===role); if(existing)setCurrentUser(existing); };
  const logout=()=>setCurrentUser(null);
  const currentRole:RoleType=currentUser?currentUser.role:'OPERATOR';
  const checkPermission=(perm:Permission,resource?:ResourceScope)=>currentUser?authorize(currentUser,perm,resource):false;
  const checkModuleAccess=(modId:ModuleId,resource?:ResourceScope)=>currentUser?canAccessModuleForUser(currentUser,modId,resource):false;
  const toggleDemoMode=(val?:boolean)=>{ const next=val!==undefined?val:!isDemoMode; setIsDemoMode(next); localStorage.setItem(DEMO_MODE_KEY,String(next)); };
  return <AuthContext.Provider value={{currentUser,currentRole,allUsers:users,loginAs,switchRoleDirectly,logout,checkPermission,checkModuleAccess,isDemoMode,toggleDemoMode}}>{children}</AuthContext.Provider>;
};
export const useAuth=():AuthContextType=>{ const context=useContext(AuthContext); if(!context)throw new Error('useAuth must be used within an AuthProvider'); return context; };
