import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  VisitorsAnalyticsResponseDto,
  NetworkBreakdown,
  ProfileTypeCount,
  CountryVisitors,
  RecentVisitor,
  TimeRange,
} from './dto/get-visitors-analytics.dto';
import {
  EngagementAnalyticsResponseDto,
  PostEngagementStats,
  WeeklyDataItem,
} from './dto/get-engagement-analytics.dto';
import {
  OverviewAnalyticsResponseDto,
  OverviewMetric,
  ChartDataPoint,
} from './dto/get-overview-analytics.dto';
import { StorageService } from 'src/storage/storage.service';
import { FileUrlUtils } from 'src/common/utils/file-url.utils';

// Helper pour formater le temps écoulé en français
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSec < 60) return 'il y a quelques secondes';
  if (diffMin < 60) return `il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  if (diffHours < 24)
    return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  if (diffWeeks < 4)
    return `il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
  return `il y a ${diffMonths} mois`;
}

// Helper pour extraire le contenu visible (sans les métadonnées BUILD_IN_PUBLIC)
function extractVisibleContent(content: string): string {
  const BUILD_IN_PUBLIC_MARKER = '<!--BUILD_IN_PUBLIC:';
  const markerIndex = content.indexOf(BUILD_IN_PUBLIC_MARKER);
  if (markerIndex === -1) return content;
  return content.substring(0, markerIndex).trim();
}

// Mapping des rôles d'écosystème vers les couleurs et descriptions
const ECOSYSTEM_ROLE_CONFIG: Record<
  string,
  { color: string; description: string }
> = {
  Founder: { color: 'bg-[#5E6AD2]', description: 'Créateurs de startups' },
  'Co-founder': {
    color: 'bg-[#5E6AD2]/80',
    description: 'Associés de startups',
  },
  CEO: { color: 'bg-[#5E6AD2]/60', description: 'Directeurs généraux' },
  CTO: { color: 'bg-gray-600', description: 'Directeurs techniques' },
  BA: { color: 'bg-gray-700', description: 'Business Angels' },
  VC: { color: 'bg-gray-800', description: 'Venture Capitalists' },
  'Product Manager': {
    color: 'bg-gray-500',
    description: 'Chefs de produit',
  },
  Developer: { color: 'bg-gray-400', description: 'Développeurs' },
  Designer: { color: 'bg-gray-300', description: 'Designers' },
  Mentor: { color: 'bg-gray-200', description: 'Mentors' },
  Consultant: { color: 'bg-gray-100', description: 'Consultants' },
  Other: { color: 'bg-gray-50', description: 'Autres profils' },
};

