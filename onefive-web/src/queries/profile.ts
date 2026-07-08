import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Me } from '@/hooks/useUser';
import { getCookie, deleteCookie } from 'cookies-next';

export enum GenderSalutationPreference {
  MALE = 0,
  FEMALE = 1,
  OTHER = 2,
}

const selfProfileSchema = z.object({
  data: z.object({
    id: z.string(),
    userId: z.string().optional(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().optional(),
    highlight: z.string().optional(),
    createdAt: z.string(),
    streak: z.number().optional(),
    count: z.object({
      followedBy: z.number(),
      following: z.number().optional(),
      posts: z.number().optional(),
    }),
  }),
});

export type selfProfileType = z.infer<typeof selfProfileSchema>['data'];

export const getProfile = async (profileId: string) => {
  try {
    const response = await api.get(`profile/${profileId}`,
    );
    const responseJson: any = await response.json();
    return responseJson.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to fetch profile: Error ONE-3');
    }
    throw Error('Unable to fetch profile');
  }
};

export const selfProfile = async () => {
  try {
    const response = await api.get('profile/self',
    );
    const parse = selfProfileSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to fetch your profile: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      const message = payloadError.error?.message ?? payloadError.message ?? '';
      throw Error(message);
    } else {
      toast.error('Unable to fetch your profile: Error ONE-3');
    }
    throw Error('Unable to fetch your profile');
  }
};

export const createProfile = async ({
  city,
  countryCode,
  dateOfBirth,
  firstName,
  lastName,
  followProfileIds,
  followStartupIds,
  gender,
  genderSalutationPreference,
  tagFollowing,
  code,
  ecosystemRoles,
  referredByCode,
}: {
  city: string;
  countryCode: string;
  dateOfBirth: string;
  firstName: string;
  followProfileIds: string[];
  followStartupIds: string[];
  gender: string;
  lastName: string;
  genderSalutationPreference: GenderSalutationPreference;
  tagFollowing: string[];
  code: string;
  ecosystemRoles?: string[];
  referredByCode?: string;
}) => {
  try {
    // Read referral code from cookie (set during signup with ?ref= param) or use provided parameter
    const referredByCodeFromCookie = getCookie('referredByCode') as string | undefined;
    const finalReferredByCode = referredByCode ?? referredByCodeFromCookie;

    const response = await api.post('profile',
      {
        json: {
          city,
          countryCode,
          dateOfBirth,
          firstName,
          lastName,
          followProfileIds,
          followStartupIds,
          gender,
          genderSalutationPreference,
          tagFollowing,
          code,
          ecosystemRoles,
          ...(finalReferredByCode ? { referredByCode: finalReferredByCode } : {}),
        },
      },
    );

    let responseJson: any;
    try {
      responseJson = await response.json();
    } catch (parseError) {
      console.error('createProfile: invalid JSON response', parseError);
      toast.error('Réponse invalide du serveur. Veuillez réessayer.');
      throw new Error('Unable to create your profile');
    }

    // Clear the referral cookie after successful profile creation
    if (finalReferredByCode) {
      deleteCookie('referredByCode');
    }

    return responseJson;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      let payloadError: { message?: string; error?: { message?: string } };
      try {
        payloadError = await error.response.json();
      } catch {
        toast.error('Impossible de créer votre profil. Veuillez réessayer.');
        throw new Error('Unable to create your profile');
      }
      const msg = (payloadError.error?.message ?? payloadError.message ?? '').toLowerCase();
      if (msg.includes('profilealreadyexistexception')) {
        toast.error('Un profil existe déjà pour ce compte.');
      } else if (msg.includes('authenticationsmsverifybadcodebadrequestexception')) {
        toast.error('Code incorrect.');
      } else if (msg.includes('authenticationsmsverifycodeexpiredbadrequestexception')) {
        toast.error('Code expiré.');
      } else if (msg.includes('profileonboardingnotcompletedexception')) {
        toast.error('Complétez d\'abord les étapes précédentes de l\'inscription.');
      } else if (msg.includes('profilecreateinternalexception')) {
        toast.error('Erreur serveur lors de la création du profil. Veuillez réessayer.');
      } else if (msg) {
        toast.error(`Impossible de créer votre profil. Veuillez réessayer.`);
      } else {
        toast.error('Impossible de créer votre profil. Veuillez réessayer.');
      }
    } else {
      const errMsg = error?.message ?? '';
      if (errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('Failed to fetch')) {
        toast.error('Erreur réseau. Vérifiez votre connexion et réessayez.');
      } else {
        console.error('createProfile error:', error);
        toast.error('Impossible de créer votre profil. Veuillez réessayer.');
      }
    }
    throw new Error('Unable to create your profile');
  }
};

const meProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  highlight: z.string().nullish(),
  bio: z.string().nullish(),
  avatar: z.string().nullish(),
  coverImage: z.string().nullish(),
  city: z.string(),
  countryCode: z.string(),
  createdAt: z.string(),
  ecosystemRoles: z.array(z.string()).optional().default([]),
  intentions: z.array(z.string()).optional().default([]),
  isFollowing: z.boolean().optional().default(false),
  stats: z.object({
    posts: z.number(),
    followers: z.number(),
    following: z.number(),
    connections: z.number(),
    streak: z.number(),
  }),
  experiences: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        company: z.string(),
        domain: z.string().nullish(),
        logoUrl: z.string().nullish(),
        startDate: z.string(),
        endDate: z.string().nullish(),
      })
    )
    .optional()
    .default([]),
  educations: z
    .array(
      z.object({
        id: z.string(),
        degree: z.string(),
        school: z.string(),
        domain: z.string().nullish(),
        logoUrl: z.string().nullish(),
        startDate: z.string(),
        endDate: z.string().nullish(),
      })
    )
    .optional()
    .default([]),
  socials: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
      }),
    )
    .optional()
    .default([]),
  skills: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
  achievements: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        date: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

const meProfileResponseSchema = z.object({
  success: z.boolean().optional(),
  data: meProfileSchema,
});

export type MeProfile = z.infer<typeof meProfileSchema>;

export const getMeProfile = async (): Promise<MeProfile> => {
  try {
    const response = await api.get('profile/me',
    );
    const parsed = meProfileResponseSchema.parse(await response.json());
    return parsed.data;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to fetch your profile: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to fetch your profile: Error ONE-3');
    }
    throw Error('Unable to fetch your profile');
  }
};

// Hook pour récupérer un profil par ID
export const useProfile = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => getProfile(profileId!),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour récupérer le profil courant
export const useMeProfile = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  
  const query = useQuery(
    ['profile', 'me'],
    async () => {
      const data = await getMeProfile();
      
      // Synchroniser avec le cache de la navbar après récupération des données
      queryClient.setQueryData(['user'], (oldData: Me | undefined) => {
        if (oldData && data.avatar !== oldData.avatar) {
          return {
            ...oldData,
            avatar: data.avatar ?? undefined
          };
        }
        return oldData;
      });
      
      return data;
    },
    {
      staleTime: 30 * 1000, // Réduit à 30 secondes pour être plus réactif
      cacheTime: 10 * 60 * 1000, // 10 minutes
      enabled: options?.enabled ?? true,
    }
  );
  
  return query;
};

// Types pour la mise à jour du profil
export type UpdateProfileData = {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  socials?: Array<{
    title: string;
    url: string;
  }>;
  skills?: string[];
  interests?: string[];
  countryCode?: string;
  city?: string;
  ecosystemRoles?: string[];
  intentions?: string[];
};

// Fonction pour mettre à jour le profil
export const updateProfile = async (data: UpdateProfileData) => {
  try {
    const response = await api.put('profile', {
      json: data,
    });
    return await response.json();
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de mettre à jour le profil: Error ONE-3');
    }
    throw Error('Impossible de mettre à jour le profil');
  }
};

// Hook pour mettre à jour le profil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalider et refetch tous les caches liés au profil utilisateur
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profil mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    },
  });
};

// Types pour l'upload d'images
export type ImageUploadResponse = {
  success: boolean;
  data: {
    url: string;
    type: 'avatar' | 'cover';
  };
};

// Types pour les expériences
export type ExperienceData = {
  title: string;
  company: string;
  domain?: string;
  logoUrl?: string;
  countryCode: string;
  city: string;
  from: string;
  to?: string;
  description?: string;
  urlLinkedin?: string;
  tags?: string[];
};

