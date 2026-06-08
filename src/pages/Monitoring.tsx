
import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  Search,
  X,
  Sliders,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useStore } from '../store/useStore';
import { alertLevelColors, alertLevelLabels, statusLabels } from '../utils/mockData';
import { Alert, AlertLevel, BiologicalParams, Simulation } from '../../shared/types';

export const Monitoring: React.FC = () => {
  const { simulations, alerts, monitoringMetrics, reviewAlert, setNotification } = useStore();
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterReview, setFilterReview] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [adjustments, setAdjustments] = useState<Partial<BiologicalParams>>({});
  const [metricsData, setMetricsData] = useState(monitoringMetrics);

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = [...monitoringMetrics];
      const lastPoint = newData[newData.length - 1];
      if (lastPoint) {
        const t = Math.random();
        newData.push({
          ...lastPoint,
          timestamp: new Date().toISOString(),
          surfaceChlorophyll: 0.3 + Math.sin(t * Math.PI) * 0.1 + Math.random() * 0.05,
          euphoticZoneDepth: 80 + Math.cos(t * Math.PI * 0.5) * 15 + Math.random() * 5,
          hypoxicArea: 15000 + t * 100 + Math.sin(t * Math.PI * 0.3) * 500,
          hypoxicExpansionRate: 3 + Math.sin(t * Math.PI * 0.8) * 2 + Math.random() * 1,
          primaryProductivity: 500 + Math.sin(t * Math.PI * 0.4) * 100 + Math.random() * 30,
          npp: 1.2 + Math.sin(t * Math.PI * 0.3) * 0.3 + Math.random() * 0.1
        });
        if (newData.length > 120) newData.shift();
        setMetricsData(newData);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [monitoringMetrics]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.simulationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || alert.level === filterLevel;
    const matchesReview = filterReview === 'all' || 
                          (filterReview === 'pending' && !alert.reviewedAt) ||
                          (filterReview === 'reviewed' && alert.reviewedAt);
    const matchesSim = !selectedSimulation || alert.simulationId === selectedSimulation.id;
    return matchesSearch && matchesLevel && matchesReview && matchesSim;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleReviewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setReviewComment('');
    setAdjustments({});
    setShowReviewModal(true);
  };

  const submitReview = (approved: boolean) => {
    if (!selectedAlert) return;
    reviewAlert(selectedAlert.id, reviewComment, approved, approved ? adjustments : undefined);
    setShowReviewModal(false);
    setSelectedAlert(null);
  };

  const getMetricChartOption = (dataKey: keyof typeof metricsData[0], title: string, unit: string, color: string) => {
    return {
      backgroundColor: 'transparent',
      title: {
        text: title,
        textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          const p = params[0];
          return `${new Date(p.name).toLocaleTimeString('zh-CN')}<br/>${title}: ${Number(p.value).toFixed(2)} ${unit}`;
        }
      },
      xAxis: {
        type: 'category',
        data: metricsData.map(m => m.timestamp),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      series: [{
        data: metricsData.map(m => m[dataKey]),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: color + '60' },
              { offset: 1, color: color + '00' }
            ]
          }
        }
      }]
    };
  };

  const activeSimulations = simulations.filter(s => 
    s.status !== 'completed' && s.status !== 'error'
  );

  const pendingAlerts = alerts.filter(a => !a.reviewedAt);
  const criticalAlerts = pendingAlerts.filter(a => a.level === AlertLevel.CRITICAL);

  const paramLabels: Record<keyof BiologicalParams, { name: string; unit: string; min: number; max: number; step: number }> = {
    growthRate: { name: '生长率', unit: 'd⁻¹', min: 0.1, max: 2.0, step: 0.05 },
    mortalityRate: { name: '死亡率', unit: 'd⁻¹', min: 0.01, max: 0.5, step: 0.01 },
    sinkingRate: { name: '沉降速率', unit: 'm d⁻¹', min: 0.5, max: 5.0, step: 0.1 },
    pocSinkingVelocity: { name: 'POC沉降速度', unit: 'm d⁻¹', min: 50, max: 300, step: 10 },
    remineralizationDepth: { name: '再矿化深度', unit: 'm', min: 500, max: 2000, step: 50 }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">实时监控与预警系统</h1>
          <p className="text-white/60 text-sm mt-1">监控关键生物地球化学指标，管理和复核系统预警</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-coral-400 text-sm">
            <Activity size={16} className="animate-pulse" />
            实时更新中
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ocean-500/20 flex items-center justify-center">
            <Activity size={24} className="text-ocean-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{activeSimulations.length}</p>
            <p className="text-xs text-white/50">活跃模拟</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{pendingAlerts.length}</p>
            <p className="text-xs text-white/50">待复核预警</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-coral-500/20 flex items-center justify-center">
            <XCircle size={24} className="text-coral-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{criticalAlerts.length}</p>
            <p className="text-xs text-white/50">严重预警</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-seaweed-500/20 flex items-center justify-center">
            <CheckCircle size={24} className="text-seaweed-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{alerts.length - pendingAlerts.length}</p>
            <p className="text-xs text-white/50">已处理预警</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-ocean-400" />
            <span>实时指标监控</span>
          </div>
          <select
            value={selectedSimulation?.id || ''}
            onChange={(e) => setSelectedSimulation(simulations.find(s => s.id === e.target.value) || null)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
          >
            <option value="" className="bg-ocean-900">全部模拟</option>
            {simulations.map(sim => (
              <option key={sim.id} value={sim.id} className="bg-ocean-900">{sim.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReactECharts
            option={getMetricChartOption('surfaceChlorophyll', '表层叶绿素浓度', 'mg/m³', '#1B998B')}
            style={{ height: '200px' }}
            theme="dark"
          />
          <ReactECharts
            option={getMetricChartOption('euphoticZoneDepth', '真光层深度', 'm', '#3E92CC')}
            style={{ height: '200px' }}
            theme="dark"
          />
          <ReactECharts
            option={getMetricChartOption('hypoxicArea', '缺氧区面积', 'km²', '#F46036')}
            style={{ height: '200px' }}
            theme="dark"
          />
          <ReactECharts
            option={getMetricChartOption('primaryProductivity', '初级生产力', 'mg C m⁻³ d⁻¹', '#F7CB15')}
            style={{ height: '200px' }}
            theme="dark"
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-coral-400" />
            <span>预警管理</span>
          </div>
        </div>
        
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="搜索预警..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:border-ocean-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-white/60" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
              >
                <option value="all" className="bg-ocean-900">全部级别</option>
                {Object.entries(alertLevelLabels).map(([value, label]) => (
                  <option key={value} value={value} className="bg-ocean-900">{label}</option>
                ))}
              </select>
              <select
                value={filterReview}
                onChange={(e) => setFilterReview(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
              >
                <option value="all" className="bg-ocean-900">全部状态</option>
                <option value="pending" className="bg-ocean-900">待复核</option>
                <option value="reviewed" className="bg-ocean-900">已复核</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-white/50">
              <Info size={48} className="mx-auto mb-3 opacity-30" />
              <p>没有找到匹配的预警信息</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`status-badge ${alertLevelColors[alert.level]}`}>
                        {alertLevelLabels[alert.level]}
                      </span>
                      <span className="text-xs text-white/40">{alert.metric}</span>
                      {alert.reviewedAt && (
                        <span className="status-badge status-success">已复核</span>
                      )}
                    </div>
                    <p className="text-white font-medium">{alert.message}</p>
                    <p className="text-sm text-white/50 mt-1">{alert.simulationName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(alert.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-coral-400" />
                        当前值: <span className="text-coral-400 font-mono">{alert.currentValue.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingDown size={12} className="text-ocean-400" />
                        阈值: <span className="text-ocean-400 font-mono">{alert.threshold.toFixed(2)}</span>
                      </div>
                    </div>
                    {alert.reviewedAt && (
                      <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1 text-xs text-white/50 mb-1">
                          <User size={12} />
                          {alert.reviewedByName} · {formatDate(alert.reviewedAt)}
                        </div>
                        <p className="text-sm text-white/70">{alert.reviewComment}</p>
                        {alert.paramAdjustments && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(alert.paramAdjustments).map(([key, value]) => (
                              <span key={key} className="px-2 py-0.5 bg-seaweed-500/20 text-seaweed-300 rounded text-xs font-mono">
                                {paramLabels[key as keyof BiologicalParams]?.name}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!alert.reviewedAt && (
                    <button
                      onClick={() => handleReviewAlert(alert)}
                      className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
                    >
                      复核处理
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showReviewModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl">
            <div className="sticky top-0 p-6 border-b border-white/10 bg-ocean-950/90 backdrop-blur-md flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-white">预警复核处理</h2>
                <p className="text-sm text-white/60">{selectedAlert.simulationName}</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl bg-coral-500/10 border border-coral-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`status-badge ${alertLevelColors[selectedAlert.level]}`}>
                    {alertLevelLabels[selectedAlert.level]}
                  </span>
                  <span className="text-coral-300 font-medium">{selectedAlert.metric}异常</span>
                </div>
                <p className="text-white/80">{selectedAlert.message}</p>
                <div className="mt-3 flex gap-4 text-sm">
                  <div>
                    <span className="text-white/50">当前值: </span>
                    <span className="text-coral-400 font-mono font-semibold">{selectedAlert.currentValue.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-white/50">阈值: </span>
                    <span className="text-ocean-400 font-mono">{selectedAlert.threshold.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header flex items-center gap-2">
                  <Sliders size={16} className="text-ocean-400" />
                  <span>参数调整（复核通过后自动重模拟）</span>
                </div>
                <div className="space-y-4">
                  {Object.entries(paramLabels).map(([key, info]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-white/70">
                          {info.name} <span className="text-white/40">({info.unit})</span>
                        </label>
                        <span className="text-ocean-400 font-mono text-sm">
                          {(adjustments[key as keyof BiologicalParams] as number)?.toFixed(key === 'mortalityRate' ? 3 : key === 'growthRate' || key === 'sinkingRate' ? 2 : 0) || '-'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={info.min}
                        max={info.max}
                        step={info.step}
                        value={adjustments[key as keyof BiologicalParams] as number || info.min}
                        onChange={(e) => setAdjustments(prev => ({
                          ...prev,
                          [key]: parseFloat(e.target.value)
                        }))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-ocean-500"
                      />
                      <div className="flex justify-between text-xs text-white/40 mt-1">
                        <span>{info.min}</span>
                        <span>{info.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">复核意见</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="请输入复核意见，说明调整原因..."
                  rows={3}
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
                  className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                >
                  忽略预警
                </button>
                <button
                  onClick={() => submitReview(true)}
                  disabled={!reviewComment.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={16} />
                  确认并调整参数
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
