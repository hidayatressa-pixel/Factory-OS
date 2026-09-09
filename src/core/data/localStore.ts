// Local / In-Memory & Storage-backed Repository Implementations
// Decoupled architecture allowing simple swap to REST/PostgreSQL/Supabase

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
import {
  IMasterDataRepository,
  IProductionRepository,
  IQualityRepository,
  IMaintenanceRepository,
  IMaterialRepository,
  IAndonRepository,
  IKnowledgeRepository,
  IPokaYokeRepository,
  IShiftHandoverRepository,
} from './types';
import {
  INITIAL_LINES,
  INITIAL_MACHINES,
  INITIAL_PARTS,
  INITIAL_ORDERS,
  INITIAL_DOWNTIMES,
  INITIAL_DEFECTS,
  INITIAL_MAINTENANCE,
  INITIAL_MATERIALS,
  INITIAL_MATERIAL_REQUESTS,
  INITIAL_ANDON_CALLS,
  INITIAL_KNOWLEDGE,
  INITIAL_POKA_YOKE_RULES,
  INITIAL_HANDOVERS,
} from './mockData';

// Storage Helper with fallback
function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    const val = localStorage.getItem(`factory_os_data_${key}`);
    if (val) return JSON.parse(val);
  } catch (err) {
    console.warn(`Failed reading ${key} from localStorage, using defaults`, err);
  }
  return defaultData;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`factory_os_data_${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed saving ${key} to localStorage`, err);
  }
}

// 1. Master Data Repository
export class LocalMasterDataRepository implements IMasterDataRepository {
  private lines: ManufacturingLine[] = loadFromStorage('lines', INITIAL_LINES);
  private machines: Machine[] = loadFromStorage('machines', INITIAL_MACHINES);
  private parts: Part[] = loadFromStorage('parts', INITIAL_PARTS);

  async getLines(): Promise<ManufacturingLine[]> {
    return [...this.lines];
  }

  async getMachines(): Promise<Machine[]> {
    return [...this.machines];
  }

  async getParts(): Promise<Part[]> {
    return [...this.parts];
  }

  async updateLineStatus(lineId: string, status: ProductionStatus): Promise<ManufacturingLine> {
    const index = this.lines.findIndex((l) => l.id === lineId);
    if (index === -1) throw new Error(`Line ${lineId} not found`);
    this.lines[index] = { ...this.lines[index], status };
    saveToStorage('lines', this.lines);
    return this.lines[index];
  }

  resetToDefaults(): void {
    this.lines = INITIAL_LINES;
    this.machines = INITIAL_MACHINES;
    this.parts = INITIAL_PARTS;
    saveToStorage('lines', this.lines);
    saveToStorage('machines', this.machines);
    saveToStorage('parts', this.parts);
  }
}

// 2. Production Repository
export class LocalProductionRepository implements IProductionRepository {
  private orders: ProductionOrder[] = loadFromStorage('orders', INITIAL_ORDERS);
  private downtimes: LineDowntimeEvent[] = loadFromStorage('downtimes', INITIAL_DOWNTIMES);

  async getOrders(): Promise<ProductionOrder[]> {
    return [...this.orders];
  }

  async getOrderById(id: string): Promise<ProductionOrder | null> {
    const order = this.orders.find((o) => o.id === id);
    return order ? { ...order } : null;
  }

  async getOrderByLineId(lineId: string): Promise<ProductionOrder | null> {
    const order = this.orders.find((o) => o.lineId === lineId && o.status !== 'IDLE');
    return order ? { ...order } : null;
  }

  async reportActualOutput(orderId: string, quantity: number, scrap: number = 0): Promise<ProductionOrder> {
    const index = this.orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error(`Order ${orderId} not found`);
    const current = this.orders[index];
    const newActual = current.actualQuantity + quantity;
    const newScrap = current.scrapQuantity + scrap;

    // Update current hour bucket if available
    const hourly = [...current.hourlyOutput];
    if (hourly.length > 0) {
      const lastIndex = hourly.length - 1;
      hourly[lastIndex] = {
        ...hourly[lastIndex],
        actual: hourly[lastIndex].actual + quantity,
        scrap: hourly[lastIndex].scrap + scrap,
      };
    }

    this.orders[index] = {
      ...current,
      actualQuantity: newActual,
      scrapQuantity: newScrap,
      hourlyOutput: hourly,
    };
    saveToStorage('orders', this.orders);
    return this.orders[index];
  }

