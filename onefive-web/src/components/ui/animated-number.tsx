import React from 'react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  format?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
  locales?: string | string[];
  animated?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  willChange?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className,
  format,
  prefix,
  suffix,
  locales = 'fr-FR',
  animated = true,
  trend = 'neutral',
  willChange = false,
}) => {
  const getTrend = () => {
    switch (trend) {
      case 'up':
        return 1;
      case 'down':
        return -1;
      case 'neutral':
      default:
        return 0;
    }
  };

  return (
    <NumberFlow
      value={value}
      className={cn(
        'font-semibold tabular-nums',
        className
      )}
      format={format as any}
      prefix={prefix}
      suffix={suffix}
      locales={locales}
      animated={animated}
      trend={getTrend()}
      willChange={willChange}
      transformTiming={{ 
        duration: 150, 
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)' 
      }}
      spinTiming={{ 
        duration: 150, 
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)' 
      }}
      opacityTiming={{ 
        duration: 150, 
        easing: 'ease-out' 
      }}
    />
  );
};

// Composant spécialisé pour les statistiques de dataroom
interface DataroomStatProps {
  label: string;
  value: number | string;
  className?: string;
  animated?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  format?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
}

export const DataroomStat: React.FC<DataroomStatProps> = ({
  label,
  value,
  className,
  animated = true,
  trend = 'neutral',
  format,
  prefix,
  suffix,
}) => {
  const numericValue = typeof value === 'string' ? 0 : value;
  const isString = typeof value === 'string';

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {isString ? (
        <span className="text-lg font-bold">{value}</span>
      ) : (
        <AnimatedNumber
          value={numericValue}
          className="text-lg font-bold"
          animated={animated}
          trend={trend}
          format={format}
          prefix={prefix}
          suffix={suffix}
        />
      )}
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
};

// Composant pour les cartes de statistiques
interface StatCardProps {
  label: string;
  value: number | string | undefined;
  icon?: React.ReactNode;
  className?: string;
  animated?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  format?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  className,
  animated = true,
  trend = 'neutral',
  format,
  prefix,
  suffix,
  color = 'primary',
}) => {
  const safeValue = value || 0;
  const numericValue = typeof safeValue === 'string' ? 0 : safeValue;
  const isString = typeof safeValue === 'string';

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-[#5E6AD2] hover:border-[#5E6AD2]';
      case 'secondary':
        return 'text-gray-600 hover:border-gray-400';
      case 'success':
        return 'text-green-600 hover:border-green-400';
      case 'warning':
        return 'text-orange-600 hover:border-orange-400';
      case 'error':
        return 'text-red-600 hover:border-red-400';
      default:
        return 'text-[#5E6AD2] hover:border-[#5E6AD2]';
    }
  };

  return (
    <div className={cn(
      'bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-colors',
      getColorClasses(),
      className
    )}>
      <p className="text-sm text-gray-500 flex items-center gap-2">
        {label}
        {icon && <span className="text-gray-400">{icon}</span>}
      </p>
      <div className="mt-1">
        {isString ? (
          <p className={cn('text-2xl font-semibold', getColorClasses().split(' ')[0])}>
            {safeValue}
          </p>
        ) : (
          <AnimatedNumber
            value={numericValue}
            className={cn('text-2xl font-semibold', getColorClasses().split(' ')[0])}
            animated={animated}
            trend={trend}
            format={format}
            prefix={prefix}
            suffix={suffix}
          />
        )}
      </div>
    </div>
  );
}; 