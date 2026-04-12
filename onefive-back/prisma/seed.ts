import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import {
  PrismaClient,
  AuthType,
  GenderSalutationPreferenceType,
  ReactionType,
  DiscussionType,
  ProviderType,
  SpotType,
  ExpertiseDomain,
  Periodicity,
  Day,
  GroupType,
  AccessAction,
  KPIRecurrence,
  RoadmapStatus,
  FundraisingRound,
  InvitationStatus,
  RelationshipStatus,
  ProfileRole,
  ReferralStatus,
  EventFormat,
  FundingModel,
  PrizeType,
  StartupStage,
  StartupFundingRound,
} from '@prisma/client';
import { fakerFR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Faker bulk config (constants, no envs required)
const DO_FAKE = true; // set to false to disable bulk faker data
const NUM_FAKE_USERS = 25;
const POSTS_PER_USER = 3;
const COMMENTS_PER_POST = 2;
const DISCUSSIONS_COUNT = 15;

// Country ISO codes for randomization
const COUNTRY_ISO_CODES = [
  'fr',
  'gb',
  'us',
  'de',
  'es',
  'it',
  'nl',
  'be',
  'ch',
  'at',
  'se',
  'no',
  'dk',
  'fi',
  'pt',
  'pl',
  'cz',
  'hu',
  'ro',
  'sk',
  'si',
  'hr',
  'ba',
  'rs',
  'me',
  'al',
  'mk',
  'bg',
  'gr',
  'tr',
  'ru',
  'ua',
  'by',
  'md',
  'ge',
  'am',
  'az',
  'cy',
  'mt',
  'lu',
];

// Helper function to get random country ISO code
function getRandomCountryIso(): string {
  return COUNTRY_ISO_CODES[
    Math.floor(Math.random() * COUNTRY_ISO_CODES.length)
  ];
}
const SPOTS_COUNT = 8;
const SAAS_DOMAINS = ['onefive.app', 'notion.so', 'linear.app', 'stripe.com'];

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function ensureUser({
  email,
  password,
  isEmailVerified = true,
}: {
  email: string;
  password: string;
  isEmailVerified?: boolean;
}) {
  const authKey = process.env.KEY_AUTHENTICATION;
  if (!authKey)
    throw new Error(
      'KEY_AUTHENTICATION is not set. Set it in your environment before seeding.',
    );
  const hashedPassword = await bcrypt.hash(password.concat(authKey), 15);

  return prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      authType: AuthType.EMAIL,
      isEmailVerified,
    },
    create: {
      email,
      password: hashedPassword,
      authType: AuthType.EMAIL,
      isEmailVerified,
    },
    select: { id: true, email: true },
  });
}

async function ensureProfileForUser(
  userId: string,
  seed: {
    firstName: string;
    lastName: string;
    gender?: string;
    countryCode?: string;
    city?: string;
    roles?: string[]; // Rôles admin de la plateforme
    ecosystemRoles?: ProfileRole[]; // Rôles dans l'écosystème
    languages?: string[];
    skills?: string[];
    bio?: string;
  },
) {
  const now = new Date();

  return prisma.profile.upsert({
    where: { userId },
    update: {
      firstName: seed.firstName,
      lastName: seed.lastName,
      gender: seed.gender ?? 'OTHER',
      genderSalutationPreferenceType: GenderSalutationPreferenceType.OTHER,
      countryCode: getRandomCountryIso(), // Always randomize countryCode on update
      city: seed.city ?? 'Paris',
      bio: seed.bio ?? 'Seeded profile bio for demo/testing.',
      highlight: 'Building OneFive together',
      skills: seed.skills ?? ['typescript', 'nestjs', 'prisma'],
      roles: seed.roles ?? [],
      ecosystemRoles: seed.ecosystemRoles ?? [ProfileRole.FOUNDER],
    },
    create: {
      user: { connect: { id: userId } },
      firstName: seed.firstName,
      lastName: seed.lastName,
      gender: seed.gender ?? 'OTHER',
      genderSalutationPreferenceType: GenderSalutationPreferenceType.OTHER,
      dateOfBirth: new Date(now.getFullYear() - 30, 0, 1),
      countryCode: getRandomCountryIso(), // Always randomize countryCode
      city: seed.city ?? 'Paris',
      bio: seed.bio ?? 'Seeded profile bio for demo/testing.',
      highlight: 'Building OneFive together',
      skills: seed.skills ?? ['typescript', 'nestjs', 'prisma'],
      roles: seed.roles ?? [],
      ecosystemRoles: seed.ecosystemRoles ?? [ProfileRole.FOUNDER],
    },
  });
}

async function seedSessions(userId: string) {
  const token = `seed-token-${userId.slice(0, 8)}`;
  const existing = await prisma.session
    .findUnique({ where: { token } })
    .catch(() => null);
  if (existing) return existing;
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  return prisma.session.create({
    data: {
      user: { connect: { id: userId } },
      token,
      fingerprint: 'seed-fp',
      isRevoked: false,
      lastUsage: new Date(),
      expiresAt: expires,
    },
  });
}

async function seedPosts(authorProfiles: {
  primary: string;
  secondary: string;
}) {
  const count = await prisma.post.count();
  if (count > 0) return; // avoid duplicates

  const post1 = await prisma.post.create({
    data: {
      author: { connect: { id: authorProfiles.primary } },
      content: 'Hello OneFive community! This is our first seeded post. 🚀',
      medias: [],
      tags: ['FUNDAMENTALS', 'MARKET'],
    },
  });

  await prisma.postReaction.create({
    data: {
      post: { connect: { id: post1.id } },
      profile: { connect: { id: authorProfiles.secondary } },
      reaction: ReactionType.HEART,
    },
  });
  await prisma.postView.create({
    data: {
      post: { connect: { id: post1.id } },
      viewer: { connect: { id: authorProfiles.secondary } },
    },
  });

  const comment1 = await prisma.postComment.create({
    data: {
      post: { connect: { id: post1.id } },
      author: { connect: { id: authorProfiles.secondary } },
      content: 'Félicitations pour le lancement !',
    },
  });
  // Reaction on comment
  await prisma.postCommentReaction.create({
    data: {
      comment: { connect: { id: comment1.id } },
      profile: { connect: { id: authorProfiles.primary } },
      reaction: ReactionType.THUMBS_UP,
    },
  });
  await prisma.postComment.create({
    data: {
      post: { connect: { id: post1.id } },
      author: { connect: { id: authorProfiles.primary } },
      content: 'Merci beaucoup 🙌',
      parent: { connect: { id: comment1.id } },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      author: { connect: { id: authorProfiles.secondary } },
      content: 'Deuxième post avec un repost en exemple.',
      medias: [],
      tags: ['PRODUCT'],
    },
  });

  await prisma.post.create({
    data: {
      author: { connect: { id: authorProfiles.primary } },
      content: 'Repost du post 2',
      medias: [],
      tags: ['PRODUCT', 'MARKETING'],
      repostedPost: { connect: { id: post2.id } },
    },
  });
}

