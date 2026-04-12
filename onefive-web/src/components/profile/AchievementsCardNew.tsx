"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/base/buttons/button";
import { Edit3, Trophy } from "lucide-react";
import EditAchievementsModalNew from "./modals/EditAchievementsModalNew";

interface Achievement {
  id: string;
  title: string;
  description: string;
  date?: string;
}

interface AchievementsCardNewProps {
  achievements: Achievement[];
  currentUser: boolean;
  onSave?: (achievements: Achievement[], deleteIds: string[]) => Promise<void>;
}

export const AchievementsCardNew = ({
  achievements,
  currentUser,
  onSave,
}: AchievementsCardNewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="p-6">
        <CardHeader className="px-0 py-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Réalisations</CardTitle>
            {currentUser && (
              <CardAction>
                <Button color="tertiary" size="sm" onClick={() => setIsModalOpen(true)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              </CardAction>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          {achievements && achievements.length > 0 ? (
            achievements.map((achievement) => (
              <div key={achievement.id} className="flex gap-3 items-start">
                <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#101828]">
                    {achievement.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {achievement.description}
                    {achievement.date && ` • ${achievement.date}`}
                  </p>
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

      {currentUser && onSave && (
        <EditAchievementsModalNew
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          achievements={achievements}
          onSave={onSave}
        />
      )}
    </>
  );
};

