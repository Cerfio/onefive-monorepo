import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface MemberData {
  id: string;
  profileId: string;
  name: string;
  firstName: string;
  lastName: string;
  position: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  equity: number;
  isFounder: boolean;
  avatar?: string | null;
  linkedinUrl?: string;
}

// Get startup members
export const getStartupMembers = async (startupId: string): Promise<MemberData[]> => {
  try {
    const response = await api.get(`startup/${startupId}/members`);
    const responseJson: any = await response.json() as { success: boolean; data: MemberData[] };
    return responseJson.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    }
    throw Error('Unable to fetch startup members');
  }
};

// Hook to get startup members
export const useStartupMembers = (startupId: string) => {
  return useQuery({
    queryKey: ['startup-members', startupId],
    queryFn: () => getStartupMembers(startupId),
    enabled: !!startupId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000,    // 5 minutes
  });
};

// Types
export interface UserStartup {
  id: string;
  name: string;
  tagline: string;
  logo?: string | null;
  coverImage?: string | null;
  location: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  position: string;
  equity: number;
  membersCount: number;
  followersCount: number;
  createdAt: string;
}

export interface ProfileSearchResult {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  highlight?: string;
  countryCode: string;
}

// Types for investor search results
export interface InvestorSearchPersonResult {
  type: 'person';
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  highlight?: string;
  countryCode: string;
}

export interface InvestorSearchCompanyResult {
  type: 'company';
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
}

// Type pour les investisseurs enrichis côté frontend (backward compatible)
export type Investor = {
  type: 'profile' | 'text';
  id: string;
  name: string;
  avatar?: string;
  logo?: string;      // Pour les entreprises
  website?: string;   // Pour les entreprises
};

// Fonctions utilitaires pour convertir entre string[] (backend) et Investor[] (frontend)
export const parseInvestors = (investors: string[]): Investor[] => {
  return investors.map((investor, index) => {
    // Si c'est un UUID (format standard), on considère que c'est un ID de profil
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(investor)) {
      return {
        type: 'profile',
        id: investor,
        name: investor, // Le nom sera enrichi plus tard si nécessaire
      };
    }
    // Sinon, c'est du texte libre
    return {
      type: 'text',
      id: `text-${index}`,
      name: investor,
    };
  });
};

export const serializeInvestors = (investors: Investor[]): string[] => {
  return investors.map((investor) => {
    if (investor.type === 'profile') {
      return investor.id;
    }
    return investor.name;
  });
};

export interface StartupFounder {
  id: string;
  memberId: string;
  name: string;
  avatar: string | null;
  position: string;
  capitalStock: number | null;
}

export interface StartupTeamMember {
  id: string;
  memberId: string;
  name: string;
  avatar: string | null;
  position: string;
  role?: string;
}

export interface StartupStats {
  followers: number;
  members: number;
  views?: number;
}

export interface Startup {
  id: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  logo: string | null;
  coverImage: string | null;
  website: string | null;
  linkedin: string | null;
  foundedDate: string | null;
  categories: string[];
  countryCode: string;
  city: string;
  location: string;
  createdAt: string;
  founders: StartupFounder[];
  teamMembers: StartupTeamMember[];
  stats: StartupStats;
  isMember: boolean;
  canEdit: boolean;
  role?: string;
}

// Schemas
const userStartupsSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    name: z.string(),
    tagline: z.string(),
    logo: z.string().nullable(),
    coverImage: z.string().nullable(),
    location: z.string(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']),
    position: z.string(),
    equity: z.number(),
    membersCount: z.number(),
    followersCount: z.number(),
    createdAt: z.string(),
  }))
});

const profileSearchSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    name: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().optional(),
    highlight: z.string().optional(),
    countryCode: z.string(),
  }))
});

const createStartupSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    categories: z.array(z.string()),
    countryCode: z.string(),
    city: z.string(),
    logo: z.string().nullable(),
    coverImage: z.string().nullable(),
    createdAt: z.string(),
  })
});

const getStartupSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
    tagline: z.string().nullish(),
    description: z.string().nullish(),
    logo: z.string().nullable(),
    coverImage: z.string().nullable(),
    website: z.string().nullable(),
    linkedin: z.string().nullable(),
    foundedDate: z.string().nullable(),
    categories: z.array(z.string()),
    countryCode: z.string(),
    city: z.string(),
    location: z.string(),
    createdAt: z.string(),
    founders: z.array(z.object({
      id: z.string(),
      memberId: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
      position: z.string(),
      capitalStock: z.number().nullable(),
      role: z.string().optional(),
    })),
    teamMembers: z.array(z.object({
      id: z.string(),
      memberId: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
      position: z.string(),
      role: z.string().optional(),
    })),
    stats: z.object({
      followers: z.number(),
      members: z.number(),
      views: z.number().optional(),
    }),
    isMember: z.boolean(),
    canEdit: z.boolean(),
    role: z.string().optional(),
  })
});

