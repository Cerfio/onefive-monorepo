import React, { useState } from 'react';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Tooltip } from '@/components/base/tooltip/tooltip';

// Types pour les mentions
interface MentionPart {
  type: 'mention';
  content: string;
  username: string;
  userId?: string;
  isVerified?: boolean;
  isOnline?: boolean;
}

interface TextPart {
  type: 'text';
  content: string;
}

type ParsedPart = MentionPart | TextPart;

interface MentionTextAdvancedProps {
  text: string;
  onMentionClick?: (username: string, userId?: string) => void;
  onMessageUser?: (username: string, userId?: string) => void;
  onFollowUser?: (username: string, userId?: string) => void;
  showQuickActions?: boolean;
}

// Composant avancé pour les mentions avec dropdown d'actions
const MentionTextAdvanced: React.FC<MentionTextAdvancedProps> = ({ 
  text, 
  onMentionClick,
  onMessageUser: _onMessageUser,
  onFollowUser: _onFollowUser,
  showQuickActions = true
}) => {
  const [_hoveredMention, setHoveredMention] = useState<string | null>(null);

  // Returns basic user data from username - profile details loaded on hover/click
  const getUserData = (username: string) => {
    return {
      id: `user_${username}`,
      name: username,
      title: 'Utilisateur Onefive',
      avatar: null as string | null,
      isVerified: false,
      isOnline: false,
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
          isVerified: userData.isVerified,
          isOnline: userData.isOnline
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
          
          const MentionContent = (
            <div
              className="inline-block"
              onMouseEnter={() => setHoveredMention(part.username)}
              onMouseLeave={() => setHoveredMention(null)}
            >
              <Badge
                color="blue"
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all cursor-pointer border border-blue-200 hover:border-blue-300 hover:shadow-sm"
              >
                <Avatar
                  size="xxs"
                  src={userData.avatar}
                  initials={part.username.charAt(0).toUpperCase()}
                  className="ring-1 ring-white"
                  status={part.isOnline ? "online" : "offline"}
                  verified={part.isVerified}
                />
                
                <span className="text-xs font-medium max-w-[80px] truncate">
                  {part.content.length > 12 ? `@${part.username.slice(0, 8)}...` : part.content}
                </span>
                
                {part.isVerified && (
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </Badge>
            </div>
          );

          if (showQuickActions) {
            return (
              <Tooltip
                key={index}
                title={`${userData.name} - ${userData.title}`}
                placement="top"
              >
                <div
                  onClick={() => onMentionClick?.(part.username, part.userId)}
                >
                  {MentionContent}
                </div>
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
              <div
                onClick={() => onMentionClick?.(part.username, part.userId)}
              >
                {MentionContent}
              </div>
            </Tooltip>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </>
  );
};

export default MentionTextAdvanced;
