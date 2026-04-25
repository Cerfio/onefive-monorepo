import { memo } from 'react';
import { PostDisplayReason, PostDisplayReasonType } from '../../post.api';
import { Badge } from '@/components/ui';
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Hash, 
  DollarSign, 
  User, 
  Sparkles, 
  MapPin, 
  Calendar, 
  AtSign 
} from 'lucide-react';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';

interface PostDisplayBadgeProps {
  displayReason: PostDisplayReasonType;
  className?: string;
}

const PostDisplayBadge: React.FC<PostDisplayBadgeProps> = ({ 
  displayReason, 
  className = '' 
}) => {
  const getBadgeConfig = (reason: PostDisplayReasonType) => {
    switch (reason) {
      case PostDisplayReason.RECOMMENDATION:
        return {
          label: 'Recommandé',
          variant: 'secondary' as const,
          icon: <Heart className="w-3 h-3" />,
          color: 'text-pink-600 bg-pink-50 border-pink-200',
          tooltip: 'Ce post vous est recommandé en fonction de vos intérêts et de votre activité'
        };
      case PostDisplayReason.RELATION:
        return {
          label: 'Votre réseau',
          variant: 'secondary' as const,
          icon: <Users className="w-3 h-3" />,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          tooltip: 'Ce post provient de votre réseau (connexions, abonnements)'
        };
      case PostDisplayReason.TRENDING:
        return {
          label: 'Tendance',
          variant: 'secondary' as const,
          icon: <TrendingUp className="w-3 h-3" />,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          tooltip: 'Ce post est populaire et en tendance actuellement'
        };
      case PostDisplayReason.FOLLOWED_HASHTAG:
        return {
          label: 'Hashtag suivi',
          variant: 'secondary' as const,
          icon: <Hash className="w-3 h-3" />,
          color: 'text-green-600 bg-green-50 border-green-200',
          tooltip: 'Ce post contient des hashtags que vous suivez'
        };
      case PostDisplayReason.SPONSORED:
        return {
          label: 'Sponsorisé',
          variant: 'secondary' as const,
          icon: <DollarSign className="w-3 h-3" />,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          tooltip: 'Contenu sponsorisé - Cette publication est une publicité'
        };
      case PostDisplayReason.YOUR_POST:
        return {
          label: 'Votre publication',
          variant: 'secondary' as const,
          icon: <User className="w-3 h-3" />,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          tooltip: 'Votre propre publication'
        };
      case PostDisplayReason.NEW_CONTENT:
        return {
          label: 'Nouveau',
          variant: 'secondary' as const,
          icon: <Sparkles className="w-3 h-3" />,
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          tooltip: 'Nouveau contenu dans vos domaines d\'intérêt'
        };
      case PostDisplayReason.LOCATION_BASED:
        return {
          label: 'Local',
          variant: 'secondary' as const,
          icon: <MapPin className="w-3 h-3" />,
          color: 'text-teal-600 bg-teal-50 border-teal-200',
          tooltip: 'Contenu local ou régional basé sur votre géolocalisation'
        };
      case PostDisplayReason.EVENT_RELATED:
        return {
          label: 'Événement',
          variant: 'secondary' as const,
          icon: <Calendar className="w-3 h-3" />,
          color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
          tooltip: 'Contenu lié à des événements que vous suivez'
        };
      case PostDisplayReason.MENTIONED:
        return {
          label: 'Mention',
          variant: 'secondary' as const,
          icon: <AtSign className="w-3 h-3" />,
          color: 'text-rose-600 bg-rose-50 border-rose-200',
          tooltip: 'Vous êtes mentionné(e) dans ce post'
        };
      default:
        return {
          label: 'Post',
          variant: 'secondary' as const,
          icon: null,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          tooltip: 'Publication standard'
        };
    }
  };

  const config = getBadgeConfig(displayReason);

  return (
    <Tooltip title={config.tooltip}>
      <TooltipTrigger>
        <Badge
          type="pill-color"
          color="gray"
          size="sm"
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border cursor-help ${config.color} ${className}`}
        >
          {config.icon}
          {config.label}
        </Badge>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default memo(PostDisplayBadge);
