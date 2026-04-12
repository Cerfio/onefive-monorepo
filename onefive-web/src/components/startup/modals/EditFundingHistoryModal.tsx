'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Calendar, Users, FileText, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/application/progress-steps/progress-steps';
import type { ProgressFeaturedIconType } from '@/components/application/progress-steps/progress-types';
import { DialogTrigger, ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button as UIButton } from '@/components/ui/button';
import { Button } from '@/components/base/buttons/button';
import { FundingHistoryEntry, CreateFundingHistoryData, UpdateFundingHistoryData, FundingInvestor } from '@/queries/startup';
import { Trash2, Edit2, Building2 } from 'lucide-react';
import { parseDate } from '@internationalized/date';
import { InfoStep } from './steps/InfoStep';
import { InvestorsStep } from './steps/InvestorsStep';
import { NotesStep } from './steps/NotesStep';
import { Label as BaseLabel } from '@/components/base/input/label';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { Toggle } from '@/components/base/toggle/toggle';
import { InvestorSearch } from '@/components/startup/InvestorSearch';
import { resolveAvatarUrl } from '@/utils/avatar';

const ROUND_OPTIONS = [
  { id: 'LOVE_MONEY', label: 'Love Money' },
  { id: 'PRESEED', label: 'Preseed' },
  { id: 'SEED', label: 'Seed' },
  { id: 'SERIESA', label: 'Série A' },
  { id: 'SERIESB', label: 'Série B' },
  { id: 'SERIESC', label: 'Série C' },
  { id: 'SERIESD', label: 'Série D' },
  { id: 'BRIDGE', label: 'Bridge' },
  { id: 'VENTUREDEBT', label: 'Venture Debt' },
  { id: 'OTHER', label: 'Autre' },
];

interface EditFundingHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: FundingHistoryEntry[];
  startupId: string;
  onCreate: (data: CreateFundingHistoryData) => Promise<void>;
  onUpdate: (historyId: string, data: UpdateFundingHistoryData) => Promise<void>;
  onDelete: (historyId: string) => Promise<void>;
  initialEntryId?: string;
}

