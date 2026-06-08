import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Upload,
  Play,
  Clock,
  User,
  Users,
  Calendar,
  TrendingDown,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  BarChart3,
  History,
  RefreshCw,
  Loader2,
  Eye,
  Target,
  Timer,
  Edit3,
  Send,
  ArrowRight,
  Search,
  RotateCcw,
  UserPlus,
  ChevronLeft,
  Flag,
  Layers
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { BasinStatus, UserRole, RecoveryAssessment, RetestSimulation, BasinWorkOrder, WorkOrderEvent } from '../../shared/types';
import { mockUsers, roleLabels } from '../utils/mockData';

export const BasinGovernance: React.FC = () => {
  const { basinStatuses, user, unlockBasin, recoveryAssessments, addRetestSimulation, setNotification, workOrders, addWorkOrderRemark, updateNextPlan, reassignHandler, checkOverdueWorkOrders } = useStore();
  const [selectedBasin, setSelectedBasin] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [expandedBasin, setExpandedBasin] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [editNextPlan, setEditNextPlan] = useState(false);
  const [nextPlanText, setNextPlanText] = useState('');
  const [showRetrospective, setShowRetrospective] = useState(false);
  const [retrospectiveBasin, setRetrospectiveBasin] = useState<string | null>(null);
  const [filterHandler, setFilterHandler] = useState<string>('all');
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedPhase, setSelectedPhase] = useState<WorkOrderEvent['phase'] | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignToHandler, setReassignToHandler] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [viewTab, setViewTab] = useState<'governance' | 'retrospective'>('governance');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkOverdueWorkOrders();
    const interval = setInterval(checkOverdueWorkOrders, 60000);
    return () => clearInterval(interval);
  }, [checkOverdueWorkOrders]);

  const lockedBasins = basinStatuses.filter(b => b.isPaused);
  const isChiefScientist = user?.role === UserRole.CHIEF_SCIENTIST || user?.role === UserRole.ADMIN;

  const getDeviationColor = (deviation: number) => {
    const abs = Math.abs(deviation);
    if (abs > 20) return 'text-coral-400';
    if (abs > 10) return 'text-yellow-400';
    return 'text-seaweed-400';
  };

  const getDeviationBg = (deviation: number) => {
    const abs = Math.abs(deviation);
    if (abs > 20) return 'bg-coral-500/20 border-coral-500/30';
    if (abs > 10) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-seaweed-500/20 border-seaweed-500/30';
  };

  const handleUnlock = () => {
    if (!unlockReason.trim()) {
      setNotification({ type: 'error', message: '请填写解除锁定原因' });
      return;
    }
    if (selectedBasin) {
      unlockBasin(selectedBasin, unlockReason);
      setShowUnlockModal(false);
      setUnlockReason('');
      setSelectedBasin(null);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleSubmitRetest = () => {
    if (!selectedBasin || !uploadFile) {
      setNotification({ type: 'error', message: '请选择校准数据文件' });
      return;
    }
    addRetestSimulation(selectedBasin, {
      name: uploadFile.name,
      size: uploadFile.size
    });
    setShowUploadModal(false);
    setUploadFile(null);
    setSelectedBasin(null);
  };

  const getRecoveryAssessment = (basin: string): RecoveryAssessment | undefined => {
    return recoveryAssessments.find(a => a.basin === basin);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const getStatusBadge = (status: RetestSimulation['status']) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs">待处理</span>;
      case 'running': return <span className="px-2 py-0.5 bg-ocean-500/20 text-ocean-300 rounded text-xs">处理中</span>;
      case 'completed': return <span className="px-2 py-0.5 bg-seaweed-500/20 text-seaweed-300 rounded text-xs">已完成</span>;
      case 'failed': return <span className="px-2 py-0.5 bg-coral-500/20 text-coral-300 rounded text-xs">失败</span>;
    }
  };

  const getResultBadge = (result: RetestSimulation['result']) => {
    if (result === 'pass') return <span className="px-2 py-0.5 bg-seaweed-500/20 text-seaweed-300 rounded text-xs flex items-center gap-1"><CheckCircle size={12} /> 通过</span>;
    if (result === 'fail') return <span className="px-2 py-0.5 bg-coral-500/20 text-coral-300 rounded text-xs flex items-center gap-1"><XCircle size={12} /> 未通过</span>;
    return <span className="px-2 py-0.5 bg-white/5 text-white/50 rounded text-xs">-</span>;
  };

  const getWorkOrder = (basin: string): BasinWorkOrder | undefined => {
    return workOrders.find(w => w.basin === basin);
  };

  const getEventIcon = (type: WorkOrderEvent['type']) => {
    switch (type) {
      case 'lock_triggered': return <Lock size={14} className="text-coral-400" />;
      case 'notification_sent': return <AlertTriangle size={14} className="text-yellow-400" />;
      case 'handler_assigned': return <User size={14} className="text-ocean-400" />;
      case 'handler_reassigned': return <UserPlus size={14} className="text-purple-400" />;
      case 'calibration_uploaded': return <Upload size={14} className="text-blue-400" />;
      case 'retest_started': return <Play size={14} className="text-green-400" />;
      case 'retest_running': return <RefreshCw size={14} className="text-blue-400 animate-spin" />;
      case 'retest_completed': return <CheckCircle size={14} className="text-seaweed-400" />;
      case 'retest_failed': return <XCircle size={14} className="text-coral-400" />;
      case 'expert_opinion': return <MessageSquare size={14} className="text-indigo-400" />;
      case 'remark_added': return <Edit3 size={14} className="text-gray-400" />;
      case 'next_plan_set': return <Target size={14} className="text-yellow-400" />;
      case 'auto_unlocked': return <Unlock size={14} className="text-seaweed-400" />;
      case 'manual_unlocked': return <Unlock size={14} className="text-seaweed-400" />;
      default: return <Clock size={14} className="text-white/50" />;
    }
  };

  const getPhaseName = (phase?: WorkOrderEvent['phase']) => {
    switch (phase) {
      case 'lock': return '锁定阶段';
      case 'notification': return '通知阶段';
      case 'calibration': return '校准阶段';
      case 'retest': return '复测阶段';
      case 'expert': return '专家阶段';
      case 'unlock': return '解锁阶段';
      default: return '其他';
    }
  };

  const getPhaseColor = (phase?: WorkOrderEvent['phase']) => {
    switch (phase) {
      case 'lock': return 'text-coral-400';
      case 'notification': return 'text-yellow-400';
      case 'calibration': return 'text-blue-400';
      case 'retest': return 'text-seaweed-400';
      case 'expert': return 'text-purple-400';
      case 'unlock': return 'text-ocean-400';
      default: return 'text-white/50';
    }
  };

  const getPhaseBgColor = (phase?: WorkOrderEvent['phase']) => {
    switch (phase) {
      case 'lock': return 'bg-coral-500/10 border-coral-500/30';
      case 'notification': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'calibration': return 'bg-blue-500/10 border-blue-500/30';
      case 'retest': return 'bg-seaweed-500/10 border-seaweed-500/30';
      case 'expert': return 'bg-purple-500/10 border-purple-500/30';
      case 'unlock': return 'bg-ocean-500/10 border-ocean-500/30';
      default: return 'bg-white/5 border-white/10';
    }
  };

  const getFilteredEvents = (workOrder: BasinWorkOrder) => {
    return workOrder.events.filter(event => {
      if (filterHandler !== 'all' && event.handledBy !== filterHandler) return false;
      if (filterEventType !== 'all' && event.type !== filterEventType) return false;
      if (filterPhase !== 'all' && event.phase !== filterPhase) return false;
      if (dateRange.start && new Date(event.timestamp) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(event.timestamp) > new Date(dateRange.end)) return false;
      return true;
    });
  };

  const getPhaseEvents = (workOrder: BasinWorkOrder, phase: WorkOrderEvent['phase']) => {
    return workOrder.events.filter(e => e.phase === phase);
  };

  const getPhaseRemarks = (workOrder: BasinWorkOrder, phase: WorkOrderEvent['phase']) => {
    return workOrder.remarks.filter(r => r.phase === phase);
  };

  const openRetrospective = (basin: string) => {
    setRetrospectiveBasin(basin);
    setShowRetrospective(true);
    setFilterHandler('all');
    setFilterEventType('all');
    setFilterPhase('all');
    setSelectedPhase(null);
    setDateRange({ start: '', end: '' });
  };

  const closeRetrospective = () => {
    setShowRetrospective(false);
    setRetrospectiveBasin(null);
    setSelectedPhase(null);
  };

  const openReassignModal = (basin: string) => {
    setSelectedBasin(basin);
    setReassignToHandler('');
    setReassignReason('');
    setShowReassignModal(true);
  };

  const handleReassign = () => {
    if (!selectedBasin || !reassignToHandler || !reassignReason.trim()) {
      setNotification({ type: 'error', message: '请选择处理人和填写改派原因' });
      return;
    }
    const targetUser = mockUsers.find(u => u.id === reassignToHandler);
    if (targetUser) {
      reassignHandler(selectedBasin, targetUser.id, targetUser.name, reassignReason.trim());
    }
    setShowReassignModal(false);
    setSelectedBasin(null);
    setReassignToHandler('');
    setReassignReason('');
  };

  const getStepStatus = (step: { completed: boolean }, index: number, currentStep: number) => {
    if (step.completed) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const handleAddRemark = (basin: string) => {
    if (!newRemark.trim()) {
      setNotification({ type: 'error', message: '请输入备注内容' });
      return;
    }
    addWorkOrderRemark(basin, newRemark.trim());
    setNewRemark('');
  };

  const handleSaveNextPlan = (basin: string) => {
    if (!nextPlanText.trim()) {
      setNotification({ type: 'error', message: '请输入下一步计划' });
      return;
    }
    updateNextPlan(basin, nextPlanText.trim());
    setEditNextPlan(false);
  };

  const openWorkOrderModal = (basin: string) => {
    setSelectedBasin(basin);
    const wo = getWorkOrder(basin);
    if (wo?.nextPlan) {
      setNextPlanText(wo.nextPlan);
    }
    setShowWorkOrderModal(true);
  };

  const closeWorkOrderModal = () => {
    setShowWorkOrderModal(false);
    setSelectedBasin(null);
    setNewRemark('');
    setEditNextPlan(false);
    setNextPlanText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="text-ocean-400" size={28} />
            海盆治理中心
          </h1>
          <p className="text-white/60 text-sm mt-1">管理海盆锁定状态、恢复评估流程和参数调整追溯</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setViewTab('governance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewTab === 'governance' 
                ? 'bg-ocean-500 text-white shadow-lg' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Shield size={14} />
              治理视图
            </span>
          </button>
          <button
            onClick={() => setViewTab('retrospective')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewTab === 'retrospective' 
                ? 'bg-ocean-500 text-white shadow-lg' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <History size={14} />
              复盘视图
            </span>
          </button>
        </div>
      </div>

      {viewTab === 'governance' && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ocean-500/20 flex items-center justify-center">
            <Shield size={24} className="text-ocean-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{basinStatuses.length}</p>
            <p className="text-xs text-white/50">总海盆数</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-coral-500/20 flex items-center justify-center">
            <Lock size={24} className="text-coral-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{lockedBasins.length}</p>
            <p className="text-xs text-white/50">已锁定海盆</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-seaweed-500/20 flex items-center justify-center">
            <CheckCircle size={24} className="text-seaweed-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{basinStatuses.filter(b => !b.isPaused).length}</p>
            <p className="text-xs text-white/50">正常海盆</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <RefreshCw size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{recoveryAssessments.filter(a => a.status === 'in_progress').length}</p>
            <p className="text-xs text-white/50">恢复评估中</p>
          </div>
        </div>
      </div>

      {lockedBasins.length > 0 && (
        <div className="p-4 rounded-xl bg-coral-500/10 border border-coral-500/30 flex items-start gap-3">
          <AlertTriangle size={20} className="text-coral-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-coral-300">⚠️ 以下海盆已被锁定，无法创建新的模拟任务</p>
            <p className="text-xs text-coral-400/70 mt-1">
              {lockedBasins.map(b => b.basin).join('、')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 size={18} className="text-ocean-400" />
          海盆状态一览
        </h2>
        
        {basinStatuses.map((basin: BasinStatus) => (
          <div key={basin.basin} className="card overflow-hidden">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setExpandedBasin(expandedBasin === basin.basin ? null : basin.basin)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  basin.isPaused ? 'bg-coral-500/20' : 'bg-seaweed-500/20'
                }`}>
                  {basin.isPaused ? <Lock size={18} className="text-coral-400" /> : <CheckCircle size={18} className="text-seaweed-400" />}
                </div>
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    {basin.basin}
                    {basin.isPaused && (
                      <span className="px-2 py-0.5 bg-coral-500/20 text-coral-300 rounded text-xs">已锁定</span>
                    )}
                    {getWorkOrder(basin.basin)?.overdue && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs flex items-center gap-1 animate-pulse">
                        <Flag size={10} />
                        已逾期
                      </span>
                    )}
                    {!basin.isPaused && basin.unlockedAt && (
                      <span className="px-2 py-0.5 bg-seaweed-500/20 text-seaweed-300 rounded text-xs">已解锁</span>
                    )}
                  </div>
                  <div className="text-xs text-white/50 flex items-center gap-2 mt-1">
                    {basin.isPaused ? (
                      <>
                        <span>连续偏差 {basin.consecutiveDeviations} 次</span>
                        <span>•</span>
                        <span>锁定于 {formatDate(basin.lockedAt)}</span>
                      </>
                    ) : (
                      <>
                        <span>状态正常</span>
                        {basin.unlockedAt && (
                          <>
                            <span>•</span>
                            <span>解锁于 {formatDate(basin.unlockedAt)}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {basin.lastDeviations.slice(1).map((dev, i) => (
                    <div key={i} className={`px-2 py-1 rounded border text-xs font-mono ${getDeviationBg(dev)}`}>
                      <span className={getDeviationColor(dev)}>
                        {dev > 0 ? '+' : ''}{dev.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
                {expandedBasin === basin.basin ? (
                  <ChevronUp size={20} className="text-white/50" />
                ) : (
                  <ChevronDown size={20} className="text-white/50" />
                )}
              </div>
            </div>

            {expandedBasin === basin.basin && (
              <div className="border-t border-white/10 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-yellow-400" />
                      锁定详情
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">锁定原因</span>
                        <span className="text-white/80 font-medium">{basin.lockedReason || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">连续超标次数</span>
                        <span className="text-coral-400 font-mono font-medium">{basin.consecutiveDeviations} 次</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">阈值</span>
                        <span className="text-white/80">NPP偏差 ±20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">锁定时间</span>
                        <span className="text-white/80 font-mono">{formatDate(basin.lockedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">通知时间</span>
                        <span className="text-white/80 font-mono">{formatDate(basin.notifiedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                      <TrendingDown size={14} className="text-ocean-400" />
                      最近三次NPP值
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {basin.lastNppValues.map((val, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/5 text-center">
                          <div className="text-xs text-white/40 mb-1">第{i + 1}次</div>
                          <div className="text-lg font-mono font-bold text-ocean-400">{val.toFixed(2)}</div>
                          {i > 0 && (
                            <div className={`text-xs mt-1 ${getDeviationColor(basin.lastDeviations[i])}`}>
                              {basin.lastDeviations[i] > 0 ? '+' : ''}{basin.lastDeviations[i].toFixed(1)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                      <Users size={14} className="text-seaweed-400" />
                      通知对象
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {basin.notifiedParties.length > 0 ? (
                        basin.notifiedParties.map((party, i) => (
                          <span key={i} className="px-2 py-1 bg-ocean-500/10 text-ocean-300 rounded text-xs">
                            {party}
                          </span>
                        ))
                      ) : (
                        <span className="text-white/40 text-xs">暂无</span>
                      )}
                    </div>
                    {basin.currentHandler && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-white/50">当前处理人</span>
                        <span className="text-white/80 font-medium flex items-center gap-1">
                          <User size={12} />
                          {basin.currentHandlerName}
                        </span>
                      </div>
                    )}
                  </div>

                  {basin.unlockedAt && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Unlock size={14} className="text-seaweed-400" />
                        解锁记录
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/50">解锁时间</span>
                          <span className="text-white/80 font-mono">{formatDate(basin.unlockedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">解锁人</span>
                          <span className="text-seaweed-400">{basin.unlockedByName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">解锁原因</span>
                          <span className="text-white/80">{basin.unlockReason}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {basin.isPaused && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBasin(basin.basin);
                        setShowUploadModal(true);
                      }}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Upload size={16} />
                      上传校准数据
                    </button>
                    {getWorkOrder(basin.basin) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openWorkOrderModal(basin.basin);
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Eye size={16} />
                          查看工单详情
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRetrospective(basin.basin);
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <History size={16} />
                          复盘视图
                        </button>
                      </>
                    )}
                    {isChiefScientist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBasin(basin.basin);
                          setShowUnlockModal(true);
                        }}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Unlock size={16} />
                        手动解除锁定
                      </button>
                    )}
                  </div>
                )}

                {getRecoveryAssessment(basin.basin) && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <h3 className="text-sm font-medium text-white/80 flex items-center gap-2 mb-4">
                      <History size={14} className="text-yellow-400" />
                      恢复评估记录
                      <span className="ml-auto text-xs font-normal text-white/50">
                        连续通过 {getRecoveryAssessment(basin.basin)!.consecutivePasses}/{getRecoveryAssessment(basin.basin)!.requiredPasses} 次可自动解锁
                      </span>
                    </h3>
                    
                    <div className="space-y-3">
                      {getRecoveryAssessment(basin.basin)!.retestHistory.map((retest: RetestSimulation) => (
                        <div key={retest.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {getStatusBadge(retest.status)}
                                {getResultBadge(retest.result)}
                                {retest.countsTowardUnlock && (
                                  <span className="px-2 py-0.5 bg-seaweed-500/10 text-seaweed-300 rounded text-xs flex items-center gap-1">
                                    <CheckCircle size={10} />
                                    计入解锁计数
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-white/50 mt-2">
                                上传时间: {formatDate(retest.uploadedAt)}
                                {retest.completedAt && ` · 完成时间: ${formatDate(retest.completedAt)}`}
                              </div>
                            </div>
                            {retest.calibrationData && (
                              <div className="text-right">
                                <div className="text-sm text-white/80">{retest.calibrationData.name}</div>
                                <div className="text-xs text-white/50">
                                  {formatFileSize(retest.calibrationData.size)} · {retest.calibrationData.uploadedBy}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {retest.nppDeviation !== null && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              {retest.preLockDeviations && (
                                <div className="p-3 rounded-lg bg-coral-500/10 border border-coral-500/20">
                                  <div className="text-xs text-white/40 mb-1">锁定前连续偏差</div>
                                  <div className="flex gap-1 flex-wrap">
                                    {retest.preLockDeviations.map((d, i) => (
                                      <span key={i} className={`text-xs font-mono font-bold ${getDeviationColor(d)}`}>
                                        {d > 0 ? '+' : ''}{d.toFixed(1)}%
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="p-3 rounded-lg bg-white/5">
                                <div className="text-xs text-white/40 mb-1">复测NPP偏差</div>
                                <div className={`text-xl font-mono font-bold ${getDeviationColor(retest.nppDeviation)}`}>
                                  {retest.nppDeviation > 0 ? '+' : ''}{retest.nppDeviation.toFixed(1)}%
                                </div>
                              </div>
                              {retest.improvementPercent !== null && (
                                <div className="p-3 rounded-lg bg-seaweed-500/10 border border-seaweed-500/20">
                                  <div className="text-xs text-white/40 mb-1">改善幅度</div>
                                  <div className={`text-xl font-mono font-bold ${retest.improvementPercent > 0 ? 'text-seaweed-400' : 'text-coral-400'}`}>
                                    {retest.improvementPercent > 0 ? '+' : ''}{retest.improvementPercent}%
                                  </div>
                                </div>
                              )}
                              <div className="p-3 rounded-lg bg-white/5">
                                <div className="text-xs text-white/40 mb-1">允许阈值</div>
                                <div className="text-xl font-mono font-bold text-white/80">
                                  ±{retest.threshold}%
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {retest.recommendation && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                              <div className="text-xs font-medium text-yellow-400 mb-1 flex items-center gap-1">
                                <MessageSquare size={12} />
                                建议处理方案
                              </div>
                              <div className="text-sm text-yellow-200/80">{retest.recommendation}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showUnlockModal && selectedBasin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Unlock size={18} className="text-seaweed-400" />
                <span>解除 {selectedBasin} 锁定</span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-yellow-200/80">
                  ⚠️ 解除锁定后，{selectedBasin} 将恢复可创建模拟任务的状态。请确保数据质量问题已得到解决。
                </p>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  解除锁定原因 <span className="text-coral-400">*</span>
                </label>
                <textarea
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  placeholder="请填写解除锁定的原因，如：数据质量问题已修复、参数重新校准完成等..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:border-ocean-500/50 resize-none h-24"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUnlockModal(false);
                    setUnlockReason('');
                    setSelectedBasin(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleUnlock}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Unlock size={16} />
                  确认解除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && selectedBasin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-ocean-400" />
                <span>上传 {selectedBasin} 校准数据</span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 rounded-lg bg-ocean-500/10 border border-ocean-500/30">
                <p className="text-sm text-ocean-200/80">
                  📁 支持 NetCDF (.nc)、CSV (.csv) 格式的校准数据文件。上传后将自动发起复测模拟。
                </p>
              </div>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-ocean-500/50 hover:bg-white/5 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".nc,.csv"
                  onChange={handleUpload}
                  className="hidden"
                />
                {uploadFile ? (
                  <div>
                    <FileText size={40} className="mx-auto mb-2 text-ocean-400" />
                    <p className="text-sm font-medium text-white">{uploadFile.name}</p>
                    <p className="text-xs text-white/50 mt-1">{formatFileSize(uploadFile.size)}</p>
                    <p className="text-xs text-ocean-400 mt-2">点击重新选择文件</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={40} className="mx-auto mb-2 text-white/30" />
                    <p className="text-sm text-white/60">点击选择校准数据文件</p>
                    <p className="text-xs text-white/40 mt-1">支持 .nc, .csv 格式</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setSelectedBasin(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitRetest}
                  disabled={!uploadFile}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={16} />
                  发起复测
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWorkOrderModal && selectedBasin && getWorkOrder(selectedBasin) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="card-header flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ocean-500/20 flex items-center justify-center">
                    <Shield size={20} className="text-ocean-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {selectedBasin} 处置工单
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        getWorkOrder(selectedBasin)!.status === 'open' ? 'bg-coral-500/20 text-coral-300' :
                        getWorkOrder(selectedBasin)!.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                        getWorkOrder(selectedBasin)!.status === 'resolved' ? 'bg-seaweed-500/20 text-seaweed-300' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {getWorkOrder(selectedBasin)!.status === 'open' ? '待处理' :
                         getWorkOrder(selectedBasin)!.status === 'in_progress' ? '处理中' :
                         getWorkOrder(selectedBasin)!.status === 'resolved' ? '已解决' : '已关闭'}
                      </span>
                      {getWorkOrder(selectedBasin)!.overdue && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs flex items-center gap-1 animate-pulse">
                          <Flag size={10} />
                          已逾期
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5 flex items-center gap-2">
                      创建于 {formatDate(getWorkOrder(selectedBasin)!.createdAt)}
                      {getWorkOrder(selectedBasin)!.resolvedAt && ` · 解决于 ${formatDate(getWorkOrder(selectedBasin)!.resolvedAt)}`}
                      {getWorkOrder(selectedBasin)!.currentHandlerName && (
                        <>
                          <span className="text-white/30">•</span>
                          <span className="flex items-center gap-1">
                            <User size={10} />
                            当前处理人：{getWorkOrder(selectedBasin)!.currentHandlerName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isChiefScientist && getWorkOrder(selectedBasin)!.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        openReassignModal(selectedBasin);
                      }}
                      className="px-3 py-1.5 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <UserPlus size={14} />
                      改派处理人
                    </button>
                  )}
                  <button
                    onClick={closeWorkOrderModal}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white/80 flex items-center gap-2 mb-3">
                      <Timer size={14} className="text-ocean-400" />
                      处理步骤进度
                    </h3>
                    <div className="space-y-2">
                      {getWorkOrder(selectedBasin)!.steps.map((step, index) => {
                        const status = getStepStatus(step, index, getWorkOrder(selectedBasin)!.currentStep);
                        return (
                          <div key={step.id} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              status === 'completed' ? 'bg-seaweed-500/20 text-seaweed-400' :
                              status === 'current' ? 'bg-ocean-500/20 text-ocean-400 ring-2 ring-ocean-500/30 ring-offset-2 ring-offset-bg-dark' :
                              'bg-white/5 text-white/30'
                            }`}>
                              {status === 'completed' ? <CheckCircle size={16} /> :
                               status === 'current' ? <Loader2 size={16} className="animate-spin" /> :
                               <span className="text-xs font-mono">{index + 1}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${
                                status === 'completed' ? 'text-seaweed-300' :
                                status === 'current' ? 'text-white' :
                                'text-white/40'
                              }`}>
                                {step.title}
                              </div>
                              {step.completedAt && (
                                <div className="text-xs text-white/40 mt-0.5">
                                  完成于 {formatDate(step.completedAt)}
                                </div>
                              )}
                            </div>
                            {status === 'current' && (
                              <span className="px-2 py-0.5 bg-ocean-500/20 text-ocean-300 rounded text-xs animate-pulse">
                                当前步骤
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-white/80 flex items-center gap-2 mb-3">
                      <Target size={14} className="text-yellow-400" />
                      下一步计划
                    </h3>
                    {editNextPlan ? (
                      <div className="space-y-3">
                        <textarea
                          value={nextPlanText}
                          onChange={(e) => setNextPlanText(e.target.value)}
                          placeholder="请输入下一步计划..."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:border-ocean-500/50 resize-none h-24"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveNextPlan(selectedBasin)}
                            className="btn-primary text-sm px-3 py-1.5"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => {
                              setEditNextPlan(false);
                              const wo = getWorkOrder(selectedBasin);
                              if (wo?.nextPlan) setNextPlanText(wo.nextPlan);
                            }}
                            className="btn-secondary text-sm px-3 py-1.5"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            {getWorkOrder(selectedBasin)!.nextPlan ? (
                              <div>
                                <div className="text-sm text-yellow-200/90">{getWorkOrder(selectedBasin)!.nextPlan}</div>
                                {getWorkOrder(selectedBasin)!.nextPlanUpdatedAt && (
                                  <div className="text-xs text-yellow-200/50 mt-2">
                                    更新于 {formatDate(getWorkOrder(selectedBasin)!.nextPlanUpdatedAt)} 
                                    {getWorkOrder(selectedBasin)!.nextPlanUpdatedByName && ` · ${getWorkOrder(selectedBasin)!.nextPlanUpdatedByName}`}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-yellow-200/50">暂无下一步计划，点击编辑添加</div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditNextPlan(true);
                              const wo = getWorkOrder(selectedBasin);
                              if (wo?.nextPlan) setNextPlanText(wo.nextPlan);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-yellow-200/70 hover:text-yellow-200 flex-shrink-0"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white/80 flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-purple-400" />
                    事件时间线
                  </h3>
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-ocean-500/30 via-purple-500/30 to-seaweed-500/30" />
                    {[...getWorkOrder(selectedBasin)!.events].reverse().map((event) => (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-6 w-4 h-4 rounded-full bg-bg-dark border-2 border-current flex items-center justify-center" style={{ color: event.type.includes('lock') ? '#f87171' : event.type.includes('unlock') ? '#4ade80' : '#60a5fa' }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-0.5">{getEventIcon(event.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-white">{event.title}</span>
                                {event.handledByName && (
                                  <span className="text-xs text-white/50 flex items-center gap-1">
                                    <User size={10} />
                                    {event.handledByName}
                                  </span>
                                )}
                              </div>
                              {event.description && (
                                <div className="text-sm text-white/60 mt-1">{event.description}</div>
                              )}
                              {event.metadata && Object.keys(event.metadata).length > 0 && (
                                <div className="mt-2 p-2 rounded bg-white/5 text-xs text-white/50 space-y-1">
                                  {Object.entries(event.metadata).map(([key, value]) => (
                                    <div key={key} className="flex gap-2">
                                      <span className="text-white/40">{key}:</span>
                                      <span className="text-white/70 font-mono">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="text-xs text-white/40 mt-2 flex items-center gap-1">
                                <Clock size={10} />
                                {formatDate(event.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white/80 flex items-center gap-2 mb-3">
                  <MessageSquare size={14} className="text-blue-400" />
                  处理人备注
                  <span className="ml-auto text-xs font-normal text-white/50">
                    {getWorkOrder(selectedBasin)!.remarks.length} 条备注
                  </span>
                </h3>
                
                <div className="space-y-3 mb-4">
                  {getWorkOrder(selectedBasin)!.remarks.length === 0 ? (
                    <div className="p-8 rounded-lg bg-white/5 border border-white/10 text-center">
                      <MessageSquare size={32} className="mx-auto mb-2 text-white/20" />
                      <p className="text-sm text-white/40">暂无备注，添加第一条备注吧</p>
                    </div>
                  ) : (
                    [...getWorkOrder(selectedBasin)!.remarks].reverse().map((remark) => (
                      <div key={remark.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{remark.createdByName}</span>
                              <span className="text-xs text-white/40">{formatDate(remark.createdAt)}</span>
                            </div>
                            <div className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{remark.content}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder="添加备注..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddRemark(selectedBasin);
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:border-ocean-500/50"
                  />
                  <button
                    onClick={() => handleAddRemark(selectedBasin)}
                    disabled={!newRemark.trim()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRetrospective && retrospectiveBasin && getWorkOrder(retrospectiveBasin) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="card-header flex-shrink-0 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => selectedPhase ? setSelectedPhase(null) : closeRetrospective()}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {selectedPhase ? (
                        <>
                          <span className={`${getPhaseColor(selectedPhase)}`}>
                            {getPhaseName(selectedPhase)}
                          </span>
                          <span className="text-white/40">—</span>
                          <span>{retrospectiveBasin} 详情</span>
                        </>
                      ) : (
                        <>
                          <History size={20} className="text-ocean-400" />
                          <span>{retrospectiveBasin} 锁定事件复盘</span>
                        </>
                      )}
                    </div>
                    {!selectedPhase && (
                      <div className="text-xs text-white/50 mt-0.5">
                        从锁定到解锁全流程追溯，支持多维度筛选
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeRetrospective}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {!selectedPhase ? (
              <>
                <div className="p-4 border-b border-white/10 bg-white/5 flex-shrink-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block flex items-center gap-1">
                        <User size={10} />
                        处理人
                      </label>
                      <select
                        value={filterHandler}
                        onChange={(e) => setFilterHandler(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
                      >
                        <option value="all">全部处理人</option>
                        {mockUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                        <option value="system">系统自动</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block flex items-center gap-1">
                        <Layers size={10} />
                        事件类型
                      </label>
                      <select
                        value={filterEventType}
                        onChange={(e) => setFilterEventType(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
                      >
                        <option value="all">全部类型</option>
                        <option value="lock_triggered">锁定触发</option>
                        <option value="notification_sent">通知发送</option>
                        <option value="handler_assigned">处理人指派</option>
                        <option value="handler_reassigned">处理人改派</option>
                        <option value="calibration_uploaded">校准数据上传</option>
                        <option value="retest_started">复测开始</option>
                        <option value="retest_running">复测运行中</option>
                        <option value="retest_completed">复测通过</option>
                        <option value="retest_failed">复测未通过</option>
                        <option value="remark_added">备注添加</option>
                        <option value="next_plan_set">计划更新</option>
                        <option value="auto_unlocked">自动解锁</option>
                        <option value="manual_unlocked">手动解锁</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block flex items-center gap-1">
                        <Flag size={10} />
                        处理阶段
                      </label>
                      <select
                        value={filterPhase}
                        onChange={(e) => setFilterPhase(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
                      >
                        <option value="all">全部阶段</option>
                        <option value="lock">锁定阶段</option>
                        <option value="notification">通知阶段</option>
                        <option value="calibration">校准阶段</option>
                        <option value="retest">复测阶段</option>
                        <option value="expert">专家阶段</option>
                        <option value="unlock">解锁阶段</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block flex items-center gap-1">
                        <Calendar size={10} />
                        时间范围
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="flex-1 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="flex-1 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-white/60">
                      共 <span className="font-mono text-ocean-400">{getFilteredEvents(getWorkOrder(retrospectiveBasin)!).length}</span> 条记录
                    </div>
                    <button
                      onClick={() => {
                        setFilterHandler('all');
                        setFilterEventType('all');
                        setFilterPhase('all');
                        setDateRange({ start: '', end: '' });
                      }}
                      className="text-sm text-white/60 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw size={14} />
                      重置筛选
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {(['lock', 'notification', 'calibration', 'retest', 'expert', 'unlock'] as WorkOrderEvent['phase'][]).map((phase) => {
                      const events = getPhaseEvents(getWorkOrder(retrospectiveBasin)!, phase);
                      const remarks = getPhaseRemarks(getWorkOrder(retrospectiveBasin)!, phase);
                      const hasEvents = events.length > 0;
                      
                      return (
                        <div
                          key={phase}
                          onClick={() => hasEvents && setSelectedPhase(phase)}
                          className={`p-4 rounded-xl border transition-all ${
                            hasEvents 
                              ? `${getPhaseBgColor(phase)} cursor-pointer hover:shadow-lg hover:scale-[1.02]`
                              : 'bg-white/2 border-white/5 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className={`font-medium ${getPhaseColor(phase)} flex items-center gap-2`}>
                              <Layers size={16} />
                              {getPhaseName(phase)}
                            </div>
                            {hasEvents && (
                              <span className="text-xs text-white/60">
                                {events.length} 条事件
                              </span>
                            )}
                          </div>
                          {hasEvents ? (
                            <>
                              <div className="text-xs text-white/60 mb-2">
                                最早：{formatDate(events[0].timestamp)}
                              </div>
                              <div className="text-xs text-white/60 mb-2">
                                最晚：{formatDate(events[events.length - 1].timestamp)}
                              </div>
                              {remarks.length > 0 && (
                                <div className="text-xs text-white/60">
                                  <MessageSquare size={10} className="inline mr-1" />
                                  {remarks.length} 条备注
                                </div>
                              )}
                              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                                <span className="text-white/40">点击查看详情</span>
                                <ArrowRight size={14} className="text-white/30" />
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-white/40">
                              暂无事件记录
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
                      <Clock size={14} className="text-ocean-400" />
                      事件时间线
                      <span className="ml-auto text-xs font-normal text-white/50">
                        按时间倒序排列
                      </span>
                    </h3>
                    
                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-coral-500/30 via-ocean-500/30 to-seaweed-500/30" />
                      {getFilteredEvents(getWorkOrder(retrospectiveBasin)!).length === 0 ? (
                        <div className="p-8 text-center text-white/50">
                          <Search size={32} className="mx-auto mb-2 opacity-50" />
                          <p>没有符合筛选条件的事件</p>
                        </div>
                      ) : (
                        [...getFilteredEvents(getWorkOrder(retrospectiveBasin)!)].reverse().map((event) => (
                          <div key={event.id} className="relative">
                            <div className={`absolute -left-6 w-4 h-4 rounded-full bg-bg-dark border-2 flex items-center justify-center ${getPhaseColor(event.phase)}`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            </div>
                            <div className={`p-3 rounded-lg border ${getPhaseBgColor(event.phase)} hover:bg-white/10 transition-colors`}>
                              <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 mt-0.5">{getEventIcon(event.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-white">{event.title}</span>
                                    {event.phase && (
                                      <span className={`px-2 py-0.5 rounded text-xs ${getPhaseBgColor(event.phase)} ${getPhaseColor(event.phase)}`}>
                                        {getPhaseName(event.phase)}
                                      </span>
                                    )}
                                    {event.handledByName && (
                                      <span className="text-xs text-white/50 flex items-center gap-1">
                                        <User size={10} />
                                        {event.handledByName}
                                      </span>
                                    )}
                                  </div>
                                  {event.description && (
                                    <div className="text-sm text-white/60 mt-1">{event.description}</div>
                                  )}
                                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                                    <div className="mt-2 p-2 rounded bg-black/30 text-xs text-white/50 space-y-1">
                                      {Object.entries(event.metadata).map(([key, value]) => (
                                        <div key={key} className="flex gap-2">
                                          <span className="text-white/40">{key}:</span>
                                          <span className="text-white/70 font-mono">
                                            {Array.isArray(value) ? value.join(', ') : String(value)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="text-xs text-white/40 mt-2 flex items-center gap-1">
                                    <Clock size={10} />
                                    {formatDate(event.timestamp)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  <div className={`p-4 rounded-xl border ${getPhaseBgColor(selectedPhase)}`}>
                    <h3 className={`font-medium mb-2 flex items-center gap-2 ${getPhaseColor(selectedPhase)}`}>
                      <Layers size={16} />
                      {getPhaseName(selectedPhase)} — 事件记录
                    </h3>
                    <div className="space-y-3">
                      {getPhaseEvents(getWorkOrder(retrospectiveBasin)!, selectedPhase).map((event) => (
                        <div key={event.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            {getEventIcon(event.type)}
                            <span className="text-sm font-medium text-white">{event.title}</span>
                            <span className="text-xs text-white/50 ml-auto">{formatDate(event.timestamp)}</span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-white/60">{event.description}</p>
                          )}
                          {event.metadata && (
                            <div className="mt-2 pt-2 border-t border-white/10 text-xs">
                              {Object.entries(event.metadata).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="text-white/40">{key}:</span>
                                  <span className="text-white/70 font-mono">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {event.handledByName && (
                            <div className="text-xs text-white/50 mt-2">
                              处理人：{event.handledByName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {getPhaseRemarks(getWorkOrder(retrospectiveBasin)!, selectedPhase).length > 0 && (
                    <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30">
                      <h3 className="font-medium mb-3 text-blue-300 flex items-center gap-2">
                        <MessageSquare size={16} />
                        {getPhaseName(selectedPhase)} — 处理备注
                      </h3>
                      <div className="space-y-3">
                        {getPhaseRemarks(getWorkOrder(retrospectiveBasin)!, selectedPhase).map((remark) => (
                          <div key={remark.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                              <User size={14} className="text-blue-400" />
                              <span className="text-sm font-medium text-white">{remark.createdByName}</span>
                              <span className="text-xs text-white/50 ml-auto">{formatDate(remark.createdAt)}</span>
                            </div>
                            <p className="text-sm text-white/70 whitespace-pre-wrap">{remark.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPhase === 'retest' && getRecoveryAssessment(retrospectiveBasin) && (
                    <div className="p-4 rounded-xl border bg-seaweed-500/10 border-seaweed-500/30">
                      <h3 className="font-medium mb-3 text-seaweed-300 flex items-center gap-2">
                        <BarChart3 size={16} />
                        复测数据对比
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-xs text-white/40 mb-1">锁定前连续偏差</div>
                          <div className="flex gap-1 flex-wrap">
                            {getWorkOrder(retrospectiveBasin)!.preLockDeviations.map((d, i) => (
                              <span key={i} className={`text-sm font-mono font-bold ${getDeviationColor(d)}`}>
                                {d > 0 ? '+' : ''}{d.toFixed(1)}%
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-xs text-white/40 mb-1">复测次数</div>
                          <div className="text-2xl font-mono font-bold text-white">
                            {getRecoveryAssessment(retrospectiveBasin)!.retestHistory.length}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-xs text-white/40 mb-1">连续通过</div>
                          <div className="text-2xl font-mono font-bold text-seaweed-400">
                            {getRecoveryAssessment(retrospectiveBasin)!.consecutivePasses}/{getRecoveryAssessment(retrospectiveBasin)!.requiredPasses}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-xs text-white/40 mb-1">当前状态</div>
                          <div className={`text-lg font-bold ${
                            getRecoveryAssessment(retrospectiveBasin)!.status === 'completed' ? 'text-seaweed-400' :
                            getRecoveryAssessment(retrospectiveBasin)!.status === 'in_progress' ? 'text-yellow-400' : 'text-white/60'
                          }`}>
                            {getRecoveryAssessment(retrospectiveBasin)!.status === 'completed' ? '已完成' :
                             getRecoveryAssessment(retrospectiveBasin)!.status === 'in_progress' ? '进行中' : '待开始'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl border bg-yellow-500/10 border-yellow-500/30">
                    <h3 className="font-medium mb-3 text-yellow-300 flex items-center gap-2">
                      <Target size={16} />
                      下一步计划
                    </h3>
                    <p className="text-sm text-yellow-200/80 whitespace-pre-wrap">
                      {getWorkOrder(retrospectiveBasin)!.nextPlan || '暂无下一步计划'}
                    </p>
                    {getWorkOrder(retrospectiveBasin)!.nextPlanUpdatedAt && (
                      <p className="text-xs text-yellow-200/50 mt-2">
                        最后更新：{formatDate(getWorkOrder(retrospectiveBasin)!.nextPlanUpdatedAt)} 
                        {getWorkOrder(retrospectiveBasin)!.nextPlanUpdatedByName && ` · ${getWorkOrder(retrospectiveBasin)!.nextPlanUpdatedByName}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showReassignModal && selectedBasin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-purple-400" />
                <span>改派 {selectedBasin} 处理人</span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">当前处理人</label>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-ocean-500/20 flex items-center justify-center">
                    <User size={14} className="text-ocean-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {getWorkOrder(selectedBasin)?.currentHandlerName || '未指派'}
                    </div>
                    <div className="text-xs text-white/50">当前步骤处理人</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">改派给</label>
                <select
                  value={reassignToHandler}
                  onChange={(e) => setReassignToHandler(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-ocean-500/50"
                >
                  <option value="">请选择处理人</option>
                  {mockUsers.filter(u => u.role === UserRole.CARBON_EXPERT || u.role === UserRole.CHEMIST || u.role === UserRole.CHIEF_SCIENTIST).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({roleLabels[u.role]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">改派原因</label>
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="请说明改派原因..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:border-ocean-500/50 resize-none h-24"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReassignModal(false);
                    setSelectedBasin(null);
                    setReassignToHandler('');
                    setReassignReason('');
                  }}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleReassign}
                  disabled={!reassignToHandler || !reassignReason.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认改派
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {viewTab === 'retrospective' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-ocean-500/20 flex items-center justify-center">
                <History size={24} className="text-ocean-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">锁定事件复盘</h2>
                <p className="text-white/50 text-sm">按海盆查看从锁定到解锁的完整处置流程，支持多维度筛选和阶段详情查看</p>
              </div>
            </div>

            {workOrders.length === 0 ? (
              <div className="p-8 text-center text-white/50">
                <History size={48} className="mx-auto mb-3 opacity-50" />
                <p>暂无处置工单记录</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workOrders.map((wo) => (
                  <div
                    key={wo.id}
                    onClick={() => openRetrospective(wo.basin)}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-ocean-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          wo.status === 'resolved' ? 'bg-seaweed-500/20' : 'bg-yellow-500/20'
                        }`}>
                          {wo.status === 'resolved' ? <CheckCircle size={16} className="text-seaweed-400" /> : <Clock size={16} className="text-yellow-400" />}
                        </div>
                        <span className="font-medium text-white">{wo.basin}</span>
                      </div>
                      {wo.overdue && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs flex items-center gap-1 animate-pulse">
                          <Flag size={10} />
                          已逾期
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">当前步骤</span>
                        <span className="text-white/80">{wo.steps[wo.currentStep]?.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">当前处理人</span>
                        <span className="text-white/80">{wo.currentHandlerName || '未指派'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">事件数</span>
                        <span className="text-ocean-400 font-mono">{wo.events.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">创建时间</span>
                        <span className="text-white/60">{formatDate(wo.createdAt)}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                      <span className="text-white/40">点击查看完整复盘</span>
                      <ArrowRight size={16} className="text-white/30 group-hover:text-ocean-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
