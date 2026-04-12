export const ADMIN_COOKIE_NAME = 'admin_token';

export const ADMIN_PERMISSIONS = {
  ADMIN_USERS_READ: 'admin.users.read',
  ADMIN_USERS_MANAGE: 'admin.users.manage',
  ADMIN_CONTENT_MODERATE: 'admin.content.moderate',
  ADMIN_WAITLIST_MANAGE: 'admin.waitlist.manage',
  ADMIN_SPOTLIGHT_MANAGE: 'admin.spotlight.manage',
  ADMIN_ADMINS_MANAGE: 'admin.admins.manage',
} as const;

export type AdminPermissionKey =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];
