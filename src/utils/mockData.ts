
import {
  Simulation,
  Alert,
  MonitoringMetrics,
  Approval,
  Recommendation,
  CarbonSinkData,
  PerformanceStats,
  BasinStatus,
  User,
  BiologicalParams,
  SimulationStatus,
  AlertLevel,
  ApprovalStatus,
  UserRole,
  ReportVersion,
  BasinWorkOrder,
  WorkOrderEvent,
  WorkOrderEventType,
  RetestSimulation,
  RecoveryAssessment
} from '../../shared/types';

export const mockUser: User = {
  id: 'user-001',
  email: 'chemist@ocean.edu',
  name: '张海洋',
  role: UserRole.CHEMIST,
  createdAt: '2024-01-01T00:00:00Z'
};

export const mockUsers: User[] = [
  mockUser,
  {
    id: 'user-002',
    email: 'carbon@ocean.edu',
    name: '王碳汇',
    role: UserRole.CARBON_EXPERT,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-003',
    email: 'chief@ocean.edu',
    name: '李首席',
    role: UserRole.CHIEF_SCIENTIST,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-004',
    email: 'admin@ocean.edu',
    name: '赵管理',
    role: UserRole.ADMIN,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-005',
    email: 'ipcc@ocean.edu',
    name: 'IPCC联络员',
    role: UserRole.IPCC,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-006',
    email: 'engineering@ocean.edu',
    name: '陈工程',
    role: UserRole.ENGINEERING,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
};

const defaultParams: BiologicalParams = {
  growthRate: 0.5,
  mortalityRate: 0.1,
  sinkingRate: 1.5,
  pocSinkingVelocity: 100,
  remineralizationDepth: 1000
};

const oceanBasins = ['太平洋', '大西洋', '印度洋', '北冰洋', '南大洋', '地中海', '加勒比海'];
const seasons = ['春季', '夏季', '秋季', '冬季'];
const scenarios = ['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5', '历史基准'];
const statuses = Object.values(SimulationStatus);

export function generateMockSimulations(): Simulation[] {
  const simulations: Simulation[] = [];
  
  for (let i = 0; i < 15; i++) {
    const basin = oceanBasins[i % oceanBasins.length];
    const status = statuses[i % statuses.length];
    const progress = status === SimulationStatus.COMPLETED ? 100 :
                     status === SimulationStatus.ERROR ? 72 :
                     Math.floor(Math.random() * 80);
    
    simulations.push({
      id: `sim-${1000 + i}`,
      name: `${basin}${seasons[i % 4]}季碳汇模拟-${2024 - Math.floor(i / 4)}`,
      description: `高分辨率${basin}海洋生物地球化学循环模拟，包含浮游植物功能群参数化方案`,
      oceanBasin: basin,
      season: seasons[i % 4],
      emissionScenario: scenarios[i % 4],
      status,
      params: {
        ...defaultParams,
        growthRate: 0.4 + Math.random() * 0.3,
        mortalityRate: 0.08 + Math.random() * 0.05,
        sinkingRate: 1.2 + Math.random() * 0.6,
        pocSinkingVelocity: 80 + Math.random() * 40,
        remineralizationDepth: 800 + Math.random() * 400
      },
      progress,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
      createdBy: 'user-001',
      createdByName: '张海洋',
      alertCount: Math.floor(Math.random() * 5),
      nppDeviation: (Math.random() - 0.5) * 40
    });
  }
  
  return simulations;
}

const alertTypes = [
  { type: 'hypoxic_expansion', metric: '缺氧区扩张速率', message: '缺氧区扩张速率超过历史均值两倍' },
  { type: 'productivity_drop', metric: '初级生产力', message: '初级生产力骤降，超过预警阈值' },
  { type: 'chlorophyll_anomaly', metric: '表层叶绿素浓度', message: '表层叶绿素浓度异常偏离基线' },
  { type: 'euphotic_zone_change', metric: '真光层深度', message: '真光层深度显著变化' }
];

export function generateMockAlerts(): Alert[] {
  const alerts: Alert[] = [];
  
  for (let i = 0; i < 12; i++) {
    const alertInfo = alertTypes[i % alertTypes.length];
    const isCritical = i < 3;
    const isReviewed = i >= 8;
    
    alerts.push({
      id: `alert-${2000 + i}`,
      simulationId: `sim-${1000 + (i % 8)}`,
      simulationName: `${oceanBasins[i % oceanBasins.length]}夏季碳汇模拟-2024`,
      level: isCritical ? AlertLevel.CRITICAL : i < 7 ? AlertLevel.WARNING : AlertLevel.INFO,
      type: alertInfo.type,
      message: alertInfo.message,
      metric: alertInfo.metric,
      currentValue: isCritical ? 15.2 + Math.random() * 10 : 5.5 + Math.random() * 5,
      threshold: isCritical ? 10 : 8,
      timestamp: new Date(Date.now() - i * 7200000).toISOString(),
      reviewedBy: isReviewed ? 'user-001' : null,
      reviewedByName: isReviewed ? '张海洋' : null,
      reviewComment: isReviewed ? '已确认异常，调整浮游植物生长率参数后重新模拟' : null,
      reviewedAt: isReviewed ? new Date(Date.now() - i * 7200000 + 3600000).toISOString() : null,
      paramAdjustments: isReviewed ? { growthRate: 0.55, sinkingRate: 1.8 } : null
    });
  }
  
  return alerts;
}

export function generateMockMetrics(): MonitoringMetrics[] {
  const metrics: MonitoringMetrics[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 100; i++) {
    const t = i * 0.1;
    metrics.push({
      timestamp: new Date(now - (100 - i) * 60000).toISOString(),
      simulationId: 'sim-1000',
      surfaceChlorophyll: 0.3 + Math.sin(t) * 0.1 + Math.random() * 0.05,
      euphoticZoneDepth: 80 + Math.cos(t * 0.5) * 15 + Math.random() * 5,
      hypoxicArea: 15000 + t * 50 + Math.sin(t * 0.3) * 500,
      hypoxicExpansionRate: 3 + Math.sin(t * 0.8) * 2 + Math.random() * 1,
      primaryProductivity: 500 + Math.sin(t * 0.4) * 100 + Math.random() * 30,
      npp: 1.2 + Math.sin(t * 0.3) * 0.3 + Math.random() * 0.1
    });
  }
  
  return metrics;
}

export function generateMockApprovals(): Approval[] {
  const approvals: Approval[] = [];
  
  for (let i = 0; i < 8; i++) {
    const isPending = i < 4;
    const isApproved = !isPending && i < 6;
    
    approvals.push({
      id: `approval-${3000 + i}`,
      simulationId: `sim-${1001 + i}`,
      simulationName: `${oceanBasins[i % oceanBasins.length]}碳汇评估-${2024 - Math.floor(i / 2)}`,
      level: i % 2 === 0 ? 1 : 2,
      status: isPending ? ApprovalStatus.PENDING : isApproved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
      reviewer: isPending ? null : 'user-001',
      reviewerName: isPending ? null : '张海洋',
      comments: isPending ? '' : isApproved ? '生物过程合理，碳收支数据可信，同意通过' : '需要补充营养盐断面数据验证',
      createdAt: new Date(Date.now() - i * 172800000).toISOString(),
      reviewedAt: isPending ? null : new Date(Date.now() - i * 172800000 + 86400000).toISOString()
    });
  }
  
  return approvals;
}

export function generateMockRecommendations(): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const paramOptions = [
    { key: 'pocSinkingVelocity', name: '颗粒有机碳沉降速度', value: 120, unit: 'm d⁻¹' },
    { key: 'remineralizationDepth', name: '再矿化深度', value: 1200, unit: 'm' },
    { key: 'growthRate', name: '浮游植物生长率', value: 0.6, unit: 'd⁻¹' },
    { key: 'sinkingRate', name: '生物量沉降速率', value: 2.0, unit: 'm d⁻¹' }
  ];
  
  for (let i = 0; i < 6; i++) {
    const opt = paramOptions[i % paramOptions.length];
    const isAdopted = i >= 4;
    
    recommendations.push({
      id: `rec-${4000 + i}`,
      simulationId: `sim-${1002 + i}`,
      simulationName: `${oceanBasins[i % oceanBasins.length]}生物地球化学模拟优化`,
      params: { [opt.key]: opt.value } as Partial<BiologicalParams>,
      confidence: 0.75 + Math.random() * 0.2,
      rationale: `基于${oceanBasins[i % oceanBasins.length]}历史模拟数据分析，调整${opt.name}可显著降低NPP偏差，提升碳汇评估精度。参考同区域${20 + Math.floor(Math.random() * 30)}次成功模拟案例。`,
      historicalPerformance: {
        nppImprovement: 8 + Math.random() * 15,
        rmseReduction: 5 + Math.random() * 10
      },
      createdAt: new Date(Date.now() - i * 259200000).toISOString(),
      adopted: isAdopted
    });
  }
  
  return recommendations;
}

