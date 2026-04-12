import { IsUUID } from 'class-validator';

export class DiscussionAnswerUpvoteParamDto {
  @IsUUID()
  discussionId: string;

  @IsUUID()
  answerId: string;
}
