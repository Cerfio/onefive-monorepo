import { api } from '@/utils/kyInstance';
import { z } from 'zod';
import { useQuery } from "@tanstack/react-query";

const categorySchema = z.object({
  name: z.string(),
  fileCount: z.number(),
  id: z.string(),
});

const invitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  status: z.string(),
  invitedAt: z.string(),
});

const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  memberCount: z.number(),
  invitations: z.array(invitationSchema).optional(),
});

const fileSchema = z.object({
  category: z.string(),
  viewCount: z.number(),
  size: z.number(),
  name: z.string(),
  id: z.string(),
  mimetype: z.string(),
  storageId: z.string().optional(),
  uploadedBy: z.string().optional(),
  createdAt: z.string(),
});

const dataroomResponseSchema = z.object({
  code: z.number().optional(),
  message: z.string().optional(),
  data: z.object({
    startupId: z.string(),
    name: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
    viewCount: z.number(),
    documentCount: z.number(),
    lastActivity: z.string().nullable().optional(),
    categories: z.array(categorySchema),
    groups: z.array(groupSchema),
    files: z.array(fileSchema),
    totalViews: z.number(),
    uniqueViewers: z.number(),
    avgSessionDuration: z.number(),
  }),
});

const signedUrlResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    url: z.string(),
  }),
});

const createCategoryResponseSchema = z.object({
  code: z.number().optional(),
  message: z.string().optional(),
  success: z.boolean().optional(),
  data: z.object({
    id: z.string(),
  }),
});

const createGroupResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
  }),
});

const _singleFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  mimetype: z.string(),
  createdAt: z.string().datetime(),
});

const fileResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    mimetype: z.string(),
    storageId: z.string(),
    category: z.object({
      id: z.string(),
      name: z.string(),
    }),
    uploadedBy: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

const dataroomItemSchema = z.object({
  id: z.string(),
  startupId: z.string(),
  documentCount: z.number(),
  viewCount: z.number(),
  memberCount: z.number(),
  lastActivity: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isOwner: z.boolean(),
  notificationCount: z.number(),
  logo: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
});

const dataroomsResponseSchema = z.object({
  code: z.number().optional(),
  message: z.string().optional(),
  data: z.object({
    datarooms: z.array(dataroomItemSchema).optional(),
    items: z.array(dataroomItemSchema).optional(),
    total: z.number().optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
    hasMore: z.boolean().optional(),
  }),
});

export const getDataroom = async ({ dataroomId }: { dataroomId: string }) => {
  try {
    const response = await api.get(`dataroom/${dataroomId}`,
    );
    const parse = dataroomResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    throw error;
  }
};

export const uploadFiles = async (dataroomId: string, formData: FormData) => {
  try {
    const response = await api.post(`dataroom/${dataroomId}/file`,
      {
        body: formData,
      },
    );
    return response.json();
  } catch (error: any) {
    throw error;
  }
};

