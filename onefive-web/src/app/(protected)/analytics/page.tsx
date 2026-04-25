'use client';

import { useState, useEffect } from 'react';
import type { Key } from "react-aria-components";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card/card';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Tabs } from '@/components/application/tabs/tabs';
import { Select } from '@/components/base/select/select';
import { Input } from '@/components/base/input/input';
import { Avatar } from '@/components/base/avatar/avatar';
import { Flag } from '@/components/ui/flag';
import { ProgressBar } from '@/components/base/progress-indicators/progress-indicators';
import { PROFILE_ROLE_METADATA, ProfileRole } from '@/sharing-enum/profile';
import { CustomLineChart } from '@/components/application/charts/line-chart';
import { MetricsChart03 } from '@/components/application/metrics/metrics';
import {
  Eye,
  MessageCircle01,
  Heart,
  Share01,
  RefreshCcw02,
  SearchLg,
  ChevronLeft,
  ChevronRight,
  SwitchVertical01,
} from '@untitledui/icons';
import { PostAnalyticsModal } from '@/components/analytics/PostAnalyticsModal';
import { NativeSelect } from '@/components/base/select/select-native';
import { useVisitorsAnalytics, useEngagementAnalytics, useOverviewAnalytics, type TimeRange, type PostEngagementStats } from '@/hooks/useProfileAnalytics';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { decodeBuildInPublicData } from '@/utils/buildInPublic';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Composant pour le graphique simple avec nouveau Line Chart
const SimpleChart = ({ data, title }: { data: { week: string; views: number }[]; title: string }) => {
  const dataKeys = [{ key: 'views', name: 'Vues', color: 'text-[#5E6AD2]', fill: true }];

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomLineChart data={data} title={title} dataKeys={dataKeys} xAxisKey="week" yAxisLabel="Vues" />
      </CardContent>
    </Card>
  );
};

