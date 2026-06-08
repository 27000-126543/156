
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
  notifiedAt: string | null;
}
