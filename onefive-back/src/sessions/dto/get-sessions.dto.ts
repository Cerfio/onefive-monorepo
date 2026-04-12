export class SessionItemDto {
  id: string;
  deviceInfo: string;
  location: string;
  ipAddress: string;
  userAgent: string;
  lastUsage: Date;
  createdAt: Date;
  isCurrentSession: boolean;
}

export class GetSessionsResponseDto {
  sessions: SessionItemDto[];
  total: number;
}