// Composant pour l'onglet Vue d'ensemble avec données réelles
const OverviewTab = ({ timeRange }: { timeRange: TimeRange }) => {
  const { data: overviewData, isLoading, error, refetch } = useOverviewAnalytics(timeRange);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7d': return 'cette semaine';
      case '30d': return 'ce mois';
      case '90d': return 'ce trimestre';
      case '1y': return 'cette année';
      default: return 'ce mois';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error || !overviewData) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            {error ? 'Erreur lors du chargement des données' : 'Aucune donnée disponible'}
          </p>
          <Button color="secondary" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricsChart03
          title={overviewData.profileViews.current.toLocaleString()}
          subtitle="Vues du profil"
          changeTrend={overviewData.profileViews.change >= 0 ? 'positive' : 'negative'}
          change={`${overviewData.profileViews.change >= 0 ? '+' : ''}${overviewData.profileViews.change}%`}
          changeDescription={getTimeRangeLabel()}
          chartCurveType="linear"
          chartData={overviewData.profileViews.chartData}
          className="flex-1"
        />
        <MetricsChart03
          title={overviewData.connections.current.toString()}
          subtitle="Connexions"
          changeTrend={overviewData.connections.change >= 0 ? 'positive' : 'negative'}
          change={`${overviewData.connections.change >= 0 ? '+' : ''}${overviewData.connections.change}%`}
          changeDescription={getTimeRangeLabel()}
          chartCurveType="linear"
          chartData={overviewData.connections.chartData}
          className="flex-1"
        />
        <MetricsChart03
          title={overviewData.posts.current.toString()}
          subtitle="Publications"
          changeTrend={overviewData.posts.change >= 0 ? 'positive' : 'negative'}
          change={`${overviewData.posts.change >= 0 ? '+' : ''}${overviewData.posts.change}%`}
          changeDescription={getTimeRangeLabel()}
          chartCurveType="linear"
          chartData={overviewData.posts.chartData}
          className="flex-1"
        />
        <MetricsChart03
          title={overviewData.discussions.current.toString()}
          subtitle="Discussions"
          changeTrend={overviewData.discussions.change >= 0 ? 'positive' : 'negative'}
          change={`${overviewData.discussions.change >= 0 ? '+' : ''}${overviewData.discussions.change}%`}
          changeDescription={getTimeRangeLabel()}
          chartCurveType="linear"
          chartData={overviewData.discussions.chartData}
          className="flex-1"
        />
        <MetricsChart03
          title={overviewData.engagement.current.toString()}
          subtitle="Engagement"
          changeTrend={overviewData.engagement.change >= 0 ? 'positive' : 'negative'}
          change={`${overviewData.engagement.change >= 0 ? '+' : ''}${overviewData.engagement.change}%`}
          changeDescription={getTimeRangeLabel()}
          chartCurveType="linear"
          chartData={overviewData.engagement.chartData}
          className="flex-1"
        />
        <MetricsChart03
          title={overviewData.topProfileType.count.toString()}
          subtitle={`Top: ${overviewData.topProfileType.type}`}
          changeTrend={overviewData.topProfileType.change >= 0 ? 'positive' : 'negative'}
          change={`${overviewData.topProfileType.change >= 0 ? '+' : ''}${overviewData.topProfileType.change}%`}
          changeDescription={getTimeRangeLabel()}
          chartCurveType="linear"
          chartData={overviewData.profileViews.chartData} // Réutilise les données de vues
          className="flex-1"
        />
        <MetricsChart03
          title={`${overviewData.networkQuality.current}/100`}
          subtitle="Qualité réseau"
          changeTrend={overviewData.networkQuality.change >= 0 ? 'positive' : 'negative'}
          change={`${overviewData.networkQuality.change >= 0 ? '+' : ''}${overviewData.networkQuality.change}%`}
          changeDescription={getTimeRangeLabel()}
          chartCurveType="linear"
          chartData={overviewData.networkQuality.chartData}
          className="flex-1"
        />
        <MetricsChart03
          title={overviewData.searchAppearances.current.toLocaleString()}
          subtitle="Apparitions recherche"
          changeTrend={overviewData.searchAppearances.change >= 0 ? 'positive' : 'negative'}
          change={`${overviewData.searchAppearances.change >= 0 ? '+' : ''}${overviewData.searchAppearances.change}%`}
          changeDescription={getTimeRangeLabel()}
          chartCurveType="linear"
          chartData={overviewData.searchAppearances.chartData}
          className="flex-1"
        />
        <MetricsChart03
          title={`${overviewData.profileCompletion.current}%`}
          subtitle="Complétion du profil"
          changeTrend={overviewData.profileCompletion.change >= 0 ? 'positive' : 'negative'}
          change={`${overviewData.profileCompletion.change >= 0 ? '+' : ''}${overviewData.profileCompletion.change}%`}
          changeDescription={getTimeRangeLabel()}
          chartCurveType="linear"
          chartData={overviewData.profileCompletion.chartData}
          className="flex-1"
        />
      </div>
      <SimpleChart
        data={overviewData.weeklyData}
        title="Évolution des vues du profil"
      />
    </>
  );
};

