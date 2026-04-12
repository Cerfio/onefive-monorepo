'use client';

import { Edit3, Building, GraduationCap, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/base/badges/badges';
import { getSectorColor } from '@/shared/constants/sector-colors';

export const StartupAbout = ({ startupData, currentUser, onEdit }: {
  startupData: any;
  currentUser: boolean;
  onEdit: () => void;
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">À propos</h3>
        {currentUser && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Secteurs */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Secteurs
          </h4>
          <div className="flex flex-wrap gap-2">
            {startupData.sectors && startupData.sectors.length > 0 ? (
              startupData.sectors.map((sector: string, index: number) => (
                <Badge key={index} type="pill-color" color={getSectorColor(sector)} size="md">
                  {sector}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-400">Aucun secteur</span>
            )}
          </div>
        </div>

        {/* Technologies */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Technologies
          </h4>
          <div className="flex flex-wrap gap-2">
            {startupData.technologies && startupData.technologies.length > 0 ? (
              startupData.technologies.map((tech: string, index: number) => (
                <Badge key={index} type="pill-color" color="gray" size="md">{tech}</Badge>
              ))
            ) : (
              <span className="text-sm text-gray-400">Aucune technologie</span>
            )}
          </div>
        </div>
      </div>

      {/* Informations complémentaires */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{startupData.location}</span>
        </div>
        {startupData.founded && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Fondée en {startupData.founded}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building className="w-4 h-4" />
          <span>{startupData.employees} employés</span>
        </div>
        {startupData.website && (
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="w-4 h-4 text-gray-600" />
            <a href={startupData.website} className="text-blue-600 hover:underline">
              {startupData.website.replace('https://', '').replace('http://', '')}
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}; 