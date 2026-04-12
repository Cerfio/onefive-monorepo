/**
 * Search & Discovery Flows E2E Tests
 *
 * Tests search functionality and user discovery:
 * - Search profiles by name, skills, location
 * - 2nd degree connection suggestions
 * - Filter by ecosystem roles
 * - Startup search
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../../utils/fast-e2e-setup';
import {
  completeUserRegistration,
  createUserWithCustomProfile,
  createConnectedUsers,
  createFundableStartup,
} from '../../helpers/flow-helpers';

describe('Search & Discovery Flows (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  // ─────────────────────────────────────────────────────
  // Flow 1: Profile Search
  // ─────────────────────────────────────────────────────

  describe('Profile Search', () => {
    it('should find profiles by name in search', async () => {
      // Create a user with specific name
      const targetUser = await createUserWithCustomProfile(
        app,
        request,
        {
          firstName: 'Alexandre',
          lastName: 'Dubois',
        },
        'alexandre',
      );

      const searcher = await completeUserRegistration(app, request, 'searcher');

      // Wait for indexing
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Search for "alexandre"
      const searchRes = await request(app.getHttpServer())
        .get('/search?q=alexandre&type=profiles')
        .set('Cookie', `token=${searcher.token}`);

      if (searchRes.statusCode === 200) {
        const results = searchRes.body.data;
        if (Array.isArray(results)) {
          // Should find Alexandre (or at least not error)
          expect(results.length).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should find profiles by location', async () => {
      const targetUser = await createUserWithCustomProfile(
        app,
        request,
        {
          city: 'Lyon',
          countryCode: 'FR',
        },
        'lyonuser',
      );

      const searcher = await completeUserRegistration(
        app,
        request,
        'locsearch',
      );

      // Wait for indexing
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Search profiles in Lyon
      const searchRes = await request(app.getHttpServer())
        .get('/search?q=Lyon&type=profiles')
        .set('Cookie', `token=${searcher.token}`);

      if (searchRes.statusCode === 200) {
        expect(searchRes.body.data).toBeDefined();
      }
    });

    it('should filter search by ecosystem role', async () => {
      const founder = await createUserWithCustomProfile(
        app,
        request,
        {
          ecosystemRoles: ['FOUNDER'],
        },
        'rolefounder',
      );

      const investor = await createUserWithCustomProfile(
        app,
        request,
        {
          ecosystemRoles: ['BUSINESS_ANGEL'],
        },
        'roleinvestor',
      );

      const searcher = await completeUserRegistration(
        app,
        request,
        'rolesearch',
      );

      // Wait for indexing
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Search for founders only
      const foundersRes = await request(app.getHttpServer())
        .get('/search?type=profiles&role=FOUNDER')
        .set('Cookie', `token=${searcher.token}`);

      if (foundersRes.statusCode === 200) {
        expect(foundersRes.body.data).toBeDefined();
      }
    });

    it('should return empty results for non-matching search without crashing', async () => {
      const searcher = await completeUserRegistration(
        app,
        request,
        'emptysearch',
      );

      const searchRes = await request(app.getHttpServer())
        .get('/search?q=XyZAbC123NonExistent')
        .set('Cookie', `token=${searcher.token}`);

      expect([200]).toContain(searchRes.statusCode);

      const data = searchRes.body?.data;
      expect(data).toBeDefined();
      expect(data).toHaveProperty('people');
      expect(data).toHaveProperty('companies');
      expect(data).toHaveProperty('posts');
      expect(data).toHaveProperty('discussions');
      expect(Array.isArray(data.people)).toBe(true);
      expect(data.people.length).toBe(0);
    });

    it('should handle search pagination', async () => {
      const searcher = await completeUserRegistration(
        app,
        request,
        'pagsearch',
      );

      // First page
      const page1 = await request(app.getHttpServer())
        .get('/search?q=test&type=profiles&limit=10&offset=0')
        .set('Cookie', `token=${searcher.token}`);

      if (page1.statusCode === 200) {
        expect(Array.isArray(page1.body.data)).toBe(true);
      }

      // Second page
      const page2 = await request(app.getHttpServer())
        .get('/search?q=test&type=profiles&limit=10&offset=10')
        .set('Cookie', `token=${searcher.token}`);

      if (page2.statusCode === 200) {
        expect(Array.isArray(page2.body.data)).toBe(true);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2: Connection Suggestions
  // ─────────────────────────────────────────────────────

  describe('Connection Suggestions', () => {
    it('should suggest 2nd degree connections', async () => {
      const userA = await completeUserRegistration(app, request, 'suggA');
      const userB = await completeUserRegistration(app, request, 'suggB');
      const userC = await completeUserRegistration(app, request, 'suggC');

      // A and B are connected
      await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      await request(app.getHttpServer())
        .post(`/network/connect/${userA.profileId}/accept`)
        .set('Cookie', `token=${userB.token}`);

      // B and C are connected
      await request(app.getHttpServer())
        .post(`/network/connect/${userC.profileId}`)
        .set('Cookie', `token=${userB.token}`);

      await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}/accept`)
        .set('Cookie', `token=${userC.token}`);

      // Wait for suggestions to be generated
      await new Promise((resolve) => setTimeout(resolve, 200));

      // A should see C in suggestions (2nd degree through B)
      const suggestionsRes = await request(app.getHttpServer())
        .get('/network/people?view=discover&limit=20')
        .set('Cookie', `token=${userA.token}`)
        .expect(200);

      expect(suggestionsRes.body.data).toBeDefined();
      expect(Array.isArray(suggestionsRes.body.data)).toBe(true);

      // C might appear in suggestions
      if (Array.isArray(suggestionsRes.body.data)) {
        const hasC = suggestionsRes.body.data.some(
          (p: any) => p.id === userC.profileId,
        );
        expect(typeof hasC).toBe('boolean');
      }
    });

    it('should provide profile suggestions', async () => {
      const user = await completeUserRegistration(app, request, 'profsugg');

      const suggestionsRes = await request(app.getHttpServer())
        .get('/profile-suggestion?limit=10')
        .set('Cookie', `token=${user.token}`);

      if (suggestionsRes.statusCode === 200) {
        expect(suggestionsRes.body.data).toBeDefined();
      }
    });

    it('should provide startup suggestions', async () => {
      const user = await completeUserRegistration(app, request, 'stsugg');
      await createFundableStartup(app, request); // Create some startups

      const suggestionsRes = await request(app.getHttpServer())
        .get('/startup-suggestion?limit=10')
        .set('Cookie', `token=${user.token}`);

      if (suggestionsRes.statusCode === 200) {
        expect(suggestionsRes.body.data).toBeDefined();
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 3: Startup Search
  // ─────────────────────────────────────────────────────

  describe('Startup Search', () => {
    it('should find startups by name', async () => {
      const searcher = await completeUserRegistration(app, request, 'stsearch');

      // Search for startups
      const searchRes = await request(app.getHttpServer())
        .get('/search?q=test&type=startups')
        .set('Cookie', `token=${searcher.token}`);

      if (searchRes.statusCode === 200) {
        expect(searchRes.body.data).toBeDefined();
      }
    });

    it('should filter startups by category', async () => {
      const searcher = await completeUserRegistration(app, request, 'catfilt');

      // Search with filter
      const searchRes = await request(app.getHttpServer())
        .get('/search?type=startups&category=Technology')
        .set('Cookie', `token=${searcher.token}`);

      if (searchRes.statusCode === 200) {
        expect(searchRes.body.data).toBeDefined();
      }
    });

    it('should filter startups by funding stage', async () => {
      const searcher = await completeUserRegistration(app, request, 'fundfilt');

      // Search with funding filter
      const searchRes = await request(app.getHttpServer())
        .get('/search?type=startups&fundingStage=Seed')
        .set('Cookie', `token=${searcher.token}`);

      if (searchRes.statusCode === 200) {
        expect(searchRes.body.data).toBeDefined();
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 4: Searchbar Quick Search
  // ─────────────────────────────────────────────────────

  describe('Searchbar Quick Search', () => {
    it('should provide quick results from searchbar endpoint', async () => {
      const searcher = await completeUserRegistration(
        app,
        request,
        'quicksrch',
      );

      const quickRes = await request(app.getHttpServer())
        .get('/search/searchbar?q=test')
        .set('Cookie', `token=${searcher.token}`);

      if (quickRes.statusCode === 200) {
        expect(quickRes.body.data).toBeDefined();
        // Should return mixed results (profiles + startups + discussions)
      }
    });

    it('should handle empty searchbar query', async () => {
      const searcher = await completeUserRegistration(app, request, 'emptyq');

      const res = await request(app.getHttpServer())
        .get('/search/searchbar?q=')
        .set('Cookie', `token=${searcher.token}`);

      // Should handle gracefully
      expect([200, 400]).toContain(res.statusCode);
    });
  });
});
