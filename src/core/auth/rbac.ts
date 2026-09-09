// Centralized authorization: ROLE x DEPARTMENT x RESOURCE SCOPE
import { AccessScope, DepartmentType, ModuleId, RoleType, User } from '../../types';

export type Permission =
  | 'production:view' | 'production:edit_target' | 'production:report_output' | 'production:change_status' | 'production:log_downtime'
  | 'quality:view' | 'quality:create_defect' | 'quality:update_containment' | 'quality:countermeasure' | 'quality:verify_close'
  | 'maintenance:view' | 'maintenance:create_call' | 'maintenance:assign_tech' | 'maintenance:log_repair' | 'maintenance:close_ticket'
  | 'material:view' | 'material:create_request' | 'material:dispatch' | 'material:adjust_stock'
  | 'andon:view' | 'andon:create_call' | 'andon:acknowledge' | 'andon:arrive' | 'andon:resolve' | 'andon:close'
  | 'knowledge:view' | 'knowledge:create' | 'knowledge:verify'
  | 'pokayoke:view' | 'pokayoke:test_rule' | 'pokayoke:create_rule' | 'pokayoke:toggle_rule'
  | 'handover:view' | 'handover:generate' | 'handover:sign_off'
  | 'masterdata:view' | 'masterdata:manage' | 'users:view' | 'users:manage' | 'roles:view' | 'roles:manage' | 'audit:view' | 'settings:view' | 'settings:manage';

const VIEW_PERMISSIONS: Permission[] = ['production:view','quality:view','maintenance:view','material:view','andon:view','knowledge:view','pokayoke:view','handover:view'];
const BASIC_SHOPFLOOR: Permission[] = [...VIEW_PERMISSIONS,'production:report_output','quality:create_defect','maintenance:create_call','material:create_request','andon:create_call'];

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  OPERATOR: BASIC_SHOPFLOOR,
  LEADER: [...BASIC_SHOPFLOOR,'production:change_status','production:log_downtime','quality:update_containment','andon:acknowledge','andon:arrive','andon:resolve','knowledge:create','pokayoke:test_rule','handover:generate'],
  SUPERVISOR: [...BASIC_SHOPFLOOR,'production:edit_target','production:change_status','production:log_downtime','quality:update_containment','quality:countermeasure','andon:acknowledge','andon:arrive','andon:resolve','andon:close','knowledge:create','knowledge:verify','pokayoke:test_rule','handover:generate','handover:sign_off','masterdata:view','audit:view'],
  MANAGER: [...VIEW_PERMISSIONS,'production:edit_target','handover:sign_off','masterdata:view','users:view','roles:view','audit:view','settings:view'],
  // ADMIN is system authority, not automatic process authority.
  ADMIN: ['masterdata:view','masterdata:manage','users:view','users:manage','roles:view','roles:manage','audit:view','settings:view','settings:manage'],
};

const DEPARTMENT_PERMISSIONS: Record<DepartmentType, Permission[]> = {
  PRODUCTION: ['production:view','production:edit_target','production:report_output','production:change_status','production:log_downtime','quality:view','maintenance:view','material:view','material:create_request','andon:view','andon:create_call','knowledge:view','handover:view','handover:generate'],
  QUALITY: ['production:view','quality:view','quality:create_defect','quality:update_containment','quality:countermeasure','quality:verify_close','maintenance:view','material:view','andon:view','andon:create_call','andon:acknowledge','andon:arrive','andon:resolve','knowledge:view','knowledge:create','knowledge:verify','pokayoke:view','pokayoke:test_rule','pokayoke:create_rule','handover:view','audit:view','masterdata:view'],
  ENGINEERING: ['production:view','quality:view','quality:countermeasure','maintenance:view','maintenance:create_call','maintenance:log_repair','andon:view','andon:acknowledge','andon:arrive','andon:resolve','knowledge:view','knowledge:create','knowledge:verify','pokayoke:view','pokayoke:test_rule','pokayoke:create_rule','pokayoke:toggle_rule','handover:view','audit:view','masterdata:view','masterdata:manage'],
  MAINTENANCE: ['production:view','maintenance:view','maintenance:create_call','maintenance:assign_tech','maintenance:log_repair','maintenance:close_ticket','andon:view','andon:acknowledge','andon:arrive','andon:resolve','knowledge:view','knowledge:create','pokayoke:view','handover:view','audit:view','masterdata:view'],
  MATERIAL: ['production:view','material:view','material:create_request','material:dispatch','material:adjust_stock','andon:view','andon:acknowledge','andon:arrive','andon:resolve','handover:view','audit:view','masterdata:view'],
  PPIC: ['production:view','production:edit_target','material:view','handover:view','masterdata:view'],
  WAREHOUSE: ['production:view','material:view','material:create_request','material:dispatch','material:adjust_stock','handover:view'],
  IT: ['masterdata:view','masterdata:manage','users:view','users:manage','roles:view','roles:manage','audit:view','settings:view','settings:manage'],
};

export const MODULE_REQUIRED_PERMISSIONS: Record<ModuleId, Permission> = { dashboard:'production:view', production:'production:view', quality:'quality:view', maintenance:'maintenance:view', material:'material:view', people:'users:view', andon:'andon:view', knowledge:'knowledge:view', 'poka-yoke':'pokayoke:view', handover:'handover:view', analytics:'production:view', masterdata:'masterdata:view', users:'users:view', roles:'roles:view', audit:'audit:view', settings:'settings:view' };

export function hasPermission(role: RoleType, permission: Permission): boolean { return (ROLE_PERMISSIONS[role] || []).includes(permission); }
export function hasDepartmentPermission(department: DepartmentType, permission: Permission): boolean { return (DEPARTMENT_PERMISSIONS[department] || []).includes(permission); }

export interface ResourceScope { plantId?: string; areaId?: string; lineId?: string; machineId?: string; }
export function hasScope(scope: AccessScope, resource?: ResourceScope): boolean {
  if (!resource) return true;
  if (scope.type === 'PLANT') return !scope.plantId || !resource.plantId || scope.plantId === resource.plantId;
  if (scope.type === 'AREA') return !resource.areaId || (scope.areaIds || []).includes(resource.areaId);
  if (scope.type === 'LINE') return !resource.lineId || (scope.lineIds || []).includes(resource.lineId);
  if (scope.type === 'MACHINE') return !resource.machineId || (scope.machineIds || []).includes(resource.machineId);
  return false;
}

export function authorize(user: User, permission: Permission, resource?: ResourceScope): boolean {
  if (!user.active) return false;
  // System admin rights remain restricted to IT; operational rights never come from ADMIN role.
  const roleAllows = hasPermission(user.role, permission);
  const departmentAllows = hasDepartmentPermission(user.department, permission);
  const isSystemPermission = permission.startsWith('users:') || permission.startsWith('roles:') || permission.startsWith('settings:') || permission === 'masterdata:manage';
  const permissionAllowed = isSystemPermission ? roleAllows && departmentAllows : roleAllows && departmentAllows;
  return permissionAllowed && hasScope(user.accessScope, resource);
}

export function canAccessModule(role: RoleType, moduleId: ModuleId): boolean { const required = MODULE_REQUIRED_PERMISSIONS[moduleId]; return required ? hasPermission(role, required) : false; }
export function canAccessModuleForUser(user: User, moduleId: ModuleId, resource?: ResourceScope): boolean { const required = MODULE_REQUIRED_PERMISSIONS[moduleId]; return required ? authorize(user, required, resource) : false; }
export function canPerformAction(role: RoleType, actionPermission: Permission): boolean { return hasPermission(role, actionPermission); }
