# FACTORY OS
> **"One Platform for the Shop Floor"**  
> A modular, auditable, and resilient shop-floor execution and operational visibility platform for small and medium manufacturing enterprises (SMEs).

---

## 1. Product Vision & Architecture Philosophy

**FACTORY OS is NOT an ERP replacement.**  
**FACTORY OS is NOT a generic analytics dashboard.**

Traditional manufacturing suites (SAP, Oracle, Epicor, Plex) are cost-prohibitive, complex, and slow to deploy for small-and-medium manufacturing operations. Conversely, generic SaaS dashboards lack domain models for takt times, OEE loss categorizations, containment locks, and Andon response cycles.

FACTORY OS bridges this gap by delivering **immediate shop-floor operational control**:
- **Modular Foundation**: Deploy only what the plant needs today (e.g., Line Tracking + Andon + Quality Containment) and scale into AI Handover or Poka-Yoke without architectural rewrites.
- **Physical Reality First**: UI surfaces are engineered with high-contrast status colors (Green/Yellow/Red/Gray), large touch targets for gloved fingers, station-based escalation boards, and TV shop-floor display modes.
- **Decoupled Architecture**: UI components depend strictly on abstract repository interfaces (`IProductionRepository`, `IQualityRepository`, `IMaintenanceRepository`, etc.), isolating business rules from data storage backends.
- **100% Traceable & Auditable**: Every status change, defect containment action, kanban dispatch, and maintenance repair generates an immutable audit record with timestamp, user badge, and root-cause reason.
- **Deterministic Core with AI Adapters**: Crucial plant safety and calculations (takt time, OEE, poka-yoke gates) are deterministic. AI capabilities (shift handover synthesis, symptom-to-solution matching) are isolated behind pluggable provider interfaces.

---

## 2. Core Modules & Implementation Status

| # | Module Name | Architectural Status | Primary Shop-Floor Capabilities |
|---|-------------|----------------------|---------------------------------|
| 1 | **Production** | `IMPLEMENTED` | Real-time line status (Running / Warning / Stopped / Changeover), hourly output reporting, actual vs. target tracking, downtime logging by 6 major losses, takt time calculation. |
| 2 | **Quality** | `IMPLEMENTED` | Non-conformance incident logging, 4-stage containment workflow (Open → Contained → Root Cause / 5-Why → Closed), lot blocking, defect Pareto charts. |
| 3 | **Maintenance** | `IMPLEMENTED` | Machine status monitoring, breakdown call dispatch, MTTR & MTBF calculations, technician assignment, repair notes & downtime capture. |
| 4 | **Material** | `IMPLEMENTED` | Digital Kanban request board, buffer stock level tracking, min/max thresholds, automated shortage alerts, stock adjustments. |
| 5 | **Andon** | `IMPLEMENTED` | 4-channel operator escalation (Leader, Machine, Material, Quality), 7-step response lifecycle, response SLA timer, shop-floor TV presentation mode. |
| 6 | **Knowledge Vault** | `FOUNDATION ONLY` | Structured symptom, root-cause, and countermeasure library; empirical engineering problem solving with AI troubleshooting search adapter. |
| 7 | **Digital Poka-Yoke** | `FOUNDATION ONLY` | Software-based mistake proofing: Duplicate barcode blocking, torque verification gates, sequence interlocks, and live interactive test simulator. |
| 8 | **AI Shift Handover** | `FOUNDATION ONLY` | Automatic aggregation of shift performance, downtime, and open defects into structured summaries, incoming supervisor acceptance sign-off. |
| 9 | **People & Skills** | `FOUNDATION ONLY` | Operator skill matrix, station qualification levels (L1 Trainee to L4 Trainer), shift assignment rosters, compliance verification. |
| 10 | **Reports & Analytics** | `IMPLEMENTED` | Plant-wide OEE breakdown (Availability, Performance, Quality), hourly throughput trends, Pareto charts, and exportable shift data. |
| 11 | **Master Data** | `IMPLEMENTED` | Configuration of manufacturing lines, plant machinery, active part numbers, and standard takt times. |
| 12 | **User & Roles** | `IMPLEMENTED` | 10 shop-floor persona management, operator badges, and granular RBAC permission enforcement matrix. |
| 13 | **Audit & Activity Log** | `IMPLEMENTED` | Immutable audit stream with CSV export, module filters, user search, and entity change tracking. |

---

## 3. Shop-Floor Personas & Role-Based Access Control (RBAC)

FACTORY OS enforces strict operational separation of duties across 10 specialized manufacturing personas:

