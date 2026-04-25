import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Plus, ChartBreakoutSquare as TrendingUp } from '@untitledui/icons';

import { Card, CardContent } from '@/components/base/card/card';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Flag } from '@/components/ui/flag';
import { Avatar } from '@/components/base/avatar/avatar';
import { formatLocationDisplay } from '@/lib/country';

import type { Startup } from '../types';
import { highlightText } from '../lib/utils';
import { cardVariants } from '../lib/animations';
import IntentionBadge from './IntentionBadge';

interface StartupCardProps {
    startup: Startup;
    handleFollowStartup: (id: string, isFollowing: boolean, e: React.MouseEvent) => void;
    searchQuery: string;
    handleIntentionClick: (category: string) => void;
}

const StartupCard = React.memo(({ startup, handleFollowStartup, searchQuery, handleIntentionClick }: StartupCardProps) => (
    <motion.div variants={cardVariants} layout="position">
        <Link href={`/startup/${startup.id}`} className="block h-full">
            <Card className="h-full group hover:border-[#5E6AD2] transition-all duration-300 hover:shadow-xl hover:shadow-[#5E6AD2]/10 cursor-pointer relative overflow-hidden flex flex-col">
                <CardContent className="p-6 flex flex-col items-center text-center relative z-10 flex-1">
                    <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Avatar
                            size="lg"
                            src={startup.logo}
                            alt={startup.name}
                            initials={startup.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            className="rounded-lg mb-4 ring-2 ring-transparent group-hover:ring-green-500/20 transition-all duration-300"
                        />
                    </motion.div>
                    {startup.stats.stage === 'Series A' && (
                        <div className="absolute top-4 right-4 bg-orange-500 text-white p-1 rounded-full"><TrendingUp className="h-3 w-3" /></div>
                    )}
                    <div className="mb-2">
                        <h3 className="font-semibold text-lg text-[#101828] mb-1 group-hover:text-green-600 transition-colors">{highlightText(startup.name, searchQuery)}</h3>
                        <p className="text-sm text-[#475467]">{highlightText(startup.tagline, searchQuery)}</p>
                    </div>
                    <div className="mb-4">
                        <IntentionBadge intentionCategory={startup.intentionCategory} onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); handleIntentionClick(startup.intentionCategory); }} />
                    </div>
                    <div className="flex gap-2 mb-4">
                        <Badge type="color" color="gray" size="sm" className="text-xs group-hover:border-green-500/50 transition-colors">{startup.stats.stage}</Badge>
                        <Badge type="color" color="gray" size="sm" className="text-xs group-hover:border-green-500/50 transition-colors">{startup.stats.industry}</Badge>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-2 text-xs text-[#475467] mb-3">
                        <Flag countryCode={startup.countryCode} width={16} height={12} />
                        <span>{formatLocationDisplay(startup.location)}</span>
                    </div>
                    <div className="w-full">
                        <Button
                            size="sm"
                            color={startup.isFollow ? "primary" : "tertiary"}
                            className="text-xs w-full"
                            iconLeading={startup.isFollow ? <CheckCircle className="h-3 w-3" data-icon /> : <Plus className="h-3 w-3" data-icon />}
                            onClick={(e: React.MouseEvent) => handleFollowStartup(startup.id, !!startup.isFollow, e)}
                        >
                            {startup.isFollow ? 'Suivi' : 'Suivre'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    </motion.div>
));
StartupCard.displayName = 'StartupCard';

export default StartupCard; 