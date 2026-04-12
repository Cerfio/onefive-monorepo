/**
 * Configuration des rôles de profil dans l'écosystème Onefive
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

export interface ProfileRoleMetadata {
  emoji: string;
  color: string;
  shortLabelMale: string;
  shortLabelFemale: string;
  longLabelMale: string;
  longLabelFemale: string;
}

export type GenderPreference = 'MALE' | 'FEMALE' | 'OTHER';

/**
 * Métadonnées pour chaque rôle de profil
 */
export const PROFILE_ROLE_METADATA: Record<ProfileRole, ProfileRoleMetadata> = {
  [ProfileRole.FOUNDER]: {
    emoji: '🚀',
    color: '#E67E22',
    shortLabelMale: 'Fondateur de Startup',
    shortLabelFemale: 'Fondatrice de Startup',
    longLabelMale:
      "Créateur ou co-créateur d'une startup, en phase d'idéation, de lancement ou de croissance.",
    longLabelFemale:
      "Créatrice ou co-créatrice d'une startup, en phase d'idéation, de lancement ou de croissance.",
  },
  [ProfileRole.BUSINESS_ANGEL]: {
    emoji: '💰',
    color: '#2ECC71',
    shortLabelMale: 'Business Angel',
    shortLabelFemale: 'Business Angel',
    longLabelMale:
      'Investisseur individuel qui finance des startups en amorçage avec ses fonds personnels.',
    longLabelFemale:
      'Investisseuse individuelle qui finance des startups en amorçage avec ses fonds personnels.',
  },
  [ProfileRole.VENTURE_CAPITALIST]: {
    emoji: '📊',
    color: '#3498DB',
    shortLabelMale: 'Venture Capitalist',
    shortLabelFemale: 'Venture Capitalist',
    longLabelMale:
      "Membre d'un fonds de capital-risque qui investit dans des startups à différents stades (amorçage, Série A, etc.).",
    longLabelFemale:
      "Membre d'un fonds de capital-risque qui investit dans des startups à différents stades (amorçage, Série A, etc.).",
  },
  [ProfileRole.INSTITUTIONAL_INVESTOR]: {
    emoji: '🏢',
    color: '#A569BD',
    shortLabelMale: 'Investisseur Institutionnel',
    shortLabelFemale: 'Investisseuse Institutionnelle',
    longLabelMale:
      'Représentant un fonds corporate, un family office, ou un Limited Partner (LP) investissant dans des fonds de capital-risque ou directement dans des startups matures.',
    longLabelFemale:
      'Représentante un fonds corporate, un family office, ou un Limited Partner (LP) investissant dans des fonds de capital-risque ou directement dans des startups matures.',
  },
  [ProfileRole.MENTOR]: {
    emoji: '🧑‍🏫',
    color: '#D35400',
    shortLabelMale: 'Mentor Startup',
    shortLabelFemale: 'Mentore Startup',
    longLabelMale:
      'Conseille régulièrement des fondateurs sur leur stratégie, leur vision, ou leur exécution, offrant un accompagnement continu.',
    longLabelFemale:
      'Conseille régulièrement des fondateurs sur leur stratégie, leur vision, ou leur exécution, offrant un accompagnement continu.',
  },
  [ProfileRole.STRATEGIC_ADVISOR]: {
    emoji: '��',
    color: '#B8860B',
    shortLabelMale: 'Conseiller Stratégique',
    shortLabelFemale: 'Conseillère Stratégique',
    longLabelMale:
      'Expert intervenant ponctuellement sur des enjeux clés (produit, finance, juridique, international, etc.) pour apporter une expertise spécifique.',
    longLabelFemale:
      'Experte intervenant ponctuellement sur des enjeux clés (produit, finance, juridique, international, etc.) pour apporter une expertise spécifique.',
  },
  [ProfileRole.STUDENT_ENTREPRENEUR]: {
    emoji: '📚',
    color: '#9B59B6',
    shortLabelMale: 'Étudiant Entrepreneur',
    shortLabelFemale: 'Étudiante Entrepreneuse',
    longLabelMale:
      'En formation, développant ou souhaitant développer un projet entrepreneurial.',
    longLabelFemale:
      'En formation, développant ou souhaitant développer un projet entrepreneurial.',
  },
  [ProfileRole.SERVICE_PROVIDER]: {
    emoji: '🔧',
    color: '#1ABC9C',
    shortLabelMale: 'Prestataire pour Startups',
    shortLabelFemale: 'Prestataire pour Startups',
    longLabelMale:
      'Fournit des services spécialisés aux startups (design, développement, juridique, comptabilité, marketing, etc.).',
    longLabelFemale:
      'Fournit des services spécialisés aux startups (design, développement, juridique, comptabilité, marketing, etc.).',
  },
  [ProfileRole.MEDIA]: {
    emoji: '📰',
    color: '#C0392B',
    shortLabelMale: 'Journaliste / Créateur Média',
    shortLabelFemale: 'Journaliste / Créatrice Média',
    longLabelMale:
      "Produit du contenu, couvre l'actualité ou valorise des initiatives et acteurs de l'univers startup.",
    longLabelFemale:
      "Produit du contenu, couvre l'actualité ou valorise des initiatives et actrices de l'univers startup.",
  },
  [ProfileRole.INCUBATOR_ACCELERATOR]: {
    emoji: '🏘️',
    color: '#7F8C8D',
    shortLabelMale: "Structure d'Accompagnement",
    shortLabelFemale: "Structure d'Accompagnement",
    longLabelMale:
      "Fait partie d'une structure qui soutient des startups (programmes, coaching, réseau, financement…).",
    longLabelFemale:
      "Fait partie d'une structure qui soutient des startups (programmes, coaching, réseau, financement…).",
  },
  [ProfileRole.RECRUITER_HR]: {
    emoji: '🧑‍💼',
    color: '#5D6D7E',
    shortLabelMale: 'Recruteur / RH Startup',
    shortLabelFemale: 'Recruteuse / RH Startup',
    longLabelMale:
      'Spécialiste du recrutement ou des ressources humaines, aidant les startups à trouver les bons talents et à structurer leurs équipes.',
    longLabelFemale:
      'Spécialiste du recrutement ou des ressources humaines, aidant les startups à trouver les bons talents et à structurer leurs équipes.',
  },
  [ProfileRole.OTHER]: {
    emoji: '👤',
    color: '#95A5A6',
    shortLabelMale: "Autre Profil de l'Écosystème",
    shortLabelFemale: "Autre Profil de l'Écosystème",
    longLabelMale:
      "Votre rôle ne rentre pas dans une case précise ? Ce badge vous permet de rester visible dans l'écosystème Onefive tout en ayant un rôle unique ou hybride.",
    longLabelFemale:
      "Votre rôle ne rentre pas dans une case précise ? Ce badge vous permet de rester visible dans l'écosystème Onefive tout en ayant un rôle unique ou hybride.",
  },
};

