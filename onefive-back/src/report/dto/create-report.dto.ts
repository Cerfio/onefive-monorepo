import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export enum ReportResourceTypeDto {
  PROFILE = 'PROFILE',
  POST = 'POST',
  POST_COMMENT = 'POST_COMMENT',
  POST_COMMENT_REPLY = 'POST_COMMENT_REPLY',
  DISCUSSION = 'DISCUSSION',
  DISCUSSION_ANSWER = 'DISCUSSION_ANSWER',
  DISCUSSION_ANSWER_REPLY = 'DISCUSSION_ANSWER_REPLY',
}

export enum ReportReasonDto {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  MISINFORMATION = 'MISINFORMATION',
  IMPERSONATION = 'IMPERSONATION',
  OTHER = 'OTHER',
}

/**
 * Accepte UUID (Post/Discussion/Profile) et CUID (Post, PostComment, PostCommentReply).
 * UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * CUID: c + 24 caractères alphanumériques
 */
const UUID_OR_CUID_REGEX = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|c[a-z0-9]{24})$/i;

export class CreateReportDto {
  @IsEnum(ReportResourceTypeDto)
  resourceType: ReportResourceTypeDto;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(UUID_OR_CUID_REGEX, {
    message: 'resourceId must be a valid UUID or CUID',
  })
  resourceId: string;

  @IsEnum(ReportReasonDto)
  reason: ReportReasonDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
