'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { Input } from '../../base/input/input';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { validateRequiredFields } from '../utils';

// Modal pour modifier les réalisations
const EditAchievementsModal = ({ open, onOpenChange, achievements, onSave }: { open: boolean, onOpenChange: (isOpen: boolean) => void, achievements: any[], onSave: (data: any) => void }) => {
    const [localAchievements, setLocalAchievements] = useState(achievements);
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => { 
      setLocalAchievements(achievements);
      setErrors([]);
    }, [achievements]);

    const handleSave = async () => {
        setIsLoading(true);
        const newErrors: string[] = [];
        
        localAchievements.forEach((ach, index) => {
          const achErrors = validateRequiredFields(ach, 'achievement');
          achErrors.forEach(error => newErrors.push(`Réalisation ${index + 1}: ${error}`));
        });
        
        if (newErrors.length > 0) {
          setErrors(newErrors);
          toast.error("Veuillez corriger les erreurs avant de sauvegarder");
          setIsLoading(false);
          return;
        }
        
        try {
          // Filtrer les entrées vides
          const filteredAchievements = localAchievements.filter(ach => 
            ach.title?.trim() && ach.description?.trim()
          );
          
          await onSave(filteredAchievements);
          toast.success('Réalisations mises à jour.');
          onOpenChange(false);
        } catch (error) {
          toast.error('Erreur lors de la sauvegarde. Veuillez réessayer.');
          console.error('Erreur:', error);
        } finally {
          setIsLoading(false);
        }
    };

    const handleChange = (index: number, field: string, value: string) => {
        const updated = localAchievements.map((ach, i) => 
            i === index ? { ...ach, [field]: value } : ach
        );
        setLocalAchievements(updated);
    };

    const addAchievement = () => setLocalAchievements([...localAchievements, { id: `new_${Date.now()}`, title: '', description: '', date: '' }]);
    const removeAchievement = (index: number) => setLocalAchievements(localAchievements.filter((_, i) => i !== index));

    return (
      <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
        <Button style={{ display: 'none' }}>Trigger</Button>
        <ModalOverlay isDismissable>
          <Modal>
            <Dialog>
              <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-3xl">
                <CloseButton onClick={() => onOpenChange(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                
                <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                  <AriaHeading slot="title" className="text-md font-semibold text-primary">
                    Modifier les Réalisations
                  </AriaHeading>
                  <p className="text-sm text-tertiary">Ajoutez et modifiez vos réalisations et accomplissements.</p>
                </div>

                <div className="h-5 w-full" />

                <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-4 sm:px-6">
                  {errors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-800 mb-2">Erreurs à corriger :</p>
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
                      <Button color="secondary" size="sm" onClick={addAchievement}>Ajouter</Button>
                    </div>
                    {localAchievements.map((ach, index) => (
                      <div key={ach.id} className="space-y-3 p-4 border rounded-lg">
                        <Input 
                          placeholder="Titre *" 
                          value={ach.title || ''}
                          onChange={(value) => handleChange(index, 'title', value)} 
                        />
                        <Input 
                          placeholder="Description *" 
                          value={ach.description || ''}
                          onChange={(value) => handleChange(index, 'description', value)} 
                        />
                        <Input 
                          placeholder="Date (optionnel)" 
                          value={ach.date || ''}
                          onChange={(value) => handleChange(index, 'date', value)} 
                        />
                        <Button color="secondary-destructive" size="sm" onClick={() => removeAchievement(index)}>
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                  <Button color="secondary" size="lg" onClick={() => onOpenChange(false)} disabled={isLoading}>
                    Annuler
                  </Button>
                  <Button color="primary" size="lg" onClick={handleSave} isDisabled={isLoading}>
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>
    );
};

export default EditAchievementsModal; 