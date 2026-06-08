
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  color?: 'ocean' | 'seaweed' | 'coral' | 'sand';
  description?: string;
}

const colorClasses = {
  ocean: {
    bg: 'from-ocean-500/20 to-ocean-600/10',
    border: 'border-ocean-500/30',
    icon: 'bg-ocean-500/20 text-ocean-400',
    value: 'text-ocean-300'
  },
  seaweed: {
    bg: 'from-seaweed-500/20 to-seaweed-600/10',
    border: 'border-seaweed-500/30',
    icon: 'bg-seaweed-500/20 text-seaweed-400',
    value: 'text-seaweed-300'
  },
  coral: {
    bg: 'from-coral-500/20 to-coral-600/10',
    border: 'border-coral-500/30',
    icon: 'bg-coral-500/20 text-coral-400',
    value: 'text-coral-300'
  },
  sand: {
    bg: 'from-sand-500/20 to-sand-600/10',
    border: 'border-sand-500/30',
    icon: 'bg-sand-500/20 text-sand-400',
    value: 'text-sand-300'
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color = 'ocean',
  description
}) => {
  const colors = colorClasses[color];
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className={`p-5 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} backdrop-blur-sm hover:shadow-lg hover:shadow-ocean-500/10 transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colors.icon}`}>
          <Icon size={22} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive ? 'bg-seaweed-500/20 text-seaweed-300' : 
            isNegative ? 'bg-coral-500/20 text-coral-300' : 
            'bg-white/10 text-white/60'
          }`}>
            {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : null}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-white/60 text-sm mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono ${colors.value}`}>{value}</span>
          {unit && <span className="text-white/50 text-sm">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-white/40 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};
