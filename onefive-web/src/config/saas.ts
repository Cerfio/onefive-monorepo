export interface SaaS {
  id: string;
  name: string;
  logoUrl: string; // Path to the logo in /public
  domain: string;
}

export const saasList: SaaS[] = [
  {
    id: 'notion',
    name: 'Notion',
    logoUrl: '/images/society/Google__G__Logo.svg', // Placeholder
    domain: 'notion.so',
  },
  {
    id: 'figma',
    name: 'Figma',
    logoUrl: '/images/society/Google__G__Logo.svg', // Placeholder
    domain: 'figma.com',
  },
  {
    id: 'slack',
    name: 'Slack',
    logoUrl: '/images/society/Google__G__Logo.svg', // Placeholder
    domain: 'slack.com',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    logoUrl: '/images/society/LinkedIn_icon.svg',
    domain: 'linkedin.com',
  },
  {
    id: 'google',
    name: 'Google',
    logoUrl: '/images/society/Google__G__Logo.svg',
    domain: 'google.com',
  },
  {
    id: 'apple',
    name: 'Apple',
    logoUrl: '/images/society/Apple_logo_black.svg',
    domain: 'apple.com',
  },
];
