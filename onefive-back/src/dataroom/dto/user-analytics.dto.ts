import { IsString, IsOptional } from 'class-validator';

export class GetUserAnalyticsDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  period?: '24h' | '7d' | '30d' | '90d' = '7d';

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class GetUserAnalyticsResponseDto {
  data: {
    userId: string;
    userName: string;
    userEmail?: string;
    userRole?: string;
    userGroup?: string;
    userAvatar?: string | null;
    totalViews: number;
    totalTimeSpent: number;
    totalTimeFormatted?: string;
    filesViewed: number;
    lastActivity: string;
    avgSessionDuration: number;
    fileActivity?: Array<{
      fileId: string;
      fileName: string;
      views: number;
      timeSpent: number;
      timeSpentFormatted?: string;
    }>;
  };
}
