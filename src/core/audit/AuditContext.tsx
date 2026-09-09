// Centralized Audit Log & Traceability Architecture
// FACTORY OS - One Platform for the Shop Floor

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuditLogEntry, AuditAction, ModuleId, RoleType } from '../../types';

interface RecordAuditParams {
  action: AuditAction;
  module: ModuleId;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
  customUser?: { id: string; name: string; role: RoleType };
}

interface AuditContextType {
  logs: AuditLogEntry[];
  recordAudit: (params: RecordAuditParams) => void;
  clearAuditLogs: () => void;
  getLogsByEntity: (entity: string, entityId?: string) => AuditLogEntry[];
  getLogsByModule: (module: ModuleId) => AuditLogEntry[];
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const AUDIT_STORAGE_KEY = 'factory_os_audit_logs_v1';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-101',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    userId: 'usr-003',
    userName: 'Hadi Wijaya',
    role: 'SUPERVISOR',
    action: 'STATUS_CHANGE',
    module: 'production',
    entity: 'ProductionLine',
    entityId: 'line-01',
    oldValue: 'CHANGEOVER',
    newValue: 'RUNNING',
    reason: 'Tooling setup verified by QC and safe to start mass run',
  },
  {
    id: 'aud-102',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    userId: 'usr-001',
    userName: 'Teguh Prasetyo',
    role: 'OPERATOR',
    action: 'CREATE',
    module: 'andon',
    entity: 'AndonCall',
    entityId: 'and-101',
    oldValue: null,
    newValue: 'Type: MACHINE, Status: NEW, Line: Stamping Line 1',
    reason: 'Hydraulic pressure gauge fluctuating below 120 bar',
  },
  {
    id: 'aud-103',
    timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    userId: 'usr-002',
    userName: 'Budi Santoso',
    role: 'LEADER',
    action: 'ACKNOWLEDGE',
    module: 'andon',
    entity: 'AndonCall',
    entityId: 'and-101',
    oldValue: 'NEW',
    newValue: 'ACKNOWLEDGED',
    reason: 'Leader arrived at Station 2 to verify hydraulic alarm',
  },
  {
    id: 'aud-104',
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    userId: 'usr-007',
    userName: 'Surya Pratama',
    role: 'MAINTENANCE',
    action: 'STATUS_CHANGE',
    module: 'maintenance',
    entity: 'Machine',
    entityId: 'mc-01',
    oldValue: 'BREAKDOWN',
    newValue: 'OPERATIONAL',
    reason: 'Replaced proportional valve solenoid seal ring',
  },
  {
    id: 'aud-105',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: 'usr-005',
    userName: 'Rian Kurniawan',
    role: 'QUALITY',
    action: 'CREATE',
    module: 'quality',
    entity: 'QualityDefect',
    entityId: 'def-101',
    oldValue: null,
    newValue: 'Category: DIMENSION, Qty: 4, Part: PT-BRK-401',
    reason: 'Flange bending radius +0.4mm out of tolerance on sample inspection',
  },
];

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed reading audit logs from storage', e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 500))); // Keep last 500
    } catch (e) {
      console.error('Failed saving audit logs to storage', e);
    }
  }, [logs]);

  const recordAudit = useCallback((params: RecordAuditParams) => {
    // Current user resolution from local session
    const activeUserId = localStorage.getItem('factory_os_active_user_id') || 'usr-002';
    const fallbackUser = { id: activeUserId, name: 'Budi Santoso', role: 'LEADER' as RoleType };
    const actor = params.customUser || fallbackUser;

    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: params.action,
      module: params.module,
      entity: params.entity,
      entityId: params.entityId,
      oldValue: params.oldValue !== undefined ? (typeof params.oldValue === 'string' ? params.oldValue : JSON.stringify(params.oldValue)) : null,
      newValue: params.newValue !== undefined ? (typeof params.newValue === 'string' ? params.newValue : JSON.stringify(params.newValue)) : null,
      reason: params.reason,
    };

    setLogs((prev) => [newEntry, ...prev]);
  }, []);

  const clearAuditLogs = useCallback(() => {
    setLogs([]);
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  }, []);

  const getLogsByEntity = useCallback((entity: string, entityId?: string) => {
    return logs.filter((l) => l.entity.toLowerCase() === entity.toLowerCase() && (!entityId || l.entityId === entityId));
  }, [logs]);

  const getLogsByModule = useCallback((module: ModuleId) => {
    return logs.filter((l) => l.module === module);
  }, [logs]);

  return (
    <AuditContext.Provider
      value={{
        logs,
        recordAudit,
        clearAuditLogs,
        getLogsByEntity,
        getLogsByModule,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = (): AuditContextType => {
  const ctx = useContext(AuditContext);
  if (!ctx) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return ctx;
};
