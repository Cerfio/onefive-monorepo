import type { Person, Startup, ActivityEvent } from '../types';

// Données de fallback en cas d'erreur API ou de données vides
export const fallbackPeople: Person[] = [
  {
    id: 'fallback-1',
    name: 'Utilisateur OneFive',
    avatar: '/default-avatar.png',
    title: 'Entrepreneur',
    location: 'Paris, France',
    countryCode: 'FR',
    intention: 'Cherche des opportunités',
    intentionCategory: 'opportunities',
    role: 'entrepreneur',
    tags: ['Entrepreneur'],
    experience: [],
    education: [],
    createdAt: new Date().toISOString(),
  },
];

export const fallbackStartups: Startup[] = [
  {
    id: 'fallback-startup-1',
    name: 'Startup OneFive',
    logo: '/default-startup-logo.png',
    tagline: 'Innovation en cours',
    location: 'Paris, France',
    countryCode: 'FR',
    intention: 'Recrute activement',
    intentionCategory: 'hiring',
    stats: {
      stage: 'Seed',
      industry: 'Tech',
      funding: '500k€',
    },
    createdAt: new Date().toISOString(),
  },
];

export const fallbackActivity: ActivityEvent[] = [
  {
    id: 'fallback-activity-1',
    type: 'JOINED_PLATFORM',
    person: fallbackPeople[0],
    timestamp: new Date().toISOString(),
    details: 'a rejoint OneFive',
  },
];