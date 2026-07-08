import { IsString, IsOptional } from 'class-validator';

export class GetFileAnalyticsDto {
  @IsString()
  fileId: string;

  @IsOptional()
  @IsString()
  period?: '24h' | '7d' | '30d' | '90d' = '7d';

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class GetFileAnalyticsResponseDto {
  data: {
    fileId: string;
    fileName: string;
    totalViews: number;
    uniqueViewers: number;
    avgTimeSpent: number;
    downloadCount: number;
    category: string;
    uploadedAt: string;
    lastViewed: string;
    userActivity?: Array<{
      userId: string;
      userName: string;
      userEmail?: string;
      userRole?: string;
      lastActivity: string;
      totalTime: number;
      timeSpentFormatted?: string;
    }>;
    pageViews?: Array<{ page: number; views: number; avgTimeSeconds: number }>;
  };
}
