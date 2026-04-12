import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';
import { createDataroomForUser } from './helpers/flow-helpers';

describe('Signed URL Permissions (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let owner: { token: string; profileId: string };
  let nonMemberToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    owner = await createAuthenticatedUser(app, request, 'signed-owner');
    const nonMember = await createAuthenticatedUser(
      app,
      request,
      'signed-nonmem',
    );
    nonMemberToken = nonMember.token;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('requires auth for signed URL endpoint', async () => {
    const unauthRes = await request(app.getHttpServer()).get(
      '/dataroom/00000000-0000-0000-0000-000000000000/file/00000000-0000-0000-0000-000000000001/signed-url',
    );
    expect(unauthRes.status).toBe(401);
  });

  it('non-member receives 403 when requesting signed URL for file in dataroom', async () => {
    const { dataroomId } = await createDataroomForUser(app, request, owner, {
      prisma: context.prisma,
    });
    expect(dataroomId).toBeDefined();

    const categoryRes = await request(app.getHttpServer())
      .post(`/dataroom/${dataroomId}/category`)
      .set('Cookie', `token=${owner.token}`)
      .send({ name: 'Test Category' });
    expect([200, 201]).toContain(categoryRes.statusCode);
    const categoryId = categoryRes.body.data?.id;
    expect(categoryId).toBeDefined();

    const file = await context.prisma.dataroomFile.create({
      data: {
        dataroomId: dataroomId!,
        categoryId,
        uploadedBy: owner.profileId,
        name: 'test-file.pdf',
        size: 1024,
        mimetype: 'application/pdf',
        storageId: `storage-${Date.now()}`,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}/file/${file.id}/signed-url?action=view`)
      .set('Cookie', `token=${nonMemberToken}`);

    expect(res.status).toBe(403);
  });
});
