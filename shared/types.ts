
export enum SimulationStatus {
  PENDING_VALIDATION = 'pending_validation',
  DATA_FUSION = 'data_fusion',
  GRID_INITIALIZATION = 'grid_initialization',
  BIOGEOCHEMICAL_ITERATION = 'biogeochemical_iteration',
  CARBON_FLUX_CALCULATION = 'carbon_flux_calculation',
  COMPLETED = 'completed',
  ERROR = 'error',
  ROLLBACK = 'rollback'
}

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum UserRole {
  CHEMIST = 'chemist',
  CARBON_EXPERT = 'carbon_expert',
  CHIEF_SCIENTIST = 'chief_scientist',
  ADMIN = 'admin',
  IPCC = 'ipcc',
  ENGINEERING = 'engineering'
}

export interface BiologicalParams {
  growthRate: number;
  mortalityRate: number;
  sinkingRate: number;
  pocSinkingVelocity: number;
  remineralizationDepth: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Simulation {
  id: string;
  name: string;
  description: string;
  oceanBasin: string;
  season: string;
  emissionScenario: string;
  status: SimulationStatus;
  params: BiologicalParams;
  progress: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  alertCount: number;
  nppDeviation: number;
  isPaused?: boolean;
}

export interface MonitoringMetrics {
  timestamp: string;
  simulationId: string;
  surfaceChlorophyll: number;
  euphoticZoneDepth: number;
  hypoxicArea: number;
  hypoxicExpansionRate: number;
  primaryProductivity: number;
  npp: number;
}

export interface Alert {
  id: string;
  simulationId: string;
  simulationName: string;
  level: AlertLevel;
  type: string;
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: string;
  reviewedBy: string | null;
  reviewedByName: string | null;
  reviewComment: string | null;
  reviewedAt: string | null;
  paramAdjustments: Partial<BiologicalParams> | null;
}

export interface Approval {
  id: string;
  simulationId: string;
  simulationName: string;
  level: number;
  status: ApprovalStatus;
  reviewer: string | null;
  reviewerName: string | null;
  comments: string;
  createdAt: string;
  reviewedAt: string | null;
}

export interface Recommendation {
  id: string;
  simulationId: string;
  simulationName: string;
  params: Partial<BiologicalParams>;
  confidence: number;
  rationale: string;
  historicalPerformance: {
    nppImprovement: number;
    rmseReduction: number;
  };
  createdAt: string;
  adopted: boolean;
}

export interface CarbonSinkData {
  id: string;
  simulationId: string;
  basin: string;
  season: string;
  scenario: string;
  year: number;
  totalCarbonSink: number;
  biologicalPump: number;
  physicalPump: number;
  carbonatePump: number;
  biomass: {
    phytoplankton: number;
    zooplankton: number;
    bacteria: number;
  };
}

export interface CarbonPumpEfficiency {
  biologicalPump: number;
  physicalPump: number;
  carbonatePump: number;
  microbialLoop: number;
  exportEfficiency: number;
  sequestrationEfficiency: number;
}

export interface PerformanceStats {
  id: string;
  date: string;
  simulationCompletionRate: number;
  averageAlertResponseTime: number;
  carbonSinkAssessmentAccuracy: number;
  totalSimulations: number;
  completedSimulations: number;
  failedSimulations: number;
  alertsGenerated: number;
  alertsReviewed: number;
  approvedSimulations: number;
  carbonPumpEfficiency: CarbonPumpEfficiency;
  createdAt: string;
}

export interface ParamAdjustmentLog {
  id: string;
  simulationId: string;
  alertId: string | null;
  oldParams: BiologicalParams;
  newParams: BiologicalParams;
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  category: 'circulation' | 'nutrient' | 'phytoplankton' | 'oxygen' | 'other';
}

export interface BasinStatus {
  basin: string;
  consecutiveDeviations: number;
  isPaused: boolean;
  lastNppValues: number[];
  lastDeviations: number[];
  notifiedAt: string | null;
  lockedAt: string | null;
  lockedReason: string;
  notifiedParties: string[];
  currentHandler: string | null;
  currentHandlerName: string | null;
  unlockReason: string | null;
  unlockedAt: string | null;
  unlockedBy: string | null;
  unlockedByName: string | null;
  workOrderId: string | null;
}

export type WorkOrderEventType = 
  | 'lock_triggered' 
  | 'notification_sent' 
  | 'handler_assigned' 
  | 'calibration_uploaded' 
  | 'retest_started' 
  | 'retest_completed' 
  | 'expert_opinion' 
  | 'remark_added'
  | 'next_plan_set'
  | 'auto_unlocked' 
  | 'manual_unlocked';

export interface WorkOrderEvent {
  id: string;
  type: WorkOrderEventType;
  title: string;
  description: string;
  timestamp: string;
  handledBy: string | null;
  handledByName: string | null;
  metadata?: Record<string, any>;
}

export interface WorkOrderRemark {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface BasinWorkOrder {
  id: string;
  basin: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  currentStep: number;
  steps: { id: string; title: string; completed: boolean; completedAt: string | null }[];
  events: WorkOrderEvent[];
  remarks: WorkOrderRemark[];
  nextPlan: string | null;
  nextPlanUpdatedAt: string | null;
  nextPlanUpdatedBy: string | null;
  nextPlanUpdatedByName: string | null;
  preLockDeviations: number[];
  preLockNppValues: number[];
  createdAt: string;
  resolvedAt: string | null;
}

export interface RetestSimulation {
  id: string;
  basin: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  nppDeviation: number | null;
  threshold: number;
  uploadedAt: string;
  completedAt: string | null;
  result: 'pass' | 'fail' | null;
  recommendation: string | null;
  calibrationData: {
    name: string;
    size: number;
    uploadedBy: string;
  } | null;
  preLockDeviations: number[];
  postRetestDeviation: number | null;
  improvementPercent: number | null;
  countsTowardUnlock: boolean;
}

export interface RecoveryAssessment {
  id: string;
  basin: string;
  retestHistory: RetestSimulation[];
  consecutivePasses: number;
  requiredPasses: number;
  status: 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  preLockDeviations: number[];
  preLockNppValues: number[];
}

export interface ReportVersion {
  id: string;
  generatedAt: string;
  generatedBy: string;
  generatedByName: string;
  filters: {
    basin: string;
    season: string;
    scenario: string;
    year: number | null;
  };
  summary: {
    totalCarbonSink: number;
    avgCarbonSink: number;
    recordCount: number;
    basins: string[];
  };
  format: 'pdf' | 'excel' | 'csv';
  fileSize: number;
  snapshot: {
    chartsData: Record<string, any>;
    dataPreview: any[];
    generationParams: Record<string, any>;
  } | null;
}
