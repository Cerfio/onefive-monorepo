import { SetMetadata } from '@nestjs/common';
import { AdminPermissionKey } from './admin.constants';

export const ADMIN_PERMISSION_METADATA_KEY = 'adminPermissions';

export const RequireAdminPermissions = (...permissions: AdminPermissionKey[]) =>
  SetMetadata(ADMIN_PERMISSION_METADATA_KEY, permissions);
