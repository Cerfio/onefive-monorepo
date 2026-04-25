import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MapPin, Calendar, Users, ExternalLink, Navigation, Share2, Building } from 'lucide-react';
import { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import Image from 'next/image';
import Link from 'next/link';

interface MapCenter {
  lat: number;
  lng: number;
}

interface PurpleIcon {
  url: string;
  scaledSize: google.maps.Size;
}

interface SpotlightMapProps {
  mapCenter: MapCenter;
  filteredData: any[];
  purpleIcon: PurpleIcon | null;
  onCenterChanged: () => void;
  onMapRef: (map: google.maps.Map | null) => void;
  hoveredSpotId?: string | null;
  selectedSpotId?: string | null;
  onSpotClick?: (spotId: string) => void;
  onSpotShare?: (spotId: string, spotName: string) => void;
}

interface SpotInfo {
  id: string;
  name: string;
  highlight: string;
  address: string;
  image: string | null;
  url: string;
  location: {
    lat: number;
    lng: number;
  };
  provider: string;
  spot: string;
  event?: {
    beginDate?: string;
    endDate?: string;
    attendees?: number;
  };
}

const SPOT_TYPE_LABELS: Record<string, string> = {
  EVENT: 'Événement',
  CONTEST: 'Concours',
  INCUBATOR: 'Incubateur',
  ACCELERATOR: 'Accélérateur',
  COWORKINGSPACE: 'Coworking',
};

export const SpotlightMap = ({
  mapCenter,
  filteredData,
  purpleIcon,
  onCenterChanged,
  onMapRef,
  hoveredSpotId,
  selectedSpotId,
  onSpotClick,
  onSpotShare,
}: SpotlightMapProps) => {
  const [selectedSpot, setSelectedSpot] = useState<SpotInfo | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<MapCenter | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  // Prevents onCenterChanged from firing a refetch after marker click auto-pan
  const suppressCenterChange = useRef(false);

  const spots = useMemo(() =>
    filteredData.filter((spot: any) => spot.location?.lat && spot.location?.lng),
    [filteredData]
  );

  const getUserLocation = useCallback(() => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        () => setIsLocating(false),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }
  }, []);

  const handleMarkerClick = useCallback((spot: SpotInfo) => {
    // Suppress center-change events for 1.5s to avoid refetch from InfoWindow auto-pan
    suppressCenterChange.current = true;
    setTimeout(() => { suppressCenterChange.current = false; }, 1500);
    setSelectedSpot(spot);
    onSpotClick?.(spot.id);
  }, [onSpotClick]);

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedSpot(null);
  }, []);

  const handleShareSpot = useCallback((spot: SpotInfo) => {
    onSpotShare?.(spot.id, spot.name);
  }, [onSpotShare]);

  const handleNavigateToSpot = useCallback((spot: SpotInfo) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${spot.location.lat},${spot.location.lng}`,
      '_blank'
    );
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const makeMarkerIcon = useCallback((spot: SpotInfo) => {
    const isHovered = hoveredSpotId === spot.id;
    const isSelected = selectedSpotId === spot.id;
    const size = isHovered || isSelected ? 34 : 24;
    const fill = isHovered ? '#4338CA' : isSelected ? '#DC2626' : '#5E6AD2';
    const strokeWidth = isHovered || isSelected ? 3 : 2;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${fill}" stroke="white" stroke-width="${strokeWidth}"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    };
  }, [hoveredSpotId, selectedSpotId]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[400px] lg:h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white sticky top-8"
    >
      <AnimatePresence>
        {!isMapLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-8 w-8 text-[#5E6AD2]" />
              </motion.div>
              <p className="text-sm text-gray-600 font-medium">Chargement de la carte...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-[#5E6AD2]" />
            <span className="font-medium">{spots.length} spot{spots.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 right-16 z-20">
        <Tooltip title="Ma position">
          <Button
            size="sm"
            color="secondary"
            className="h-10 w-10 p-0 bg-white/90 hover:bg-white shadow-lg"
            onClick={getUserLocation}
            isDisabled={isLocating}
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>
      </div>
      
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={13}
        onLoad={(map) => {
          onMapRef(map);
          setIsMapLoaded(true);
        }}
        onUnmount={() => onMapRef(null)}
        onCenterChanged={() => {
          if (!suppressCenterChange.current) onCenterChanged();
        }}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
          ]
        }}
      >
        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={purpleIcon || undefined}
            title="Votre position"
            zIndex={1000}
          />
        )}
        
        {spots.map((spot: SpotInfo) => (
          <Marker
            key={spot.id}
            position={{ lat: spot.location.lat, lng: spot.location.lng }}
            title={spot.name}
            onClick={() => handleMarkerClick(spot)}
            icon={makeMarkerIcon(spot)}
            zIndex={
              hoveredSpotId === spot.id ? 999
              : selectedSpotId === spot.id ? 998
              : 1
            }
          />
        ))}

        <AnimatePresence>
          {selectedSpot && (
            <InfoWindow
              position={{
                lat: selectedSpot.location.lat,
                lng: selectedSpot.location.lng,
              }}
              onCloseClick={handleCloseInfoWindow}
              options={{
                pixelOffset: new google.maps.Size(0, -20),
                maxWidth: 300,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-2"
              >
                <div className="space-y-3">
                  {selectedSpot.image ? (
                    <div className="relative h-32 rounded-lg overflow-hidden">
                      <Image
                        src={selectedSpot.image}
                        alt={selectedSpot.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg bg-gradient-to-br from-[#5E6AD2]/10 to-[#5E6AD2]/5 flex items-center justify-center">
                      <Building className="h-8 w-8 text-[#5E6AD2]/40" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge type="pill-color" color="gray" size="sm" className="text-[10px] px-1.5 py-0">
                        {SPOT_TYPE_LABELS[selectedSpot.spot] ?? selectedSpot.spot}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-sm">
                      {selectedSpot.name}
                    </h3>
                    
                    {selectedSpot.highlight && (
                      <p className="text-gray-600 text-xs line-clamp-2">
                        {selectedSpot.highlight}
                      </p>
                    )}

                    <div className="space-y-1 text-xs text-gray-500">
                      {selectedSpot.event?.beginDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(selectedSpot.event.beginDate)}</span>
                        </div>
                      )}
                      
                      {selectedSpot.event?.attendees && selectedSpot.event.attendees > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{selectedSpot.event.attendees} participant{selectedSpot.event.attendees > 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {selectedSpot.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{selectedSpot.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/spotlight/${selectedSpot.id}`}>
                        <Button
                          size="sm"
                          color="primary"
                          className="h-7 text-xs"
                        >
                          Détails
                        </Button>
                      </Link>
                      {selectedSpot.url && (
                        <Button
                          size="sm"
                          color="secondary"
                          className="h-7 text-xs"
                          onClick={() => window.open(selectedSpot.url, '_blank')}
                          iconLeading={<ExternalLink className="h-3 w-3" data-icon />}
                        >
                          Voir
                        </Button>
                      )}

                      <Button
                        size="sm"
                        color="secondary"
                        className="h-7 text-xs"
                        onClick={() => handleNavigateToSpot(selectedSpot)}
                        iconLeading={<Navigation className="h-3 w-3" data-icon />}
                      >
                        Itinéraire
                      </Button>

                      <Button
                        size="sm"
                        color="secondary"
                        className="h-7 text-xs"
                        onClick={() => handleShareSpot(selectedSpot)}
                        iconLeading={<Share2 className="h-3 w-3" data-icon />}
                      >
                        Partager
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </InfoWindow>
          )}
        </AnimatePresence>
      </GoogleMap>
    </motion.div>
  );
};
