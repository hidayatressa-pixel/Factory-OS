// FACTORY OS - Core Type Definitions
// Industrial Modular Shop-Floor Platform

export type RoleType =
  | 'OPERATOR'
  | 'LEADER'
  | 'SUPERVISOR'
  | 'PRODUCTION'
  | 'QUALITY'
  | 'ENGINEERING'
  | 'MAINTENANCE'
  | 'MATERIAL'
  | 'MANAGER'
  | 'ADMIN';

export interface User {
  id: string;
  name: string;
  badgeNumber: string;
  email: string;
  role: RoleType;
  department: string;
  assignedLineId?: string;
  avatarUrl?: string;
  active: boolean;
}

export type ModuleStatus = 'IMPLEMENTED' | 'FOUNDATION ONLY' | 'PLANNED';

export type ModuleId =
  | 'dashboard'
  | 'production'
  | 'quality'
  | 'maintenance'
  | 'material'
  | 'people'
  | 'andon'
  | 'knowledge'
  | 'poka-yoke'
  | 'handover'
  | 'analytics'
  | 'masterdata'
  | 'users'
  | 'roles'
  | 'audit'
  | 'settings';

export interface ModuleInfo {
  id: ModuleId;
  name: string;
  tagline: string;
  iconName: string;
  status: ModuleStatus;
  category: 'operations' | 'support' | 'system';
  requiredPermission?: string;
  description: string;
}

// Master Data Types
export interface ManufacturingLine {
  id: string;
  code: string;
  name: string;
  area: string;
  currentShift: 'Shift A' | 'Shift B' | 'Shift C';
  taktTimeSec: number;
  plannedOperatingHours: number;
  activeOrderId?: string;
  status: ProductionStatus;
}

export interface Machine {
  id: string;
  lineId: string;
  code: string;
  name: string;
  station: string;
  status: MachineStatus;
  model: string;
  serialNumber: string;
  installDate: string;
  lastServiceDate: string;
  mttrMinutes: number; // Mean Time to Repair (mins)
  mtbfHours: number;   // Mean Time Between Failures (hours)
}

export interface Part {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  unit: string;
  cycleTimeSec: number;
  linesAllowed: string[];
}

// Production Types
export type ProductionStatus =
  | 'RUNNING'
  | 'WARNING'
  | 'STOPPED'
  | 'CHANGEOVER'
  | 'IDLE';

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  lineId: string;
  partId: string;
  partNumber: string;
  partName: string;
  targetQuantity: number;
  actualQuantity: number;
  scrapQuantity: number;
  shift: string;
  status: ProductionStatus;
  startTime: string;
  endTime?: string;
  hourlyOutput: HourlyBucket[];
}

export interface HourlyBucket {
  hourLabel: string;
  target: number;
  actual: number;
  scrap: number;
}

export interface LineDowntimeEvent {
  id: string;
  lineId: string;
  machineId?: string;
  orderId?: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  reasonCategory: 'MACHINE' | 'QUALITY' | 'MATERIAL' | 'CHANGEOVER' | 'OPERATIONAL';
  description: string;
  reportedBy: string;
  resolvedBy?: string;
}

// Quality Types
export type DefectLifecycle =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'CONTAINMENT'
  | 'COUNTERMEASURE'
  | 'VERIFICATION'
  | 'CLOSED';

export interface QualityDefect {
  id: string;
  defectNumber: string;
  lineId: string;
  machineId?: string;
  processName: string;
  partId: string;
  partNumber: string;
  category: 'DIMENSION' | 'COSMETIC' | 'FUNCTIONAL' | 'ASSEMBLY' | 'CONTAMINATION' | 'OTHER';
  description: string;
  quantity: number;
  evidenceNotes?: string;
  picId: string;
  picName: string;
  status: DefectLifecycle;
  containmentAction?: string;
  countermeasure?: string;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

// Maintenance Types
export type MachineStatus = 'OPERATIONAL' | 'DEGRADED' | 'BREAKDOWN' | 'MAINTENANCE' | 'OFFLINE';

export type MaintenanceRequestStatus =
  | 'REPORTED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export interface MaintenanceRequest {
  id: string;
  ticketNumber: string;
  machineId: string;
  machineName: string;
  lineId: string;
  lineName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  symptom: string;
  status: MaintenanceRequestStatus;
  reportedBy: string;
  technicianId?: string;
  technicianName?: string;
  requestTime: string;
  arrivalTime?: string;
  repairStartTime?: string;
  finishTime?: string;
  downtimeMinutes?: number;
  rootCause?: string;
  actionTaken?: string;
  sparePartsUsed?: string[];
}