async function seedDiscussions(authorProfiles: {
  primary: string;
  secondary: string;
}) {
  const count = await prisma.discussion.count();
  if (count > 0) return;

  const discussion = await prisma.discussion.create({
    data: {
      author: { connect: { id: authorProfiles.primary } },
      question: 'Comment structurer une app NestJS à grande échelle ?',
      questionUnaccented:
        'Comment structurer une app NestJS a grande echelle ?',
      content: 'Partagez vos patterns, conventions et retours.',
      options: [],
      tags: ['nestjs', 'architecture'],
      type: DiscussionType.DISCUSSION,
      context: 'nestjs.com',
    },
  });

  await prisma.discussionReaction.create({
    data: {
      discussion: { connect: { id: discussion.id } },
      profile: { connect: { id: authorProfiles.secondary } },
      reaction: ReactionType.THUMBS_UP,
    },
  });

  await prisma.discussionView.create({
    data: {
      discussion: { connect: { id: discussion.id } },
      viewer: { connect: { id: authorProfiles.secondary } },
    },
  });

  const answer = await prisma.discussionAnswer.create({
    data: {
      discussion: { connect: { id: discussion.id } },
      author: { connect: { id: authorProfiles.secondary } },
      content: 'Utiliser Controller → Handler → Service et Prisma. ✔️',
    },
  });

  await prisma.discussionAnswerUpvote.create({
    data: {
      answer: { connect: { id: answer.id } },
      profile: { connect: { id: authorProfiles.primary } },
    },
  });

  await prisma.discussionAnswerReaction.create({
    data: {
      answer: { connect: { id: answer.id } },
      profile: { connect: { id: authorProfiles.primary } },
      reaction: ReactionType.HEART,
    },
  });

  const reply = await prisma.discussionAnswerReply.create({
    data: {
      answer: { connect: { id: answer.id } },
      author: { connect: { id: authorProfiles.primary } },
      content: 'Exactement. Et bien séparer DTOs, exceptions, etc.',
    },
  });

  await prisma.discussionAnswerReplyReaction.create({
    data: {
      reply: { connect: { id: reply.id } },
      profile: { connect: { id: authorProfiles.secondary } },
      reaction: ReactionType.THUMBS_UP,
    },
  });

  // Poll example
  await prisma.discussion.create({
    data: {
      author: { connect: { id: authorProfiles.secondary } },
      question: 'Quel est votre ORM préféré en Node.js ?',
      questionUnaccented: 'Quel est votre ORM prefere en Node.js ?',
      content: null,
      options: ['Prisma', 'TypeORM', 'Sequelize', 'Autre'],
      tags: ['poll', 'orm'],
      type: DiscussionType.POLL,
      context: null,
    },
  });
}

