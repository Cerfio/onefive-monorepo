// URL de l'app onefive (onefive-front). Défaut: localhost:3002 pour le dev local.
const base = process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/+$/, '') || 'http://localhost:3002';

export function getFrontendUrl(path: string): string {
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getPostUrl(postId: string): string {
  return getFrontendUrl(`/feed/${postId}`);
}

export function getDiscussionUrl(discussionId: string): string {
  return getFrontendUrl(`/discussions/${discussionId}`);
}

export function getProfileUrl(profileId: string): string {
  return getFrontendUrl(`/profile/${profileId}`);
}

export function getStartupUrl(startupId: string): string {
  return getFrontendUrl(`/startup/${startupId}`);
}

export function getSpotlightUrl(spotId: string): string {
  return getFrontendUrl(`/spotlight/${spotId}`);
}

export function hasFrontendUrl(): boolean {
  return true; // Toujours afficher le lien (base a une valeur par défaut)
}
