"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../base/buttons/button";
import { CloseButton } from "../../base/buttons/close-button";
import { Modal, ModalOverlay, Dialog } from "../../application/modals/modal";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { Input } from "@/components/base/input/input";

interface Achievement {
  id: string;
  title: string;
  description: string;
  date?: string;
}

interface LocalAchievement extends Achievement {
  dateValue?: DateValue | null;
}

interface EditAchievementsModalNewProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  achievements: Achievement[];
  onSave: (achievements: Achievement[], deleteIds: string[]) => Promise<void>;
}

const EditAchievementsModalNew = ({
  open,
  onOpenChange,
  achievements,
  onSave,
}: EditAchievementsModalNewProps) => {
  const [localAchievements, setLocalAchievements] = useState<LocalAchievement[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Convertir les dates string en DateValue
    const achievementsWithDateValues = achievements.map((ach) => {
      let dateValue: DateValue | null = null;
      if (ach.date) {
        try {
          // Essayer de parser la date si elle est au format ISO
          const dateMatch = ach.date.match(/(\d{4})-(\d{2})-(\d{2})/);
          if (dateMatch) {
            dateValue = parseDate(ach.date);
          }
        } catch {
          // Si le parsing échoue, on laisse null
        }
      }
      return {
        ...ach,
        dateValue,
      };
    });
    setLocalAchievements(achievementsWithDateValues);
    setDeletedIds([]);
    setErrors([]);
  }, [achievements, open]);

  const handleSave = async () => {
    setIsLoading(true);
    const newErrors: string[] = [];

    // Validation
    localAchievements.forEach((ach, index) => {
      if (!ach.title?.trim()) {
        newErrors.push(`Réalisation ${index + 1}: Le titre est requis`);
      }
      if (!ach.description?.trim()) {
        newErrors.push(`Réalisation ${index + 1}: La description est requise`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast.error("Veuillez corriger les erreurs avant de sauvegarder");
      setIsLoading(false);
      return;
    }

    try {
      // Filtrer les entrées vides et convertir DateValue en string
      const filteredAchievements = localAchievements
        .filter((ach) => ach.title?.trim() && ach.description?.trim())
        .map((ach) => {
          let dateString: string | undefined = undefined;
          if (ach.dateValue) {
            // Convertir DateValue en string ISO
            const jsDate = ach.dateValue.toDate(getLocalTimeZone());
            dateString = jsDate.toISOString().split("T")[0];
          }
          return {
            id: ach.id,
            title: ach.title,
            description: ach.description,
            date: dateString,
          };
        });

      await onSave(filteredAchievements, deletedIds);
      
      toast.success("Réalisations mises à jour.");
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    index: number,
    field: "title" | "description" | "date",
    value: string | DateValue | null
  ) => {
    const updated = [...localAchievements];
    if (field === "date" && (value === null || typeof value === "object")) {
      updated[index].dateValue = value as DateValue | null;
    } else {
      updated[index][field] = value as string;
    }
    setLocalAchievements(updated);
  };

  const addAchievement = () => {
    const newAchievement: LocalAchievement = {
      id: `new_${Date.now()}`,
      title: "",
      description: "",
      date: undefined,
      dateValue: today(getLocalTimeZone()),
    };
    setLocalAchievements([...localAchievements, newAchievement]);
  };

  const removeAchievement = (index: number) => {
    const achievement = localAchievements[index];
    if (!achievement.id.startsWith("new_")) {
      setDeletedIds([...deletedIds, achievement.id]);
    }
    setLocalAchievements(localAchievements.filter((_, i) => i !== index));
  };

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <Button style={{ display: "none" }}>Trigger</Button>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-3xl">
              <CloseButton
                onClick={() => onOpenChange(false)}
                theme="light"
                size="lg"
                className="absolute top-3 right-3"
              />

              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                  Modifier les Réalisations
                </AriaHeading>
                <p className="text-sm text-tertiary">
                  Ajoutez et modifiez vos réalisations et accomplissements.
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
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-md">Réalisations</h4>
                    <Button color="secondary" size="sm" onClick={addAchievement}>
                      Ajouter
                    </Button>
                  </div>
                  {localAchievements.map((ach, index) => (
                    <div
                      key={ach.id}
                      className="border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="text-sm font-medium text-gray-700">
                        Réalisation {index + 1}
                      </div>
                      <Input
                        placeholder="Titre *"
                        defaultValue={ach.title}
                        onChange={(value) => handleChange(index, "title", value)}
                      />
                      <Input
                        placeholder="Description *"
                        defaultValue={ach.description}
                        onChange={(value) => handleChange(index, "description", value)}
                      />
                      <DatePicker
                        aria-label="Date de la réalisation"
                        value={ach.dateValue || null}
                        onChange={(value) => handleChange(index, "date", value)}
                      />
                      <Button
                        color="secondary-destructive"
                        size="sm"
                        onClick={() => removeAchievement(index)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}
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
                  isDisabled={isLoading}
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};

export default EditAchievementsModalNew;

