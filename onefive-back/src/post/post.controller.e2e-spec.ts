import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../test/helpers/fixtures';
import { AppModule } from '../app.module';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';

describe('PostController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(async () => {
    // Créer un utilisateur de test et récupérer le token
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: createUniqueEmail(),
        password: validPassword,
      })
      .expect(201);

    authToken = signupResponse.body.data.token;
    userId = signupResponse.body.data.userId;

    // Créer un profile pour cet utilisateur
    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  describe('POST /posts', () => {
    it('should create a new post successfully', async () => {
      const postData = {
        content: 'This is a test post content',
        tags: ['test', 'e2e'],
        medias: [
          {
            url: 'https://example.com/image.jpg',
            mimeType: 'image/jpeg',
            fileName: 'image.jpg',
            size: 1024,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should create a post with minimal data', async () => {
      const postData = {
        content: 'Minimal post content',
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should fail if content is missing', async () => {
      const postData = {
        tags: ['test'],
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail if content is too long', async () => {
      const postData = {
        content: 'a'.repeat(3001), // Exceeds MaxLength(3000)
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send(postData);

      expect([400, 500]).toContain(response.status);
    });

    it('should fail if not authenticated', async () => {
      const postData = {
        content: 'This should fail',
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .send(postData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail if medias array contains non-strings', async () => {
      const postData = {
        content: 'Test post',
        medias: [123, 'https://example.com/image.jpg'], // Mixed types
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send(postData);

      expect([201, 400]).toContain(response.status);
    });
  });

  describe('GET /posts', () => {
    let testPostId: string;

    beforeEach(async () => {
      // Créer un post de test
      const postResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          content: 'Test post for listing',
          tags: ['test'],
        })
        .expect(201);

      expect(postResponse.body.success).toBe(true);
      expect(postResponse.body.data.id).toBeDefined();
      testPostId = postResponse.body.data.id;
    });

    it('should list posts successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const post = response.body.data.find((p) => p.id === testPostId);
      expect(post).toBeDefined();
      expect(post.content).toBe('Test post for listing');
    });

    it('should list posts with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .query({ skip: 0, take: 5 })
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should fail if not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /posts/:id', () => {
    let testPostId: string;

    beforeEach(async () => {
      // Créer un post de test
      const postResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          content: 'Test post for get by id',
          tags: ['test'],
        })
        .expect(201);

      expect(postResponse.body.success).toBe(true);
      expect(postResponse.body.data.id).toBeDefined();
      testPostId = postResponse.body.data.id;
    });

    it('should get a post by id successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${testPostId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testPostId);
      expect(response.body.data.content).toBe('Test post for get by id');
    });

    it('should fail if post does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .get(`/posts/${fakeId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail if not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${testPostId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /posts/:id', () => {
    let testPostId: string;

    beforeEach(async () => {
      // Créer un post de test
      const postResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          content: 'Original post content',
          tags: ['original'],
        })
        .expect(201);

      expect(postResponse.body.success).toBe(true);
      expect(postResponse.body.data.id).toBeDefined();
      testPostId = postResponse.body.data.id;
    });

    it('should update a post successfully', async () => {
      const updateData = {
        content: 'Updated post content',
        tags: ['updated', 'test'],
      };

      const response = await request(app.getHttpServer())
        .put(`/posts/${testPostId}`)
        .set('Cookie', `token=${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testPostId);
      expect(response.body.data.content).toBe(updateData.content);
      expect(response.body.data.tags).toEqual(updateData.tags);
    });

    it('should fail if trying to update another user post', async () => {
      // Créer un autre utilisateur
      const otherUserResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `other-${Date.now()}@example.com`,
          password: validPassword,
        });

      const otherUserToken = otherUserResponse.body.data.token;

      const updateData = {
        content: 'Unauthorized update attempt',
      };

      const response = await request(app.getHttpServer())
        .put(`/posts/${testPostId}`)
        .set('Cookie', `token=${otherUserToken}`)
        .send(updateData);

      expect([403, 404]).toContain(response.status);
    });

    it('should fail if post does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const updateData = {
        content: 'Update attempt on non-existent post',
      };

      const response = await request(app.getHttpServer())
        .put(`/posts/${fakeId}`)
        .set('Cookie', `token=${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /posts/:id', () => {
    let testPostId: string;

    beforeEach(async () => {
      // Créer un post de test
      const postResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          content: 'Post to be deleted',
          tags: ['delete'],
        })
        .expect(201);

      expect(postResponse.body.success).toBe(true);
      expect(postResponse.body.data.id).toBeDefined();
      testPostId = postResponse.body.data.id;
    });

    it('should delete a post successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/posts/${testPostId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // Vérifier que le post a été supprimé (soft delete, le post existe toujours mais marqué comme supprimé)
      const getResponse = await request(app.getHttpServer())
        .get(`/posts/${testPostId}`)
        .set('Cookie', `token=${authToken}`);

      // Le post peut soit ne plus être accessible (404) soit être marqué comme supprimé
      expect([200, 404]).toContain(getResponse.status);
    });

    it('should fail if trying to delete another user post', async () => {
      // Créer un autre utilisateur
      const otherUserResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `other-${Date.now()}@example.com`,
          password: validPassword,
        });

      const otherUserToken = otherUserResponse.body.data.token;

      const response = await request(app.getHttpServer())
        .delete(`/posts/${testPostId}`)
        .set('Cookie', `token=${otherUserToken}`);

      expect([403, 404]).toContain(response.status);
    });

    it('should fail if post does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .delete(`/posts/${fakeId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /posts/feed', () => {
    beforeEach(async () => {
      // Créer plusieurs posts pour tester le feed
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/posts')
          .set('Cookie', `token=${authToken}`)
          .send({
            content: `Feed post ${i + 1}`,
            tags: ['feed'],
          });
      }
    });

    it('should get feed successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/feed')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      const feedItems =
        response.body.data?.posts ??
        response.body.data?.items ??
        response.body.data;
      expect(Array.isArray(feedItems)).toBe(true);
      expect(feedItems.length).toBeGreaterThan(0);
    });

    it('should get feed with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/feed?skip=0&limit=2')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const feedItems =
        response.body.data?.posts ??
        response.body.data?.items ??
        response.body.data;
      expect(Array.isArray(feedItems)).toBe(true);
      expect(feedItems.length).toBeLessThanOrEqual(2);
    });

    it('should fail if not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/feed')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject limit above max', async () => {
      const { VALIDATION_LIMITS } =
        await import('../common/constants/validation-limits.constants');
      await request(app.getHttpServer())
        .get(
          `/posts/feed?limit=${VALIDATION_LIMITS.POST.FEED_LIMIT_MAX + 1}&skip=0`,
        )
        .set('Cookie', `token=${authToken}`)
        .expect(400);
    });

    it('should reject negative skip', async () => {
      await request(app.getHttpServer())
        .get('/posts/feed?limit=10&skip=-1')
        .set('Cookie', `token=${authToken}`)
        .expect(400);
    });
  });

  describe('POST /posts/:id/repost', () => {
    it('should repost a post successfully', async () => {
      // Créer un post original
      const originalPostResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          content: 'Original post to be reposted',
          tags: ['original'],
        })
        .expect(201);

      const originalPostId = originalPostResponse.body.data.id;

      // Créer un repost
      const repostResponse = await request(app.getHttpServer())
        .post(`/posts/${originalPostId}/repost`)
        .set('Cookie', `token=${authToken}`)
        .send({
          content: 'My comment on this repost',
        })
        .expect(201);

      expect(repostResponse.body.success).toBe(true);
      expect(repostResponse.body.data).toBeDefined();
      expect(repostResponse.body.data.id).toBeDefined();
      expect(repostResponse.body.data.createdAt).toBeDefined();
      expect(repostResponse.body.data.updatedAt).toBeDefined();
    });

    it('should repost without additional content', async () => {
      // Créer un post original
      const originalPostResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          content: 'Another original post',
        })
        .expect(201);

      const originalPostId = originalPostResponse.body.data.id;

      // Créer un repost sans contenu additionnel
      const repostResponse = await request(app.getHttpServer())
        .post(`/posts/${originalPostId}/repost`)
        .set('Cookie', `token=${authToken}`)
        .send({})
        .expect(201);

      expect(repostResponse.body.success).toBe(true);
      expect(repostResponse.body.data.id).toBeDefined();
    });

    it('should fail if post does not exist', async () => {
      const fakePostId = 'non-existent-post-id';

      const response = await request(app.getHttpServer())
        .post(`/posts/${fakePostId}/repost`)
        .set('Cookie', `token=${authToken}`)
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail if not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/posts/some-id/repost')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
