/**
 * Export centralise des enums et configurations liés au profil
 */
export { ProfileRole } from './profile-role.enum';
export {
  PROFILE_ROLE_METADATA,
  getProfileRoleMetadata,
  getAllProfileRoles,
  isValidProfileRole,
  getAllProfileRolesWithMetadata,
  getProfileRoleLabel,
  getProfileRoleLabels,
  getGenderedShortLabel,
  getGenderedLongLabel,
  type ProfileRoleMetadata,
  type GenderPreference,
} from './profile-role.config';

