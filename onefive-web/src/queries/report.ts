import { api } from '@/utils/kyInstance';

export type ReportResourceType =
  | 'PROFILE'
  | 'POST'
  | 'POST_COMMENT'
  | 'POST_COMMENT_REPLY'
  | 'DISCUSSION'
  | 'DISCUSSION_ANSWER'
  | 'DISCUSSION_ANSWER_REPLY';

export type ReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'INAPPROPRIATE_CONTENT'
  | 'MISINFORMATION'
  | 'IMPERSONATION'
  | 'OTHER';

export async function createReport({
  resourceType,
  resourceId,
  reason,
  message,
}: {
  resourceType: ReportResourceType;
  resourceId: string;
  reason: ReportReason;
  message?: string;
}) {
  const response = await api
    .post('reports', {
      json: { resourceType, resourceId, reason, message },
    })
    .json<{ success: boolean; data: { id: string } }>();

  return response.data;
}

export type FeedbackType = 'BUG' | 'SUGGESTION' | 'COMMENT' | 'FUNCTIONAL';

export async function createFeedback({
  type,
  message,
  url,
  browserInfo,
  screenshot,
}: {
  type: FeedbackType;
  message: string;
  url?: string;
  browserInfo?: string;
  screenshot?: File;
}) {
  const formData = new FormData();
  formData.append('type', type);
  formData.append('message', message);
  if (url) formData.append('url', url);
  if (browserInfo) formData.append('browserInfo', browserInfo);
  if (screenshot) formData.append('screenshot', screenshot);

  const response = await api
    .post('feedback', { body: formData })
    .json<{ success: boolean; data: { id: string } }>();

  return response.data;
}
