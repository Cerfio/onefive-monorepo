'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/base/dialog/dialog';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/label/label';
import { Badge } from '@/components/base/badges/badges';
import { toast } from 'sonner';

interface InvestmentSettings {
  fundraisingType: 'structured' | 'rolling' | 'none';
  structuredRound?: {
    targetAmount: string;
    minTicket: string;
    instrument: 'SAFE' | 'BSA AIR' | 'Equity';
    cap?: string;
    discount?: string;
    deadline: string;
    deckUrl?: string;
  };
  rollingInvestment?: {
    instrument: 'SAFE' | 'BSA AIR';
    cap?: string;
    discount?: string;
  };
}

interface InvestmentSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: InvestmentSettings;
  onSave: (settings: InvestmentSettings) => void;
}

export const InvestmentSettingsModal = ({
  open,
  onOpenChange,
  settings,
  onSave,
}: InvestmentSettingsModalProps) => {
  const [currentSettings, setCurrentSettings] = useState<InvestmentSettings>(settings);
  const [activeTab, setActiveTab] = useState<'structured' | 'rolling' | 'none'>(
    settings.fundraisingType
  );

  const handleSave = () => {
    onSave(currentSettings);
    toast.success('Paramètres d\'investissement mis à jour !');
    onOpenChange(false);
  };

  const updateStructuredRound = (field: string, value: string) => {
    setCurrentSettings(prev => ({
      ...prev,
      structuredRound: {
        ...prev.structuredRound!,
        [field]: value
      }
    }));
  };

  const updateRollingInvestment = (field: string, value: string) => {
    setCurrentSettings(prev => ({
      ...prev,
      rollingInvestment: {
        ...prev.rollingInvestment!,
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paramètres d'investissement</DialogTitle>
          <DialogDescription>
            Configurez comment les investisseurs peuvent vous contacter pour des opportunités d'investissement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type d'investissement */}
          <div>
            <Label className="text-base font-medium">Type d'investissement</Label>
            <div className="flex gap-2 mt-2">
              <Button
                color={activeTab === 'none' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setActiveTab('none');
                  setCurrentSettings(prev => ({ ...prev, fundraisingType: 'none' }));
                }}
              >
                Aucun
              </Button>
              <Button
                color={activeTab === 'rolling' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setActiveTab('rolling');
                  setCurrentSettings(prev => ({
                    ...prev,
                    fundraisingType: 'rolling',
                    rollingInvestment: prev.rollingInvestment || { instrument: 'SAFE' }
                  }));
                }}
              >
                🟢 Rolling SAFE
              </Button>
              <Button
                color={activeTab === 'structured' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setActiveTab('structured');
                  setCurrentSettings(prev => ({ 
                    ...prev, 
                    fundraisingType: 'structured',
                    structuredRound: prev.structuredRound || {
                      targetAmount: '',
                      minTicket: '',
                      instrument: 'SAFE',
                      deadline: ''
                    }
                  }));
                }}
              >
                💸 Levée structurée
              </Button>
            </div>
          </div>

          {/* Configuration Rolling SAFE */}
          {activeTab === 'rolling' && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge type="pill-color" color="success" size="sm">
                  🟢 Accepte les investissements spontanés
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Instrument</Label>
                  <select
                    className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2"
                    value={currentSettings.rollingInvestment?.instrument || 'SAFE'}
                    onChange={(e) => updateRollingInvestment('instrument', e.target.value)}
                  >
                    <option value="SAFE">SAFE</option>
                    <option value="BSA AIR">BSA AIR</option>
                  </select>
                </div>
                
                <div>
                  <Label>Cap (optionnel)</Label>
                  <Input
                    placeholder="2M€"
                    value={currentSettings.rollingInvestment?.cap || ''}
                    onChange={(value) => updateRollingInvestment('cap', value)}
                  />
                </div>
                
                <div>
                  <Label>Discount (optionnel)</Label>
                  <Input
                    placeholder="20%"
                    value={currentSettings.rollingInvestment?.discount || ''}
                    onChange={(value) => updateRollingInvestment('discount', value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Configuration Levée Structurée */}
          {activeTab === 'structured' && (
            <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge type="pill-color" color="warning" size="sm">
                  💸 Levée en cours
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Montant recherché</Label>
                  <Input
                    placeholder="200k€"
                    value={currentSettings.structuredRound?.targetAmount || ''}
                    onChange={(value) => updateStructuredRound('targetAmount', value)}
                  />
                </div>
                
                <div>
                  <Label>Ticket minimum</Label>
                  <Input
                    placeholder="10k€"
                    value={currentSettings.structuredRound?.minTicket || ''}
                    onChange={(value) => updateStructuredRound('minTicket', value)}
                  />
                </div>
                
                <div>
                  <Label>Instrument</Label>
                  <select
                    className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2"
                    value={currentSettings.structuredRound?.instrument || 'SAFE'}
                    onChange={(e) => updateStructuredRound('instrument', e.target.value)}
                  >
                    <option value="SAFE">SAFE</option>
                    <option value="BSA AIR">BSA AIR</option>
                    <option value="Equity">Equity</option>
                  </select>
                </div>
                
                <div>
                  <Label>Deadline</Label>
                  <Input
                    placeholder="31 décembre 2024"
                    value={currentSettings.structuredRound?.deadline || ''}
                    onChange={(value) => updateStructuredRound('deadline', value)}
                  />
                </div>
                
                <div>
                  <Label>Cap</Label>
                  <Input
                    placeholder="2M€"
                    value={currentSettings.structuredRound?.cap || ''}
                    onChange={(value) => updateStructuredRound('cap', value)}
                  />
                </div>
                
                <div>
                  <Label>Discount</Label>
                  <Input
                    placeholder="20%"
                    value={currentSettings.structuredRound?.discount || ''}
                    onChange={(value) => updateStructuredRound('discount', value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Lien vers le deck (optionnel)</Label>
                <Input
                  placeholder="https://example.com/deck.pdf"
                  value={currentSettings.structuredRound?.deckUrl || ''}
                  onChange={(value) => updateStructuredRound('deckUrl', value)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              color="secondary" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 