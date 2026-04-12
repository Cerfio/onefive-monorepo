import { z } from 'zod';

// Schema pour la date LinkedIn
const LinkedInDateSchema = z.object({
  month: z.union([z.string(), z.number()]).optional().nullable(),
  year: z.number().optional().nullable(),
  day: z.number().optional().nullable(),
  text: z.string().optional().nullable(),
});

// Schema pour la localisation
const LinkedInLocationSchema = z
  .object({
    linkedinText: z.string().optional().nullable(),
    countryCode: z.string().optional().nullable(),
    parsed: z
      .object({
        text: z.string().optional().nullable(),
        countryCode: z.string().optional().nullable(),
        regionCode: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        countryFull: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),
  })
  .optional()
  .nullable();

// Schema pour les tailles d'image
const LinkedInImageSizeSchema = z.object({
  url: z.string().url(),
  width: z.number(),
  height: z.number(),
  expiresAt: z.number().optional().nullable(),
});

// Schema pour les images
const LinkedInImageSchema = z
  .object({
    url: z.string().url().optional().nullable(),
    sizes: z.array(LinkedInImageSizeSchema).optional().nullable(),
  })
  .optional()
  .nullable();

// Schema pour le logo de l'entreprise
const LinkedInCompanyLogoSchema = z
  .object({
    url: z.string().url().optional().nullable(),
    sizes: z.array(LinkedInImageSizeSchema).optional().nullable(),
  })
  .optional()
  .nullable();

// Schema pour une expérience
export const LinkedInExperienceSchema = z.object({
  position: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  workplaceType: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  companyLinkedinUrl: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  companyUniversalName: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  startDate: LinkedInDateSchema.optional().nullable(),
  endDate: LinkedInDateSchema.optional().nullable(),
  companyLogo: LinkedInCompanyLogoSchema.optional().nullable(),
  experienceGroupId: z.string().optional().nullable(),
});

// Schema pour une éducation
export const LinkedInEducationSchema = z.object({
  schoolName: z.string().optional().nullable(),
  schoolLinkedinUrl: z.string().optional().nullable(),
  schoolId: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  fieldOfStudy: z.string().optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  startDate: LinkedInDateSchema.optional().nullable(),
  endDate: LinkedInDateSchema.optional().nullable(),
  period: z.string().optional().nullable(),
  schoolLogo: LinkedInCompanyLogoSchema.optional().nullable(),
});

// Schema pour une compétence
export const LinkedInSkillSchema = z.object({
  name: z.string(),
  positions: z.array(z.string()).optional().nullable(),
  assessments: z.string().optional().nullable(),
  endorsements: z.string().optional().nullable(),
});

// Schema principal du profil LinkedIn
export const LinkedInProfileSchema = z.object({
  id: z.string().optional().nullable(),
  publicIdentifier: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  openToWork: z.boolean().optional().nullable(),
  hiring: z.boolean().optional().nullable(),
  premium: z.boolean().optional().nullable(),
  influencer: z.boolean().optional().nullable(),
  memorialized: z.boolean().optional().nullable(),
  location: LinkedInLocationSchema,
  objectUrn: z.string().optional().nullable(),
  registeredAt: z.string().optional().nullable(),
  topSkills: z.array(z.string()).optional().nullable(),
  connectionsCount: z.number().optional().nullable(),
  followerCount: z.number().optional().nullable(),
  verified: z.boolean().optional().nullable(),
  about: z.string().optional().nullable(),
  currentPosition: z
    .array(
      z.object({
        companyId: z.string().optional().nullable(),
        companyLinkedinUrl: z.string().optional().nullable(),
        companyName: z.string().optional().nullable(),
        dateRange: z
          .object({
            start: LinkedInDateSchema.optional().nullable(),
            end: LinkedInDateSchema.optional().nullable(),
          })
          .optional()
          .nullable(),
      }),
    )
    .optional()
    .nullable(),
  profileTopEducation: z
    .array(
      z.object({
        schoolId: z.string().optional().nullable(),
        companyId: z.string().optional().nullable(),
        schoolLinkedinUrl: z.string().optional().nullable(),
        schoolName: z.string().optional().nullable(),
      }),
    )
    .optional()
    .nullable(),
  profilePicture: LinkedInImageSchema,
  coverPicture: LinkedInImageSchema,
  photo: z.string().optional().nullable(),
  experience: z.array(LinkedInExperienceSchema).optional().nullable(),
  education: z.array(LinkedInEducationSchema).optional().nullable(),
  skills: z.array(LinkedInSkillSchema).optional().nullable(),
  languages: z
    .array(
      z.object({
        name: z.string().optional().nullable(),
        proficiency: z.string().optional().nullable(),
      }),
    )
    .optional()
    .nullable(),
});

// Schema pour la réponse Apify (tableau de profils)
export const ApifyLinkedInResponseSchema = z.array(LinkedInProfileSchema);

// Types TypeScript extraits des schemas
export type LinkedInProfile = z.infer<typeof LinkedInProfileSchema>;
export type LinkedInExperience = z.infer<typeof LinkedInExperienceSchema>;
export type LinkedInEducation = z.infer<typeof LinkedInEducationSchema>;
export type LinkedInSkill = z.infer<typeof LinkedInSkillSchema>;
export type ApifyLinkedInResponse = z.infer<typeof ApifyLinkedInResponseSchema>;
