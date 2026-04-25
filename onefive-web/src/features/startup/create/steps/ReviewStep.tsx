import React from 'react';
import { Button } from '@/components/base/buttons/button';
import { Card, CardContent } from '@/components/base/card/card';
import { Badge } from '@/components/base/badges/badges';
import { Avatar } from '@/components/base/avatar/avatar';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Globe, 
  Linkedin, 
  Users, 
  Edit3,
  CheckCircle2
} from 'lucide-react';

interface ReviewStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  data: any;
  isSubmitting?: boolean;
}

export const ReviewStep = ({ onNext, onBack, onEdit, data, isSubmitting }: ReviewStepProps) => {
  const handleSubmit = () => {
    onNext(data);
  };

  const getMemberDisplayName = (member: any) => {
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    }
    return member.status === 'invited' ? 'Membre invite' : 'Membre OneFive';
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Identité */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#5E6AD2]" />
              <h4 className="font-semibold text-gray-900">Identité</h4>
            </div>
            <Button
              size="sm"
              color="tertiary"
              onClick={() => onEdit(1)}
              className="text-[#5E6AD2] hover:text-[#5E6AD2]/80"
              iconLeading={<Edit3 data-icon />}
            >
              Modifier
            </Button>
          </div>

          <div className="space-y-4">
            {/* Logo et nom */}
            <div className="flex items-center gap-4">
              {data.logo ? (
                <img 
                  src={data.logo} 
                  alt={data.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold">
                  {data.name?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <h5 className="text-lg font-bold text-gray-900">{data.name}</h5>
                {data.tagline && (
                  <p className="text-sm text-gray-600">{data.tagline}</p>
                )}
              </div>
            </div>

            {/* Description */}
            {data.description && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 line-clamp-3">{data.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Détails */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#5E6AD2]" />
              <h4 className="font-semibold text-gray-900">Détails</h4>
            </div>
            <Button
              size="sm"
              color="tertiary"
              onClick={() => onEdit(2)}
              className="text-[#5E6AD2] hover:text-[#5E6AD2]/80"
              iconLeading={<Edit3 data-icon />}
            >
              Modifier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Localisation */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500">Localisation</div>
                <div className="text-sm font-medium">{data.city}, {data.countryCode}</div>
              </div>
            </div>

            {/* Date de fondation */}
            {data.foundedDate && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Fondée en</div>
                  <div className="text-sm font-medium">
                    {new Date(data.foundedDate).getFullYear()}
                  </div>
                </div>
              </div>
            )}

            {/* Website */}
            {data.website && (
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Site web</div>
                  <a 
                    href={data.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#5E6AD2] hover:underline"
                  >
                    Visiter
                  </a>
                </div>
              </div>
            )}

            {/* LinkedIn */}
            {data.linkedin && (
              <div className="flex items-start gap-2">
                <Linkedin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">LinkedIn</div>
                  <a 
                    href={data.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#5E6AD2] hover:underline"
                  >
                    Voir le profil
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Secteurs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#5E6AD2]" />
              <h4 className="font-semibold text-gray-900">Secteurs</h4>
            </div>
            <Button
              size="sm"
              color="tertiary"
              onClick={() => onEdit(3)}
              className="text-[#5E6AD2] hover:text-[#5E6AD2]/80"
              iconLeading={<Edit3 data-icon />}
            >
              Modifier
            </Button>
          </div>

          <div className="space-y-4">
            {/* Catégories */}
            {data.categories && data.categories.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Secteurs d'activité</div>
                <div className="flex flex-wrap gap-2">
                  {data.categories.map((category: string, index: number) => (
                    <Badge key={index} type="pill-color" color="gray" size="sm">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Image de couverture */}
            {data.coverImage && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Image de couverture</div>
                <img 
                  src={data.coverImage} 
                  alt="Couverture"
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Équipe */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#5E6AD2]" />
              <h4 className="font-semibold text-gray-900">Équipe</h4>
            </div>
            <Button
              size="sm"
              color="tertiary"
              onClick={() => onEdit(4)}
              className="text-[#5E6AD2] hover:text-[#5E6AD2]/80"
              iconLeading={<Edit3 data-icon />}
            >
              Modifier
            </Button>
          </div>

          <div className="space-y-3">
            {data.members && data.members.length > 0 ? (
              data.members.map((member: any, index: number) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="md"
                      src={member.avatar}
                      alt={getMemberDisplayName(member)}
                      initials={member.firstName && member.lastName
                        ? `${member.firstName[0]}${member.lastName[0]}`
                        : 'M'}
                    />
                    <div>
                        <div className="font-medium text-sm">{getMemberDisplayName(member)}</div>
                      <div className="text-xs text-gray-600">{member.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-[#5E6AD2]">
                      {member.equity}%
                    </div>
                    {member.status === 'invited' && (
                      <Badge type="pill-color" color="gray" size="sm" className="mt-1">
                        Invité
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun membre ajouté
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message d'information */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Prêt à créer votre startup ?</p>
            <p className="text-xs text-blue-700">
              Une fois créée, vous pourrez ajouter plus d'informations, inviter des membres supplémentaires, 
              et gérer votre page depuis le tableau de bord.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 gap-3">
        <Button
          type="button"
          color="secondary"
          onClick={onBack}
          isDisabled={isSubmitting}
        >
          Retour
        </Button>
        <Button
          type="button"
          color="primary"
          onClick={handleSubmit}
          isDisabled={isSubmitting}
          className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
          iconLeading={isSubmitting ? undefined : <CheckCircle2 data-icon />}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Création...
            </>
          ) : (
            'Créer ma startup'
          )}
        </Button>
      </div>
    </div>
  );
};
