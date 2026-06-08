
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
  ParamAdjustmentLog,
  ReportVersion,
  RecoveryAssessment,
  RetestSimulation,
  BasinWorkOrder,
  WorkOrderEvent,
  WorkOrderRemark
} from '../../shared/types';
import { generateMockSimulations, generateMockAlerts, generateMockMetrics, generateMockApprovals, generateMockRecommendations, generateMockCarbonSinkData, generateMockPerformanceStats, generateMockBasinStatus, generateMockReportVersions, mockUser, getUserByEmail, generateMockWorkOrders, generateMockRecoveryAssessments } from '../utils/mockData';

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
  reportVersions: ReportVersion[];
  recoveryAssessments: RecoveryAssessment[];
  workOrders: BasinWorkOrder[];
  isLoading: boolean;
  notification: { type: 'success' | 'error' | 'info' | 'warning'; message: string } | null;

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
  unlockBasin: (basin: string, reason: string) => void;
  addReportVersion: (version: Omit<ReportVersion, 'id' | 'generatedAt' | 'generatedBy' | 'generatedByName'>) => void;
  addRetestSimulation: (basin: string, calibrationData: { name: string; size: number }) => void;
  addWorkOrderEvent: (basin: string, event: Omit<WorkOrderEvent, 'id' | 'timestamp'>) => void;
  addWorkOrderRemark: (basin: string, content: string) => void;
  updateNextPlan: (basin: string, nextPlan: string) => void;
  updateWorkOrderStep: (basin: string, stepId: string, completed: boolean) => void;
  setNotification: (notification: { type: 'success' | 'error' | 'info' | 'warning'; message: string } | null) => void;
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
  reportVersions: [],
  recoveryAssessments: [],
  workOrders: [],
  isLoading: false,
  notification: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      const matchedUser = getUserByEmail(email);
      if (matchedUser) {
        set({ user: matchedUser, isAuthenticated: true, isLoading: false });
        get().loadData();
        return true;
      }
      const user: User = { ...mockUser, email, name: email.split('@')[0] };
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
      basinStatuses: [],
      reportVersions: [],
      recoveryAssessments: [],
      workOrders: [],
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
      const reportVersions = generateMockReportVersions();
      const recoveryAssessments = generateMockRecoveryAssessments();
      const workOrders = generateMockWorkOrders();

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
        reportVersions,
        recoveryAssessments,
        workOrders,
        isLoading: false
      });
    }, 500);
  },

  unlockBasin: (basin: string, reason: string) => {
    const user = get().user;
    if (user?.role !== UserRole.CHIEF_SCIENTIST && user?.role !== UserRole.ADMIN) {
      get().setNotification({ type: 'error', message: '只有首席科学家或管理员可以解除海盆锁定' });
      return;
    }

    set(state => ({
      basinStatuses: state.basinStatuses.map(b =>
        b.basin === basin ? {
          ...b,
          isPaused: false,
          consecutiveDeviations: 0,
          unlockReason: reason,
          unlockedAt: new Date().toISOString(),
          unlockedBy: user.id,
          unlockedByName: user.name,
          currentHandler: null,
          currentHandlerName: null
        } : b
      )
    }));
    get().setNotification({ type: 'success', message: `${basin}已成功解除锁定，现在可以创建新的模拟任务` });
  },

  addReportVersion: (version) => {
    const user = get().user;
    if (!user) return;

    const newVersion: ReportVersion = {
      ...version,
      id: `report-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      generatedBy: user.id,
      generatedByName: user.name
    };

    set(state => ({
      reportVersions: [newVersion, ...state.reportVersions]
    }));
  },

  addRetestSimulation: (basin: string, calibrationData: { name: string; size: number }) => {
    const user = get().user;
    const state = get();
    
    const assessment = state.recoveryAssessments.find(a => a.basin === basin);
    const preLockDeviations = assessment?.preLockDeviations || [0, -30, -55];
    
    const newRetest: RetestSimulation = {
      id: `retest-${basin}-${Date.now()}`,
      basin,
      status: 'pending',
      nppDeviation: null,
      threshold: 20,
      uploadedAt: new Date().toISOString(),
      completedAt: null,
      result: null,
      recommendation: null,
      calibrationData: {
        ...calibrationData,
        uploadedBy: user?.name || '未知用户'
      },
      preLockDeviations,
      postRetestDeviation: null,
      improvementPercent: null,
      countsTowardUnlock: false
    };

    set(state => {
      const existingAssessment = state.recoveryAssessments.find(a => a.basin === basin);
      if (existingAssessment) {
        return {
          recoveryAssessments: state.recoveryAssessments.map(a =>
            a.basin === basin ? {
              ...a,
              retestHistory: [...a.retestHistory, newRetest],
              status: 'in_progress'
            } : a
          )
        };
      } else {
        const newAssessment: RecoveryAssessment = {
          id: `recovery-${basin}-${Date.now()}`,
          basin,
          retestHistory: [newRetest],
          consecutivePasses: 0,
          requiredPasses: 2,
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          completedAt: null,
          preLockDeviations,
          preLockNppValues: [2.0, 1.4, 0.9]
        };
        return {
          recoveryAssessments: [...state.recoveryAssessments, newAssessment]
        };
      }
    });

    get().addWorkOrderEvent(basin, {
      type: 'calibration_uploaded',
      title: '校准数据已上传',
      description: `上传文件：${calibrationData.name}（${(calibrationData.size / 1024 / 1024).toFixed(1)} MB）`,
      handledBy: user?.id,
      handledByName: user?.name
    });
    get().updateWorkOrderStep(basin, 'step_calibration', true);
    get().updateWorkOrderStep(basin, 'step_retest', false);

    get().setNotification({ type: 'success', message: '复测模拟已提交，等待处理...' });

    setTimeout(() => {
      set(state => ({
        recoveryAssessments: state.recoveryAssessments.map(a =>
          a.basin === basin ? {
            ...a,
            retestHistory: a.retestHistory.map(r =>
              r.id === newRetest.id ? { ...r, status: 'running' } : r
            )
          } : a
        )
      }));
    }, 1000);

    setTimeout(() => {
      const deviation = (Math.random() - 0.5) * 40;
      const postRetestDeviation = Math.round(deviation * 10) / 10;
      const result = Math.abs(postRetestDeviation) <= 20 ? 'pass' : 'fail';
      const recommendation = result === 'pass' 
        ? '复测通过，NPP偏差在允许范围内。建议继续进行下一次复测。'
        : '复测失败，NPP偏差仍超过阈值。建议检查浮游植物功能群参数或沉降速率设置。';

      const lastPreLockDeviation = preLockDeviations[preLockDeviations.length - 1];
      const improvementPercent = lastPreLockDeviation !== undefined && postRetestDeviation !== null
        ? Math.round(((Math.abs(lastPreLockDeviation) - Math.abs(postRetestDeviation)) / Math.abs(lastPreLockDeviation)) * 100)
        : null;

      set(state => {
        const assessment = state.recoveryAssessments.find(a => a.basin === basin);
        const newConsecutivePasses = result === 'pass' 
          ? (assessment?.consecutivePasses || 0) + 1 
          : 0;
        
        const autoUnlock = newConsecutivePasses >= 2;
        
        const updatedState: Partial<AppState> = {
          recoveryAssessments: state.recoveryAssessments.map(a =>
            a.basin === basin ? {
              ...a,
              consecutivePasses: newConsecutivePasses,
              status: autoUnlock ? 'completed' : 'in_progress',
              completedAt: autoUnlock ? new Date().toISOString() : null,
              retestHistory: a.retestHistory.map(r =>
                r.id === newRetest.id ? {
                  ...r,
                  status: 'completed',
                  nppDeviation: postRetestDeviation,
                  postRetestDeviation,
                  improvementPercent,
                  countsTowardUnlock: result === 'pass',
                  result,
                  recommendation,
                  completedAt: new Date().toISOString()
                } : r
              )
            } : a
          )
        };

        if (autoUnlock) {
          updatedState.basinStatuses = state.basinStatuses.map(b =>
            b.basin === basin ? {
              ...b,
              isPaused: false,
              consecutiveDeviations: 0,
              unlockReason: '连续两次复测通过，系统自动解锁',
              unlockedAt: new Date().toISOString(),
              unlockedBy: 'system',
              unlockedByName: '系统自动',
              currentHandler: null,
              currentHandlerName: null,
              workOrderId: null
            } : b
          );

          updatedState.workOrders = state.workOrders.map(wo =>
            wo.basin === basin ? {
              ...wo,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              steps: wo.steps.map(s => ({ ...s, completed: true, completedAt: new Date().toISOString() }))
            } : wo
          );

          get().addWorkOrderEvent(basin, {
            type: 'auto_unlocked',
            title: '海盆已自动解锁',
            description: '连续两次复测通过，系统自动解除海盆锁定',
            handledBy: 'system',
            handledByName: '系统自动'
          });
        }

        return updatedState;
      });

      get().addWorkOrderEvent(basin, {
        type: 'retest_completed',
        title: '复测模拟完成',
        description: `NPP偏差：${Math.abs(postRetestDeviation).toFixed(1)}%，${result === 'pass' ? '通过' : '未通过'}`,
        handledBy: user?.id,
        handledByName: user?.name,
        metadata: {
          deviation: postRetestDeviation,
          result,
          improvementPercent
        }
      });

      if (result === 'pass') {
        get().setNotification({ 
          type: 'success', 
          message: `复测通过！NPP偏差${Math.abs(postRetestDeviation).toFixed(1)}%，改善幅度${improvementPercent ? improvementPercent + '%' : '计算中'}。` 
        });
      } else {
        get().setNotification({ 
          type: 'warning', 
          message: `复测未通过。NPP偏差${Math.abs(postRetestDeviation).toFixed(1)}%，改善幅度${improvementPercent ? improvementPercent + '%' : '无'}。请参考建议调整参数后重新上传。` 
        });
      }
    }, 4000);
  },

  addWorkOrderEvent: (basin: string, event: Omit<WorkOrderEvent, 'id' | 'timestamp'>) => {
    const user = get().user;
    const newEvent: WorkOrderEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      handledBy: event.handledBy || user?.id,
      handledByName: event.handledByName || user?.name
    };

    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.basin === basin ? {
          ...wo,
          events: [...wo.events, newEvent]
        } : wo
      )
    }));
  },

  addWorkOrderRemark: (basin: string, content: string) => {
    const user = get().user;
    const newRemark: WorkOrderRemark = {
      id: `remark-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || 'unknown',
      createdByName: user?.name || '未知用户'
    };

    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.basin === basin ? {
          ...wo,
          remarks: [...wo.remarks, newRemark]
        } : wo
      )
    }));

    get().addWorkOrderEvent(basin, {
      type: 'remark_added',
      title: '处理人补充备注',
      description: content.length > 50 ? content.substring(0, 50) + '...' : content,
      handledBy: user?.id,
      handledByName: user?.name
    });

    get().setNotification({ type: 'success', message: '备注已添加' });
  },

  updateNextPlan: (basin: string, nextPlan: string) => {
    const user = get().user;
    const now = new Date().toISOString();

    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.basin === basin ? {
          ...wo,
          nextPlan,
          nextPlanUpdatedAt: now,
          nextPlanUpdatedBy: user?.id || null,
          nextPlanUpdatedByName: user?.name || null
        } : wo
      )
    }));

    get().addWorkOrderEvent(basin, {
      type: 'next_plan_set',
      title: '下一步计划已更新',
      description: nextPlan.length > 50 ? nextPlan.substring(0, 50) + '...' : nextPlan,
      handledBy: user?.id,
      handledByName: user?.name
    });

    get().setNotification({ type: 'success', message: '下一步计划已更新' });
  },

  updateWorkOrderStep: (basin: string, stepId: string, completed: boolean) => {
    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.basin === basin ? {
          ...wo,
          steps: wo.steps.map(s =>
            s.id === stepId ? {
              ...s,
              completed,
              completedAt: completed ? new Date().toISOString() : null
            } : s
          ),
          currentStep: completed 
            ? Math.min(wo.currentStep + 1, wo.steps.length - 1)
            : wo.currentStep
        } : wo
      )
    }));
  },
}));