// API Functions
export const getUserStartups = async (): Promise<UserStartup[]> => {
  try {
    const response = await api.get('startup/me');
    const responseJson: any = await response.json();
    return userStartupsSchema.parse(responseJson).data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to fetch startups: Error STARTUP-1');
    }
    throw Error('Unable to fetch startups');
  }
};

export const createStartup = async (data: {
  name: string;
  tagline: string;
  description: string;
  website?: string;
  linkedin?: string;
  foundedDate: string;
  countryCode: string;
  city: string;
  categories: string[];
  logo?: string;
  coverImage?: string;
  invitations?: Array<{
    profileId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    position: string;
    equity: number;
    message?: string;
  }>;
}): Promise<{
  id: string;
  name: string;
  description?: string;
  categories: string[];
  countryCode: string;
  city: string;
  logo?: string | null;
  coverImage?: string | null;
  createdAt: string;
}> => {
  try {
    const response = await api.post('startup', {
      json: data,
    });
    const responseJson: any = await response.json();
    return createStartupSchema.parse(responseJson).data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to create startup: Error STARTUP-2');
    }
    throw Error('Unable to create startup');
  }
};

export const searchProfiles = async (query: string, limit = 5): Promise<ProfileSearchResult[]> => {
  try {
    const response = await api.get(`profile/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    const responseJson: any = await response.json();
    return profileSearchSchema.parse(responseJson).data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to search profiles: Error STARTUP-3');
    }
    throw Error('Unable to search profiles');
  }
};

export const searchInvestors = async (
  query: string,
  limit = 10
): Promise<{
  people: InvestorSearchPersonResult[];
  companies: InvestorSearchCompanyResult[];
}> => {
  try {
    const response = await api.get(`startup/search-investors?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    const responseJson: any = await response.json();
    return responseJson.data || { people: [], companies: [] };
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to search investors: Error STARTUP-15');
    }
    throw Error('Unable to search investors');
  }
};

// React Query Hooks
export const useUserStartups = () => {
  return useQuery({
    queryKey: ['user-startups'],
    queryFn: getUserStartups,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,   // 10 minutes
  });
};

// Get startups for a specific profile
export const getProfileStartups = async (profileId: string): Promise<UserStartup[]> => {
  try {
    const response = await api.get(`startup/profile/${profileId}`);
    const responseJson: any = await response.json();
    return userStartupsSchema.parse(responseJson).data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to fetch profile startups: Error STARTUP-16');
    }
    throw Error('Unable to fetch profile startups');
  }
};

export const useProfileStartups = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile-startups', profileId],
    queryFn: () => getProfileStartups(profileId!),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,   // 10 minutes
  });
};

export const useCreateStartup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStartup,
    onSuccess: (_startup) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-startups'] });
      queryClient.invalidateQueries({ queryKey: ['startup-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['network-startups'] });
      queryClient.invalidateQueries({ queryKey: ['profile-statistics'] });

      toast.success('Startup créée avec succès !');
    },
    onError: (error: any) => {
      const message = error.message || 'Erreur lors de la création de la startup';
      toast.error(message);
    }
  });
};

export const useProfileSearch = (query: string, limit = 5) => {
  return useQuery({
    queryKey: ['profile-search', query, limit],
    queryFn: () => searchProfiles(query, limit),
    enabled: query.length >= 2,
    staleTime: 30000, // 30 seconds cache
    cacheTime: 60000,    // 1 minute cache
  });
};

// Invitation schemas and functions
const _startupInvitationSchema = z.object({
  data: z.object({
    id: z.string(),
    startupId: z.string(),
    status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED']),
    expiresAt: z.string(),
    position: z.string(),
    equity: z.number(),
    message: z.string().optional(),
    invitedBy: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    }),
    invitedProfile: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      avatar: z.string().optional(),
    }).optional(),
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    createdAt: z.string(),
  })
});

export interface StartupInvitation {
  id: string;
  startupId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  position: string;
  equity: number;
  message?: string;
  invitedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  invitedProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

// Invitation API functions
export const createStartupInvitation = async (data: {
  profileId?: string; // Pour utilisateur existant
  email?: string;     // Pour nouvel utilisateur
  firstName?: string;
  lastName?: string;
  position: string;
  equity: number;
  message?: string;
}): Promise<{ id: string }> => {
  try {
    const response = await api.post('startup/invite', {
      json: data,
    });
    const responseJson: any = await response.json();
    return { id: responseJson.data.id };
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to send invitation: Error STARTUP-4');
    }
    throw Error('Unable to send invitation');
  }
};