@Injectable()
export class ProfileAnalyticsService {
  private readonly fileUrlUtils: FileUrlUtils;

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    @Inject('Logger') private readonly logger: LogService,
  ) {
    this.fileUrlUtils = new FileUrlUtils(this.logger);
  }

  private getDateRangeFromTimeRange(timeRange: TimeRange): Date {
    const now = new Date();
    switch (timeRange) {
      case TimeRange.SEVEN_DAYS:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case TimeRange.THIRTY_DAYS:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case TimeRange.NINETY_DAYS:
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case TimeRange.ONE_YEAR:
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  @Log()
  async getVisitorsAnalytics({
    transactionId,
    userId,
    timeRange = TimeRange.THIRTY_DAYS,
  }: {
    transactionId: string;
    userId: string;
    timeRange?: TimeRange;
  }): Promise<VisitorsAnalyticsResponseDto> {
    try {
      // Récupérer le profil de l'utilisateur
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      const profileId = userProfile.id;
      const startDate = this.getDateRangeFromTimeRange(timeRange);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Récupérer toutes les vues du profil dans la période
      const profileViews = await this.prisma.profileView.findMany({
        where: {
          viewedById: profileId,
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          viewerId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Récupérer les IDs uniques des viewers
      const viewerIds = [...new Set(profileViews.map((v) => v.viewerId))];

      // Récupérer les profils des viewers en une seule requête
      const viewers = await this.prisma.profile.findMany({
        where: { id: { in: viewerIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          city: true,
          countryCode: true,
          ecosystemRoles: true,
          avatarId: true,
          avatar: { select: { id: true } },
          experiences: {
            orderBy: { from: 'desc' },
            take: 1,
            select: { title: true, company: true },
          },
        },
      });

      const viewerMap = new Map(viewers.map((v) => [v.id, v]));

      // Calculer les totaux
      const total = profileViews.length;
      const thisWeek = profileViews.filter(
        (v) => v.createdAt >= oneWeekAgo,
      ).length;
      const thisMonth = profileViews.filter(
        (v) => v.createdAt >= oneMonthAgo,
      ).length;

      // Récupérer les connexions de l'utilisateur
      const userConnections = await this.prisma.relationship.findMany({
        where: {
          OR: [{ requesterId: profileId }, { accepterId: profileId }],
          status: 'ACCEPTED',
        },
        select: { requesterId: true, accepterId: true },
      });

      const connectionIds = new Set(
        userConnections.flatMap((r) =>
          r.requesterId === profileId
            ? [r.accepterId]
            : r.accepterId === profileId
              ? [r.requesterId]
              : [],
        ),
      );

      // Calculer la répartition réseau vs hors réseau
      let fromNetwork = 0;
      let fromOutside = 0;
      let mutualConnections = 0;
      let directConnections = 0;

      // Cache pour les connexions de chaque viewer
      const viewerConnectionsCache = new Map<string, Set<string>>();

      for (const view of profileViews) {
        const viewerId = view.viewerId;
        const isConnected = connectionIds.has(viewerId);

        if (isConnected) {
          fromNetwork++;
          directConnections++;
        } else {
          // Vérifier les connexions mutuelles
          let viewerConnectionIds = viewerConnectionsCache.get(viewerId);

          if (!viewerConnectionIds) {
            const viewerConnections = await this.prisma.relationship.findMany({
              where: {
                OR: [{ requesterId: viewerId }, { accepterId: viewerId }],
                status: 'ACCEPTED',
              },
              select: { requesterId: true, accepterId: true },
            });

            viewerConnectionIds = new Set(
              viewerConnections.flatMap((r) =>
                r.requesterId === viewerId
                  ? [r.accepterId]
                  : r.accepterId === viewerId
                    ? [r.requesterId]
                    : [],
              ),
            );
            viewerConnectionsCache.set(viewerId, viewerConnectionIds);
          }

          const hasMutual = [...connectionIds].some((id) =>
            viewerConnectionIds!.has(id),
          );
          if (hasMutual) {
            fromNetwork++;
            mutualConnections++;
          } else {
            fromOutside++;
          }
        }
      }

      const networkBreakdown: NetworkBreakdown = {
        fromNetwork,
        fromOutside,
        mutualConnections,
        directConnections,
      };

      // Calculer les types de profils OneFive
      const profileTypeCounts: Record<string, number> = {};
      for (const view of profileViews) {
        const viewer = viewerMap.get(view.viewerId);
        const roles = viewer?.ecosystemRoles || [];
        if (roles.length > 0) {
          // Compter tous les rôles, pas seulement le premier
          for (const role of roles) {
            profileTypeCounts[role] = (profileTypeCounts[role] || 0) + 1;
          }
        } else {
          profileTypeCounts['Other'] = (profileTypeCounts['Other'] || 0) + 1;
        }
      }

      // Calculer le total des compteurs pour les pourcentages
      const totalRoleCounts = Object.values(profileTypeCounts).reduce(
        (sum, count) => sum + count,
        0,
      );

      const onefiveProfileTypes: ProfileTypeCount[] = Object.entries(
        profileTypeCounts,
      )
        .map(([type, count]) => ({
          type,
          count,
          percentage:
            totalRoleCounts > 0
              ? Math.round((count / totalRoleCounts) * 1000) / 10
              : 0,
          color: ECOSYSTEM_ROLE_CONFIG[type]?.color || 'bg-gray-50',
          description:
            ECOSYSTEM_ROLE_CONFIG[type]?.description || 'Autres profils',
        }))
        .sort((a, b) => b.count - a.count);

      // Calculer les visiteurs par pays
      const countryCounts: Record<string, number> = {};
      for (const view of profileViews) {
        const viewer = viewerMap.get(view.viewerId);
        const country = viewer?.countryCode || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }

      // Mapper les codes pays vers les noms
      const countryCodeToName: Record<string, string> = {
        FR: 'France',
        DE: 'Allemagne',
        GB: 'Royaume-Uni',
        NL: 'Pays-Bas',
        ES: 'Espagne',
        IT: 'Italie',
        BE: 'Belgique',
        CH: 'Suisse',
        US: 'États-Unis',
        CA: 'Canada',
        Unknown: 'Inconnu',
      };

      const topCountries: CountryVisitors[] = Object.entries(countryCounts)
        .map(([countryCode, count]) => ({
          country: countryCodeToName[countryCode] || countryCode,
          count,
          percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Récupérer les visiteurs récents (limité à 8)
      const recentViewsUnique = new Map<string, (typeof profileViews)[0]>();
      for (const view of profileViews) {
        if (!recentViewsUnique.has(view.viewerId)) {
          recentViewsUnique.set(view.viewerId, view);
        }
        if (recentViewsUnique.size >= 8) break;
      }

      const recentVisitors: RecentVisitor[] = await Promise.all(
        Array.from(recentViewsUnique.values()).map(async (view) => {
          const viewer = viewerMap.get(view.viewerId);
          if (!viewer) {
            return null;
          }
          const isConnected = connectionIds.has(viewer.id);

          // Calculer les connexions mutuelles
          let mutualConnectionsCount = 0;
          if (!isConnected) {
            let viewerConnectionIds = viewerConnectionsCache.get(viewer.id);

            if (!viewerConnectionIds) {
              const viewerConnections = await this.prisma.relationship.findMany(
                {
                  where: {
                    OR: [{ requesterId: viewer.id }, { accepterId: viewer.id }],
                    status: 'ACCEPTED',
                  },
                  select: { requesterId: true, accepterId: true },
                },
              );

              viewerConnectionIds = new Set(
                viewerConnections.flatMap((r) =>
                  r.requesterId === viewer.id
                    ? [r.accepterId]
                    : r.accepterId === viewer.id
                      ? [r.requesterId]
                      : [],
                ),
              );
              viewerConnectionsCache.set(viewer.id, viewerConnectionIds);
            }

            mutualConnectionsCount = [...connectionIds].filter((id) =>
              viewerConnectionIds!.has(id),
            ).length;
          }

          // Construire le titre
          const experience = viewer.experiences[0];
          const title = experience
            ? `${experience.title} @ ${experience.company}`
            : null;

          // Récupérer l'URL de l'avatar
          const avatarUrl = viewer.avatar?.id
            ? await this.fileUrlUtils.getFileUrl(
                viewer.avatar.id,
                this.storageService,
              )
            : null;

          return {
            id: viewer.id,
            name: `${viewer.firstName} ${viewer.lastName}`,
            firstName: viewer.firstName,
            lastName: viewer.lastName,
            title,
            avatar: avatarUrl,
            visitedAt: formatTimeAgo(view.createdAt),
            isFromNetwork: isConnected || mutualConnectionsCount > 0,
            mutualConnections: mutualConnectionsCount,
            ecosystemRoles: viewer.ecosystemRoles || [],
          };
        }),
      );

      // Filtrer les null values
      const filteredRecentVisitors = recentVisitors.filter(
        (v): v is RecentVisitor => v !== null,
      );

      return {
        total,
        thisWeek,
        thisMonth,
        networkBreakdown,
        topCountries,
        recentVisitors: filteredRecentVisitors,
        onefiveProfileTypes,
      };
    } catch (error) {
      this.logger.error('Failed to get visitors analytics', {
        transactionId,
        error,
      });
      throw error;
    }
  }

  @Log()
  async getEngagementAnalytics({
    transactionId,
    userId,
    timeRange = TimeRange.THIRTY_DAYS,
    skip = 0,
    limit = 10,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
  }: {
    transactionId: string;
    userId: string;
    timeRange?: TimeRange;
    skip?: number;
    limit?: number;
    search?: string;
    sortBy?: 'date' | 'views' | 'likes' | 'comments' | 'shares';
    sortOrder?: 'asc' | 'desc';
  }): Promise<EngagementAnalyticsResponseDto> {
    try {
      // Récupérer le profil de l'utilisateur
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      const profileId = userProfile.id;
      const startDate = this.getDateRangeFromTimeRange(timeRange);

      // Récupérer les posts de l'utilisateur avec les compteurs
      const postWhereClause: any = {
        profileId,
        createdAt: { gte: startDate },
      };

      // Récupérer les discussions de l'utilisateur avec les compteurs
      const discussionWhereClause: any = {
        profileId,
        createdAt: { gte: startDate },
      };

      if (search) {
        postWhereClause.content = {
          contains: search,
          mode: 'insensitive',
        };
        discussionWhereClause.OR = [
          { question: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Construire l'ordre de tri
      let orderBy: any = { createdAt: 'desc' };
      if (sortBy === 'date') {
        orderBy = { createdAt: sortOrder };
      }

      // Récupérer tous les posts pour les totaux
      const allPosts = await this.prisma.post.findMany({
        where: { profileId, createdAt: { gte: startDate } },
        select: {
          id: true,
          _count: {
            select: {
              views: true,
              reactions: true,
              comments: { where: { parentId: null } },
              reposts: true,
            },
          },
        },
      });

      // Récupérer toutes les discussions pour les totaux
      const allDiscussions = await this.prisma.discussion.findMany({
        where: { profileId, createdAt: { gte: startDate } },
        select: {
          id: true,
          _count: {
            select: {
              views: true,
              reactions: true,
              answers: true,
              upvotes: true,
            },
          },
        },
      });

      // Calculer les totaux posts
      const totalPosts = allPosts.length;
      const postViews = allPosts.reduce((sum, p) => sum + p._count.views, 0);
      const postLikes = allPosts.reduce(
        (sum, p) => sum + p._count.reactions,
        0,
      );
      const postComments = allPosts.reduce(
        (sum, p) => sum + p._count.comments,
        0,
      );
      const postShares = allPosts.reduce((sum, p) => sum + p._count.reposts, 0);

      // Calculer les totaux discussions
      const totalDiscussions = allDiscussions.length;
      const discussionViews = allDiscussions.reduce(
        (sum, d) => sum + d._count.views,
        0,
      );
      const discussionLikes = allDiscussions.reduce(
        (sum, d) => sum + d._count.reactions + d._count.upvotes,
        0,
      );
      const discussionComments = allDiscussions.reduce(
        (sum, d) => sum + d._count.answers,
        0,
      );

      // Totaux combinés
      const totalContent = totalPosts + totalDiscussions;
      const totalViews = postViews + discussionViews;
      const totalLikes = postLikes + discussionLikes;
      const totalComments = postComments + discussionComments;
      const totalShares = postShares; // Les discussions n'ont pas de partages
      const averageEngagementRate =
        totalViews > 0
          ? Math.round(
              ((totalLikes + totalComments + totalShares) / totalViews) * 1000,
            ) / 10
          : 0;

      // Récupérer les posts paginés avec les détails
      const posts = await this.prisma.post.findMany({
        where: postWhereClause,
        orderBy,
        select: {
          id: true,
          content: true,
          createdAt: true,
          _count: {
            select: {
              views: true,
              reactions: true,
              comments: { where: { parentId: null } },
              reposts: true,
            },
          },
        },
      });

      // Récupérer les discussions paginées avec les détails
      const discussions = await this.prisma.discussion.findMany({
        where: discussionWhereClause,
        orderBy,
        select: {
          id: true,
          question: true,
          content: true,
          createdAt: true,
          _count: {
            select: {
              views: true,
              reactions: true,
              answers: true,
              upvotes: true,
            },
          },
        },
      });

      // === Batch-fetch all post/discussion view data to avoid N+1 queries ===
      const allPostIds = posts.map((p) => p.id);
      const allDiscussionIds = discussions.map((d) => d.id);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        allPostViewsByDay,
        allPostViewers,
        allDiscussionViewsByDay,
        allDiscussionViewers,
      ] = await Promise.all([
        allPostIds.length > 0
          ? this.prisma.postView.findMany({
              where: {
                postId: { in: allPostIds },
                createdAt: { gte: sevenDaysAgo },
              },
              select: { postId: true, createdAt: true },
            })
          : Promise.resolve([]),
        allPostIds.length > 0
          ? this.prisma.postView.findMany({
              where: { postId: { in: allPostIds } },
              select: {
                postId: true,
                viewer: { select: { ecosystemRoles: true } },
              },
            })
          : Promise.resolve([]),
        allDiscussionIds.length > 0
          ? this.prisma.discussionView.findMany({
              where: {
                discussionId: { in: allDiscussionIds },
                createdAt: { gte: sevenDaysAgo },
              },
              select: { discussionId: true, createdAt: true },
            })
          : Promise.resolve([]),
        allDiscussionIds.length > 0
          ? this.prisma.discussionView.findMany({
              where: { discussionId: { in: allDiscussionIds } },
              select: {
                discussionId: true,
                viewer: { select: { ecosystemRoles: true } },
              },
            })
          : Promise.resolve([]),
      ]);

      // Group post views by postId
      const postViewsByDayMap = new Map<string, typeof allPostViewsByDay>();
      for (const view of allPostViewsByDay) {
        const existing = postViewsByDayMap.get(view.postId) || [];
        existing.push(view);
        postViewsByDayMap.set(view.postId, existing);
      }
      const postViewersMap = new Map<string, typeof allPostViewers>();
      for (const view of allPostViewers) {
        const existing = postViewersMap.get(view.postId) || [];
        existing.push(view);
        postViewersMap.set(view.postId, existing);
      }

      // Group discussion views by discussionId
      const discViewsByDayMap = new Map<
        string,
        typeof allDiscussionViewsByDay
      >();
      for (const view of allDiscussionViewsByDay) {
        const existing = discViewsByDayMap.get(view.discussionId) || [];
        existing.push(view);
        discViewsByDayMap.set(view.discussionId, existing);
      }
      const discViewersMap = new Map<string, typeof allDiscussionViewers>();
      for (const view of allDiscussionViewers) {
        const existing = discViewersMap.get(view.discussionId) || [];
        existing.push(view);
        discViewersMap.set(view.discussionId, existing);
      }

      const roleColors: Record<string, string> = {
        FOUNDER: '#5E6AD2',
        BUSINESS_ANGEL: '#EC4899',
        VENTURE_CAPITALIST: '#F43F5E',
        INSTITUTIONAL_INVESTOR: '#8B5CF6',
        MENTOR: '#6366F1',
        STRATEGIC_ADVISOR: '#10B981',
        STUDENT_ENTREPRENEUR: '#3B82F6',
        SERVICE_PROVIDER: '#F59E0B',
        MEDIA: '#06B6D4',
        INCUBATOR_ACCELERATOR: '#A855F7',
        RECRUITER_HR: '#EF4444',
        OTHER: '#94A3B8',
      };

      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

      const buildViewTrend = (viewsByDay: { createdAt: Date }[]) => {
        const viewTrend = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayViews = viewsByDay.filter((v) => {
            const viewDate = new Date(v.createdAt);
            return (
              viewDate.getDate() === date.getDate() &&
              viewDate.getMonth() === date.getMonth() &&
              viewDate.getFullYear() === date.getFullYear()
            );
          });
          viewTrend.push({
            day: dayNames[date.getDay()],
            views: dayViews.length,
          });
        }
        return viewTrend;
      };

      const buildByRole = (
        viewers: { viewer: { ecosystemRoles: string[] } }[],
      ) => {
        const roleCounts: Record<string, number> = {};
        for (const view of viewers) {
          const roles = view.viewer.ecosystemRoles || [];
          if (roles.length > 0) {
            for (const role of roles) {
              roleCounts[role] = (roleCounts[role] || 0) + 1;
            }
          } else {
            roleCounts['OTHER'] = (roleCounts['OTHER'] || 0) + 1;
          }
        }
        return Object.entries(roleCounts)
          .map(([role, count]) => ({
            role,
            count,
            color: roleColors[role] || '#94A3B8',
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      };

      // Enrichir les posts (NO additional queries - uses batched data)
      const enrichedPosts: PostEngagementStats[] = posts.map((post) => {
        const viewsByDay = postViewsByDayMap.get(post.id) || [];
        const viewers = postViewersMap.get(post.id) || [];

        const viewTrend = buildViewTrend(viewsByDay);
        const byRole = buildByRole(viewers);

        const views = post._count.views;
        const engagementRate =
          views > 0
            ? Math.round(
                ((post._count.reactions +
                  post._count.comments +
                  post._count.reposts) /
                  views) *
                  1000,
              ) / 10
            : 0;

        const visibleContent = extractVisibleContent(post.content);
        const title =
          visibleContent.length > 50
            ? visibleContent.substring(0, 50) + '...'
            : visibleContent;

        return {
          id: post.id,
          title,
          content: post.content,
          views: post._count.views,
          likes: post._count.reactions,
          comments: post._count.comments,
          shares: post._count.reposts,
          date: post.createdAt.toISOString().split('T')[0],
          type: 'post' as const,
          details: {
            viewTrend,
            audience: {
              byRole,
              bySeniority: [],
            },
            engagementRate,
          },
        };
      });

      // Enrichir les discussions (NO additional queries - uses batched data)
      const enrichedDiscussions: PostEngagementStats[] = discussions.map(
        (discussion) => {
          const viewsByDay = discViewsByDayMap.get(discussion.id) || [];
          const viewers = discViewersMap.get(discussion.id) || [];

          const viewTrend = buildViewTrend(viewsByDay);
          const byRole = buildByRole(viewers);

          const views = discussion._count.views;
          const engagementRate =
            views > 0
              ? Math.round(
                  ((discussion._count.reactions +
                    discussion._count.upvotes +
                    discussion._count.answers) /
                    views) *
                    1000,
                ) / 10
              : 0;

          const title =
            discussion.question.length > 50
              ? discussion.question.substring(0, 50) + '...'
              : discussion.question;

          return {
            id: discussion.id,
            title,
            content: discussion.content || discussion.question,
            views: discussion._count.views,
            likes: discussion._count.reactions + discussion._count.upvotes,
            comments: discussion._count.answers,
            shares: 0,
            date: discussion.createdAt.toISOString().split('T')[0],
            type: 'discussion' as const,
            details: {
              viewTrend,
              audience: {
                byRole,
                bySeniority: [],
              },
              engagementRate,
            },
          };
        },
      );

      // Combiner posts et discussions
      const allContent = [...enrichedPosts, ...enrichedDiscussions];

      // Trier par le champ spécifié
      if (sortBy === 'date') {
        allContent.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
      } else {
        allContent.sort((a, b) => {
          const valA = a[sortBy as keyof PostEngagementStats] as number;
          const valB = b[sortBy as keyof PostEngagementStats] as number;
          return sortOrder === 'desc' ? valB - valA : valA - valB;
        });
      }

      // Appliquer la pagination après le tri
      const paginatedContent = allContent.slice(skip, skip + limit);

      // Calculer les données hebdomadaires
      const weeklyData = await this.getWeeklyEngagementData({
        profileId,
        startDate,
      });

      return {
        posts: paginatedContent,
        weeklyData,
        totalPosts,
        totalDiscussions,
        totalContent,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        averageEngagementRate,
      };
    } catch (error) {
      this.logger.error('Failed to get engagement analytics', {
        transactionId,
        error,
      });
      throw error;
    }
  }

  private async getWeeklyEngagementData({
    profileId,
    startDate,
  }: {
    profileId: string;
    startDate: Date;
  }): Promise<WeeklyDataItem[]> {
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const numWeeks = Math.ceil(
      (now.getTime() - startDate.getTime()) / msPerWeek,
    );
    const weeksToShow = Math.min(numWeeks, 8);

    // Build week ranges
    const weekRanges = Array.from({ length: weeksToShow }, (_, idx) => {
      const i = weeksToShow - 1 - idx;
      const weekEnd = new Date(now.getTime() - i * msPerWeek);
      const weekStart = new Date(weekEnd.getTime() - msPerWeek);
      return { weekStart, weekEnd, label: `Sem ${idx + 1}` };
    });

    // Execute ALL weeks in parallel, each week doing ALL 10 counts in parallel
    // 80 sequential queries → ~10 parallel queries (DB connection pool is the bottleneck)
    const weeklyData = await Promise.all(
      weekRanges.map(async ({ weekStart, weekEnd, label }) => {
        const dateFilter = { gte: weekStart, lt: weekEnd };

        const [
          postViews,
          discussionViews,
          newPosts,
          newDiscussions,
          postReactions,
          postComments,
          discussionReactions,
          discussionUpvotes,
          discussionAnswers,
          newConnections,
        ] = await Promise.all([
          this.prisma.postView.count({
            where: { post: { profileId }, createdAt: dateFilter },
          }),
          this.prisma.discussionView.count({
            where: { discussion: { profileId }, createdAt: dateFilter },
          }),
          this.prisma.post.count({
            where: { profileId, createdAt: dateFilter },
          }),
          this.prisma.discussion.count({
            where: { profileId, createdAt: dateFilter },
          }),
          this.prisma.postReaction.count({
            where: { post: { profileId }, createdAt: dateFilter },
          }),
          this.prisma.postComment.count({
            where: { post: { profileId }, createdAt: dateFilter },
          }),
          this.prisma.discussionReaction.count({
            where: { discussion: { profileId }, createdAt: dateFilter },
          }),
          this.prisma.discussionUpvote.count({
            where: { discussion: { profileId }, createdAt: dateFilter },
          }),
          this.prisma.discussionAnswer.count({
            where: { discussion: { profileId }, createdAt: dateFilter },
          }),
          this.prisma.relationship.count({
            where: {
              OR: [{ requesterId: profileId }, { accepterId: profileId }],
              status: 'ACCEPTED',
              updatedAt: dateFilter,
            },
          }),
        ]);

        return {
          week: label,
          views: postViews + discussionViews,
          connections: newConnections,
          posts: newPosts,
          discussions: newDiscussions,
          engagement:
            postReactions +
            postComments +
            discussionReactions +
            discussionUpvotes +
            discussionAnswers,
        };
      }),
    );

    return weeklyData;
  }

  @Log()
  async getOverviewAnalytics({
    transactionId,
    userId,
    timeRange = TimeRange.THIRTY_DAYS,
  }: {
    transactionId: string;
    userId: string;
    timeRange?: TimeRange;
  }): Promise<OverviewAnalyticsResponseDto> {
    try {
      // Récupérer le profil de l'utilisateur
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        include: {
          socials: { select: { id: true } },
          experiences: { select: { id: true } },
          educations: { select: { id: true } },
        },
      });

      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      // Calculer le score de complétion du profil (0-100)
      const calculateProfileCompletion = (): number => {
        let score = 0;
        const weights = {
          firstName: 10,
          lastName: 10,
          bio: 15,
          avatar: 10,
          cover: 5,
          highlight: 10,
          skills: 10,
          location: 10,
          socials: 5,
          experiences: 10,
          educations: 5,
        };

        if (userProfile.firstName) score += weights.firstName;
        if (userProfile.lastName) score += weights.lastName;
        if (userProfile.bio && userProfile.bio.length > 10)
          score += weights.bio;
        if (userProfile.avatarId) score += weights.avatar;
        if (userProfile.coverId) score += weights.cover;
        if (userProfile.highlight) score += weights.highlight;
        if (userProfile.skills && userProfile.skills.length > 0)
          score += weights.skills;
        if (userProfile.city && userProfile.countryCode)
          score += weights.location;
        if (userProfile.socials && userProfile.socials.length > 0)
          score += weights.socials;
        if (userProfile.experiences && userProfile.experiences.length > 0)
          score += weights.experiences;
        if (userProfile.educations && userProfile.educations.length > 0)
          score += weights.educations;

        return score;
      };

      const profileCompletionScore = calculateProfileCompletion();
      const profileId = userProfile.id;
      const startDate = this.getDateRangeFromTimeRange(timeRange);

      // Calculer la période précédente pour comparer
      const periodDuration = Date.now() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodDuration);

      // Helper pour générer les données du graphique (dernières 24 valeurs)
      // Optimisé : 24 requêtes en parallèle au lieu de séquentielles
      const generateChartData = async (
        countFn: (start: Date, end: Date) => Promise<number>,
      ): Promise<ChartDataPoint[]> => {
        const now = Date.now();
        const intervalDuration = periodDuration / 24;

        const intervals = Array.from({ length: 24 }, (_, idx) => {
          const i = 23 - idx;
          const intervalEnd = new Date(now - i * intervalDuration);
          const intervalStart = new Date(
            intervalEnd.getTime() - intervalDuration,
          );
          return { intervalStart, intervalEnd };
        });

        const values = await Promise.all(
          intervals.map(({ intervalStart, intervalEnd }) =>
            countFn(intervalStart, intervalEnd),
          ),
        );

        return values.map((value) => ({ value }));
      };

      // Calculer le changement en pourcentage
      const calculateChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 1000) / 10;
      };

      // === Batch ALL current/previous/total counts in parallel ===
      const [
        currentProfileViews,
        previousProfileViews,
        currentConnections,
        previousConnections,
        totalConnections,
        currentPosts,
        previousPosts,
        totalPosts,
        currentDiscussions,
        previousDiscussions,
        totalDiscussions,
        currentPostReactions,
        currentPostComments,
        currentDiscussionReactions,
        currentDiscussionAnswers,
        previousPostReactions,
        previousPostComments,
        previousDiscussionReactions,
        previousDiscussionAnswers,
        profileViewsWithRoles,
        previousProfileViewsWithRoles,
      ] = await Promise.all([
        // Profile views
        this.prisma.profileView.count({
          where: { viewedById: profileId, createdAt: { gte: startDate } },
        }),
        this.prisma.profileView.count({
          where: {
            viewedById: profileId,
            createdAt: { gte: previousStartDate, lt: startDate },
          },
        }),
        // Connections
        this.prisma.relationship.count({
          where: {
            OR: [{ requesterId: profileId }, { accepterId: profileId }],
            status: 'ACCEPTED',
            updatedAt: { gte: startDate },
          },
        }),
        this.prisma.relationship.count({
          where: {
            OR: [{ requesterId: profileId }, { accepterId: profileId }],
            status: 'ACCEPTED',
            updatedAt: { gte: previousStartDate, lt: startDate },
          },
        }),
        this.prisma.relationship.count({
          where: {
            OR: [{ requesterId: profileId }, { accepterId: profileId }],
            status: 'ACCEPTED',
          },
        }),
        // Posts
        this.prisma.post.count({
          where: { profileId, createdAt: { gte: startDate } },
        }),
        this.prisma.post.count({
          where: {
            profileId,
            createdAt: { gte: previousStartDate, lt: startDate },
          },
        }),
        this.prisma.post.count({
          where: { profileId },
        }),
        // Discussions
        this.prisma.discussion.count({
          where: { profileId, createdAt: { gte: startDate } },
        }),
        this.prisma.discussion.count({
          where: {
            profileId,
            createdAt: { gte: previousStartDate, lt: startDate },
          },
        }),
        this.prisma.discussion.count({
          where: { profileId },
        }),
        // Engagement current
        this.prisma.postReaction.count({
          where: { post: { profileId }, createdAt: { gte: startDate } },
        }),
        this.prisma.postComment.count({
          where: { post: { profileId }, createdAt: { gte: startDate } },
        }),
        this.prisma.discussionReaction.count({
          where: { discussion: { profileId }, createdAt: { gte: startDate } },
        }),
        this.prisma.discussionAnswer.count({
          where: { discussion: { profileId }, createdAt: { gte: startDate } },
        }),
        // Engagement previous
        this.prisma.postReaction.count({
          where: {
            post: { profileId },
            createdAt: { gte: previousStartDate, lt: startDate },
          },
        }),
        this.prisma.postComment.count({
          where: {
            post: { profileId },
            createdAt: { gte: previousStartDate, lt: startDate },
          },
        }),
        this.prisma.discussionReaction.count({
          where: {
            discussion: { profileId },
            createdAt: { gte: previousStartDate, lt: startDate },
          },
        }),
        this.prisma.discussionAnswer.count({
          where: {
            discussion: { profileId },
            createdAt: { gte: previousStartDate, lt: startDate },
          },
        }),
        // Top profile type (current + previous period views with roles)
        this.prisma.profileView.findMany({
          where: { viewedById: profileId, createdAt: { gte: startDate } },
          select: { viewer: { select: { ecosystemRoles: true } } },
        }),
        this.prisma.profileView.findMany({
          where: {
            viewedById: profileId,
            createdAt: { gte: previousStartDate, lt: startDate },
          },
          select: { viewer: { select: { ecosystemRoles: true } } },
        }),
      ]);

      // === Generate ALL chart data in parallel ===
      const [
        profileViewsChartData,
        connectionsChartData,
        postsChartData,
        discussionsChartData,
        engagementChartData,
      ] = await Promise.all([
        generateChartData(async (start, end) =>
          this.prisma.profileView.count({
            where: {
              viewedById: profileId,
              createdAt: { gte: start, lt: end },
            },
          }),
        ),
        generateChartData(async (start, end) =>
          this.prisma.relationship.count({
            where: {
              OR: [{ requesterId: profileId }, { accepterId: profileId }],
              status: 'ACCEPTED',
              updatedAt: { gte: start, lt: end },
            },
          }),
        ),
        generateChartData(async (start, end) =>
          this.prisma.post.count({
            where: { profileId, createdAt: { gte: start, lt: end } },
          }),
        ),
        generateChartData(async (start, end) =>
          this.prisma.discussion.count({
            where: { profileId, createdAt: { gte: start, lt: end } },
          }),
        ),
        generateChartData(async (start, end) => {
          const [reactions, comments, discReactions, answers] =
            await Promise.all([
              this.prisma.postReaction.count({
                where: {
                  post: { profileId },
                  createdAt: { gte: start, lt: end },
                },
              }),
              this.prisma.postComment.count({
                where: {
                  post: { profileId },
                  createdAt: { gte: start, lt: end },
                },
              }),
              this.prisma.discussionReaction.count({
                where: {
                  discussion: { profileId },
                  createdAt: { gte: start, lt: end },
                },
              }),
              this.prisma.discussionAnswer.count({
                where: {
                  discussion: { profileId },
                  createdAt: { gte: start, lt: end },
                },
              }),
            ]);
          return reactions + comments + discReactions + answers;
        }),
      ]);

      // === Build metrics ===
      const profileViews: OverviewMetric = {
        current: currentProfileViews,
        previous: previousProfileViews,
        change: calculateChange(currentProfileViews, previousProfileViews),
        chartData: profileViewsChartData,
      };

      const connections: OverviewMetric = {
        current: totalConnections,
        previous: totalConnections - currentConnections,
        change: calculateChange(currentConnections, previousConnections),
        chartData: connectionsChartData,
      };

      const posts: OverviewMetric = {
        current: totalPosts,
        previous: totalPosts - currentPosts,
        change: calculateChange(currentPosts, previousPosts),
        chartData: postsChartData,
      };

      const discussions: OverviewMetric = {
        current: totalDiscussions,
        previous: totalDiscussions - currentDiscussions,
        change: calculateChange(currentDiscussions, previousDiscussions),
        chartData: discussionsChartData,
      };

      const currentEngagement =
        currentPostReactions +
        currentPostComments +
        currentDiscussionReactions +
        currentDiscussionAnswers;
      const previousEngagement =
        previousPostReactions +
        previousPostComments +
        previousDiscussionReactions +
        previousDiscussionAnswers;

      const engagement: OverviewMetric = {
        current: currentEngagement,
        previous: previousEngagement,
        change: calculateChange(currentEngagement, previousEngagement),
        chartData: engagementChartData,
      };

      // === TOP PROFILE TYPE (visiteurs) ===
      const roleCounts: Record<string, number> = {};
      for (const view of profileViewsWithRoles) {
        const roles = view.viewer.ecosystemRoles || [];
        if (roles.length > 0) {
          for (const role of roles) {
            roleCounts[role] = (roleCounts[role] || 0) + 1;
          }
        }
      }

      const topRole = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0];

      const previousRoleCounts: Record<string, number> = {};
      for (const view of previousProfileViewsWithRoles) {
        const roles = view.viewer.ecosystemRoles || [];
        if (roles.length > 0) {
          for (const role of roles) {
            previousRoleCounts[role] = (previousRoleCounts[role] || 0) + 1;
          }
        }
      }

      const previousTopRoleCount = topRole
        ? previousRoleCounts[topRole[0]] || 0
        : 0;

      const topProfileType = {
        type: topRole ? topRole[0] : 'N/A',
        count: topRole ? topRole[1] : 0,
        change: topRole ? calculateChange(topRole[1], previousTopRoleCount) : 0,
      };

      // === NETWORK QUALITY ===
      // Basé sur le ratio de connexions mutuelles et la diversité des rôles
      const connectionsList = await this.prisma.relationship.findMany({
        where: {
          OR: [{ requesterId: profileId }, { accepterId: profileId }],
          status: 'ACCEPTED',
        },
        select: {
          requester: { select: { ecosystemRoles: true } },
          accepter: { select: { ecosystemRoles: true } },
          requesterId: true,
          accepterId: true,
        },
      });

      const uniqueRoles = new Set<string>();
      for (const conn of connectionsList) {
        const other =
          conn.requesterId === profileId ? conn.accepter : conn.requester;
        const roles = other.ecosystemRoles || [];
        roles.forEach((r) => uniqueRoles.add(r));
      }

      // Score de qualité = diversité des rôles (max 12 rôles différents = 100)
      const diversityScore = Math.min((uniqueRoles.size / 12) * 100, 100);
      const connectionScore = Math.min((totalConnections / 100) * 100, 100);
      const networkQualityScore = Math.round(
        diversityScore * 0.6 + connectionScore * 0.4,
      );

      const networkQuality: OverviewMetric = {
        current: networkQualityScore,
        previous: Math.max(0, networkQualityScore - 5), // Approximation
        change: 5.2, // Placeholder, would need historical tracking
        chartData: Array.from({ length: 24 }, (_, i) => ({
          value: Math.max(
            0,
            networkQualityScore - 10 + Math.floor(Math.random() * 15),
          ),
        })),
      };

      // === SEARCH APPEARANCES ===
      // Pour l'instant, on utilise une approximation basée sur les vues de profil
      const searchAppearancesValue = Math.round(currentProfileViews * 1.5);
      const previousSearchAppearances = Math.round(previousProfileViews * 1.5);

      const searchAppearances: OverviewMetric = {
        current: searchAppearancesValue,
        previous: previousSearchAppearances,
        change: calculateChange(
          searchAppearancesValue,
          previousSearchAppearances,
        ),
        chartData: profileViewsChartData.map((d) => ({
          value: Math.round(d.value * 1.5),
        })),
      };

      // === PROFILE COMPLETION ===
      const profileCompletion: OverviewMetric = {
        current: profileCompletionScore,
        previous: Math.max(0, profileCompletionScore - 2),
        change: 2.1, // Placeholder
        chartData: Array.from({ length: 24 }, (_, i) => ({
          value: Math.max(0, profileCompletionScore - 5 + Math.floor(i / 3)),
        })),
      };

      // === WEEKLY DATA ===
      const weeklyData = await this.getWeeklyProfileViewsData({
        profileId,
        startDate,
      });

      return {
        profileViews,
        connections,
        posts,
        discussions,
        engagement,
        topProfileType,
        networkQuality,
        searchAppearances,
        profileCompletion,
        weeklyData,
      };
    } catch (error) {
      this.logger.error('Failed to get overview analytics', {
        transactionId,
        error,
      });
      throw error;
    }
  }

  private async getWeeklyProfileViewsData({
    profileId,
    startDate,
  }: {
    profileId: string;
    startDate: Date;
  }): Promise<Array<{ week: string; views: number }>> {
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const numWeeks = Math.ceil(
      (now.getTime() - startDate.getTime()) / msPerWeek,
    );
    const weeksToShow = Math.min(numWeeks, 8);

    // Build week ranges and execute all counts in parallel
    const weekRanges = Array.from({ length: weeksToShow }, (_, idx) => {
      const i = weeksToShow - 1 - idx;
      const weekEnd = new Date(now.getTime() - i * msPerWeek);
      const weekStart = new Date(weekEnd.getTime() - msPerWeek);
      return { weekStart, weekEnd, label: `Sem ${idx + 1}` };
    });

    const weeklyData = await Promise.all(
      weekRanges.map(async ({ weekStart, weekEnd, label }) => {
        const views = await this.prisma.profileView.count({
          where: {
            viewedById: profileId,
            createdAt: { gte: weekStart, lt: weekEnd },
          },
        });
        return { week: label, views };
      }),
    );

    return weeklyData;
  }
}