export function generateMockCarbonSinkData(): CarbonSinkData[] {
  const data: CarbonSinkData[] = [];
  
  for (const basin of oceanBasins) {
    for (let year = 2020; year <= 2024; year++) {
      for (const season of seasons) {
        for (const scenario of scenarios.slice(0, 3)) {
          const baseValue = basin === '太平洋' ? 1800 : basin === '大西洋' ? 1200 : basin === '印度洋' ? 900 : 400;
          const seasonFactor = season === '夏季' ? 1.3 : season === '春季' ? 1.1 : season === '秋季' ? 0.9 : 0.7;
          const scenarioFactor = scenario === 'SSP5-8.5' ? 0.85 : scenario === 'SSP2-4.5' ? 0.95 : 1.05;
          
          data.push({
            id: `cs-${basin}-${year}-${season}-${scenario}`,
            simulationId: `sim-${basin}-${year}`,
            basin,
            season,
            scenario,
            year,
            totalCarbonSink: baseValue * seasonFactor * scenarioFactor * (0.95 + Math.random() * 0.1),
            biologicalPump: (baseValue * 0.6 * seasonFactor * scenarioFactor) / 1000,
            physicalPump: (baseValue * 0.3 * seasonFactor * scenarioFactor) / 1000,
            carbonatePump: (baseValue * 0.1 * seasonFactor * scenarioFactor) / 1000,
            biomass: {
              phytoplankton: 20 + Math.random() * 30,
              zooplankton: 5 + Math.random() * 10,
              bacteria: 3 + Math.random() * 5
            }
          });
        }
      }
    }
  }
  
  return data;
}

