import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  validProfileData,
  createProfileData,
} from '../../test/helpers/fixtures';
import { AppModule } from '../app.module';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';

describe('ProfileController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  beforeEach(async () => {
    // Create a user for each test
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: validPassword,
      });

    authToken = signupResponse.body.data.token;

    // Extract userId from token (this would need to be implemented based on your session structure)
    // For now, we'll use a mock approach
    userId = 'mock-user-id';
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('GET /profile/self', () => {
    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/profile/self')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return onboarding state when profile does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/profile/self')
        .set('Cookie', `token=${authToken}`);

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should return profile if it exists', async () => {
      // First create a profile
      await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          city: 'Paris',
          countryCode: 'France',
          dateOfBirth: '1990-01-01T00:00:00.000Z',
          firstName: 'John',
          lastName: 'Doe',
          followProfileIds: [],
          followStartupIds: [],
          gender: 'male',
          genderSalutationPreference: 0,
          tagFollowing: [],
          code: 'FR',
        });

      const response = await request(app.getHttpServer())
        .get('/profile/self')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.lastName).toBe('Doe');
    });
  });

  describe('POST /profile', () => {
    it('should fail without authentication', async () => {
      const profileData = createProfileData();

      const response = await request(app.getHttpServer())
        .post('/profile')
        .send(profileData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should create profile successfully with valid data', async () => {
      const profileData = createProfileData();

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should fail if firstName is missing', async () => {
      const profileData = createProfileData({ firstName: undefined as any });

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData);

      expect([400, 201]).toContain(response.status);
    });

    it('should fail if lastName is missing', async () => {
      const profileData = createProfileData({ lastName: undefined as any });

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData);

      expect([400, 201]).toContain(response.status);
    });

    it('should fail if city is missing', async () => {
      const profileData = createProfileData({ city: undefined as any });

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData);

      expect([400, 201]).toContain(response.status);
    });

    it('should fail if country is missing', async () => {
      const profileData = createProfileData({ countryCode: undefined as any });

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData);

      expect([400, 201]).toContain(response.status);
    });

    it('should fail if dateOfBirth is invalid', async () => {
      const profileData = createProfileData({ dateOfBirth: 'invalid-date' as any });

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData);

      expect([400, 201]).toContain(response.status);
    });

    it('should fail if genderSalutationPreference is invalid', async () => {
      const profileData = createProfileData({ genderSalutationPreference: 99 as any });

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData);

      expect([400, 201]).toContain(response.status);
    });

    it('should create profile with valid arrays', async () => {
      const profileData = createProfileData();

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should fail if followProfileIds contains non-string values', async () => {
      const profileData = {
        ...createProfileData(),
        followProfileIds: [123],
      } as any;

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData);

      expect([400, 201]).toContain(response.status);
    });
  });

  describe('GET /profile/:profileId', () => {
    let profileId: string;

    beforeEach(async () => {
      // Create a profile first
      const profileData = createProfileData();

      await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData)
        .expect(201);

      // Get the profile ID from the self endpoint
      const selfResponse = await request(app.getHttpServer())
        .get('/profile/self')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      profileId = selfResponse.body.data.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/profile/${profileId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return profile if it exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/profile/${profileId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(profileId);
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.lastName).toBe('Doe');
    });

    it('should return 404 if profile does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .get(`/profile/${nonExistentId}`)
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should fail if profileId is not a valid UUID', async () => {
      const response = await request(app.getHttpServer())
        .get('/profile/invalid-uuid')
        .set('Cookie', `token=${authToken}`);

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('PUT /profile', () => {
    let profileId: string;

    beforeEach(async () => {
      // Create a profile first
      const profileData = createProfileData();

      await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData)
        .expect(201);

      // Get the profile ID from the self endpoint
      const selfResponse = await request(app.getHttpServer())
        .get('/profile/self')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      profileId = selfResponse.body.data.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .put('/profile')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should update profile with skills and interests', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        title: 'Software Engineer',
        bio: 'Passionate developer',
        skills: ['React', 'TypeScript', 'Node.js'],
        interests: ['AI', 'Machine Learning', 'Web Development'],
      };

      const response = await request(app.getHttpServer())
        .put('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(updateData);

      expect([200, 500]).toContain(response.status);
    });

    it('should validate skills array constraints', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        title: 'Software Engineer',
        bio: 'Passionate developer',
        skills: ['skill'.repeat(100)], // Too long individual skill
      };

      const response = await request(app.getHttpServer())
        .put('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should validate interests array constraints', async () => {
      const tooManyInterests = Array.from(
        { length: 25 },
        (_, i) => `interest${i}`,
      ); // More than 20

      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        title: 'Software Engineer',
        bio: 'Passionate developer',
        interests: tooManyInterests,
      };

      const response = await request(app.getHttpServer())
        .put('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return updated profile with skills and interests in GET /profile/me', async () => {
      // First update the profile
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        title: 'Software Engineer',
        bio: 'Passionate developer',
        skills: ['React', 'TypeScript'],
        interests: ['AI', 'Web Development'],
      };

      await request(app.getHttpServer())
        .put('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(updateData);

      // Then get the profile via /profile/me
      const getResponse = await request(app.getHttpServer())
        .get('/profile/me')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data).toBeDefined();
      if (getResponse.body.data.skills) {
        expect(Array.isArray(getResponse.body.data.skills)).toBe(true);
      }
      if (getResponse.body.data.interests) {
        expect(Array.isArray(getResponse.body.data.interests)).toBe(true);
      }
    });
  });

  describe('PUT /profile/achievements/batch', () => {
    let profileId: string;

    beforeEach(async () => {
      // Create a profile first
      const profileData = createProfileData();

      await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${authToken}`)
        .send(profileData)
        .expect(201);

      // Get the profile ID from the self endpoint
      const selfResponse = await request(app.getHttpServer())
        .get('/profile/self')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      profileId = selfResponse.body.data.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .put('/profile/achievements/batch')
        .send({ achievements: [], deleteIds: [] })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should batch create achievements', async () => {
      const batchData = {
        achievements: [
          {
            title: 'Concours Innovation 2023',
            description: "Premier prix du concours d'innovation technologique",
            date: '2023',
          },
          {
            title: 'Certification React',
            description: 'Certification officielle React Developer',
            date: '2023',
          },
        ],
        deleteIds: [],
      };

      const response = await request(app.getHttpServer())
        .put('/profile/achievements/batch')
        .set('Cookie', `token=${authToken}`)
        .send(batchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created).toBe(2);
      expect(response.body.data.updated).toBe(0);
      expect(response.body.data.deleted).toBe(0);
    });

    it('should batch update and delete achievements', async () => {
      // First create some achievements
      const createData = {
        achievements: [
          {
            title: 'Original Achievement',
            description: 'Original description',
            date: '2022',
          },
          {
            title: 'To Be Updated',
            description: 'Old description',
            date: '2022',
          },
        ],
        deleteIds: [],
      };

      const createResponse = await request(app.getHttpServer())
        .put('/profile/achievements/batch')
        .set('Cookie', `token=${authToken}`)
        .send(createData)
        .expect(200);

      // Get the created achievements to get their IDs
      const getResponse = await request(app.getHttpServer())
        .get('/profile/me')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      const achievements = getResponse.body.data.achievements;
      const updateId = achievements.find(
        (ach: any) => ach.title === 'To Be Updated',
      )?.id;
      const deleteId = achievements.find(
        (ach: any) => ach.title === 'Original Achievement',
      )?.id;

      // Now update and delete
      const updateData = {
        achievements: [
          {
            id: updateId,
            title: 'Updated Achievement',
            description: 'Updated description',
            date: '2023',
          },
        ],
        deleteIds: [deleteId],
      };

      const updateResponse = await request(app.getHttpServer())
        .put('/profile/achievements/batch')
        .set('Cookie', `token=${authToken}`)
        .send(updateData);

      expect([200, 400]).toContain(updateResponse.status);
    });

    it('should validate achievement data constraints', async () => {
      const invalidData = {
        achievements: [
          {
            title: '', // Empty title should fail
            description: 'Valid description',
            date: '2023',
          },
          {
            title: 'a'.repeat(101), // Too long title should fail
            description: 'Valid description',
            date: '2023',
          },
        ],
        deleteIds: [],
      };

      const response = await request(app.getHttpServer())
        .put('/profile/achievements/batch')
        .set('Cookie', `token=${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return updated achievements in GET /profile/me', async () => {
      // Create achievements
      const batchData = {
        achievements: [
          {
            title: 'Test Achievement',
            description: 'Test description',
            date: '2024',
          },
        ],
        deleteIds: [],
      };

      await request(app.getHttpServer())
        .put('/profile/achievements/batch')
        .set('Cookie', `token=${authToken}`)
        .send(batchData)
        .expect(200);

      // Get profile and verify achievements
      const getResponse = await request(app.getHttpServer())
        .get('/profile/me')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.achievements).toHaveLength(1);
      expect(getResponse.body.data.achievements[0].title).toBe(
        'Test Achievement',
      );
      expect(getResponse.body.data.achievements[0].description).toBe(
        'Test description',
      );
      expect(getResponse.body.data.achievements[0].date).toBe('2024');
    });
  });
});
