'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { Input } from '../../base/input/input';
import { Separator } from '@/components/base/separator/separator';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

import { MonthYearPicker } from '../../application/date-picker/month-year-picker';
import { dateValueToISOString, isoStringToDateValue, getTodayDateValue } from '@/utils/dateUtils';
import type { DateValue } from 'react-aria-components';

// Type pour les expériences avec dates
type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  domain?: string;
  countryCode?: string;
  city?: string;
  from: DateValue | null;
  to: DateValue | null;
  isPresent: boolean;
  description?: string;
  tags?: string[];
};

type EducationItem = {
  id: string;
  degree: string;
  school: string;
  domain?: string;
  countryCode?: string;
  city?: string;
  from: DateValue | null;
  to: DateValue | null;
  isPresent: boolean;
  description?: string;
  tags?: string[];
};

// Modal pour modifier "À Propos" (Expérience & Formation)
const EditAboutModal = ({ open, onOpenChange, experience, education, onSave }: { open: boolean, onOpenChange: (isOpen: boolean) => void, experience: any[], education: any[], onSave: (data: any) => void }) => {
  // Convertir les données entrantes en format DateValue
  const convertToLocalFormat = (items: any[]): ExperienceItem[] | EducationItem[] => {
    return items.map(item => {
      const isPresent = !item.endDate || item.endDate === 'Present' || !item.to;
      return {
        ...item,
        from: isoStringToDateValue(item.startDate || item.from),
        to: isPresent ? undefined : isoStringToDateValue(item.endDate || item.to),
        isPresent,
      };
    });
  };

  const [localExperience, setLocalExperience] = useState<ExperienceItem[]>(convertToLocalFormat(experience) as ExperienceItem[]);
  const [localEducation, setLocalEducation] = useState<EducationItem[]>(convertToLocalFormat(education) as EducationItem[]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setLocalExperience(convertToLocalFormat(experience) as ExperienceItem[]);
    setLocalEducation(convertToLocalFormat(education) as EducationItem[]);
    setErrors([]);
  }, [experience, education]);

  const handleSave = async () => {
    const newErrors: string[] = [];
    
    // Validation des expériences
    localExperience.forEach((exp, index) => {
      if (!exp.title?.trim()) newErrors.push(`Expérience ${index + 1}: Le titre est requis`);
      if (!exp.company?.trim()) newErrors.push(`Expérience ${index + 1}: L'entreprise est requise`);
      if (!exp.from) newErrors.push(`Expérience ${index + 1}: La date de début est requise`);
      
      // Valider que la date de fin est après la date de début
      if (exp.from && exp.to && !exp.isPresent) {
        const fromDate = new Date(dateValueToISOString(exp.from)!);
        const toDate = new Date(dateValueToISOString(exp.to)!);
        if (fromDate > toDate) {
          newErrors.push(`Expérience ${index + 1}: La date de début doit être antérieure à la date de fin`);
        }
      }
    });
    
    // Validation des formations
    localEducation.forEach((edu, index) => {
      if (!edu.degree?.trim()) newErrors.push(`Formation ${index + 1}: Le diplôme est requis`);
      if (!edu.school?.trim()) newErrors.push(`Formation ${index + 1}: L'école est requise`);
      if (!edu.from) newErrors.push(`Formation ${index + 1}: La date de début est requise`);
      
      // Valider que la date de fin est après la date de début
      if (edu.from && edu.to && !edu.isPresent) {
        const fromDate = new Date(dateValueToISOString(edu.from)!);
        const toDate = new Date(dateValueToISOString(edu.to)!);
        if (fromDate > toDate) {
          newErrors.push(`Formation ${index + 1}: La date de début doit être antérieure à la date de fin`);
        }
      }
    });
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast.error("Veuillez corriger les erreurs avant de sauvegarder");
      return;
    }
    
    // Convertir en format API et filtrer les entrées vides
    const filteredExperience = localExperience
      .filter(exp => exp.title?.trim() && exp.company?.trim())
      .map(exp => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        domain: exp.domain || exp.company,
        countryCode: exp.countryCode || 'FR',
        city: exp.city || 'Paris',
        // Utiliser startDate/endDate pour la compatibilité avec handleSaveExperiencesAndEducation
        startDate: dateValueToISOString(exp.from)!,
        endDate: exp.isPresent ? undefined : dateValueToISOString(exp.to),
        description: exp.description,
        tags: exp.tags || [],
      }));
    
    const filteredEducation = localEducation
      .filter(edu => edu.degree?.trim() && edu.school?.trim())
      .map(edu => ({
        id: edu.id,
        degree: edu.degree,
        school: edu.school,
        domain: edu.domain || edu.school,
        countryCode: edu.countryCode || 'FR',
        city: edu.city || 'Paris',
        // Utiliser startDate/endDate pour la compatibilité avec handleSaveExperiencesAndEducation
        startDate: dateValueToISOString(edu.from)!,
        endDate: edu.isPresent ? undefined : dateValueToISOString(edu.to),
        description: edu.description,
        tags: edu.tags || [],
      }));
    
    onSave({ experience: filteredExperience, education: filteredEducation });
    toast.success('Section "À Propos" mise à jour.');
    onOpenChange(false);
  };

  const handleExpChange = (index: number, field: string, value: any) => {
    const updated = [...localExperience];
    updated[index] = { ...updated[index], [field]: value };
    setLocalExperience(updated);
  };
  
  const handleEduChange = (index: number, field: string, value: any) => {
    const updated = [...localEducation];
    updated[index] = { ...updated[index], [field]: value };
    setLocalEducation(updated);
  };

  const MAX_EXPERIENCES = 10;
  const MAX_EDUCATIONS = 10;

  const addExperience = () => {
    if (localExperience.length >= MAX_EXPERIENCES) {
      toast.error(`Vous ne pouvez pas ajouter plus de ${MAX_EXPERIENCES} expériences`);
      return;
    }
    setLocalExperience([...localExperience, {
      id: `new_${Date.now()}`,
      title: '',
      company: '',
      domain: '',
      countryCode: 'FR',
      city: '',
      from: null,
      to: null,
      isPresent: false,
      description: '',
      tags: [],
    }]);
  };
  const removeExperience = (index: number) => setLocalExperience(localExperience.filter((_, i) => i !== index));

  const addEducation = () => {
    if (localEducation.length >= MAX_EDUCATIONS) {
      toast.error(`Vous ne pouvez pas ajouter plus de ${MAX_EDUCATIONS} formations`);
      return;
    }
    setLocalEducation([...localEducation, {
      id: `new_${Date.now()}`,
      degree: '',
      school: '',
      domain: '',
      countryCode: 'FR',
      city: '',
      from: null,
      to: null,
      isPresent: false,
      description: '',
      tags: [],
    }]);
  };
  const removeEducation = (index: number) => setLocalEducation(localEducation.filter((_, i) => i !== index));

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-3xl">
              <CloseButton onClick={() => onOpenChange(false)} theme="light" size="lg" className="absolute top-3 right-3" />
              
              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                  Modifier "À Propos"
                </AriaHeading>
                <p className="text-sm text-tertiary">Modifiez votre expérience professionnelle et votre formation.</p>
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
                    <h4 className="font-semibold text-md">Expérience</h4>
                    <Button color="secondary" size="sm" onClick={addExperience}>Ajouter</Button>
                  </div>
                  {localExperience.map((exp, index) => (
                    <div key={exp.id} className="space-y-3 p-4 border rounded-lg">
                      <Input 
                        placeholder="Titre * (max 100 car.)" 
                        defaultValue={exp.title}
                        onChange={(value) => handleExpChange(index, 'title', value)}
                        maxLength={VALIDATION_LIMITS.EXPERIENCE.TITLE_MAX}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="Entreprise * (max 100 car.)" 
                          defaultValue={exp.company}
                          onChange={(value) => handleExpChange(index, 'company', value)}
                          maxLength={VALIDATION_LIMITS.EXPERIENCE.COMPANY_MAX}
                        />
                        <Input 
                          placeholder="domaine.com (max 100 car.)" 
                          defaultValue={exp.domain}
                          onChange={(value) => handleExpChange(index, 'domain', value)}
                          maxLength={VALIDATION_LIMITS.EXPERIENCE.DOMAIN_MAX}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <MonthYearPicker
                          label="Date de début *"
                          value={exp.from}
                          onChange={(date) => handleExpChange(index, 'from', date)}
                          maxValue={getTodayDateValue()}
                          placeholder="MM/AAAA"
                        />
                        <MonthYearPicker
                          label="Date de fin"
                          value={exp.to}
                          onChange={(date) => handleExpChange(index, 'to', date)}
                          minValue={exp.from || undefined}
                          maxValue={getTodayDateValue()}
                          placeholder="MM/AAAA"
                          allowPresent
                          isPresent={exp.isPresent}
                          onPresentChange={(isPresent) => handleExpChange(index, 'isPresent', isPresent)}
                        />
                      </div>
                      <Button color="secondary-destructive" size="sm" onClick={() => removeExperience(index)}>
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-md">Formation</h4>
                    <Button color="secondary" size="sm" onClick={addEducation}>Ajouter</Button>
                  </div>
                  {localEducation.map((edu, index) => (
                    <div key={edu.id} className="space-y-3 p-4 border rounded-lg">
                      <Input 
                        placeholder="Diplôme * (max 100 car.)" 
                        defaultValue={edu.degree}
                        onChange={(value) => handleEduChange(index, 'degree', value)}
                        maxLength={VALIDATION_LIMITS.EDUCATION.DEGREE_MAX}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="École * (max 100 car.)" 
                          defaultValue={edu.school}
                          onChange={(value) => handleEduChange(index, 'school', value)}
                          maxLength={VALIDATION_LIMITS.EDUCATION.SCHOOL_MAX}
                        />
                        <Input 
                          placeholder="domaine.com (max 100 car.)" 
                          defaultValue={edu.domain}
                          onChange={(value) => handleEduChange(index, 'domain', value)}
                          maxLength={VALIDATION_LIMITS.EDUCATION.DOMAIN_MAX}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <MonthYearPicker
                          label="Date de début *"
                          value={edu.from}
                          onChange={(date) => handleEduChange(index, 'from', date)}
                          maxValue={getTodayDateValue()}
                          placeholder="MM/AAAA"
                        />
                        <MonthYearPicker
                          label="Date de fin"
                          value={edu.to}
                          onChange={(date) => handleEduChange(index, 'to', date)}
                          minValue={edu.from || undefined}
                          maxValue={getTodayDateValue()}
                          placeholder="MM/AAAA"
                          allowPresent
                          isPresent={edu.isPresent}
                          onPresentChange={(isPresent) => handleEduChange(index, 'isPresent', isPresent)}
                        />
                      </div>
                      <Button color="secondary-destructive" size="sm" onClick={() => removeEducation(index)}>
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                <Button color="secondary" size="lg" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button color="primary" size="lg" onClick={handleSave}>
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

export default EditAboutModal; 