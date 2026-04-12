'use client';

import { Badge } from '../base/badges/badges';
import { Button } from '../base/buttons/button';
import { Eye, ChevronRight } from 'lucide-react';
import { Bar, CartesianGrid, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { Avatar } from '../base/avatar/avatar';
import { useRouter } from 'next/navigation';

// Nouveau composant pour les statistiques du profil
export const ProfileAnalyticsCard = ({ analytics, profileName: _profileName }: { analytics: any, profileName: string }) => {
  const router = useRouter();
  
  // Transformer les données pour le graphique Recharts
  const chartData = analytics.viewsOverTime.map((item: any, index: number) => ({
    day: item.day,
    views: item.views,
    date: item.date || `Jour ${index + 1}`
  }));

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-semibold text-[#101828]">Vos statistiques</h3>
        <Badge color="gray" className="bg-white text-slate-600 border-slate-200 text-xs">
          <Eye size={12} className="mr-1.5" />
          Privé
        </Badge>
      </div>

      {/* Statistique principale */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <p className="text-sm font-medium text-blue-900">Total des vues</p>
        </div>
        <p className="text-3xl font-bold text-[#101828] mb-1">{analytics.totalViews.toLocaleString('fr-FR')}</p>
        <p className="text-sm text-[#475467]">Vues du profil sur les 30 derniers jours</p>
        {analytics.previousPeriodViews && (
          <div className="mt-2 flex items-center gap-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              analytics.totalViews > analytics.previousPeriodViews 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {analytics.totalViews > analytics.previousPeriodViews ? '+' : ''}
              {((analytics.totalViews - analytics.previousPeriodViews) / analytics.previousPeriodViews * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-[#475467]">vs. période précédente</span>
          </div>
        )}
      </div>

      {/* Graphique des vues */}
      <div className="mb-6">
        <h4 className="font-medium text-sm text-[#101828] mb-4">Évolution des vues</h4>
        {chartData && chartData.length > 0 && chartData.some((item: any) => item.views > 0) ? (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                className="text-tertiary [&_.recharts-text]:text-xs"
                margin={{
                  left: 0,
                  right: 0,
                  top: 4,
                  bottom: 4,
                }}
              >
                <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />
                
                <XAxis
                  fill="currentColor"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                  dataKey="day"
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  fill="currentColor"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => Number(value).toLocaleString()}
                />

                <Tooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [Number(value).toLocaleString(), 'Vues']}
                  labelFormatter={(label) => `${label}`}
                  cursor={{
                    className: "fill-utility-gray-200/20",
                  }}
                />

                <Bar
                  isAnimationActive={false}
                  className="text-utility-brand-600"
                  dataKey="views"
                  name="Vues"
                  fill="currentColor"
                  maxBarSize={24}
                  radius={[2, 2, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500">Aucune donnée disponible</p>
          </div>
        )}
      </div>

      {/* Métriques rapides */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-lg font-bold text-[#101828]">{analytics.weeklyViews || 0}</p>
          <p className="text-xs text-[#475467]">Cette semaine</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-lg font-bold text-[#101828]">{analytics.dailyAverage || 0}</p>
          <p className="text-xs text-[#475467]">Moy. par jour</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-lg font-bold text-[#101828]">{analytics.profileRank || '-'}</p>
          <p className="text-xs text-[#475467]">Classement</p>
        </div>
      </div>

      {/* Visiteurs récents */}
      <div className="mb-6">
        <h4 className="font-medium text-sm text-[#101828] mb-4">Visiteurs récents</h4>
        <div className="space-y-3">
          {analytics.recentVisitors.map((visitor: any) => (
            <div key={visitor.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="h-9 w-9 rounded-full flex-shrink-0">
                <Avatar alt={visitor.name} src={visitor.avatar} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#101828] truncate">{visitor.name}</p>
                <p className="text-xs text-[#475467] truncate">{visitor.title}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-[#475467]">{visitor.visitedAt}</p>
              </div>
            </div>
          ))}
        </div>
        {analytics.recentVisitors.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-[#475467]">Aucun visiteur récent</p>
          </div>
        )}
      </div>
      
      {/* Bouton d'action */}
      <Button 
        color="secondary" 
        className="w-full gap-2" 
        iconTrailing={<ChevronRight size={14} />}
        onClick={() => router.push('/analytics')}
      >
        Voir toutes les statistiques
      </Button>
    </div>
  );
};

export default ProfileAnalyticsCard; 