  async updateOrderStatus(orderId: string, status: ProductionStatus): Promise<ProductionOrder> {
    const index = this.orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error(`Order ${orderId} not found`);
    this.orders[index] = { ...this.orders[index], status };
    saveToStorage('orders', this.orders);
    return this.orders[index];
  }

  async getDowntimes(lineId?: string): Promise<LineDowntimeEvent[]> {
    if (!lineId) return [...this.downtimes];
    return this.downtimes.filter((d) => d.lineId === lineId);
  }

  async logDowntime(event: Omit<LineDowntimeEvent, 'id'>): Promise<LineDowntimeEvent> {
    const newEvent: LineDowntimeEvent = {
      ...event,
      id: `dt-${Date.now().toString(36)}`,
    };
    this.downtimes = [newEvent, ...this.downtimes];
    saveToStorage('downtimes', this.downtimes);
    return newEvent;
  }
}

// 3. Quality Repository
export class LocalQualityRepository implements IQualityRepository {
  private defects: QualityDefect[] = loadFromStorage('defects', INITIAL_DEFECTS);

  async getDefects(lineId?: string): Promise<QualityDefect[]> {
    if (!lineId) return [...this.defects];
    return this.defects.filter((d) => d.lineId === lineId);
  }

  async getDefectById(id: string): Promise<QualityDefect | null> {
    const def = this.defects.find((d) => d.id === id);
    return def ? { ...def } : null;
  }