export const manageStartupInvitation = async ({
  invitationId,
  action
}: {
  invitationId: string;
  action: 'cancel' | 'accept' | 'decline';
}): Promise<{ success: boolean }> => {
  try {
    const response = await api.put(`startup/invitations/${invitationId}/${action}`
    );
    const responseJson: any = await response.json();
    return { success: responseJson.success };
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to manage invitation: Error STARTUP-5');
    }
    throw Error('Unable to manage invitation');
  }
};

export const getStartupInvitations = async (): Promise<StartupInvitation[]> => {
  try {
    const response = await api.get('startup/invitations');
    const responseJson: any = await response.json();
    return responseJson.data || [];
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to fetch invitations: Error STARTUP-6');
    }
    throw Error('Unable to fetch invitations');
  }
};

// React Query hooks for invitations
export const useCreateStartupInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStartupInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startup-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-startups'] });
      toast.success('Invitation envoyée !');
    },
    onError: (error: any) => {
      const message = error.message || 'Erreur lors de l\'envoi de l\'invitation';
      if (message.includes('equity') || message.includes('Equity') || message.includes('Not enough')) {
        toast.error('Parts insuffisantes : le pourcentage demandé dépasse les parts disponibles.');
      } else {
        toast.error(message);
      }
    }
  });
};

export const useManageStartupInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: manageStartupInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startup-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-startups'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Erreur lors de la gestion de l\'invitation';
      toast.error(message);
    }
  });
};

export const useStartupInvitations = () => {
  return useQuery({
    queryKey: ['startup-invitations'],
    queryFn: getStartupInvitations,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000,    // 5 minutes
  });
};

// Get startup by ID
export const getStartup = async (startupId: string): Promise<Startup> => {
  try {
    const response = await api.get(`startup/${startupId}`);
    const responseJson: any = await response.json();
    return getStartupSchema.parse(responseJson).data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to fetch startup: Error STARTUP-7');
    }
    throw Error('Unable to fetch startup');
  }
};

export const useStartup = (startupId: string) => {
  return useQuery({
    queryKey: ['startup', startupId],
    queryFn: () => getStartup(startupId),
    enabled: !!startupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,   // 10 minutes
  });
};

// Update startup
export const updateStartup = async (
  startupId: string,
  data: {
    name?: string;
    tagline?: string;
    description?: string;
    website?: string;
    linkedin?: string;
    foundedDate?: string;
    countryCode?: string;
    city?: string;
    categories?: string[];
    logo?: string;
    coverImage?: string;
  }
): Promise<Startup> => {
  try {
    const response = await api.put(`startup/${startupId}`, {
      json: data,
    });
    // Ignore the partial payload returned by the update endpoint and refetch the full startup payload
    if (response.status !== 200) {
      throw new Error('Unexpected response status');
    }

    try {
      await response.json();
    } catch {
      // Endpoint may return an empty body; ignore parsing issues
    }

    return await getStartup(startupId);
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to update startup: Error STARTUP-8');
    }
    throw Error('Unable to update startup');
  }
};

export const useUpdateStartup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, data }: { startupId: string; data: Parameters<typeof updateStartup>[1] }) =>
      updateStartup(startupId, data),
    onSuccess: (updatedStartup, variables) => {
      // Invalidate and refetch startup data
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      queryClient.invalidateQueries({ queryKey: ['user-startups'] });
      toast.success('Startup mise à jour avec succès !');
    },
    onError: (error: any) => {
      const message = error.message || 'Erreur lors de la mise à jour de la startup';
      toast.error(message);
    }
  });
};

// Funding types and schemas
export interface FundingData {
  totalRaised: string;
  lastRound: string | null;
  investors: string[];
  fundraisingType: 'structured' | 'rolling' | 'none';
  structuredRound?: {
    targetAmount: string;
    minTicket: string;
    instrument: 'SAFE' | 'BSA AIR' | 'Equity';
    cap?: string;
    discount?: string;
    deadline: string;
    deckUrl?: string;
  };
  rollingInvestment?: {
    instrument: 'SAFE' | 'BSA AIR';
    cap?: string;
    discount?: string;
  };
}

export interface FundingInvestor {
  type: 'person' | 'company';
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  logo?: string;
  website?: string;
  description?: string;
  highlight?: string;
  countryCode?: string;
  ecosystemRoles?: string[];
  bio?: string;
  invitationStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  isVisible?: boolean;
}

export interface FundingHistoryEntry {
  id: string;
  date: string;
  amountRaised: number;
  valuation?: number;
  round: 'LOVE_MONEY' | 'PRESEED' | 'SEED' | 'SERIESA' | 'SERIESB' | 'SERIESC' | 'SERIESD' | 'BRIDGE' | 'VENTUREDEBT' | 'OTHER';
  investors?: FundingInvestor[];
  leadInvestor?: string;
  instrument?: 'SAFE' | 'BSA_AIR' | 'EQUITY' | 'CONVERTIBLE_NOTE' | 'OTHER' | string; // string permet les instruments personnalisés
  notes?: string;
}

