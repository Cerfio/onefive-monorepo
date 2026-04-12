import { IsUUID } from 'class-validator';

export class DeleteDiscussionParamDto {
  @IsUUID()
  discussionId: string;
}
