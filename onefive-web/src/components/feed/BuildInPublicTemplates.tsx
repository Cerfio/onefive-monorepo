'use client';

import { BuildInPublicData } from './BuildInPublicPost';
import { Rocket, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export interface BuildInPublicTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: 'launch' | 'update' | 'metrics' | 'failure';
  data: BuildInPublicData;
  suggestedMetrics?: string[];
  introText?: string;
}

export const BUILD_IN_PUBLIC_TEMPLATES: BuildInPublicTemplate[] = [
  {
    id: 'mvp-launch',
    name: '🚀 Lancement MVP',
    description: 'Annoncez le lancement de votre MVP',
    icon: Rocket,
    color: 'blue',
    category: 'launch',
    data: {
      type: 'launch',
      templateId: 'mvp-launch',
      launch: {
        product: '',
        description: ''
      }
    },
    introText: 'Après [X] mois de développement, nous sommes fiers de lancer notre MVP !',
    suggestedMetrics: ['Utilisateurs initiaux', 'Taux de conversion', 'Feedback score']
  },
  {
    id: 'monthly-update',
    name: '📈 Update mensuel',
    description: 'Résumé mensuel de progression',
    icon: Calendar,
    color: 'purple',
    category: 'update',
    data: {
      type: 'update',
      templateId: 'monthly-update'
    },
    introText: 'Voici notre update mensuel : [résumé des accomplissements]',
    suggestedMetrics: ['MRR', 'Utilisateurs actifs', 'Taux de rétention', 'Nouvelles features']
  },
  {
    id: 'mrr-update',
    name: '💸 Update MRR',
    description: 'Partagez votre croissance MRR',
    icon: TrendingUp,
    color: 'green',
    category: 'metrics',
    data: {
      type: 'metrics',
      templateId: 'mrr-update',
      metrics: [
        {
          label: 'MRR',
          value: 0,
          format: 'currency'
        },
        {
          label: 'Clients',
          value: 0,
          format: 'number'
        }
      ]
    },
    introText: 'Nouveau record de MRR ce mois-ci !',
    suggestedMetrics: ['MRR', 'ARR', 'Clients', 'Churn rate', 'LTV']
  },
  {
    id: 'failed-experiment',
    name: '🧪 Expérimentation ratée',
    description: 'Partagez vos échecs et apprentissages',
    icon: TrendingDown,
    color: 'orange',
    category: 'failure',
    data: {
      type: 'update',
      templateId: 'failed-experiment'
    },
    introText: 'Nous avons testé [feature/stratégie] pendant [durée]. Résultat : échec. Voici ce qu\'on a appris...',
    suggestedMetrics: ['Taux d\'engagement', 'Taux de conversion', 'Feedback utilisateurs']
  },
  {
    id: 'product-launch',
    name: '🎉 Lancement produit',
    description: 'Annoncez un nouveau produit ou feature majeure',
    icon: Rocket,
    color: 'blue',
    category: 'launch',
    data: {
      type: 'launch',
      templateId: 'product-launch',
      launch: {
        product: '',
        description: ''
      }
    },
    introText: 'Nous lançons [produit/feature] ! Voici ce que ça change pour nos utilisateurs...',
    suggestedMetrics: ['Adoption rate', 'Feedback score', 'Utilisateurs actifs']
  }
];

export function getTemplateById(id: string): BuildInPublicTemplate | undefined {
  return BUILD_IN_PUBLIC_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: BuildInPublicTemplate['category']): BuildInPublicTemplate[] {
  return BUILD_IN_PUBLIC_TEMPLATES.filter(t => t.category === category);
}

