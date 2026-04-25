import { Button } from '@/components/base/buttons/button';
import { Clock, MapPin, Heart, Share2, ExternalLink, Building2, DollarSign } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Credenza, CredenzaBody, CredenzaContent, CredenzaTrigger } from '@/components/ui/modal';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { Badge } from '@/components/base/badges/badges';
import { motion } from 'framer-motion';
import { ProviderType } from '@/sharing-enum/spotlight/spotlight.enum';
import { useState } from 'react';
import { DomainBadge } from './DomainBadge';

interface SpotlightCoworkingWithSpotData {
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
  coworkingSpace?: {
    prices?: Array<{
      periodicity: string;
      plan: {
        name: string;
        price: number;
        currency: string;
        fee: number;
      };
    }>;
    openingHours?: {
      begin: string;
      end: string;
    };
    expertiseDomains?: string[];
  };
}

interface CardCoworkingProps {
  spot: SpotlightCoworkingWithSpotData;
  findProviderImage: (provider: ProviderType) => string | null;
  isFavorite?: boolean;
  onFavorite?: (spotId: string, spotName: string) => void;
  onShare?: (spotId: string, spotName: string) => void;
}

export const CardCoworking = ({ 
  spot, 
  findProviderImage, 
  isFavorite = false,
  onFavorite,
  onShare 
}: CardCoworkingProps) => {
  const providerImage = findProviderImage(spot.provider);
  const [imageError, setImageError] = useState(false);
  
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

  const getLowestPrice = () => {
    if (!spot.coworkingSpace?.prices || spot.coworkingSpace.prices.length === 0) return null;
    return spot.coworkingSpace.prices.reduce((lowest, current) => 
      current.plan.price < lowest.plan.price ? current : lowest
    );
  };

  const formatOpeningHours = (begin: string, end: string) => {
    return `${begin} - ${end}`;
  };

  return (
    <motion.div
        className="flex gap-5 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#5E6AD2]/20 transition-all duration-300 bg-white group"
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
              <Building2 className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Badge de prix */}
          {getLowestPrice() && (
            <div className="absolute top-3 left-3">
              <Badge type="pill-color" color="gray" size="sm" className="bg-white/90 text-gray-900 font-medium">
                À partir de {getLowestPrice()?.plan.price}€
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

            <Tooltip title="Partager cet espace">
              <Button
                size="sm"
                color="tertiary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleShare}
                aria-label="Partager cet espace"
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
                {spot.coworkingSpace?.openingHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">
                      {formatOpeningHours(spot.coworkingSpace.openingHours.begin, spot.coworkingSpace.openingHours.end)}
                    </span>
                  </div>
                )}
                
                {spot.coworkingSpace?.prices && spot.coworkingSpace.prices.length > 0 && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">
                      {spot.coworkingSpace.prices.length} tarif{spot.coworkingSpace.prices.length > 1 ? 's' : ''} disponible{spot.coworkingSpace.prices.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {spot.coworkingSpace?.expertiseDomains && spot.coworkingSpace.expertiseDomains.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {spot.coworkingSpace.expertiseDomains.map((domain, index) => (
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
              {/* Badge de type Coworking */}
              <Badge type="pill-color" color="gray" size="sm">
                <Building2 className="h-3 w-3 mr-1" />
                Coworking
              </Badge>
              {getLowestPrice() && (
                <Badge type="pill-color" color="gray" size="sm">
                  {getLowestPrice()?.plan.price}€
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
                    Voir l&apos;espace
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
  );
};