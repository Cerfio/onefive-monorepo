import { Button } from '@/components/base/buttons/button';
import { Calendar, Users, MapPin, Heart, Share2, ExternalLink, GripVertical, Scale, DollarSign } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Credenza, CredenzaBody, CredenzaContent, CredenzaTrigger } from '@/components/ui/modal';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { Badge } from '@/components/base/badges/badges';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { ProviderType } from '@/sharing-enum/spotlight/spotlight.enum';
import { useState, memo } from 'react';
import { DomainBadge } from './DomainBadge';

const FORMAT_LABELS: Record<string, string> = {
  ONLINE: 'En ligne',
  INPERSON: 'Présentiel',
  HYBRID: 'Hybride',
};

interface SpotlightEventWithSpotData {
  id: string;
  name: string;
  highlight: string;
  address: string;
  image: string;
  url: string;
  location: {
    lat: number;
    lng: number;
  };
  provider: ProviderType;
  spot: string;
  event?: {
    beginDate?: string;
    endDate?: string;
    attendees?: number;
    format?: string;
    prices?: Array<{
      name: string;
      price: number;
      currency: string;
      fee: number;
    }>;
    expertiseDomains?: string[];
    days?: string[];
  };
}

interface CardEventProps {
  spot: SpotlightEventWithSpotData;
  formatDateRange: (beginDateStr: string, endDateStr: string) => string;
  findProviderImage: (provider: ProviderType) => string | null;
  isFavorite?: boolean;
  onFavorite?: (spotId: string, spotName: string) => void;
  onShare?: (spotId: string, spotName: string) => void;
  isSelected?: boolean;
  onSelect?: (spotId: string, selected: boolean) => void;
  isComparisonMode?: boolean;
  isDraggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const CardEvent = memo(({ 
  spot, 
  formatDateRange, 
  findProviderImage, 
  isFavorite = false,
  onFavorite,
  onShare,
  isSelected = false,
  onSelect,
  isComparisonMode = false,
  isDraggable = false,
  onDragStart,
  onDragEnd
}: CardEventProps) => {
  const providerImage = findProviderImage(spot.provider);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(spot.id, spot.name);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(spot.id, spot.name);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(spot.id, !isSelected);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  return (
    <motion.div
        className={`flex gap-5 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#5E6AD2]/20 transition-all duration-300 bg-white group relative ${
          isSelected ? 'ring-2 ring-[#5E6AD2] bg-[#5E6AD2]/5' : ''
        } ${isDragging ? 'opacity-50 scale-95' : ''}`}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        role="article"
        aria-labelledby={`event-title-${spot.id}`}
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Handle de drag & drop */}
        {isDraggable && (
          <motion.div
            className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </motion.div>
        )}

        {/* Checkbox de sélection */}
        {isComparisonMode && (
          <motion.div
            className="absolute top-2 right-2 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect?.(spot.id, !isSelected)}
              className="bg-white/90"
            />
          </motion.div>
        )}

        <div className="min-w-[234px] h-[168px] rounded-lg bg-slate-400 relative overflow-hidden">
          {spot.image ? (
            <Credenza>
              <CredenzaTrigger asChild>
                <Image
                  src={spot.image}
                  alt={spot.name}
                  fill
                  className="rounded-lg cursor-pointer object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </CredenzaTrigger>
              <CredenzaContent className="max-w-4xl">
                <CredenzaBody>
                  <Image 
                    src={spot.image}
                    alt={spot.name}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg"
                  />
                </CredenzaBody>
              </CredenzaContent>
            </Credenza>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Badge de prix */}
          {spot.event?.prices && spot.event.prices.length > 0 && (
            <div className="absolute top-3 left-3">
              <Badge type="pill-color" color="gray" size="sm" className="bg-white/90 text-gray-900 font-medium">
                À partir de {spot.event.prices[0].price}€
              </Badge>
            </div>
          )}
          
          {/* Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Tooltip title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
              <Button
                size="sm"
                color="tertiary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleFavorite}
                aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </Button>
            </Tooltip>

            <Tooltip title="Partager cet événement">
              <Button
                size="sm"
                color="tertiary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleShare}
                aria-label="Partager cet événement"
              >
                <Share2 className="h-4 w-4 text-gray-600" />
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex items-start w-full justify-between">
            <div className="flex w-full flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/spotlight/${spot.id}`}>
                  <h3 
                    id={`event-title-${spot.id}`}
                    className="font-semibold text-lg text-[#101828] group-hover:text-[#5E6AD2] hover:text-[#5E6AD2] transition-colors truncate flex-1 cursor-pointer"
                    title={spot.name}
                  >
                    {spot.name}
                  </h3>
                </Link>
                
                {/* Provider dans une div dédiée avec bordures */}
                <div className="flex-shrink-0">
                  {providerImage && !imageError && (
                    <Tooltip title={`Fourni par ${spot.provider}`}>
                      <TooltipTrigger className="w-8 h-8 border border-gray-200 rounded-sm bg-white p-1 flex items-center justify-center">
                        <Image
                          src={providerImage}
                          alt="Provider"
                          width={24}
                          height={24}
                          className="rounded-sm object-contain"
                          onError={() => setImageError(true)}
                          onLoad={() => setImageError(false)}
                          loading="lazy"
                        />
                      </TooltipTrigger>
                    </Tooltip>
                  )}
                  {(!providerImage || imageError) && (
                    <Tooltip title={`Fourni par ${spot.provider}`}>
                      <TooltipTrigger className="w-8 h-8 border border-gray-200 rounded-sm bg-gray-50 flex items-center justify-center">
                        <span className="text-sm text-gray-500 font-medium">
                          {spot.provider.charAt(0).toUpperCase()}
                        </span>
                      </TooltipTrigger>
                    </Tooltip>
                  )}
                </div>
              </div>
              
              <p className="text-[#475467] text-sm leading-relaxed">
                {spot.highlight}
              </p>
              
              {/* Informations organisées verticalement */}
              <div className="flex flex-col gap-2 text-sm text-[#667085]">
                {spot.event?.beginDate && spot.event?.endDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">
                      {formatDateRange(spot.event.beginDate, spot.event.endDate)}
                    </span>
                  </div>
                )}
                
                {spot.event?.attendees && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">
                      {spot.event.attendees} participant{spot.event.attendees > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {spot.event?.prices && spot.event.prices.length > 0 && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">
                      {spot.event.prices.length} tarif{spot.event.prices.length > 1 ? 's' : ''} disponible{spot.event.prices.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {spot.event?.expertiseDomains && spot.event.expertiseDomains.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {spot.event.expertiseDomains.map((domain, index) => (
                      <DomainBadge key={index} domain={domain} size="sm" />
                    ))}
                  </div>
                )}
                
                {spot.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">
                      {spot.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge type="badge-modern" color="gray" size="sm">
                <Calendar className="h-3 w-3 mr-1" />
                Événement
              </Badge>
              {spot.event?.format && (
                <Badge type="pill-color" color="gray" size="sm">
                  {FORMAT_LABELS[spot.event.format] ?? spot.event.format}
                </Badge>
              )}
              {spot.event?.prices && spot.event.prices.length > 0 && (
                <Badge type="pill-color" color="gray" size="sm">
                  {spot.event.prices[0].price}€
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={`/spotlight/${spot.id}`}>
                <Button color="primary" size="sm" className="gap-2 bg-[#5E6AD2] hover:bg-[#4F5ABF]">
                  Détails
                </Button>
              </Link>
              {spot.url && (
                <Link href={spot.url} target="_blank" rel="noopener noreferrer">
                  <Button color="secondary" size="sm" className="gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Voir l'événement
                  </Button>
                </Link>
              )}
            </div>

            {/* Bouton de comparaison */}
            {isComparisonMode && (
              <Tooltip title={isSelected ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}>
                <Button
                  size="sm"
                  color="secondary"
                  className="gap-2"
                  onClick={handleSelect}
                >
                  <Scale className="h-3 w-3" />
                  {isSelected ? 'Retirer' : 'Comparer'}
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.div>
  );
});

CardEvent.displayName = 'CardEvent'; 