  async createDefect(defect: Omit<QualityDefect, 'id' | 'defectNumber' | 'createdAt' | 'updatedAt' | 'status'>): Promise<QualityDefect> {
    const newDefect: QualityDefect = {
      ...defect,
      id: `def-${Date.now().toString(36)}`,
      defectNumber: `QA-2026-${String(this.defects.length + 1).padStart(3, '0')}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.defects = [newDefect, ...this.defects];
    saveToStorage('defects', this.defects);
    return newDefect;
  }

  async advanceLifecycle(
    defectId: string,
    nextStatus: DefectLifecycle,
    payload: {
      actionNotes?: string;
      containmentAction?: string;
      countermeasure?: string;
      verificationNotes?: string;
    }
  ): Promise<QualityDefect> {
    const index = this.defects.findIndex((d) => d.id === defectId);
    if (index === -1) throw new Error(`Defect ${defectId} not found`);
    const current = this.defects[index];
    const updated: QualityDefect = {
      ...current,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      closedAt: nextStatus === 'CLOSED' ? new Date().toISOString() : current.closedAt,
      containmentAction: payload.containmentAction || current.containmentAction,
      countermeasure: payload.countermeasure || current.countermeasure,
      verificationNotes: payload.verificationNotes || current.verificationNotes,
    };
    this.defects[index] = updated;
    saveToStorage('defects', this.defects);
    return updated;
  }

  async getParetoStats(): Promise<Array<{ category: string; count: number; percentage: number }>> {
    const counts: Record<string, number> = {};
    let total = 0;
    this.defects.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + d.quantity;
      total += d.quantity;
    });

    const categories = Object.keys(counts).map((category) => ({
      category,
      count: counts[category],
      percentage: total > 0 ? Math.round((counts[category] / total) * 100) : 0,
    }));

    return categories.sort((a, b) => b.count - a.count);
  }
}

// 4. Maintenance Repository
export class LocalMaintenanceRepository implements IMaintenanceRepository {
  private requests: MaintenanceRequest[] = loadFromStorage('maintenance', INITIAL_MAINTENANCE);

  async getRequests(machineId?: string): Promise<MaintenanceRequest[]> {
    if (!machineId) return [...this.requests];
    return this.requests.filter((r) => r.machineId === machineId);
  }

  async createRequest(request: Omit<MaintenanceRequest, 'id' | 'ticketNumber' | 'requestTime' | 'status'>): Promise<MaintenanceRequest> {
    const newReq: MaintenanceRequest = {
      ...request,
      id: `maint-${Date.now().toString(36)}`,
      ticketNumber: `MT-2026-${String(this.requests.length + 80).padStart(3, '0')}`,
      status: 'REPORTED',
      requestTime: new Date().toISOString(),
    };
    this.requests = [newReq, ...this.requests];
    saveToStorage('maintenance', this.requests);
    return newReq;
  }

  async assignTechnician(requestId: string, techId: string, techName: string): Promise<MaintenanceRequest> {
    const index = this.requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error(`Maintenance ticket ${requestId} not found`);
    this.requests[index] = {
      ...this.requests[index],
      technicianId: techId,
      technicianName: techName,
      status: 'ACKNOWLEDGED',
      arrivalTime: new Date().toISOString(),
    };
    saveToStorage('maintenance', this.requests);
    return this.requests[index];
  }

  async updateRequestStatus(
    requestId: string,
    status: MaintenanceRequestStatus,
    details?: {
      actionTaken?: string;
      rootCause?: string;
      spareParts?: string[];
      downtimeMinutes?: number;
    }
  ): Promise<MaintenanceRequest> {
    const index = this.requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error(`Maintenance ticket ${requestId} not found`);
    const current = this.requests[index];
    const now = new Date().toISOString();

    const updated: MaintenanceRequest = {
      ...current,
      status,
      actionTaken: details?.actionTaken || current.actionTaken,
      rootCause: details?.rootCause || current.rootCause,
      sparePartsUsed: details?.spareParts || current.sparePartsUsed,
      downtimeMinutes: details?.downtimeMinutes ?? current.downtimeMinutes,
      repairStartTime: status === 'IN_PROGRESS' && !current.repairStartTime ? now : current.repairStartTime,
      finishTime: (status === 'RESOLVED' || status === 'CLOSED') && !current.finishTime ? now : current.finishTime,
    };
    this.requests[index] = updated;
    saveToStorage('maintenance', this.requests);
    return updated;
  }
}

// 5. Material Repository
export class LocalMaterialRepository implements IMaterialRepository {
  private items: MaterialItem[] = loadFromStorage('materials', INITIAL_MATERIALS);
  private requests: MaterialRequest[] = loadFromStorage('material_requests', INITIAL_MATERIAL_REQUESTS);

  async getItems(): Promise<MaterialItem[]> {
    return [...this.items];
  }

  async getItemByPartNumber(partNumber: string): Promise<MaterialItem | null> {
    const found = this.items.find((m) => m.partNumber.toLowerCase() === partNumber.toLowerCase());
    return found ? { ...found } : null;
  }

  async getRequests(): Promise<MaterialRequest[]> {
    return [...this.requests];
  }

  async createRequest(request: Omit<MaterialRequest, 'id' | 'requestId' | 'requestedAt' | 'status'>): Promise<MaterialRequest> {
    const newReq: MaterialRequest = {
      ...request,
      id: `mreq-${Date.now().toString(36)}`,
      requestId: `MR-2026-${String(this.requests.length + 42).padStart(3, '0')}`,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };
    this.requests = [newReq, ...this.requests];
    saveToStorage('material_requests', this.requests);
    return newReq;
  }

  async updateRequestStatus(requestId: string, status: 'PENDING' | 'DISPATCHED' | 'DELIVERED'): Promise<MaterialRequest> {
    const index = this.requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error(`Material request ${requestId} not found`);
    const current = this.requests[index];
    const updated: MaterialRequest = {
      ...current,
      status,
      dispatchedAt: status === 'DISPATCHED' ? new Date().toISOString() : current.dispatchedAt,
    };
    this.requests[index] = updated;
    saveToStorage('material_requests', this.requests);
    return updated;
  }

  async adjustStock(itemId: string, newStock: number): Promise<MaterialItem> {
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index === -1) throw new Error(`Material item ${itemId} not found`);
    const current = this.items[index];
    let newStatus = current.status;
    if (newStock <= 0 || newStock < current.safetyStock * 0.5) {
      newStatus = 'SHORTAGE';
    } else if (newStock <= current.safetyStock) {
      newStatus = 'LOW_STOCK';
    } else {
      newStatus = 'NORMAL';
    }
    this.items[index] = {
      ...current,
      currentStock: newStock,
      status: newStatus,
    };
    saveToStorage('materials', this.items);
    return this.items[index];
  }
}

// 6. Andon Repository
export class LocalAndonRepository implements IAndonRepository {
  private calls: AndonCall[] = loadFromStorage('andon', INITIAL_ANDON_CALLS);

  async getCalls(lineId?: string): Promise<AndonCall[]> {
    if (!lineId) return [...this.calls];
    return this.calls.filter((c) => c.lineId === lineId);
  }

  async createCall(call: {
    type: AndonCallType;
    lineId: string;
    lineName: string;
    stationOrMachine: string;
    description: string;
    operatorId: string;
    operatorName: string;
  }): Promise<AndonCall> {
    const now = new Date().toISOString();
    const newCall: AndonCall = {
      id: `and-${Date.now().toString(36)}`,
      callNumber: `AD-2026-${String(this.calls.length + 15).padStart(3, '0')}`,
      type: call.type,
      lineId: call.lineId,
      lineName: call.lineName,
      stationOrMachine: call.stationOrMachine,
      status: 'NEW',
      description: call.description,
      operatorId: call.operatorId,
      operatorName: call.operatorName,
      createdAt: now,
    };
    this.calls = [newCall, ...this.calls];
    saveToStorage('andon', this.calls);
    return newCall;
  }

  async advanceStatus(
    callId: string,
    nextStatus: AndonStatus,
    responder?: { id: string; name: string },
    notes?: string
  ): Promise<AndonCall> {
    const index = this.calls.findIndex((c) => c.id === callId);
    if (index === -1) throw new Error(`Andon call ${callId} not found`);
    const current = this.calls[index];
    const now = new Date().toISOString();
    const nowMs = Date.now();
    const createdMs = new Date(current.createdAt).getTime();

    const updated: AndonCall = {
      ...current,
      status: nextStatus,
      notes: notes || current.notes,
      responderId: responder?.id || current.responderId,
      responderName: responder?.name || current.responderName,
    };

    if (nextStatus === 'ACKNOWLEDGED' && !current.acknowledgedAt) {
      updated.acknowledgedAt = now;
      updated.responseDurationSeconds = Math.round((nowMs - createdMs) / 1000);
    } else if (nextStatus === 'ARRIVED' && !current.arrivedAt) {
      updated.arrivedAt = now;
    } else if (nextStatus === 'COUNTERMEASURE' && !current.countermeasureAt) {
      updated.countermeasureAt = now;
    } else if (nextStatus === 'VERIFICATION' && !current.verifiedAt) {
      updated.verifiedAt = now;
    } else if (nextStatus === 'CLOSED' && !current.closedAt) {
      updated.closedAt = now;
      updated.totalDurationSeconds = Math.round((nowMs - createdMs) / 1000);
    }

    this.calls[index] = updated;
    saveToStorage('andon', this.calls);
    return updated;
  }
}

// 7. Knowledge Repository
export class LocalKnowledgeRepository implements IKnowledgeRepository {
  private cases: KnowledgeCase[] = loadFromStorage('knowledge', INITIAL_KNOWLEDGE);

  async getCases(query?: string, category?: string): Promise<KnowledgeCase[]> {
    let result = [...this.cases];
    if (category && category !== 'ALL') {
      result = result.filter((c) => c.category === category);
    }
    if (query && query.trim() !== '') {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.problem.toLowerCase().includes(q) ||
          c.symptom.toLowerCase().includes(q) ||
          c.rootCause.toLowerCase().includes(q) ||
          c.countermeasure.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async getCaseById(id: string): Promise<KnowledgeCase | null> {
    const found = this.cases.find((c) => c.id === id);
    return found ? { ...found } : null;
  }

  async createCase(kCase: Omit<KnowledgeCase, 'id' | 'caseNumber' | 'createdAt'>): Promise<KnowledgeCase> {
    const newCase: KnowledgeCase = {
      ...kCase,
      id: `kn-${Date.now().toString(36)}`,
      caseNumber: `KB-GEN-${String(this.cases.length + 50).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    this.cases = [newCase, ...this.cases];
    saveToStorage('knowledge', this.cases);
    return newCase;
  }

  async verifyCase(caseId: string, verifierName: string): Promise<KnowledgeCase> {
    const index = this.cases.findIndex((c) => c.id === caseId);
    if (index === -1) throw new Error(`Knowledge case ${caseId} not found`);
    this.cases[index] = {
      ...this.cases[index],
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString(),
    };
    saveToStorage('knowledge', this.cases);
    return this.cases[index];
  }
}

// 8. Poka-Yoke Repository & Evaluation Engine
export class LocalPokaYokeRepository implements IPokaYokeRepository {
  private rules: PokaYokeRule[] = loadFromStorage('pokayoke_rules', INITIAL_POKA_YOKE_RULES);

  async getRules(): Promise<PokaYokeRule[]> {
    return [...this.rules];
  }

  async toggleRule(ruleId: string, enabled: boolean): Promise<PokaYokeRule> {
    const index = this.rules.findIndex((r) => r.id === ruleId);
    if (index === -1) throw new Error(`Rule ${ruleId} not found`);
    this.rules[index] = { ...this.rules[index], enabled };
    saveToStorage('pokayoke_rules', this.rules);
    return this.rules[index];
  }

  async createRule(rule: Omit<PokaYokeRule, 'id' | 'ruleCode' | 'triggerCount'>): Promise<PokaYokeRule> {
    const newRule: PokaYokeRule = {
      ...rule,
      id: `pyr-${Date.now().toString(36)}`,
      ruleCode: `PYK-USR-${String(this.rules.length + 10).padStart(3, '0')}`,
      triggerCount: 0,
    };
    this.rules = [newRule, ...this.rules];
    saveToStorage('pokayoke_rules', this.rules);
    return newRule;
  }

  async evaluateExecution(ruleId: string, payload: Record<string, unknown>): Promise<PokaYokeExecutionResult> {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);

    if (!rule.enabled) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        passed: true,
        message: 'Rule is disabled (Bypassed)',
        timestamp: new Date().toISOString(),
        inputPayload: payload,
      };
    }

