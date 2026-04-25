'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/base/textarea/textarea';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Select } from '@/components/base/select/select';
import { RadioGroup, RadioButton } from '@/components/base/radio-buttons/radio-buttons';
import { Upload, Euro, DollarSign, PoundSterling } from 'lucide-react';

interface InvestmentProposalModalProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  startupName: string;
}

const INVESTMENT_TYPES = [
  { value: 'equity', label: 'Equity (prise de participation)' },
  { value: 'bsa-safe', label: 'BSA-Air / SAFE' },
  { value: 'convertible-loan', label: 'Prêt convertible' },
  { value: 'grant', label: 'Subvention' },
  { value: 'other', label: 'Autre' },
];

const INVESTMENT_HORIZONS = [
  { value: 'less-than-6-months', label: 'Moins de 6 mois' },
  { value: '6-12-months', label: '6–12 mois' },
  { value: '1-3-years', label: '1–3 ans' },
  { value: 'long-term', label: 'Long terme' },
  { value: 'to-discuss', label: 'À discuter' },
];

const INVESTMENT_OBJECTIVES = [
  { value: 'strategic-support', label: 'Accompagnement stratégique' },
  { value: 'monthly-follow-up', label: 'Suivi mensuel' },
  { value: 'network-access', label: 'Accès à mon réseau' },
  { value: 'board-seat', label: 'Board seat (siéger au conseil)' },
  { value: 'passive-investment', label: 'Investissement passif' },
];

const CURRENCIES = [
  { value: 'EUR', label: '€', icon: Euro },
  { value: 'USD', label: '$', icon: DollarSign },
  { value: 'GBP', label: '£', icon: PoundSterling },
];

