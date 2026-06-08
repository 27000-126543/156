
import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Database,
  Thermometer,
  Fish,
  Wind,
  Layers,
  Play,
  Settings,
  Info
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useStore } from '../store/useStore';
import { BiologicalParams, UploadedFile } from '../../shared/types';

const fileCategories = [
  { id: 'circulation', name: '环流模式数据', icon: Database, formats: ['.nc', '.grb', '.h5'], description: '全球海洋环流模式输出' },
  { id: 'nutrient', name: '营养盐数据', icon: Thermometer, formats: ['.csv', '.xlsx', '.nc'], description: '硝酸盐、磷酸盐、硅酸盐等' },
  { id: 'phytoplankton', name: '浮游植物数据', icon: Fish, formats: ['.csv', '.xlsx', '.nc'], description: '叶绿素浓度、浮游植物生物量' },
  { id: 'oxygen', name: '溶解氧数据', icon: Wind, formats: ['.csv', '.xlsx', '.nc'], description: '溶解氧浓度、缺氧区观测' },
  { id: 'other', name: '其他数据', icon: Layers, formats: ['.csv', '.xlsx'], description: '温度、盐度、光照等' },
];

const defaultParams: BiologicalParams = {
  growthRate: 0.5,
  mortalityRate: 0.1,
  sinkingRate: 1.5,
  pocSinkingVelocity: 100,
  remineralizationDepth: 1000
};

