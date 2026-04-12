import { IsString, IsOptional, IsIn } from 'class-validator';

export class GetSignedUrlDto {
  @IsString()
  dataroomId: string;

  @IsString()
  fileId: string;

  @IsOptional()
  @IsIn(['view', 'download'])
  action?: 'view' | 'download';

  @IsOptional()
  @IsString()
  transactionId?: string;

  /** Populated by the controller from DataroomMemberGuard */
  member: {
    groupId: string;
    group: {
      hasAllAccess: boolean;
    };
  };
}

export class GetSignedUrlResponseDto {
  data: {
    url: string;
  };
}
