import { IsUUID } from 'class-validator';

export class GetDiscussionParamDto {
  @IsUUID()
  discussionId: string;
}
