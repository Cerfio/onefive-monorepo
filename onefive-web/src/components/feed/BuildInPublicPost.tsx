'use client';

import { BuildInPublicMetrics, Metric } from './BuildInPublicMetrics';
import { cn } from '@/lib/utils';

export interface BuildInPublicData {
  type?: 'update' | 'metrics' | 'launch';
  projectId?: string; // Lien optionnel vers un projet Onefive
  projectName?: string; // Nom du projet
  templateId?: string; // ID du template utilisé
  metrics?: Metric[];
  launch?: {
    product: string;
    description?: string;
    productId?: string; // ID du produit Onefive
    productUrl?: string; // URL externe du produit
    productLogo?: string; // URL du logo du produit
  };
}

interface BuildInPublicPostProps {
  content?: string | null;
  buildInPublicData?: BuildInPublicData;
  className?: string;
}

const getTypeEmoji = (type?: string) => {
  switch (type) {
    case 'launch':
      return '🚀';
    case 'metrics':
      return '📊';
    default:
      return '📝';
  }
};

const getTypeLabel = (type?: string) => {
  switch (type) {
    case 'launch':
      return 'Lancement';
    case 'metrics':
      return 'Métriques';
    default:
      return 'Update';
  }
};

export const BuildInPublicPost: React.FC<BuildInPublicPostProps> = ({
  content: _content,
  buildInPublicData,
  className,
}) => {
  if (!buildInPublicData) return null;

  const { type, metrics, projectId, projectName } = buildInPublicData;

  return (
    <div className={cn('mt-4 space-y-3', className)}>
      {/* Type Badge minimaliste (si pas de projet affiché) */}
      {!projectId && !projectName && type && (
        <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <span>{getTypeEmoji(type)}</span>
          <span className="font-medium">{getTypeLabel(type)}</span>
        </div>
      )}

      {/* Metrics - Design compact */}
      {metrics && metrics.length > 0 && (
        <BuildInPublicMetrics metrics={metrics} />
      )}
    </div>
  );
};
