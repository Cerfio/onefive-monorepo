/**
 * Enum des rôles de profil dans l'écosystème Onefive
 * 
 * ⚠️ IMPORTANT: Cet enum doit rester synchronisé avec:
 * - L'enum Prisma ProfileRole dans onefive-back/prisma/schema/profile.prisma
 * - Le fichier de configuration onefive-back/src/profile/profile-role.config.ts
 */
export enum ProfileRole {
  FOUNDER = 'FOUNDER',
  BUSINESS_ANGEL = 'BUSINESS_ANGEL',
  VENTURE_CAPITALIST = 'VENTURE_CAPITALIST',
  INSTITUTIONAL_INVESTOR = 'INSTITUTIONAL_INVESTOR',
  MENTOR = 'MENTOR',
  STRATEGIC_ADVISOR = 'STRATEGIC_ADVISOR',
  STUDENT_ENTREPRENEUR = 'STUDENT_ENTREPRENEUR',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  MEDIA = 'MEDIA',
  INCUBATOR_ACCELERATOR = 'INCUBATOR_ACCELERATOR',
  RECRUITER_HR = 'RECRUITER_HR',
  OTHER = 'OTHER',
}

