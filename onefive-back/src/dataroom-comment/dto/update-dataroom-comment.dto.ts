import { IsString, MaxLength } from 'class-validator';

export class UpdateDataroomCommentDto {
  @IsString()
  @MaxLength(3000)
  content: string;
}

export class UpdateDataroomCommentResponseDto {
  success: boolean;
  data: {
    id: string;
    content: string;
    updatedAt: string;
  };
}
