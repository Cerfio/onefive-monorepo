import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupE2E, E2EContext } from 'test/utils/e2e-setup';

describe('Security Performance Tests', () => {
  let context: E2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;
  }, 60000);

  afterAll(async () => {
    await context.teardown();
  });

  describe('Request Performance', () => {
    it('should handle multiple concurrent requests efficiently', async () => {
      const startTime = Date.now();
      const requests = [];

      // Faire 20 requêtes simultanées sur /health (public)
      for (let i = 0; i < 20; i++) {
        requests.push(request(app.getHttpServer()).get('/health'));
      }

      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      expect(responses).toHaveLength(20);
      expect(duration).toBeLessThan(5000);

      const successCount = responses.filter((r) => r.status === 200).length;
      expect(successCount).toBe(20);
    });
  });

  describe('Validation Performance', () => {
    it('should reject invalid inputs quickly', async () => {
      const invalidInputs = [
        { email: 'invalid-email', password: 'weak' },
        { email: '', password: 'ValidPass123!' },
        { email: 'test@example.com', password: '' },
      ];

      const startTime = Date.now();

      for (const input of invalidInputs) {
        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(input)
          .expect(400);
      }

      const duration = Date.now() - startTime;

      // Validation doit être rapide (< 2 secondes pour 3 entrées)
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Security Headers Performance', () => {
    it('should add security headers without performance impact', async () => {
      const startTime = Date.now();
      const requests = [];

      for (let i = 0; i < 10; i++) {
        requests.push(request(app.getHttpServer()).get('/health'));
      }

      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      expect(responses).toHaveLength(10);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.headers['x-content-type-options']).toBe('nosniff');
      });

      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with repeated requests', async () => {
      const initialMemory = process.memoryUsage();

      for (let i = 0; i < 50; i++) {
        await request(app.getHttpServer()).get('/health');
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Augmentation mémoire raisonnable (< 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
