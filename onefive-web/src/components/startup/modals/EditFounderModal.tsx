import React, { useState, useEffect } from 'react';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { Input } from '../../base/input/input';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";

interface EditFounderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  founderData: {
    id: string;
    name: string;
    role: string;
    capitalStock: string; // Format: "80%"
  };
  onSave: (data: {
    id: string;
    name: string;
    role: string;
    capitalStock: string;
  }) => void;
}

const AVAILABLE_ROLES = [
  'Chief Executive Officer',
  'Chief Product Officer',
  'Chief Technical Officer',
];

export const EditFounderModal: React.FC<EditFounderModalProps> = ({
  open,
  onOpenChange,
  founderData,
  onSave,
}) => {
  // Extraire le nombre du capital stock (enlever le %)
  const getCapitalStockNumber = (capitalStock: string) => {
    if (!capitalStock) return '0';
    return capitalStock.replace('%', '').trim() || '0';
  };

  const [form, setForm] = useState({
    name: founderData.name,
    role: founderData.role,
    capitalStock: getCapitalStockNumber(founderData.capitalStock),
  });

  // Mettre à jour le formulaire quand founderData change
  useEffect(() => {
    setForm({
      name: founderData.name,
      role: founderData.role,
      capitalStock: getCapitalStockNumber(founderData.capitalStock),
    });
  }, [founderData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: founderData.id,
      name: form.name,
      role: form.role,
      capitalStock: `${form.capitalStock}%`,
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
                  Modifier les informations du fondateur
                </AriaHeading>
                <p className="text-sm text-tertiary">Modifiez le rôle et la participation du fondateur.</p>
              </div>

              <div className="h-5 w-full" />

              <form onSubmit={handleSubmit} className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-4 sm:px-6">
                <div className="space-y-4">
                  <Input
                    label="Nom"
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                    placeholder="Nom du fondateur"
                    isRequired
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Rôle *</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    >
                      {AVAILABLE_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Input
                      label="Capital stock (%)"
                      type="number"
                      value={form.capitalStock}
                      onChange={(value) => setForm({ ...form, capitalStock: value })}
                      placeholder="0-100"
                      hint="Valeur entre 0 et 100"
                      isRequired
                    />
                  </div>
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

export default EditFounderModal;

