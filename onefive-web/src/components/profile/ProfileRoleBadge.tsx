import React from 'react';
import { ProfileRole, getProfileRoleMetadata, getGenderedShortLabel, getGenderedLongLabel, type GenderPreference } from '@/sharing-enum/profile';
import { cn } from '@/lib/utils';

interface ProfileRoleBadgeProps {
  role: ProfileRole;
  variant?: 'default' | 'compact' | 'full';
  className?: string;
  /** Préférence de genre pour l'affichage genré des labels (MALE, FEMALE, OTHER). Par défaut MALE. */
  genderPreference?: GenderPreference;
}

/**
 * Composant d'affichage d'un badge de rôle de profil
 * 
 * @param role - Le rôle à afficher
 * @param variant - Variante d'affichage:
 *   - 'default': Emoji + label court
 *   - 'compact': Emoji seul (avec tooltip)
 *   - 'full': Emoji + label court + label long (description)
 * @param genderPreference - Préférence de genre pour adapter les labels (MALE/FEMALE/OTHER)
 *   - Par défaut MALE si non fourni
 *   - OTHER est traité comme MALE
 */
export function ProfileRoleBadge({
  role,
  variant = 'default',
  className,
  genderPreference = 'MALE',
}: ProfileRoleBadgeProps) {
  const metadata = getProfileRoleMetadata(role);

  if (!metadata) {
    return null;
  }

  const { emoji, color } = metadata;
  
  // Utiliser les labels genrés
  const shortLabel = getGenderedShortLabel(role, genderPreference);
  const longLabel = getGenderedLongLabel(role, genderPreference);

  // Compact: Emoji seul
  if (variant === 'compact') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center',
          'w-8 h-8 rounded-full',
          'cursor-default transition-transform hover:scale-110',
          className
        )}
        style={{ backgroundColor: `${color}20`, color }}
        title={`${shortLabel} - ${longLabel}`}
      >
        <span className="text-lg">{emoji}</span>
      </span>
    );
  }

  // Full: Emoji + labels
  if (variant === 'full') {
    return (
      <div
        className={cn(
          'inline-flex flex-col gap-1 p-3 rounded-lg',
          'border transition-all hover:shadow-md',
          className
        )}
        style={{ borderColor: color, backgroundColor: `${color}08` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span
            className="font-semibold text-sm"
            style={{ color }}
          >
            {shortLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground ml-8">
          {longLabel}
        </p>
      </div>
    );
  }

  // Default: Emoji + label court
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'text-xs font-medium',
        'border transition-all hover:shadow-sm',
        className
      )}
      style={{ borderColor: color, backgroundColor: `${color}15`, color }}
      title={longLabel}
    >
      <span>{emoji}</span>
      <span>{shortLabel}</span>
    </span>
  );
}

/**
 * Composant pour afficher plusieurs badges de rôles
 */
interface ProfileRoleBadgesProps {
  roles: ProfileRole[];
  variant?: 'default' | 'compact' | 'full';
  max?: number;
  className?: string;
  /** Préférence de genre pour l'affichage genré des labels (MALE, FEMALE, OTHER) */
  genderPreference?: GenderPreference;
}

export function ProfileRoleBadges({
  roles,
  variant = 'default',
  max,
  className,
  genderPreference,
}: ProfileRoleBadgesProps) {
  const displayRoles = max ? roles.slice(0, max) : roles;
  const remainingCount = max && roles.length > max ? roles.length - max : 0;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayRoles.map((role) => (
        <ProfileRoleBadge key={role} role={role} variant={variant} genderPreference={genderPreference} />
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center',
            'px-2.5 py-1 rounded-full',
            'text-xs font-medium',
            'bg-muted text-muted-foreground'
          )}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