    const val = payload[rule.conditionField];
    let passed = true;
    let message = 'Verification Passed';

    switch (rule.operator) {
      case 'EQUALS':
        passed = String(val) === rule.expectedValue;
        if (!passed) message = `Condition violation: value '${val}' does not equal expected '${rule.expectedValue}'`;
        break;
      case 'NOT_EQUALS':
        passed = String(val) !== rule.expectedValue;
        if (!passed) message = `Condition violation: value '${val}' matches restricted value`;
        break;
      case 'GREATER_THAN':
        passed = Number(val) > Number(rule.expectedValue);
        if (!passed) message = `Threshold violation: ${val} is not greater than required ${rule.expectedValue}`;
        break;
      case 'LESS_THAN':
        passed = Number(val) < Number(rule.expectedValue);
        if (!passed) message = `Threshold violation: ${val} exceeds allowable maximum ${rule.expectedValue}`;
        break;
      case 'CONTAINS':
        passed = String(val).includes(rule.expectedValue);
        if (!passed) message = `String '${val}' does not contain required substring '${rule.expectedValue}'`;
        break;
      case 'IS_DUPLICATE':
        // Simulated duplicate check
        passed = val !== 'DUPLICATE_SAMPLE' && val !== 'PT-SERIAL-88192-ALREADY-USED';
        if (!passed) message = `Duplicate barcode detected: '${val}' was already processed in current batch!`;
        break;
      default:
        passed = true;
    }

