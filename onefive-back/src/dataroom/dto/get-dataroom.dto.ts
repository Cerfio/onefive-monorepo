import { IsString, IsOptional } from 'class-validator';

export class GetDataroomDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  dataroomId: string;

  @IsString()
  profileId: string;
}

export class GetDataroomResponseDto {
  data: {
    startupId: string;
    name?: string;
    logo?: string;
    viewCount: number;
    documentCount: number;
    lastActivity: string | null;
    categories: GetDataroomCategoryDto[];
    groups: GetDataroomGroupDto[];
    files: GetDataroomFileDto[];
    totalViews: number;
    uniqueViewers: number;
    avgSessionDuration: number;
  };
}

export class GetDataroomCategoryDto {
  name: string;
  fileCount: number;
  id: string;
}

export class GroupInvitationDto {
  id: string;
  email: string;
  name: string;
  status: string;
  invitedAt: string;
}

export class GetDataroomGroupDto {
  id: string;
  name: string;
  memberCount: number;
  invitations: GroupInvitationDto[];
}

export class GetDataroomFileDto {
  category: string;
  viewCount: number;
  size: number;
  name: string;
  id: string;
  storageId: string;
  uploadedBy: string;
  createdAt: string;
  mimetype: string;
}
