import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationCategory, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service helper pour créer facilement des notifications depuis n'importe quel module
 */
@Injectable()
export class NotificationHelperService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Notification quand quelqu'un like un post
   */
  async notifyPostLike({
    postId,
    actorProfileId,
    actorName,
  }: {
    postId: string;
    actorProfileId: string;
    actorName: string;
  }) {
    // Récupérer le propriétaire du post
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { profileId: true },
    });

    if (!post || post.profileId === actorProfileId) {
      // Ne pas notifier si c'est son propre post
      return null;
    }

    return this.notificationService.create({
      profileId: post.profileId,
      type: NotificationType.LIKE,
      category: NotificationCategory.ENGAGEMENT,
      title: actorName,
      message: 'a aimé votre publication',
      actorId: actorProfileId,
      entityId: postId,
      entityType: 'POST',
    });
  }

  /**
   * Notification quand quelqu'un commente un post
   */
  async notifyPostComment({
    postId,
    commentId,
    actorProfileId,
    actorName,
    isReply = false,
    parentCommentAuthorId,
    parentId,
  }: {
    postId: string;
    commentId: string;
    actorProfileId: string;
    actorName: string;
    isReply?: boolean;
    parentCommentAuthorId?: string;
    parentId?: string;
  }) {
    const notifications = [];

    // Récupérer le propriétaire du post
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { profileId: true },
    });

    // Notifier le propriétaire du post (si ce n'est pas lui qui commente)
    if (post && post.profileId !== actorProfileId) {
      notifications.push(
        this.notificationService.create({
          profileId: post.profileId,
          type: NotificationType.COMMENT,
          category: NotificationCategory.ENGAGEMENT,
          title: actorName,
          message: 'a commenté votre publication',
          actorId: actorProfileId,
          entityId: postId,
          entityType: 'POST',
          data: { commentId },
        }),
      );
    }

    // Si c'est une réponse, notifier aussi l'auteur du commentaire parent
    if (
      isReply &&
      parentCommentAuthorId &&
      parentCommentAuthorId !== actorProfileId
    ) {
      notifications.push(
        this.notificationService.create({
          profileId: parentCommentAuthorId,
          type: NotificationType.COMMENT_REPLY,
          category: NotificationCategory.ENGAGEMENT,
          title: actorName,
          message: 'a répondu à votre commentaire',
          actorId: actorProfileId,
          entityId: commentId,
          entityType: 'COMMENT',
          data: { postId },
        }),
      );
    }

    // Notifier les autres participants du thread (ceux qui ont aussi répondu au même commentaire)
    if (isReply && parentId) {
      // Construire la liste des IDs à exclure (acteur + auteur du parent si défini)
      const excludedProfileIds = parentCommentAuthorId
        ? [actorProfileId, parentCommentAuthorId]
        : [actorProfileId];

      const otherReplies = await this.prisma.postComment.findMany({
        where: {
          parentId: parentId,
          id: { not: commentId }, // Exclure le commentaire actuel
          profileId: {
            notIn: excludedProfileIds, // Exclure l'acteur et l'auteur du parent (déjà notifié)
          },
        },
        select: { profileId: true },
        distinct: ['profileId'],
      });

      for (const reply of otherReplies) {
        notifications.push(
          this.notificationService.create({
            profileId: reply.profileId,
            type: NotificationType.COMMENT_REPLY,
            category: NotificationCategory.ENGAGEMENT,
            title: actorName,
            message: 'a aussi répondu au commentaire',
            actorId: actorProfileId,
            entityId: commentId,
            entityType: 'COMMENT',
            data: { postId, parentId },
          }),
        );
      }
    }

    return Promise.all(notifications);
  }

  /**
   * Notification quand quelqu'un réagit à un commentaire
   */
  async notifyCommentReaction({
    commentId,
    actorProfileId,
    actorName,
  }: {
    commentId: string;
    actorProfileId: string;
    actorName: string;
  }) {
    // Récupérer le propriétaire du commentaire
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
      select: { profileId: true, postId: true, parentId: true },
    });

    if (!comment || comment.profileId === actorProfileId) {
      // Ne pas notifier si c'est son propre commentaire
      return null;
    }

    const message = comment.parentId
      ? 'a réagi à votre réponse'
      : 'a réagi à votre commentaire';

    return this.notificationService.create({
      profileId: comment.profileId,
      type: NotificationType.LIKE,
      category: NotificationCategory.ENGAGEMENT,
      title: actorName,
      message,
      actorId: actorProfileId,
      entityId: commentId,
      entityType: 'COMMENT',
      data: { postId: comment.postId },
    });
  }

  /**
   * Notification quand quelqu'un reposte un post
   */
  async notifyPostRepost({
    originalPostId,
    repostId,
    actorProfileId,
    actorName,
    hasContent,
  }: {
    originalPostId: string;
    repostId: string;
    actorProfileId: string;
    actorName: string;
    hasContent: boolean;
  }) {
    // Récupérer le propriétaire du post original
    const post = await this.prisma.post.findUnique({
      where: { id: originalPostId },
      select: { profileId: true },
    });

    if (!post || post.profileId === actorProfileId) {
      // Ne pas notifier si c'est son propre post
      return null;
    }

    const message = hasContent
      ? 'a reposté votre publication avec un commentaire'
      : 'a reposté votre publication';

    // Si commentaire, redirection vers le repost, sinon vers le post original
    const entityId = hasContent ? repostId : originalPostId;

    return this.notificationService.create({
      profileId: post.profileId,
      type: NotificationType.SHARE,
      category: NotificationCategory.ENGAGEMENT,
      title: actorName,
      message,
      actorId: actorProfileId,
      entityId,
      entityType: 'POST',
      data: { repostId, originalPostId, hasContent },
    });
  }

  /**
   * Notification quand quelqu'un suit un profil
   * Approche LinkedIn : agrégation des notifications de follow récentes (24h)
   *
   * Exemples de messages :
   * - "Jean Dupont a commencé à vous suivre"
   * - "Jean Dupont et 2 autres personnes vous suivent"
   * - "5 personnes vous suivent"
   */
  async notifyFollow({
    followedProfileId,
    followerProfileId,
    followerName,
  }: {
    followedProfileId: string;
    followerProfileId: string;
    followerName: string;
  }) {
    if (followedProfileId === followerProfileId) {
      return null;
    }

    // Fenêtre d'agrégation : 24 heures (comme LinkedIn)
    const aggregationWindow = 24 * 60 * 60 * 1000; // 24h en millisecondes
    const aggregationCutoff = new Date(Date.now() - aggregationWindow);

    // Chercher une notification de follow non lue récente pour ce profil
    const recentFollowNotification = await this.prisma.notification.findFirst({
      where: {
        profileId: followedProfileId,
        type: NotificationType.FOLLOW,
        category: NotificationCategory.ENGAGEMENT,
        read: false, // Seulement les non lues
        createdAt: {
          gte: aggregationCutoff,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Récupérer les données existantes si la notification existe
    const existingData = recentFollowNotification?.data as {
      followers?: Array<{ id: string; name: string; timestamp: string }>;
      count?: number;
    } | null;

    if (recentFollowNotification && existingData?.followers) {
      // Vérifier si ce follower n'est pas déjà dans la liste
      const isAlreadyInList = existingData.followers.some(
        (f) => f.id === followerProfileId,
      );

      if (!isAlreadyInList) {
        // Ajouter le nouveau follower à la liste
        const updatedFollowers = [
          ...existingData.followers,
          {
            id: followerProfileId,
            name: followerName,
            timestamp: new Date().toISOString(),
          },
        ];

        const totalCount = updatedFollowers.length;

        // Générer le message selon le nombre de followers
        let title: string;
        let message: string;

        if (totalCount === 1) {
          // Cas unique : juste le nom
          title = updatedFollowers[0].name;
          message = 'a commencé à vous suivre';
        } else if (totalCount === 2) {
          // Cas deux personnes : "X et Y vous suivent"
          title = updatedFollowers[0].name;
          message = `et ${updatedFollowers[1].name} vous suivent`;
        } else if (totalCount === 3) {
          // Cas trois personnes : "X, Y et Z vous suivent"
          title = updatedFollowers[0].name;
          message = `, ${updatedFollowers[1].name} et ${updatedFollowers[2].name} vous suivent`;
        } else {
          // Cas plusieurs : "X et N autres personnes vous suivent"
          const othersCount = totalCount - 1;
          title = updatedFollowers[0].name;
          message = `et ${othersCount} ${othersCount === 1 ? 'autre personne' : 'autres personnes'} vous suivent`;
        }

        // Mettre à jour la notification existante
        return this.prisma.notification.update({
          where: { id: recentFollowNotification.id },
          data: {
            title,
            message,
            actorId: updatedFollowers[0].id, // Le plus récent en premier
            updatedAt: new Date(),
            data: {
              followers: updatedFollowers,
              count: totalCount,
              aggregated: true,
            },
          },
        });
      } else {
        // Ce follower est déjà dans la liste, ne rien faire
        return null;
      }
    } else {
      // Aucune notification récente, créer une nouvelle notification
      return this.notificationService.create({
        profileId: followedProfileId,
        type: NotificationType.FOLLOW,
        category: NotificationCategory.ENGAGEMENT,
        title: followerName,
        message: 'a commencé à vous suivre',
        actorId: followerProfileId,
        entityId: followerProfileId,
        entityType: 'PROFILE',
        data: {
          followers: [
            {
              id: followerProfileId,
              name: followerName,
              timestamp: new Date().toISOString(),
            },
          ],
          count: 1,
          aggregated: false,
        },
      });
    }
  }

  /**
   * Notification pour une invitation à rejoindre une startup
   */
  async notifyStartupInvitation({
    invitedProfileId,
    inviterProfileId,
    inviterName,
    startupId,
    startupName,
    position,
  }: {
    invitedProfileId: string;
    inviterProfileId: string;
    inviterName: string;
    startupId: string;
    startupName: string;
    position: string;
  }) {
    return this.notificationService.create({
      profileId: invitedProfileId,
      type: NotificationType.STARTUP_INVITATION,
      category: NotificationCategory.INVITATIONS,
      title: startupName,
      message: `vous invite à rejoindre en tant que ${position}`,
      actorId: inviterProfileId,
      entityId: startupId,
      entityType: 'STARTUP',
      data: { inviterName, position },
    });
  }

  /**
   * Notification pour une invitation comme investisseur d'une startup
   */
  async notifyInvestorInvitation({
    invitedProfileId,
    inviterProfileId,
    inviterName,
    startupId,
    startupName,
    investorRecordId,
  }: {
    invitedProfileId: string;
    inviterProfileId: string;
    inviterName: string;
    startupId: string;
    startupName: string;
    investorRecordId: string;
  }) {
    return this.notificationService.create({
      profileId: invitedProfileId,
      type: NotificationType.INVESTOR_INVITATION,
      category: NotificationCategory.INVITATIONS,
      title: startupName,
      message: `vous a ajouté comme investisseur`,
      actorId: inviterProfileId,
      entityId: startupId,
      entityType: 'STARTUP',
      data: { inviterName, investorRecordId },
    });
  }

  /**
   * Notification pour une mention dans un post ou commentaire
   */
  async notifyMention({
    mentionedProfileId,
    actorProfileId,
    actorName,
    entityId,
    entityType,
    context,
  }: {
    mentionedProfileId: string;
    actorProfileId: string;
    actorName: string;
    entityId: string;
    entityType: 'POST' | 'COMMENT';
    context?: string;
  }) {
    if (mentionedProfileId === actorProfileId) {
      return null;
    }

    return this.notificationService.create({
      profileId: mentionedProfileId,
      type: NotificationType.MENTION,
      category: NotificationCategory.ENGAGEMENT,
      title: actorName,
      message:
        entityType === 'POST'
          ? 'vous a mentionné dans une publication'
          : 'vous a mentionné dans un commentaire',
      actorId: actorProfileId,
      entityId,
      entityType,
      data: context ? { context } : undefined,
    });
  }

  /**
   * Notification système générique
   */
  async notifySystem({
    profileId,
    title,
    message,
    entityId,
    entityType,
    data,
  }: {
    profileId: string;
    title: string;
    message: string;
    entityId?: string;
    entityType?: string;
    data?: Prisma.JsonValue;
  }) {
    return this.notificationService.create({
      profileId,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      category: NotificationCategory.SYSTEM,
      title,
      message,
      entityId,
      entityType,
      data,
    });
  }

  /**
   * Notification d'engagement dataroom.
   * Déclenchée quand un investisseur consulte un document pour la première fois,
   * passe un temps significatif sur un fichier, ou télécharge un document.
   */
  async notifyDataroomEngagement({
    ownerProfileId,
    dataroomId,
    dataroomName,
    engagementType,
    actorName,
    actorProfileId,
    details,
  }: {
    ownerProfileId: string;
    dataroomId: string;
    dataroomName: string;
    engagementType:
      | 'first_view'
      | 'high_time_spent'
      | 'document_downloaded'
      | 'multiple_sessions';
    actorName: string;
    actorProfileId?: string;
    details?: { fileName?: string; timeSpent?: number; sessionCount?: number };
  }) {
    if (ownerProfileId === actorProfileId) return null;

    const messages: Record<string, string> = {
      first_view: `a consulté votre dataroom "${dataroomName}" pour la première fois`,
      high_time_spent: details?.fileName
        ? `a passé ${Math.floor((details.timeSpent || 0) / 60)} minutes sur "${details.fileName}"`
        : `a passé un temps significatif sur votre dataroom "${dataroomName}"`,
      document_downloaded: details?.fileName
        ? `a téléchargé "${details.fileName}" depuis "${dataroomName}"`
        : `a téléchargé un document depuis "${dataroomName}"`,
      multiple_sessions: `est revenu consulter "${dataroomName}" (${details?.sessionCount || 0} sessions)`,
    };

    return this.notificationService.create({
      profileId: ownerProfileId,
      type: NotificationType.DATAROOM_ENGAGEMENT,
      category: NotificationCategory.ENGAGEMENT,
      title: actorName,
      message: messages[engagementType],
      actorId: actorProfileId,
      entityId: dataroomId,
      entityType: 'DATAROOM',
      data: { engagementType, ...details },
    });
  }

  /**
   * Notification pour mise à jour de dataroom
   */
  async notifyDataroomUpdate({
    profileId,
    dataroomId,
    dataroomName,
    updateType,
    details,
  }: {
    profileId: string;
    dataroomId: string;
    dataroomName: string;
    updateType: 'document_added' | 'document_updated' | 'access_granted';
    details?: string;
  }) {
    const messages = {
      document_added: 'Nouveau document ajouté',
      document_updated: 'Document mis à jour',
      access_granted: 'Accès accordé',
    };

    return this.notificationService.create({
      profileId,
      type: NotificationType.DATAROOM_UPDATE,
      category: NotificationCategory.SYSTEM,
      title: dataroomName,
      message: `${messages[updateType]}${details ? `: ${details}` : ''}`,
      entityId: dataroomId,
      entityType: 'DATAROOM',
      data: { updateType },
    });
  }

  /**
   * Notification quand une invitation de parrainage est acceptée
   */
  async notifyReferralAccepted({
    referrerProfileId,
    invitedProfileId,
    invitedName,
    referralId,
  }: {
    referrerProfileId: string;
    invitedProfileId: string;
    invitedName: string;
    referralId: string;
  }) {
    return this.notificationService.create({
      profileId: referrerProfileId,
      type: NotificationType.REFERRAL_ACCEPTED,
      category: NotificationCategory.INVITATIONS,
      title: invitedName,
      message: 'a accepté votre invitation et rejoint OneFive',
      actorId: invitedProfileId,
      entityId: referralId,
      entityType: 'REFERRAL',
    });
  }

  /**
   * Notification quand quelqu'un visite un profil
   */
  async notifyProfileView({
    viewedProfileId,
    viewerProfileId,
    viewerName,
  }: {
    viewedProfileId: string;
    viewerProfileId: string;
    viewerName: string;
  }) {
    // Ne pas notifier si c'est son propre profil
    if (viewedProfileId === viewerProfileId) {
      return null;
    }

    // Vérifier si une notification de vue de profil existe déjà récemment (dernières 24h)
    // pour éviter le spam de notifications
    const recentNotification = await this.prisma.notification.findFirst({
      where: {
        profileId: viewedProfileId,
        actorId: viewerProfileId,
        type: NotificationType.PROFILE_VIEW,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 heures
        },
      },
    });

    if (recentNotification) {
      // Une notification récente existe déjà, ne pas en créer une nouvelle
      return null;
    }

    return this.notificationService.create({
      profileId: viewedProfileId,
      type: NotificationType.PROFILE_VIEW,
      category: NotificationCategory.ENGAGEMENT,
      title: viewerName,
      message: 'a consulté votre profil',
      actorId: viewerProfileId,
      entityId: viewerProfileId,
      entityType: 'PROFILE',
    });
  }

  /**
   * Notification quand quelqu'un envoie une demande de connexion
   */
  async notifyConnectionRequest({
    requesterProfileId,
    accepterProfileId,
    requesterName,
  }: {
    requesterProfileId: string;
    accepterProfileId: string;
    requesterName: string;
  }) {
    return this.notificationService.create({
      profileId: accepterProfileId,
      type: NotificationType.CONNECTION_REQUEST,
      category: NotificationCategory.INVITATIONS,
      title: requesterName,
      message: 'vous a envoyé une demande de connexion',
      actorId: requesterProfileId,
      entityId: requesterProfileId,
      entityType: 'PROFILE',
    });
  }

  /**
   * Notification quand quelqu'un accepte une demande de connexion
   */
  async notifyConnectionAccepted({
    accepterProfileId,
    requesterProfileId,
    accepterName,
  }: {
    accepterProfileId: string;
    requesterProfileId: string;
    accepterName: string;
  }) {
    return this.notificationService.create({
      profileId: requesterProfileId,
      type: NotificationType.CONNECTION_REQUEST,
      category: NotificationCategory.INVITATIONS,
      title: accepterName,
      message: 'a accepté votre demande de connexion',
      actorId: accepterProfileId,
      entityId: accepterProfileId,
      entityType: 'PROFILE',
    });
  }
}