export interface CreateFundingHistoryData {
  date: string;
  amountRaised: number;
  valuation?: number;
  round: FundingHistoryEntry['round'];
  investors?: FundingInvestor[];
  leadInvestor?: string;
  instrument?: FundingHistoryEntry['instrument'];
  notes?: string;
}

export interface UpdateFundingHistoryData {
  date?: string;
  amountRaised?: number;
  valuation?: number;
  round?: FundingHistoryEntry['round'];
  investors?: FundingInvestor[];
  leadInvestor?: string;
  instrument?: FundingHistoryEntry['instrument'];
  notes?: string;
}

const getFundingSchema = z.object({
  data: z.object({
    totalRaised: z.string(),
    lastRound: z.string().nullable(),
    investors: z.array(z.string()),
    fundraisingType: z.enum(['structured', 'rolling', 'none']),
    structuredRound: z.object({
      targetAmount: z.string(),
      minTicket: z.string(),
      instrument: z.enum(['SAFE', 'BSA AIR', 'Equity']),
      cap: z.string().optional(),
      discount: z.string().optional(),
      deadline: z.string(),
      deckUrl: z.string().optional(),
    }).optional(),
    rollingInvestment: z.object({
      instrument: z.enum(['SAFE', 'BSA AIR']),
      cap: z.string().optional(),
      discount: z.string().optional(),
    }).optional(),
  })
});

const updateFundingSchema = getFundingSchema;

// Funding API functions
export const getFunding = async (startupId: string): Promise<FundingData> => {
  try {
    const response = await api.get(`startup/${startupId}/funding`);
    const responseJson: any = await response.json();
    return getFundingSchema.parse(responseJson).data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to fetch funding: Error STARTUP-9');
    }
    throw Error('Unable to fetch funding');
  }
};

export const updateFunding = async (
  startupId: string,
  data: Partial<FundingData>
): Promise<FundingData> => {
  try {
    const response = await api.put(`startup/${startupId}/funding`, {
      json: data,
    });
    const responseJson: any = await response.json();
    return updateFundingSchema.parse(responseJson).data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to update funding: Error STARTUP-10');
    }
    throw Error('Unable to update funding');
  }
};

// Funding React Query hooks
export const useFunding = (startupId: string) => {
  return useQuery({
    queryKey: ['startup-funding', startupId],
    queryFn: () => getFunding(startupId),
    enabled: !!startupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,   // 10 minutes
  });
};

export const useUpdateFunding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, data }: { startupId: string; data: Partial<FundingData> }) =>
      updateFunding(startupId, data),
    onSuccess: (updatedFunding, variables) => {
      // Invalidate and refetch funding data
      queryClient.invalidateQueries({ queryKey: ['startup-funding', variables.startupId] });
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      toast.success('Financement mis à jour avec succès !');
    },
    onError: (error: any) => {
      const message = error.message || 'Erreur lors de la mise à jour du financement';
      toast.error(message);
    }
  });
};

// Funding History API functions
export const getFundingHistory = async (startupId: string): Promise<FundingHistoryEntry[]> => {
  try {
    const response = await api.get(`startup/${startupId}/funding/history`);
    const responseJson: any = await response.json();
    return responseJson.data || [];
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to fetch funding history: Error STARTUP-11');
    }
    throw Error('Unable to fetch funding history');
  }
};

export const createFundingHistory = async (
  startupId: string,
  data: CreateFundingHistoryData
): Promise<FundingHistoryEntry> => {
  try {
    const response = await api.post(`startup/${startupId}/funding/history`, {
      json: data,
    });
    const responseJson: any = await response.json();
    return responseJson.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to create funding history: Error STARTUP-12');
    }
    throw Error('Unable to create funding history');
  }
};

export const updateFundingHistory = async (
  startupId: string,
  historyId: string,
  data: UpdateFundingHistoryData
): Promise<FundingHistoryEntry> => {
  try {
    const response = await api.put(`startup/${startupId}/funding/history/${historyId}`, {
      json: data,
    });
    const responseJson: any = await response.json();
    return responseJson.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to update funding history: Error STARTUP-13');
    }
    throw Error('Unable to update funding history');
  }
};

export const deleteFundingHistory = async (
  startupId: string,
  historyId: string
): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete(`startup/${startupId}/funding/history/${historyId}`);
    const responseJson: any = await response.json();
    return responseJson.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    } else {
      toast.error('Unable to delete funding history: Error STARTUP-14');
    }
    throw Error('Unable to delete funding history');
  }
};

