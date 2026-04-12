import { IsUUID } from 'class-validator';

export class DiscussionAnswerReplyUpvoteParamDto {
  @IsUUID()
  discussionId: string;

  @IsUUID()
  answerId: string;

  @IsUUID()
  replyId: string;
}
