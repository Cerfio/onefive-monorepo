import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupE2E, E2EContext } from 'test/utils/e2e-setup';
import { SecurityService } from './security.service';

describe('Security Integration Tests', () => {
  let context: E2EContext;
  let app: INestApplication;
  let securityService: SecurityService;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;
    securityService = app.get<SecurityService>(SecurityService);
  }, 60000);

  afterAll(async () => {
    await context.teardown();
  });

  describe('Security Headers Integration', () => {
    it('should include Helmet security headers in responses', async () => {
      // GET /health est @Public(), pas de 401
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const headers = response.headers;

      // Headers Helmet (actif via @fastify/helmet)
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-dns-prefetch-control']).toBe('off');
      expect(headers['x-download-options']).toBe('noopen');
      expect(headers['x-permitted-cross-domain-policies']).toBe('none');
    });

    it('should require authentication on non-public routes', async () => {
      // GET / n'a pas @Public() → doit retourner 401
      await request(app.getHttpServer()).get('/').expect(401);
    });

    it('should have proper CORS configuration', async () => {
      // Use origin matching FRONTEND_URL from .env.test (http://localhost:3000)
      const origin = process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:3000';
      const response = await request(app.getHttpServer())
        .options('/auth/signin')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      const headers = response.headers;
      expect(headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Input Validation Integration', () => {
    it('should reject payloads with extra/forbidden fields (whitelist)', async () => {
      // Le ValidationPipe a forbidNonWhitelisted: true
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!',
          maliciousField: 'hack',
          admin: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email and password formats', async () => {
      const invalidInputs = [
        { email: 'invalid-email', password: 'weak' },
        { email: '', password: 'ValidPass123!' },
        { email: 'test@example.com', password: '' },
      ];

      for (const input of invalidInputs) {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send(input);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        // Le message d'erreur est dans error.message (format AllExceptionsFilter)
        expect(response.body.error).toBeDefined();
      }
    });
  });

  describe('Session Security Integration', () => {
    it('should return a session token on signup', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `session-test-${Date.now()}@example.com`,
          password: 'ValidPass123!',
        })
        .expect(201);

      // Le token est retourné dans le body (pas en cookie côté serveur)
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe('string');
    });

    it('should allow access to protected routes with valid session token', async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `protected-route-${Date.now()}@example.com`,
          password: 'ValidPass123!',
        })
        .expect(201);

      const token = signupResponse.body.data.token;

      // Requête authentifiée avec cookie token= sur une route protégée
      const authResponse = await request(app.getHttpServer())
        .get('/auth/email/has-been-verified')
        .set('Cookie', `token=${token}`);

      // Doit ne pas être 401 (authentification valide)
      expect(authResponse.status).not.toBe(401);
    });
  });

  describe('Error Handling Security', () => {
    it('should not leak sensitive information in error responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      const responseBody = JSON.stringify(response.body).toLowerCase();

      // Vérifier que l'erreur ne contient pas d'informations sensibles
      expect(responseBody).not.toContain('hash');
      expect(responseBody).not.toContain('database');
      expect(responseBody).not.toContain('sql');
      expect(responseBody).not.toContain('stack');
    });

    it('should have consistent error response format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'invalid-email', password: 'test' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('statusCode', 400);
      expect(response.body).not.toHaveProperty('stack');
    });
  });

  describe('SecurityService', () => {
    it('should have logSecurityEvent available', () => {
      expect(securityService).toBeDefined();
      expect(typeof securityService.logSecurityEvent).toBe('function');
    });

    it('should have getClientInfo available', () => {
      expect(typeof securityService.getClientInfo).toBe('function');
    });

    it('should extract client info from request', async () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': '1.2.3.4',
          'user-agent': 'test-agent',
        },
        connection: { remoteAddress: '127.0.0.1' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const clientInfo = await securityService.getClientInfo(mockRequest);
      expect(clientInfo.ip).toBe('1.2.3.4');
      expect(clientInfo.userAgent).toBe('test-agent');
    });
  });
});
