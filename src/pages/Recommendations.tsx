
import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Brain,
  ThumbsUp,
  Filter,
  Search,
  ArrowRight,
  Award,
  Target,
  Info
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useStore } from '../store/useStore';
import { Recommendation, BiologicalParams } from '../../shared/types';

export const Recommendations: React.FC = () => {
  const { recommendations, adoptRecommendation, simulations } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdopted, setFilterAdopted] = useState<string>('all');
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  const filteredRecs = recommendations.filter(rec => {
    const matchesSearch = rec.simulationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.rationale.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdopted = filterAdopted === 'all' ||
                           (filterAdopted === 'adopted' && rec.adopted) ||
                           (filterAdopted === 'pending' && !rec.adopted);
    return matchesSearch && matchesAdopted;
  });

  const paramLabels: Record<keyof BiologicalParams, { name: string; unit: string }> = {
    growthRate: { name: '生长率', unit: 'd⁻¹' },
    mortalityRate: { name: '死亡率', unit: 'd⁻¹' },
    sinkingRate: { name: '沉降速率', unit: 'm d⁻¹' },
    pocSinkingVelocity: { name: 'POC沉降速度', unit: 'm d⁻¹' },
    remineralizationDepth: { name: '再矿化深度', unit: 'm' }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-seaweed-400';
    if (confidence >= 0.75) return 'text-ocean-400';
    return 'text-yellow-400';
  };

  const getPerformanceChart = () => {
    const adoptedRecs = recommendations.filter(r => r.adopted);
    const pendingRecs = recommendations.filter(r => !r.adopted);
    
    return {
      backgroundColor: 'transparent',
      title: {
        text: '推荐方案性能分布',
        textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['NPP提升率', 'RMSE降低率'],
        textStyle: { color: 'rgba(255,255,255,0.6)' },
        top: 30
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: {
        type: 'category',
        data: recommendations.map((r, i) => `方案${i + 1}`),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: '%',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      series: [
        {
          name: 'NPP提升率',
          type: 'bar',
          data: recommendations.map(r => r.historicalPerformance.nppImprovement),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#1B998B' },
              { offset: 1, color: '#1B998B60' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'RMSE降低率',
          type: 'bar',
          data: recommendations.map(r => r.historicalPerformance.rmseReduction),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3E92CC' },
              { offset: 1, color: '#3E92CC60' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
  };

  const getConfidenceDistribution = () => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' }
      },
      series: [{
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: '100%',
        detail: {
          formatter: '{value}%',
          valueAnimation: true,
          offsetCenter: [0, '20%'],
          fontSize: 24,
          color: '#fff'
        },
        data: [{
          value: Math.round(recommendations.length > 0 ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length * 100 : 0),
          name: '平均置信度'
        }],
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.3, '#F46036'],
              [0.7, '#F7CB15'],
              [1, '#1B998B']
            ]
          }
        },
        pointer: {
          itemStyle: { color: 'auto' }
        },
        axisTick: {
          distance: -20,
          length: 10,
          lineStyle: { color: '#fff', width: 2 }
        },
        splitLine: {
          distance: -25,
          length: 15,
          lineStyle: { color: '#fff', width: 3 }
        },
        axisLabel: {
          color: 'rgba(255,255,255,0.5)',
          distance: -30,
          fontSize: 12
        }
      }]
    };
  };

  const pendingRecs = recommendations.filter(r => !r.adopted);
  const adoptedRecs = recommendations.filter(r => r.adopted);
  const highConfidenceRecs = recommendations.filter(r => r.confidence >= 0.85);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          <Sparkles className="text-ocean-400" size={28} />
          智能推荐引擎
        </h1>
          <p className="text-white/60 text-sm mt-1">基于历史模拟数据的AI参数化方案智能推荐</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ocean-500/20 flex items-center justify-center">
            <Brain size={24} className="text-ocean-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{recommendations.length}</p>
            <p className="text-xs text-white/50">总推荐数</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-seaweed-500/20 flex items-center justify-center">
            <CheckCircle size={24} className="text-seaweed-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{pendingRecs.length}</p>
            <p className="text-xs text-white/50">待采纳</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Award size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{adoptedRecs.length}</p>
            <p className="text-xs text-white/50">已采纳</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-coral-500/20 flex items-center justify-center">
            <Target size={24} className="text-coral-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{highConfidenceRecs.length}</p>
            <p className="text-xs text-white/50">高置信度</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-ocean-400" />
              <span>推荐方案性能对比</span>
            </div>
          </div>
          <ReactECharts option={getPerformanceChart()} style={{ height: '300px' }} theme="dark" />
        </div>
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-seaweed-400" />
              <span>模型置信度</span>
            </div>
          </div>
          <ReactECharts option={getConfidenceDistribution()} style={{ height: '300px' }} theme="dark" />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-coral-400" />
            <span>参数推荐列表</span>
          </div>
        </div>
        
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="搜索推荐..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:border-ocean-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-white/60" />
              <select
                value={filterAdopted}
                onChange={(e) => setFilterAdopted(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
              >
                <option value="all" className="bg-ocean-900">全部状态</option>
                <option value="pending" className="bg-ocean-900">待采纳</option>
                <option value="adopted" className="bg-ocean-900">已采纳</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredRecs.length === 0 ? (
            <div className="p-12 text-center text-white/50">
              <Info size={48} className="mx-auto mb-3 opacity-30" />
              <p>没有找到匹配的推荐方案</p>
            </div>
          ) : (
            filteredRecs.map((rec) => (
              <div key={rec.id} className="p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{rec.simulationName}</h3>
                      {rec.adopted ? (
                        <span className="status-badge status-success">已采纳</span>
                      ) : (
                        <span className="status-badge status-pending">待采纳</span>
                      )}
                      <span className={`text-sm font-mono font-semibold ${getConfidenceColor(rec.confidence)}`}>
                        置信度 {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(rec.params).map(([key, value]) => (
                        <span key={key} className="px-3 py-1 bg-ocean-500/20 text-ocean-300 rounded-full text-sm font-mono">
                          {paramLabels[key as keyof BiologicalParams]?.name}: {value} {paramLabels[key as keyof BiologicalParams]?.unit}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-sm text-white/60 mb-3">{rec.rationale}</p>
                    
                    <div className="flex items-center gap-6 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-seaweed-400">
                          <TrendingUp size={14} />
                          <span>NPP提升: {rec.historicalPerformance.nppImprovement.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-ocean-400">
                          <BarChart3 size={14} />
                          <span>RMSE降低: {rec.historicalPerformance.rmseReduction.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-white/40">
                        <Clock size={12} />
                        <span>{formatDate(rec.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!rec.adopted && (
                    <button
                      onClick={() => adoptRecommendation(rec.id)}
                      className="btn-primary flex items-center gap-2 px-5 py-2.5"
                    >
                      <ThumbsUp size={16} />
                      采纳
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
