import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Plus as UserPlus, CheckCircle, Eye } from '@untitledui/icons';

import { Card, CardContent } from '@/components/base/card/card';
import { Button } from '@/components/base/buttons/button';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { Flag } from '@/components/ui/flag';
import { Avatar } from '@/components/base/avatar/avatar';
import { CompanyIcon } from '@/components/profile/CompanyIcon';

import type { Person } from '../types';
import { getPersonBadges, getDisplayReasons, highlightText } from '../lib/utils';
import { cardVariants } from '../lib/animations';
import DisplayReasons from './DisplayReasons';

interface PersonCardProps {
    person: Person;
    networkView: 'discover' | 'network';
    pendingRequests: Set<string>;
    followedProfiles: Set<string>;
    handleConnect: (id: string, name: string, e: React.MouseEvent) => void;
    handleFollow: (id: string, isFollowing: boolean, e: React.MouseEvent) => void;
    searchQuery: string;
    intentionFilter: string;
    roleFilter: string;
    locationFilter: string;
}

const PersonCard = React.memo(({ person, networkView, pendingRequests, followedProfiles: _followedProfiles, handleConnect, handleFollow, searchQuery, intentionFilter, roleFilter, locationFilter }: PersonCardProps) => {
    // Note: Mutual connections non affichées pour le moment (nécessite backend update)
    const mutualsInfo = { names: [], count: 0 };
    const displayReasons = getDisplayReasons(person, networkView, mutualsInfo, searchQuery, intentionFilter, roleFilter, locationFilter);

    // Extraire prénom et nom pour la génération automatique d'initiales
    const nameParts = person.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return (
        <motion.div variants={cardVariants} layout="position">
            <Link href={`/profile/${person.id}`} className="block h-full">
                <Card className="h-full group hover:border-[#5E6AD2] transition-all duration-300 hover:shadow-xl hover:shadow-[#5E6AD2]/10 cursor-pointer relative overflow-hidden flex flex-col">
                    <CardContent className="p-6 flex flex-col items-center text-center relative z-10 flex-1">
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Avatar
                                variant="profile"
                                size="sm"
                                src={person.avatar}
                                alt={person.name}
                                firstName={firstName}
                                lastName={lastName}
                                className="mb-4 ring-2 ring-transparent group-hover:ring-[#5E6AD2]/20 transition-all duration-300"
                            />
                        </motion.div>
                        <div className="mb-3">
                            <h3 className="font-semibold text-lg text-[#101828] mb-1 group-hover:text-[#5E6AD2] transition-colors">{highlightText(person.name, searchQuery)}</h3>
                            <div className="flex justify-center gap-1 mb-2 flex-wrap">
                                {getPersonBadges(person)}
                            </div>
                            <p className="text-sm text-[#475467] truncate">{highlightText(person.title, searchQuery)}</p>
                        </div>

                        <DisplayReasons reasons={displayReasons} />

                        <div className="flex-1" />

                        {(person.experience.length > 0 || person.education.length > 0) && (
                            <div className="flex gap-2 mb-3 justify-center">
                                {person.experience.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-xs text-[#475467]">
                                        <CompanyIcon 
                                            domain={person.experience[0].domain} 
                                            companyName={person.experience[0].company} 
                                            size={14} 
                                        />
                                        <span className="text-xs text-[#475467] truncate max-w-[80px]">{person.experience[0].company}</span>
                                    </div>
                                )}
                                {person.education.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-xs text-[#475467]">
                                        <CompanyIcon 
                                            domain={person.education[0].domain} 
                                            companyName={person.education[0].school} 
                                            size={14} 
                                        />
                                        <span className="text-xs text-[#475467] truncate max-w-[80px]">{person.education[0].school}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-[#475467] mb-3">
                            <Flag countryCode={person.countryCode} width={16} height={12} />
                            <span>{person.location}</span>
                        </div>

                        <div className="flex gap-2 w-full">
                            <Tooltip title="Envoyer une demande de connexion pour échanger en privé.">
                                <Button
                                    size="md"
                                    color={(person.relationStatus === 'PENDING' || pendingRequests.has(person.id)) ? "secondary" : "secondary"}
                                    className="text-xs flex-1"
                                    iconLeading={(person.relationStatus === 'PENDING' || pendingRequests.has(person.id)) ? <Clock className="h-3 w-3" data-icon /> : <UserPlus className="h-3 w-3" data-icon />}
                                    onClick={(e: React.MouseEvent) => handleConnect(person.id, person.name, e)}
                                >
                                    {(person.relationStatus === 'PENDING' || pendingRequests.has(person.id)) ? 'Demande envoyée' : 'Se connecter'}
                                </Button>
                            </Tooltip>
                            <Tooltip title="Suivre pour voir les actualités de cette personne dans votre feed.">
                                <Button
                                    size="md"
                                    color={person.isFollow ? "primary" : "tertiary"}
                                    className="text-xs flex-1"
                                    iconLeading={person.isFollow ? <CheckCircle className="h-3 w-3" data-icon /> : <Eye className="h-3 w-3" data-icon />}
                                    onClick={(e: React.MouseEvent) => handleFollow(person.id, !!person.isFollow, e)}
                                >
                                    {person.isFollow ? 'Suivi' : 'Suivre'}
                                </Button>
                            </Tooltip>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
});
PersonCard.displayName = "PersonCard";

export default PersonCard; 