'use client';

import { Star, Edit3, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Button as BaseButton } from '@/components/base/buttons/button';

export const AchievementsCard = ({ achievements, currentUser, onEdit }: {
  achievements: any[];
  currentUser: boolean;
  onEdit: () => void;
}) => {
  const hasAchievements = achievements?.length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Réalisations</h3>
        </div>
        {currentUser && hasAchievements && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {hasAchievements ? (
          (achievements || []).map((achievement) => (
            <div key={achievement.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                <p className="text-sm text-gray-500">{achievement.description}</p>
                <p className="text-xs text-gray-400 mt-1">{achievement.date}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">Aucune réalisation</p>
            {currentUser && onEdit && (
              <BaseButton color="primary" size="sm" onClick={onEdit} iconLeading={Plus}>
                Ajouter votre première réalisation
              </BaseButton>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}; 