'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Metric {
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number; // percentage change
  icon?: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
}

interface BuildInPublicMetricsProps {
  metrics: Metric[];
  className?: string;
}

const formatValue = (value: string | number, format: 'number' | 'currency' | 'percentage' = 'number'): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return String(value);
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numValue);
    case 'percentage':
      return `${numValue.toFixed(1)}%`;
    case 'number':
    default:
      if (numValue >= 1000000) {
        return `${(numValue / 1000000).toFixed(1)}M`;
      }
      if (numValue >= 1000) {
        return `${(numValue / 1000).toFixed(1)}K`;
      }
      return numValue.toLocaleString('fr-FR');
  }
};

const getTrendIcon = (change?: number) => {
  if (change === undefined) return null;
  if (change > 0) return <ArrowUp className="h-3.5 w-3.5" />;
  if (change < 0) return <ArrowDown className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
};

const getTrendColor = (change?: number) => {
  if (change === undefined) return 'text-gray-500';
  if (change > 0) return 'text-emerald-600';
  if (change < 0) return 'text-red-500';
  return 'text-gray-500';
};

const getTrendBgColor = (change?: number) => {
  if (change === undefined) return 'bg-gray-50';
  if (change > 0) return 'bg-emerald-50';
  if (change < 0) return 'bg-red-50';
  return 'bg-gray-50';
};

export const BuildInPublicMetrics: React.FC<BuildInPublicMetricsProps> = ({
  metrics,
  className,
}) => {
  if (!metrics || metrics.length === 0) return null;

  // Si une seule métrique, affichage inline compact
  if (metrics.length === 1) {
    const metric = metrics[0];
    const formattedValue = formatValue(metric.value, metric.format);
    const trendIcon = getTrendIcon(metric.change);
    const trendColor = getTrendColor(metric.change);
    
    return (
      <div className={cn('flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100', className)}>
        <div className="flex-1">
          <span className="text-sm text-gray-500">{metric.label}</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">{formattedValue}</span>
            {metric.change !== undefined && (
              <span className={cn('flex items-center gap-0.5 text-sm font-medium', trendColor)}>
                {trendIcon}
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        {metric.previousValue !== undefined && (
          <div className="text-right">
            <span className="text-xs text-gray-400">Avant</span>
            <div className="text-sm text-gray-500">{formatValue(metric.previousValue, metric.format)}</div>
          </div>
        )}
      </div>
    );
  }

  // Plusieurs métriques : affichage horizontal compact
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {metrics.map((metric, index) => {
        const formattedValue = formatValue(metric.value, metric.format);
        const trendIcon = getTrendIcon(metric.change);
        const trendColor = getTrendColor(metric.change);
        const bgColor = getTrendBgColor(metric.change);

        return (
          <div
            key={index}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border',
              bgColor,
              metric.change !== undefined && metric.change > 0 ? 'border-emerald-100' : 
              metric.change !== undefined && metric.change < 0 ? 'border-red-100' : 
              'border-gray-100'
            )}
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 leading-tight">{metric.label}</span>
              <span className="text-lg font-bold text-gray-900 leading-tight">{formattedValue}</span>
            </div>
            {metric.change !== undefined && (
              <div className={cn('flex items-center gap-0.5 text-xs font-semibold', trendColor)}>
                {trendIcon}
                <span>{metric.change > 0 ? '+' : ''}{metric.change.toFixed(0)}%</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
