// Industrial Status Badge with Multi-Signal Accessibility (Color + Icon + Label)
// FACTORY OS - One Platform for the Shop Floor

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  RefreshCw,
  PowerOff,
  Wrench,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { ProductionStatus, MachineStatus, DefectLifecycle, AndonStatus } from '../../types';

interface StatusBadgeProps {
  status:
    | ProductionStatus
    | MachineStatus
    | DefectLifecycle
    | AndonStatus
    | 'CRITICAL'
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW'
    | 'NORMAL'
    | 'SHORTAGE'
    | 'LOW_STOCK'
    | 'IMPLEMENTED'
    | 'FOUNDATION ONLY'
    | 'PLANNED';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-300';
  let IconComponent = Clock;
  let label = String(status);

  switch (status) {
    // Normal / Running / Green
    case 'RUNNING':
    case 'OPERATIONAL':
    case 'NORMAL':
    case 'CLOSED':
    case 'IMPLEMENTED':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700';
      IconComponent = CheckCircle2;
      break;

    // Warning / Attention / Yellow-Amber
    case 'WARNING':
    case 'DEGRADED':
    case 'LOW_STOCK':
    case 'INVESTIGATING':
    case 'CONTAINMENT':
    case 'ACKNOWLEDGED':
    case 'ARRIVED':
    case 'MEDIUM':
    case 'FOUNDATION ONLY':
      bg = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700';
      IconComponent = AlertTriangle;
      break;

    // Critical / Stopped / Red
    case 'STOPPED':
    case 'BREAKDOWN':
    case 'SHORTAGE':
    case 'OPEN':
    case 'NEW':
    case 'CRITICAL':
    case 'HIGH':
      bg = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700';
      IconComponent = AlertOctagon;
      break;

    // Changeover / Maintenance / Cyan-Blue
    case 'CHANGEOVER':
    case 'MAINTENANCE':
    case 'COUNTERMEASURE':
    case 'VERIFICATION':
    case 'IN_PROGRESS':
    case 'REPORTED':
      bg = 'bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-700';
      IconComponent = status === 'CHANGEOVER' ? RefreshCw : Wrench;
      break;

    // Offline / Idle / Gray
    case 'IDLE':
    case 'OFFLINE':
    case 'LOW':
    case 'PLANNED':
    default:
      bg = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      IconComponent = PowerOff;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold tracking-wide',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border uppercase whitespace-nowrap select-none ${bg} ${sizeClasses} ${className}`}
    >
      {showIcon && <IconComponent size={iconSizes} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
