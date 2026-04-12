'use client';

import { Award, Rocket, Calendar, Zap, Flame } from 'lucide-react';
import { Badge } from '@/components/base/badges/badges';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'updates' | 'launches' | 'streak' | 'engagement';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-launch',
    title: 'Premier launch public',
    description: 'Vous avez annoncé votre premier lancement',
    icon: Rocket,
    category: 'launches',
    rarity: 'common',
    unlocked: false
  },
  {
    id: '10-updates',
    title: '+10 updates Build in Public',
    description: 'Vous avez partagé 10 mises à jour',
    icon: Calendar,
    category: 'updates',
    rarity: 'common',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: '12-months-streak',
    title: '12 mois consécutifs',
    description: '12 mois d\'updates régulières',
    icon: Flame,
    category: 'streak',
    rarity: 'epic',
    unlocked: false,
    progress: 0,
    maxProgress: 12
  },
  {
    id: '100-reactions',
    title: '100 réactions',
    description: 'Vos posts ont reçu 100 réactions cumulées',
    icon: Zap,
    category: 'engagement',
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: '5-launches',
    title: '5 launches publics',
    description: 'Vous avez annoncé 5 lancements',
    icon: Rocket,
    category: 'launches',
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  }
];

const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'rare':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'epic':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'legendary':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  }
};

interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  className
}) => {
  const Icon = achievement.icon;
  const progressPercentage = achievement.maxProgress && achievement.progress
    ? (achievement.progress / achievement.maxProgress) * 100
    : 0;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all',
        achievement.unlocked
          ? getRarityColor(achievement.rarity)
          : 'border-gray-200 bg-gray-50 opacity-60',
        className
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
            achievement.unlocked
              ? achievement.rarity === 'common' ? 'bg-gray-200' :
                achievement.rarity === 'rare' ? 'bg-blue-200' :
                achievement.rarity === 'epic' ? 'bg-purple-200' :
                'bg-yellow-200'
              : 'bg-gray-200'
          )}
        >
          <Icon
            className={cn(
              'h-6 w-6',
              achievement.unlocked
                ? achievement.rarity === 'common' ? 'text-gray-600' :
                  achievement.rarity === 'rare' ? 'text-blue-600' :
                  achievement.rarity === 'epic' ? 'text-purple-600' :
                  'text-yellow-600'
                : 'text-gray-400'
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{achievement.title}</h3>
            {achievement.unlocked && (
              <Badge type="pill-color" color="success" size="sm" className="text-xs">
                Débloqué
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
          {achievement.unlocked && achievement.unlockedAt && (
            <div className="text-xs text-gray-500">
              Le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
            </div>
          )}
          {!achievement.unlocked && achievement.maxProgress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progression</span>
                <span>{achievement.progress || 0}/{achievement.maxProgress}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
                    achievement.rarity === 'common' ? 'bg-gray-400' :
                    achievement.rarity === 'rare' ? 'bg-blue-400' :
                    achievement.rarity === 'epic' ? 'bg-purple-400' :
                    'bg-yellow-400'
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface AchievementsListProps {
  achievements: Achievement[];
  projectId?: string;
  className?: string;
}

export const AchievementsList: React.FC<AchievementsListProps> = ({
  achievements,
  projectId: _projectId,
  className
}) => {
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className={cn('space-y-6', className)}>
      {unlocked.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Achievements débloqués ({unlocked.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-600">
            À débloquer ({locked.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locked.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