async function seedSpots() {
  const count = await prisma.spot.count();
  if (count > 0) return;

  // Price plans
  const [basic, pro, vip] = await Promise.all([
    prisma.spotPricePlan.create({
      data: { name: 'Basic', price: 0, currency: 'EUR', fee: 0 },
    }),
    prisma.spotPricePlan.create({
      data: { name: 'Pro', price: 49, currency: 'EUR', fee: 0 },
    }),
    prisma.spotPricePlan.create({
      data: { name: 'VIP', price: 199, currency: 'EUR', fee: 0 },
    }),
  ]);

  // Event
  const event = await prisma.spot.create({
    data: {
      url: 'https://example.com/event/seed',
      spot: SpotType.EVENT,
      name: 'OneFive Tech Meetup',
      highlight: 'Rencontrez la communauté',
      address: 'Paris, France',
      provider: ProviderType.ONEFIVE,
      image: null,
      description: 'Meetup mensuel pour fondateurs et devs',
      location: { type: 'Point', coordinates: [2.3522, 48.8566] },
      event: {
        create: {
          beginDate: new Date(),
          endDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
          uniqueId: 'seed-event-1',
          expertiseDomains: [ExpertiseDomain.TECH, ExpertiseDomain.AI],
          days: [Day.WEDNESDAY],
          format: EventFormat.INPERSON,
          attendees: 120,
          prices: { create: [{ planId: basic.id }, { planId: pro.id }] },
        },
      },
    },
  });

  // Incubator
  await prisma.spot.create({
    data: {
      url: 'https://example.com/incubator/seed',
      spot: SpotType.INCUBATOR,
      name: 'Seed Incubator',
      highlight: 'Accompagnement early-stage',
      address: 'Paris 13e',
      description: 'Incubateur pour startups fintech et business.',
      provider: ProviderType.ONEFIVE,
      location: { type: 'Point', coordinates: [2.3333, 48.8666] },
      incubator: {
        create: {
          expertiseDomains: [ExpertiseDomain.BUSINESS, ExpertiseDomain.FINTECH],
          hiringPeriod: Periodicity.QUARTERLY,
          dates: ['2025-Q1', '2025-Q2'],
          fundingModel: FundingModel.EQUITY_AND_GRANT,
          equityPercentage: 7,
          investmentAmount: 150000,
          stage: StartupStage.SEED,
          capacity: 15,
          programDuration: 24,
          prices: {
            create: [
              { planId: pro.id, periodicity: Periodicity.MONTHLY },
              { planId: vip.id, periodicity: Periodicity.MONTHLY },
            ],
          },
        },
      },
    },
  });

  // Coworking space
  await prisma.spot.create({
    data: {
      url: 'https://example.com/cowork/seed',
      spot: SpotType.COWORKINGSPACE,
      name: 'OneFive Cowork',
      highlight: 'Espace de coworking au cœur de Paris',
      address: 'Paris 11e',
      description: 'Bureaux et postes flexibles pour entrepreneurs.',
      provider: ProviderType.ONEFIVE,
      location: { type: 'Point', coordinates: [2.29, 48.86] },
      coworkingSpace: {
        create: {
          openingHours: { create: { begin: '09:00', end: '18:00' } },
          prices: {
            create: [
              { planId: basic.id, periodicity: Periodicity.DAILY },
              { planId: pro.id, periodicity: Periodicity.DAILY },
            ],
          },
        },
      },
    },
  });

  // Accelerator
  await prisma.spot.create({
    data: {
      url: 'https://example.com/accelerator/seed',
      spot: SpotType.ACCELERATOR,
      name: 'OneFive Accelerator',
      highlight: 'Programme 12 semaines pour scale-ups',
      address: 'Paris 13e',
      description: 'Accélérateur tech et IA, 5% equity, 150k€.',
      provider: ProviderType.ONEFIVE,
      location: { type: 'Point', coordinates: [2.31, 48.85] },
      accelerator: {
        create: {
          expertiseDomains: [ExpertiseDomain.TECH, ExpertiseDomain.AI],
          hiringPeriod: Periodicity.SEMESTERLY,
          fundingModel: FundingModel.EQUITY,
          equityPercentage: 5,
          investmentAmount: 150000,
          stage: StartupStage.SEED,
          capacity: 20,
          programDuration: 12,
          prices: {
            create: [{ planId: vip.id, periodicity: Periodicity.MONTHLY }],
          },
        },
      },
    },
  });

  // Contest
  await prisma.spot.create({
    data: {
      url: 'https://example.com/contest/seed',
      spot: SpotType.CONTEST,
      name: 'Startup Pitch Contest',
      highlight: '50 000€ à gagner pour les meilleures startups IA',
      address: 'Station F, Paris',
      description: 'Concours pitch pour startups IA, prix en cash.',
      provider: ProviderType.ONEFIVE,
      location: { type: 'Point', coordinates: [2.35, 48.87] },
      contest: {
        create: {
          beginDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          expertiseDomains: [ExpertiseDomain.AI, ExpertiseDomain.TECH],
          prizeType: PrizeType.CASH,
          prizeAmount: 50000,
          eligibility: 'Startups < 3 ans, tout secteur',
          prices: { create: [{ planId: basic.id }, { planId: vip.id }] },
        },
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('[seed] Spots created:', { event: event.name });
}

async function seedFileBucket() {
  const count = await prisma.file.count();
  if (count > 0) return;
  await prisma.file.createMany({
    data: [
      { size: 1024, mimeType: 'application/pdf', bucket: 'onefive-storage' },
      { size: 2048, mimeType: 'image/png', bucket: 'onefive-storage' },
    ],
  });
}

async function seedDataroom(profileId: string, startupId: string) {
  const existing = await prisma.dataroom.findFirst();
  if (existing) return existing;

  const dataroom = await prisma.dataroom.create({
    data: {
      startupId: startupId,
      createdBy: profileId,
    },
  });

  const [categoryPitch, categoryFinance] = await Promise.all([
    prisma.category.create({
      data: { name: 'Pitch', dataroomId: dataroom.id, createdBy: profileId },
    }),
    prisma.category.create({
      data: { name: 'Finance', dataroomId: dataroom.id, createdBy: profileId },
    }),
  ]);

  const filePitch = await prisma.dataroomFile.create({
    data: {
      dataroomId: dataroom.id,
      name: 'Pitch Deck.pdf',
      size: 1_234_567,
      mimetype: 'application/pdf',
      storageId: 'seed-storage-pitch',
      categoryId: categoryPitch.id,
      uploadedBy: profileId,
      isDeleted: false,
    },
  });

  const fileFinance = await prisma.dataroomFile.create({
    data: {
      dataroomId: dataroom.id,
      name: 'Financials.xlsx',
      size: 456_789,
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      storageId: 'seed-storage-finance',
      categoryId: categoryFinance.id,
      uploadedBy: profileId,
      isDeleted: false,
    },
  });

  const groupInvestors = await prisma.dataroomGroup.create({
    data: {
      dataroomId: dataroom.id,
      name: 'Investors',
      type: GroupType.DEFAULT,
      hasAllAccess: false,
      canUpload: false,
      canShare: true,
      canManageUsers: false,
      canManageGroups: false,
      createdBy: profileId,
    },
  });

  // Add member
  await prisma.member.create({
    data: {
      groupId: groupInvestors.id,
      dataroomId: dataroom.id,
      profileId,
    },
  });

  await prisma.permissionCategory.createMany({
    data: [
      {
        canView: true,
        canDownload: true,
        canComment: true,
        givenBy: profileId,
        groupId: groupInvestors.id,
        categoryId: categoryPitch.id,
      },
      {
        canView: true,
        canDownload: false,
        canComment: true,
        givenBy: profileId,
        groupId: groupInvestors.id,
        categoryId: categoryFinance.id,
      },
    ],
  });

  await prisma.permissionFile.create({
    data: {
      canView: true,
      canDownload: true,
      canComment: true,
      givenBy: profileId,
      groupId: groupInvestors.id,
      fileId: filePitch.id,
    },
  });

  await prisma.accessLog.create({
    data: {
      dataroomId: dataroom.id,
      fileId: filePitch.id,
      profileId,
      action: AccessAction.VIEW,
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
  });

  // KPI + History
  const kpi = await prisma.kPI.create({
    data: {
      name: 'Monthly Active Users',
      description: 'Number of MAUs',
      recurrence: KPIRecurrence.MONTHLY,
      dataroomId: dataroom.id,
      createdBy: profileId,
      groupId: groupInvestors.id,
    },
  });
  await prisma.kPIHistory.createMany({
    data: [
      {
        kpiId: kpi.id,
        value: 1200,
        timestamp: new Date(),
        notes: 'Initial',
        createdBy: profileId,
      },
      {
        kpiId: kpi.id,
        value: 1500,
        timestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: profileId,
      },
    ],
  });

  await prisma.roadmap.create({
    data: {
      dataroomId: dataroom.id,
      title: 'Lancement V1',
      description: 'MVP public',
      targetValue: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: RoadmapStatus.INPROGRESS,
      notes: 'Phase de finalisation',
      createdBy: profileId,
    },
  });

  await prisma.questionAndAnswer.create({
    data: {
      question: 'Quel est votre business model ?',
      answer: 'SaaS',
      dataroomId: dataroom.id,
    },
  });

  await prisma.captable.create({
    data: { profileId, stock: 1000, dataroomId: dataroom.id },
  });

  const fundraising = await prisma.fundraising.create({
    data: {
      dataroomId: dataroom.id,
      roundType: FundraisingRound.SEED,
      preMoneyValuation: 2_000_000,
      amountRaised: 500_000,
      postMoneyValuation: 2_500_000,
      pricePerShare: 1,
      totalShares: 2_500_000,
      percentageDiluted: 20,
      date: new Date(),
    },
  });
  await prisma.fundraisingCapTableEntry.create({
    data: {
      fundraisingId: fundraising.id,
      name: 'Founder',
      role: 'CEO',
      shares: 1_000_000,
      percentage: 40,
      valueInCurrency: 1_000_000,
    },
  });

  // Invitations
  const existingInvite = await prisma.existingUserInvitation.create({
    data: { profileId, dataroomId: dataroom.id },
  });
  const newInvite = await prisma.newUserInvitation.create({
    data: {
      email: 'investor@example.com',
      firstname: 'Jane',
      lastname: 'Doe',
      dataroomName: 'OneFive Seed',
      dataroomId: dataroom.id,
    },
  });

  await prisma.dataroomInvitation.createMany({
    data: [
      {
        dataroomId: dataroom.id,
        status: InvitationStatus.PENDING,
        groupId: groupInvestors.id,
        createdBy: profileId,
        existingUserInvitationId: existingInvite.id,
      },
      {
        dataroomId: dataroom.id,
        status: InvitationStatus.PENDING,
        groupId: groupInvestors.id,
        createdBy: profileId,
        newUserInvitationId: newInvite.id,
      },
    ],
  });

  await prisma.dataroomNotification.create({
    data: {
      dataroomId: dataroom.id,
      profileId,
      message: 'Bienvenue dans le dataroom',
    },
  });

  // Activity log
  await prisma.activityLog.create({
    data: {
      dataroomId: dataroom.id,
      profileId,
      action: 'SEED_ACTIVITY',
      metadata: { note: 'Seed created dataroom and files' },
    },
  });

  await prisma.trackingEvent.create({
    data: {
      eventType: 'session_start',
      dataroomId: dataroom.id,
      fileId: filePitch.id,
      profileId,
      sessionId: 'seed-session',
      sessionDuration: 60000,
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
  });

  // Direct access & permissions
  const direct = await prisma.directAccess.create({
    data: {
      dataroomId: dataroom.id,
      profileId,
      fileId: fileFinance.id,
      createdBy: profileId,
    },
  });
  await prisma.permissionFile.create({
    data: {
      canView: true,
      canDownload: true,
      canComment: false,
      givenBy: profileId,
      directAccessId: direct.id,
      fileId: fileFinance.id,
    },
  });

  return dataroom;
}

async function seedAchievements(
  teamProfileId: string,
  aliceProfileId: string,
  bobProfileId: string,
) {
  // Achievements pour l'équipe OneFive
  await prisma.achievement.createMany({
    data: [
      {
        profileId: teamProfileId,
        title: 'Lancement OneFive',
        description: 'Plateforme SaaS pour entrepreneurs et développeurs',
        date: '2024',
      },
      {
        profileId: teamProfileId,
        title: 'Premier Prix Startup Contest',
        description: 'Vainqueur du concours national des startups innovantes',
        date: '2023',
      },
      {
        profileId: teamProfileId,
        title: 'Certification ISO 27001',
        description: 'Sécurité des systèmes d\'information validée',
        date: '2023',
      },
    ],
  });

  // Achievements pour Alice
  await prisma.achievement.createMany({
    data: [
      {
        profileId: aliceProfileId,
        title: 'UX Design Award',
        description: 'Prix du meilleur design UX/UI pour applications mobiles',
        date: '2023',
      },
      {
        profileId: aliceProfileId,
        title: 'Formation Product Management',
        description: 'Certification Google Product Management',
        date: '2022',
      },
    ],
  });

  // Achievements pour Bob
  await prisma.achievement.createMany({
    data: [
      {
        profileId: bobProfileId,
        title: 'Hackathon Winner',
        description: '1ère place au Paris Tech Hackathon',
        date: '2023',
      },
    ],
  });
}

async function seedTagFollows(profileIds: string[]) {
  const popularTags = [
    'TECHNOLOGY',
    'PRODUCT',
    'MARKETING',
    'SALES',
    'FUNDING_AND_INVESTMENT',
    'SCALING_AND_GROWTH',
    'FUNDAMENTALS',
    'MARKET',
    'LEGAL',
  ];

  for (const profileId of profileIds) {
    // Chaque profil suit 2-4 tags aléatoires
    const tagsToFollow = faker.helpers.arrayElements(
      popularTags,
      Math.floor(Math.random() * 3) + 2,
    );

    for (const tag of tagsToFollow) {
      await prisma.tagFollow
        .create({
          data: { name: tag, profileId },
        })
        .catch(() => {}); // Ignore duplicates
    }
  }
}

async function seedProfileExtras(
  teamProfileId: string,
  otherProfileId: string,
) {
  // Experiences and Education
  await prisma.experience.create({
    data: {
      profileId: teamProfileId,
      title: 'Software Engineer',
      company: 'OneFive',
      domain: 'onefive.app',
      city: 'Paris',
      from: new Date('2023-01-01'),
      description: 'Building the OneFive platform',
      tags: ['typescript', 'nestjs'],
    },
  });
  await prisma.education.create({
    data: {
      profileId: teamProfileId,
      degree: 'MSc Computer Science',
      school: 'Université Paris',
      domain: 'u-paris.fr',
      city: 'Paris',
      from: new Date('2018-09-01'),
      to: new Date('2020-06-30'),
      tags: ['computer-science'],
    },
  });

  // Startups for onboarding (return them for dataroom seed)
  const startups = await Promise.all([
    prisma.startup.create({
      data: {
        name: 'OneFive',
        categories: ['SaaS', 'DevTools'],
        description: 'La plateforme pour entrepreneurs et développeurs',
        tagline: 'Connecte les fondateurs',
        countryCode: 'fr',
        city: 'Paris',
      },
    }),
    prisma.startup.create({
      data: {
        name: 'TechVenture',
        categories: ['FinTech', 'SaaS'],
        description: 'Solutions de paiement pour startups',
        tagline: 'Simplifie les transactions',
        countryCode: 'fr',
        city: 'Lyon',
      },
    }),
    prisma.startup.create({
      data: {
        name: 'GreenTech Solutions',
        categories: ['GreenTech', 'Impact'],
        description: 'Technologies pour un avenir durable',
        tagline: 'Innovation écologique',
        countryCode: 'fr',
        city: 'Marseille',
      },
    }),
    prisma.startup.create({
      data: {
        name: 'HealthAI',
        categories: ['HealthTech', 'AI'],
        description: 'Intelligence artificielle pour la santé',
        tagline: 'Révolutionne la médecine',
        countryCode: 'fr',
        city: 'Paris',
      },
    }),
    prisma.startup.create({
      data: {
        name: 'EduTech Pro',
        categories: ['EdTech', 'SaaS'],
        description: 'Plateforme d\'apprentissage en ligne',
        tagline: 'Formation accessible à tous',
        countryCode: 'fr',
        city: 'Bordeaux',
      },
    }),
  ]);

  const startup = startups[0];

  await prisma.startupMember.create({
    data: {
      profileId: teamProfileId,
      startupId: startup.id,
      position: 'Founder',
      role: 'SUPER_ADMIN',
      equity: 80,
    },
  });
  await prisma.startupFollow.create({
    data: { profileId: otherProfileId, startupId: startup.id },
  });

  // Profile follows and views
  await prisma.profileFollow
    .create({
      data: { followingId: teamProfileId, followedById: otherProfileId },
    })
    .catch(() => undefined);
  await prisma.profileView.create({
    data: { viewerId: otherProfileId, viewedById: teamProfileId },
  });
  await prisma.startupView.create({
    data: { profileId: otherProfileId, startupId: startup.id },
  });

  // Tags
  await prisma.tagFollow.create({
    data: { name: 'startup', profileId: teamProfileId },
  });

  return startups;
}

async function seedFundingHistory(
  startupId: string,
  investorProfileId: string,
) {
  const existing = await prisma.startupFundingHistory.findFirst({
    where: { startupId },
  });
  if (existing) return;

  const fundingHistory = await prisma.startupFundingHistory.create({
    data: {
      startupId,
      date: new Date('2024-06-01'),
      amountRaised: 500_000,
      valuation: 2_000_000,
      round: StartupFundingRound.SEED,
      manualInvestors: [
        {
          type: 'company',
          id: 'manual-kima',
          name: 'Kima Ventures',
          logo: 'https://icons.duckduckgo.com/ip3/kimaventures.com.ico',
        },
      ],
      profileInvestors: {
        create: {
          profileId: investorProfileId,
          isLead: true,
          invitationStatus: 'ACCEPTED',
          isVisible: true,
        },
      },
    },
  });

  await prisma.startupFundingInfo.upsert({
    where: { startupId },
    create: {
      startupId,
      totalRaised: '500000',
      lastRound: 'Seed',
      investors: ['Alice Musk', 'Kima Ventures'],
      fundraisingType: 'none',
    },
    update: {
      totalRaised: '500000',
      lastRound: 'Seed',
      investors: ['Alice Musk', 'Kima Ventures'],
    },
  });

  return fundingHistory;
}

async function seedFollows(p1: string, p2: string) {
  // p2 follows p1
  const exists = await prisma.profileFollow
    .findUnique({
      where: {
        followingId_followedById: { followingId: p1, followedById: p2 },
      },
    })
    .catch(() => null);
  if (!exists) {
    await prisma.profileFollow.create({
      data: { followingId: p1, followedById: p2 },
    });
  }
}

async function ensureRelationship({
  requesterId,
  accepterId,
  status,
}: {
  requesterId: string;
  accepterId: string;
  status: RelationshipStatus;
}) {
  // Try create; if exists, update status to desired value
  try {
    await prisma.relationship.create({
      data: { requesterId, accepterId, status },
    });
  } catch (e: any) {
    await prisma.relationship
      .update({
        where: { requesterId_accepterId: { requesterId, accepterId } },
        data: { status },
      })
      .catch(() => undefined);
  }
}

async function seedStreaks(userIds: string[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streakData: { userId: string; date: Date }[] = [];

  // Check which users already have streaks for today to avoid duplicates
  const existingTodayStreaks = await prisma.streak.findMany({
    where: {
      userId: { in: userIds },
      date: today,
    },
    select: { userId: true },
  });

  const usersWithTodayStreak = new Set(existingTodayStreaks.map(s => s.userId));
  const usersNeedingStreaks = userIds.filter(userId => !usersWithTodayStreak.has(userId));

  if (usersNeedingStreaks.length === 0) return; // All users already have today's streak

  for (const userId of userIds) {
    // Skip users who already have today's streak
    if (usersWithTodayStreak.has(userId)) continue;

    // Ensure everyone has at least 1 day streak (connected today)
    streakData.push({ userId, date: today });

    // Create realistic streaks for seed users
    // User 1: Active user with 7-day streak ending today
    if (userIds.indexOf(userId) === 0) {
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        streakData.push({ userId, date });
      }
      // Add some gaps to make it realistic
      for (let i = 10; i <= 12; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        streakData.push({ userId, date });
      }
    }
    // User 2: Less active user with 3-day streak
    else if (userIds.indexOf(userId) === 1) {
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        streakData.push({ userId, date });
      }
      // Previous streak of 2 days
      for (let i = 5; i <= 6; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        streakData.push({ userId, date });
      }
    }
    // Other users: Random streaks
    else {
      const streakLength = Math.floor(Math.random() * 10) + 1; // 1-10 days
      const hasCurrentStreak = Math.random() > 0.3; // 70% chance of active streak

      let startDate = today;
      if (!hasCurrentStreak) {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - Math.floor(Math.random() * 7) - 1); // 1-7 days ago
      }

      for (let i = 0; i < streakLength; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() - i);
        streakData.push({ userId, date });
      }

      // Add some sporadic connections
      if (Math.random() > 0.5) {
        const sporadicDays = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < sporadicDays; i++) {
          const randomDaysAgo = Math.floor(Math.random() * 30) + 10; // 10-40 days ago
          const date = new Date(today);
          date.setDate(today.getDate() - randomDaysAgo);
          streakData.push({ userId, date });
        }
      }
    }
  }

  // Batch insert all streak data
  if (streakData.length > 0) {
    await prisma.streak.createMany({
      data: streakData,
      skipDuplicates: true, // Handle potential duplicates
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    `[seed] Created ${streakData.length} streak records for ${userIds.length} users`,
  );
}

// ==================== CONVERSATIONS ====================

async function seedConversations(profiles: {
  teamProfileId: string;
  aliceProfileId: string;
  bobProfileId: string;
  fakeProfileIds?: string[];
}) {
  // Skip if conversations already exist
  const count = await prisma.conversation.count();
  if (count > 0) {
    // eslint-disable-next-line no-console
    console.log(`[seed] Conversations already exist (${count}), skipping`);
    return;
  }

  const { teamProfileId, aliceProfileId, bobProfileId, fakeProfileIds = [] } = profiles;

  // 1. Conversation directe Mark ↔ Alice (avec historique de messages)
  const conv1 = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      participants: {
        create: [
          { profileId: teamProfileId, isAdmin: true },
          { profileId: aliceProfileId },
        ],
      },
    },
  });

  const markAliceMessages = [
    { senderId: teamProfileId, content: 'Salut Alice ! Comment avance le design du dashboard ?', minutesAgo: 180 },
    { senderId: aliceProfileId, content: 'Hello Mark ! Ça avance bien, j\'ai terminé les maquettes Figma. Je t\'envoie le lien ?', minutesAgo: 175 },
    { senderId: teamProfileId, content: 'Oui carrément, envoie ! 🚀', minutesAgo: 170 },
    { senderId: aliceProfileId, content: 'Voilà : https://figma.com/file/onefive-dashboard\nJ\'ai fait 3 variantes pour la page profil.', minutesAgo: 165 },
    { senderId: teamProfileId, content: 'Super boulot ! La variante 2 est vraiment top. On en parle demain au daily ?', minutesAgo: 120 },
    { senderId: aliceProfileId, content: 'Parfait, à demain alors 👋', minutesAgo: 115 },
  ];

  for (const msg of markAliceMessages) {
    await prisma.message.create({
      data: {
        conversationId: conv1.id,
        senderId: msg.senderId,
        content: msg.content,
        type: 'TEXT',
        status: 'SENT',
        createdAt: new Date(Date.now() - msg.minutesAgo * 60 * 1000),
      },
    });
  }

  // 2. Conversation directe Mark ↔ Bob (conversation récente, peu de messages)
  const conv2 = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      participants: {
        create: [
          { profileId: teamProfileId, isAdmin: true },
          { profileId: bobProfileId },
        ],
      },
    },
  });

  const markBobMessages = [
    { senderId: teamProfileId, content: 'Hey Bob, bienvenue sur OneFive ! N\'hésite pas si tu as des questions.', minutesAgo: 60 },
    { senderId: bobProfileId, content: 'Merci Mark ! La plateforme a l\'air super. Je suis en train de remplir mon profil.', minutesAgo: 45 },
    { senderId: teamProfileId, content: 'Top ! Pense à ajouter tes compétences et ton rôle dans l\'écosystème, ça aide pour le matching.', minutesAgo: 30 },
  ];

  for (const msg of markBobMessages) {
    await prisma.message.create({
      data: {
        conversationId: conv2.id,
        senderId: msg.senderId,
        content: msg.content,
        type: 'TEXT',
        status: 'SENT',
        createdAt: new Date(Date.now() - msg.minutesAgo * 60 * 1000),
      },
    });
  }

  // 3. Conversation directe Alice ↔ Bob
  const conv3 = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      participants: {
        create: [
          { profileId: aliceProfileId, isAdmin: true },
          { profileId: bobProfileId },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv3.id,
      senderId: aliceProfileId,
      content: 'Salut Bob ! J\'ai vu ton profil, tu fais du React aussi ? On devrait échanger !',
      type: 'TEXT',
      status: 'SENT',
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
    },
  });

  // 4. Conversation de groupe (si on a des fake profiles)
  if (fakeProfileIds.length >= 2) {
    const groupParticipants = [teamProfileId, aliceProfileId, ...fakeProfileIds.slice(0, 3)];

    const groupConv = await prisma.conversation.create({
      data: {
        type: 'GROUP',
        name: 'OneFive Core Team 🚀',
        participants: {
          create: groupParticipants.map((pid, i) => ({
            profileId: pid,
            isAdmin: i === 0,
          })),
        },
      },
    });

    const groupMessages = [
      { senderId: teamProfileId, content: 'Bienvenue dans le groupe de l\'équipe OneFive !', minutesAgo: 300 },
      { senderId: aliceProfileId, content: 'Hello tout le monde 👋', minutesAgo: 290 },
      { senderId: fakeProfileIds[0], content: 'Merci pour l\'invitation !', minutesAgo: 280 },
      { senderId: teamProfileId, content: 'On se retrouve lundi pour le sprint planning. D\'ici là, n\'hésitez pas à poser vos questions ici.', minutesAgo: 200 },
    ];

    for (const msg of groupMessages) {
      await prisma.message.create({
        data: {
          conversationId: groupConv.id,
          senderId: msg.senderId,
          content: msg.content,
          type: 'TEXT',
          status: 'SENT',
          createdAt: new Date(Date.now() - msg.minutesAgo * 60 * 1000),
        },
      });
    }
  }

  // 5. Quelques conversations supplémentaires entre fake users
  if (fakeProfileIds.length >= 4) {
    for (let i = 0; i < Math.min(3, fakeProfileIds.length - 1); i++) {
      const convN = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          participants: {
            create: [
              { profileId: fakeProfileIds[i], isAdmin: true },
              { profileId: fakeProfileIds[i + 1] },
            ],
          },
        },
      });

      await prisma.message.create({
        data: {
          conversationId: convN.id,
          senderId: fakeProfileIds[i],
          content: faker.lorem.sentence(),
          type: 'TEXT',
          status: 'SENT',
          createdAt: new Date(Date.now() - faker.number.int({ min: 10, max: 500 }) * 60 * 1000),
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  const totalConvs = await prisma.conversation.count();
  const totalMsgs = await prisma.message.count();
  // eslint-disable-next-line no-console
  console.log(`[seed] Created ${totalConvs} conversations with ${totalMsgs} messages`);
}

async function main() {
  // Users
  const teamUser = await ensureUser({
    email: 'team@onefive.fr',
    password: '12345',
    isEmailVerified: true,
  });
  const aliceUser = await ensureUser({
    email: 'alice@onefive.fr',
    password: '12345',
    isEmailVerified: true,
  });

  // Profiles
  const teamProfile = await ensureProfileForUser(teamUser.id, {
    firstName: 'Mark',
    lastName: 'Zuckerberg',
  });
  const aliceProfile = await ensureProfileForUser(aliceUser.id, {
    firstName: 'Alice',
    lastName: 'Musk',
    ecosystemRoles: [ProfileRole.FOUNDER, ProfileRole.MENTOR],
    skills: ['design', 'ux'],
  });

  // Ensure a direct accepted connection between team and alice
  await ensureRelationship({
    requesterId: teamProfile.id,
    accepterId: aliceProfile.id,
    status: RelationshipStatus.ACCEPTED,
  });

  // Create a third user to demonstrate a pending outgoing request from team
  const bobUser = await ensureUser({
    email: 'bob@onefive.fr',
    password: '12345',
    isEmailVerified: true,
  });
  const bobProfile = await ensureProfileForUser(bobUser.id, {
    firstName: 'Bob',
    lastName: 'Marley',
    ecosystemRoles: [ProfileRole.SERVICE_PROVIDER],
    skills: ['typescript', 'react'],
  });

  await ensureRelationship({
    requesterId: teamProfile.id,
    accepterId: bobProfile.id,
    status: RelationshipStatus.PENDING,
  });

  // User without onboarding (no profile created)
  await ensureUser({
    email: 'onboarding@onefive.fr',
    password: '12345',
    isEmailVerified: true,
  });

  // Social graph
  await seedFollows(teamProfile.id, aliceProfile.id);

  // Sessions
  await Promise.all([seedSessions(teamUser.id), seedSessions(aliceUser.id)]);

  // Streaks
  await seedStreaks([teamUser.id, aliceUser.id]);

  // Content
  await seedPosts({ primary: teamProfile.id, secondary: aliceProfile.id });
  await seedDiscussions({
    primary: teamProfile.id,
    secondary: aliceProfile.id,
  });

  // Spots & Prices
  await seedSpots();

  // Files
  await seedFileBucket();

  // Profile extras, startups, follows, views, tags (must come before dataroom)
  const startups = await seedProfileExtras(teamProfile.id, aliceProfile.id);

  // Funding history with investor (Alice as investor of OneFive)
  await seedFundingHistory(startups[0].id, aliceProfile.id);

  // Dataroom (using the OneFive startup)
  await seedDataroom(teamProfile.id, startups[0].id);

  // Achievements
  await seedAchievements(teamProfile.id, aliceProfile.id, bobProfile.id);

  // Track fake profile IDs for conversations
  let fakeProfileIds: string[] = [];

  // --- Optional: Bulk Faker data ---
  if (DO_FAKE) {
    // Update existing profiles that still have invalid country names (like 'France')
    const profilesWithFrance = await prisma.profile.findMany({
      where: { countryCode: 'France' },
      select: { id: true }
    });

    for (const profile of profilesWithFrance) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { countryCode: getRandomCountryIso() }
      });
    }

    // Create users + profiles
    const fakeUsers: { userId: string; profileId: string }[] = [];
    for (let i = 0; i < NUM_FAKE_USERS; i++) {
      const email = faker.internet
        .email({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        })
        .toLowerCase();
      const u = await ensureUser({
        email,
        password: '12345',
        isEmailVerified: true,
      });
      const p = await ensureProfileForUser(u.id, {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        city: sample(['Paris', 'Lyon', 'Marseille', 'Bordeaux']),
        ecosystemRoles: sample([
          [ProfileRole.FOUNDER],
          [ProfileRole.SERVICE_PROVIDER],
          [ProfileRole.STUDENT_ENTREPRENEUR],
          [ProfileRole.BUSINESS_ANGEL, ProfileRole.MENTOR],
          [ProfileRole.VENTURE_CAPITALIST],
          [ProfileRole.MEDIA],
        ]),
        skills: sample([
          ['typescript', 'nestjs'],
          ['react', 'nextjs'],
          ['prisma', 'postgres'],
        ]),
        bio: faker.lorem.sentence(),
      });
      fakeUsers.push({ userId: u.id, profileId: p.id });
    }

    // Store fake profile IDs for conversations seeding later
    fakeProfileIds = fakeUsers.map(fu => fu.profileId);

    // Fetch startups for COLLEAGUE testing
    const allStartups = await prisma.startup.findMany({ select: { id: true } });

    // Assign fake users to startups (including OneFive where Team is)
    for (const fu of fakeUsers) {
      if (Math.random() > 0.5 && allStartups.length > 0) {
        const s = sample(allStartups);
        await prisma.startupMember
          .create({
            data: {
              startup: { connect: { id: s.id } },
              profile: { connect: { id: fu.profileId } },
              position: faker.person.jobTitle(),
              role: 'MEMBER',
              equity: faker.number.int({ min: 0, max: 15 }),
            },
          })
          .catch(() => {});
      }
    }

    // Tag follows
    await seedTagFollows([
      teamProfile.id,
      aliceProfile.id,
      bobProfile.id,
      ...fakeUsers.map((u) => u.profileId),
    ]);

    // More Profile Follows (Network graph)
    const randomFollows = faker.helpers.arrayElements(fakeUsers, 5);
    for (const f of randomFollows) {
      await seedFollows(teamProfile.id, f.profileId);
      await seedFollows(f.profileId, teamProfile.id);
    }

    // Fake users follow each other
    for (const fu of fakeUsers) {
      const others = faker.helpers.arrayElements(
        fakeUsers.filter((u) => u.userId !== fu.userId),
        3,
      );
      for (const o of others) {
        await seedFollows(fu.profileId, o.profileId);
      }
    }

    // Also add a couple of relationship examples among fake users
    if (fakeUsers.length >= 2) {
      // One pending outgoing from alice to a fake user
      await ensureRelationship({
        requesterId: aliceProfile.id,
        accepterId: fakeUsers[0].profileId,
        status: RelationshipStatus.PENDING,
      });
    }

    // Streaks for fake users
    const fakeUserIds = fakeUsers.map((fu) => fu.userId);
    await seedStreaks(fakeUserIds);

    // Posts and comments per user
    for (const fu of fakeUsers) {
      for (let i = 0; i < POSTS_PER_USER; i++) {
        const post = await prisma.post.create({
          data: {
            author: { connect: { id: fu.profileId } },
            content: faker.lorem.paragraph({ min: 1, max: 2 }).slice(0, 1000),
            medias: [],
            tags: sample([
              ['TECHNOLOGY'],
              ['PRODUCT'],
              ['MARKETING'],
              ['SALES'],
              ['FUNDING_AND_INVESTMENT'],
              ['SCALING_AND_GROWTH'],
            ]),
          },
        });
        // random viewers and reactions
        const randomViewers = faker.helpers.arrayElements(fakeUsers, 3);
        for (const rv of randomViewers) {
          await prisma.postView.create({
            data: { postId: post.id, profileId: rv.profileId },
          });
          await prisma.postReaction.create({
            data: {
              postId: post.id,
              profileId: rv.profileId,
              reaction: sample([
                ReactionType.HEART,
                ReactionType.THUMBS_UP,
                ReactionType.COTILLON,
              ]),
            },
          });
        }
        // comments
        for (let c = 0; c < COMMENTS_PER_POST; c++) {
          const author = sample(fakeUsers).profileId;
          await prisma.postComment.create({
            data: {
              postId: post.id,
              profileId: author,
              content: faker.lorem.sentence(),
            },
          });
        }
      }
    }

    // Discussions
    for (let i = 0; i < DISCUSSIONS_COUNT; i++) {
      const author = sample(fakeUsers).profileId;
      const isPoll = Math.random() < 0.35;
      const discussion = await prisma.discussion.create({
        data: {
          author: { connect: { id: author } },
          question: faker.lorem.sentence(),
          questionUnaccented: faker.lorem.sentence(),
          content: isPoll ? null : faker.lorem.paragraph(),
          options: isPoll
            ? faker.helpers.arrayElements(['A', 'B', 'C', 'D'], {
                min: 2,
                max: 4,
              })
            : [],
          tags: sample([['dev'], ['product'], ['design'], ['growth']]),
          type: isPoll ? DiscussionType.POLL : DiscussionType.DISCUSSION,
          context: Math.random() > 0.5 ? sample(SAAS_DOMAINS) : null,
        },
      });
      const viewers = faker.helpers.arrayElements(fakeUsers, 5);
      for (const v of viewers) {
        await prisma.discussionView.create({
          data: { discussionId: discussion.id, profileId: v.profileId },
        });
        await prisma.discussionReaction.create({
          data: {
            discussionId: discussion.id,
            profileId: v.profileId,
            reaction: sample([ReactionType.HEART, ReactionType.THUMBS_UP]),
          },
        });
      }
      // answers
      const answers = faker.helpers.arrayElements(fakeUsers, 2);
      for (const a of answers) {
        const answer = await prisma.discussionAnswer.create({
          data: {
            discussionId: discussion.id,
            profileId: a.profileId,
            content: faker.lorem.sentence(),
          },
        });
        await prisma.discussionAnswerUpvote.create({
          data: { answerId: answer.id, profileId: author },
        });
        const reply = await prisma.discussionAnswerReply.create({
          data: {
            answerId: answer.id,
            profileId: author,
            content: faker.lorem.sentence(),
          },
        });
        await prisma.discussionAnswerReplyReaction.create({
          data: {
            replyId: reply.id,
            profileId: a.profileId,
            reaction: ReactionType.THUMBS_UP,
          },
        });
      }
    }

    // Referrals (Parrainage)
    // Créer des invitations de parrainage entre utilisateurs
    const referralTiers = ['starter', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const tierThresholds = [0, 3, 10, 25, 50, 100];
    
    // Fonction pour déterminer le tier basé sur le nombre d'acceptations
    const getTier = (accepted: number): string => {
      for (let i = tierThresholds.length - 1; i >= 0; i--) {
        if (accepted >= tierThresholds[i]) return referralTiers[i];
      }
      return 'starter';
    };

    // Créer des referrals pour certains utilisateurs
    const referralCreators = fakeUsers.slice(0, 10); // Les 10 premiers créent des invitations
    const referralStats: Map<string, { sent: number; accepted: number; pending: number }> = new Map();

    for (const creator of referralCreators) {
      const numReferrals = faker.number.int({ min: 1, max: 8 });
      const potentialInvitees = fakeUsers.filter(u => u.profileId !== creator.profileId);
      const invitees = faker.helpers.arrayElements(potentialInvitees, Math.min(numReferrals, potentialInvitees.length));
      
      let sent = 0;
      let accepted = 0;
      let pending = 0;

      for (const invitee of invitees) {
        // Récupérer l'email de l'utilisateur invité
        const invitedUser = await prisma.user.findUnique({
          where: { id: invitee.userId },
          select: { email: true },
        });
        
        if (!invitedUser) continue;

        // Décider si l'invitation est acceptée ou en attente
        const isAccepted = faker.datatype.boolean({ probability: 0.7 });
        
        try {
          await prisma.referral.create({
            data: {
              referrerId: creator.profileId,
              invitedEmail: invitedUser.email,
              invitedProfileId: isAccepted ? invitee.userId : null,
              status: isAccepted ? ReferralStatus.ACCEPTED : ReferralStatus.PENDING,
              acceptedAt: isAccepted ? faker.date.recent({ days: 30 }) : null,
            },
          });
          
          sent++;
          if (isAccepted) accepted++;
          else pending++;
        } catch {
          // Ignorer les doublons (contrainte unique sur referrerId + invitedEmail)
        }
      }

      // Ajouter quelques invitations à des emails externes (non-inscrits)
      const externalCount = faker.number.int({ min: 0, max: 3 });
      for (let i = 0; i < externalCount; i++) {
        try {
          await prisma.referral.create({
            data: {
              referrerId: creator.profileId,
              invitedEmail: faker.internet.email(),
              status: ReferralStatus.PENDING,
            },
          });
          sent++;
          pending++;
        } catch {
          // Ignorer les doublons
        }
      }

      referralStats.set(creator.profileId, { sent, accepted, pending });
    }

    // Créer les ReferralStats pour chaque utilisateur qui a fait des invitations
    const allReferralStats = Array.from(referralStats.entries());
    for (let i = 0; i < allReferralStats.length; i++) {
      const [profileId, stats] = allReferralStats[i];
      const tier = getTier(stats.accepted);
      
      await prisma.referralStats.create({
        data: {
          profileId,
          currentTier: tier,
        },
      });
    }

    // eslint-disable-next-line no-console
    console.log(`[seed] Created ${referralStats.size} referral stats entries`);

    // Spots (randomized)
    for (let i = 0; i < SPOTS_COUNT; i++) {
      const kind = sample([
        SpotType.EVENT,
        SpotType.CONTEST,
        SpotType.INCUBATOR,
        SpotType.ACCELERATOR,
        SpotType.COWORKINGSPACE,
      ]);
      await prisma.spot.create({
        data: {
          url: faker.internet.url(),
          spot: kind,
          name: faker.company.name(),
          highlight: faker.company.catchPhrase(),
          address: faker.location.streetAddress(),
          provider: sample([
            ProviderType.ONEFIVE,
            ProviderType.EVENTBRITE,
            ProviderType.MEETUP,
          ]),
          description: faker.lorem.sentence(),
          location: {
            type: 'Point',
            coordinates: [
              faker.location.longitude(),
              faker.location.latitude(),
            ],
          },
        },
      });
    }
  }

  // Messaging: conversations & messages
  await seedConversations({
    teamProfileId: teamProfile.id,
    aliceProfileId: aliceProfile.id,
    bobProfileId: bobProfile.id,
    fakeProfileIds,
  });

  // eslint-disable-next-line no-console
  console.log('[seed] Database seeded successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error('[seed] Failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