export function generateMockPerformanceStats(): PerformanceStats[] {
  const stats: PerformanceStats[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayFactor = 0.9 + Math.random() * 0.2;
    
    stats.push({
      id: `perf-${i}`,
      date: date.toISOString().split('T')[0],
      simulationCompletionRate: 85 + Math.random() * 10 * dayFactor,
      averageAlertResponseTime: 15 + Math.random() * 20 * dayFactor,
      carbonSinkAssessmentAccuracy: 90 + Math.random() * 7 * dayFactor,
      totalSimulations: 8 + Math.floor(Math.random() * 5),
      completedSimulations: 7 + Math.floor(Math.random() * 5),
      failedSimulations: Math.floor(Math.random() * 2),
      alertsGenerated: 2 + Math.floor(Math.random() * 4),
      alertsReviewed: 2 + Math.floor(Math.random() * 4),
      approvedSimulations: 5 + Math.floor(Math.random() * 4),
      carbonPumpEfficiency: {
        biologicalPump: 70 + Math.random() * 15,
        physicalPump: 65 + Math.random() * 10,
        carbonatePump: 40 + Math.random() * 15,
        microbialLoop: 50 + Math.random() * 10,
        exportEfficiency: 60 + Math.random() * 10,
        sequestrationEfficiency: 55 + Math.random() * 10
      },
      createdAt: new Date().toISOString()
    });
  }
  
  return stats;
}

export function generateMockBasinStatus(): BasinStatus[] {
  return oceanBasins.map((basin, i) => {
    const isPacific = basin === '太平洋';
    const nppValues = isPacific ? [2.0, 1.4, 0.9] : [1.2 + Math.random() * 0.3, 1.15 + Math.random() * 0.3, 1.1 + Math.random() * 0.3];
    const deviations = isPacific ? [0, -30, -55] : nppValues.map((v, i, arr) => i > 0 ? ((v - arr[0]) / arr[0]) * 100 : 0);
    
    let consecutiveCount = 0;
    let maxConsecutive = 0;
    for (let j = 1; j < deviations.length; j++) {
      if (Math.abs(deviations[j]) > 20) {
        consecutiveCount++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
      } else {
        consecutiveCount = 0;
      }
    }
    
    const isPaused = isPacific || maxConsecutive >= 3;
    const notifiedParties = isPaused ? ['首席科学家', '海洋碳汇研究组', 'IPCC联络员'] : [];
    
    return {
      basin,
      consecutiveDeviations: isPacific ? 3 : maxConsecutive,
      isPaused,
      lastNppValues: nppValues,
      lastDeviations: deviations,
      notifiedAt: isPaused ? new Date(Date.now() - 86400000 * 2).toISOString() : null,
      lockedAt: isPaused ? new Date(Date.now() - 86400000).toISOString() : null,
      lockedReason: isPaused ? '连续三次NPP偏差超过20%阈值，系统自动锁定' : '',
      notifiedParties,
      currentHandler: isPaused ? 'user-003' : null,
      currentHandlerName: isPaused ? '李首席' : null,
      unlockReason: null,
      unlockedAt: null,
      unlockedBy: null,
      unlockedByName: null,
      workOrderId: isPaused ? `wo-${basin}-001` : null
    };
  });
}