// Material Types
export type MaterialStockStatus = 'NORMAL' | 'LOW_STOCK' | 'SHORTAGE';

export interface MaterialItem {
  id: string;
  partNumber: string;
  description: string;
  category: 'RAW_MATERIAL' | 'COMPONENT' | 'PACKAGING' | 'CONSUMABLE';
  currentStock: number;
  safetyStock: number;
  wipStock: number;
  unit: string;
  location: string;
  fifoLotNumber: string;
  status: MaterialStockStatus;
  kanbanBinId: string;
}

export interface MaterialRequest {
  id: string;
  requestId: string;
  lineId: string;
  partNumber: string;
  requestedQty: number;
  urgency: 'URGENT' | 'NORMAL';
  status: 'PENDING' | 'DISPATCHED' | 'DELIVERED';
  requestedAt: string;
  dispatchedAt?: string;
  requesterName: string;
}

// Andon Types
export type AndonCallType = 'LEADER' | 'MACHINE' | 'MATERIAL' | 'QUALITY';

export type AndonStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'ARRIVED'
  | 'INVESTIGATING'
  | 'COUNTERMEASURE'
  | 'VERIFICATION'
  | 'CLOSED';

export interface AndonCall {
  id: string;
  callNumber: string;
  type: AndonCallType;
  lineId: string;
  lineName: string;
  stationOrMachine: string;
  status: AndonStatus;
  description: string;
  operatorId: string;
  operatorName: string;
  responderId?: string;
  responderName?: string;
  createdAt: string;
  acknowledgedAt?: string;
  arrivedAt?: string;
  countermeasureAt?: string;
  verifiedAt?: string;
  closedAt?: string;
  responseDurationSeconds?: number;
  totalDurationSeconds?: number;
  notes?: string;
}

// Knowledge Vault Types
export interface KnowledgeCase {
  id: string;
  caseNumber: string;
  problem: string;
  machineId?: string;
  machineName?: string;
  lineId: string;
  lineName: string;
  process: string;
  symptom: string;
  rootCause: string;
  countermeasure: string;
  evidenceNotes: string;
  result: string;
  category: 'TOOLING' | 'ELECTRICAL' | 'PNEUMATICS' | 'QUALITY' | 'OPERATIONAL';
  createdBy: string;
  verifiedBy: string;
  createdAt: string;
  verifiedAt?: string;
  tags: string[];
}

// Digital Poka-Yoke Types
export type RuleConditionOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'CONTAINS'
  | 'IS_DUPLICATE';

export type RuleActionType =
  | 'BLOCK_PROCESS'
  | 'SHOW_ALERT'
  | 'TRIGGER_ANDON'
  | 'LOG_WARNING';

export interface PokaYokeRule {
  id: string;
  ruleCode: string;
  name: string;
  description: string;
  station: string;
  conditionField: string;
  operator: RuleConditionOperator;
  expectedValue: string;
  action: RuleActionType;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  enabled: boolean;
  triggerCount: number;
  lastTriggered?: string;
}

export interface PokaYokeExecutionResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  triggeredAction?: RuleActionType;
  message: string;
  timestamp: string;
  inputPayload: Record<string, unknown>;
}

// Shift Handover Types
export interface ShiftHandover {
  id: string;
  handoverCode: string;
  lineId: string;
  lineName: string;
  shiftFrom: string;
  shiftTo: string;
  date: string;
  productionAchievementPct: number;
  actualQuantity: number;
  targetQuantity: number;
  lineStopsCount: number;
  totalDowntimeMinutes: number;
  openIssues: Array<{
    id: string;
    title: string;
    module: 'PRODUCTION' | 'QUALITY' | 'MAINTENANCE' | 'MATERIAL' | 'ANDON';
    pic: string;
    status: string;
  }>;
  qualityDefectsSummary: Array<{
    defect: string;
    qty: number;
  }>;
  materialShortages: Array<{
    partNumber: string;
    description: string;
    status: string;
  }>;
  prioritiesForNextShift: string[];
  preparedBy: string;
  preparedRole: string;
  acknowledgedBy?: string;
  signedOffAt?: string;
  notes?: string;
  generatedSummaryText: string;
}

// Auditability Types
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'STATUS_CHANGE'
  | 'DELETE'
  | 'ACKNOWLEDGE'
  | 'DISPATCH'
  | 'VERIFY'
  | 'SIGN_OFF'
  | 'RULE_EVALUATION';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: RoleType;
  action: AuditAction;
  module: ModuleId;
  entity: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string;
}