export type ExperienceResponse = {
  id: string;
  title: string;
  company: string;
  domain?: string;
  logoUrl?: string;
  countryCode: string;
  city: string;
  from: string;
  to?: string;
  description?: string;
  urlLinkedin?: string;
  tags: string[];
};

export type BatchUpdateExperiencesData = {
  experiences: Array<{
    id?: string;
    data: ExperienceData;
  }>;
  deleteIds: string[];
};

export type BatchUpdateExperiencesResponse = {
  created: number;
  updated: number;
  deleted: number;
  createdExperiences: Array<{
    index: number;
    id: string;
  }>;
};

// Fonction pour uploader l'avatar
export const uploadAvatar = async (file: File): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('profile-avatar/upload', {
      body: formData,
    });
    const result: any = await response.json();
    if (!result.data?.url) {
      console.error('❌ Invalid upload response structure:', result);
      throw new Error('Invalid response from upload endpoint');
    }
    
    return result;
  } catch (error: any) {
    console.error('❌ Upload avatar error:', error);
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible d\'uploader l\'avatar: Error ONE-3');
    }
    throw Error('Impossible d\'uploader l\'avatar');
  }
};

// Fonction pour uploader la photo de couverture
export const uploadCover = async (file: File): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('profile-cover/upload', {
      body: formData,
    });
    return await response.json();
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible d\'uploader la photo de couverture: Error ONE-3');
    }
    throw Error('Impossible d\'uploader la photo de couverture');
  }
};

// Hook pour uploader l'avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async (data: ImageUploadResponse) => {
      // 1. D'abord invalider les caches pour forcer le refetch depuis l'API
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user'] }), // Pour la navbar
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] }), // Pour la page de profil
      ]);
      
      // 2. Forcer le refetch immédiat pour mettre à jour les composants
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['user'] }),
        queryClient.refetchQueries({ queryKey: ['profile', 'me'] }),
      ]);
      
      // 3. Si les refetch échouent ou sont lents, mettre à jour manuellement le cache
      if (data.data?.url) {
        queryClient.setQueryData(['user'], (oldData: Me | undefined) => {
          if (oldData) {
            const updatedData = {
              ...oldData,
              avatar: data.data.url
            };
            return updatedData;
          }
          return oldData;
        });
      }
      
      toast.success('Avatar mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'upload de l\'avatar');
    },
  });
};

// Hook pour uploader la photo de couverture
export const useUploadCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadCover,
    onSuccess: () => {
      // Invalider et refetch tous les caches liés au profil utilisateur
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Photo de couverture mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'upload de la photo de couverture');
    },
  });
};

// Fonctions API pour les expériences
export const createExperience = async (data: ExperienceData): Promise<ExperienceResponse> => {
  try {
    const response = await api.post('experience', {
      json: data,
    });
    const result = await response.json() as { success: boolean; data: ExperienceResponse };
    if (!result.success) {
      throw new Error('Erreur lors de la création de l\'expérience');
    }
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de créer l\'expérience');
    }
    throw Error('Impossible de créer l\'expérience');
  }
};

export const updateExperience = async (
  experienceId: string,
  data: Partial<ExperienceData>
): Promise<ExperienceResponse> => {
  try {
    const response = await api.put(`experience/${experienceId}`, {
      json: data,
    });
    const result = await response.json() as { success: boolean; data: ExperienceResponse };
    if (!result.success) {
      throw new Error('Erreur lors de la mise à jour de l\'expérience');
    }
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de mettre à jour l\'expérience');
    }
    throw Error('Impossible de mettre à jour l\'expérience');
  }
};

export const deleteExperience = async (experienceId: string): Promise<{ success: true }> => {
  try {
    const response = await api.delete(`experience/${experienceId}`);
    const result = await response.json() as { success: boolean; data: { success: true } };
    if (!result.success) {
      throw new Error('Erreur lors de la suppression de l\'expérience');
    }
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de supprimer l\'expérience');
    }
    throw Error('Impossible de supprimer l\'expérience');
  }
};