export const EditFundingHistoryModal: React.FC<EditFundingHistoryModalProps> = ({
  open,
  onOpenChange,
  history,
  startupId: _startupId,
  onCreate,
  onUpdate,
  onDelete,
  initialEntryId,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Si initialEntryId est fourni, charger l'entrée en mode édition
    if (open && initialEntryId && !editingId) {
      const entry = history.find(e => e.id === initialEntryId);
      if (entry) {
        const dateStr = entry.date.split('T')[0];
        const parsedDate = parseDate(dateStr);

        const standardInstruments = ['SAFE', 'BSA_AIR', 'EQUITY', 'CONVERTIBLE_NOTE'];
        const isCustomInstrument = entry.instrument && !standardInstruments.includes(entry.instrument);

        setEditingId(entry.id);
        setFormData({
          dateValue: parsedDate,
          roundValue: entry.round,
          amountRaised: entry.amountRaised.toString(),
          valuation: entry.valuation ? entry.valuation.toString() : '',
          instrumentValue: isCustomInstrument ? 'OTHER' : (entry.instrument || ''),
          customInstrument: isCustomInstrument ? entry.instrument : '',
          investors: entry.investors || [],
          leadInvestor: entry.leadInvestor,
          notes: entry.notes || '',
        });
        setCurrentStep(1);
      }
    } else if (open && !editingId && !initialEntryId) {
      // Réinitialiser uniquement en mode création
      setCurrentStep(1);
      setFormData({});
      setShowCloseConfirmation(false);
    }
  }, [open, initialEntryId, editingId, history]);

  const handleNext = (data: any) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: any) => {
    const finalData = { ...formData, ...data };
    setIsSubmitting(true);

    try {
      if (!finalData.dateValue) {
        return;
    }
    
      // Convertir DateValue en string ISO
      const dateStr = `${finalData.dateValue.year}-${String(finalData.dateValue.month).padStart(2, '0')}-${String(finalData.dateValue.day).padStart(2, '0')}`;
      
      // Si "OTHER" est sélectionné, utiliser customInstrument
      const finalInstrument = finalData.instrumentValue === 'OTHER' && finalData.customInstrument?.trim()
        ? finalData.customInstrument.trim() as any
        : (finalData.instrumentValue || undefined);
      
      const dataToSave: CreateFundingHistoryData = {
        date: dateStr,
        amountRaised: parseFloat(finalData.amountRaised) || 0,
        valuation: finalData.valuation ? parseFloat(finalData.valuation) : undefined,
        round: finalData.roundValue as FundingHistoryEntry['round'],
        investors: finalData.investors && finalData.investors.length > 0 ? finalData.investors : undefined,
        leadInvestor: finalData.leadInvestor,
        instrument: finalInstrument,
        notes: finalData.notes || undefined,
      };
      
      if (editingId) {
        await onUpdate(editingId, dataToSave);
      } else {
        await onCreate(dataToSave);
      }

      resetModal();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving funding history:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setFormData({});
    setEditingId(null);
    setShowCloseConfirmation(false);
  };

  const handleClose = () => {
    const hasData = Object.keys(formData).length > 0 || currentStep > 1 || editingId !== null;
    if (hasData && !isEditing) {
      // En mode création, demander confirmation si des données sont saisies
      setShowCloseConfirmation(true);
    } else {
      // En mode édition ou sans données, fermer directement
      onOpenChange(false);
      resetModal();
    }
  };

  const confirmClose = () => {
    onOpenChange(false);
    resetModal();
  };

  const handleDataChange = React.useCallback((data: any) => {
    setFormData((prevData: any) => ({ ...prevData, ...data }));
  }, []);

  const handleEdit = (entry: FundingHistoryEntry) => {
    setEditingId(entry.id);
    const dateStr = entry.date.split('T')[0];
    const parsedDate = parseDate(dateStr);

    const standardInstruments = ['SAFE', 'BSA_AIR', 'EQUITY', 'CONVERTIBLE_NOTE'];
    const isCustomInstrument = entry.instrument && !standardInstruments.includes(entry.instrument);

    setFormData({
      dateValue: parsedDate,
      roundValue: entry.round,
      amountRaised: entry.amountRaised.toString(),
      valuation: entry.valuation ? entry.valuation.toString() : '',
      instrumentValue: isCustomInstrument ? 'OTHER' : (entry.instrument || ''),
      customInstrument: isCustomInstrument ? entry.instrument : '',
      investors: entry.investors || [],
      leadInvestor: entry.leadInvestor,
      notes: entry.notes || '',
    });
    setCurrentStep(1);
    onOpenChange(true);
  };

  const handleDelete = async (historyId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce financement ?')) {
      try {
        await onDelete(historyId);
        if (editingId === historyId) {
          resetModal();
          onOpenChange(false);
        }
      } catch (error) {
        console.error('Error deleting funding history:', error);
      }
    }
  };

  // Configuration des étapes
  const steps: ProgressFeaturedIconType[] = [
    {
      title: 'Informations',
      description: 'Date et montants',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'complete' : 'incomplete',
      icon: Calendar,
      connector: true,
    },
    {
      title: 'Investisseurs',
      description: 'Participants à la levée',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'complete' : 'incomplete',
      icon: Users,
      connector: true,
    },
    {
      title: 'Notes',
      description: 'Contexte et détails',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'complete' : 'incomplete',
      icon: FileText,
      connector: false,
    },
  ];

  const stepMetadata = {
    1: {
      title: 'Informations principales',
      description: 'Renseignez les détails de la levée de fonds'
    },
    2: {
      title: 'Investisseurs',
      description: 'Ajoutez les participants à cette levée'
    },
    3: {
      title: 'Notes et contexte',
      description: 'Ajoutez des informations complémentaires'
    }
  };

  const currentMetadata = stepMetadata[currentStep as keyof typeof stepMetadata];
  const isEditing = editingId !== null;

  // Vue d'édition directe (sans wizard)
  const renderEditView = () => {
    const isValid = formData.dateValue && formData.amountRaised && parseFloat(formData.amountRaised) > 0;
    
    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pb-4">
        {/* Section Informations */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Informations principales</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <BaseLabel isRequired>Date de la levée</BaseLabel>
              <div className="w-full">
                <DatePicker
                  aria-label="Date de la levée"
                  value={formData.dateValue || null}
                  onChange={(value) => handleDataChange({ dateValue: value })}
                  isRequired
                />
              </div>
            </div>

            <div className="w-full">
              <Select
                label="Tour de financement *"
                placeholder="Sélectionner un tour"
                selectedKey={formData.roundValue || 'SEED'}
                onSelectionChange={(key) => handleDataChange({ roundValue: key as string })}
                items={ROUND_OPTIONS}
                isRequired
              >
                {(item) => (
                  <Select.Item id={item.id}>
                    {item.label}
                  </Select.Item>
                )}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Montant levé (€) *"
              type="number"
              value={formData.amountRaised || ''}
              onChange={(value) => handleDataChange({ amountRaised: value })}
              isRequired
              placeholder="Ex: 500000"
            />
            <Input
              label="Valorisation post-money (€)"
              type="number"
              value={formData.valuation || ''}
              onChange={(value) => handleDataChange({ valuation: value })}
              placeholder="Ex: 2000000"
            />
          </div>

          <Select
            label="Instrument utilisé"
            placeholder="Sélectionner un instrument"
            selectedKey={formData.instrumentValue || ''}
            onSelectionChange={(key) => handleDataChange({ instrumentValue: key as string })}
            items={[
              { id: '', label: 'Non spécifié' },
              { id: 'SAFE', label: 'SAFE' },
              { id: 'BSA_AIR', label: 'BSA AIR' },
              { id: 'EQUITY', label: 'Actions (Equity)' },
              { id: 'CONVERTIBLE_NOTE', label: 'Obligations Convertibles' },
              { id: 'OTHER', label: 'Autre' },
            ]}
          >
            {(item) => (
              <Select.Item id={item.id}>
                {item.label}
              </Select.Item>
            )}
          </Select>

          {formData.instrumentValue === 'OTHER' && (
            <Input
              label="Spécifiez l'instrument"
              value={formData.customInstrument || ''}
              onChange={(value) => handleDataChange({ customInstrument: value })}
              placeholder="Ex: Prêt bancaire, Crédit Impôt Recherche..."
            />
          )}
        </div>

        {/* Section Investisseurs */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-900">Investisseurs</h3>
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Recherchez et ajoutez les personnes ou fonds qui ont participé à cette levée.
            </p>
            <InvestorSearch
              onInvestorSelect={(entity) => {
                const fundingInvestor: FundingInvestor = {
                  type: entity.type,
                  id: entity.id,
                  name: entity.name,
                  avatar: entity.avatar,
                  logo: entity.logo,
                  website: entity.website,
                  description: entity.description,
                };
                const currentInvestors = formData.investors || [];
                handleDataChange({ investors: [...currentInvestors, fundingInvestor] });
              }}
              selectedInvestorIds={(formData.investors || []).map((inv: any) => inv.id)}
              placeholder="Rechercher un investisseur ou un fonds..."
            />
          </div>

          {(formData.investors || []).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Investisseurs ajoutés ({(formData.investors || []).length})
              </p>
              <div className="space-y-2">
                {(formData.investors || []).map((investor: FundingInvestor) => (
                  <div
                    key={investor.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    {investor.type === 'person' ? (
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={resolveAvatarUrl(investor.avatar)} />
                        <AvatarFallback>{investor.name[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {investor.logo ? (
                          <img src={investor.logo} alt={investor.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <Building2 className="text-gray-400" size={20} />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {investor.name}
                      </p>
                      {investor.description && (
                        <p className="text-xs text-gray-500 truncate">{investor.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Toggle
                        label="Lead investor"
                        hint="Investisseur principal de cette levée"
                        size="sm"
                        isSelected={formData.leadInvestor === investor.id}
                        onChange={(isSelected) => {
                          handleDataChange({ leadInvestor: isSelected ? investor.id : undefined });
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        color="link-destructive"
                        className="ml-auto"
                        onClick={() => {
                          const currentInvestors = formData.investors || [];
                          const updatedInvestors = currentInvestors.filter((inv: any) => inv.id !== investor.id);
                          handleDataChange({ 
                            investors: updatedInvestors,
                            leadInvestor: formData.leadInvestor === investor.id ? undefined : formData.leadInvestor
                          });
                        }}
                      >
                        Retirer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section Notes */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
          <Input
            label="Notes (optionnel)"
            value={formData.notes || ''}
            onChange={(value) => handleDataChange({ notes: value })}
            placeholder="Ajoutez des informations complémentaires sur cette levée..."
            hint="Contexte, conditions particulières, objectifs de la levée, etc."
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            size="md"
            color="secondary"
            onClick={() => {
              resetModal();
              onOpenChange(false);
            }}
            isDisabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            size="md"
            color="primary"
            onClick={() => handleSubmit({})}
            isDisabled={!isValid || isSubmitting}
            iconLeading={!isSubmitting ? <CheckCircle2 data-icon /> : undefined}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <ModalOverlay>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-4xl">
              <CloseButton onClick={handleClose} theme="light" size="lg" className="absolute top-3 right-3 z-20" />

              {/* Header */}
              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                {!isEditing && (
                  <>
                    {/* Progress Header - Uniquement pour la création */}
                    <div className="hidden md:block mb-4">
                      <Progress.IconsWithText
                        type="featured-icon"
                        items={steps}
                        size="sm"
                        orientation="horizontal"
                        className="justify-center"
                      />
                    </div>
                    <div className="md:hidden mb-4">
                      <Progress.IconsWithText
                        type="featured-icon"
                        items={steps}
                        size="sm"
                        orientation="vertical"
                        className="justify-start"
                      />
                    </div>
                  </>
                )}

                {/* Step Title & Description */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {isEditing ? (
                      <>
                        <Edit2 className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold text-primary">
                          Modifier le financement
                        </h2>
                      </>
                    ) : (
                      <>
                        {currentStep === 3 && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        <h2 className="text-xl font-semibold text-primary">
                          {currentMetadata.title}
                        </h2>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-tertiary">
                    {isEditing 
                      ? 'Modifiez les informations de cette levée de fonds'
                      : currentMetadata.description}
                  </p>
                </div>
              </div>

              <div className="h-5 w-full" />

              {/* Step Content */}
              <div className="px-4 sm:px-6 pb-6">
                {isEditing ? (
                  // Vue d'édition directe (tout sur une page)
                  renderEditView()
                ) : (
                  // Vue création avec wizard
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        <InfoStep
                          onNext={handleNext}
                          data={formData}
                          onDataChange={handleDataChange}
                        />
                      </motion.div>
                    )}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        <InvestorsStep
                          onNext={handleNext}
                          onBack={handleBack}
                          data={formData}
                          onDataChange={handleDataChange}
                        />
                      </motion.div>
                    )}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        <NotesStep
                          onNext={handleSubmit}
                          onBack={handleBack}
                          data={formData}
                          onDataChange={handleDataChange}
                          isSubmitting={isSubmitting}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </Dialog>
        </Modal>

        {/* Modal de confirmation de fermeture */}
        {showCloseConfirmation && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-[6px] animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quitter l'ajout de financement ?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Vous avez des données saisies. Êtes-vous sûr de vouloir fermer cette modal ? Toutes vos données seront perdues.
              </p>
              <div className="flex gap-3 justify-end">
                        <Button
                          size="sm"
                          color="secondary"
                          onClick={() => setShowCloseConfirmation(false)}
                        >
                          Annuler
                        </Button>
                        <Button 
                          size="sm" 
                          color="primary"
                          onClick={confirmClose}
                        >
                          Quitter
                        </Button>
              </div>
            </div>
          </div>
        )}
      </ModalOverlay>

        {/* Liste de l'historique - Uniquement en mode création */}
      {history.length > 0 && open && !isEditing && (
        <div className="fixed inset-0 z-[50] pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl border p-4 max-h-[40vh] overflow-y-auto">
            <h3 className="font-semibold mb-3 text-gray-900">Historique existant ({history.length})</h3>
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                          {ROUND_OPTIONS.find(o => o.id === entry.round)?.label || entry.round}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {entry.amountRaised >= 1000000
                        ? `${(entry.amountRaised / 1000000).toFixed(1)}M€`
                        : entry.amountRaised >= 1000
                        ? `${(entry.amountRaised / 1000).toFixed(0)}K€`
                        : `${entry.amountRaised}€`}
                      {entry.valuation && (
                        <span className="text-gray-500 font-normal ml-2">
                          · Valo: {entry.valuation >= 1000000
                            ? `${(entry.valuation / 1000000).toFixed(1)}M€`
                            : entry.valuation >= 1000
                            ? `${(entry.valuation / 1000).toFixed(0)}K€`
                            : `${entry.valuation}€`}
                        </span>
                      )}
                    </div>
                    {entry.investors && entry.investors.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Investisseurs:</span>
                        <div className="flex -space-x-2">
                          {entry.investors.slice(0, 3).map((inv) => (
                            inv.type === 'person' && inv.avatar ? (
                              <Avatar key={inv.id} className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={resolveAvatarUrl(inv.avatar)} />
                                <AvatarFallback className="text-xs">{inv.name[0]}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div 
                                key={inv.id}
                                className="h-6 w-6 border-2 border-white rounded-full bg-gray-100 flex items-center justify-center"
                                title={inv.name}
                              >
                                {inv.type === 'company' ? (
                                  inv.logo ? (
                                    <img src={inv.logo} alt={inv.name} className="w-4 h-4 object-contain rounded-full" />
                                  ) : (
                                    <Building2 className="w-3 h-3 text-gray-500" />
                                  )
                                ) : (
                                  <span className="text-[8px]">{inv.name[0]}</span>
                                )}
                              </div>
                            )
                          ))}
                          {entry.investors.length > 3 && (
                            <div className="h-6 w-6 border-2 border-white rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-[8px] text-gray-600">+{entry.investors.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-4">
                    <UIButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      className="hover:bg-gray-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </UIButton>
                    <UIButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </UIButton>
                  </div>
                </div>
              ))}
              </div>
            </div>
            </div>
          </div>
        )}
    </DialogTrigger>
  );
};
