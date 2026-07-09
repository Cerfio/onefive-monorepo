import { api } from '@/utils/kyInstance';

export interface PostDraft {
  id: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export const listDrafts = async (): Promise<PostDraft[]> => {
  const res = await api.get('post-drafts');
  const json = (await res.json()) as { success: boolean; data: PostDraft[] };
  return json.success ? json.data ?? [] : [];
};

export const createDraft = async (
  content: string,
  tags: string[],
): Promise<PostDraft> => {
  const res = await api.post('post-drafts', { json: { content, tags } });
  const json = (await res.json()) as { success: boolean; data: PostDraft };
  return json.data;
};

export const updateDraft = async (
  id: string,
  content: string,
  tags: string[],
): Promise<PostDraft> => {
  const res = await api.put(`post-drafts/${id}`, { json: { content, tags } });
  const json = (await res.json()) as { success: boolean; data: PostDraft };
  return json.data;
};

export const deleteDraft = async (id: string): Promise<void> => {
  await api.delete(`post-drafts/${id}`);
};
