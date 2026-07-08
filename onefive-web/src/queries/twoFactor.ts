import { api } from '@/utils/kyInstance';

export const getTwoFactorStatus = async (): Promise<{ enabled: boolean }> => {
  const res = await api.get('auth/2fa/status');
  const json = (await res.json()) as { data: { enabled: boolean } };
  return json.data;
};

export const setupTwoFactor = async (): Promise<{ secret: string; otpauthUrl: string }> => {
  const res = await api.post('auth/2fa/setup');
  const json = (await res.json()) as { data: { secret: string; otpauthUrl: string } };
  return json.data;
};

export const enableTwoFactor = async (code: string): Promise<{ backupCodes: string[] }> => {
  const res = await api.post('auth/2fa/enable', { json: { code } });
  const json = (await res.json()) as { data: { backupCodes: string[] } };
  return json.data;
};

export const disableTwoFactor = async (): Promise<void> => {
  await api.post('auth/2fa/disable');
};
