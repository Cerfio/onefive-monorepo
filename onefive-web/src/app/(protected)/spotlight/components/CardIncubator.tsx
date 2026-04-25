import { Button } from '@/components/base/buttons/button';
import { MapPin, Heart, Share2, ExternalLink, Building, Users, Clock, Landmark, Percent } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/base/badges/badges';
import { ProviderType } from '@/sharing-enum/spotlight/spotlight.enum';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { DomainBadge } from './DomainBadge';

const FUNDING_LABELS: Record<string, string> = {
  GRANT: 'Subvention',
  EQUITY: 'Equity',
  REVENUE_SHARE: 'Revenue Share',
  EQUITY_AND_GRANT: 'Equity + Subvention',
  NONE: 'Aucun financement',
};

const STAGE_LABELS: Record<string, string> = {
  IDEA: 'Idée',
  PRESEED: 'Pré-Seed',
  SEED: 'Seed',
  SERIES_A: 'Série A',
  GROWTH: 'Growth',
  ALL: 'Tous stades',
};

interface SpotlightIncubatorWithSpotData {
  id: string;
  name: string;
  highlight: string;
  address: string;
  image: string;
  url?: string;
  location: {
    lat: number;
    lng: number;
  };
  provider: ProviderType;
  spot: string;
  incubator?: {
    expertiseDomains?: string[];
    fundingModel?: string;
    equityPercentage?: number;
    investmentAmount?: number;
    stage?: string;
    capacity?: number;
    programDuration?: number;
  };
}

interface CardIncubatorProps {
  spot: SpotlightIncubatorWithSpotData;
  formatDateRange: (beginDateStr: string, endDateStr: string) => string;
  findProviderImage: (provider: ProviderType) => string | null;
  isFavorite?: boolean;
  onFavorite?: (spotId: string, spotName: string) => void;
  onShare?: (spotId: string, spotName: string) => void;
}

export const CardIncubator = ({ 
  spot, 
  formatDateRange: _formatDateRange, 
  findProviderImage, 
  isFavorite = false,
  onFavorite,
  onShare 
}: CardIncubatorProps) => {
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
            <Image
              src={spot.image}
              alt={spot.name}
              fill
              className="rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Building className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Badge de stage */}
          {spot.incubator?.stage && (
            <div className="absolute top-3 left-3">
              <Badge type="pill-color" color="gray" size="sm" className="bg-white/90 text-gray-900 font-medium">
                {spot.incubator.stage}
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
                iconLeading={
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    data-icon
                  />
                }
              />
            </Tooltip>

            <Tooltip title="Partager cet incubateur">
              <Button
                size="sm"
                color="tertiary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleShare}
                iconLeading={<Share2 className="h-4 w-4 text-gray-600" data-icon />}
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex items-start w-full justify-between">
            <div className="flex w-full flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/spotlight/${spot.id}`}>
                  <h3 className="font-semibold text-lg text-[#101828] group-hover:text-[#5E6AD2] hover:text-[#5E6AD2] transition-colors truncate flex-1 cursor-pointer" title={spot.name}>
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
              
              <div className="flex flex-col gap-2 text-sm text-[#667085]">
                {spot.incubator?.fundingModel && (
                  <div className="flex items-center gap-1">
                    <Landmark className="h-4 w-4" />
                    <span className="text-xs">
                      {FUNDING_LABELS[spot.incubator.fundingModel] ?? spot.incubator.fundingModel}
                      {spot.incubator.equityPercentage ? ` · ${spot.incubator.equityPercentage}% equity` : ''}
                      {spot.incubator.investmentAmount ? ` · ${spot.incubator.investmentAmount.toLocaleString('fr-FR')}€` : ''}
                    </span>
                  </div>
                )}

                {spot.incubator?.capacity && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">{spot.incubator.capacity} startups par cohorte</span>
                  </div>
                )}

                {spot.incubator?.programDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">{spot.incubator.programDuration} semaines</span>
                  </div>
                )}
                
                {spot.incubator?.expertiseDomains && spot.incubator.expertiseDomains.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {spot.incubator.expertiseDomains.map((domain, index) => (
                      <DomainBadge key={index} domain={domain} size="sm" />
                    ))}
                  </div>
                )}
                
                {spot.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs">{spot.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge type="pill-color" color="gray" size="sm">
                <Building className="h-3 w-3 mr-1" />
                Incubateur
              </Badge>
              {spot.incubator?.stage && (
                <Badge type="pill-color" color="gray" size="sm">
                  {STAGE_LABELS[spot.incubator.stage] ?? spot.incubator.stage}
                </Badge>
              )}
              {spot.incubator?.equityPercentage && (
                <Badge type="pill-color" color="gray" size="sm">
                  <Percent className="h-3 w-3 mr-1" />
                  {spot.incubator.equityPercentage}%
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={`/spotlight/${spot.id}`}>
                <Button color="primary" size="sm" className="gap-2">
                  Détails
                </Button>
              </Link>
              {spot.url && (
                <Link href={spot.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" color="secondary" className="gap-2" iconLeading={<ExternalLink className="h-3 w-3" data-icon />}>
                    Voir détails
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
  );
};