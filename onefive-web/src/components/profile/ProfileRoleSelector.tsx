'use client';

import React from 'react';
import {
  ProfileRole,
  getAllProfileRolesWithMetadata,
} from '@/sharing-enum/profile';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProfileRoleSelectorProps {
  value: ProfileRole[];
  onChange: (roles: ProfileRole[]) => void;
  max?: number;
  className?: string;
}

/**
 * Composant de sélection de rôles de profil
 * Permet de sélectionner un ou plusieurs rôles dans l'écosystème
 */
export function ProfileRoleSelector({
  value,
  onChange,
  max,
  className,
}: ProfileRoleSelectorProps) {
  const allRoles = getAllProfileRolesWithMetadata();

  const toggleRole = (role: ProfileRole) => {
    if (value.includes(role)) {
      // Désélectionner
      onChange(value.filter((r) => r !== role));
    } else {
      // Sélectionner (si pas de limite ou limite non atteinte)
      if (!max || value.length < max) {
        onChange([...value, role]);
      }
    }
  };

  const isSelected = (role: ProfileRole) => value.includes(role);
  const isDisabled = (role: ProfileRole) =>
    !isSelected(role) && max !== undefined && value.length >= max;

  return (
    <div className={cn('space-y-3', className)}>
      {max && (
        <p className="text-sm text-muted-foreground">
          Sélectionnez jusqu'à {max} rôle{max > 1 ? 's' : ''} ({value.length}/{max})
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allRoles.map(({ role, metadata }) => {
          const selected = isSelected(role);
          const disabled = isDisabled(role);

          return (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              disabled={disabled}
              className={cn(
                'relative flex items-start gap-3 p-4 rounded-lg border-2',
                'text-left transition-all',
                'hover:shadow-md focus:outline-none',
                selected && 'shadow-sm',
                disabled && 'opacity-50 cursor-not-allowed',
                !disabled && 'cursor-pointer'
              )}
              style={{
                borderColor: selected ? metadata.color : '#e5e7eb',
                backgroundColor: selected ? `${metadata.color}08` : 'transparent',
              }}
            >
              {/* Checkmark */}
              {selected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: metadata.color }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Emoji */}
              <span className="text-3xl flex-shrink-0">{metadata.emoji}</span>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <h4
                  className="font-semibold text-sm mb-1"
                  style={{ color: selected ? metadata.color : 'inherit' }}
                >
                  {metadata.shortLabelMale}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {metadata.longLabelMale}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Variante simple sous forme de liste de checkboxes
 */
interface ProfileRoleCheckboxListProps {
  value: ProfileRole[];
  onChange: (roles: ProfileRole[]) => void;
  max?: number;
  className?: string;
}

export function ProfileRoleCheckboxList({
  value,
  onChange,
  max,
  className,
}: ProfileRoleCheckboxListProps) {
  const allRoles = getAllProfileRolesWithMetadata();

  const toggleRole = (role: ProfileRole) => {
    if (value.includes(role)) {
      onChange(value.filter((r) => r !== role));
    } else {
      if (!max || value.length < max) {
        onChange([...value, role]);
      }
    }
  };

  const isSelected = (role: ProfileRole) => value.includes(role);
  const isDisabled = (role: ProfileRole) =>
    !isSelected(role) && max !== undefined && value.length >= max;

  return (
    <div className={cn('space-y-2', className)}>
      {max && (
        <p className="text-sm text-muted-foreground mb-3">
          Sélectionnez jusqu'à {max} rôle{max > 1 ? 's' : ''} ({value.length}/{max})
        </p>
      )}
      {allRoles.map(({ role, metadata }) => {
        const selected = isSelected(role);
        const disabled = isDisabled(role);

        return (
          <label
            key={role}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              'cursor-pointer transition-all hover:bg-muted/50',
              selected && 'bg-muted/50 border-primary',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggleRole(role)}
              disabled={disabled}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-xl">{metadata.emoji}</span>
            <div className="flex-1">
              <span className="font-medium text-sm">{metadata.shortLabelMale}</span>
            </div>
          </label>
        );
      })}
    </div>
  );
}

