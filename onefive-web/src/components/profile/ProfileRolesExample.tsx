'use client';

/**
 * EXEMPLE D'UTILISATION DU SYSTÈME DE RÔLES
 * 
 * Ce fichier montre comment intégrer le système de rôles dans différents contextes.
 * Il peut servir de référence pour l'implémentation dans les pages réelles.
 * 
 * ⚠️ Ce fichier est un exemple et ne doit pas être utilisé directement en production.
 */

import React, { useState } from 'react';
import { ProfileRole, getProfileRoleMetadata } from '@/sharing-enum/profile';
import {
  ProfileRoleBadge,
  ProfileRoleBadges,
} from './ProfileRoleBadge';
import {
  ProfileRoleSelector,
  ProfileRoleCheckboxList,
} from './ProfileRoleSelector';

// ========================================
// EXEMPLE 1 : Affichage de badges
// ========================================
export function ProfileRolesDisplayExample() {
  const userRoles: ProfileRole[] = [
    ProfileRole.FOUNDER,
    ProfileRole.MENTOR,
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">Affichage de Rôles</h2>

      {/* Badge unique - Variante par défaut */}
      <div>
        <h3 className="text-sm font-medium mb-2">Badge simple</h3>
        <ProfileRoleBadge role={ProfileRole.FOUNDER} />
      </div>

      {/* Badge unique - Variante compacte */}
      <div>
        <h3 className="text-sm font-medium mb-2">Badge compact</h3>
        <ProfileRoleBadge role={ProfileRole.FOUNDER} variant="compact" />
      </div>

      {/* Badge unique - Variante complète */}
      <div>
        <h3 className="text-sm font-medium mb-2">Badge complet</h3>
        <ProfileRoleBadge role={ProfileRole.FOUNDER} variant="full" />
      </div>

      {/* Plusieurs badges */}
      <div>
        <h3 className="text-sm font-medium mb-2">Plusieurs badges</h3>
        <ProfileRoleBadges roles={userRoles} />
      </div>

      {/* Plusieurs badges avec limite */}
      <div>
        <h3 className="text-sm font-medium mb-2">Avec limite (max 1)</h3>
        <ProfileRoleBadges roles={userRoles} max={1} />
      </div>
    </div>
  );
}

// ========================================
// EXEMPLE 2 : Formulaire avec sélecteur
// ========================================
export function ProfileRolesFormExample() {
  const [selectedRoles, setSelectedRoles] = useState<ProfileRole[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simuler un appel API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: selectedRoles }),
      });

      if (response.ok) {
        alert('Rôles mis à jour avec succès !');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Formulaire de Sélection</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Sélectionnez vos rôles (maximum 3)
          </label>
          <ProfileRoleSelector
            value={selectedRoles}
            onChange={setSelectedRoles}
            max={3}
          />
        </div>

        {/* Aperçu des rôles sélectionnés */}
        {selectedRoles.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Rôles sélectionnés :</p>
            <ProfileRoleBadges roles={selectedRoles} />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || selectedRoles.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}

// ========================================
// EXEMPLE 3 : Filtrage par rôles
// ========================================
export function ProfileRolesFilterExample() {
  const [filterRoles, setFilterRoles] = useState<ProfileRole[]>([]);
  const [profiles] = useState([
    {
      id: '1',
      name: 'Alice Dupont',
      roles: [ProfileRole.FOUNDER, ProfileRole.MENTOR],
    },
    {
      id: '2',
      name: 'Bob Martin',
      roles: [ProfileRole.BUSINESS_ANGEL],
    },
    {
      id: '3',
      name: 'Charlie Durand',
      roles: [ProfileRole.FOUNDER, ProfileRole.SERVICE_PROVIDER],
    },
  ]);

  // Filtrer les profils selon les rôles sélectionnés
  const filteredProfiles = filterRoles.length === 0
    ? profiles
    : profiles.filter((profile) =>
        profile.roles.some((role) => filterRoles.includes(role))
      );

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold">Filtrage par Rôles</h2>

      {/* Filtres */}
      <div>
        <h3 className="text-sm font-medium mb-2">
          Filtrer par rôles ({filterRoles.length} sélectionné{filterRoles.length > 1 ? 's' : ''})
        </h3>
        <ProfileRoleCheckboxList
          value={filterRoles}
          onChange={setFilterRoles}
        />
      </div>

      {/* Résultats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Profils trouvés ({filteredProfiles.length})
        </h3>
        <div className="space-y-3">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <h4 className="font-medium mb-2">{profile.name}</h4>
              <ProfileRoleBadges roles={profile.roles} max={3} />
            </div>
          ))}
          {filteredProfiles.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucun profil trouvé avec ces rôles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// EXEMPLE 4 : Carte de profil
// ========================================
export function ProfileCardExample() {
  const profile = {
    id: '1',
    firstName: 'Alice',
    lastName: 'Dupont',
    bio: 'Fondatrice de TechStartup, passionnée par l\'innovation et le mentorat',
    roles: [ProfileRole.FOUNDER, ProfileRole.MENTOR],
    avatar: null,
  };

  return (
    <div className="max-w-md p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
          {profile.firstName[0]}{profile.lastName[0]}
        </div>
        
        {/* Nom */}
        <div className="flex-1">
          <h3 className="text-xl font-bold">
            {profile.firstName} {profile.lastName}
          </h3>
          <div className="mt-1">
            <ProfileRoleBadges roles={profile.roles} variant="compact" max={3} />
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-muted-foreground mb-4">
        {profile.bio}
      </p>

      {/* Rôles détaillés */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Rôles dans l'écosystème
        </p>
        {profile.roles.map((role) => {
          const metadata = getProfileRoleMetadata(role);
          if (!metadata) return null;

          return (
            <div
              key={role}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-xl">{metadata.emoji}</span>
              <span>{metadata.shortLabelMale}</span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-2">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Voir le profil
        </button>
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
          Message
        </button>
      </div>
    </div>
  );
}

// ========================================
// EXEMPLE 5 : Page complète (démo)
// ========================================
export function ProfileRolesFullExample() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">
          🎯 Système de Rôles - Exemples
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProfileRolesDisplayExample />
          <ProfileRolesFormExample />
          <ProfileRolesFilterExample />
          <ProfileCardExample />
        </div>
      </div>
    </div>
  );
}

