import { memo } from 'react';
import { useStartup } from '@/queries/startup';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectAvatarProps {
  projectId: string;
  projectName?: string;
  size?: 'sm' | 'md';
}

const ProjectAvatar: React.FC<ProjectAvatarProps> = ({
  projectId,
  projectName,
  size = 'md',
}) => {
  const { data: startup, isLoading } = useStartup(projectId);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
  };

  const textSizeClasses = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
  };

  if (isLoading) {
    return <Skeleton className={`${sizeClasses[size]} rounded`} />;
  }

  const displayName = startup?.name || projectName || 'N/A';
  const logo = startup?.logo;

  // Si on a un logo, on l'affiche
  if (logo) {
    return (
      <img
        src={logo}
        alt={displayName}
        className={`${sizeClasses[size]} rounded object-cover`}
      />
    );
  }

  // Sinon, on affiche un carré avec les 2 premières lettres
  const initials = displayName
    .replace(/\s+/g, '') // Enlever les espaces
    .slice(0, 2) // Prendre les 2 premiers caractères
    .toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold ${textSizeClasses[size]}`}
    >
      {initials}
    </div>
  );
};

export default memo(ProjectAvatar);

