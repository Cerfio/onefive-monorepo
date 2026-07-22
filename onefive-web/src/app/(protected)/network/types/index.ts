export interface Person {
  id: string;
  name: string;
  avatar: string;
  title: string;
  location: string;
  countryCode: string;
  intention: string;
  intentionCategory: 'cofounder' | 'mentor' | 'opportunities';
  role?: 'founder' | 'vc' | 'angel' | 'mentor' | 'executive' | 'investor' | 'entrepreneur';
  tags: string[];
  mentorshipDomain?: string; // Domaine de mentorat spécifique
  experience: Array<{
    id: string;
    title: string;
    company: string;
    domain?: string;
    startDate: string;
    endDate?: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    domain?: string;
    startDate: string;
    endDate?: string;
  }>;
  createdAt: string;
  relationStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | null;
  isFollow?: boolean;
}

export interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  location: string;
  countryCode: string;
  intention: string;
  intentionCategory: 'cofounder' | 'hiring' | 'fundraising';
  stats: {
    stage: string;
    industry: string;
    funding: string;
  };
  createdAt: string;
  isFollow?: boolean;
}

export interface ActivityEvent {
  id: string;
  // Types réellement émis par le backend getNetworkActivity : NEW_CONNECTION,
  // NEW_POST, PROFILE_FOLLOW, STARTUP_FOLLOW. Les autres sont des legacy conservés
  // pour compat. Le backend fournit toujours un `details` lisible par event.
  type: 'NEW_CONNECTION' | 'NEW_POST' | 'PROFILE_FOLLOW' | 'STARTUP_FOLLOW' | 'FOLLOWED_STARTUP' | 'NEW_INTENTION' | 'PROFILE_UPDATE' | 'JOINED_PLATFORM' | 'NEW_SKILL' | 'JOB_CHANGE' | 'MENTORSHIP_OFFER' | 'STARTUP_UPDATE';
  person: Person;
  target?: Person | Startup;
  targetPerson?: Person;
  targetStartup?: Startup;
  timestamp: string;
  details?: string;
} 