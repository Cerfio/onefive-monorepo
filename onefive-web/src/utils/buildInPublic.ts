import { BuildInPublicData } from '@/components/feed/BuildInPublicPost';

const BUILD_IN_PUBLIC_MARKER = '<!--BUILD_IN_PUBLIC:';
const BUILD_IN_PUBLIC_END = '-->';

/**
 * Encode les données build in public dans le contenu du post
 * Format: content + <!--BUILD_IN_PUBLIC:JSON_DATA-->
 */
export function encodeBuildInPublicData(
  content: string,
  data: BuildInPublicData | null
): string {
  if (!data) return content;

  // Extraire le contenu visible (sans les métadonnées existantes)
  const visibleContent = extractVisibleContent(content);

  // Encoder les données en JSON
  const jsonData = JSON.stringify(data);
  const encoded = `${BUILD_IN_PUBLIC_MARKER}${jsonData}${BUILD_IN_PUBLIC_END}`;

  return `${visibleContent}\n${encoded}`;
}

/**
 * Décode les données build in public du contenu du post
 */
export function decodeBuildInPublicData(
  content: string
): { visibleContent: string; buildInPublicData: BuildInPublicData | null } {
  const markerIndex = content.indexOf(BUILD_IN_PUBLIC_MARKER);
  
  if (markerIndex === -1) {
    return { visibleContent: content, buildInPublicData: null };
  }

  const visibleContent = content.substring(0, markerIndex).trim();
  const encodedStart = markerIndex + BUILD_IN_PUBLIC_MARKER.length;
  const encodedEnd = content.indexOf(BUILD_IN_PUBLIC_END, encodedStart);
  
  if (encodedEnd === -1) {
    return { visibleContent, buildInPublicData: null };
  }

  try {
    const jsonData = content.substring(encodedStart, encodedEnd);
    let buildInPublicData = JSON.parse(jsonData) as BuildInPublicData;
    
    // Rétrocompatibilité : convertir les anciens posts 'milestone' en 'update'
    if ((buildInPublicData as any).type === 'milestone') {
      // Nettoyer l'objet en retirant milestone et convertissant le type
      const { milestone, ...rest } = buildInPublicData as any;
      buildInPublicData = { ...rest, type: 'update' } as BuildInPublicData;
    }
    
    return { visibleContent, buildInPublicData };
  } catch (error) {
    console.error('Error decoding build in public data:', error);
    return { visibleContent, buildInPublicData: null };
  }
}

/**
 * Extrait le contenu visible (sans les métadonnées)
 */
function extractVisibleContent(content: string): string {
  const markerIndex = content.indexOf(BUILD_IN_PUBLIC_MARKER);
  if (markerIndex === -1) return content;
  return content.substring(0, markerIndex).trim();
}

/**
 * Vérifie si un post contient des données build in public
 */
export function hasBuildInPublicData(content: string): boolean {
  return content.includes(BUILD_IN_PUBLIC_MARKER);
}