// Funding History React Query hooks
export const useFundingHistory = (startupId: string) => {
  return useQuery({
    queryKey: ['startup-funding-history', startupId],
    queryFn: () => getFundingHistory(startupId),
    enabled: !!startupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,   // 10 minutes
  });
};

export const useCreateFundingHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, data }: { startupId: string; data: CreateFundingHistoryData }) =>
      createFundingHistory(startupId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup-funding-history', variables.startupId] });
      toast.success('Financement ajouté avec succès !');
    },
    onError: (error: any) => {
      const message = error.message || 'Erreur lors de l\'ajout du financement';
      toast.error(message);
    }
  });
};

export const useUpdateFundingHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, historyId, data }: { startupId: string; historyId: string; data: UpdateFundingHistoryData }) =>
      updateFundingHistory(startupId, historyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup-funding-history', variables.startupId] });
      toast.success('Financement mis à jour avec succès !');
    },
    onError: (error: any) => {
      const message = error.message || 'Erreur lors de la mise à jour du financement';
      toast.error(message);
    }
  });
};

export const useDeleteFundingHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, historyId }: { startupId: string; historyId: string }) =>
      deleteFundingHistory(startupId, historyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup-funding-history', variables.startupId] });
      toast.success('Financement supprimé avec succès !');
    },
    onError: (error: any) => {
      const message = error.message || 'Erreur lors de la suppression du financement';
      toast.error(message);
    }
  });
};

// ============================================
// LINKEDIN COMPANY SYNC
// ============================================

// Types pour le LinkedIn Company Sync
export interface CompanySyncStatus {
  canSync: boolean;
  hasPreviousSync: boolean;
  nextSyncAvailableAt?: string;
  hoursRemaining?: number;
  lastSyncedAt?: string;
}

export interface CompanyComparisonData {
  current: {
    name: string;
    tagline?: string | null;
    description?: string | null;
    website?: string | null;
    logo?: string | null;
    coverImage?: string | null;
    countryCode: string;
    city: string;
    foundedDate?: string | null;
    categories: string[];
    linkedin?: string | null;
  };
  linkedin: {
    name: string;
    tagline?: string | null;
    description?: string | null;
    website?: string | null;
    logo?: string | null;
    backgroundCover?: string | null;
    countryCode?: string | null;
    city?: string | null;
    foundedYear?: number | null;
    industries: string[];
    employeeCount?: number | null;
    employeeCountRange?: { start?: number; end?: number } | null;
    followerCount?: number | null;
    linkedinUrl?: string | null;
  };
}

export interface ApplyCompanySyncFields {
  syncName?: boolean;
  syncTagline?: boolean;
  syncDescription?: boolean;
  syncWebsite?: boolean;
  syncLogo?: boolean;
  syncCover?: boolean;
  syncLocation?: boolean;
  syncFoundedDate?: boolean;
  syncIndustries?: boolean;
}

// Fonctions API pour le LinkedIn Company Sync
export const getCompanySyncStatus = async (startupId: string): Promise<CompanySyncStatus> => {
  try {
    const response = await api.get(`linkedin-sync/company/${startupId}/status`);
    const data = await response.json() as { success: boolean; data: CompanySyncStatus };
    return data.data;
  } catch {
    throw new Error('Unable to get sync status');
  }
};

export const initiateCompanySync = async (startupId: string, linkedinUrl: string): Promise<any> => {
  try {
    const response = await api.post(`linkedin-sync/company/${startupId}/initiate`, {
      json: { linkedinUrl },
    });
    const data = await response.json() as { success: boolean; data: any };
    return data.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const errorData = await error.response.json();
      throw new Error(errorData.message || 'Error initiating sync');
    }
    throw error;
  }
};

export const getCompanyComparison = async (startupId: string): Promise<CompanyComparisonData> => {
  try {
    const response = await api.get(`linkedin-sync/company/${startupId}/comparison`);
    const data = await response.json() as { success: boolean; data: CompanyComparisonData };
    return data.data;
  } catch {
    throw new Error('Unable to get comparison data');
  }
};

export const applyCompanySync = async (startupId: string, syncFields: ApplyCompanySyncFields): Promise<{ updatedFields: string[] }> => {
  try {
    const response = await api.post(`linkedin-sync/company/${startupId}/apply`, {
      json: syncFields,
    });
    const data = await response.json() as { success: boolean; data: { updatedFields: string[] } };
    return data.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const errorData = await error.response.json();
      throw new Error(errorData.message || 'Error applying sync');
    }
    throw error;
  }
};

// Hooks pour le LinkedIn Company Sync
export const useCompanySyncStatus = (startupId: string) => {
  return useQuery({
    queryKey: ['company-sync-status', startupId],
    queryFn: () => getCompanySyncStatus(startupId),
    enabled: !!startupId,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useInitiateCompanySync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, linkedinUrl }: { startupId: string; linkedinUrl: string }) =>
      initiateCompanySync(startupId, linkedinUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company-sync-status', variables.startupId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la synchronisation LinkedIn');
    },
  });
};

