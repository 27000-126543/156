import React, { useState, useRef } from 'react';
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
  Loader2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { BasinStatus, UserRole, RecoveryAssessment, RetestSimulation } from '../../shared/types';

export const BasinGovernance: React.FC = () => {
  const { basinStatuses, user, unlockBasin, recoveryAssessments, addRetestSimulation, setNotification } = useStore();
  const [selectedBasin, setSelectedBasin] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [expandedBasin, setExpandedBasin] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      </div>

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
                              <div className="flex items-center gap-2">
                                {getStatusBadge(retest.status)}
                                {getResultBadge(retest.result)}
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
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="p-3 rounded-lg bg-white/5">
                                <div className="text-xs text-white/40 mb-1">复测NPP偏差</div>
                                <div className={`text-xl font-mono font-bold ${getDeviationColor(retest.nppDeviation)}`}>
                                  {retest.nppDeviation > 0 ? '+' : ''}{retest.nppDeviation.toFixed(1)}%
                                </div>
                              </div>
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
    </div>
  );
};