// Composant pour l'onglet Visiteurs avec données réelles
const VisitorsTab = ({ timeRange }: { timeRange: TimeRange }) => {
  const { data: visitorsData, isLoading, error, refetch } = useVisitorsAnalytics(timeRange);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error || !visitorsData) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            {error ? 'Erreur lors du chargement des données' : 'Aucune donnée disponible'}
          </p>
          <Button color="secondary" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg">Répartition des visiteurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const total = visitorsData.networkBreakdown.fromNetwork + visitorsData.networkBreakdown.fromOutside;
                const networkPercentage = total > 0 ? Math.round((visitorsData.networkBreakdown.fromNetwork / total) * 100) : 0;
                const outsidePercentage = total > 0 ? Math.round((visitorsData.networkBreakdown.fromOutside / total) * 100) : 0;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#5E6AD2]"></div>
                        <span className="text-sm font-medium">De votre réseau</span>
                      </div>
                      <span className="text-sm font-bold text-[#5E6AD2]">
                        {visitorsData.networkBreakdown.fromNetwork} ({networkPercentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-sm font-medium">Hors réseau</span>
                      </div>
                      <span className="text-sm font-bold text-gray-600">
                        {visitorsData.networkBreakdown.fromOutside} ({outsidePercentage}%)
                      </span>
                    </div>
                    <ProgressBar min={0} max={100} value={networkPercentage} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{visitorsData.networkBreakdown.mutualConnections}</div>
                        <div className="text-xs text-gray-500">Connexions mutuelles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{visitorsData.networkBreakdown.directConnections}</div>
                        <div className="text-xs text-gray-500">Connexions directes</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg">Types de profils OneFive</CardTitle>
            <p className="text-sm text-gray-500">Répartition des visiteurs par type de profil</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visitorsData.onefiveProfileTypes.length > 0 ? (
                visitorsData.onefiveProfileTypes.map((item, index) => {
                  const metadata = PROFILE_ROLE_METADATA[item.type as ProfileRole];
                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {metadata ? (
                            <Tooltip title={metadata.longLabelMale}>
                              <TooltipTrigger>
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-default shrink-0"
                                  style={{
                                    backgroundColor: `${metadata.color}15`,
                                    color: metadata.color,
                                    border: `1px solid ${metadata.color}30`,
                                  }}
                                >
                                  <span>{metadata.emoji}</span>
                                  <span>{metadata.shortLabelMale}</span>
                                </span>
                              </TooltipTrigger>
                            </Tooltip>
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">{item.type}</span>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-sm font-bold text-gray-900">{item.count}</div>
                          <div className="text-xs text-gray-500">{item.percentage}%</div>
                        </div>
                      </div>
                      <ProgressBar min={0} max={100} value={item.percentage} className="h-2" />
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
        <CardHeader>
          <CardTitle className="text-lg">Visiteurs récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visitorsData.recentVisitors.length > 0 ? (
              visitorsData.recentVisitors.map(visitor => (
                <Link
                  key={visitor.id}
                  href={`/profile/${visitor.id}`}
                  className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Avatar
                    src={visitor.avatar}
                    firstName={visitor.firstName}
                    lastName={visitor.lastName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{visitor.name}</p>
                      {visitor.isFromNetwork ? (
                        <Badge type="pill-color" color="success" size="sm">
                          Réseau
                        </Badge>
                      ) : (
                        <Badge type="pill-color" color="gray" size="sm">
                          Hors réseau
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{visitor.title || 'Membre OneFive'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{visitor.visitedAt}</span>
                      {visitor.mutualConnections > 0 && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-blue-600">
                            {visitor.mutualConnections} connexion{visitor.mutualConnections > 1 ? 's' : ''} mutuelle{visitor.mutualConnections > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {visitor.ecosystemRoles && visitor.ecosystemRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {visitor.ecosystemRoles.map((role) => {
                        const metadata = PROFILE_ROLE_METADATA[role as ProfileRole];
                        if (!metadata) return null;
                        return (
                          <Tooltip key={role} title={metadata.longLabelMale}>
                            <TooltipTrigger>
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-default"
                                style={{
                                  backgroundColor: `${metadata.color}15`,
                                  color: metadata.color,
                                  border: `1px solid ${metadata.color}30`,
                                }}
                              >
                                <span>{metadata.emoji}</span>
                                <span>{metadata.shortLabelMale}</span>
                              </span>
                            </TooltipTrigger>
                          </Tooltip>
                        );
                      })}
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucun visiteur récent</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Visiteurs par pays</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visitorsData.topCountries.length > 0 ? (
              visitorsData.topCountries.map((country, _index) => (
                <div key={country.country}>
                  <Tooltip
                    title={`${country.count} visiteurs (${country.percentage}%) depuis ${country.country}`}
                  >
                    <TooltipTrigger className="w-full">
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          {/* Flag + country name */}
                          <Flag 
                            countryCode={(() => {
                              const match = require('@/utils/countries').countries.find(
                                (c: any) => c.name.toLowerCase() === country.country.toLowerCase()
                              );
                              return match ? match.code : '';
                            })()}
                            width={20}
                            height={14}
                            className="ml-1"
                          />
                          <span className="text-sm font-medium">{country.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ProgressBar min={0} max={100} value={country.percentage} className="w-24 h-1.5" />
                          <span className="text-sm text-gray-600 font-mono w-16 text-right">
                            {country.count}
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                  </Tooltip>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const POSTS_PER_PAGE = 5;

const EngagementTab = ({
  timeRange,
  onPostClick,
}: {
  timeRange: TimeRange;
  onPostClick: (post: PostEngagementStats) => void;
}) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'date' | 'views' | 'likes' | 'comments' | 'shares'>('date');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  const { data: engagementData, isLoading, error, refetch } = useEngagementAnalytics({
    timeRange,
    skip: (page - 1) * POSTS_PER_PAGE,
    limit: POSTS_PER_PAGE,
    search: search || undefined,
    sortBy: sort,
    sortOrder: order,
  });

  const totalPages = engagementData ? Math.ceil(engagementData.totalContent / POSTS_PER_PAGE) : 1;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, sort, order, timeRange]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-4">
          <div className="animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="h-10 bg-gray-200 rounded w-full md:w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded w-48"></div>
          </div>
        </Card>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !engagementData) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            {error ? 'Erreur lors du chargement des données' : 'Aucune donnée disponible'}
          </p>
          <Button color="secondary" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  const posts = engagementData.posts;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Posts</div>
          <div className="text-2xl font-bold">{engagementData.totalPosts}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Discussions</div>
          <div className="text-2xl font-bold">{engagementData.totalDiscussions}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Vues</div>
          <div className="text-2xl font-bold">{engagementData.totalViews.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Likes</div>
          <div className="text-2xl font-bold">{engagementData.totalLikes.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Taux d'engagement moyen</div>
          <div className="text-2xl font-bold">{engagementData.averageEngagementRate}%</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <SearchLg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par contenu..."
              value={search}
              onChange={(value) => setSearch(value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              selectedKey={sort}
              onSelectionChange={(value) => setSort(value as any)}
              placeholder="Trier par"
              className="w-[180px]"
              items={[
                { label: "Date", id: "date" },
                { label: "Vues", id: "views" },
                { label: "Likes", id: "likes" },
                { label: "Commentaires", id: "comments" },
                { label: "Partages", id: "shares" },
              ]}
            >
              {(item) => (
                <Select.Item id={item.id}>
                  {item.label}
                </Select.Item>
              )}
            </Select>
            <Button 
              color="secondary" 
              size="sm" 
              onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
              iconLeading={<SwitchVertical01 className="h-4 w-4" data-icon />}
            >
              <span className="sr-only">Changer l'ordre</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Posts & Discussions List */}
      <div className="space-y-4">
        {posts.map(post => {
          // Nettoyer le titre pour retirer les métadonnées BUILD_IN_PUBLIC
          const { visibleContent: cleanTitle } = decodeBuildInPublicData(post.title);
          const displayTitle = cleanTitle.length > 50 ? cleanTitle.substring(0, 50) + '...' : cleanTitle;
          
          return (
          <div
            key={post.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => {
              if (post.details.viewTrend.length > 0) onPostClick(post);
              else toast.info('Les statistiques détaillées ne sont pas encore disponibles.');
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    post.type === 'discussion' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {post.type === 'discussion' ? 'Discussion' : 'Post'}
                </span>
                <p className="font-medium text-gray-900 truncate">{displayTitle || 'Sans titre'}</p>
              </div>
              <p className="text-sm text-gray-500 mt-1">{post.date}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle01 className="h-4 w-4" />
                <span>{post.comments}</span>
              </div>
              {post.type === 'post' && (
                <div className="flex items-center gap-1">
                  <Share01 className="h-4 w-4" />
                  <span>{post.shares}</span>
                </div>
              )}
            </div>
          </div>
          );
        })}
        {posts.length === 0 && <div className="text-center text-gray-400 py-8">Aucun contenu trouvé.</div>}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">
          Page {page} sur {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <Button 
            color="secondary" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            iconLeading={<ChevronLeft className="h-4 w-4" data-icon />}
          >
            Précédent
          </Button>
          <Button
            color="secondary"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
            disabled={page >= totalPages}
            iconTrailing={<ChevronRight className="h-4 w-4" data-icon />}
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Weekly Chart */}
      {engagementData.weeklyData.length > 0 && (
        <div className="mt-8">
          <SimpleChart
            data={engagementData.weeklyData.map(d => ({ week: d.week, views: d.views }))}
            title="Évolution des vues (posts et discussions)"
          />
        </div>
      )}
    </div>
  );
};

const AnalyticsPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedPost, setSelectedPost] = useState<PostEngagementStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<Key>('overview');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Tabs configuration
const tabs = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'visitors', label: 'Visiteurs' },
  { id: 'engagement', label: 'Engagement' },
];

  // Sync tab <-> URL query param (?tab=...)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (!tabFromUrl) return;
    if (tabs.some((t) => t.id === tabFromUrl) && tabFromUrl !== selectedTab) {
      setSelectedTab(tabFromUrl);
    }
  }, [searchParams, selectedTab]);

  const handleTabChange = (value: Key) => {
    setSelectedTab(value);

    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', String(value));
    router.replace(`${pathname}?${next.toString()}`);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Les hooks react-query vont automatiquement refetch
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Données d'analyse à jour !");
    }, 1000);
  };

  return (
    <>
      <div className="min-h-screen bg-[#FCFCFD]">
        <div className="w-full max-w-screen-xl mx-auto">
          <Navbar />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <div className="space-y-8">
              {/* Header */}
              <motion.div variants={cardVariants}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-[#101828]">Analytics</h1>
                      <p className="text-[#475467] mt-1">Suivez vos performances et l'engagement de votre réseau.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        selectedKey={timeRange}
                        onSelectionChange={(value) => setTimeRange(value as TimeRange)}
                        className="w-[180px]"
                        items={[
                          { label: "7 derniers jours", id: "7d" },
                          { label: "30 derniers jours", id: "30d" },
                          { label: "90 derniers jours", id: "90d" },
                          { label: "1 an", id: "1y" },
                        ]}
                      >
                        {(item) => (
                          <Select.Item id={item.id}>
                            {item.label}
                          </Select.Item>
                        )}
                      </Select>
                      <Button 
                        color="secondary" 
                        size="md" 
                        iconLeading={<RefreshCcw02 className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} data-icon />}
                        onClick={handleRefresh} 
                        disabled={isRefreshing}
                      >
                        Actualiser
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Onglets pour les catégories d'analytics */}
              <>
                <NativeSelect
                  value={selectedTab as string}
                  onChange={(event) => handleTabChange(event.target.value)}
                  options={tabs.map((tab) => ({ label: tab.label, value: tab.id }))}
                  className="w-80 md:hidden mb-6"
                />
                <Tabs selectedKey={selectedTab} onSelectionChange={handleTabChange} className="mb-6">
                  <Tabs.List type="underline" items={tabs}>
                    {(tab) => <Tabs.Item {...tab} />}
                  </Tabs.List>

                  {/* Tab Vue d'ensemble */}
                  <Tabs.Panel id="overview">
                    <OverviewTab timeRange={timeRange} />
                  </Tabs.Panel>

                  {/* Tab Visiteurs */}
                  <Tabs.Panel id="visitors">
                    <VisitorsTab timeRange={timeRange} />
                  </Tabs.Panel>

                  {/* Tab Engagement */}
                  <Tabs.Panel id="engagement">
                    <EngagementTab timeRange={timeRange} onPostClick={setSelectedPost} />
                  </Tabs.Panel>


                </Tabs>
              </>
            </div>
          </motion.div>
        </div>

        {selectedPost && (
          <PostAnalyticsModal
            isOpen={!!selectedPost}
            onOpenChange={() => setSelectedPost(null)}
            post={selectedPost}
          />
        )}
      </div>
    </>
  );
};

export default AnalyticsPage;
