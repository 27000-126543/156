
import React, { useState } from 'react';
import {
  Microscope,
  Search,
  Filter,
  LayoutGrid,
  List,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Clock,
  AlertTriangle,
  ChevronDown,
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { StatusFlow } from '../components/StatusFlow';
import { statusLabels } from '../utils/mockData';
import { Simulation, SimulationStatus } from '../../shared/types';

export const Simulations: React.FC = () => {
  const { simulations, setCurrentSimulation, currentSimulation, basinStatuses } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBasin, setFilterBasin] = useState<string>('all');
  const [showDetail, setShowDetail] = useState(false);

  const pausedBasins = basinStatuses.filter(b => b.isPaused).map(b => b.basin);

  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch = sim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sim.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sim.status === filterStatus;
    const matchesBasin = filterBasin === 'all' || sim.oceanBasin === filterBasin;
    return matchesSearch && matchesStatus && matchesBasin;
  });

  const getStatusBadgeClass = (status: SimulationStatus) => {
    switch (status) {
      case SimulationStatus.COMPLETED:
        return 'status-success';
      case SimulationStatus.ERROR:
      case SimulationStatus.ROLLBACK:
        return 'status-error';
      case SimulationStatus.PENDING_VALIDATION:
        return 'status-pending';
      default:
        return 'status-running';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetail = (sim: Simulation) => {
    setCurrentSimulation(sim);
    setShowDetail(true);
  };

  const basins = Array.from(new Set(simulations.map(s => s.oceanBasin)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">模拟任务管理</h1>
          <p className="text-white/60 text-sm mt-1">管理和监控所有海洋生物地球化学模拟任务</p>
        </div>
      </div>

      {pausedBasins.length > 0 && (
        <div className="p-4 rounded-xl bg-coral-500/10 border border-coral-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-coral-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-coral-300">
                ⚠️ 以下海盆已被暂停新任务：{pausedBasins.join('、')}
              </p>
              <p className="text-xs text-white/60 mt-1">
                这些海盆连续三次模拟NPP偏差超过20%，已自动锁定。现有任务不受影响，但无法创建新任务。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="搜索模拟任务..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-ocean-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-white/60" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50 transition-colors"
            >
              <option value="all" className="bg-ocean-900">全部状态</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value} className="bg-ocean-900">{label}</option>
              ))}
            </select>
            <select
              value={filterBasin}
              onChange={(e) => setFilterBasin(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50 transition-colors"
            >
              <option value="all" className="bg-ocean-900">全部海盆</option>
              {basins.map(basin => (
                <option 
                  key={basin} 
                  value={basin} 
                  className="bg-ocean-900"
                >
                  {basin} {pausedBasins.includes(basin) ? '🔒' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-ocean-500/30 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-ocean-500/30 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/60 border-b border-white/10 bg-white/5">
                  <th className="p-4 font-medium">任务名称</th>
                  <th className="p-4 font-medium">海盆</th>
                  <th className="p-4 font-medium">季节/情景</th>
                  <th className="p-4 font-medium">状态</th>
                  <th className="p-4 font-medium">进度</th>
                  <th className="p-4 font-medium">预警</th>
                  <th className="p-4 font-medium">创建时间</th>
                  <th className="p-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredSimulations.map((sim) => (
                  <tr key={sim.id} className="table-row-hover border-b border-white/5">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-white">{sim.name}</p>
                        <p className="text-xs text-white/50 truncate max-w-[250px]">{sim.description}</p>
                      </div>
                    </td>
                    <td className="p-4 text-white/80">{sim.oceanBasin}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 bg-ocean-500/20 text-ocean-300 rounded text-xs">{sim.season}</span>
                        <span className="px-2 py-0.5 bg-seaweed-500/20 text-seaweed-300 rounded text-xs">{sim.emissionScenario}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`status-badge ${getStatusBadgeClass(sim.status)}`}>
                        {statusLabels[sim.status]}
                      </span>
                    </td>
                    <td className="p-4 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              sim.status === SimulationStatus.ERROR ? 'bg-coral-500' :
                              sim.status === SimulationStatus.COMPLETED ? 'bg-seaweed-500' :
                              'bg-gradient-to-r from-ocean-400 to-seaweed-400'
                            }`}
                            style={{ width: `${sim.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60 font-mono w-10">{Math.round(sim.progress)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {sim.alertCount > 0 ? (
                        <span className="flex items-center gap-1 text-coral-400 text-sm">
                          <AlertTriangle size={14} />
                          {sim.alertCount}
                        </span>
                      ) : (
                        <span className="text-white/30 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-white/60 text-sm font-mono text-xs">
                      {formatDate(sim.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetail(sim)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-ocean-400 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={16} />
                        </button>
                        {sim.status === SimulationStatus.ERROR && (
                          <button
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-coral-400 transition-colors"
                            title="重新模拟"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        {sim.status === SimulationStatus.PENDING_VALIDATION && (
                          <button
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-seaweed-400 transition-colors"
                            title="开始模拟"
                          >
                            <Play size={16} />
                          </button>
                        )}
                        <button
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-coral-400 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSimulations.length === 0 && (
            <div className="p-12 text-center text-white/50">
              <Microscope size={48} className="mx-auto mb-3 opacity-30" />
              <p>没有找到匹配的模拟任务</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSimulations.map((sim) => (
            <div
              key={sim.id}
              className="card hover:border-ocean-500/40 transition-all cursor-pointer"
              onClick={() => handleViewDetail(sim)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{sim.name}</h3>
                  <p className="text-xs text-white/50 mt-1">{sim.oceanBasin} · {sim.season}</p>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(sim.status)}`}>
                  {statusLabels[sim.status]}
                </span>
              </div>
              <p className="text-sm text-white/60 mb-4 line-clamp-2">{sim.description}</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">模拟进度</span>
                    <span className="text-white/80 font-mono">{Math.round(sim.progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sim.status === SimulationStatus.ERROR ? 'bg-coral-500' :
                        sim.status === SimulationStatus.COMPLETED ? 'bg-seaweed-500' :
                        'bg-gradient-to-r from-ocean-400 to-seaweed-400'
                      }`}
                      style={{ width: `${sim.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(sim.updatedAt)}
                  </div>
                  {sim.alertCount > 0 && (
                    <div className="flex items-center gap-1 text-coral-400">
                      <AlertTriangle size={12} />
                      {sim.alertCount} 条预警
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetail && currentSimulation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass rounded-2xl">
            <div className="sticky top-0 p-6 border-b border-white/10 bg-ocean-950/90 backdrop-blur-md flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{currentSimulation.name}</h2>
                <p className="text-sm text-white/60">{currentSimulation.oceanBasin} · {currentSimulation.season} · {currentSimulation.emissionScenario}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <StatusFlow
                currentStatus={currentSimulation.status}
                error={currentSimulation.status === SimulationStatus.ERROR || currentSimulation.status === SimulationStatus.ROLLBACK}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">创建人</p>
                  <p className="text-white font-medium">{currentSimulation.createdByName}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">创建时间</p>
                  <p className="text-white font-medium">{formatDate(currentSimulation.createdAt)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">更新时间</p>
                  <p className="text-white font-medium">{formatDate(currentSimulation.updatedAt)}</p>
                </div>
              </div>

              <div className="card">
                <h3 className="card-header">生物地球化学参数</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-white/50 mb-1">生长率</p>
                    <p className="text-ocean-400 font-mono font-semibold">{currentSimulation.params.growthRate.toFixed(2)} <span className="text-white/50 text-xs">d⁻¹</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">死亡率</p>
                    <p className="text-ocean-400 font-mono font-semibold">{currentSimulation.params.mortalityRate.toFixed(3)} <span className="text-white/50 text-xs">d⁻¹</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">沉降速率</p>
                    <p className="text-ocean-400 font-mono font-semibold">{currentSimulation.params.sinkingRate.toFixed(2)} <span className="text-white/50 text-xs">m d⁻¹</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">POC沉降速度</p>
                    <p className="text-ocean-400 font-mono font-semibold">{currentSimulation.params.pocSinkingVelocity.toFixed(0)} <span className="text-white/50 text-xs">m d⁻¹</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">再矿化深度</p>
                    <p className="text-ocean-400 font-mono font-semibold">{currentSimulation.params.remineralizationDepth.toFixed(0)} <span className="text-white/50 text-xs">m</span></p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="card-header">任务描述</h3>
                <p className="text-white/80">{currentSimulation.description}</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDetail(false)}
                  className="btn-secondary"
                >
                  关闭
                </button>
                {currentSimulation.status === SimulationStatus.ERROR && (
                  <button className="btn-primary flex items-center gap-2">
                    <RotateCcw size={16} />
                    重新模拟
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
