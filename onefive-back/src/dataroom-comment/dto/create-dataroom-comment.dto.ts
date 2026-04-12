import { IsString, IsOptional, IsInt, MaxLength, Min } from 'class-validator';

export class CreateDataroomCommentDto {
  @IsString()
  @MaxLength(3000)
  content: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNumber?: number;

  @IsOptional()
  @IsString()
  parentId?: string;
}

export class CreateDataroomCommentResponseDto {
  success: boolean;
  data: {
    id: string;
    content: string;
    pageNumber: number | null;
    parentId: string | null;
    createdAt: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: { url: string | null } | null;
    };
  };
}
