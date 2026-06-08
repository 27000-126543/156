
import React from 'react';
import {
  FileCheck,
  Merge,
  Grid3X3,
  RefreshCw,
  Wind,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { SimulationStatus } from '../../shared/types';
import { statusLabels } from '../utils/mockData';

interface StatusFlowProps {
  currentStatus: SimulationStatus;
  error?: boolean;
}

const statusConfig = [
  { status: SimulationStatus.PENDING_VALIDATION, icon: FileCheck, label: '待校验', color: 'sand' },
  { status: SimulationStatus.DATA_FUSION, icon: Merge, label: '数据融合', color: 'ocean' },
  { status: SimulationStatus.GRID_INITIALIZATION, icon: Grid3X3, label: '网格初始化', color: 'ocean' },
  { status: SimulationStatus.BIOGEOCHEMICAL_ITERATION, icon: RefreshCw, label: '生物化学迭代', color: 'ocean' },
  { status: SimulationStatus.CARBON_FLUX_CALCULATION, icon: Wind, label: '碳通量计算', color: 'ocean' },
  { status: SimulationStatus.COMPLETED, icon: CheckCircle2, label: '完成', color: 'seaweed' },
];

const colorClasses = {
  sand: {
    bg: 'bg-sand-500',
    bgLight: 'bg-sand-500/20',
    text: 'text-sand-400',
    border: 'border-sand-500/50',
    glow: 'shadow-sand-500/30'
  },
  ocean: {
    bg: 'bg-ocean-500',
    bgLight: 'bg-ocean-500/20',
    text: 'text-ocean-400',
    border: 'border-ocean-500/50',
    glow: 'shadow-ocean-500/30'
  },
  seaweed: {
    bg: 'bg-seaweed-500',
    bgLight: 'bg-seaweed-500/20',
    text: 'text-seaweed-400',
    border: 'border-seaweed-500/50',
    glow: 'shadow-seaweed-500/30'
  },
  coral: {
    bg: 'bg-coral-500',
    bgLight: 'bg-coral-500/20',
    text: 'text-coral-400',
    border: 'border-coral-500/50',
    glow: 'shadow-coral-500/30'
  }
};

export const StatusFlow: React.FC<StatusFlowProps> = ({ currentStatus, error }) => {
  const currentIndex = statusConfig.findIndex(s => s.status === currentStatus);
  const isError = error || currentStatus === SimulationStatus.ERROR || currentStatus === SimulationStatus.ROLLBACK;

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-6 left-0 right-0 h-1 bg-white/10 rounded-full" />
        
        <div
          className="absolute top-6 left-0 h-1 rounded-full transition-all duration-500 bg-gradient-to-r from-ocean-400 to-seaweed-400"
          style={{
            width: `${isError ? Math.max(0, (currentIndex / (statusConfig.length - 1)) * 100) : (currentIndex / (statusConfig.length - 1)) * 100}%`
          }}
        />

        {statusConfig.map((config, index) => {
          const Icon = config.icon;
          const isActive = index <= currentIndex && !isError;
          const isCurrent = index === currentIndex;
          const colors = isError && isCurrent ? colorClasses.coral : colorClasses[config.color];

          return (
            <div key={config.status} className="relative flex flex-col items-center z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? `${colors.bg} text-white shadow-lg ${colors.glow}`
                    : `bg-white/5 ${colors.text} border ${colors.border}`
                } ${isCurrent && !isError ? 'ring-4 ring-ocean-500/30 animate-pulse' : ''} ${
                  isCurrent && isError ? 'ring-4 ring-coral-500/30 animate-pulse' : ''
                }`}
              >
                {isError && isCurrent ? (
                  <RotateCcw size={20} className={isCurrent ? 'animate-spin' : ''} />
                ) : (
                  <Icon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-white/50'
                } ${isCurrent && isError ? 'text-coral-400' : ''}`}
              >
                {config.label}
              </span>
              {isCurrent && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bgLight} ${colors.text}`}>
                    {isError ? '异常回退' : '进行中'}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isError && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-coral-500/20 border border-coral-500/30 rounded-lg">
            <AlertCircle size={16} className="text-coral-400" />
            <span className="text-sm text-coral-300">
              检测到异常，已自动回退至 {statusLabels[SimulationStatus.BIOGEOCHEMICAL_ITERATION]} 阶段
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