    if (!passed) {
      // Increment trigger count
      const index = this.rules.findIndex((r) => r.id === ruleId);
      if (index !== -1) {
        this.rules[index] = {
          ...this.rules[index],
          triggerCount: this.rules[index].triggerCount + 1,
          lastTriggered: new Date().toISOString(),
        };
        saveToStorage('pokayoke_rules', this.rules);
      }
    }

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      passed,
      triggeredAction: !passed ? rule.action : undefined,
      message,
      timestamp: new Date().toISOString(),
      inputPayload: payload,
    };
  }
}

// 9. Shift Handover Repository
export class LocalShiftHandoverRepository implements IShiftHandoverRepository {
  private handovers: ShiftHandover[] = loadFromStorage('handovers', INITIAL_HANDOVERS);

  async getHandovers(): Promise<ShiftHandover[]> {
    return [...this.handovers];
  }

  async generateDeterministicHandover(params: {
    lineId: string;
    shiftFrom: string;
    shiftTo: string;
    preparedBy: string;
    preparedRole: string;
  }): Promise<ShiftHandover> {
    // Collect real-time metrics from current state
    const lines = loadFromStorage<ManufacturingLine[]>('lines', INITIAL_LINES);
    const orders = loadFromStorage<ProductionOrder[]>('orders', INITIAL_ORDERS);
    const downtimes = loadFromStorage<LineDowntimeEvent[]>('downtimes', INITIAL_DOWNTIMES);
    const defects = loadFromStorage<QualityDefect[]>('defects', INITIAL_DEFECTS);
    const materials = loadFromStorage<MaterialItem[]>('materials', INITIAL_MATERIALS);
    const andons = loadFromStorage<AndonCall[]>('andon', INITIAL_ANDON_CALLS);

    const targetLine = lines.find((l) => l.id === params.lineId) || lines[0];
    const order = orders.find((o) => o.lineId === params.lineId) || orders[0];

    const achievement =
      order.targetQuantity > 0
        ? Math.round((order.actualQuantity / order.targetQuantity) * 1000) / 10
        : 0;

    const lineDowntimes = downtimes.filter((d) => d.lineId === params.lineId);
    const totalDowntimeMin = lineDowntimes.reduce((acc, d) => acc + d.durationMinutes, 0);

    const openIssues = andons
      .filter((a) => a.lineId === params.lineId && a.status !== 'CLOSED')
      .map((a) => ({
        id: a.id,
        title: `${a.stationOrMachine}: ${a.description}`,
        module: (a.type === 'MACHINE' ? 'MAINTENANCE' : a.type === 'QUALITY' ? 'QUALITY' : a.type === 'MATERIAL' ? 'MATERIAL' : 'ANDON') as 'PRODUCTION' | 'QUALITY' | 'MAINTENANCE' | 'MATERIAL' | 'ANDON',
        pic: a.responderName || 'Unassigned',
        status: a.status,
      }));

    const lineDefects = defects
      .filter((d) => d.lineId === params.lineId)
      .map((d) => ({ defect: d.description, qty: d.quantity }));

    const shortages = materials
      .filter((m) => m.status === 'SHORTAGE')
      .map((m) => ({ partNumber: m.partNumber, description: m.description, status: 'CRITICAL SHORTAGE' }));

    const priorities = [
      `Maintain ${targetLine.name} takt pace to hit ${order.targetQuantity} units target`,
      openIssues.length > 0 ? `Resolve open issue on ${openIssues[0].title}` : 'Perform first-piece dimensional verification at start of run',
      shortages.length > 0 ? `Verify replenishment for ${shortages[0].partNumber}` : 'Standard 5S inspection at end of shift',
    ];

    const generatedText = `${params.shiftFrom} → ${params.shiftTo} Handover Summary
Line: ${targetLine.name} (${targetLine.code})
Production Achievement: ${achievement}% (${order.actualQuantity} / ${order.targetQuantity} pcs)
Line Stops: ${lineDowntimes.length} events (${totalDowntimeMin} mins total downtime)

Open Issues:
${openIssues.length > 0 ? openIssues.map((i) => `- [${i.module}] ${i.title} (PIC: ${i.pic}, Status: ${i.status})`).join('\n') : '- None (All clear)'}

Quality Issues:
${lineDefects.length > 0 ? lineDefects.map((d) => `- ${d.defect} (${d.qty} pcs)`).join('\n') : '- Zero defects recorded'}

Material Shortages:
${shortages.length > 0 ? shortages.map((s) => `- ${s.partNumber}: ${s.description}`).join('\n') : '- Stocks within nominal safety limits'}

Next Shift Priorities:
1. ${priorities[0]}
2. ${priorities[1]}
3. ${priorities[2]}`;

    const newHandover: ShiftHandover = {
      id: `sho-${Date.now().toString(36)}`,
      handoverCode: `HO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${params.shiftFrom.slice(0, 7)}-${params.shiftTo.slice(0, 7)}`,
      lineId: targetLine.id,
      lineName: targetLine.name,
      shiftFrom: params.shiftFrom,
      shiftTo: params.shiftTo,
      date: new Date().toISOString().slice(0, 10),
      productionAchievementPct: achievement,
      actualQuantity: order.actualQuantity,
      targetQuantity: order.targetQuantity,
      lineStopsCount: lineDowntimes.length,
      totalDowntimeMinutes: totalDowntimeMin,
      openIssues,
      qualityDefectsSummary: lineDefects,
      materialShortages: shortages,
      prioritiesForNextShift: priorities,
      preparedBy: params.preparedBy,
      preparedRole: params.preparedRole,
      generatedSummaryText: generatedText,
    };

    this.handovers = [newHandover, ...this.handovers];
    saveToStorage('handovers', this.handovers);
    return newHandover;
  }

  async signOffHandover(handoverId: string, signedByName: string, notes?: string): Promise<ShiftHandover> {
    const index = this.handovers.findIndex((h) => h.id === handoverId);
    if (index === -1) throw new Error(`Handover ${handoverId} not found`);
    const current = this.handovers[index];
    this.handovers[index] = {
      ...current,
      acknowledgedBy: signedByName,
      signedOffAt: new Date().toISOString(),
      notes: notes || current.notes,
    };
    saveToStorage('handovers', this.handovers);
    return this.handovers[index];
  }
}