export const DataUpload: React.FC = () => {
  const { uploadedFiles, addUploadedFile, updateFileProgress, removeUploadedFile, createSimulation, setNotification } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [params, setParams] = useState<BiologicalParams>(defaultParams);
  const [simulationConfig, setSimulationConfig] = useState({
    name: '',
    description: '',
    oceanBasin: '太平洋',
    season: '春季',
    scenario: 'SSP2-4.5'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      const category = detectFileCategory(file.name);
      const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newFile: UploadedFile = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploading',
        progress: 0,
        category
      };
      
      addUploadedFile(newFile);
      simulateUpload(id);
    });
  };

  const detectFileCategory = (filename: string): UploadedFile['category'] => {
    const name = filename.toLowerCase();
    if (name.includes('circulation') || name.includes('current') || name.includes('velocity')) return 'circulation';
    if (name.includes('nutrient') || name.includes('nitrate') || name.includes('phosphate')) return 'nutrient';
    if (name.includes('phytoplankton') || name.includes('chlorophyll') || name.includes('chl')) return 'phytoplankton';
    if (name.includes('oxygen') || name.includes('do') || name.includes('hypoxia')) return 'oxygen';
    return 'other';
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        updateFileProgress(fileId, 100, 'success');
      } else {
        updateFileProgress(fileId, progress, 'uploading');
      }
    }, 200);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const getCategoryIcon = (category: string) => {
    const cat = fileCategories.find(c => c.id === category);
    return cat ? cat.icon : File;
  };

  const getCategoryName = (category: string) => {
    const cat = fileCategories.find(c => c.id === category);
    return cat ? cat.name : '其他数据';
  };

  const handleCreateSimulation = () => {
    if (uploadedFiles.filter(f => f.status === 'success').length === 0) {
      setNotification({ type: 'error', message: '请先上传至少一个数据文件' });
      return;
    }
    if (!simulationConfig.name.trim()) {
      setNotification({ type: 'error', message: '请输入模拟任务名称' });
      return;
    }

    createSimulation(
      simulationConfig.name,
      simulationConfig.description,
      simulationConfig.oceanBasin,
      simulationConfig.season,
      simulationConfig.scenario,
      params
    );
  };

  const paramHistogramOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 36, 99, 0.9)',
      borderColor: 'rgba(62, 146, 204, 0.3)',
      textStyle: { color: '#fff' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['生长率', '死亡率', '沉降速率', 'POC沉降速度', '再矿化深度'],
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: params.growthRate, itemStyle: { color: '#3E92CC' } },
        { value: params.mortalityRate * 10, itemStyle: { color: '#1B998B' } },
        { value: params.sinkingRate, itemStyle: { color: '#F46036' } },
        { value: params.pocSinkingVelocity / 100, itemStyle: { color: '#d4ae6a' } },
        { value: params.remineralizationDepth / 1000, itemStyle: { color: '#7cc9fb' } }
      ],
      barWidth: '50%',
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">数据上传</h1>
          <p className="text-white/60 text-sm mt-1">上传海洋环流模式输出和观测数据，配置生物地球化学参数</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? 'border-ocean-400 bg-ocean-500/10 glow-effect'
                : 'border-white/20 bg-white/5 hover:border-ocean-500/50 hover:bg-white/[0.07]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center">
              <Upload size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">拖拽文件到此处上传</h3>
            <p className="text-white/60 mb-4">或点击选择文件，支持 NetCDF、CSV、Excel 等格式</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['.nc', '.csv', '.xlsx', '.grb', '.h5'].map((fmt) => (
                <span key={fmt} className="px-3 py-1 bg-ocean-500/20 text-ocean-300 rounded-full text-xs font-medium">
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fileCategories.map((cat) => {
              const Icon = cat.icon;
              const count = uploadedFiles.filter(f => f.category === cat.id && f.status === 'success').length;
              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-ocean-500/30 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-ocean-500/20 text-ocean-400">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{cat.name}</p>
                      <p className="text-xs text-white/50">{count} 个文件</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/40">{cat.description}</p>
                  <p className="text-[10px] text-white/30 mt-1">支持: {cat.formats.join(', ')}</p>
                </div>
              );
            })}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="card">
              <h2 className="card-header flex items-center justify-between">
                <span>已上传文件 ({uploadedFiles.length})</span>
                <button
                  onClick={() => uploadedFiles.forEach(f => removeUploadedFile(f.id))}
                  className="text-xs text-coral-400 hover:text-coral-300"
                >
                  清空全部
                </button>
              </h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {uploadedFiles.map((file) => {
                  const Icon = getCategoryIcon(file.category);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-ocean-500/30 transition-all"
                    >
                      <div className="p-2 rounded-lg bg-ocean-500/20 text-ocean-400">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{file.name}</p>
                          <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white/60 rounded">
                            {getCategoryName(file.category)}
                          </span>
                        </div>
                        <p className="text-xs text-white/50">{formatFileSize(file.size)}</p>
                        {file.status === 'uploading' && (
                          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-ocean-400 to-seaweed-400 rounded-full transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === 'success' && (
                          <CheckCircle size={18} className="text-seaweed-400" />
                        )}
                        {file.status === 'uploading' && (
                          <span className="text-xs text-ocean-400 font-mono">{Math.round(file.progress)}%</span>
                        )}
                        {file.status === 'error' && (
                          <AlertCircle size={18} className="text-coral-400" />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeUploadedFile(file.id); }}
                          className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-coral-400 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="card-header flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings size={18} className="text-ocean-400" />
                模拟任务配置
              </span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">任务名称</label>
                <input
                  type="text"
                  value={simulationConfig.name}
                  onChange={(e) => setSimulationConfig({ ...simulationConfig, name: e.target.value })}
                  placeholder="输入模拟任务名称"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-ocean-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">描述</label>
                <textarea
                  value={simulationConfig.description}
                  onChange={(e) => setSimulationConfig({ ...simulationConfig, description: e.target.value })}
                  placeholder="任务描述（可选）"
                  rows={2}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-ocean-500/50 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">海盆</label>
                  <select
                    value={simulationConfig.oceanBasin}
                    onChange={(e) => setSimulationConfig({ ...simulationConfig, oceanBasin: e.target.value })}
                    className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50 transition-colors"
                  >
                    {['太平洋', '大西洋', '印度洋', '北冰洋', '南大洋', '地中海', '加勒比海'].map(b => (
                      <option key={b} value={b} className="bg-ocean-900">{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">季节</label>
                  <select
                    value={simulationConfig.season}
                    onChange={(e) => setSimulationConfig({ ...simulationConfig, season: e.target.value })}
                    className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50 transition-colors"
                  >
                    {['春季', '夏季', '秋季', '冬季'].map(s => (
                      <option key={s} value={s} className="bg-ocean-900">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">情景</label>
                  <select
                    value={simulationConfig.scenario}
                    onChange={(e) => setSimulationConfig({ ...simulationConfig, scenario: e.target.value })}
                    className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50 transition-colors"
                  >
                    {['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5', '历史基准'].map(s => (
                      <option key={s} value={s} className="bg-ocean-900">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-header flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers size={18} className="text-ocean-400" />
                生物参数配置
              </span>
              <button
                onClick={() => setShowParams(!showParams)}
                className="text-xs text-ocean-400 hover:text-ocean-300"
              >
                {showParams ? '收起' : '展开'}
              </button>
            </h2>
            
            {showParams && (
              <div className="space-y-4">
                <div className="h-40">
                  <ReactECharts option={paramHistogramOption} style={{ height: '100%' }} />
                </div>
                
                {Object.entries(params).map(([key, value]) => {
                  const labels: Record<string, { label: string; unit: string; min: number; max: number; step: number }> = {
                    growthRate: { label: '浮游植物生长率', unit: 'd⁻¹', min: 0.1, max: 1.0, step: 0.05 },
                    mortalityRate: { label: '浮游植物死亡率', unit: 'd⁻¹', min: 0.01, max: 0.3, step: 0.01 },
                    sinkingRate: { label: '生物量沉降速率', unit: 'm d⁻¹', min: 0.5, max: 5.0, step: 0.1 },
                    pocSinkingVelocity: { label: 'POC沉降速度', unit: 'm d⁻¹', min: 10, max: 200, step: 5 },
                    remineralizationDepth: { label: '再矿化深度', unit: 'm', min: 200, max: 2000, step: 50 }
                  };
                  const config = labels[key];
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-white/80">{config.label}</label>
                        <span className="font-mono text-ocean-400 text-sm">
                          {value} <span className="text-white/50">{config.unit}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={config.min}
                          max={config.max}
                          step={config.step}
                          value={value}
                          onChange={(e) => setParams({ ...params, [key]: parseFloat(e.target.value) })}
                          className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-ocean-500"
                        />
                        <input
                          type="number"
                          min={config.min}
                          max={config.max}
                          step={config.step}
                          value={value}
                          onChange={(e) => setParams({ ...params, [key]: parseFloat(e.target.value) })}
                          className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm font-mono text-center focus:border-ocean-500/50"
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="p-3 rounded-lg bg-ocean-500/10 border border-ocean-500/20 flex items-start gap-2">
                  <Info size={14} className="text-ocean-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/60">
                    系统将根据上传的数据自动优化参数初始值。您可以手动调整这些参数以满足特定模拟需求。
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowParams(!showParams)}
              className="w-full mt-4 py-2 text-sm text-ocean-400 hover:text-ocean-300 border border-ocean-500/30 rounded-lg transition-colors"
            >
              {showParams ? '收起参数配置' : '查看/修改生物参数'}
            </button>
          </div>

          <button
            onClick={handleCreateSimulation}
            disabled={uploadedFiles.filter(f => f.status === 'success').length === 0}
            className="w-full py-4 bg-gradient-to-r from-ocean-500 to-seaweed-500 hover:from-ocean-400 hover:to-seaweed-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-ocean-500/30 hover:shadow-xl hover:shadow-ocean-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play size={20} />
            开始构建三维耦合模型
          </button>

          <div className="p-4 rounded-xl bg-coral-500/10 border border-coral-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-coral-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-coral-300">太平洋区域任务暂停</p>
                <p className="text-xs text-white/60 mt-1">
                  该海盆连续三次模拟NPP偏差超过20%，已自动暂停新任务。请联系首席科学家排查。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
