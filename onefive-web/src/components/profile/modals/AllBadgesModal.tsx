'use client';

import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { Badge } from '../../base/badges/badges';
import { Tooltip } from '../../base/tooltip/tooltip';

// Fonction pour obtenir les couleurs des badges de récompense
const getAchievementBadgeColors = (_achievementType: string) => {
    // Version épurée sans couleurs d'arrière-plan
    return 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 transition-colors';
};

export const AllBadgesModal = ({ open, onOpenChange, profileData }: { open: boolean, onOpenChange: (isOpen: boolean) => void, profileData: any }) => {
    return (
        <ModalOverlay isOpen={open} onOpenChange={onOpenChange}>
            <Modal>
                <Dialog>
                    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <span>🏆</span>
                                Tous les Badges de Récompense
                                <Badge color="blue" className="text-xs bg-blue-100 text-blue-700">
                                    {profileData.rewardBadges.length}
                                </Badge>
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Découvrez tous les badges débloqués par {profileData.name}
                            </p>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {profileData.rewardBadges.map((badge: any) => (
                                    <Tooltip 
                                        key={badge.id} 
                                        title={badge.title} 
                                        description={badge.description}
                                    >
                                        <div className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${getAchievementBadgeColors(badge.type)}`}>
                                            <div className="flex flex-col items-center text-center">
                                                <div className="text-2xl mb-2">{badge.icon}</div>
                                                <p className="font-semibold text-xs text-center leading-tight mb-2">{badge.title}</p>
                                                <div className="mb-2">
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

                            {/* Statistiques des badges */}
                            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-sm mb-3">Statistiques des Badges</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">{profileData.rewardBadges.length}</p>
                                        <p className="text-xs text-gray-600">Total</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {profileData.rewardBadges.filter((b: any) => b.rarity === 'legendary').length}
                                        </p>
                                        <p className="text-xs text-gray-600">Legendary</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-pink-600">
                                            {profileData.rewardBadges.filter((b: any) => b.rarity === 'epic').length}
                                        </p>
                                        <p className="text-xs text-gray-600">Epic</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {profileData.rewardBadges.filter((b: any) => b.rarity === 'rare').length}
                                        </p>
                                        <p className="text-xs text-gray-600">Rare</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}; 