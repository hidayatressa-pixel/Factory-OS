// Centralized Role-Based Access Control (RBAC) Architecture
// FACTORY OS - One Platform for the Shop Floor

import { RoleType, ModuleId } from '../../types';

export type Permission =
  // Production permissions
  | 'production:view'
  | 'production:edit_target'
  | 'production:report_output'
  | 'production:change_status'
  | 'production:log_downtime'
  // Quality permissions
  | 'quality:view'
  | 'quality:create_defect'
  | 'quality:update_containment'
  | 'quality:countermeasure'
  | 'quality:verify_close'
  // Maintenance permissions
  | 'maintenance:view'
  | 'maintenance:create_call'
  | 'maintenance:assign_tech'
  | 'maintenance:log_repair'
  | 'maintenance:close_ticket'
  // Material permissions
  | 'material:view'
  | 'material:create_request'
  | 'material:dispatch'
  | 'material:adjust_stock'
  // Andon permissions
  | 'andon:view'
  | 'andon:create_call'
  | 'andon:acknowledge'
  | 'andon:arrive'
  | 'andon:resolve'
  | 'andon:close'
  // Knowledge permissions
  | 'knowledge:view'
  | 'knowledge:create'
  | 'knowledge:verify'
  // Poka-Yoke permissions
  | 'pokayoke:view'
  | 'pokayoke:test_rule'
  | 'pokayoke:create_rule'
  | 'pokayoke:toggle_rule'
  // Handover permissions
  | 'handover:view'
  | 'handover:generate'
  | 'handover:sign_off'
  // Core System permissions
  | 'masterdata:view'
  | 'masterdata:manage'
  | 'users:view'
  | 'users:manage'
  | 'roles:view'
  | 'roles:manage'
  | 'audit:view'
  | 'settings:view'
  | 'settings:manage';

