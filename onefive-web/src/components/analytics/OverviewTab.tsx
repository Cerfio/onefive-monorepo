import React, { useMemo } from 'react';
import { Eye, Users, FileText, Clock } from 'lucide-react';
import { Skeleton } from '@/components/base/skeleton/skeleton';
import { Toggle } from '@/components/base/toggle/toggle';
import { Avatar } from '@/components/base/avatar/avatar';
import { getAvatarUrl } from '@/utils/avatar';
import { KPICard } from './KPICard';
import { CustomLineChart } from '@/components/application/charts/line-chart';
import { CustomBarChart } from '@/components/application/charts/bar-chart';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { UserAnalytics, FileAnalytics, DashboardStat, ActivityChartDataPoint } from '../../app/(protected)/dataroom/[id]/analytics/types';

interface OverviewTabProps {
  dashboardStats: DashboardStat[];
  userAnalytics: UserAnalytics[];
  fileAnalytics: FileAnalytics[];
  activityChartData: ActivityChartDataPoint[];
  comparisonChartData: ActivityChartDataPoint[];
  isComparing: boolean;
  onToggleComparison: () => void;
  isLoading: boolean;
  onUserSelect: (user: UserAnalytics) => void;
  onFileSelect: (file: FileAnalytics) => void;
}

export const OverviewTab = ({
  dashboardStats,
  userAnalytics,
  fileAnalytics,
  activityChartData,
  comparisonChartData,
  isComparing,
  onToggleComparison,
  isLoading,
  onUserSelect,
  onFileSelect,
}: OverviewTabProps) => {
  const mergedChartData = useMemo(() => {
    if (!isComparing || comparisonChartData.length === 0) return activityChartData;
    const merged = activityChartData.map(point => {
      const prevPoint = comparisonChartData.find(p => p.date === point.date);
      return {
        ...point,
        prevViews: prevPoint?.views ?? 0,
        prevUniqueViewers: prevPoint?.uniqueViewers ?? 0,
      };
    });
    return merged;
  }, [activityChartData, comparisonChartData, isComparing]);

  const lineChartDataKeys = isComparing
    ? [
        { key: 'views', name: 'Vues (actuel)', color: 'text-utility-brand-600', fill: true },
        { key: 'prevViews', name: 'Vues (précédent)', color: 'text-utility-gray-400' },
      ]
    : [
        { key: 'views', name: 'Vues', color: 'text-utility-brand-600', fill: true },
        { key: 'uniqueViewers', name: 'Viewers uniques', color: 'text-utility-gray-500' },
      ];

  const barChartData = fileAnalytics.slice(0, 8).map(f => ({
    name: f.name.length > 20 ? f.name.substring(0, 20) + '…' : f.name,
    vues: f.totalViews,
    viewers: f.uniqueViewers,
  }));

  const hasData = dashboardStats.length > 0 || userAnalytics.length > 0 || fileAnalytics.length > 0;

  if (!isLoading && !hasData) {
    return (
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.Illustration type="cloud" color="gray" />
        </EmptyState.Header>
        <EmptyState.Content>
          <EmptyState.Title>Aucune donnée analytics</EmptyState.Title>
          <EmptyState.Description>
            Les analytics s'afficheront une fois que des investisseurs commenceront à consulter votre dataroom. Partagez le lien pour commencer.
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <KPICard key={index} title="" value="" change="" trend="stable" icon={<></>} isLoading={true} />
            ))
          : dashboardStats.map((stat, index) => (
              <KPICard
                key={index}
                title={stat.label}
                value={stat.value}
                change={`${stat.change} depuis la dernière période`}
                trend={stat.trend}
                icon={
                  index === 0 ? <Eye className="h-5 w-5" /> :
                  index === 1 ? <Users className="h-5 w-5" /> :
                  index === 2 ? <FileText className="h-5 w-5" /> :
                  <Clock className="h-5 w-5" />
                }
              />
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#101828]">Activité sur la période</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#475467]">Comparer</span>
              <Toggle isSelected={isComparing} onChange={onToggleComparison} size="sm" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-60 w-full" />
          ) : mergedChartData.length > 0 ? (
            <CustomLineChart
              data={mergedChartData}
              title="Activité"
              xAxisKey="date"
              yAxisLabel="Nombre"
              dataKeys={lineChartDataKeys}
            />
          ) : (
            <div className="h-60 flex items-center justify-center text-sm text-[#98A2B3]">
              Pas assez de données pour afficher le graphique
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-[#101828] mb-4">Documents les plus consultés</h3>
          {isLoading ? (
            <Skeleton className="h-60 w-full" />
          ) : barChartData.length > 0 ? (
            <CustomBarChart
              data={barChartData}
              title="Top fichiers"
              xAxisKey="name"
              yAxisLabel="Nombre"
              dataKeys={[
                { key: 'vues', name: 'Vues', color: 'text-utility-brand-600' },
                { key: 'viewers', name: 'Viewers', color: 'text-utility-brand-200' },
              ]}
            />
          ) : (
            <div className="h-60 flex items-center justify-center text-sm text-[#98A2B3]">
              Aucun document consulté
            </div>
          )}
        </div>
      </div>

      {/* Top users & files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top files */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Top documents
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 animate-pulse">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))
                : fileAnalytics.length === 0 ? (
                    <p className="text-sm text-[#98A2B3] text-center py-6">Aucun document consulté</p>
                  ) : fileAnalytics.slice(0, 5).map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => onFileSelect(file)}
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm truncate text-[#101828]">{file.name}</h3>
                        <span className="text-xs text-[#98A2B3]">{file.category}</span>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <span className="text-sm font-semibold text-[#101828]">{file.totalViews}</span>
                        <span className="text-xs text-[#98A2B3] ml-1">vues</span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Top users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Utilisateurs les plus actifs
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))
                : userAnalytics.length === 0 ? (
                    <p className="text-sm text-[#98A2B3] text-center py-6">Aucun utilisateur actif</p>
                  ) : userAnalytics.slice(0, 5).map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => onUserSelect(user)}
                    >
                      <Avatar
                        src={getAvatarUrl(user.avatar)}
                        alt={user.name}
                        initials={user.name.split(' ').map(n => n[0]).join('')}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#101828]">{user.name}</div>
                        <div className="text-xs text-[#98A2B3]">{user.role}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-[#101828]">{user.totalViews}</div>
                        <div className="text-xs text-[#98A2B3]">vues</div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
