import React from 'react';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface NotesStepData {
  notes: string;
}

interface NotesStepProps {
  onNext: (data: NotesStepData) => void;
  onBack: () => void;
  data?: Partial<NotesStepData>;
  onDataChange?: (data: Partial<NotesStepData>) => void;
  isSubmitting?: boolean;
}

export const NotesStep = ({ onNext, onBack, data, onDataChange, isSubmitting }: NotesStepProps) => {
  const [notes, setNotes] = React.useState<string>(data?.notes || '');

  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({ notes });
    }
  }, [notes, onDataChange]);

  const handleSubmit = () => {
    onNext({ notes });
  };

  return (
    <div className="space-y-6">
      <Input
        label="Notes (optionnel)"
        value={notes}
        onChange={setNotes}
        placeholder="Ajoutez des informations complémentaires sur cette levée..."
        hint="Contexte, conditions particulières, objectifs de la levée, etc."
      />

      <div className="flex justify-between pt-4 border-t">
        <Button
          size="md"
          color="secondary"
          onClick={onBack}
          isDisabled={isSubmitting}
          iconLeading={<ArrowLeft data-icon />}
        >
          Précédent
        </Button>
        <Button
          size="md"
          color="primary"
          onClick={handleSubmit}
          isDisabled={isSubmitting}
          iconLeading={!isSubmitting ? <CheckCircle2 data-icon /> : undefined}
        >
          {isSubmitting ? (
            'Enregistrement...'
          ) : (
            data?.notes ? 'Créer le round' : 'Ajouter ce financement'
          )}
        </Button>
      </div>
    </div>
  );
};

