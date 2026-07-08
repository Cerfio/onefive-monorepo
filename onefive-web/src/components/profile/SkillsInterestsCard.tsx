'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card/card';
import { Button } from '../base/buttons/button';
import { Badge } from '../base/badges/badges';
import { Edit3, Sparkles } from 'lucide-react';
import {
  tags as tagList,
  getTagByInterest,
  getInterestDisplayLabel,
} from '@/shared/constants/tags';
import type { BadgeColors } from '../base/badges/badge-types';

const SKILL_BADGE_COLORS: BadgeColors[] = [
  'brand',
  'success',
  'warning',
  'blue-light',
  'indigo',
  'pink',
];

const topicColorToBadgeColor: Record<string, BadgeColors> = {
  'bg-error-500': 'error',
  'bg-primary-500': 'brand',
  'bg-warning-500': 'warning',
  'bg-success-500': 'success',
  'bg-blue-light-500': 'blue-light',
  'bg-indigo-500': 'indigo',
  'bg-pink-500': 'pink',
  'bg-gray-blue-500': 'gray-blue',
};

const getInterestBadgeColor = (interest: string): BadgeColors => {
  const tag = getTagByInterest(interest);
  if (tag) {
    return topicColorToBadgeColor[tag.topicColor] ?? 'gray';
  }
  return 'gray';
};

export const SkillsInterestsCard = ({ profileData, currentUser, onEdit }: { profileData: any, currentUser: boolean, onEdit: () => void }) => {
    const skills = profileData?.skills ?? [];
    const interests = profileData?.interests ?? [];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Compétences & Intérêts</CardTitle>
            {currentUser && (
                <Button color="tertiary" size="sm" onClick={onEdit}>
                <Edit3 className="h-4 w-4" />
                </Button>
            )}
            </CardHeader>
            <CardContent>
                <h4 className="font-semibold text-sm mb-2">Compétences</h4>
                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill: string, index: number) => (
                          <Badge
                            key={`skill-${skill}-${index}`}
                            color={SKILL_BADGE_COLORS[index % SKILL_BADGE_COLORS.length]}
                            size="sm"
                          >
                            {skill}
                          </Badge>
                        ))}
                    </div>
                ) : currentUser ? (
                    <button onClick={onEdit} className="flex items-center gap-2 py-3 mb-4 text-sm font-medium text-[#5E6AD2] hover:text-[#4149A8] transition-colors">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        Ajoutez vos compétences pour être mieux trouvé
                    </button>
                ) : (
                    <div className="flex items-center gap-2 py-3 mb-4 text-gray-400">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <p className="text-sm">Aucune compétence renseignée</p>
                    </div>
                )}
                <h4 className="font-semibold text-sm mb-2">Intérêts</h4>
                {interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {interests.map((interest: string, index: number) => {
                          const tag = getTagByInterest(interest);
                          return (
                            <Badge
                              key={`interest-${interest}-${index}`}
                              color={getInterestBadgeColor(interest)}
                            >
                              {tag ? `${tag.icon} ` : ''}
                              {getInterestDisplayLabel(interest)}
                            </Badge>
                          );
                        })}
                    </div>
                ) : currentUser ? (
                    <button onClick={onEdit} className="flex items-center gap-2 py-3 text-sm font-medium text-[#5E6AD2] hover:text-[#4149A8] transition-colors">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        Ajoutez vos centres d'intérêt
                    </button>
                ) : (
                    <div className="flex items-center gap-2 py-3 text-gray-400">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <p className="text-sm">Aucun intérêt renseigné</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 