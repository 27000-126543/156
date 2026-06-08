
import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  Search,
  X,
  FileCheck,
  Users,
  Shield,
  Send,
  AlertTriangle,
  ChevronRight,
  Layers,
  Info
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Approval, ApprovalStatus } from '../../shared/types';

export const Approvals: React.FC = () => {
  const { approvals, processApproval, simulations, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.simulationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || approval.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || approval.level === parseInt(filterLevel);
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReview = (approval: Approval) => {
    setSelectedApproval(approval);
    setReviewComments('');
    setShowReviewModal(true);
  };

  const submitReview = (approved: boolean) => {
    if (!selectedApproval) return;
    processApproval(selectedApproval.id, approved, reviewComments);
    setShowReviewModal(false);
    setSelectedApproval(null);
  };

  const getStatusBadgeClass = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return 'status-success';
      case ApprovalStatus.REJECTED:
        return 'status-error';
      default:
        return 'status-pending';
    }
  };

  const getLevelInfo = (level: number) => {
    return level === 1
      ? { name: '一级审批', desc: '生物过程合理性验证', role: '海洋生物地球化学家', color: 'text-ocean-400', bg: 'bg-ocean-500/20' }
      : { name: '二级审批', desc: '碳收支数据确认', role: '碳收支专家', color: 'text-seaweed-400', bg: 'bg-seaweed-500/20' };
  };

  const pendingApprovals = approvals.filter(a => a.status === ApprovalStatus.PENDING);
  const approvedApprovals = approvals.filter(a => a.status === ApprovalStatus.APPROVED);
  const level1Pending = pendingApprovals.filter(a => a.level === 1);
  const level2Pending = pendingApprovals.filter(a => a.level === 2);
  const pushedToIPCC = approvals.filter(a => a.status === ApprovalStatus.APPROVED && a.level === 2);

  const getRelatedSimulation = (simulationId: string) => {
    return simulations.find(s => s.id === simulationId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="text-seaweed-400" size={28} />
            两级审批流程
          </h1>
          <p className="text-white/60 text-sm mt-1">验证生物过程合理性，确认碳收支数据，推送至IPCC和工程组</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Clock size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{pendingApprovals.length}</p>
            <p className="text-xs text-white/50">待审批</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ocean-500/20 flex items-center justify-center">
            <Layers size={24} className="text-ocean-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{level1Pending.length}</p>
            <p className="text-xs text-white/50">一级待审</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-seaweed-500/20 flex items-center justify-center">
            <Shield size={24} className="text-seaweed-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{level2Pending.length}</p>
            <p className="text-xs text-white/50">二级待审</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{approvedApprovals.length}</p>
            <p className="text-xs text-white/50">已通过</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-coral-500/20 flex items-center justify-center">
            <Send size={24} className="text-coral-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{pushedToIPCC.length}</p>
            <p className="text-xs text-white/50">已推送</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-ocean-400" />
            <span>审批流程说明</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 max-w-md p-4 rounded-xl bg-ocean-500/10 border border-ocean-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-ocean-500/30 flex items-center justify-center">
                  <span className="text-ocean-300 font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">一级审批</p>
                  <p className="text-xs text-ocean-400">海洋生物地球化学家</p>
                </div>
              </div>
              <p className="text-sm text-white/60">验证生物过程合理性，检查浮游植物功能群参数、生长率、死亡率等生物地球化学过程是否符合科学认知</p>
            </div>
            <ChevronRight className="text-white/30" size={24} />
            <div className="flex-1 max-w-md p-4 rounded-xl bg-seaweed-500/10 border border-seaweed-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-seaweed-500/30 flex items-center justify-center">
                  <span className="text-seaweed-300 font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">二级审批</p>
                  <p className="text-xs text-seaweed-400">碳收支专家</p>
                </div>
              </div>
              <p className="text-sm text-white/60">确认碳收支数据准确性，审核碳通量计算结果、碳汇评估精度，通过后自动推送至IPCC评估小组和海洋负排放工程组</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-coral-400" />
            <span>审批任务列表</span>
          </div>
        </div>

        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="搜索审批任务..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:border-ocean-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-white/60" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
              >
                <option value="all" className="bg-ocean-900">全部状态</option>
                <option value="pending" className="bg-ocean-900">待审批</option>
                <option value="approved" className="bg-ocean-900">已通过</option>
                <option value="rejected" className="bg-ocean-900">已驳回</option>
              </select>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
              >
                <option value="all" className="bg-ocean-900">全部级别</option>
                <option value="1" className="bg-ocean-900">一级审批</option>
                <option value="2" className="bg-ocean-900">二级审批</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredApprovals.length === 0 ? (
            <div className="p-12 text-center text-white/50">
              <Info size={48} className="mx-auto mb-3 opacity-30" />
              <p>没有找到匹配的审批任务</p>
            </div>
          ) : (
            filteredApprovals.map((approval) => {
              const levelInfo = getLevelInfo(approval.level);
              const sim = getRelatedSimulation(approval.simulationId);
              return (
                <div key={approval.id} className="p-5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${levelInfo.bg} ${levelInfo.color}`}>
                          {levelInfo.name}
                        </span>
                        <h3 className="text-white font-medium">{approval.simulationName}</h3>
                        <span className={`status-badge ${getStatusBadgeClass(approval.status)}`}>
                          {approval.status === ApprovalStatus.PENDING ? '待审批' :
                           approval.status === ApprovalStatus.APPROVED ? '已通过' : '已驳回'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-white/50 mb-3">
                        {levelInfo.desc} · 审批角色: {levelInfo.role}
                      </p>
                      
                      {sim && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-ocean-500/20 text-ocean-300 rounded text-xs">{sim.oceanBasin}</span>
                          <span className="px-2 py-0.5 bg-seaweed-500/20 text-seaweed-300 rounded text-xs">{sim.season}</span>
                          <span className="px-2 py-0.5 bg-coral-500/20 text-coral-300 rounded text-xs">{sim.emissionScenario}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-6 text-xs">
                        <div className="flex items-center gap-1 text-white/40">
                          <Clock size={12} />
                          <span>创建: {formatDate(approval.createdAt)}</span>
                        </div>
                        {approval.reviewedAt && (
                          <>
                            <div className="flex items-center gap-1 text-white/40">
                              <User size={12} />
                              <span>{approval.reviewerName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-white/40">
                              <CheckCircle size={12} />
                              <span>审批: {formatDate(approval.reviewedAt)}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {approval.comments && (
                        <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs text-white/50 mb-1">
                            {approval.status === ApprovalStatus.APPROVED ? '审批意见' : '驳回原因'}:
                          </p>
                          <p className="text-sm text-white/70">{approval.comments}</p>
                        </div>
                      )}
                    </div>
                    
                    {approval.status === ApprovalStatus.PENDING && (
                      <button
                        onClick={() => handleReview(approval)}
                        className="btn-primary flex items-center gap-2 px-5 py-2.5"
                      >
                        <FileCheck size={16} />
                        审批
                      </button>
                    )}
                    
                    {approval.status === ApprovalStatus.APPROVED && approval.level === 2 && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-seaweed-500/10 border border-seaweed-500/30">
                        <Send size={14} className="text-seaweed-400" />
                        <span className="text-seaweed-300 text-sm">已推送至IPCC和工程组</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showReviewModal && selectedApproval && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl">
            <div className="sticky top-0 p-6 border-b border-white/10 bg-ocean-950/90 backdrop-blur-md flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  {getLevelInfo(selectedApproval.level).name}
                </h2>
                <p className="text-sm text-white/60">{selectedApproval.simulationName}</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl bg-ocean-500/10 border border-ocean-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={16} className="text-ocean-400" />
                  <span className="text-ocean-300 font-medium">
                    {getLevelInfo(selectedApproval.level).name} - {getLevelInfo(selectedApproval.level).role}
                  </span>
                </div>
                <p className="text-white/70 text-sm">{getLevelInfo(selectedApproval.level).desc}</p>
              </div>

              {(() => {
                const sim = getRelatedSimulation(selectedApproval.simulationId);
                if (!sim) return null;
                return (
                  <div className="card">
                    <h3 className="card-header">模拟任务信息</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-white/50 mb-1">海盆</p>
                        <p className="text-white font-medium">{sim.oceanBasin}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">季节</p>
                        <p className="text-white font-medium">{sim.season}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">排放情景</p>
                        <p className="text-white font-medium">{sim.emissionScenario}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">NPP偏差</p>
                        <p className={`font-mono font-medium ${Math.abs(sim.nppDeviation) > 20 ? 'text-coral-400' : 'text-seaweed-400'}`}>
                          {sim.nppDeviation > 0 ? '+' : ''}{sim.nppDeviation.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {selectedApproval.level === 1 && (
                <div className="card">
                  <h3 className="card-header flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-400" />
                    <span>生物过程验证要点</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-ocean-400 mt-0.5 flex-shrink-0" />
                      <span>浮游植物功能群参数化方案是否符合该海域生态特征</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-ocean-400 mt-0.5 flex-shrink-0" />
                      <span>生长率、死亡率、沉降速率等参数是否在合理范围内</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-ocean-400 mt-0.5 flex-shrink-0" />
                      <span>营养盐限制关系是否符合Redfield比值</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-ocean-400 mt-0.5 flex-shrink-0" />
                      <span>叶绿素浓度、初级生产力时空分布是否与观测数据一致</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-ocean-400 mt-0.5 flex-shrink-0" />
                      <span>缺氧区演化趋势是否符合历史观测规律</span>
                    </li>
                  </ul>
                </div>
              )}

              {selectedApproval.level === 2 && (
                <div className="card">
                  <h3 className="card-header flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-400" />
                    <span>碳收支审核要点</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-seaweed-400 mt-0.5 flex-shrink-0" />
                      <span>碳通量计算方法是否符合IPCC指南规范</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-seaweed-400 mt-0.5 flex-shrink-0" />
                      <span>生物泵、物理泵、碳酸盐泵的分配比例是否合理</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-seaweed-400 mt-0.5 flex-shrink-0" />
                      <span>碳汇评估结果是否与同区域其他研究结果可比</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-seaweed-400 mt-0.5 flex-shrink-0" />
                      <span>不确定性分析是否充分，置信区间是否可接受</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-seaweed-400 mt-0.5 flex-shrink-0" />
                      <span>数据质量是否满足IPCC评估报告要求</span>
                    </li>
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  {selectedApproval.level === 2 ? '审批意见（通过后自动推送至IPCC评估小组和海洋负排放工程组）' : '审批意见'}
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="请详细填写审批意见..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none focus:border-ocean-500/50 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => submitReview(false)}
                  disabled={!reviewComments.trim()}
                  className="px-6 py-2.5 rounded-lg bg-coral-500/20 hover:bg-coral-500/30 text-coral-300 border border-coral-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle size={16} />
                  驳回
                </button>
                <button
                  onClick={() => submitReview(true)}
                  disabled={!reviewComments.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={16} />
                  {selectedApproval.level === 2 ? '通过并推送' : '通过'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
