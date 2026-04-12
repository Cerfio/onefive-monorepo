'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../base/buttons/button';
import { Badge } from '../base/badges/badges';
import { Tooltip } from '../base/tooltip/tooltip';
import { Edit3 } from 'lucide-react';

// Fonction pour obtenir les couleurs des badges de récompense
const getAchievementBadgeColors = (_achievementType: string) => {
    // Version épurée sans couleurs d'arrière-plan
    return 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 transition-colors';
};

export const RewardBadgesCard = ({ profileData, currentUser, onShowAll }: { profileData: any, currentUser: boolean, onShowAll: () => void }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <span>🏆</span>
                    Badges de Récompense
                    <Badge color="blue" className="text-xs bg-blue-100 text-blue-700">
                    {profileData.rewardBadges.length}
                    </Badge>
                </CardTitle>
                {currentUser && (
                <Button color="tertiary" size="sm">
                    <Edit3 className="h-4 w-4" />
                </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {profileData.rewardBadges.slice(0, 6).map((badge: any) => (
                    <Tooltip key={badge.id} title={badge.title} description={badge.description}>
                        <div className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${getAchievementBadgeColors(badge.type)}`}>
                            <div className="flex flex-col items-center text-center">
                            <div className="text-2xl mb-1">{badge.icon}</div>
                            <p className="font-semibold text-xs text-center leading-tight">{badge.title}</p>
                            <div className="mt-1">
                                <Badge 
                                    color="gray" 
                                    className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                                >
                                    {badge.rarity === 'legendary' ? '💎' : 
                                    badge.rarity === 'epic' ? '🌟' : 
                                    badge.rarity === 'rare' ? '✨' : 
                                    badge.rarity === 'uncommon' ? '⭐' : '📌'} {badge.rarity}
                                </Badge>
                            </div>
                            </div>
                        </div>
                    </Tooltip>
                    ))}
                </div>
                {profileData.rewardBadges.length > 6 && (
                    <div className="mt-4 text-center">
                    <Button 
                        color="secondary" 
                        size="sm" 
                        className="text-xs"
                        onClick={onShowAll}
                    >
                        Voir tous les badges ({profileData.rewardBadges.length})
                    </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 