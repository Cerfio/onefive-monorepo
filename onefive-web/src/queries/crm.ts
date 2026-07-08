import { api } from '@/utils/kyInstance';

export const CRM_STAGES = [
  { value: 'NEW', label: 'Nouveau' },
  { value: 'CONTACTED', label: 'Contacté' },
  { value: 'MEETING', label: 'Rendez-vous' },
  { value: 'NEGOTIATION', label: 'En discussion' },
  { value: 'CLOSED', label: 'Conclu' },
] as const;

export interface CrmPipelineEntry {
  contactProfileId: string;
  stage: string;
  name: string;
  highlight: string | null;
  avatar: string | null;
}

export interface CrmContactData {
  stage: string;
  notes: { id: string; content: string; createdAt: string }[];
  reminders: { id: string; reason: string; dueAt: string; done: boolean }[];
}

export const getCrmPipeline = async (): Promise<CrmPipelineEntry[]> => {
  const res = await api.get('crm/pipeline');
  const json = (await res.json()) as { data: CrmPipelineEntry[] };
  return json.data;
};

export const getCrmContact = async (contactId: string): Promise<CrmContactData> => {
  const res = await api.get(`crm/contact/${contactId}`);
  const json = (await res.json()) as { data: CrmContactData };
  return json.data;
};

export const setCrmStage = async (contactId: string, stage: string): Promise<void> => {
  await api.put(`crm/contact/${contactId}/stage`, { json: { stage } });
};

export const addCrmNote = async (contactId: string, content: string): Promise<void> => {
  await api.post(`crm/contact/${contactId}/notes`, { json: { content } });
};

export const addCrmReminder = async (
  contactId: string,
  reason: string,
  dueAt: string,
): Promise<void> => {
  await api.post(`crm/contact/${contactId}/reminders`, { json: { reason, dueAt } });
};

export const completeCrmReminder = async (reminderId: string): Promise<void> => {
  await api.put(`crm/reminders/${reminderId}/complete`);
};