// Central Role Permissions Matrix
export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  OPERATOR: [
    'production:view',
    'production:report_output',
    'quality:view',
    'quality:create_defect',
    'maintenance:view',
    'maintenance:create_call',
    'material:view',
    'material:create_request',
    'andon:view',
    'andon:create_call',
    'knowledge:view',
    'pokayoke:view',
    'handover:view',
  ],

  LEADER: [
    'production:view',
    'production:report_output',
    'production:change_status',
    'production:log_downtime',
    'quality:view',
    'quality:create_defect',
    'quality:update_containment',
    'maintenance:view',
    'maintenance:create_call',
    'material:view',
    'material:create_request',
    'andon:view',
    'andon:create_call',
    'andon:acknowledge',
    'andon:arrive',
    'andon:resolve',
    'knowledge:view',
    'knowledge:create',
    'pokayoke:view',
    'pokayoke:test_rule',
    'handover:view',
    'handover:generate',
    'handover:sign_off',
    'audit:view',
  ],

  SUPERVISOR: [
    'production:view',
    'production:edit_target',
    'production:report_output',
    'production:change_status',
    'production:log_downtime',
    'quality:view',
    'quality:create_defect',
    'quality:update_containment',
    'quality:countermeasure',
    'quality:verify_close',
    'maintenance:view',
    'maintenance:create_call',
    'material:view',
    'material:create_request',
    'andon:view',
    'andon:create_call',
    'andon:acknowledge',
    'andon:arrive',
    'andon:resolve',
    'andon:close',
    'knowledge:view',
    'knowledge:create',
    'knowledge:verify',
    'pokayoke:view',
    'pokayoke:test_rule',
    'handover:view',
    'handover:generate',
    'handover:sign_off',
    'audit:view',
    'masterdata:view',
  ],

  PRODUCTION: [
    'production:view',
    'production:edit_target',
    'production:report_output',
    'production:change_status',
    'production:log_downtime',
    'quality:view',
    'maintenance:view',
    'material:view',
    'material:create_request',
    'andon:view',
    'andon:create_call',
    'knowledge:view',
    'handover:view',
    'handover:generate',
    'audit:view',
    'masterdata:view',
  ],

  QUALITY: [
    'production:view',
    'quality:view',
    'quality:create_defect',
    'quality:update_containment',
    'quality:countermeasure',
    'quality:verify_close',
    'maintenance:view',
    'material:view',
    'andon:view',
    'andon:create_call',
    'andon:acknowledge',
    'andon:resolve',
    'knowledge:view',
    'knowledge:create',
    'knowledge:verify',
    'pokayoke:view',
    'pokayoke:test_rule',
    'pokayoke:create_rule',
    'handover:view',
    'audit:view',
    'masterdata:view',
  ],

  ENGINEERING: [
    'production:view',
    'quality:view',
    'quality:countermeasure',
    'maintenance:view',
    'maintenance:create_call',
    'maintenance:log_repair',
    'andon:view',
    'andon:acknowledge',
    'andon:arrive',
    'andon:resolve',
    'knowledge:view',
    'knowledge:create',
    'knowledge:verify',
    'pokayoke:view',
    'pokayoke:test_rule',
    'pokayoke:create_rule',
    'pokayoke:toggle_rule',
    'handover:view',
    'audit:view',
    'masterdata:view',
    'masterdata:manage',
  ],

  MAINTENANCE: [
    'production:view',
    'maintenance:view',
    'maintenance:create_call',
    'maintenance:assign_tech',
    'maintenance:log_repair',
    'maintenance:close_ticket',
    'andon:view',
    'andon:acknowledge',
    'andon:arrive',
    'andon:resolve',
    'knowledge:view',
    'knowledge:create',
    'pokayoke:view',
    'handover:view',
    'audit:view',
    'masterdata:view',
  ],

  MATERIAL: [
    'production:view',
    'material:view',
    'material:create_request',
    'material:dispatch',
    'material:adjust_stock',
    'andon:view',
    'andon:acknowledge',
    'andon:resolve',
    'handover:view',
    'audit:view',
    'masterdata:view',
  ],

  MANAGER: [
    'production:view',
    'production:edit_target',
    'quality:view',
    'maintenance:view',
    'material:view',
    'andon:view',
    'knowledge:view',
    'pokayoke:view',
    'handover:view',
    'handover:sign_off',
    'masterdata:view',
    'users:view',
    'roles:view',
    'audit:view',
    'settings:view',
  ],

  ADMIN: [
    'production:view',
    'production:edit_target',
    'production:report_output',
    'production:change_status',
    'production:log_downtime',
    'quality:view',
    'quality:create_defect',
    'quality:update_containment',
    'quality:countermeasure',
    'quality:verify_close',
    'maintenance:view',
    'maintenance:create_call',
    'maintenance:assign_tech',
    'maintenance:log_repair',
    'maintenance:close_ticket',
    'material:view',
    'material:create_request',
    'material:dispatch',
    'material:adjust_stock',
    'andon:view',
    'andon:create_call',
    'andon:acknowledge',
    'andon:arrive',
    'andon:resolve',
    'andon:close',
    'knowledge:view',
    'knowledge:create',
    'knowledge:verify',
    'pokayoke:view',
    'pokayoke:test_rule',
    'pokayoke:create_rule',
    'pokayoke:toggle_rule',
    'handover:view',
    'handover:generate',
    'handover:sign_off',
    'masterdata:view',
    'masterdata:manage',
    'users:view',
    'users:manage',
    'roles:view',
    'roles:manage',
    'audit:view',
    'settings:view',
    'settings:manage',
  ],
};

// Module access mapping based on required permissions
export const MODULE_REQUIRED_PERMISSIONS: Record<ModuleId, Permission> = {
  dashboard: 'production:view',
  production: 'production:view',
  quality: 'quality:view',
  maintenance: 'maintenance:view',
  material: 'material:view',
  people: 'users:view',
  andon: 'andon:view',
  knowledge: 'knowledge:view',
  'poka-yoke': 'pokayoke:view',
  handover: 'handover:view',
  analytics: 'production:view',
  masterdata: 'masterdata:view',
  users: 'users:view',
  roles: 'roles:view',
  audit: 'audit:view',
  settings: 'settings:view',
};

/**
 * Pure authorization check for permission
 */
export function hasPermission(role: RoleType, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Pure authorization check for module access
 */
export function canAccessModule(role: RoleType, moduleId: ModuleId): boolean {
  const required = MODULE_REQUIRED_PERMISSIONS[moduleId];
  if (!required) return true;
  return hasPermission(role, required);
}

/**
 * Check if a role can perform an action on a specific module
 */
export function canPerformAction(
  role: RoleType,
  actionPermission: Permission,
): boolean {
  return hasPermission(role, actionPermission);
}
