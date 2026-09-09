// Skills & Operator Qualification Matrix
// ILU / 4-Stage Competency Tracking for Shop-Floor Compliance

import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, UserCheck, AlertCircle, Award, Check } from 'lucide-react';
import { DEMO_USERS } from '../../core/auth/AuthContext';

interface SkillItem {
  id: string;
  name: string;
  process: string;
  category: string;
}

const PLANT_SKILLS: SkillItem[] = [
  { id: 'sk-01', name: 'Komatsu Press Stamping Setup', process: 'Stamping', category: 'Machining' },
  { id: 'sk-02', name: 'Panasonic Robotic TIG Weld Operation', process: 'Welding', category: 'Welding' },
  { id: 'sk-03', name: 'Torque Gun Calibration & Fastening', process: 'Assembly', category: 'Assembly' },
  { id: 'sk-04', name: 'Visual Inspection & Gauge Measurement', process: 'Quality Gate', category: 'Quality' },
  { id: 'sk-05', name: 'Digital Poka-Yoke Bypass Authorization', process: 'Interlock System', category: 'Engineering' },
];

export const PeopleSkillPage: React.FC = () => {
  // Competency levels: 1 = In Training, 2 = Under Supervision, 3 = Autonomous Operator, 4 = Trainer/Certifier
  const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>({
    'usr-001': { 'sk-01': 3, 'sk-02': 1, 'sk-03': 4, 'sk-04': 3, 'sk-05': 2 },
    'usr-002': { 'sk-01': 4, 'sk-02': 4, 'sk-03': 4, 'sk-04': 4, 'sk-05': 3 },
    'usr-003': { 'sk-01': 4, 'sk-02': 4, 'sk-03': 4, 'sk-04': 4, 'sk-05': 4 },
    'usr-004': { 'sk-01': 1, 'sk-02': 2, 'sk-03': 4, 'sk-04': 4, 'sk-05': 2 },
    'usr-005': { 'sk-01': 2, 'sk-02': 2, 'sk-03': 3, 'sk-04': 4, 'sk-05': 4 },
  });

  const getLevelBadge = (lvl: number) => {
    switch (lvl) {
      case 4:
        return <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold font-mono text-[10px]">Level 4 (Trainer)</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold font-mono text-[10px]">Level 3 (Certified)</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300 font-bold font-mono text-[10px]">Level 2 (Supervised)</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">Level 1 (Trainee)</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Operator Qualification Matrix
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              FOUNDATION ONLY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Skills & Competency Management
          </h2>
          <p className="text-xs text-slate-400">
            Digital skills matrix tracking operator qualifications, station authorization gates, and training requirements
          </p>
        </div>
      </div>

      {/* Skills Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Station Certification & Competency Matrix</span>
        </h3>

        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-[10px] text-slate-400 uppercase">
              <th className="py-3 px-3">Personnel</th>
              <th className="py-3 px-3">Department</th>
              {PLANT_SKILLS.map((sk) => (
                <th key={sk.id} className="py-3 px-3 min-w-[130px]">
                  {sk.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {DEMO_USERS.map((usr) => (
              <tr key={usr.id} className="hover:bg-slate-850">
                <td className="py-3 px-3">
                  <span className="font-bold text-white block">{usr.name}</span>
                  <span className="font-mono text-[10px] text-amber-400">[{usr.role}]</span>
                </td>
                <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                  {usr.department}
                </td>
                {PLANT_SKILLS.map((sk) => {
                  const lvl = matrix[usr.id]?.[sk.id] || 1;
                  return (
                    <td key={sk.id} className="py-3 px-3">
                      {getLevelBadge(lvl)}
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
