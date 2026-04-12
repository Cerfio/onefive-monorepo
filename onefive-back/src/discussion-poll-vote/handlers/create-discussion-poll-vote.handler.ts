import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionPollVoteService } from '../discussion-poll-vote.service';
import { ProfileService } from '../../profile/profile.service';
import { DiscussionService } from '../../discussion/discussion.service';
import { DiscussionType } from '@prisma/client';
import {
  DiscussionPollVoteInvalidOptionException,
  DiscussionPollVoteDiscussionNotFoundException,
} from '../discussion-poll-vote.exception';

@Injectable()
export class CreateDiscussionPollVoteHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionPollVoteService: DiscussionPollVoteService,
    private readonly profileService: ProfileService,
    private readonly discussionService: DiscussionService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    discussionId,
    options,
  }: {
    transactionId: string;
    userId: string;
    discussionId: string;
    options: string[];
  }) {
    // Récupérer le profil
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    // Vérifier que la discussion existe et est un sondage
    const discussion = await this.discussionService.get({
      transactionId,
      where: { id: discussionId },
      select: {
        id: true,
        type: true,
        options: true,
      },
    });

    if (!discussion) {
      DiscussionPollVoteDiscussionNotFoundException.throw(this.logger, {
        transactionId,
        discussionId,
      });
    }

    if (
      discussion.type !== DiscussionType.POLL &&
      discussion.type !== DiscussionType.POLL_MULTIPLE
    ) {
      DiscussionPollVoteInvalidOptionException.throw(this.logger, {
        transactionId,
        discussionId,
        message: 'Discussion is not a poll',
      });
    }

    // Vérifier que toutes les options existent dans le sondage
    const invalidOptions = options.filter(
      (option) => !discussion.options.includes(option),
    );
    if (invalidOptions.length > 0) {
      DiscussionPollVoteInvalidOptionException.throw(this.logger, {
        transactionId,
        discussionId,
        invalidOptions,
        message: 'Invalid options provided',
      });
    }

    // Pour les sondages à choix unique, vérifier qu'une seule option est fournie
    if (discussion.type === DiscussionType.POLL && options.length > 1) {
      DiscussionPollVoteInvalidOptionException.throw(this.logger, {
        transactionId,
        discussionId,
        message: 'Single choice poll allows only one option',
      });
    }

    // Supprimer les votes existants pour ce profil et cette discussion
    await this.discussionPollVoteService.deleteMany({
      transactionId,
      where: {
        discussionId,
        profileId: profile.id,
      },
    });

    // Créer les nouveaux votes
    if (options.length > 0) {
      await this.discussionPollVoteService.createMany({
        transactionId,
        data: options.map((option) => ({
          discussionId,
          profileId: profile.id,
          option,
        })),
      });
    }
  }
}
