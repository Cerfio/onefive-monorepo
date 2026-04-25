import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/base/badges/badges';
import { Sparkles, Target, Users, Rocket, TrendingUp, Heart } from 'lucide-react';

interface UserProfile {
  id: string;
  type: 'founder' | 'investor' | 'developer' | 'mentor' | 'other';
  interests: string[];
  location: string;
  stage?: string;
  lookingFor: string[];
}

interface WelcomeMessageProps {
  user: UserProfile;
  stats: {
    matchesCount: number;
    opportunitiesCount: number;
    newMembersCount: number;
  };
  onStartDiscovery: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  user,
  stats,
  onStartDiscovery
}) => {
  const getPersonalizedMessage = () => {
    switch (user.type) {
      case 'founder':
        return {
          title: `Bonjour, entrepreneur !`,
          subtitle: `Votre écosystème startup vous attend - ${stats.matchesCount} contacts pertinents détectés`,
          description: `Nous avons identifié des opportunités dans ${user.interests.join(', ')} qui correspondent parfaitement à votre profil de fondateur.`,
          cta: 'Découvrir mes opportunités',
          icon: <Rocket className="h-6 w-6 text-blue-600" />,
          gradient: 'from-blue-500 to-purple-600'
        };
      case 'investor':
        return {
          title: `Bonjour, investisseur !`,
          subtitle: `${stats.opportunitiesCount} startups prometteuses dans votre pipeline`,
          description: `Des startups en phase ${user.stage || 'early-stage'} dans vos secteurs de prédilection vous attendent.`,
          cta: 'Explorer le deal flow',
          icon: <TrendingUp className="h-6 w-6 text-green-600" />,
          gradient: 'from-green-500 to-emerald-600'
        };
      case 'developer':
        return {
          title: `Bonjour, développeur !`,
          subtitle: `${stats.matchesCount} opportunités techniques identifiées`,
          description: `Des startups recherchent activement vos compétences techniques - co-fondations et postes clés disponibles.`,
          cta: 'Voir les opportunités tech',
          icon: <Target className="h-6 w-6 text-purple-600" />,
          gradient: 'from-purple-500 to-pink-600'
        };
      case 'mentor':
        return {
          title: `Bonjour, mentor !`,
          subtitle: `${stats.newMembersCount} nouveaux entrepreneurs cherchent des conseils`,
          description: `Partagez votre expertise avec la nouvelle génération d'entrepreneurs dans ${user.interests.join(', ')}.`,
          cta: 'Commencer le mentorat',
          icon: <Heart className="h-6 w-6 text-red-600" />,
          gradient: 'from-red-500 to-pink-600'
        };
      default:
        return {
          title: `Bienvenue dans l'écosystème !`,
          subtitle: `${stats.matchesCount} connexions pertinentes vous attendent`,
          description: `Découvrez les opportunités qui correspondent à vos intérêts dans l'entrepreneuriat.`,
          cta: 'Explorer le réseau',
          icon: <Users className="h-6 w-6 text-blue-600" />,
          gradient: 'from-blue-500 to-indigo-600'
        };
    }
  };

  const message = getPersonalizedMessage();

  const getObjectifMessages = () => {
    return user.lookingFor.map(goal => {
      switch (goal) {
        case 'co-founder':
          return 'co-fondateur technique';
        case 'investment':
          return 'financement';
        case 'mentor':
          return 'mentorat';
        case 'partnership':
          return 'partenariats';
        case 'talent':
          return 'talents';
        default:
          return goal;
      }
    });
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-r ${message.gradient} opacity-10`} />
      <CardContent className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-r ${message.gradient} rounded-xl text-white`}>
              {message.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {message.title}
              </h1>
              <p className="text-lg text-gray-600">
                {message.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">IA activée</span>
          </div>
        </div>

        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          {message.description}
        </p>

        {user.lookingFor.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Vos objectifs prioritaires
            </h3>
            <div className="flex flex-wrap gap-2">
              {getObjectifMessages().map((objectif, index) => (
                <Badge
                  key={index}
                  type="pill-color"
                  color="gray"
                  size="md"
                >
                  <Target className="h-3 w-3 mr-1" />
                  {objectif}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-white/50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.matchesCount}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Matches pertinents</div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.opportunitiesCount}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Opportunités actives</div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{user.interests.length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Secteurs suivis</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={onStartDiscovery}
            size="lg"
            className={`bg-gradient-to-r ${message.gradient} hover:opacity-90 transition-opacity px-8`}
          >
            {message.cta}
          </Button>
          <Button variant="outline" size="lg">
            Personnaliser mon profil
          </Button>
        </div>

        {user.location && (
          <div className="mt-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              📍 Basé à {user.location}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WelcomeMessage; 