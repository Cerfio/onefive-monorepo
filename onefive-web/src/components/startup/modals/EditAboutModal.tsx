'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { Input } from '../../base/input/input';
import { TextArea } from '../../base/textarea/textarea';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { VALIDATION_LIMITS } from '@/constants/validation-limits';
import { BadgeSelector } from '@/components/startup';
import { SECTOR_OPTIONS } from '@/shared/constants/sector-colors';

interface EditAboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startupData: {
    description: string;
    sectors: string[];
    founded?: string;
    website?: string;
    linkedin?: string;
  };
  onSave: (data: {
    description?: string;
    categories?: string[];
    foundedDate?: string;
    website?: string;
    linkedin?: string;
  }) => void;
}

export const EditAboutModal: React.FC<EditAboutModalProps> = ({
  open,
  onOpenChange,
  startupData,
  onSave,
}) => {
  const [form, setForm] = useState({
    description: startupData.description || '',
    categories: Array.isArray(startupData.sectors) ? startupData.sectors : [],
    foundedDate: startupData.founded ? `${startupData.founded}-01-01` : '',
    website: startupData.website || '',
    linkedin: startupData.linkedin || '',
  });

  useEffect(() => {
    setForm({
      description: startupData.description || '',
      categories: Array.isArray(startupData.sectors) ? startupData.sectors : [],
      foundedDate: startupData.founded ? `${startupData.founded}-01-01` : '',
      website: startupData.website || '',
      linkedin: startupData.linkedin || '',
    });
  }, [startupData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convertir la date au format ISO si fournie
    let foundedDate: string | undefined = undefined;
    if (form.foundedDate) {
      const date = new Date(form.foundedDate);
      if (!isNaN(date.getTime())) {
        foundedDate = date.toISOString();
      }
    }
    
    onSave({
      description: form.description || undefined,
      categories: form.categories.length > 0 ? form.categories : undefined,
      foundedDate,
      website: form.website || undefined,
      linkedin: form.linkedin || undefined,
    });
    onOpenChange(false);
  };

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <Button style={{ display: 'none' }}>Trigger</Button>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-2xl">
              <CloseButton onClick={() => onOpenChange(false)} theme="light" size="lg" className="absolute top-3 right-3" />
              
              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                  Modifier les informations à propos
                </AriaHeading>
                <p className="text-sm text-tertiary">Modifiez la description et les informations de votre startup.</p>
              </div>

              <div className="h-5 w-full" />

              <form onSubmit={handleSubmit} className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-4 sm:px-6">
                <div className="space-y-4">
                  <div>
                    <TextArea
                      label="Description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Décrivez votre startup..."
                      maxLength={VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX}
                      className="min-h-24"
                    />
                    <p className={`text-xs mt-1 ${form.description.length >= VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX ? 'text-red-500' : form.description.length > VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX * 0.8 ? 'text-yellow-600' : 'text-tertiary'}`}>
                      {form.description.length}/{VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX} caractères
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Secteurs</label>
                    <BadgeSelector
                      selected={form.categories}
                      onChange={(categories) => setForm({ ...form, categories })}
                      max={VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT}
                      options={SECTOR_OPTIONS}
                    />
                    <p className="text-xs text-tertiary mt-1">
                      {form.categories.length}/{VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT} secteurs sélectionnés
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Année de fondation</label>
                    <input
                      type="date"
                      name="foundedDate"
                      value={form.foundedDate}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <Input
                    label="Site web"
                    type="url"
                    value={form.website}
                    onChange={(value) => setForm({ ...form, website: value })}
                    placeholder="https://example.com"
                  />

                  <Input
                    label="LinkedIn"
                    type="url"
                    value={form.linkedin}
                    onChange={(value) => setForm({ ...form, linkedin: value })}
                    placeholder="https://linkedin.com/company/example"
                  />
                </div>
              </form>

              <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                <Button
                  color="secondary"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                >
                  Annuler
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  onClick={handleSubmit}
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

export default EditAboutModal;

