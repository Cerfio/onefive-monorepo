'use client';

import { Post } from '@/features/post/components/post';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  X,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Percent,
  TrendingUp,
  Users,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { ProfileRoleBadge } from '@/components/profile/ProfileRoleBadge';
import { ProfileRole } from '@/sharing-enum/profile';
import type { PostEngagementStats } from '@/hooks/useProfileAnalytics';
import Link from 'next/link';
import { decodeBuildInPublicData } from '@/utils/buildInPublic';

interface PostAnalyticsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  post: PostEngagementStats | null;
}

const MetricItem = ({ icon: Icon, value, label, color = 'text-gray-600' }: { icon: React.ElementType; value: string | number; label: string; color?: string }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div className={`p-2 bg-white rounded-lg shadow-sm`}>
      <Icon className={`h-4 w-4 ${color}`} />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm text-gray-800 p-3 rounded-lg border border-gray-200 shadow-lg">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-sm font-bold text-[#5E6AD2]">{`${payload[0].value} vues`}</p>
      </div>
    );
  }
  return null;
};

export const PostAnalyticsModal = ({ isOpen, onOpenChange, post }: PostAnalyticsModalProps) => {
  if (!post) return null;

  const hasViewTrend = post.details.viewTrend && post.details.viewTrend.length > 0;
  const hasAudienceByRole = post.details.audience.byRole && post.details.audience.byRole.length > 0;
  const isDiscussion = post.type === 'discussion';

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
      <Modal className="max-w-3xl">
        <Dialog className="flex-col items-start!">
          <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                {isDiscussion ? (
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                ) : (
                  <BarChart3 className="h-5 w-5 text-[#5E6AD2]" />
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  Statistiques {isDiscussion ? 'de la discussion' : 'du post'}
                </h2>
                <span 
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isDiscussion 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isDiscussion ? 'Discussion' : 'Post'}
                </span>
              </div>
              <Button
                color="tertiary"
                size="sm"
                onClick={() => onOpenChange(false)}
                iconLeading={<X className="h-4 w-4" data-icon />}
              >
                <span className="sr-only">Fermer</span>
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4 space-y-6">
              {/* Content Preview */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {isDiscussion ? (
                  <Link href={`/discussions/${post.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <HelpCircle className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                        {post.content && post.content !== post.title && (() => {
                          const { visibleContent } = decodeBuildInPublicData(post.content || '');
                          return (
                            <p className="text-sm text-gray-600 line-clamp-2">{visibleContent || post.content}</p>
                          );
                        })()}
                        <p className="text-xs text-gray-400 mt-2">{post.date}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Post postId={post.id} compact />
                )}
              </div>

              {/* Metrics Grid */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performances
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricItem icon={Eye} value={post.views.toLocaleString()} label="Impressions" color="text-blue-600" />
                  <MetricItem icon={Heart} value={post.likes.toLocaleString()} label={isDiscussion ? "Likes / Upvotes" : "J'aime"} color="text-red-500" />
                  <MetricItem icon={MessageCircle} value={post.comments.toLocaleString()} label={isDiscussion ? "Réponses" : "Commentaires"} color="text-green-600" />
                  {!isDiscussion && (
                    <MetricItem icon={Share2} value={post.shares.toLocaleString()} label="Reposts" color="text-purple-600" />
                  )}
                </div>
                <div className="mt-3 p-4 bg-linear-to-r from-[#5E6AD2]/10 to-[#5E6AD2]/5 rounded-lg border border-[#5E6AD2]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-[#5E6AD2]" />
                      <span className="text-sm font-medium text-gray-700">Taux d'engagement</span>
                    </div>
                    <span className="text-2xl font-bold text-[#5E6AD2]">{post.details.engagementRate}%</span>
                  </div>
                </div>
              </div>

              {/* Activity Chart */}
              {hasViewTrend && (
                <Card className="border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Activité sur 7 jours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={post.details.viewTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis 
                          dataKey="day" 
                          stroke="#9ca3af" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="#9ca3af" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(94, 106, 210, 0.1)' }} />
                        <Bar dataKey="views" fill="#5E6AD2" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Audience Analysis */}
              {hasAudienceByRole && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Analyse de l'audience
                  </h3>
                  <Card className="border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600">Répartition par rôle</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {post.details.audience.byRole.map((roleData, index) => {
                          const totalViews = post.details.audience.byRole.reduce((sum, r) => sum + r.count, 0);
                          const percentage = totalViews > 0 ? Math.round((roleData.count / totalViews) * 100) : 0;
                          
                          return (
                            <div key={index} className="flex items-center gap-3">
                              {/* Badge du rôle */}
                              <div className="shrink-0">
                                <ProfileRoleBadge 
                                  role={roleData.role as ProfileRole} 
                                  variant="default"
                                />
                              </div>
                              
                              {/* Barre de progression et stats */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: roleData.color 
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-gray-500 w-10 text-right">
                                    {percentage}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400">
                                  {roleData.count} {roleData.count > 1 ? 'vues' : 'vue'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* No data state */}
              {!hasViewTrend && !hasAudienceByRole && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Les données détaillées seront disponibles une fois que {isDiscussion ? 'la discussion' : 'le post'} aura plus d'interactions.</p>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}; 