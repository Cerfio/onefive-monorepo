import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface KPICardProps {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'stable';
    icon: React.ReactNode;
    isLoading?: boolean;
}

export const KPICard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon, 
    isLoading
}: KPICardProps) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
            </div>
        );
    }

    const getTrend = () => {
        switch (trend) {
            case 'up':
                return 'up';
            case 'down':
                return 'down';
            case 'stable':
            default:
                return 'neutral';
        }
    };

    const isNumeric = typeof value === 'number' || 
                      (typeof value === 'string' && !isNaN(parseInt(value.replace(/[,\s]/g, ''))));
    
    const numericValue = isNumeric ? 
                        (typeof value === 'number' ? value : parseInt(value.toString().replace(/[,\s]/g, ''))) : 
                        0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-[#5E6AD2] transition-colors">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">{title}</h3>
                <div className="text-indigo-600">
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
                {isNumeric ? (
                    <AnimatedNumber
                        value={numericValue}
                        animated={true}
                        trend={getTrend()}
                        format={{ 
                            notation: numericValue > 999 ? 'compact' : 'standard',
                            maximumFractionDigits: 0 
                        }}
                    />
                ) : (
                    value
                )}
            </div>
            <p className={`text-xs font-medium ${
                trend === 'up' ? 'text-emerald-600' : 
                trend === 'down' ? 'text-rose-600' : 'text-slate-500'
            }`}>
                {change}
            </p>
        </div>
    );
}; 