export const useCompanyComparison = (startupId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['company-comparison', startupId],
    queryFn: () => getCompanyComparison(startupId),
    enabled: !!startupId && enabled,
  });
};

export const useApplyCompanySync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, syncFields }: { startupId: string; syncFields: ApplyCompanySyncFields }) =>
      applyCompanySync(startupId, syncFields),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      queryClient.invalidateQueries({ queryKey: ['company-sync-status', variables.startupId] });
      toast.success(`${data.updatedFields.length} champ(s) synchronisé(s) avec succès !`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'application de la synchronisation');
    },
  });
};

// Upload startup logo
export const uploadStartupLogo = async (startupId: string, file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post(`startup/${startupId}/logo/upload`, {
      body: formData,
    });
    const result = await response.json() as { success: boolean; data: { url: string } };
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    }
    toast.error('Impossible d\'uploader le logo');
    throw Error('Impossible d\'uploader le logo');
  }
};

// Upload startup cover
export const uploadStartupCover = async (startupId: string, file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post(`startup/${startupId}/cover/upload`, {
      body: formData,
    });
    const result = await response.json() as { success: boolean; data: { url: string } };
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    }
    toast.error('Impossible d\'uploader l\'image de couverture');
    throw Error('Impossible d\'uploader l\'image de couverture');
  }
};

// Hook pour uploader le logo
export const useUploadStartupLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, file }: { startupId: string; file: File }) =>
      uploadStartupLogo(startupId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      toast.success('Logo mis à jour avec succès !');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'upload du logo');
    },
  });
};

// Hook pour uploader la cover
export const useUploadStartupCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, file }: { startupId: string; file: File }) =>
      uploadStartupCover(startupId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      toast.success('Image de couverture mise à jour avec succès !');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'upload de l\'image de couverture');
    },
  });
};

// =============================================
// MEMBERS MANAGEMENT (unified)
// =============================================

export interface AddMemberPayload {
  profileId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  position: string;
  isFounder?: boolean;
  equity?: number;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  message?: string;
}

export interface AddMemberResponse {
  status: 'ADDED' | 'INVITED' | 'EMAIL_SENT';
  memberId?: string;
  invitationId?: string;
}

export const addMember = async (
  startupId: string,
  payload: AddMemberPayload
): Promise<AddMemberResponse> => {
  try {
    const response = await api.post(`startup/${startupId}/members`, {
      json: payload,
    });
    const result = await response.json() as { success: boolean; data: AddMemberResponse };
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw new Error(payloadError.message || 'Failed to add member');
    }
    throw error;
  }
};

export const useAddMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, payload }: { startupId: string; payload: AddMemberPayload }) =>
      addMember(startupId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      queryClient.invalidateQueries({ queryKey: ['startup-members', variables.startupId] });
      if (data.status === 'ADDED') {
        toast.success('Membre ajouté avec succès !');
      } else {
        toast.success('Invitation envoyée avec succès !');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'ajout du membre');
    },
  });
};

// Update an existing startup member (role, position, equity, isFounder)
export interface UpdateMemberPayload {
  position?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  equity?: number;
  isFounder?: boolean;
}

export const updateMember = async (
  startupId: string,
  memberId: string,
  payload: UpdateMemberPayload
): Promise<unknown> => {
  try {
    const response = await api.patch(`startup/${startupId}/members/${memberId}`, {
      json: payload,
    });
    const result = await response.json() as { success: boolean; data: unknown };
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw new Error(payloadError.message || 'Failed to update member');
    }
    throw error;
  }
};

// Remove a member from a startup
export const removeMember = async (
  startupId: string,
  memberId: string
): Promise<{ status: string; memberId: string }> => {
  try {
    const response = await api.delete(`startup/${startupId}/members/${memberId}`);
    const result = await response.json() as { success: boolean; data: { status: string; memberId: string } };
    return result.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw new Error(payloadError.message || 'Failed to remove member');
    }
    throw error;
  }
};

// Hook to update a startup member
export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, memberId, payload }: { startupId: string; memberId: string; payload: UpdateMemberPayload }) =>
      updateMember(startupId, memberId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      queryClient.invalidateQueries({ queryKey: ['startup-members', variables.startupId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du membre');
    },
  });
};

// Hook to remove a member from a startup
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startupId, memberId }: { startupId: string; memberId: string }) =>
      removeMember(startupId, memberId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      queryClient.invalidateQueries({ queryKey: ['startup-members', variables.startupId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression du membre');
    },
  });
};

// =============================================
// INVITATIONS MANAGEMENT
// =============================================

