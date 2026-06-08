
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
  UserRole
} from '../../shared/types';

export const mockUser: User = {
  id: 'user-001',
  email: 'chemist@ocean.edu',
  name: '张海洋',
  role: UserRole.CHEMIST,
  createdAt: '2024-01-01T00:00:00Z'
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
  return oceanBasins.map((basin, i) => ({
    basin,
    consecutiveDeviations: i === 0 ? 3 : Math.floor(Math.random() * 3),
    isPaused: i === 0,
    lastNppValues: [1.2 + Math.random() * 0.3, 1.15 + Math.random() * 0.3, 1.1 + Math.random() * 0.3],
    notifiedAt: i === 0 ? new Date(Date.now() - 86400000).toISOString() : null
  }));
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
