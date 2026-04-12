import { IsUUID } from 'class-validator';

export class DiscussionUpvoteParamDto {
  @IsUUID()
  discussionId: string;
}
