
import { create } from 'zustand';
import {
  Simulation,
  Alert,
  MonitoringMetrics,
  Approval,
  Recommendation,
  CarbonSinkData,
  PerformanceStats,
  UploadedFile,
  User,
  BasinStatus,
  BiologicalParams,
  SimulationStatus,
  AlertLevel,
  UserRole,
  ApprovalStatus,
  ParamAdjustmentLog
} from '../../shared/types';
import { generateMockSimulations, generateMockAlerts, generateMockMetrics, generateMockApprovals, generateMockRecommendations, generateMockCarbonSinkData, generateMockPerformanceStats, generateMockBasinStatus, mockUser } from '../utils/mockData';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  sidebarCollapsed: boolean;
  activeTab: string;
  simulations: Simulation[];
  currentSimulation: Simulation | null;
  alerts: Alert[];
  unreadAlertCount: number;
  monitoringMetrics: MonitoringMetrics[];
  approvals: Approval[];
  recommendations: Recommendation[];
  carbonSinkData: CarbonSinkData[];
  performanceStats: PerformanceStats[];
  uploadedFiles: UploadedFile[];
  basinStatuses: BasinStatus[];
  paramAdjustmentLogs: ParamAdjustmentLog[];
  isLoading: boolean;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setCurrentSimulation: (sim: Simulation | null) => void;
  addUploadedFile: (file: UploadedFile) => void;
  updateFileProgress: (id: string, progress: number, status: UploadedFile['status']) => void;
  removeUploadedFile: (id: string) => void;
  createSimulation: (name: string, description: string, oceanBasin: string, season: string, scenario: string, params: BiologicalParams) => void;
  updateSimulationStatus: (id: string, status: SimulationStatus, progress?: number) => void;
  reviewAlert: (alertId: string, comment: string, approved: boolean, adjustments?: Partial<BiologicalParams>) => void;
  processApproval: (approvalId: string, approved: boolean, comments: string) => void;
  adoptRecommendation: (recId: string) => void;
  addParamAdjustmentLog: (log: Omit<ParamAdjustmentLog, 'id' | 'createdAt' | 'createdBy'>) => void;
  setNotification: (notification: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  loadData: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  sidebarCollapsed: false,
  activeTab: 'dashboard',
  simulations: [],
  currentSimulation: null,
  alerts: [],
  unreadAlertCount: 0,
  monitoringMetrics: [],
  approvals: [],
  recommendations: [],
  carbonSinkData: [],
  performanceStats: [],
  uploadedFiles: [],
  basinStatuses: [],
  paramAdjustmentLogs: [],
  isLoading: false,
  notification: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      const user: User = { ...mockUser, email };
      set({ user, isAuthenticated: true, isLoading: false });
      get().loadData();
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      simulations: [],
      currentSimulation: null,
      alerts: [],
      monitoringMetrics: [],
      approvals: [],
      recommendations: [],
      carbonSinkData: [],
      performanceStats: [],
      uploadedFiles: [],
    });
  },

  toggleSidebar: () => {
    set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
  },

  setCurrentSimulation: (sim: Simulation | null) => {
    set({ currentSimulation: sim });
  },

  addUploadedFile: (file: UploadedFile) => {
    set(state => ({ uploadedFiles: [...state.uploadedFiles, file] }));
  },

  updateFileProgress: (id: string, progress: number, status: UploadedFile['status']) => {
    set(state => ({
      uploadedFiles: state.uploadedFiles.map(f =>
        f.id === id ? { ...f, progress, status } : f
      )
    }));
  },

  removeUploadedFile: (id: string) => {
    set(state => ({
      uploadedFiles: state.uploadedFiles.filter(f => f.id !== id)
    }));
  },

  createSimulation: (name: string, description: string, oceanBasin: string, season: string, scenario: string, params: BiologicalParams) => {
    const basin = get().basinStatuses.find(b => b.basin === oceanBasin);
    if (basin?.isPaused) {
      get().setNotification({ type: 'error', message: `${oceanBasin}区域已被暂停，无法创建新的模拟任务。该海盆连续三次NPP偏差超过20%，已自动锁定。请联系首席科学家排查。` });
      return;
    }

    const newSim: Simulation = {
      id: `sim-${Date.now()}`,
      name,
      description,
      oceanBasin,
      season,
      emissionScenario: scenario,
      status: SimulationStatus.PENDING_VALIDATION,
      params,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: get().user?.id || '',
      createdByName: get().user?.name || '',
      alertCount: 0,
      nppDeviation: 0,
    };
    
    set(state => ({ simulations: [newSim, ...state.simulations] }));
    get().setNotification({ type: 'success', message: `模拟任务 "${name}" 已创建成功` });
    
    setTimeout(() => {
      get().updateSimulationStatus(newSim.id, SimulationStatus.DATA_FUSION, 15);
    }, 1000);
    setTimeout(() => {
      get().updateSimulationStatus(newSim.id, SimulationStatus.GRID_INITIALIZATION, 30);
    }, 2500);
    setTimeout(() => {
      get().updateSimulationStatus(newSim.id, SimulationStatus.BIOGEOCHEMICAL_ITERATION, 50);
    }, 4000);
    setTimeout(() => {
      get().updateSimulationStatus(newSim.id, SimulationStatus.CARBON_FLUX_CALCULATION, 80);
    }, 6000);
    setTimeout(() => {
      get().updateSimulationStatus(newSim.id, SimulationStatus.COMPLETED, 100);
      get().setNotification({ type: 'success', message: `模拟任务 "${name}" 已完成` });
    }, 8000);
  },

  updateSimulationStatus: (id: string, status: SimulationStatus, progress?: number) => {
    set(state => ({
      simulations: state.simulations.map(s =>
        s.id === id
          ? { ...s, status, progress: progress ?? s.progress, updatedAt: new Date().toISOString() }
          : s
      ),
      currentSimulation: state.currentSimulation?.id === id
        ? { ...state.currentSimulation, status, progress: progress ?? state.currentSimulation.progress, updatedAt: new Date().toISOString() }
        : state.currentSimulation
    }));
  },

  reviewAlert: (alertId: string, comment: string, approved: boolean, adjustments?: Partial<BiologicalParams>) => {
    const alert = get().alerts.find(a => a.id === alertId);
    const simulation = alert ? get().simulations.find(s => s.id === alert.simulationId) : null;

    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId
          ? {
              ...a,
              reviewedBy: state.user?.id || null,
              reviewedByName: state.user?.name || null,
              reviewComment: comment,
              reviewedAt: new Date().toISOString(),
              paramAdjustments: adjustments || null
            }
          : a
      ),
      unreadAlertCount: Math.max(0, state.unreadAlertCount - 1)
    }));

    if (approved && adjustments && simulation) {
      const oldParams = { ...simulation.params };
      const newParams = { ...oldParams, ...adjustments };

      get().addParamAdjustmentLog({
        simulationId: simulation.id,
        alertId,
        oldParams,
        newParams,
        reason: comment
      });

      set(state => ({
        simulations: state.simulations.map(s =>
          s.id === simulation.id
            ? { ...s, params: newParams, updatedAt: new Date().toISOString() }
            : s
        )
      }));

      get().updateSimulationStatus(simulation.id, SimulationStatus.BIOGEOCHEMICAL_ITERATION, 50);
      setTimeout(() => {
        get().updateSimulationStatus(simulation.id, SimulationStatus.COMPLETED, 100);
        get().setNotification({ type: 'success', message: '参数已调整，重新模拟完成' });
      }, 5000);
    }
    
    get().setNotification({ type: 'success', message: '预警复核已提交' });
  },

  addParamAdjustmentLog: (log) => {
    const newLog: ParamAdjustmentLog = {
      ...log,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: get().user?.id || '',
    };
    set(state => ({
      paramAdjustmentLogs: [newLog, ...state.paramAdjustmentLogs]
    }));
  },

  processApproval: (approvalId: string, approved: boolean, comments: string) => {
    const approval = get().approvals.find(a => a.id === approvalId);
    if (!approval) return;

    set(state => ({
      approvals: state.approvals.map(a =>
        a.id === approvalId
          ? {
              ...a,
              status: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
              reviewer: state.user?.id || null,
              reviewerName: state.user?.name || null,
              comments,
              reviewedAt: new Date().toISOString()
            }
          : a
      )
    }));

    if (approved) {
      if (approval.level === 1) {
        const level2Approval: Approval = {
          id: `approval-${Date.now()}`,
          simulationId: approval.simulationId,
          simulationName: approval.simulationName,
          level: 2,
          status: ApprovalStatus.PENDING,
          reviewer: null,
          reviewerName: null,
          comments: '',
          createdAt: new Date().toISOString(),
          reviewedAt: null
        };
        set(state => ({ approvals: [...state.approvals, level2Approval] }));
        get().setNotification({ type: 'success', message: '一级审批已通过，已提交至二级审批（碳收支专家）' });
      } else if (approval.level === 2) {
        get().setNotification({ type: 'success', message: '二级审批已通过，结果已推送至IPCC评估小组和海洋负排放工程组' });
      }
    } else {
      get().setNotification({ type: 'info', message: `审批已驳回，停留在${approval.level === 1 ? '一级' : '二级'}审批环节` });
    }
  },

  adoptRecommendation: (recId: string) => {
    set(state => ({
      recommendations: state.recommendations.map(r =>
        r.id === recId ? { ...r, adopted: true } : r
      )
    }));
    get().setNotification({ type: 'success', message: '推荐方案已采纳' });
  },

  setNotification: (notification) => {
    set({ notification });
    if (notification) {
      setTimeout(() => set({ notification: null }), 3000);
    }
  },

  loadData: () => {
    set({ isLoading: true });
    
    setTimeout(() => {
      const simulations = generateMockSimulations();
      const alerts = generateMockAlerts();
      const metrics = generateMockMetrics();
      const approvals = generateMockApprovals();
      const recommendations = generateMockRecommendations();
      const carbonSinkData = generateMockCarbonSinkData();
      const performanceStats = generateMockPerformanceStats();
      const basinStatuses = generateMockBasinStatus();

      const unreadAlertCount = alerts.filter(a => !a.reviewedAt).length;

      set({
        simulations,
        alerts,
        unreadAlertCount,
        monitoringMetrics: metrics,
        approvals,
        recommendations,
        carbonSinkData,
        performanceStats,
        basinStatuses,
        isLoading: false
      });
    }, 500);
  }
}));
