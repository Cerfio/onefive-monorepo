import React from 'react';
import { InvestorSearch, InvestorEntity } from '@/components/startup/InvestorSearch';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { Toggle } from '@/components/base/toggle/toggle';
import { Building2, ArrowRight, ArrowLeft } from 'lucide-react';
import { FundingInvestor } from '@/queries/startup';
import { resolveAvatarUrl } from '@/utils/avatar';

interface InvestorsStepData {
  investors: FundingInvestor[];
  leadInvestor?: string;
}

interface InvestorsStepProps {
  onNext: (data: InvestorsStepData) => void;
  onBack: () => void;
  data?: Partial<InvestorsStepData>;
  onDataChange?: (data: Partial<InvestorsStepData>) => void;
}

export const InvestorsStep = ({ onNext, onBack, data, onDataChange }: InvestorsStepProps) => {
  const [investors, setInvestors] = React.useState<FundingInvestor[]>(data?.investors || []);
  const [leadInvestor, setLeadInvestor] = React.useState<string | undefined>(data?.leadInvestor);

  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({
        investors,
        leadInvestor,
      });
    }
  }, [investors, leadInvestor, onDataChange]);

  const handleInvestorAdd = (investor: InvestorEntity) => {
    const fundingInvestor: FundingInvestor = {
      type: investor.type,
      id: investor.id,
      name: investor.name,
      firstName: investor.firstName,
      lastName: investor.lastName,
      email: investor.email,
      avatar: investor.avatar,
      logo: investor.logo,
      website: investor.website,
      description: investor.description,
    };
    setInvestors([...investors, fundingInvestor]);
  };

  const handleInvestorRemove = (investorId: string) => {
    setInvestors(investors.filter(inv => inv.id !== investorId));
    if (leadInvestor === investorId) {
      setLeadInvestor(undefined);
    }
  };

  const selectedInvestorIds = investors.map(inv => inv.id);

  const handleNext = () => {
    onNext({
      investors,
      leadInvestor,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Recherchez et ajoutez les personnes ou fonds qui ont participé à cette levée. 
          Vous pouvez également ajouter manuellement des investisseurs non présents dans la base.
        </p>
        <InvestorSearch
          onInvestorSelect={handleInvestorAdd}
          selectedInvestorIds={selectedInvestorIds}
          placeholder="Rechercher un investisseur ou un fonds..."
        />
      </div>

      {investors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Investisseurs ajoutés ({investors.length})</p>
          <div className="space-y-2">
            {investors.map((investor) => (
              <div
                key={investor.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                {investor.type === 'person' ? (
                  <Avatar
                    size="md"
                    src={resolveAvatarUrl(investor.avatar)}
                    initials={investor.name[0]}
                    className="flex-shrink-0"
                  />
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
                    isSelected={leadInvestor === investor.id}
                    onChange={(isSelected) => {
                      if (isSelected) {
                        setLeadInvestor(investor.id);
                      } else {
                        setLeadInvestor(undefined);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    color="link-destructive"
                    className="ml-auto"
                    onClick={() => handleInvestorRemove(investor.id)}
                  >
                    Retirer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        <Button
          size="md"
          color="secondary"
          onClick={onBack}
          iconLeading={<ArrowLeft data-icon />}
        >
          Précédent
        </Button>
        <Button
          size="md"
          color="primary"
          onClick={handleNext}
          iconLeading={<ArrowRight data-icon />}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};