export interface MyStartupInvitation {
  id: string;
  startupId: string;
  startupName: string;
  startupLogo?: string;
  position: string;
  equity: number;
  role: string;
  message?: string;
  invitedBy: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  createdAt: string;
}

// Get pending invitations for the current user
export const getMyInvitations = async (): Promise<MyStartupInvitation[]> => {
  try {
    const response = await api.get('startup/invitations',
      { credentials: 'include' }
    );
    const result = await response.json() as { success: boolean; data: MyStartupInvitation[] };
    return result.data;
  } catch {
    return [];
  }
};

// Accept an invitation
export const acceptInvitation = async (invitationId: string): Promise<{ status: string }> => {
  const response = await api.put(`startup/invitations/${invitationId}/accept`,
    { credentials: 'include' }
  );
  const result = await response.json() as { success: boolean; data: { status: string } };
  return result.data;
};

// Decline an invitation
export const declineInvitation = async (invitationId: string): Promise<{ status: string }> => {
  const response = await api.put(`startup/invitations/${invitationId}/decline`,
    { credentials: 'include' }
  );
  const result = await response.json() as { success: boolean; data: { status: string } };
  return result.data;
};

// Hook to get user's invitations
export const useMyInvitations = () => {
  return useQuery({
    queryKey: ['startup-invitations'],
    queryFn: getMyInvitations,
  });
};

// Hook to accept an invitation
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startup-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-startups'] });
      toast.success('Invitation acceptée ! Vous avez rejoint la startup.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'acceptation de l\'invitation');
    },
  });
};

// Hook to decline an invitation
export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => declineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startup-invitations'] });
      toast.success('Invitation refusée.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du refus de l\'invitation');
    },
  });
};

// =============================================
// LEAVE / TRANSFER / DELETE STARTUP
// =============================================

export const leaveStartup = async (startupId: string): Promise<{ status: string }> => {
  const response = await api.post(`startup/${startupId}/leave`);
  const result = await response.json() as { success: boolean; data: { status: string } };
  return result.data;
};

export const useLeaveStartup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (startupId: string) => leaveStartup(startupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-startups'] });
      toast.success('Vous avez quitté la startup.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur');
    },
  });
};

export const transferOwnership = async (
  startupId: string,
  newOwnerMemberId: string,
): Promise<{ status: string }> => {
  const response = await api.post(`startup/${startupId}/transfer-ownership`, {
    json: { newOwnerMemberId },
  });
  const result = await response.json() as { success: boolean; data: { status: string } };
  return result.data;
};

export const useTransferOwnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ startupId, newOwnerMemberId }: { startupId: string; newOwnerMemberId: string }) =>
      transferOwnership(startupId, newOwnerMemberId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      queryClient.invalidateQueries({ queryKey: ['user-startups'] });
      toast.success('Propriété transférée avec succès.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du transfert');
    },
  });
};

export const deleteStartup = async (startupId: string): Promise<{ status: string }> => {
  const response = await api.delete(`startup/${startupId}`);
  const result = await response.json() as { success: boolean; data: { status: string } };
  return result.data;
};

export const useDeleteStartup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (startupId: string) => deleteStartup(startupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-startups'] });
      toast.success('Startup supprimée.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
};

// =============================================
// STARTUP PENDING INVITATIONS (for admins)
// =============================================

export interface PendingInvitation {
  id: string;
  position: string;
  role: string;
  status: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  expiresAt: string;
  invitedProfile?: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  invitedBy: {
    id: string;
    name: string;
  };
}

export const getStartupPendingInvitations = async (startupId: string): Promise<PendingInvitation[]> => {
  try {
    const response = await api.get(`startup/${startupId}/invitations`);
    const result = await response.json() as { success: boolean; data: PendingInvitation[] };
    return result.data;
  } catch {
    return [];
  }
};

export const useStartupPendingInvitations = (startupId: string, enabled = true) => {
  return useQuery({
    queryKey: ['startup-pending-invitations', startupId],
    queryFn: () => getStartupPendingInvitations(startupId),
    enabled: !!startupId && enabled,
    staleTime: 60 * 1000,
  });
};

export const cancelStartupInvitation = async (
  startupId: string,
  invitationId: string,
): Promise<{ status: string; invitationId: string }> => {
  const response = await api.delete(`startup/${startupId}/invitations/${invitationId}`);
  const result = await response.json() as { success: boolean; data: { status: string; invitationId: string } };
  return result.data;
};

export const useCancelStartupInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ startupId, invitationId }: { startupId: string; invitationId: string }) =>
      cancelStartupInvitation(startupId, invitationId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup-pending-invitations', variables.startupId] });
      queryClient.invalidateQueries({ queryKey: ['startup', variables.startupId] });
      toast.success('Invitation annulée');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'annulation');
    },
  });
};

