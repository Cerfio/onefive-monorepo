'use client';

import { Card } from '@/components/base/card/card';
import { Badge } from '@/components/base/badges/badges';
import { Building2, MapPin, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useUserStartups, useProfileStartups, UserStartup } from '@/queries/startup';
import { formatLocationDisplay } from '@/lib/country';
import { Skeleton } from '@/components/base/skeleton/skeleton';

interface ProfileStartupsCardProps {
  profileId: string;
  currentUser: boolean;
}

export const ProfileStartupsCard = ({ profileId, currentUser }: ProfileStartupsCardProps) => {
  // Utiliser le hook approprié selon si c'est l'utilisateur courant ou un autre utilisateur
  const { data: userStartups, isLoading: isLoadingUserStartups } = useUserStartups();
  const { data: profileStartups, isLoading: isLoadingProfileStartups } = useProfileStartups(
    currentUser ? undefined : profileId
  );

  const startups = currentUser ? userStartups : profileStartups;
  const isLoading = currentUser ? isLoadingUserStartups : isLoadingProfileStartups;
  const _error = currentUser ? undefined : undefined; // Les erreurs sont gérées par les hooks

  if (isLoading) {
    return (
      <Card className="p-6 border border-gray-200">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-600" />
          Startups
        </h3>
        <Badge type="pill-color" color="gray" size="sm">
          {startups?.length}
        </Badge>
      </div>

      <div className="space-y-4">
        {startups && startups.length > 0 ? startups.map((startup: UserStartup) => (
          <Link
            key={startup.id}
            href={`/startup/${startup.id}`}
            className="block group"
          >
            <div className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
              {/* Logo */}
              <div className="flex-shrink-0">
                {startup.logo ? (
                  <img
                    src={startup.logo}
                    alt={startup.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {startup.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors truncate">
                      {startup.name}
                    </h4>
                    {startup.tagline && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {startup.tagline}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors flex-shrink-0 mt-1" />
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {startup.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{formatLocationDisplay(startup.location)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{startup.membersCount} membre{startup.membersCount > 1 ? 's' : ''}</span>
                  </div>
                  {startup.followersCount > 0 && (
                    <span>{startup.followersCount} abonné{startup.followersCount > 1 ? 's' : ''}</span>
                  )}
                </div>

                {/* Badge du rôle */}
                {startup.role && (
                  <div className="mt-2">
                    <Badge
                      type="pill-color"
                      color="purple"
                      size="sm"
                    >
                      {startup.position || startup.role}
                      {startup.equity > 0 && ` • ${startup.equity}%`}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Link>
        )) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Aucune startup</p>
          </div>
        )}
      </div>
    </Card>
  );
};