// Fonction pour mettre à jour en batch les expériences
export const batchUpdateExperiences = async (data: BatchUpdateExperiencesData): Promise<BatchUpdateExperiencesResponse> => {
  try {
    const response = await api.put('experience/batch', {
      json: data,
    });
    const result = await response.json() as { success: boolean; data: BatchUpdateExperiencesResponse };
    if (!result.success) {
      throw new Error('Erreur lors de la mise à jour en batch des expériences');
    }
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de mettre à jour les expériences');
    }
    throw Error('Impossible de mettre à jour les expériences');
  }
};

// Hooks pour les expériences
export const useCreateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExperience,
    onSuccess: () => {
      // Invalider et refetch le profil courant pour mettre à jour les expériences
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Expérience ajoutée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'expérience');
    },
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ experienceId, data }: { experienceId: string; data: Partial<ExperienceData> }) =>
      updateExperience(experienceId, data),
    onSuccess: () => {
      // Invalider et refetch le profil courant pour mettre à jour les expériences
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Expérience mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'expérience');
    },
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      // Invalider et refetch le profil courant pour mettre à jour les expériences
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Expérience supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression de l\'expérience');
    },
  });
};

// Hook pour le batch update des expériences
export const useBatchUpdateExperiences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ apiData }: { apiData: BatchUpdateExperiencesData; cacheUpdateData?: any }) => {
      return batchUpdateExperiences(apiData);
    },
    onSuccess: (data, variables) => {
      // Mettre à jour directement le cache si on a les données nécessaires
      if (variables.cacheUpdateData) {
        const { currentExperiences, newExperiences, experiencesToDelete } = variables.cacheUpdateData;

        queryClient.setQueryData(['profile', 'me'], (oldData: MeProfile | undefined) => {
          if (!oldData) return oldData;

          // Filtrer les expériences supprimées
          let updatedExperiences = currentExperiences.filter(
            (exp: any) => !experiencesToDelete.includes(exp.id)
          );

          // Mettre à jour les expériences existantes
          updatedExperiences = updatedExperiences.map((currentExp: any) => {
            const newExp = newExperiences.find((ne: any) => ne.id === currentExp.id);
            if (newExp) {
              // Mise à jour d'une expérience existante
              return {
                id: currentExp.id,
                title: newExp.title,
                company: newExp.company,
                domain: newExp.domain || newExp.company,
                startDate: newExp.startDate,
                endDate: newExp.endDate,
              };
            }
            return currentExp;
          });

          // Ajouter les nouvelles expériences avec leurs vrais IDs retournés par le backend
          const newExperiencesToAdd = newExperiences
            .filter((ne: any) => !ne.id) // Celles qui n'avaient pas d'ID (créations)
            .map((ne: any, localIndex: number) => {
              // Récupérer l'ID réel depuis la réponse du backend
              const createdExp = data.createdExperiences.find((ce: any) => ce.index === localIndex);
              return {
                id: createdExp?.id || `temp_${Date.now()}_${localIndex}`, // Utiliser le vrai ID ou fallback temporaire
                title: ne.title,
                company: ne.company,
                domain: ne.domain || ne.company,
                startDate: ne.startDate,
                endDate: ne.endDate,
              };
            });

          updatedExperiences = [...updatedExperiences, ...newExperiencesToAdd];

          // Trier par date décroissante (plus récent en premier)
          updatedExperiences.sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

          return {
            ...oldData,
            experiences: updatedExperiences,
          };
        });
      } else {
        // Fallback : invalider le cache si on n'a pas les données pour la mise à jour optimisée
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      }

      // Toast désactivé ici pour éviter les notifications multiples - le toast est géré dans EditAboutModal
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour des expériences');
    },
  });
};

// Types pour les éducations
export type EducationData = {
  degree: string;
  school: string;
  domain?: string;
  logoUrl?: string;
  countryCode: string;
  city: string;
  from: string;
  to?: string;
  description?: string;
  urlLinkedin?: string;
  tags?: string[];
};

export type EducationResponse = {
  id: string;
  degree: string;
  school: string;
  domain?: string;
  logoUrl?: string;
  countryCode: string;
  city: string;
  from: string;
  to?: string;
  description?: string;
  urlLinkedin?: string;
  tags: string[];
};

export type BatchUpdateEducationsData = {
  educations: Array<{
    id?: string;
    data: EducationData;
  }>;
  deleteIds: string[];
};