// --- Investor Invitation API ---

export interface InvestorInvitationDetails {
  id: string;
  invitationStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  firstName: string | null;
  lastName: string | null;
  isExpired: boolean;
  startup: {
    id: string;
    name: string;
    logo: string | null;
  };
  fundingRound: string;
  fundingDate: string;
}

export interface MyInvestment {
  id: string;
  invitationStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  isVisible: boolean;
  isLead: boolean;
  respondedAt: string | null;
  createdAt: string;
  fundingHistory: {
    id: string;
    date: string;
    amountRaised: number;
    round: string;
  };
  startup: {
    id: string;
    name: string;
    logo: string | null;
    tagline: string | null;
  };
}

export const getInvestorInvitationByToken = async (
  token: string,
): Promise<InvestorInvitationDetails> => {
  const response = await api.get(`startup/investor-invitation/token/${token}`);
  const result = (await response.json()) as { success: boolean; data: InvestorInvitationDetails };
  return result.data;
};

export const acceptInvestorInvitationByToken = async (
  token: string,
): Promise<{ id: string; invitationStatus: string }> => {
  const response = await api.put(`startup/investor-invitation/token/${token}/accept`);
  const result = (await response.json()) as { success: boolean; data: { id: string; invitationStatus: string } };
  return result.data;
};

export const declineInvestorInvitationByToken = async (
  token: string,
): Promise<{ id: string; invitationStatus: string }> => {
  const response = await api.put(`startup/investor-invitation/token/${token}/decline`);
  const result = (await response.json()) as { success: boolean; data: { id: string; invitationStatus: string } };
  return result.data;
};

export const acceptInvestorInvitation = async (
  invitationId: string,
): Promise<{ id: string; invitationStatus: string; startupName: string; startupId: string }> => {
  const response = await api.put(`startup/investor-invitation/${invitationId}/accept`);
  const result = (await response.json()) as { success: boolean; data: any };
  return result.data;
};

export const declineInvestorInvitation = async (
  invitationId: string,
): Promise<{ id: string; invitationStatus: string; startupName: string; startupId: string }> => {
  const response = await api.put(`startup/investor-invitation/${invitationId}/decline`);
  const result = (await response.json()) as { success: boolean; data: any };
  return result.data;
};

export const toggleInvestorVisibility = async (
  invitationId: string,
  isVisible: boolean,
): Promise<{ id: string; isVisible: boolean }> => {
  const response = await api.put(`startup/investor-invitation/${invitationId}/visibility`, {
    json: { isVisible },
  });
  const result = (await response.json()) as { success: boolean; data: { id: string; isVisible: boolean } };
  return result.data;
};

export const getMyInvestments = async (): Promise<MyInvestment[]> => {
  const response = await api.get('startup/my-investments');
  const result = (await response.json()) as { success: boolean; data: MyInvestment[] };
  return result.data;
};

export const useInvestorInvitationByToken = (token: string) => {
  return useQuery({
    queryKey: ['investor-invitation', token],
    queryFn: () => getInvestorInvitationByToken(token),
    enabled: !!token,
  });
};

export const useAcceptInvestorInvitationByToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => acceptInvestorInvitationByToken(token),
    onSuccess: (_data, token) => {
      queryClient.invalidateQueries({ queryKey: ['investor-invitation', token] });
      queryClient.invalidateQueries({ queryKey: ['my-investments'] });
      toast.success('Invitation acceptée !');
    },
    onError: () => {
      toast.error('Erreur lors de l\'acceptation');
    },
  });
};

export const useDeclineInvestorInvitationByToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => declineInvestorInvitationByToken(token),
    onSuccess: (_data, token) => {
      queryClient.invalidateQueries({ queryKey: ['investor-invitation', token] });
      queryClient.invalidateQueries({ queryKey: ['my-investments'] });
      toast.success('Invitation refusée');
    },
    onError: () => {
      toast.error('Erreur lors du refus');
    },
  });
};

export const useAcceptInvestorInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => acceptInvestorInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-investments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Invitation acceptée !');
    },
    onError: () => {
      toast.error('Erreur lors de l\'acceptation');
    },
  });
};

export const useDeclineInvestorInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => declineInvestorInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-investments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Invitation refusée');
    },
    onError: () => {
      toast.error('Erreur lors du refus');
    },
  });
};

export const useToggleInvestorVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invitationId, isVisible }: { invitationId: string; isVisible: boolean }) =>
      toggleInvestorVisibility(invitationId, isVisible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-investments'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });
};

export const useMyInvestments = () => {
  return useQuery({
    queryKey: ['my-investments'],
    queryFn: getMyInvestments,
    staleTime: 5 * 60 * 1000,
  });
};