/**
 * Récupère les métadonnées d'un rôle
 */
export function getProfileRoleMetadata(role: ProfileRole): ProfileRoleMetadata {
  return PROFILE_ROLE_METADATA[role];
}

/**
 * Récupère le label court genré d'un rôle
 * @param role - Le rôle de profil
 * @param genderPreference - La préférence de genre ('MALE', 'FEMALE', 'OTHER')
 * @returns Le label court adapté au genre (OTHER est traité comme MALE)
 */
export function getGenderedShortLabel(
  role: ProfileRole,
  genderPreference: GenderPreference,
): string {
  const metadata = PROFILE_ROLE_METADATA[role];
  if (!metadata) return '';

  if (genderPreference === 'FEMALE') {
    return metadata.shortLabelFemale;
  }
  // MALE et OTHER utilisent le masculin
  return metadata.shortLabelMale;
}

/**
 * Récupère le label long genré d'un rôle
 * @param role - Le rôle de profil
 * @param genderPreference - La préférence de genre ('MALE', 'FEMALE', 'OTHER')
 * @returns Le label long adapté au genre (OTHER est traité comme MALE)
 */
export function getGenderedLongLabel(
  role: ProfileRole,
  genderPreference: GenderPreference,
): string {
  const metadata = PROFILE_ROLE_METADATA[role];
  if (!metadata) return '';

  if (genderPreference === 'FEMALE') {
    return metadata.longLabelFemale;
  }
  // MALE et OTHER utilisent le masculin
  return metadata.longLabelMale;
}

/**
 * Récupère tous les rôles disponibles
 */
export function getAllProfileRoles(): ProfileRole[] {
  return Object.values(ProfileRole);
}

/**
 * Vérifie si une valeur est un rôle valide
 */
export function isValidProfileRole(value: string): value is ProfileRole {
  return Object.values(ProfileRole).includes(value as ProfileRole);
}
