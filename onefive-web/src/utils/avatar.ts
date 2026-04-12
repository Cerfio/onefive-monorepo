export const getAvatarUrl = (avatarId?: string | null): string | undefined => {
  if (!avatarId) {
    return undefined;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    return undefined;
  }

  return `${baseUrl}/file/${avatarId}`;
};

export const resolveAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) {
    return undefined;
  }

  // Ensure avatar is a string before calling string methods
  const avatarString = typeof avatar === 'string' ? avatar : String(avatar);
  
  if (avatarString.startsWith('http')) {
    return avatarString;
  }

  return getAvatarUrl(avatarString);
};
