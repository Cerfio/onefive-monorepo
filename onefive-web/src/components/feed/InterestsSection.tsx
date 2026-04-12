'use client';

import { useMeProfile, useUpdateSkillsInterests } from '@/queries/profile';
import {
  tags as tagList,
  getTagByInterest,
  getInterestDisplayLabel,
} from '@/shared/constants/tags';
import { Badge } from '@/components/base/badges/badges';
import type { BadgeColors } from '@/components/base/badges/badge-types';

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
import { Button } from '@/components/base/buttons/button';
import EditSkillsInterestsModal from '@/components/profile/modals/EditSkillsInterestsModal';
import { Sparkles, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function InterestsSection() {
  const { data: profile, isLoading, error } = useMeProfile();
  const updateSkillsInterestsMutation = useUpdateSkillsInterests();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const interests = profile?.interests ?? [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-[#5E6AD2]/20 transition-all duration-300">
        <div className="font-semibold text-sm mb-2">Vos centres d&apos;intérêt</div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-6 bg-gray-200 rounded animate-pulse w-20"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-[#5E6AD2]/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-sm">Vos centres d&apos;intérêt</div>
          <Button
            color="tertiary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="p-1 h-7"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest) => {
              const tagData = getTagByInterest(interest);
              return (
                <Badge
                  key={interest}
                  color={getInterestBadgeColor(interest)}
                  size="sm"
                >
                  {tagData ? `${tagData.icon} ` : ''}
                  {getInterestDisplayLabel(interest)}
                </Badge>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 py-2 text-gray-400">
              <Sparkles className="h-4 w-4 shrink-0" />
              <p className="text-sm">Aucun centre d&apos;intérêt</p>
            </div>
            <Link href="/profile/current_user">
              <Button color="secondary" size="sm">
                Compléter mon profil
              </Button>
            </Link>
          </div>
        )}
      </div>

      <EditSkillsInterestsModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        skills={profile?.skills ?? []}
        interests={profile?.interests ?? []}
        onSave={async (data) => {
          await updateSkillsInterestsMutation.mutateAsync({
            skills: data.skills,
            interests: data.interests,
          });
          setIsEditModalOpen(false);
        }}
      />
    </>
  );
}
