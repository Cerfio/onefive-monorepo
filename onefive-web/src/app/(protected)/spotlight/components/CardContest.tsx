import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Heart, Share2, ExternalLink, Trophy, DollarSign, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Credenza, CredenzaBody, CredenzaContent, CredenzaTrigger } from '@/components/ui/modal';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ProviderType } from '@/sharing-enum/spotlight/spotlight.enum';
import { useState } from 'react';
import { DomainBadge } from './DomainBadge';

const PRIZE_LABELS: Record<string, string> = {
  CASH: 'Cash',
  GRANT: 'Subvention',
  SERVICES: 'Services',
  VISIBILITY: 'Visibilité',
  MIXED: 'Mixte',
};

interface SpotlightContestWithSpotData {
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
  contest?: {
    beginDate?: string;
    endDate?: string;
    expertiseDomains?: string[];
    prizeType?: string;
    prizeAmount?: number;
    eligibility?: string;
    prices?: Array<{
      name: string;
      price: number;
      currency: string;
      fee: number;
    }>;
  };
}

interface CardContestProps {
  spot: SpotlightContestWithSpotData;
  formatDateRange: (beginDateStr: string, endDateStr: string) => string;
  findProviderImage: (provider: ProviderType) => string | null;
  isFavorite?: boolean;
  onFavorite?: (spotId: string, spotName: string) => void;
  onShare?: (spotId: string, spotName: string) => void;
}

export const CardContest = ({ 
  spot, 
  formatDateRange, 
  findProviderImage, 
  isFavorite = false,
  onFavorite,
  onShare 
}: CardContestProps) => {
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
    if (!spot.contest?.prices || spot.contest.prices.length === 0) return null;
    return spot.contest.prices.reduce((lowest, current) => 
      current.price < lowest.price ? current : lowest
    );
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
              <Trophy className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Badge de prix */}
          {getLowestPrice() && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-900 font-medium">
                À partir de {getLowestPrice()?.price}€
              </Badge>
            </div>
          )}
          
          {/* Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Tooltip title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleFavorite}
                aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </Button>
            </Tooltip>
            
            <Tooltip title="Partager ce concours">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleShare}
                aria-label="Partager ce concours"
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
              
              <div className="flex flex-col gap-2 text-sm text-[#667085]">
                {spot.contest?.beginDate && spot.contest?.endDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">
                      {formatDateRange(spot.contest.beginDate, spot.contest.endDate)}
                    </span>
                  </div>
                )}

                {spot.contest?.prizeAmount && (
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">
                      {spot.contest.prizeAmount.toLocaleString('fr-FR')}€
                      {spot.contest.prizeType ? ` · ${PRIZE_LABELS[spot.contest.prizeType] ?? spot.contest.prizeType}` : ''}
                    </span>
                  </div>
                )}
                
                {spot.contest?.prices && spot.contest.prices.length > 0 && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">
                      {spot.contest.prices.length} tarif{spot.contest.prices.length > 1 ? 's' : ''} disponible{spot.contest.prices.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {spot.contest?.expertiseDomains && spot.contest.expertiseDomains.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {spot.contest.expertiseDomains.map((domain, index) => (
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
              <Badge variant="outline" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                Concours
              </Badge>
              {spot.contest?.prizeType && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {PRIZE_LABELS[spot.contest.prizeType] ?? spot.contest.prizeType}
                </Badge>
              )}
              {getLowestPrice() && (
                <Badge variant="secondary" className="text-xs">
                  {getLowestPrice()?.price}€
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={`/spotlight/${spot.id}`}>
                <Button variant="default" size="sm" className="gap-2 bg-[#5E6AD2] hover:bg-[#4F5ABF]">
                  Détails
                </Button>
              </Link>
              {spot.url && (
                <Link href={spot.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Voir le concours
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
    </motion.div>
  );
};