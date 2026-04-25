import React from 'react';
import { Card, CardContent } from '@/components/base/card/card';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { MapPin, Users, Rocket, Navigation } from 'lucide-react';
import { getCountryName } from '@/lib/country';

interface LocationPin {
  id: string;
  city: string;
  countryCode: string;
  coordinates: { lat: number; lng: number };
  peopleCount: number;
  startupsCount: number;
  people: any[];
  startups: any[];
  isHotspot: boolean;
}

interface NetworkMapProps {
  locations: LocationPin[];
  activeTab: 'people' | 'startups';
  onLocationSelect: (location: LocationPin) => void;
  className?: string;
}

const NetworkMap: React.FC<NetworkMapProps> = ({
  locations,
  activeTab,
  onLocationSelect,
  className = ''
}) => {
  const [selectedLocation, setSelectedLocation] = React.useState<LocationPin | null>(null);
  const [hoveredLocation, setHoveredLocation] = React.useState<string | null>(null);

  // Simuler une carte avec une grille européenne
  const gridPositions = {
    'London': { x: 45, y: 35 },
    'Paris': { x: 48, y: 42 },
    'Berlin': { x: 58, y: 32 },
    'Madrid': { x: 35, y: 60 },
    'Barcelona': { x: 45, y: 58 },
    'Amsterdam': { x: 52, y: 28 },
    'Milan': { x: 58, y: 48 },
    'Stockholm': { x: 65, y: 15 },
    'Dublin': { x: 35, y: 28 },
    'Lyon': { x: 50, y: 48 }
  };

  const getLocationPosition = (city: string) => {
    return gridPositions[city as keyof typeof gridPositions] || { x: 50, y: 50 };
  };

  const getPinColor = (location: LocationPin) => {
    if (location.isHotspot) return 'bg-red-500 border-red-600';
    if (activeTab === 'people' && location.peopleCount > 5) return 'bg-blue-500 border-blue-600';
    if (activeTab === 'startups' && location.startupsCount > 3) return 'bg-green-500 border-green-600';
    return 'bg-gray-400 border-gray-500';
  };

  const getPinSize = (location: LocationPin) => {
    const total = activeTab === 'people' ? location.peopleCount : location.startupsCount;
    if (total > 10) return 'w-6 h-6';
    if (total > 5) return 'w-5 h-5';
    return 'w-4 h-4';
  };

  const handleLocationClick = (location: LocationPin) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className={`relative ${className}`}>
      <Card className="w-full h-96 relative overflow-hidden">
        <CardContent className="p-0 h-full relative">
          {/* Fond de carte stylisé */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            <svg
              className="w-full h-full opacity-10"
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 150 Q100 100, 150 130 T250 120 Q300 110, 350 140"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M80 200 Q130 180, 180 190 T280 185 Q320 180, 360 200"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>

          {/* Pins de localisation */}
          {locations.map(location => {
            const position = getLocationPosition(location.city);
            const isHovered = hoveredLocation === location.id;
            const isSelected = selectedLocation?.id === location.id;

            return (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  zIndex: isHovered || isSelected ? 20 : 10
                }}
                onClick={() => handleLocationClick(location)}
                onMouseEnter={() => setHoveredLocation(location.id)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {/* Pin principal */}
                <div
                  className={`
                    ${getPinSize(location)} 
                    ${getPinColor(location)}
                    rounded-full border-2 shadow-lg
                    flex items-center justify-center text-white font-bold text-xs
                    ${isHovered ? 'scale-125' : 'scale-100'}
                    ${isSelected ? 'ring-4 ring-blue-300' : ''}
                    transition-all duration-200
                  `}
                >
                  {activeTab === 'people' ? location.peopleCount : location.startupsCount}
                </div>

                {/* Tooltip au survol */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="bg-black bg-opacity-90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      <div className="font-semibold">{location.city}, {getCountryName(location.countryCode)}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {location.peopleCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Rocket className="h-3 w-3" />
                          {location.startupsCount}
                        </div>
                      </div>
                      {location.isHotspot && (
                        <Badge type="pill-color" color="error" size="sm" className="mt-1">
                          Hotspot
                        </Badge>
                      )}
                    </div>
                    {/* Flèche du tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="border-4 border-transparent border-t-black border-t-opacity-90"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Légende */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg">
            <div className="text-sm font-semibold mb-2">Légende</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Zone active ({activeTab === 'people' ? 'Profils' : 'Startups'})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Hotspot entrepreneurial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>Zone émergente</span>
              </div>
            </div>
          </div>

          {/* Contrôles de navigation */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              color="secondary"
              className="bg-white bg-opacity-95 hover:bg-opacity-100"
            >
              <Navigation className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              color="secondary"
              className="bg-white bg-opacity-95 hover:bg-opacity-100"
              onClick={() => setSelectedLocation(null)}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Panel d'informations de la localisation sélectionnée */}
      {selectedLocation && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">
                  {selectedLocation.city}, {getCountryName(selectedLocation.countryCode)}
                </h3>
                {selectedLocation.isHotspot && (
                  <Badge type="pill-color" color="error" size="sm">Hotspot</Badge>
                )}
              </div>
              <Button
                color="tertiary"
                size="sm"
                onClick={() => setSelectedLocation(null)}
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm">
                  <strong>{selectedLocation.peopleCount}</strong> profils
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-gray-600" />
                <span className="text-sm">
                  <strong>{selectedLocation.startupsCount}</strong> startups
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                Explorer {selectedLocation.city}
              </Button>
              <Button size="sm" color="secondary">
                Voir les événements
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NetworkMap; 