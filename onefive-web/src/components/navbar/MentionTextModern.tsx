import React from 'react';
import { BadgeWithImage } from '@/components/base/badges/badges';
import { Tooltip } from '@/components/base/tooltip/tooltip';

// Types pour les mentions
interface MentionPart {
  type: 'mention';
  content: string;
  username: string;
  userId?: string;
  isVerified?: boolean;
}

interface TextPart {
  type: 'text';
  content: string;
}

type ParsedPart = MentionPart | TextPart;

interface MentionTextProps {
  text: string;
  onMentionClick?: (username: string, userId?: string) => void;
  onMessageUser?: (username: string, userId?: string) => void;
  onFollowUser?: (username: string, userId?: string) => void;
  showQuickActions?: boolean;
}

// Composant moderne pour les mentions avec BadgeWithImage
const MentionTextModern: React.FC<MentionTextProps> = ({ 
  text, 
  onMentionClick,
  onMessageUser: _onMessageUser,
  onFollowUser: _onFollowUser,
  showQuickActions = true
}) => {
  // Returns basic user data from username - profile details loaded on hover/click
  const getUserData = (username: string) => {
    return {
      id: `user_${username}`,
      name: username,
      title: 'Utilisateur Onefive',
      avatar: null as string | null,
      isVerified: false,
      followers: 0,
    };
  };

  const parseMentions = (text: string): ParsedPart[] => {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const parts: ParsedPart[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      if (match[1]) {
        const userData = getUserData(match[1]);
        parts.push({
          type: 'mention',
          content: match[0],
          username: match[1],
          userId: userData.id,
          isVerified: userData.isVerified
        });
      }
      
      lastIndex = mentionRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return parts;
  };

  const parts = parseMentions(text);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          const userData = getUserData(part.username);
          
          const MentionBadge = (
            <BadgeWithImage
              type="color"
              color="brand"
              size="sm"
              imgSrc={userData.avatar ?? ''}
            >
              {part.content.length > 12 ? `@${part.username.slice(0, 8)}...` : part.content}
              {part.isVerified && (
                <div className="w-1 h-1 bg-white rounded-full ml-1" />
              )}
            </BadgeWithImage>
          );

          if (showQuickActions) {
            return (
              <Tooltip
                key={index}
                title={
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={userData.avatar ?? ''} 
                        alt={userData.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm">{userData.name}</span>
                          {part.isVerified && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{userData.title}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300">{userData.followers} followers • Cliquer pour voir le profil</p>
                  </div>
                }
                placement="top"
              >
                <button
                  className="inline-block cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onMentionClick?.(part.username, part.userId)}
                >
                  {MentionBadge}
                </button>
              </Tooltip>
            );
          }

          // Version simple avec tooltip
          return (
            <Tooltip
              key={index}
              title={`${userData.name} - ${userData.title}`}
              placement="top"
            >
              <button
                className="inline-block cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onMentionClick?.(part.username, part.userId)}
              >
                {MentionBadge}
              </button>
            </Tooltip>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </>
  );
};

export default MentionTextModern;
