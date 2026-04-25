import { memo } from 'react';
import { Badge } from '@/components/ui';
import { Rocket, Calendar, TrendingUp } from 'lucide-react';
import { BuildInPublicData } from '@/components/feed/BuildInPublicPost';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';

interface PostTypeBadgeProps {
  buildInPublicData?: BuildInPublicData;
  className?: string;
}

const PostTypeBadge: React.FC<PostTypeBadgeProps> = ({ 
  buildInPublicData, 
  className = '' 
}) => {
  if (!buildInPublicData?.type) return null;

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'launch':
        return {
          label: 'Launch',
          icon: <Rocket className="w-3 h-3" />,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          tooltip: 'Lancement de produit'
        };
      case 'update':
        return {
          label: 'Update',
          icon: <Calendar className="w-3 h-3" />,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          tooltip: 'Mise à jour'
        };
      case 'metrics':
        return {
          label: 'Métriques',
          icon: <TrendingUp className="w-3 h-3" />,
          color: 'text-green-600 bg-green-50 border-green-200',
          tooltip: 'Métriques partagées'
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig(buildInPublicData.type);
  if (!config) return null;

  return (
    <Tooltip title={config.tooltip}>
      <TooltipTrigger>
        <Badge 
          type="pill-color" color="gray"
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border cursor-help ${config.color} ${className}`}
        >
          {config.icon}
          {config.label}
        </Badge>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default memo(PostTypeBadge);

