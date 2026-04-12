import React from 'react';
import { Label as BaseLabel } from '@/components/base/input/label';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import type { DateValue } from 'react-aria-components';
import { Button } from '@/components/base/buttons/button';
import { ArrowRight } from 'lucide-react';

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

const INSTRUMENT_OPTIONS = [
  { id: '', label: 'Non spécifié' },
  { id: 'SAFE', label: 'SAFE' },
  { id: 'BSA_AIR', label: 'BSA AIR' },
  { id: 'EQUITY', label: 'Actions (Equity)' },
  { id: 'CONVERTIBLE_NOTE', label: 'Obligations Convertibles' },
  { id: 'OTHER', label: 'Autre' },
];

interface InfoStepData {
  dateValue: DateValue | null;
  roundValue: string;
  amountRaised: string;
  valuation: string;
  instrumentValue: string;
  customInstrument: string;
}

interface InfoStepProps {
  onNext: (data: InfoStepData) => void;
  data?: Partial<InfoStepData>;
  onDataChange?: (data: Partial<InfoStepData>) => void;
}

export const InfoStep = ({ onNext, data, onDataChange }: InfoStepProps) => {
  const [dateValue, setDateValue] = React.useState<DateValue | null>(data?.dateValue || null);
  const [roundValue, setRoundValue] = React.useState<string>(data?.roundValue || 'SEED');
  const [amountRaised, setAmountRaised] = React.useState<string>(data?.amountRaised || '');
  const [valuation, setValuation] = React.useState<string>(data?.valuation || '');
  const [instrumentValue, setInstrumentValue] = React.useState<string>(data?.instrumentValue || '');
  const [customInstrument, setCustomInstrument] = React.useState<string>(data?.customInstrument || '');

  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({
        dateValue,
        roundValue,
        amountRaised,
        valuation,
        instrumentValue,
        customInstrument,
      });
    }
  }, [dateValue, roundValue, amountRaised, valuation, instrumentValue, customInstrument, onDataChange]);

  const handleNext = () => {
    if (!dateValue || !amountRaised) {
      return;
    }
    onNext({
      dateValue,
      roundValue,
      amountRaised,
      valuation,
      instrumentValue,
      customInstrument,
    });
  };

  const isValid = dateValue && amountRaised && parseFloat(amountRaised) > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <BaseLabel isRequired>Date de la levée</BaseLabel>
          <div className="w-full">
            <DatePicker
              aria-label="Date de la levée"
              value={dateValue}
              onChange={setDateValue}
              isRequired
            />
          </div>
        </div>

        <div className="w-full">
          <Select
            label="Tour de financement *"
            placeholder="Sélectionner un tour"
            selectedKey={roundValue}
            onSelectionChange={(key) => setRoundValue(key as string)}
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
          value={amountRaised}
          onChange={setAmountRaised}
          isRequired
          placeholder="Ex: 500000"
        />
        <Input
          label="Valorisation post-money (€)"
          type="number"
          value={valuation}
          onChange={setValuation}
          placeholder="Ex: 2000000"
        />
      </div>

      <Select
        label="Instrument utilisé"
        placeholder="Sélectionner un instrument"
        selectedKey={instrumentValue}
        onSelectionChange={(key) => setInstrumentValue(key as string)}
        items={INSTRUMENT_OPTIONS}
      >
        {(item) => (
          <Select.Item id={item.id}>
            {item.label}
          </Select.Item>
        )}
      </Select>

      {instrumentValue === 'OTHER' && (
        <Input
          label="Spécifiez l'instrument"
          value={customInstrument}
          onChange={setCustomInstrument}
          placeholder="Ex: Prêt bancaire, Crédit Impôt Recherche..."
        />
      )}

      <div className="flex justify-end pt-4">
        <Button
          size="md"
          color="primary"
          onClick={handleNext}
          isDisabled={!isValid}
          iconLeading={<ArrowRight data-icon />}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};

