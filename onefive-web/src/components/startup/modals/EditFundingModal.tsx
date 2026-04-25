'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { Input } from '../../base/input/input';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/base/badges/badges';
import { FundingData, Investor, parseInvestors, serializeInvestors } from '@/queries/startup';
import { InvestorSearch, InvestorEntity } from '@/components/startup/InvestorSearch';
import { X, Building2 } from 'lucide-react';
import { resolveAvatarUrl } from '@/utils/avatar';

interface EditFundingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fundingData: FundingData;
  onSave: (data: Partial<FundingData>) => void;
}

export const EditFundingModal: React.FC<EditFundingModalProps> = ({
  open,
  onOpenChange,
  fundingData,
  onSave,
}) => {
  const [lastRound, setLastRound] = useState<string | null>(fundingData.lastRound || null);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const parsedInvestors = parseInvestors(fundingData.investors || []);
      setInvestors(parsedInvestors);
      setSelectedProfileIds(parsedInvestors.filter(i => i.type === 'profile').map(i => i.id));
      setLastRound(fundingData.lastRound || null);
    }
  }, [open, fundingData]);


  const handleInvestorSelect = (entity: InvestorEntity) => {
    const newInvestor: Investor = {
      type: entity.type === 'person' ? 'profile' : 'text',
      id: entity.id,
      name: entity.name,
      avatar: entity.avatar,
      logo: entity.logo,
      website: entity.website,
    };
    setInvestors([...investors, newInvestor]);
    if (entity.type === 'person') {
      setSelectedProfileIds([...selectedProfileIds, entity.id]);
    }
  };

  const removeInvestor = (investorId: string) => {
    setInvestors(investors.filter(i => i.id !== investorId));
    setSelectedProfileIds(selectedProfileIds.filter(id => id !== investorId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convertir les investisseurs enrichis en string[] pour le backend
    const serializedInvestors = serializeInvestors(investors);
    onSave({
      lastRound,
      investors: serializedInvestors,
      // On garde les valeurs existantes pour fundraisingType, structuredRound et rollingInvestment
      fundraisingType: fundingData.fundraisingType,
      structuredRound: fundingData.structuredRound,
      rollingInvestment: fundingData.rollingInvestment,
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
                  Modifier les investisseurs
                </AriaHeading>
                <p className="text-sm text-tertiary">Gérez la liste de vos investisseurs globaux.</p>
              </div>

              <div className="h-5 w-full" />

              <form onSubmit={handleSubmit} className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-4 sm:px-6">
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Dernière levée (optionnel)"
                      value={lastRound || ''}
                      onChange={(value) => setLastRound(value)}
                      placeholder="Ex: Seed, Series A"
                      hint="Indiquez le type de votre dernière levée de fonds"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Investisseurs</h3>
                  <div>
                    <p className="text-sm text-tertiary mb-3">
                      Ajoutez les personnes ou fonds qui ont investi dans votre startup
                    </p>
                    <InvestorSearch
                      onInvestorSelect={handleInvestorSelect}
                      selectedInvestorIds={selectedProfileIds}
                      placeholder="Rechercher un investisseur ou un fonds..."
                    />
                    
                    {investors.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-primary">Investisseurs ajoutés ({investors.length})</p>
                        <div className="space-y-2">
                          {investors.map((investor) => (
                            <div key={investor.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                              {investor.type === 'profile' ? (
                                <>
                                  <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={resolveAvatarUrl(investor.avatar)} />
                                    <AvatarFallback>{investor.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{investor.name}</p>
                                    <p className="text-xs text-gray-500">Profil OneFive</p>
                                  </div>
                                  <Badge type="pill-color" color="gray" size="sm">
                                    OneFive
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <div className="h-10 w-10 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                    {investor.logo ? (
                                      <img src={investor.logo} alt={investor.name} className="w-6 h-6 object-contain" />
                                    ) : (
                                      <Building2 className="text-gray-400" size={20} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{investor.name}</p>
                                    {investor.website ? (
                                      <a 
                                        href={investor.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        {investor.website.replace(/^https?:\/\/(www\.)?/, '')}
                                      </a>
                                    ) : (
                                      <p className="text-xs text-gray-500">Entreprise / Fonds</p>
                                    )}
                                  </div>
                                  <Badge type="badge-modern" color="gray" size="sm">
                                    Entreprise
                                  </Badge>
                                </>
                              )}
                              <button 
                                type="button"
                                onClick={() => removeInvestor(investor.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