1. **OPERATOR**: Reports hourly output, triggers Andon alarms, logs basic scrap. Cannot alter line targets or bypass Poka-Yoke interlocks.
2. **LEADER**: Acknowledges station Andon calls, coordinates station material requests, records initial containment notes.
3. **SUPERVISOR**: Manages line status (Start/Stop/Changeover), reassigns operators, generates and signs shift handovers.
4. **PRODUCTION**: Plans work orders, configures line takt times, sets target production quantities.
5. **QUALITY**: Controls defect quarantine, approves 5-Why root cause countermeasures, signs off defect tickets.
6. **ENGINEERING**: Authors verified knowledge cases, configures digital Poka-Yoke rules, calibrates machine parameters.
7. **MAINTENANCE**: Responds to machine Andon calls, dispatches technicians, logs component repairs, closes breakdown tickets.
8. **MATERIAL**: Fulfills Kanban calls, dispatches raw materials to buffer racks, manages warehouse stock balance.
9. **MANAGER**: Comprehensive visibility across OEE, plant reports, audit trails, and multi-line performance metrics.
10. **ADMIN**: Full administrative governance, user badge creation, master data configuration, and security settings.

---

## 4. Architectural Blueprint

```
src/
├── core/
│   ├── auth/              # RBAC engine, 10 Personas, Permissions, AuthContext
│   ├── audit/             # Immutable Audit Logger, Traceability, AuditContext
│   ├── data/              # Repository Interfaces (types.ts) & Local-First Store
│   ├── ai/                # Deterministic + LLM Adapter Service Interfaces
│   └── tests/             # Pure Business Logic Unit Test Verification Suite
├── modules/
│   ├── production/        # Line Status, Hourly Board, Downtime Logging
│   ├── quality/           # Defect Containment, Inspection, 5-Why Analysis
│   ├── maintenance/       # Machine Monitoring, Breakdown Work Orders, MTTR
│   ├── material/          # Kanban Call Board, Buffer Inventory & Dispatch
│   ├── andon/             # 4-Channel Andon, TV Mode, SLA Response Lifecycle
│   ├── knowledge/         # Symptom/Root-Cause Library, AI Search Adapter
│   ├── pokayoke/          # Software Interlocks & Interactive Sensor Simulator
│   ├── handover/          # Shift Aggregation, AI Synthesis, Dual Sign-off
│   ├── people/            # Operator Roster & Station Skill Qualification Matrix
│   ├── analytics/         # OEE Loss Waterfall, Throughput & Quality Charts
│   ├── masterdata/        # Lines, Machines, Products & Plant Parameters
│   ├── users/             # User Directory & Badge Management
│   ├── roles/             # Centralized Role Permission Matrix Visualizer
│   ├── audit/             # Audit Trail Explorer with CSV Export
│   └── settings/          # System Configuration & Factory Demo Data Reset
└── components/
    ├── layout/            # Industrial Topbar, Role Switcher, Modular Sidebar
    └── common/            # High-Contrast StatusBadges, TestRunnerModal
```

---

## 5. Pure Business Logic & Test Suite

FACTORY OS features an isolated unit verification engine (`src/core/tests/businessLogic.ts`) completely separated from UI components and external SDKs.

### Verified Invariant Rules:
1. **Production Achievement & Takt Time**: Accurate rounding and mathematical division handling zero targets safely.
2. **Line State Transitions**: Enforces valid industrial states (`RUNNING` → `WARNING` → `STOPPED` → `CHANGEOVER`).
3. **RBAC Privilege Boundaries**: Verifies that Operators cannot modify production targets, while Quality has exclusive defect closure authority.
4. **Andon Response Sequence**: Validates strict progression (`NEW` → `ACKNOWLEDGED` → `ARRIVED` → `INVESTIGATING` → `COUNTERMEASURE` → `VERIFICATION` → `CLOSED`) and rejects illegitimate skips.
5. **Poka-Yoke Interlock Evaluator**: Evaluates duplicate barcode detection and torque limit thresholds (`GREATER_THAN`, `EQUALS`, etc.).
6. **Shift Handover Synthesis**: Validates deterministic metric formatting across shift intervals.

### Running Tests in the Browser:
Click the **"Run Unit Tests"** button in the top navigation bar at any time to launch the interactive test runner and review real-time execution results across all test suites.

---

## 6. Development & Production Build

### Requirements
- Node.js 18+
- npm or yarn

### Setup & Run
```bash
# Install dependencies
npm install

# Run development server (bound to port 3000)
npm run dev

# Run TypeScript typecheck & linter
npm run lint

# Compile production bundle
npm run build
```

---

## 7. Demo Mode & Seed Data

The application runs in **DEMO MODE** out-of-the-box, providing pre-loaded manufacturing lines (Stamping, Machining, Assembly), calibrated machines, sample Andon alarms, and simulated shift logs. You can switch between all 10 user personas instantly using the header persona switcher to test role permissions. Reset sample data anytime via **Settings > Factory Demo Data Reset**.
