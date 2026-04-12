import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import 'dotenv/config';
import { validateEnv } from './config/env.validation';
import { LoggerInterceptor } from './common/logger/logger.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { randomUUID } from 'crypto';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyHelmet from '@fastify/helmet';
import { IoAdapter } from '@nestjs/platform-socket.io';

const logger = new Logger();

export async function createApp(): Promise<any> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      requestIdHeader: false,
      genReqId: () => {
        const uuid = randomUUID();
        const timestamp = new Date().getTime().toString();
        return `${uuid}-${timestamp}`;
      },
    }),
  );

  // 🛡️ SÉCURITÉ COMPLÈTE

  // 0. Helmet - Headers de sécurité (CSP, X-Frame-Options, etc.)
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production' ? undefined : false,
  });

  // 1. Cookie Parser - Gestion sécurisée des cookies (validated at boot via validateEnv)
  await app.register(fastifyCookie as any, {
    secret: process.env.SESSION_SECRET,
  });

  // 2. Multipart support - Upload de fichiers
  await app.register(fastifyMultipart as any, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB max par fichier
      files: 5, // Nombre max de fichiers par requête
    },
  });

  // 4. CORS sécurisé - Configuration Fastify
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((url) => url.trim())
    : ['http://localhost:3002', 'http://localhost:3003'];
  await app.register(fastifyCors as any, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With',
    ],
    exposedHeaders: ['X-CSRF-Token'],
  });

  // 5. Validation renforcée - Protection des données
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 6. Global Exception Filter - Sanitisation des erreurs
  app.useGlobalFilters(new AllExceptionsFilter());

  // 7. Logging global
  app.useGlobalInterceptors(new LoggerInterceptor());

  // 8. Graceful shutdown
  app.enableShutdownHooks();

  // 9. WebSocket adapter (pour Fastify + Socket.io)
  app.useWebSocketAdapter(new IoAdapter(app));

  return app;
}

async function bootstrap() {
  // Validate required env vars before starting (fail fast)
  validateEnv();

  const app = await createApp();
  await app.listen(process.env.PORT, '0.0.0.0');
  logger.log(`Backend listening on port: ${process.env.PORT}`);
}

// Only start the server if we're not in test mode
if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
