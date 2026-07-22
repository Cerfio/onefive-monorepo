import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Users01 as Users, Building01 as Building, SearchLg as Search, Folder as Briefcase,
    ChartBreakoutSquare as TrendingUp, Zap as Lightbulb, CheckCircle as UserCheck, Plus as UserPlus,
    User01, MessageCircle01 as MessageCircle
} from '@untitledui/icons';

import { Button } from '@/components/base/buttons/button';
import type { ActivityEvent } from '../types';
import { formatTimestamp } from '../lib/utils';
import { cardVariants } from '../lib/animations';
import { Avatar } from '@/components/base/avatar/avatar';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

const ActivityCard = ({ event }: { event: ActivityEvent }) => {
    const { navigateToConversation, isLoading: isOpeningConversation } = useNavigateToConversation();
    // Extraire prénom et nom pour la génération automatique d'initiales
    const nameParts = event.person.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const renderContent = () => {
        const personLink = <Link href={`/profile/${event.person.id}`} className="font-semibold hover:text-[#5E6AD2] transition-colors">{event.person.name}</Link>;
        // Le backend fournit un libellé `details` lisible pour chaque type d'activité
        // réellement émis (a rejoint votre réseau / a publié un nouveau post / suit
        // maintenant X). On l'affiche directement pour ne jamais rendre une carte vide.
        if (event.details) {
            return <>{personLink} {event.details}</>;
        }
        // Fallbacks pour d'anciens types sans `details`.
        switch (event.type) {
            case 'NEW_CONNECTION':
                return <>{personLink} a rejoint votre réseau</>;
            case 'FOLLOWED_STARTUP':
            case 'STARTUP_FOLLOW':
                return <>{personLink} suit maintenant une startup</>;
            case 'PROFILE_FOLLOW':
                return <>{personLink} suit maintenant un membre</>;
            case 'NEW_POST':
                return <>{personLink} a publié un nouveau post</>;
            case 'NEW_INTENTION':
                return <>{personLink} cherche maintenant un associé technique</>;
            default:
                return <>{personLink}</>;
        }
    };

    const getEventIcon = () => {
        switch (event.type) {
            case 'NEW_CONNECTION': return <Users className="h-4 w-4 text-blue-600" />;
            case 'NEW_POST': return <MessageCircle className="h-4 w-4 text-violet-600" />;
            case 'PROFILE_FOLLOW': return <Users className="h-4 w-4 text-blue-600" />;
            case 'STARTUP_FOLLOW':
            case 'FOLLOWED_STARTUP': return <Building className="h-4 w-4 text-green-600" />;
            case 'NEW_INTENTION': return <Search className="h-4 w-4 text-purple-600" />;
            case 'JOB_CHANGE': return <Briefcase className="h-4 w-4 text-orange-600" />;
            case 'STARTUP_UPDATE': return <TrendingUp className="h-4 w-4 text-emerald-600" />;
            case 'MENTORSHIP_OFFER': return <Lightbulb className="h-4 w-4 text-yellow-600" />;
            case 'PROFILE_UPDATE': return <UserCheck className="h-4 w-4 text-blue-600" />;
            case 'NEW_SKILL': return <UserPlus className="h-4 w-4 text-indigo-600" />;
            case 'JOINED_PLATFORM': return <UserPlus className="h-4 w-4 text-green-600" />;
            default: return <Users className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <motion.div variants={cardVariants} style={{ marginBottom: '0.75rem' }}>
            <div className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-sm hover:border-gray-200 transition-all duration-200">
                <div className="flex gap-3">
                    <Link href={`/profile/${event.person.id}`} className="flex-shrink-0">
                        <Avatar
                            size="sm"
                            src={event.person.avatar}
                            alt={event.person.name}
                            firstName={firstName}
                            lastName={lastName}
                        />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 leading-relaxed mb-1">{renderContent()}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    {getEventIcon()}
                                    <span>{event.person.title}</span>
                                    <span>•</span>
                                    <span>{formatTimestamp(event.timestamp)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                                <Link href={`/profile/${event.person.id}`}>
                                    <Button color="tertiary" size="sm" className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50" iconLeading={<User01 className="h-3.5 w-3.5" data-icon />}>
                                        Voir profil
                                    </Button>
                                </Link>
                                <Button color="tertiary" size="sm" className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50" iconLeading={<MessageCircle className="h-3.5 w-3.5" data-icon />} onClick={() => navigateToConversation(event.person.id)} isDisabled={isOpeningConversation}>
                                    Message
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityCard; 