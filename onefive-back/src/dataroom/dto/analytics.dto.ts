import { IsString, IsOptional } from 'class-validator';

export class GetAnalyticsDto {
  @IsOptional()
  @IsString()
  period?: '24h' | '7d' | '30d' | '90d' = '7d';

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class GetAnalyticsResponseDto {
  data: {
    dataroomId: string;
    totalViews: number;
    uniqueViewers: number;
    avgSessionDuration: number;
    topFiles: Array<{
      fileId: string;
      fileName: string;
      views: number;
      uniqueViewers?: number;
    }>;
    userActivity: Array<{
      userId: string;
      userName: string;
      userEmail?: string;
      userRole?: string;
      userGroup?: string;
      userAvatar?: string | null;
      totalViews?: number;
      totalTime?: number;
      uniqueDocuments?: number;
      lastActivity: string;
      documentsViewed?: string[];
    }>;
  };
}
