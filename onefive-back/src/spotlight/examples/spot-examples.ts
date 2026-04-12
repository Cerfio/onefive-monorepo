// Exemples de données pour tester les endpoints admin

export const eventSpotExample = {
  spot: 'EVENT',
  name: 'Tech Conference 2024',
  highlight: 'The biggest tech conference of the year',
  address: '123 Tech Street, San Francisco, CA',
  image: 'https://example.com/tech-conference.jpg',
  location: {
    lat: 37.7749,
    lng: -122.4194,
  },
  provider: 'ONEFIVE',
  event: {
    beginDate: '2024-06-15T09:00:00Z',
    endDate: '2024-06-17T18:00:00Z',
    prices: [
      {
        name: 'Early Bird',
        price: 299,
        currency: 'USD',
        fee: 0,
      },
      {
        name: 'Regular',
        price: 399,
        currency: 'USD',
        fee: 0,
      },
    ],
    expertiseDomains: ['TECH', 'BUSINESS'],
    days: ['FRIDAY', 'SATURDAY', 'SUNDAY'],
    uniqueId: 'tech-conf-2024-sf',
  },
  url: 'https://onefive.com/events/tech-conference-2024',
  description:
    'Join us for the most comprehensive tech conference covering AI, blockchain, and future technologies.',
};

export const acceleratorSpotExample = {
  spot: 'ACCELERATOR',
  name: 'Startup Accelerator Program',
  highlight: '6-month intensive startup acceleration',
  address: '456 Innovation Ave, Palo Alto, CA',
  image: 'https://example.com/accelerator.jpg',
  location: {
    lat: 37.4419,
    lng: -122.143,
  },
  provider: 'ONEFIVE',
  accelerator: {
    expertiseDomains: ['TECH', 'MARKETING'],
    hiringPeriod: 'QUARTERLY',
    date: '2024-03-01T00:00:00Z',
    prices: [
      {
        periodicity: 'MONTHLY',
        plan: {
          name: 'Basic Plan',
          price: 2000,
          currency: 'USD',
          fee: 5,
        },
      },
      {
        periodicity: 'QUARTERLY',
        plan: {
          name: 'Premium Plan',
          price: 5000,
          currency: 'USD',
          fee: 3,
        },
      },
    ],
  },
  url: 'https://onefive.com/accelerator/startup-program',
  description:
    'Comprehensive 6-month program to accelerate your startup growth.',
};

export const coworkingSpaceSpotExample = {
  spot: 'COWORKINGSPACE',
  name: 'Innovation Hub',
  highlight: 'Modern coworking space in downtown',
  address: '789 Business Blvd, Austin, TX',
  image: 'https://example.com/coworking.jpg',
  location: {
    lat: 30.2672,
    lng: -97.7431,
  },
  provider: 'ONEFIVE',
  coworkingSpace: {
    openingHours: {
      begin: '08:00',
      end: '20:00',
    },
    prices: [
      {
        periodicity: 'DAILY',
        plan: {
          name: 'Day Pass',
          price: 25,
          currency: 'USD',
          fee: 0,
        },
      },
      {
        periodicity: 'MONTHLY',
        plan: {
          name: 'Monthly Membership',
          price: 300,
          currency: 'USD',
          fee: 0,
        },
      },
    ],
  },
  url: 'https://onefive.com/coworking/innovation-hub',
  description: 'Flexible coworking space with all amenities included.',
};

// Instructions d'utilisation:
/*
1. POST /admin/spotlight avec eventSpotExample pour créer un événement
2. POST /admin/spotlight avec acceleratorSpotExample pour créer un accélérateur  
3. POST /admin/spotlight avec coworkingSpaceSpotExample pour créer un espace de coworking
4. GET /spotlight?lat=37.7749&lng=-122.4194 pour lister les spots près de San Francisco
5. PUT /admin/spotlight/{id} pour modifier un spot existant
6. DELETE /admin/spotlight/{id} pour supprimer un spot
*/
