import { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CardContent } from '@/components/ui';
import { BuildInPublicPost } from '@/components/feed/BuildInPublicPost';
import { decodeBuildInPublicData, hasBuildInPublicData } from '@/utils/buildInPublic';
import { MentionText } from '@/features/post/components/post/MentionText';
import { Avatar } from '@/components/base/avatar/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Repeat2 } from 'lucide-react';
import { Badge } from '@/components/base/badges/badges';
import { Tags } from '@/enums';
import NestedRepostContent from './NestedRepostContent';
import ProjectAvatar from './ProjectAvatar';
import PostTypeBadge from './PostTypeBadge';
import { MediaType } from '../../post.api';

// Composant pour afficher un seul média
const PostMedia: React.FC<{ media: string | MediaType; index: number }> = ({ media, index }) => {
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'document' | 'unknown'>('unknown');

  const mediaUrl = typeof media === 'string' ? media : media.url;
  const mediaMimeType = typeof media === 'string' ? null : media.mimeType;
  const mediaFileName = typeof media === 'string' ? null : media.fileName;

  // Détecter le type au montage du composant
  useEffect(() => {
    if (!mediaUrl) return;

    // Si le type MIME est fourni, l'utiliser directement
    if (mediaMimeType) {
      if (mediaMimeType.startsWith('video/')) {
        setMediaType('video');
        return;
      } else if (mediaMimeType.startsWith('image/')) {
        setMediaType('image');
        return;
      } else {
        setMediaType('document');
        return;
      }
    }

    // Fonction pour détecter le type de média basé sur les headers HTTP
    const detectMediaType = async (url: string) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');

        if (contentType?.startsWith('video/')) {
          setMediaType('video');
        } else if (contentType?.startsWith('image/')) {
          setMediaType('image');
        } else if (contentType === 'application/pdf' || 
                   contentType === 'application/msword' ||
                   contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   contentType === 'application/vnd.ms-excel' ||
                   contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   contentType?.startsWith('application/') ||
                   contentType?.startsWith('text/')) {
          setMediaType('document');
        } else {
          const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('.avi');
          const isDocument = url.includes('.pdf') || url.includes('.doc') || url.includes('.docx') || 
                            url.includes('.xls') || url.includes('.xlsx') || url.includes('.ppt') || 
                            url.includes('.pptx') || url.includes('.txt');
          if (isVideo) {
            setMediaType('video');
          } else if (isDocument) {
            setMediaType('document');
          } else {
            setMediaType('image');
          }
        }
      } catch {
        const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('.avi');
        const isDocument = url.includes('.pdf') || url.includes('.doc') || url.includes('.docx') || 
                          url.includes('.xls') || url.includes('.xlsx') || url.includes('.ppt') || 
                          url.includes('.pptx') || url.includes('.txt');
        if (isVideo) {
          setMediaType('video');
        } else if (isDocument) {
          setMediaType('document');
        } else {
          setMediaType('image');
        }
      }
    };

    detectMediaType(mediaUrl);
  }, [mediaUrl, mediaMimeType]);

  // Fonction pour obtenir le nom du fichier depuis l'URL
  const getFileName = (url: string) => {
    if (mediaFileName) return mediaFileName;
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1] || `Document ${index + 1}`;
    } catch {
      return `Document ${index + 1}`;
    }
  };

  // Fonction pour obtenir l'icône du type de fichier
  const getFileIcon = (url: string) => {
    if (url.includes('.pdf')) return '📄';
    if (url.includes('.doc') || url.includes('.docx')) return '📝';
    if (url.includes('.xls') || url.includes('.xlsx')) return '📊';
    if (url.includes('.ppt') || url.includes('.pptx')) return '📊';
    return '📎';
  };

  return (
    <div className="rounded overflow-hidden bg-gray-100">
      {mediaType === 'video' ? (
        <video
          src={mediaUrl}
          controls
          className="w-full h-auto max-h-96"
          preload="metadata"
          onError={() => {}}
        >
          Your browser does not support the video tag.
        </video>
      ) : mediaType === 'image' ? (
        <img
          src={mediaUrl || '/placeholder.svg'}
          alt={`Post media ${index + 1}`}
          className="w-full h-auto max-h-96 object-cover"
          onError={() => {
            setMediaType('document');
          }}
        />
      ) : mediaType === 'document' ? (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center gap-3 hover:bg-gray-100 hover:border-[#5E6AD2] transition-colors cursor-pointer"
        >
          <div className="text-4xl">{getFileIcon(mediaUrl)}</div>
          <div className="text-sm font-medium text-gray-700 text-center px-4">
            {getFileName(mediaUrl)}
          </div>
          <div className="text-xs text-gray-500">
            Cliquez pour ouvrir
          </div>
        </a>
      ) : (
        // Loading state ou fallback
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

interface RepostedPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  mediaUrls: (string | MediaType)[];
  tags: string[];
  createdAt: string;
  isRepost?: boolean; // Flag pour indiquer que B est aussi un repost
}

interface Props {
  content?: string | null;
  mediaUrls?: (string | MediaType)[] | null;
  repostedPost?: RepostedPost | null;
  onTagClick?: (tag: Tags) => void;
}

const PostContent: React.FC<Props> = ({
  content = '',
  mediaUrls,
  repostedPost,
  onTagClick,
}) => {
  const router = useRouter();
  const safeMediaUrls = Array.isArray(mediaUrls) ? mediaUrls : [];
  
  // Decode build in public data if present
  const { visibleContent, buildInPublicData } = decodeBuildInPublicData(content || '');
  const isBuildInPublic = hasBuildInPublicData(content || '');

  // Decode build in public data for reposted post if present
  const repostedContentData = repostedPost?.content 
    ? decodeBuildInPublicData(repostedPost.content)
    : { visibleContent: repostedPost?.content || '', buildInPublicData: null };
  const isRepostedBuildInPublic = repostedPost?.content 
    ? hasBuildInPublicData(repostedPost.content)
    : false;

  // Check if this is a repost without content (same logic as Post.tsx)
  const isRepostWithoutContent = !!repostedPost?.isRepost && (!repostedPost.content || repostedPost.content.trim().length === 0);

  return (
    <CardContent className="mb-3 px-4">
      {/* Contenu du repost (commentaire de l'utilisateur qui reposte) */}
      {content && content.trim().length > 0 && (
        <MentionText className="text-sm whitespace-pre-line mb-3" text={visibleContent || content} />
      )}
      {isBuildInPublic && buildInPublicData && (
        <BuildInPublicPost
          content={visibleContent}
          buildInPublicData={buildInPublicData}
        />
      )}
      
      {/* Post original reposté */}
      {repostedPost && (
        <>
          {isRepostWithoutContent && repostedPost.id ? (
            // Pour un repost sans contenu, afficher le post original complet (même logique que Post.tsx)
            <div className={content && content.trim().length > 0 ? 'mt-3' : 'mt-0'}>
              <Link 
                href={`/feed/${repostedPost.id}`}
                className="block border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 hover:border-[#5E6AD2]/30 transition-all duration-200 cursor-pointer"
              >
                <NestedRepostContent postId={repostedPost.id} onTagClick={onTagClick} />
              </Link>
            </div>
          ) : (
            <Link 
              href={`/feed/${repostedPost.id}`}
              className={`block border border-gray-200 rounded-lg p-4 ${content && content.trim().length > 0 ? 'mt-3' : 'mt-0'} bg-gray-50 hover:bg-gray-100 hover:border-[#5E6AD2]/30 transition-all duration-200 cursor-pointer`}
            >
              {/* Header avec auteur et badges BUILD_IN_PUBLIC */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <Avatar
                    size="sm"
                    src={repostedPost.author.avatar}
                    alt={repostedPost.author.name}
                    initials={repostedPost.author.name.split(' ').map(n => n[0]).join('')}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">
                        {repostedPost.author.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        · {formatDistanceToNow(new Date(repostedPost.createdAt), { addSuffix: true, locale: fr })}
                      </span>
                      {/* Indicateur visuel que B est aussi un repost */}
                      {repostedPost.isRepost && (
                        <Badge 
                          type="pill-color"
                          color="brand"
                          size="sm"
                          className="text-xs px-2 py-0.5 h-5 flex items-center gap-1"
                        >
                          <Repeat2 className="h-3 w-3" />
                          Repost
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Badge du projet pour tous les posts Build in Public */}
                  {repostedContentData.buildInPublicData && (repostedContentData.buildInPublicData?.projectId || repostedContentData.buildInPublicData?.projectName) && (
                    <>
                      {repostedContentData.buildInPublicData?.projectId ? (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/startups/${repostedContentData.buildInPublicData!.projectId}`);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <ProjectAvatar 
                            projectId={repostedContentData.buildInPublicData.projectId}
                            projectName={repostedContentData.buildInPublicData.projectName}
                            size="sm"
                          />
                          <span className="font-medium">{repostedContentData.buildInPublicData.projectName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
                          <ProjectAvatar 
                            projectId={repostedContentData.buildInPublicData.projectId || ''}
                            projectName={repostedContentData.buildInPublicData.projectName}
                            size="sm"
                          />
                          <span className="font-medium">{repostedContentData.buildInPublicData.projectName}</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* Badge de type de post (Launch, Update, Milestone, Metrics) */}
                  {repostedContentData.buildInPublicData?.type && (
                    <PostTypeBadge buildInPublicData={repostedContentData.buildInPublicData} />
                  )}
                </div>
              </div>
              
              <MentionText
                className="text-sm text-gray-800 whitespace-pre-line mb-3"
                text={repostedContentData.visibleContent || repostedPost.content}
              />
              
              {isRepostedBuildInPublic && repostedContentData.buildInPublicData && (
                <BuildInPublicPost
                  content={repostedContentData.visibleContent}
                  buildInPublicData={repostedContentData.buildInPublicData}
                />
              )}
              
              {repostedPost.mediaUrls && repostedPost.mediaUrls.length > 0 && (
                <div className={`grid ${repostedPost.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                  {repostedPost.mediaUrls.map((media, idx) => (
                    <PostMedia key={`reposted-media-${idx}-${typeof media === 'string' ? media : media.url}`} media={media} index={idx} />
                  ))}
                </div>
              )}
            </Link>
          )}
        </>
      )}
      
      {safeMediaUrls.length > 0 && (
        <div
          className={`mt-3 grid ${
            safeMediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
          } gap-2`}
        >
          {safeMediaUrls.map((media, index) => (
            <PostMedia key={`media-${index}-${typeof media === 'string' ? media : media.url}`} media={media} index={index} />
          ))}
        </div>
      )}
    </CardContent>
  );
};

export default memo(PostContent);
