import { IsString, IsOptional } from 'class-validator';

export class GetUserTimelineDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class GetDataroomTimelineDto {
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class GetUserTimelineResponseDto {
  data: {
    userId: string;
    userName: string;
    timeline: Array<{
      timestamp: string;
      eventType: string;
      fileId: string;
      fileName: string;
      action: string;
      duration?: number;
    }>;
  };
}

export class GetDataroomTimelineResponseDto {
  data: {
    dataroomId: string;
    timeline: Array<{
      timestamp: string;
      eventType: string;
      userId: string;
      userName: string;
      fileId: string;
      fileName: string;
      action: string;
      duration?: number;
    }>;
  };
}
