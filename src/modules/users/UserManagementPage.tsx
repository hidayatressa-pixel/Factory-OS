// User Management Module
// Shop-Floor Personnel Registry & Role Switcher

import React from 'react';
import { Users, UserCheck, ShieldCheck, BadgeCheck, ArrowRight } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../core/auth/AuthContext';

export const UserManagementPage: React.FC = () => {
  const { currentUser, currentRole, loginAs } = useAuth();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Workforce Operations
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Shop-Floor User Management
          </h2>
          <p className="text-xs text-slate-400">
            Certified operators, maintenance technicians, quality engineers, and shift supervisors
          </p>
        </div>
      </div>

      {/* Active Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-400" />
          <span>Registered Shop-Floor Users ({DEMO_USERS.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-3">Badge ID</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Assigned Line</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Switch Active User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {DEMO_USERS.map((usr) => {
                const isActive = currentUser?.id === usr.id;
                return (
                  <tr key={usr.id} className={`hover:bg-slate-850 transition-colors ${isActive ? 'bg-amber-500/10' : ''}`}>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {usr.badgeNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                      {usr.name} {isActive && <span className="text-[10px] text-amber-400 font-mono font-bold ml-1">(YOU)</span>}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {usr.department}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {usr.assignedLineId || 'All Plant'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => loginAs(usr.id)}
                        disabled={isActive}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                        }`}
                      >
                        {isActive ? 'Logged In' : 'Simulate Login'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
