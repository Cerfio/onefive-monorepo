'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/base/buttons/button';
import { X } from 'lucide-react';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface EditAchievementsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievements: Achievement[];
  onSave: (achievements: Achievement[]) => void;
}

export const EditAchievementsModal: React.FC<EditAchievementsModalProps> = ({
  open,
  onOpenChange,
  achievements,
  onSave,
}) => {
  const [localAchievements, setLocalAchievements] = useState<Achievement[]>(achievements);

  useEffect(() => {
    setLocalAchievements(achievements);
  }, [achievements]);

  const handleAdd = () => {
    setLocalAchievements([
      ...localAchievements,
      {
        id: `temp-${Date.now()}`,
        title: '',
        description: '',
        date: '',
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setLocalAchievements(localAchievements.filter(a => a.id !== id));
  };

  const handleChange = (id: string, field: keyof Achievement, value: string) => {
    setLocalAchievements(
      localAchievements.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtrer les réalisations vides
    const validAchievements = localAchievements.filter(
      a => a.title.trim() && a.description.trim()
    );
    onSave(validAchievements);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier les réalisations</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {localAchievements.map((achievement, index) => (
            <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Réalisation {index + 1}</h4>
                <Button
                  type="button"
                  color="tertiary"
                  size="sm"
                  onClick={() => handleRemove(achievement.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={achievement.title}
                  onChange={(e) => handleChange(achievement.id, 'title', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Station F Alumni"
                  maxLength={VALIDATION_LIMITS.PROFILE.ACHIEVEMENT_TITLE_MAX}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={achievement.description}
                  onChange={(e) => handleChange(achievement.id, 'description', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Ex: Accélérateur Station F"
                  maxLength={VALIDATION_LIMITS.PROFILE.ACHIEVEMENT_DESCRIPTION_MAX}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="text"
                  value={achievement.date}
                  onChange={(e) => handleChange(achievement.id, 'date', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: 2023"
                  maxLength={VALIDATION_LIMITS.PROFILE.ACHIEVEMENT_DATE_MAX}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            color="secondary"
            onClick={handleAdd}
            className="w-full"
          >
            + Ajouter une réalisation
          </Button>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              color="secondary"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAchievementsModal;