export const getSignedUrl = async (dataroomId: string, fileId: string, action?: 'view' | 'download') => {
  try {
    const searchParams = new URLSearchParams();
    if (action) {
      searchParams.append('action', action);
    }
    const queryString = searchParams.toString();
    const path = `dataroom/${dataroomId}/file/${fileId}/signed-url${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(path);
    const parse = signedUrlResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    throw error;
  }
};

export const getDataroomFiles = async ({ dataroomId, categoryId }: { dataroomId: string; categoryId?: string }) => {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('dataroomId', dataroomId);
    if (categoryId) {
      searchParams.append('categoryId', categoryId);
    }

    const response = await api.get(`dataroom/files?${searchParams.toString()}`);
    const listFileSchema = z.object({
      id: z.string(),
      name: z.string(),
      size: z.number(),
      mimetype: z.string(),
      storageId: z.string(),
      category: z.object({
        id: z.string(),
        name: z.string(),
      }),
      uploadedBy: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    });
    const parse = z.object({
      code: z.number().optional(),
      message: z.string().optional(),
      data: z.object({
        files: z.array(listFileSchema).optional(),
        items: z.array(listFileSchema).optional(),
        total: z.number(),
        page: z.number().optional(),
        pageSize: z.number().optional(),
        hasMore: z.boolean().optional(),
      }),
    }).parse(await response.json());
    // Transform to match expected format with category as string
    const files = parse.data.files ?? parse.data.items ?? [];
    return files.map(file => ({
      ...file,
      category: file.category.name,
      viewCount: 0, // Backend doesn't return viewCount in list endpoint
    }));
  } catch (error: any) {
    throw error;
  }
};

export const deleteFile = async ({ dataroomId, fileId }: { dataroomId: string; fileId: string }) => {
  try {
    const response = await api.delete(`dataroom/${dataroomId}/file/${fileId}`
    );
    return response.json();
  } catch (error: any) {
    throw error;
  }
};

export const createCategory = async ({ dataroomId, name }: { dataroomId: string; name: string }) => {
  try {
    const response = await api.post(`dataroom/${dataroomId}/category`,
      {
        json: { name },
      },
    );
    const parse = createCategoryResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteCategory = async ({ dataroomId, categoryId }: { dataroomId: string; categoryId: string }) => {
  try {
    const response = await api.delete(`dataroom/${dataroomId}/category/${categoryId}`,
    );
    return response.json();
  } catch (error: any) {
    throw error;
  }
};

export const updateCategory = async ({ dataroomId, categoryId, name }: { dataroomId: string; categoryId: string; name: string }) => {
  try {
    const response = await api.put(`dataroom/${dataroomId}/category/${categoryId}`,
      {
        json: { name },
      },
    );
    return response.json();
  } catch (error: any) {
    throw error;
  }
};

export const getFile = async ({ dataroomId, fileId }: { dataroomId: string; fileId: string }) => {
  try {
    const response = await api.get(`dataroom/${dataroomId}/file/${fileId}`,
    );
    const parse = fileResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    throw error;
  }
};

export const updateFile = async ({ dataroomId, fileId, name, categoryId }: { dataroomId: string; fileId: string; name?: string; categoryId?: string }) => {
  try {
    const body: any = {};
    if (name !== undefined) body.name = name;
    if (categoryId !== undefined) body.categoryId = categoryId;
    
    const response = await api.put(`dataroom/${dataroomId}/file/${fileId}`,
      {
        json: body,
      },
    );
    return response.json();
  } catch (error: any) {
    throw error;
  }
};

export const getDatarooms = async () => {
  try {
    const response = await api.get('dataroom',
    );
    const parse = dataroomsResponseSchema.parse(await response.json());
    return parse.data.items ?? parse.data.datarooms;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw new Error('Unable to fetch datarooms: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      throw new Error('Unable to fetch datarooms: Error ONE-2');
    } else {
      throw new Error('Unable to fetch datarooms: Error ONE-3');
    }
  }
};

export const useDataroom = (slug: string) => {
    return useQuery(['dataroom', slug], () => getDataroom({ dataroomId: slug }));
};

export const createGroup = async ({ 
  dataroomId, 
  name, 
  hasAllAccess, 
  canUpload, 
  canShare, 
  canManageUsers, 
  canManageGroups 
}: { 
  dataroomId: string; 
  name: string; 
  hasAllAccess: boolean;
  canUpload: boolean;
  canShare: boolean;
  canManageUsers: boolean;
  canManageGroups: boolean;
}) => {
  try {
    const response = await api.post(`dataroom/${dataroomId}/group`,
      {
        json: { 
          name, 
          hasAllAccess, 
          canUpload, 
          canShare, 
          canManageUsers, 
          canManageGroups 
        },
      },
    );
    const parse = createGroupResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    throw error;
  }
};

export const updateGroup = async ({ 
  dataroomId, 
  groupId, 
  name 
}: { 
  dataroomId: string; 
  groupId: string; 
  name: string; 
}) => {
  try {
    const response = await api.put(`dataroom/${dataroomId}/group/${groupId}`,
      {
        json: { name },
      },
    );
    return response.json();
  } catch (error: any) {
    throw error;
  }
};

export const deleteGroup = async ({ 
  dataroomId, 
  groupId 
}: { 
  dataroomId: string; 
  groupId: string; 
}) => {
  try {
    const response = await api.delete(`dataroom/${dataroomId}/group/${groupId}`,
    );
    return response.json();
  } catch (error: any) {
    throw error;
  }
};

export const leaveDataroom = async ({ dataroomId }: { dataroomId: string }) => {
  try {
    const response = await api.delete(`dataroom/${dataroomId}/leave`);
    return response.json();
  } catch (error: any) {
    throw error;
  }
};

// Invitation API functions
const createInvitationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
  }),
});

export const createInvitation = async ({ 
  dataroomId, 
  groupId, 
  profileId, 
  existingUser,
  newUser 
}: { 
  dataroomId: string; 
  groupId: string; 
  profileId: string;
  existingUser?: {
    profileInvitedId: string;
  };
  newUser?: {
    email: string;
    firstname: string;
    lastname: string;
    dataroomName: string;
  };
}) => {
  try {
    const response = await api.post(`dataroom/${dataroomId}/invitation`,
      {
        json: { 
          groupId, 
          profileId,
          existingUser,
          newUser
        },
      },
    );
    const parse = createInvitationResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    throw error;
  }
};

const invitationActionResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(), // Les données retournées varient selon l'action (invitation object ou { success: true })
});

export const acceptInvitation = async ({ 
  dataroomId, 
  invitationId, 
  profileId 
}: { 
  dataroomId: string; 
  invitationId: string; 
  profileId: string;
}) => {
  try {
    const response = await api.put(`dataroom/${dataroomId}/invitation/${invitationId}/accept`,
      {
        json: { profileId },
      },
    );
    const parse = invitationActionResponseSchema.parse(await response.json());
    return parse; // Retourne l'objet complet avec success et data
  } catch (error: any) {
    throw error;
  }
};

export const declineInvitation = async ({ 
  dataroomId, 
  invitationId, 
  profileId 
}: { 
  dataroomId: string; 
  invitationId: string; 
  profileId: string;
}) => {
  try {
    const response = await api.put(`dataroom/${dataroomId}/invitation/${invitationId}/decline`,
      {
        json: { profileId },
      },
    );
    const parse = invitationActionResponseSchema.parse(await response.json());
    return parse; // Retourne l'objet complet avec success et data
  } catch (error: any) {
    throw error;
  }
};

export const deleteInvitation = async ({ 
  dataroomId, 
  invitationId, 
  profileId 
}: { 
  dataroomId: string; 
  invitationId: string; 
  profileId: string;
}) => {
  try {
    const response = await api.delete(`dataroom/${dataroomId}/invitation/${invitationId}`,
      {
        json: { profileId },
      },
    );
    const parse = invitationActionResponseSchema.parse(await response.json());
    return parse; // Retourne l'objet complet avec success et data
  } catch (error: any) {
    throw error;
  }
};

// Group API functions
const getGroupResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    type: z.number(), // Le type est un enum numérique (0 = DEFAULT, 1 = CUSTOM)
    isEditable: z.boolean(),
    hasAllAccess: z.boolean(),
    canUpload: z.boolean(),
    canShare: z.boolean(),
    canManageUsers: z.boolean(),
    canManageGroups: z.boolean(),
    permissions: z.array(z.object({
      categoryId: z.string(),
      canView: z.boolean(),
      canDownload: z.boolean(),
      canComment: z.boolean(),
    })),
    members: z.array(z.object({
      id: z.string(),
      profileId: z.string(),
      createdAt: z.string(),
      name: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      role: z.string().optional(),
      avatar: z.string().nullable().optional(),
    })),
    invitations: z.array(z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      status: z.string(),
      invitedAt: z.string(),
    })),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const getGroup = async ({ 
  dataroomId, 
  groupId 
}: { 
  dataroomId: string; 
  groupId: string;
}) => {
  try {
    const response = await api.get(`dataroom/${dataroomId}/group/${groupId}`,
    );
    const parse = getGroupResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    throw error;
  }
};

const _updateGroupPermissionsResponseSchema = z.object({
  success: z.boolean(),
});

export const removeMember = async ({
  dataroomId,
  groupId,
  memberId,
}: {
  dataroomId: string;
  groupId: string;
  memberId: string;
}) => {
  try {
    const response = await api.delete(`dataroom/${dataroomId}/group/${groupId}/member/${memberId}`);
    return response.json();
  } catch (error: any) {
    throw error;
  }
};

export const updateGroupPermissions = async ({ 
  dataroomId, 
  groupId,
  permissions,
}: { 
  dataroomId: string; 
  groupId: string;
  permissions: Array<{
    categoryId: string;
    canView: boolean;
    canDownload: boolean;
    canComment: boolean;
  }>;
}) => {
  try {
    const response = await api.put(`dataroom/${dataroomId}/group/${groupId}/permissions`,
      {
        json: { permissions },
      },
    );
    return response.json();
  } catch (error: any) {
    throw error;
  }
};
// ==================== SHARE LINKS (lien de partage sécurisé) ====================

export interface DataroomShareLink {
  id: string;
  token: string;
  requireEmail: boolean;
  expiresAt: string | null;
  redeemCount: number;
  createdAt: string;
  group: { id: string; name: string };
}

export const createShareLink = async ({
  dataroomId,
  groupId,
  requireEmail,
  expiresInDays,
}: {
  dataroomId: string;
  groupId: string;
  requireEmail?: boolean;
  expiresInDays?: number;
}): Promise<{ id: string; token: string }> => {
  const response = await api.post(`dataroom/${dataroomId}/share-links`, {
    json: { groupId, requireEmail, expiresInDays },
  });
  const json = (await response.json()) as { data: { id: string; token: string } };
  return json.data;
};

export const listShareLinks = async (
  dataroomId: string,
): Promise<DataroomShareLink[]> => {
  const response = await api.get(`dataroom/${dataroomId}/share-links`);
  const json = (await response.json()) as { data: DataroomShareLink[] };
  return json.data;
};

export const revokeShareLink = async ({
  dataroomId,
  linkId,
}: {
  dataroomId: string;
  linkId: string;
}): Promise<void> => {
  await api.delete(`dataroom/${dataroomId}/share-links/${linkId}`);
};

export const redeemShareLink = async (
  token: string,
): Promise<{ dataroomId: string }> => {
  const response = await api.post(`dataroom/share/${token}/redeem`);
  const json = (await response.json()) as { data: { dataroomId: string } };
  return json.data;
};
