import React from 'react';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Tooltip } from '@/components/base/tooltip/tooltip';

// Types pour les mentions
interface MentionPart {
  type: 'mention';
  content: string;
  username: string;
}

interface TextPart {
  type: 'text';
  content: string;
}

type ParsedPart = MentionPart | TextPart;

interface MentionTextProps {
  text: string;
}

// Composant pour afficher les mentions avec avatars et style distinctif
const MentionText: React.FC<MentionTextProps> = ({ text }) => {
  // Fonction pour obtenir l'avatar d'un utilisateur (simulation)
  const getUserAvatar = (username: string) => {
    const avatarColors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-orange-500 to-orange-600',
      'from-teal-500 to-teal-600'
    ];
    const colorIndex = username.length % avatarColors.length;
    return {
      color: avatarColors[colorIndex],
      initial: username.charAt(0).toUpperCase()
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
      
      if (match[1]) { // Vérification que le username existe
        parts.push({
          type: 'mention',
          content: match[0],
          username: match[1]
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
          const avatar = getUserAvatar(part.username);
          return (
            <Tooltip 
              key={index}
              title={`Voir le profil de ${part.username}`}
              placement="top"
            >
              <Badge
                color="blue"
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 hover:border-blue-300"
              >
                {/* Avatar Untitled UI */}
                <Avatar
                  size="xxs"
                  initials={avatar.initial}
                  className="ring-1 ring-white"
                />
                
                {/* Nom d'utilisateur avec troncature */}
                <span className="text-xs font-medium max-w-[80px] truncate">
                  {part.content.length > 12 ? `@${part.username.slice(0, 8)}...` : part.content}
                </span>
              </Badge>
            </Tooltip>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </>
  );
};

export default MentionText; 