export const InvestmentProposalModal = ({ 
  open, 
  onOpenChange, 
  startupName 
}: InvestmentProposalModalProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'EUR',
    investmentType: '',
    otherInvestmentType: '',
    valuation: '',
    equityPercentage: '',
    horizon: '',
    objectives: [] as string[],
    message: '',
    document: null as File | null,
    isConfidential: true,
    allowRecommendations: false,
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Validation en temps réel pour le bouton d'envoi
  const isFormValid = () => {
    return (
      formData.amount.trim() !== '' &&
      formData.investmentType !== '' &&
      (formData.investmentType !== 'other' || formData.otherInvestmentType.trim() !== '') &&
      formData.horizon !== '' &&
      formData.message.trim() !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: string[] = [];
    if (!formData.amount) newErrors.push('Le montant est requis');
    if (!formData.investmentType) newErrors.push('Le type d\'investissement est requis');
    if (formData.investmentType === 'other' && !formData.otherInvestmentType) {
      newErrors.push('Veuillez préciser le type d\'investissement');
    }
    if (!formData.horizon) newErrors.push('L\'horizon d\'investissement est requis');
    if (!formData.message) newErrors.push('Un message est requis');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Proposition d\'investissement envoyée avec succès !');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        amount: '',
        currency: 'EUR',
        investmentType: '',
        otherInvestmentType: '',
        valuation: '',
        equityPercentage: '',
        horizon: '',
        objectives: [],
        message: '',
        document: null,
        isConfidential: true,
        allowRecommendations: false,
      });
      setErrors([]);
    } catch {
      toast.error('Erreur lors de l\'envoi de la proposition');
    }
  };

  const handleObjectiveChange = (objective: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      objectives: checked 
        ? [...prev.objectives, objective]
        : prev.objectives.filter(obj => obj !== objective)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, document: file }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Proposer un investissement à {startupName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Montant proposé */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant proposé *</Label>
            <div className="flex gap-2">
              <Select
                selectedKey={formData.currency}
                onSelectionChange={(key) => setFormData(prev => ({ ...prev, currency: key as string }))}
                className="w-20"
              >
                {CURRENCIES.map((currency) => {
                  const Icon = currency.icon;
                  return (
                    <Select.Item key={currency.value} id={currency.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {currency.label}
                      </div>
                    </Select.Item>
                  );
                })}
              </Select>
              <Input
                id="amount"
                type="number"
                placeholder="25 000"
                value={formData.amount}
                onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Type d'investissement */}
          <div className="space-y-2">
            <Label>Type d'investissement *</Label>
            <RadioGroup
              value={formData.investmentType}
              onChange={(value) => setFormData(prev => ({ ...prev, investmentType: value }))}
            >
              {INVESTMENT_TYPES.map((type) => (
                <RadioButton key={type.value} value={type.value} label={type.label} />
              ))}
            </RadioGroup>
            {formData.investmentType === 'other' && (
              <Input
                placeholder="Précisez le type d'investissement"
                value={formData.otherInvestmentType}
                onChange={(value) => setFormData(prev => ({ ...prev, otherInvestmentType: value }))}
                className="mt-2"
              />
            )}
          </div>

          {/* Valorisation de référence */}
          <div className="space-y-2">
            <Label htmlFor="valuation">Valorisation de référence (optionnel)</Label>
            <Input
              id="valuation"
              placeholder="Ex: Pré-money : 1M€"
              value={formData.valuation}
              onChange={(value) => setFormData(prev => ({ ...prev, valuation: value }))}
            />
          </div>

          {/* Pourcentage de parts visé */}
          <div className="space-y-2">
            <Label htmlFor="equityPercentage">Pourcentage de parts visé (optionnel)</Label>
            <Input
              id="equityPercentage"
              placeholder="Ex: 2.5%"
              value={formData.equityPercentage}
              onChange={(value) => setFormData(prev => ({ ...prev, equityPercentage: value }))}
            />
          </div>

          {/* Horizon d'investissement */}
          <div className="space-y-2">
            <Label>Horizon d'investissement *</Label>
            <Select
              selectedKey={formData.horizon}
              onSelectionChange={(key) => setFormData(prev => ({ ...prev, horizon: key as string }))}
              placeholder="Sélectionnez un horizon"
            >
              {INVESTMENT_HORIZONS.map((horizon) => (
                <Select.Item key={horizon.value} id={horizon.value}>
                  {horizon.label}
                </Select.Item>
              ))}
            </Select>
          </div>

          {/* Objectifs de l'investissement */}
          <div className="space-y-2">
            <Label>Objectifs de l'investissement</Label>
            <div className="space-y-2">
              {INVESTMENT_OBJECTIVES.map((objective) => (
                <div key={objective.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={objective.value}
                    isSelected={formData.objectives.includes(objective.value)}
                    onChange={(checked) => handleObjectiveChange(objective.value, checked)}
                  />
                  <Label htmlFor={objective.value} className="text-sm font-normal">
                    {objective.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Message à l'équipe */}
          <div className="space-y-2">
            <Label htmlFor="message">Message à l'équipe *</Label>
            <TextArea
              id="message"
              placeholder="Expliquez votre démarche, posez une question, etc."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Document joint */}
          <div className="space-y-2">
            <Label htmlFor="document">Joindre un document (optionnel)</Label>
            <div className="flex items-center gap-2">
              <ShadcnInput
                id="document"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Upload className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">
              Termsheet, lettre d'intention, présentation...
            </p>
          </div>

          {/* Confidentialité */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confidential"
                isSelected={formData.isConfidential}
                onChange={(checked) => setFormData(prev => ({ ...prev, isConfidential: checked }))}
              />
              <Label htmlFor="confidential" className="text-sm font-normal">
                Cette proposition est visible uniquement par les fondateurs de la startup
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recommendations"
                isSelected={formData.allowRecommendations}
                onChange={(checked) => setFormData(prev => ({ ...prev, allowRecommendations: checked }))}
              />
              <Label htmlFor="recommendations" className="text-sm font-normal">
                J'autorise Onefive à me recommander d'autres startups similaires
              </Label>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button color="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            isDisabled={!isFormValid()}
            className={`${
              isFormValid() 
                ? 'bg-violet-600 hover:bg-violet-700' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Envoyer la proposition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 