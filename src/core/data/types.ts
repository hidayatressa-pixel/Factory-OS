// Data Layer - Repository & Service Interfaces
// FACTORY OS - One Platform for the Shop Floor
// Allows decoupling UI from underlying persistence (Local, PostgreSQL, Supabase, REST)

import {
  ManufacturingLine,
  Machine,
  Part,
  ProductionOrder,
  LineDowntimeEvent,
  ProductionStatus,
  QualityDefect,
  DefectLifecycle,
  MaintenanceRequest,
  MaintenanceRequestStatus,
  MaterialItem,
  MaterialRequest,
  AndonCall,
  AndonStatus,
  AndonCallType,
  KnowledgeCase,
  PokaYokeRule,
  PokaYokeExecutionResult,
  ShiftHandover,
} from '../../types';

export interface IMasterDataRepository {
  getLines(): Promise<ManufacturingLine[]>;
  getMachines(): Promise<Machine[]>;
  getParts(): Promise<Part[]>;
  updateLineStatus(lineId: string, status: ProductionStatus): Promise<ManufacturingLine>;
}

export interface IProductionRepository {
  getOrders(): Promise<ProductionOrder[]>;
  getOrderById(id: string): Promise<ProductionOrder | null>;
  getOrderByLineId(lineId: string): Promise<ProductionOrder | null>;
  reportActualOutput(orderId: string, quantity: number, scrap?: number): Promise<ProductionOrder>;
  updateOrderStatus(orderId: string, status: ProductionStatus, reason?: string): Promise<ProductionOrder>;
  getDowntimes(lineId?: string): Promise<LineDowntimeEvent[]>;
  logDowntime(event: Omit<LineDowntimeEvent, 'id'>): Promise<LineDowntimeEvent>;
}

export interface IQualityRepository {
  getDefects(lineId?: string): Promise<QualityDefect[]>;
  getDefectById(id: string): Promise<QualityDefect | null>;
  createDefect(defect: Omit<QualityDefect, 'id' | 'defectNumber' | 'createdAt' | 'updatedAt' | 'status'>): Promise<QualityDefect>;
  advanceLifecycle(
    defectId: string,
    nextStatus: DefectLifecycle,
    payload: {
      actionNotes?: string;
      containmentAction?: string;
      countermeasure?: string;
      verificationNotes?: string;
    }
  ): Promise<QualityDefect>;
  getParetoStats(): Promise<Array<{ category: string; count: number; percentage: number }>>;
}

export interface IMaintenanceRepository {
  getRequests(machineId?: string): Promise<MaintenanceRequest[]>;
  createRequest(request: Omit<MaintenanceRequest, 'id' | 'ticketNumber' | 'requestTime' | 'status'>): Promise<MaintenanceRequest>;
  assignTechnician(requestId: string, techId: string, techName: string): Promise<MaintenanceRequest>;
  updateRequestStatus(
    requestId: string,
    status: MaintenanceRequestStatus,
    details?: {
      actionTaken?: string;
      rootCause?: string;
      spareParts?: string[];
      downtimeMinutes?: number;
    }
  ): Promise<MaintenanceRequest>;
}

export interface IMaterialRepository {
  getItems(): Promise<MaterialItem[]>;
  getItemByPartNumber(partNumber: string): Promise<MaterialItem | null>;
  getRequests(): Promise<MaterialRequest[]>;
  createRequest(request: Omit<MaterialRequest, 'id' | 'requestId' | 'requestedAt' | 'status'>): Promise<MaterialRequest>;
  updateRequestStatus(requestId: string, status: 'PENDING' | 'DISPATCHED' | 'DELIVERED'): Promise<MaterialRequest>;
  adjustStock(itemId: string, newStock: number, reason: string): Promise<MaterialItem>;
}

export interface IAndonRepository {
  getCalls(lineId?: string): Promise<AndonCall[]>;
  createCall(call: {
    type: AndonCallType;
    lineId: string;
    lineName: string;
    stationOrMachine: string;
    description: string;
    operatorId: string;
    operatorName: string;
  }): Promise<AndonCall>;
  advanceStatus(
    callId: string,
    nextStatus: AndonStatus,
    responder?: { id: string; name: string },
    notes?: string
  ): Promise<AndonCall>;
}

export interface IKnowledgeRepository {
  getCases(query?: string, category?: string): Promise<KnowledgeCase[]>;
  getCaseById(id: string): Promise<KnowledgeCase | null>;
  createCase(kCase: Omit<KnowledgeCase, 'id' | 'caseNumber' | 'createdAt'>): Promise<KnowledgeCase>;
  verifyCase(caseId: string, verifierName: string): Promise<KnowledgeCase>;
}

export interface IPokaYokeRepository {
  getRules(): Promise<PokaYokeRule[]>;
  toggleRule(ruleId: string, enabled: boolean): Promise<PokaYokeRule>;
  createRule(rule: Omit<PokaYokeRule, 'id' | 'ruleCode' | 'triggerCount'>): Promise<PokaYokeRule>;
  evaluateExecution(ruleId: string, payload: Record<string, unknown>): Promise<PokaYokeExecutionResult>;
}

export interface IShiftHandoverRepository {
  getHandovers(): Promise<ShiftHandover[]>;
  generateDeterministicHandover(params: {
    lineId: string;
    shiftFrom: string;
    shiftTo: string;
    preparedBy: string;
    preparedRole: string;
  }): Promise<ShiftHandover>;
  signOffHandover(handoverId: string, signedByName: string, notes?: string): Promise<ShiftHandover>;
}
