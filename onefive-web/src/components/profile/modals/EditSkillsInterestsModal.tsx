'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { SkillInput } from '../SkillInput';
import {
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
} from 'react-aria-components';
import { TagPicker } from '../TagPicker';
import { tags as tagList, getTagByInterest } from '@/shared/constants/tags';

const VALID_TAG_VALUES = new Set([
  ...tagList.map((t) => t.title),
  ...tagList.map((t) => t.enum),
]);

const EditSkillsInterestsModal = ({
  open,
  onOpenChange,
  skills,
  interests,
  onSave,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  skills: string[];
  interests: string[];
  onSave: (data: any) => void;
}) => {
  const [localSkills, setLocalSkills] = useState<string[]>([]);
  const [localInterests, setLocalInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalSkills(skills);
    setLocalInterests(
        interests
          .filter((i) => VALID_TAG_VALUES.has(i))
          .map((i) => {
            const tag = getTagByInterest(i);
            return tag ? tag.title : i;
          }),
      );
    setErrors([]);
    setIsLoading(false);
  }, [skills, interests, open]);

  const handleSave = async () => {
    setIsLoading(true);
    const newErrors: string[] = [];

    if (localSkills.length < 1) newErrors.push('Au moins une compétence est requise');
    if (localInterests.length < 1)
      newErrors.push('Au moins un centre d\'intérêt est requis');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      toast.error('Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }

    try {
      await onSave({
        skills: localSkills,
        interests: localInterests,
      });
      onOpenChange(false);
    } catch {
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-2xl">
              <CloseButton
                onClick={() => onOpenChange(false)}
                theme="light"
                size="lg"
                className="absolute top-3 right-3"
              />

              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                <AriaHeading
                  slot="title"
                  className="text-md font-semibold text-primary"
                >
                  Modifier les Compétences & Intérêts
                </AriaHeading>
                <p className="text-sm text-tertiary">
                  Modifiez vos compétences et centres d&apos;intérêt.
                </p>
              </div>

              <div className="h-5 w-full" />

              <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-4 sm:px-6">
                {errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800 mb-2">
                      Erreurs à corriger :
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compétences
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Saisissez une compétence puis appuyez sur Entrée ou
                      virgule pour l&apos;ajouter
                    </p>
                    <SkillInput
                      skills={localSkills}
                      onSkillsChange={setLocalSkills}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Centres d&apos;intérêt
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Cliquez sur les tags pour les ajouter ou les retirer
                      (minimum 1, maximum 8)
                    </p>
                    <TagPicker
                      selectedTags={localInterests}
                      onTagsChange={setLocalInterests}
                      minTags={1}
                      maxTags={8}
                    />
                  </div>
                </div>
              </div>

              <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                <Button
                  color="secondary"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  onClick={handleSave}
                  isLoading={isLoading}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};

export default EditSkillsInterestsModal;