export function generateMockWorkOrders(): BasinWorkOrder[] {
  const workOrders: BasinWorkOrder[] = [];
  
  const pacificWorkOrder: BasinWorkOrder = {
    id: 'wo-太平洋-001',
    basin: '太平洋',
    status: 'in_progress',
    currentStep: 3,
    steps: [
      { id: 'step-1', title: '锁定触发', completed: true, completedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'step-2', title: '通知发送', completed: true, completedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString() },
      { id: 'step-3', title: '处理人指派', completed: true, completedAt: new Date(Date.now() - 86400000 * 1.5).toISOString() },
      { id: 'step-4', title: '校准数据上传', completed: true, completedAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
      { id: 'step-5', title: '复测模拟', completed: false, completedAt: null },
      { id: 'step-6', title: '专家意见', completed: false, completedAt: null },
      { id: 'step-7', title: '最终解锁', completed: false, completedAt: null }
    ],
    events: [
      {
        id: 'evt-001',
        type: 'lock_triggered',
        title: '海盆自动锁定',
        description: '系统检测到太平洋连续三次NPP偏差超过20%阈值（0%, -30%, -55%），已自动锁定该海盆。',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        handledBy: 'system',
        handledByName: '系统自动',
        metadata: { deviations: [0, -30, -55], nppValues: [2.0, 1.4, 0.9] }
      },
      {
        id: 'evt-002',
        type: 'notification_sent',
        title: '预警通知已发送',
        description: '已向首席科学家、海洋碳汇研究组、IPCC联络员发送锁定预警通知。',
        timestamp: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
        handledBy: 'system',
        handledByName: '系统自动',
        metadata: { recipients: ['首席科学家', '海洋碳汇研究组', 'IPCC联络员'] }
      },
      {
        id: 'evt-003',
        type: 'handler_assigned',
        title: '处理人已指派',
        description: '李首席科学家已被指派为太平洋海盆锁定问题的负责人。',
        timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        handledBy: 'user-004',
        handledByName: '赵管理'
      },
      {
        id: 'evt-004',
        type: 'calibration_uploaded',
        title: '校准数据已上传',
        description: '张海洋已上传太平洋NPP校准数据文件（太平洋_NPP校准数据_20260601.nc，15MB）。',
        timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        handledBy: 'user-001',
        handledByName: '张海洋',
        metadata: { fileName: '太平洋_NPP校准数据_20260601.nc', fileSize: 15728640 }
      },
      {
        id: 'evt-005',
        type: 'remark_added',
        title: '处理备注',
        description: '建议重点检查浮游植物死亡率参数和营养盐初始条件设置，这可能是导致NPP偏差的主要原因。',
        timestamp: new Date(Date.now() - 86400000 * 0.3).toISOString(),
        handledBy: 'user-003',
        handledByName: '李首席'
      }
    ],
    remarks: [
      {
        id: 'remark-001',
        content: '建议重点检查浮游植物死亡率参数和营养盐初始条件设置，这可能是导致NPP偏差的主要原因。',
        createdAt: new Date(Date.now() - 86400000 * 0.3).toISOString(),
        createdBy: 'user-003',
        createdByName: '李首席'
      },
      {
        id: 'remark-002',
        content: '已重新校准营养盐数据，最新的观测数据显示北太平洋副热带环流区的营养盐浓度比之前的模式输入高15-20%。',
        createdAt: new Date(Date.now() - 86400000 * 0.1).toISOString(),
        createdBy: 'user-001',
        createdByName: '张海洋'
      }
    ],
    nextPlan: '1. 使用新校准的数据发起第一次复测模拟\n2. 分析复测结果，对比偏差改善情况\n3. 如复测通过，进行第二次复测验证\n4. 连续两次通过后自动解锁',
    nextPlanUpdatedAt: new Date(Date.now() - 86400000 * 0.2).toISOString(),
    nextPlanUpdatedBy: 'user-003',
    nextPlanUpdatedByName: '李首席',
    preLockDeviations: [0, -30, -55],
    preLockNppValues: [2.0, 1.4, 0.9],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    resolvedAt: null
  };
  
  workOrders.push(pacificWorkOrder);
  return workOrders;
}

export function generateMockRecoveryAssessments(): RecoveryAssessment[] {
  return [
    {
      id: 'recovery-太平洋-001',
      basin: '太平洋',
      retestHistory: [
        {
          id: 'retest-太平洋-001',
          basin: '太平洋',
          status: 'completed',
          nppDeviation: -22.5,
          threshold: 20,
          uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          result: 'fail',
          recommendation: '建议重新校准营养盐初始条件，检查浮游植物死亡率参数设置',
          calibrationData: {
            name: '太平洋_NPP校准数据_20260601.nc',
            size: 15728640,
            uploadedBy: '张海洋'
          },
          preLockDeviations: [0, -30, -55],
          postRetestDeviation: -22.5,
          improvementPercent: 59.1,
          countsTowardUnlock: false
        },
        {
          id: 'retest-太平洋-002',
          basin: '太平洋',
          status: 'pending',
          nppDeviation: null,
          threshold: 20,
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: null,
          result: null,
          recommendation: null,
          calibrationData: {
            name: '太平洋_NPP校准数据_20260608_revised.nc',
            size: 16249856,
            uploadedBy: '张海洋'
          },
          preLockDeviations: [0, -30, -55],
          postRetestDeviation: null,
          improvementPercent: null,
          countsTowardUnlock: true
        }
      ],
      consecutivePasses: 0,
      requiredPasses: 2,
      status: 'in_progress',
      startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      completedAt: null,
      preLockDeviations: [0, -30, -55],
      preLockNppValues: [2.0, 1.4, 0.9]
    }
  ];
}

export function generateMockReportVersions(): ReportVersion[] {
  return [
    {
      id: 'report-001',
      generatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      generatedBy: 'user-001',
      generatedByName: '张海洋',
      filters: { basin: 'all', season: 'all', scenario: 'all', year: null },
      summary: { totalCarbonSink: 12580, avgCarbonSink: 29.95, recordCount: 420, basins: ['太平洋', '大西洋', '印度洋', '北冰洋', '南大洋', '地中海', '加勒比海'] },
      format: 'pdf',
      fileSize: 2457600
    },
    {
      id: 'report-002',
      generatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      generatedBy: 'user-002',
      generatedByName: '王碳汇',
      filters: { basin: '太平洋', season: 'all', scenario: 'SSP2-4.5', year: null },
      summary: { totalCarbonSink: 4280, avgCarbonSink: 71.33, recordCount: 60, basins: ['太平洋'] },
      format: 'pdf',
      fileSize: 1835008
    },
    {
      id: 'report-003',
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      generatedBy: 'user-001',
      generatedByName: '张海洋',
      filters: { basin: 'all', season: '夏季', scenario: 'all', year: null },
      summary: { totalCarbonSink: 3850, avgCarbonSink: 36.67, recordCount: 105, basins: ['太平洋', '大西洋', '印度洋', '北冰洋', '南大洋', '地中海', '加勒比海'] },
      format: 'csv',
      fileSize: 153600
    }
  ];
}

export const statusLabels: Record<SimulationStatus, string> = {
  [SimulationStatus.PENDING_VALIDATION]: '待校验',
  [SimulationStatus.DATA_FUSION]: '数据融合',
  [SimulationStatus.GRID_INITIALIZATION]: '网格初始化',
  [SimulationStatus.BIOGEOCHEMICAL_ITERATION]: '生物化学迭代',
  [SimulationStatus.CARBON_FLUX_CALCULATION]: '碳通量计算',
  [SimulationStatus.COMPLETED]: '已完成',
  [SimulationStatus.ERROR]: '异常',
  [SimulationStatus.ROLLBACK]: '异常回退'
};

export const alertLevelColors: Record<AlertLevel, string> = {
  [AlertLevel.INFO]: 'bg-ocean-500/20 text-ocean-300',
  [AlertLevel.WARNING]: 'bg-yellow-500/20 text-yellow-300',
  [AlertLevel.CRITICAL]: 'bg-coral-500/20 text-coral-300'
};

export const alertLevelLabels: Record<AlertLevel, string> = {
  [AlertLevel.INFO]: '提示',
  [AlertLevel.WARNING]: '警告',
  [AlertLevel.CRITICAL]: '严重'
};

export const roleLabels: Record<UserRole, string> = {
  [UserRole.CHEMIST]: '海洋生物地球化学家',
  [UserRole.CARBON_EXPERT]: '碳收支专家',
  [UserRole.CHIEF_SCIENTIST]: '首席科学家',
  [UserRole.ADMIN]: '系统管理员',
  [UserRole.IPCC]: 'IPCC评估小组',
  [UserRole.ENGINEERING]: '海洋负排放工程组'
};
