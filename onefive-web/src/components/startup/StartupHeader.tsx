'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, MapPin, Calendar, Building, ExternalLink, Share2, Bookmark, MoreVertical, DollarSign, ArrowRightLeft, Trash2, LogOut } from 'lucide-react';
import LinkedInSquareIcon from '@/components/shared/LinkedInSquareIcon';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { getSectorColor } from '@/shared/constants/sector-colors';
import { Card } from '@/components/base/card/card';

import { AnimatedNumber } from '@/components/ui/animated-number';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { InvestmentProposalModal } from './modals/InvestmentProposalModal';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { Flag } from '@/components/ui/flag';

interface StartupHeaderProps {
  startupData: any;
  currentUser: boolean;
  onEdit: () => void;
  onLinkedInSync?: () => void;
  animateNumbers: boolean;
  params: { id: string };
  /** Actions créateur (affichées dans le dropdown) */
  isCreator?: boolean;
  isMember?: boolean;
  onTransferOwnership?: () => void;
  onDeleteStartup?: () => void;
  onLeaveStartup?: () => void;
}

export const StartupHeader = ({ 
  startupData, 
  currentUser, 
  onEdit, 
  onLinkedInSync,
  animateNumbers, 
  params: _params,
  isCreator,
  isMember,
  onTransferOwnership,
  onDeleteStartup,
  onLeaveStartup,
}: StartupHeaderProps) => {
  const [isBookmarked, _setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  const MAX_DESCRIPTION_LENGTH = 200;
  const description = startupData.description || '';
  const shouldTruncate = description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = shouldTruncate && !isDescriptionExpanded 
    ? description.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
    : description;

  const _formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Bannière de couverture */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500">
          {startupData.coverImage ? (
            <img
              src={startupData.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-white text-3xl font-bold">{startupData.name}</div>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl shadow-lg bg-white border-4 border-white">
                {startupData.logo ? (
                  <img
                    src={startupData.logo}
                    alt={`${startupData.name} logo`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold rounded-xl">
                    {startupData.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-[#101828]">{startupData.name}</h1>
                  </div>
                  
                  <p className="text-md text-[#475467] mb-3">{startupData.tagline}</p>

                  {/* Secteurs (catégories) */}
                  {startupData.sectors && startupData.sectors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {startupData.sectors.map((sector: string) => (
                        <Badge
                          key={sector}
                          type="pill-color"
                          color={getSectorColor(sector)}
                          size="md"
                        >
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {!currentUser && (
                    <>
                      <Button
                        color={isFollowing ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={isFollowing ? "border-violet-200 text-violet-700" : ""}
                      >
                        {isFollowing ? 'Suivi' : 'Suivre'}
                      </Button>
                      <Button color="secondary" size="sm">
                        Contacter
                      </Button>
                    </>
                  )}
                  {currentUser && (
                    <Button color="secondary" className="gap-2" onClick={onEdit}>
                      <Edit3 className="h-4 w-4" />Modifier
                    </Button>
                  )}
                  <Dropdown.Root>
                    <Dropdown.Trigger>
                      <Button color="secondary" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </Dropdown.Trigger>
                    <Dropdown.Popover placement="bottom right" className="w-64">
                      <Dropdown.Menu>
                        {!currentUser && (
                          <Dropdown.Item icon={DollarSign} onAction={() => setIsInvestmentModalOpen(true)}>
                            Proposer un investissement
                          </Dropdown.Item>
                        )}
                        {currentUser && onLinkedInSync && (
                          <Dropdown.Item icon={LinkedInSquareIcon} onAction={onLinkedInSync}>
                            Synchroniser avec LinkedIn
                          </Dropdown.Item>
                        )}
                        <Dropdown.Separator />
                        <Dropdown.Item icon={Share2}>Partager</Dropdown.Item>
                        <Dropdown.Item icon={Bookmark}>
                          {isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        </Dropdown.Item>
                        {isCreator && onTransferOwnership && (
                          <>
                            <Dropdown.Separator />
                            <Dropdown.Item icon={ArrowRightLeft} onAction={onTransferOwnership}>
                              Transférer la propriété
                            </Dropdown.Item>
                          </>
                        )}
                        {isMember && (
                          <>
                            <Dropdown.Separator />
                            <Dropdown.Item
                              icon={LogOut}
                              isDisabled={isCreator}
                              onAction={!isCreator ? onLeaveStartup : undefined}
                            >
                              Quitter la startup
                            </Dropdown.Item>
                          </>
                        )}
                        {isCreator && onDeleteStartup && (
                          <>
                            <Dropdown.Separator />
                            <Dropdown.Item icon={Trash2} onAction={onDeleteStartup}>
                              Supprimer la startup
                            </Dropdown.Item>
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown.Root>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14}/>
                  <span>{startupData.location}</span>
                  {startupData.countryCode && (
                    <Flag
                      countryCode={startupData.countryCode}
                      width={16}
                      height={12}
                      className="rounded"
                    />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14}/> 
                  <span>Fondée en {startupData.founded}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building size={14}/> 
                  <span>{startupData.employees} employés</span>
                </div>
                {startupData.website && (
                  <a
                    href={startupData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:underline"
                  >
                    <ExternalLink size={14}/>
                    <span>Site web</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <p className="text-sm text-[#475467]">{displayDescription}</p>
            {shouldTruncate && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-sm font-medium text-[#5E6AD2] hover:text-[#4A56C4] transition-colors"
              >
                {isDescriptionExpanded ? 'Lire moins' : 'Lire plus'}
              </button>
            )}
          </div>
          
          {/* Statistiques */}
          <div className="mt-6 flex items-center gap-8 text-sm">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="font-semibold text-[#101828]">
                {animateNumbers ? (
                  <AnimatedNumber value={startupData.stats.followers} />
                ) : (
                  0
                )}
              </span>
              <span className="text-[#475467]">Abonnés</span>
            </motion.div>
          </div>
        </div>
      </Card>

      {/* Modal d'investissement */}
      <InvestmentProposalModal
        open={isInvestmentModalOpen}
        onOpenChange={setIsInvestmentModalOpen}
        startupName={startupData.name}
      />
    </>
  );
}; 