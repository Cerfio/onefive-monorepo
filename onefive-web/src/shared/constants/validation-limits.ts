/**
 * Constantes de validation partagées
 *
 * ⚠️ IMPORTANT : Ces limites DOIVENT être synchronisées avec le backend
 * Fichier backend : onefive-back/src/common/constants/validation-limits.constants.ts
 *
 * Toute modification côté backend DOIT être répliquée ici.
 */

export const VALIDATION_LIMITS = {
  // ==================== AUTH ====================
  AUTH: {
    EMAIL_MAX: 255,
    PASSWORD_NON_EMPTY_MIN: 1,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 128,
    STATE_MIN: 32,
    RESET_CODE_LENGTH: 4,
  },

  // ==================== PROFILE ====================
  PROFILE: {
    FIRST_NAME_MAX: 50,
    LAST_NAME_MAX: 50,
    TITLE_MAX: 100,
    BIO_MAX: 500,
    HIGHLIGHT_MAX: 200,
    SKILLS_MAX_COUNT: 20,
    SKILLS_ITEM_MAX: 50,
    INTERESTS_MAX_COUNT: 20,
    INTERESTS_ITEM_MAX: 50,
    SOCIALS_MAX_COUNT: 5,
    SOCIAL_TITLE_MAX: 50,
    SOCIAL_URL_MAX: 500,
    ACHIEVEMENT_TITLE_MAX: 100,
    ACHIEVEMENT_DESCRIPTION_MAX: 500,
    ACHIEVEMENT_DATE_MAX: 50,
  },

  // ==================== POST ====================
  POST: {
    CONTENT_MAX: 3000,
    MEDIAS_MAX_COUNT: 10,
    MEDIA_URL_MAX: 500,
    MEDIA_MIME_TYPE_MAX: 100,
    MEDIA_FILE_NAME_MAX: 255,
    TAGS_MAX_COUNT: 10,
    TAG_MAX: 50,
    FEED_LIMIT_MAX: 50,
  },

  // ==================== POST COMMENT ====================
  POST_COMMENT: {
    CONTENT_MAX: 3000,
  },

  // ==================== DISCUSSION ====================
  DISCUSSION: {
    QUESTION_MIN: 5,
    QUESTION_MAX: 200,
    CONTENT_MAX: 2000,
    CONTEXT_MAX: 255,
    OPTIONS_MIN_COUNT: 2,
    OPTIONS_MAX_COUNT: 10,
    OPTION_MAX: 100,
    TAGS_MIN_COUNT: 1,
    TAGS_MAX_COUNT: 5,
    TAG_MAX: 50,
    POLL_VOTE_OPTIONS_MIN: 1,
  },

  // ==================== DISCUSSION ANSWER ====================
  DISCUSSION_ANSWER: {
    CONTENT_MIN: 1,
    CONTENT_MAX: 2000,
  },

  // ==================== DISCUSSION REPLY ====================
  DISCUSSION_REPLY: {
    CONTENT_MIN: 1,
    CONTENT_MAX: 2000,
  },

  // ==================== MESSAGING ====================
  MESSAGING: {
    CONVERSATION_NAME_MAX: 100,
    MESSAGE_CONTENT_MAX: 5000,
    INITIAL_MESSAGE_MAX: 2000,
    REACTION_EMOJI_MAX: 10,
  },

  // ==================== EXPERIENCE ====================
  EXPERIENCE: {
    TITLE_MIN: 1,
    TITLE_MAX: 100,
    COMPANY_MIN: 1,
    COMPANY_MAX: 100,
    DOMAIN_MAX: 100,
    CITY_MAX: 100,
    DESCRIPTION_MAX: 2000,
    URL_LINKEDIN_MAX: 500,
    TAGS_MAX_COUNT: 10,
    TAG_MAX: 50,
    MAX_EXPERIENCES_PER_PROFILE: 10,
  },

  // ==================== EDUCATION ====================
  EDUCATION: {
    DEGREE_MIN: 1,
    DEGREE_MAX: 100,
    SCHOOL_MIN: 1,
    SCHOOL_MAX: 100,
    DOMAIN_MAX: 100,
    CITY_MAX: 100,
    DESCRIPTION_MAX: 2000,
    URL_LINKEDIN_MAX: 500,
    TAGS_MAX_COUNT: 10,
    TAG_MAX: 50,
    MAX_EDUCATIONS_PER_PROFILE: 10,
  },

  // ==================== STARTUP ====================
  STARTUP: {
    NAME_MIN: 1,
    NAME_MAX: 100,
    TAGLINE_MAX: 200,
    DESCRIPTION_MAX: 2000,
    WEBSITE_MAX: 500,
    LINKEDIN_MAX: 500,
    LOGO_MAX: 500,
    COVER_IMAGE_MAX: 500,
    CITY_MIN: 1,
    CITY_MAX: 100,
    COUNTRY_CODE_LENGTH: 2,
    CATEGORIES_MAX_COUNT: 5,
    CATEGORY_MAX: 50,
    INVITATIONS_MAX_COUNT: 10,
    POSITION_MAX: 100,
    FIRST_NAME_MAX: 100,
    LAST_NAME_MAX: 100,
    MESSAGE_MAX: 1000,
    INVITATION_MESSAGE_MAX: 500,
    FUNDING_TEXT_MAX: 50,
    FUNDING_DEADLINE_MAX: 100,
    FUNDING_DECK_URL_MAX: 500,
    FUNDING_INVESTORS_MAX_COUNT: 20,
    FUNDING_INVESTOR_NAME_MAX: 100,
    EQUITY_MIN: 0,
    EQUITY_MAX: 100,
  },

  // ==================== DATAROOM ====================
  DATAROOM: {
    CATEGORY_NAME_MAX: 100,
    FILE_NAME_MAX: 255,
    FILE_MIME_TYPE_MAX: 100,
    FILES_MAX_COUNT: 20, // Batch upload limit
    EVENT_TYPE_MAX: 50,
    EVENTS_MAX_COUNT: 50, // Batch tracking limit
  },

  // ==================== SEARCH ====================
  SEARCH: {
    QUERY_MIN: 2,
    QUERY_MAX: 200,
    LIMIT_MIN: 1,
    LIMIT_MAX: 100,
    SEARCHBAR_LIMIT_MAX: 50,
  },

  // ==================== LINKEDIN SYNC ====================
  LINKEDIN_SYNC: {
    LOGO_URL_MAX: 1000,
    SELECTED_EXPERIENCES_MAX: 20,
    SELECTED_EDUCATION_MAX: 20,
    SELECTED_SKILLS_MAX: 30,
    SELECTED_SKILL_MAX: 100,
  },

  // ==================== IDENTIFIERS ====================
  IDENTIFIERS: {
    PROFILE_ID_MIN: 1,
    PROFILE_ID_MAX: 100,
    STARTUP_ID_MIN: 1,
    STARTUP_ID_MAX: 100,
  },

  // ==================== BATCH OPERATIONS ====================
  BATCH: {
    EXPERIENCES_MAX: 20,
    EDUCATIONS_MAX: 20,
    DELETE_IDS_MAX: 20,
  },

  // ==================== PAGINATION ====================
  PAGINATION: {
    SKIP_MIN: 0,
    TAKE_MIN: 1,
    TAKE_MAX: 100,
  },
} as const;

