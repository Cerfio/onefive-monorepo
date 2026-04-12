'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
                variant={activeTab === 'none' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveTab('none');
                  setCurrentSettings(prev => ({ ...prev, fundraisingType: 'none' }));
                }}
              >
                Aucun
              </Button>
              <Button
                variant={activeTab === 'rolling' ? 'default' : 'outline'}
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
                variant={activeTab === 'structured' ? 'default' : 'outline'}
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
                <Badge className="bg-green-100 text-green-800">
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
                    onChange={(e) => updateRollingInvestment('cap', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Discount (optionnel)</Label>
                  <Input
                    placeholder="20%"
                    value={currentSettings.rollingInvestment?.discount || ''}
                    onChange={(e) => updateRollingInvestment('discount', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Configuration Levée Structurée */}
          {activeTab === 'structured' && (
            <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800">
                  💸 Levée en cours
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Montant recherché</Label>
                  <Input
                    placeholder="200k€"
                    value={currentSettings.structuredRound?.targetAmount || ''}
                    onChange={(e) => updateStructuredRound('targetAmount', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Ticket minimum</Label>
                  <Input
                    placeholder="10k€"
                    value={currentSettings.structuredRound?.minTicket || ''}
                    onChange={(e) => updateStructuredRound('minTicket', e.target.value)}
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
                    onChange={(e) => updateStructuredRound('deadline', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Cap</Label>
                  <Input
                    placeholder="2M€"
                    value={currentSettings.structuredRound?.cap || ''}
                    onChange={(e) => updateStructuredRound('cap', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Discount</Label>
                  <Input
                    placeholder="20%"
                    value={currentSettings.structuredRound?.discount || ''}
                    onChange={(e) => updateStructuredRound('discount', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Lien vers le deck (optionnel)</Label>
                <Input
                  placeholder="https://example.com/deck.pdf"
                  value={currentSettings.structuredRound?.deckUrl || ''}
                  onChange={(e) => updateStructuredRound('deckUrl', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
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