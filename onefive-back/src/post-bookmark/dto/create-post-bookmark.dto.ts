import { IsString } from 'class-validator';

export class CreatePostBookmarkParamDto {
  @IsString()
  postId: string;
}
