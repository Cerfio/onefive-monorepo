import { IsString } from 'class-validator';

export class DeletePostBookmarkParamDto {
  @IsString()
  postId: string;
}