/**
 * Messages d'erreur pour la validation côté client
 */
export const VALIDATION_MESSAGES = {
  // Auth
  EMAIL_INVALID: 'Email invalide',
  PASSWORD_TOO_SHORT: `Le mot de passe doit contenir au moins ${VALIDATION_LIMITS.AUTH.PASSWORD_MIN} caractères`,
  PASSWORD_TOO_LONG: `Le mot de passe ne peut pas dépasser ${VALIDATION_LIMITS.AUTH.PASSWORD_MAX} caractères`,
  PASSWORD_WEAK: 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un symbole',

  // Profile
  FIRST_NAME_REQUIRED: 'Le prénom est obligatoire',
  FIRST_NAME_TOO_LONG: `Le prénom ne peut pas dépasser ${VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX} caractères`,
  LAST_NAME_REQUIRED: 'Le nom est obligatoire',
  LAST_NAME_TOO_LONG: `Le nom ne peut pas dépasser ${VALIDATION_LIMITS.PROFILE.LAST_NAME_MAX} caractères`,
  TITLE_REQUIRED: 'Le titre est obligatoire',
  TITLE_TOO_LONG: `Le titre ne peut pas dépasser ${VALIDATION_LIMITS.PROFILE.TITLE_MAX} caractères`,
  BIO_REQUIRED: 'La bio est obligatoire',
  BIO_TOO_LONG: `La bio ne peut pas dépasser ${VALIDATION_LIMITS.PROFILE.BIO_MAX} caractères`,
  SKILLS_TOO_MANY: `Maximum ${VALIDATION_LIMITS.PROFILE.SKILLS_MAX_COUNT} compétences`,
  INTERESTS_TOO_MANY: `Maximum ${VALIDATION_LIMITS.PROFILE.INTERESTS_MAX_COUNT} centres d'intérêt`,

  // Post
  CONTENT_TOO_LONG: `Le contenu ne peut pas dépasser ${VALIDATION_LIMITS.POST.CONTENT_MAX} caractères`,
  MEDIAS_TOO_MANY: `Maximum ${VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT} médias par post`,
  TAGS_TOO_MANY: `Maximum ${VALIDATION_LIMITS.POST.TAGS_MAX_COUNT} tags par post`,

  // Discussion
  QUESTION_REQUIRED: 'La question est obligatoire',
  QUESTION_TOO_SHORT: `La question doit contenir au moins ${VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN} caractères`,
  QUESTION_TOO_LONG: `La question ne peut pas dépasser ${VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX} caractères`,
  CONTENT_TOO_LONG_DISCUSSION: `Le contenu ne peut pas dépasser ${VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX} caractères`,
  OPTIONS_TOO_FEW: `Minimum ${VALIDATION_LIMITS.DISCUSSION.OPTIONS_MIN_COUNT} options pour un sondage`,
  OPTIONS_TOO_MANY: `Maximum ${VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT} options pour un sondage`,
  TAGS_TOO_FEW: `Minimum ${VALIDATION_LIMITS.DISCUSSION.TAGS_MIN_COUNT} tag`,
  TAGS_TOO_MANY_DISCUSSION: `Maximum ${VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT} tags`,

  // Messaging
  MESSAGE_TOO_LONG: `Le message ne peut pas dépasser ${VALIDATION_LIMITS.MESSAGING.MESSAGE_CONTENT_MAX} caractères`,

  // Experience/Education
  TITLE_REQUIRED_EXP: 'Le titre est obligatoire',
  COMPANY_REQUIRED: "L'entreprise est obligatoire",
  DEGREE_REQUIRED: 'Le diplôme est obligatoire',
  SCHOOL_REQUIRED: "L'école est obligatoire",
  DESCRIPTION_TOO_LONG: `La description ne peut pas dépasser ${VALIDATION_LIMITS.EXPERIENCE.DESCRIPTION_MAX} caractères`,
  MAX_EXPERIENCES_REACHED: `Maximum ${VALIDATION_LIMITS.EXPERIENCE.MAX_EXPERIENCES_PER_PROFILE} expériences par profil`,
  MAX_EDUCATIONS_REACHED: `Maximum ${VALIDATION_LIMITS.EDUCATION.MAX_EDUCATIONS_PER_PROFILE} formations par profil`,

  // Startup
  NAME_REQUIRED: 'Le nom est obligatoire',
  TAGLINE_REQUIRED: 'Le slogan est obligatoire',
  DESCRIPTION_REQUIRED: 'La description est obligatoire',
  CATEGORIES_TOO_MANY: `Maximum ${VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT} catégories`,
  INVITATIONS_TOO_MANY: `Maximum ${VALIDATION_LIMITS.STARTUP.INVITATIONS_MAX_COUNT} invitations lors de la création`,

  // DataRoom
  CATEGORY_NAME_REQUIRED: 'Le nom de la catégorie est obligatoire',
  CATEGORY_NAME_TOO_LONG: `Le nom ne peut pas dépasser ${VALIDATION_LIMITS.DATAROOM.CATEGORY_NAME_MAX} caractères`,
  FILES_TOO_MANY: `Maximum ${VALIDATION_LIMITS.DATAROOM.FILES_MAX_COUNT} fichiers par upload`,
  EVENTS_TOO_MANY: `Maximum ${VALIDATION_LIMITS.DATAROOM.EVENTS_MAX_COUNT} événements par batch`,

  // Search
  QUERY_TOO_SHORT: `La recherche doit contenir au moins ${VALIDATION_LIMITS.SEARCH.QUERY_MIN} caractères`,

  // Batch
  BATCH_TOO_LARGE: 'Trop d\'opérations à la fois',
} as const;

/**
 * Type helper pour les limites
 */
export type ValidationLimits = typeof VALIDATION_LIMITS;
export type ValidationMessages = typeof VALIDATION_MESSAGES;
