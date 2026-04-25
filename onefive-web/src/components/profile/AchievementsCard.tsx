'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card/card';
import { Button } from '../base/buttons/button';
import { Edit3, Trophy } from 'lucide-react';

export const AchievementsCard = ({ profileData, currentUser, onEdit }: { profileData: any, currentUser: boolean, onEdit: () => void }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Réalisations</CardTitle>
                {currentUser && (
                    <Button color="tertiary" size="sm" onClick={onEdit}>
                        <Edit3 className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {profileData?.achievements?.length > 0 ? (
                    profileData.achievements.map((ach: any) => (
                        <div key={ach.id} className="flex gap-3 items-center mb-3">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="font-semibold text-sm text-[#101828]">{ach.title}</p>
                                <p className="text-xs text-gray-500">{ach.description} • {ach.date}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center gap-2 py-4 text-gray-400">
                        <Trophy className="h-4 w-4 shrink-0" />
                        <p className="text-sm">Aucune réalisation</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 