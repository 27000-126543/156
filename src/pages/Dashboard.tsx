
import React from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  BarChart3,
  Map,
  Thermometer,
  Droplets
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { MetricCard } from '../components/MetricCard';
import { Loading } from '../components/Loading';
import { SimulationStatus } from '../../shared/types';

export const Dashboard: React.FC = () => {
  const { simulations, alerts, performanceStats, basinStatuses, isLoading, carbonSinkData } = useStore();

  const todayStats = performanceStats[performanceStats.length - 1];
  const runningSimulations = simulations.filter(
    s => s.status !== SimulationStatus.COMPLETED && s.status !== SimulationStatus.ERROR
  ).length;
  const completedToday = simulations.filter(
    s => s.status === SimulationStatus.COMPLETED &&
    new Date(s.updatedAt).toDateString() === new Date().toDateString()
  ).length;
  const criticalAlerts = alerts.filter(a => !a.reviewedAt && a.level === 'critical').length;
  const pendingApprovals = 4;

  const radarOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 36, 99, 0.9)',
      borderColor: 'rgba(62, 146, 204, 0.3)',
      textStyle: { color: '#fff' }
    },
    radar: {
      indicator: [
        { name: '物理泵效率', max: 100 },
        { name: '生物泵效率', max: 100 },
        { name: '碳酸盐泵', max: 100 },
        { name: '碳汇评估精度', max: 100 },
        { name: '模拟完成率', max: 100 },
        { name: '预警响应速度', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(62, 146, 204, 0.2)'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(62, 146, 204, 0.02)', 'rgba(62, 146, 204, 0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(62, 146, 204, 0.3)'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [85, 92, 78, 94, 91, 88],
          name: '当前性能',
          areaStyle: {
            color: 'rgba(62, 146, 204, 0.3)'
          },
          lineStyle: {
            color: '#3E92CC',
            width: 2
          },
          itemStyle: {
            color: '#3E92CC'
          }
        },
        {
          value: [75, 80, 70, 85, 80, 75],
          name: '上月均值',
          areaStyle: {
            color: 'rgba(244, 96, 54, 0.2)'
          },
          lineStyle: {
            color: '#F46036',
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: '#F46036'
          }
        }
      ]
    }],
    legend: {
      data: ['当前性能', '上月均值'],
      textStyle: {
        color: 'rgba(255, 255, 255, 0.7)'
      },
      bottom: 0
    }
  };

  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 36, 99, 0.9)',
      borderColor: 'rgba(62, 146, 204, 0.3)',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['模拟完成率', '碳汇评估精度', '预警响应时间(分钟)'],
      textStyle: { color: 'rgba(255, 255, 255, 0.7)' },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: performanceStats.slice(-14).map(s => s.date.slice(5)),
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10 }
    },
    yAxis: [
      {
        type: 'value',
        name: '百分比 (%)',
        min: 70,
        max: 100,
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } }
      },
      {
        type: 'value',
        name: '时间 (分钟)',
        min: 0,
        max: 40,
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '模拟完成率',
        type: 'line',
        smooth: true,
        data: performanceStats.slice(-14).map(s => s.simulationCompletionRate.toFixed(1)),
        lineStyle: { color: '#3E92CC', width: 2 },
        itemStyle: { color: '#3E92CC' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(62, 146, 204, 0.4)' },
              { offset: 1, color: 'rgba(62, 146, 204, 0.05)' }
            ]
          }
        }
      },
      {
        name: '碳汇评估精度',
        type: 'line',
        smooth: true,
        data: performanceStats.slice(-14).map(s => s.carbonSinkAssessmentAccuracy.toFixed(1)),
        lineStyle: { color: '#1B998B', width: 2 },
        itemStyle: { color: '#1B998B' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(27, 153, 139, 0.3)' },
              { offset: 1, color: 'rgba(27, 153, 139, 0.05)' }
            ]
          }
        }
      },
      {
        name: '预警响应时间(分钟)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: performanceStats.slice(-14).map(s => s.averageAlertResponseTime.toFixed(1)),
        lineStyle: { color: '#F46036', width: 2, type: 'dashed' },
        itemStyle: { color: '#F46036' }
      }
    ]
  };

  const basinOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 36, 99, 0.9)',
      borderColor: 'rgba(62, 146, 204, 0.3)',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c} Tg C/yr ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: 'rgba(10, 36, 99, 0.8)',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 11,
        formatter: '{b}\n{d}%'
      },
      labelLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      data: [
        { value: 1850, name: '太平洋', itemStyle: { color: '#3E92CC' } },
        { value: 1220, name: '大西洋', itemStyle: { color: '#1B998B' } },
        { value: 890, name: '印度洋', itemStyle: { color: '#F46036' } },
        { value: 420, name: '南大洋', itemStyle: { color: '#d4ae6a' } },
        { value: 180, name: '北冰洋', itemStyle: { color: '#7cc9fb' } },
        { value: 120, name: '其他', itemStyle: { color: '#37aaf6' } }
      ]
    }]
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading text="加载性能数据..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">全天候性能看板</h1>
          <p className="text-white/60 text-sm mt-1">实时监控系统运行状态与碳汇评估性能</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Clock size={14} />
          <span>数据更新于 {new Date().toLocaleString('zh-CN')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="模拟完成率"
          value={todayStats?.simulationCompletionRate.toFixed(1) || '0'}
          unit="%"
          icon={CheckCircle}
          trend={2.3}
          color="seaweed"
          description="本月累计完成 156 次模拟"
        />
        <MetricCard
          title="平均预警响应时间"
          value={todayStats?.averageAlertResponseTime.toFixed(0) || '0'}
          unit="分钟"
          icon={AlertTriangle}
          trend={-15.4}
          color="coral"
          description="较上月缩短 5.2 分钟"
        />
        <MetricCard
          title="碳汇评估精度"
          value={todayStats?.carbonSinkAssessmentAccuracy.toFixed(1) || '0'}
          unit="%"
          icon={BarChart3}
          trend={1.8}
          color="ocean"
          description="与观测数据吻合度"
        />
        <MetricCard
          title="今日任务处理"
          value={`${completedToday}/${todayStats?.totalSimulations || 0}`}
          icon={Zap}
          color="sand"
          description={`运行中 ${runningSimulations} 个任务`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="card-header flex items-center gap-2">
            <TrendingUp size={20} className="text-ocean-400" />
            近14天性能趋势
          </h2>
          <div className="h-80">
            <ReactECharts option={trendOption} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="card">
          <h2 className="card-header flex items-center gap-2">
            <Activity size={20} className="text-ocean-400" />
            碳泵效率雷达图
          </h2>
          <div className="h-80">
            <ReactECharts option={radarOption} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="card-header flex items-center gap-2">
            <Map size={20} className="text-ocean-400" />
            各海盆碳汇分布
          </h2>
          <div className="h-72">
            <ReactECharts option={basinOption} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="card">
          <h2 className="card-header flex items-center gap-2">
            <AlertTriangle size={20} className="text-ocean-400" />
            海盆状态监控
          </h2>
          <div className="space-y-3">
            {basinStatuses.slice(0, 5).map((basin) => (
              <div
                key={basin.basin}
                className={`p-3 rounded-lg border transition-all ${
                  basin.isPaused
                    ? 'bg-coral-500/10 border-coral-500/30'
                    : 'bg-white/5 border-white/10 hover:border-ocean-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{basin.basin}</span>
                  {basin.isPaused ? (
                    <span className="status-badge status-error">已暂停</span>
                  ) : basin.consecutiveDeviations >= 2 ? (
                    <span className="status-badge status-warning">需关注</span>
                  ) : (
                    <span className="status-badge status-success">正常</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/50">连续偏差:</span>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-2 rounded ${
                          i < basin.consecutiveDeviations
                            ? 'bg-coral-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/70 font-mono">{basin.consecutiveDeviations}/3</span>
                </div>
                <div className="mt-2 flex gap-2 text-[10px] text-white/50">
                  <span className="flex items-center gap-1">
                    <Thermometer size={10} />
                    NPP: {basin.lastNppValues[0]?.toFixed(2)} Pg C/yr
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="card-header flex items-center gap-2">
            <Droplets size={20} className="text-ocean-400" />
            最新碳汇数据
          </h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {carbonSinkData.slice(-8).reverse().map((data) => (
              <div
                key={data.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-ocean-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white text-sm">{data.basin} - {data.season}</span>
                  <span className="text-xs text-white/50">{data.scenario}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/50">总碳汇</span>
                    <p className="font-mono text-seaweed-400">
                      {data.totalCarbonSink.toFixed(0)} Tg C/yr
                    </p>
                  </div>
                  <div>
                    <span className="text-white/50">生物泵</span>
                    <p className="font-mono text-ocean-400">
                      {data.biologicalPump.toFixed(2)} Pg C/yr
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 text-[10px]">
                  <span className="px-2 py-0.5 bg-ocean-500/20 text-ocean-300 rounded">
                    {data.year}年
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header">每日统计报表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/60 border-b border-white/10">
                <th className="pb-3 font-medium">日期</th>
                <th className="pb-3 font-medium">模拟完成率</th>
                <th className="pb-3 font-medium">预警响应时间</th>
                <th className="pb-3 font-medium">碳汇评估精度</th>
                <th className="pb-3 font-medium">总模拟数</th>
                <th className="pb-3 font-medium">完成数</th>
                <th className="pb-3 font-medium">生成预警</th>
                <th className="pb-3 font-medium">已复核</th>
              </tr>
            </thead>
            <tbody>
              {performanceStats.slice(-7).reverse().map((stat) => (
                <tr key={stat.date} className="table-row-hover border-b border-white/5">
                  <td className="py-3 text-white/80">{stat.date}</td>
                  <td className="py-3">
                    <span className={`font-mono ${
                      stat.simulationCompletionRate >= 90 ? 'text-seaweed-400' :
                      stat.simulationCompletionRate >= 80 ? 'text-ocean-400' : 'text-coral-400'
                    }`}>
                      {stat.simulationCompletionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`font-mono ${
                      stat.averageAlertResponseTime <= 20 ? 'text-seaweed-400' :
                      stat.averageAlertResponseTime <= 30 ? 'text-ocean-400' : 'text-coral-400'
                    }`}>
                      {stat.averageAlertResponseTime.toFixed(0)} 分钟
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`font-mono ${
                      stat.carbonSinkAssessmentAccuracy >= 95 ? 'text-seaweed-400' :
                      stat.carbonSinkAssessmentAccuracy >= 90 ? 'text-ocean-400' : 'text-coral-400'
                    }`}>
                      {stat.carbonSinkAssessmentAccuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 text-white/80 font-mono">{stat.totalSimulations}</td>
                  <td className="py-3 text-white/80 font-mono">{stat.completedSimulations}</td>
                  <td className="py-3 text-white/80 font-mono">{stat.alertsGenerated}</td>
                  <td className="py-3 text-white/80 font-mono">{stat.alertsReviewed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