export type BatchUpdateEducationsResponse = {
  created: number;
  updated: number;
  deleted: number;
  createdEducations: Array<{
    index: number;
    id: string;
  }>;
};

// Fonctions API pour les éducations
export const createEducation = async (data: EducationData): Promise<EducationResponse> => {
  try {
    const response = await api.post('education', {
      json: data,
    });
    const result = await response.json() as { success: boolean; data: EducationResponse };
    if (!result.success) {
      throw new Error('Erreur lors de la création de l\'éducation');
    }
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de créer l\'éducation');
    }
    throw Error('Impossible de créer l\'éducation');
  }
};

export const updateEducation = async (
  educationId: string,
  data: Partial<EducationData>
): Promise<EducationResponse> => {
  try {
    const response = await api.put(`education/${educationId}`, {
      json: data,
    });
    const result = await response.json() as { success: boolean; data: EducationResponse };
    if (!result.success) {
      throw new Error('Erreur lors de la mise à jour de l\'éducation');
    }
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de mettre à jour l\'éducation');
    }
    throw Error('Impossible de mettre à jour l\'éducation');
  }
};

export const deleteEducation = async (educationId: string): Promise<{ success: true }> => {
  try {
    const response = await api.delete(`education/${educationId}`);
    const result = await response.json() as { success: boolean; data: { success: true } };
    if (!result.success) {
      throw new Error('Erreur lors de la suppression de l\'éducation');
    }
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de supprimer l\'éducation');
    }
    throw Error('Impossible de supprimer l\'éducation');
  }
};

// Fonction pour mettre à jour en batch les éducations
export const batchUpdateEducations = async (data: BatchUpdateEducationsData): Promise<BatchUpdateEducationsResponse> => {
  try {
    const response = await api.put('education/batch', {
      json: data,
    });
    const result = await response.json() as { success: boolean; data: BatchUpdateEducationsResponse };
    if (!result.success) {
      throw new Error('Erreur lors de la mise à jour en batch des éducations');
    }
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de mettre à jour les éducations');
    }
    throw Error('Impossible de mettre à jour les éducations');
  }
};

// Hooks pour les éducations
export const useCreateEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEducation,
    onSuccess: () => {
      // Invalider et refetch le profil courant pour mettre à jour les éducations
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Éducation ajoutée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'éducation');
    },
  });
};

export const useUpdateEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ educationId, data }: { educationId: string; data: Partial<EducationData> }) =>
      updateEducation(educationId, data),
    onSuccess: () => {
      // Invalider et refetch le profil courant pour mettre à jour les éducations
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Éducation mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'éducation');
    },
  });
};

export const useDeleteEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => {
      // Invalider et refetch le profil courant pour mettre à jour les éducations
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Éducation supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression de l\'éducation');
    },
  });
};

// Hook pour le batch update des éducations
export const useBatchUpdateEducations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ apiData }: { apiData: BatchUpdateEducationsData; cacheUpdateData?: any }) => {
      return batchUpdateEducations(apiData);
    },
    onSuccess: (data, variables) => {
      // Mettre à jour directement le cache si on a les données nécessaires
      if (variables.cacheUpdateData) {
        const { currentEducations, newEducations, educationsToDelete } = variables.cacheUpdateData;

        queryClient.setQueryData(['profile', 'me'], (oldData: MeProfile | undefined) => {
          if (!oldData) return oldData;

          // Filtrer les éducations supprimées
          let updatedEducations = currentEducations.filter(
            (edu: any) => !educationsToDelete.includes(edu.id)
          );

          // Mettre à jour les éducations existantes
          updatedEducations = updatedEducations.map((currentEdu: any) => {
            const newEdu = newEducations.find((ne: any) => ne.id === currentEdu.id);
            if (newEdu) {
              // Mise à jour d'une éducation existante
              return {
                id: currentEdu.id,
                degree: newEdu.degree,
                school: newEdu.school,
                domain: newEdu.domain || newEdu.school,
                startDate: newEdu.startDate,
                endDate: newEdu.endDate,
              };
            }
            return currentEdu;
          });

          // Ajouter les nouvelles éducations avec leurs vrais IDs retournés par le backend
          const newEducationsToAdd = newEducations
            .filter((ne: any) => !ne.id) // Celles qui n'avaient pas d'ID (créations)
            .map((ne: any, localIndex: number) => {
              // Récupérer l'ID réel depuis la réponse du backend
              const createdEdu = data.createdEducations.find((ce: any) => ce.index === localIndex);
              return {
                id: createdEdu?.id || `temp_${Date.now()}_${localIndex}`, // Utiliser le vrai ID ou fallback temporaire
                degree: ne.degree,
                school: ne.school,
                domain: ne.domain || ne.school,
                startDate: ne.startDate,
                endDate: ne.endDate,
              };
            });

          updatedEducations = [...updatedEducations, ...newEducationsToAdd];

          // Trier par date décroissante (plus récent en premier)
          updatedEducations.sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

          return {
            ...oldData,
            educations: updatedEducations,
          };
        });
      } else {
        // Fallback : invalider le cache si on n'a pas les données pour la mise à jour optimisée
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      }

      // Toast désactivé ici pour éviter les notifications multiples - le toast est géré dans EditAboutModal
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour des éducations');
    },
  });
};

// Types pour la mise à jour des compétences et intérêts
export type UpdateSkillsInterestsData = {
  skills: string[];
  interests: string[];
};

// Fonction pour mettre à jour les compétences et intérêts
export const updateSkillsInterests = async (data: UpdateSkillsInterestsData) => {
  try {
    const response = await api.put('profile/skills-interests', {
      json: data,
    });
    return await response.json();
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de mettre à jour les compétences et centres d\'intérêt: Error ONE-3');
    }
    throw Error('Impossible de mettre à jour les compétences et centres d\'intérêt');
  }
};

// Hook pour mettre à jour les compétences et intérêts
export const useUpdateSkillsInterests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSkillsInterests,
    onSuccess: () => {
      // Invalider et refetch tous les caches liés au profil utilisateur
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Compétences et centres d\'intérêt mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour des compétences et centres d\'intérêt');
    },
  });
};

// Types pour les réalisations
export type AchievementData = {
  id?: string;
  title: string;
  description: string;
  date?: string;
};

export type BatchUpdateAchievementsData = {
  achievements: AchievementData[];
  deleteIds: string[];
};

// Fonction pour mettre à jour les réalisations en batch
export const batchUpdateAchievements = async (data: BatchUpdateAchievementsData) => {
  try {
    const response = await api.put('profile/achievements/batch', {
      json: data,
    });
    return await response.json();
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Impossible de mettre à jour les réalisations: Error ONE-3');
    }
    throw Error('Impossible de mettre à jour les réalisations');
  }
};

// Hook pour mettre à jour les réalisations
export const useBatchUpdateAchievements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: batchUpdateAchievements,
    onSuccess: (data: any, variables) => {
      // Mettre à jour directement le cache si on a les données nécessaires
      if (variables) {
        const { achievements, deleteIds } = variables;

        queryClient.setQueryData(['profile', 'me'], (oldData: MeProfile | undefined) => {
          if (!oldData) return oldData;

          // Filtrer les achievements supprimés
          let updatedAchievements = oldData.achievements?.filter(
            ach => !deleteIds.includes(ach.id)
          ) ?? [];

          // Ajouter/mettre à jour les achievements
          achievements.forEach(newAch => {
            if (newAch.id && !newAch.id.startsWith('new_')) {
              // Mise à jour d'un achievement existant
              updatedAchievements = updatedAchievements.map(ach =>
                ach.id === newAch.id ? { ...ach, ...newAch } : ach
              );
            } else {
              // Nouvel achievement avec un ID temporaire (sera remplacé par le vrai ID lors du refetch)
              updatedAchievements.push({
                id: `temp_${Date.now()}`,
                ...newAch,
              });
            }
          });

          return {
            ...oldData,
            achievements: updatedAchievements,
          };
        });
      } else {
        // Fallback : invalider le cache si on n'a pas les données pour la mise à jour optimisée
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      }

      toast.success(`${data.data.created} ajoutée(s), ${data.data.updated} mise(s) à jour, ${data.data.deleted} supprimée(s)`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour des réalisations');
    },
  });
};
