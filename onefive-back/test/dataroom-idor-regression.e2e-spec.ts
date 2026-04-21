/**
 * Non-regression tests for the dataroom IDOR fixes (commit 7ef9ae8).
 *
 * Before the fix, UploadFileController / DataroomGroupController /
 * DataroomGroupPermissionController / DataroomInvitationController enforced
 * only SessionGuard, letting any authenticated user act on any dataroom.
 * FileHandler.get/update/delete also allowed cross-dataroom file access.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';
import { createDataroomForUser } from './helpers/flow-helpers';
import { installMocks, ExternalCallMocks } from './helpers/mocks';

describe('Dataroom IDOR — non-regression', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let mocks: ExternalCallMocks;

  // Two datarooms with distinct owners + one outsider (no dataroom membership)
  let aliceOwner: { token: string; profileId: string; userId: string; email: string };
  let bobOwner: { token: string; profileId: string; userId: string; email: string };
  let outsider: { token: string; profileId: string; userId: string; email: string };
  let aliceDataroomId: string;
  let bobDataroomId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    mocks = installMocks(app);

    aliceOwner = await createAuthenticatedUser(app, request, 'alice-dr');
    bobOwner = await createAuthenticatedUser(app, request, 'bob-dr');
    outsider = await createAuthenticatedUser(app, request, 'outsider-dr');

    const aliceDr = await createDataroomForUser(app, request, aliceOwner, { prisma });
    const bobDr = await createDataroomForUser(app, request, bobOwner, { prisma });
    if (!aliceDr.dataroomId || !bobDr.dataroomId) {
      throw new Error('dataroom creation failed — ensure startup creation works in test mode');
    }
    aliceDataroomId = aliceDr.dataroomId;
    bobDataroomId = bobDr.dataroomId;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('outsider cannot GET another user dataroom (DataroomMemberGuard)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/dataroom/${aliceDataroomId}`)
      .set('Cookie', `token=${outsider.token}`);
    expect(res.status).toBe(403);
  });

  it('outsider cannot POST file upload to another user dataroom', async () => {
    // Upload route is multipart. With no body, we expect 403 BEFORE reaching
    // the multipart parsing (guard runs first), not a 400 on missing file.
    const res = await request(app.getHttpServer())
      .post(`/dataroom/${aliceDataroomId}/file`)
      .set('Cookie', `token=${outsider.token}`)
      .set('Content-Type', 'multipart/form-data; boundary=----test')
      .send('');
    expect(res.status).toBe(403);
  });

  it('outsider cannot create a group on another user dataroom (DataroomMemberGuard + DataroomOwnerGuard)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/dataroom/${aliceDataroomId}/group`)
      .set('Cookie', `token=${outsider.token}`)
      .send({ name: 'hack', hasAllAccess: true, canUpload: true, canShare: true, canManageUsers: true, canManageGroups: true });
    expect(res.status).toBe(403);
  });

  it('outsider cannot create invitation on another user dataroom (DataroomOwnerGuard)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/dataroom/${aliceDataroomId}/invitation`)
      .set('Cookie', `token=${outsider.token}`)
      .send({
        groupId: 'irrelevant',
        profileId: outsider.profileId,
        newUser: { email: 'x@y.z', firstname: 'x', lastname: 'y', dataroomName: 'z' },
      });
    expect(res.status).toBe(403);
  });

  it('FileController list (GET /dataroom/files?dataroomId=X) enforces membership', async () => {
    const res = await request(app.getHttpServer())
      .get(`/dataroom/files?dataroomId=${aliceDataroomId}`)
      .set('Cookie', `token=${outsider.token}`);
    expect(res.status).toBe(403);
  });

  it('removed dead mutation routes on /dataroom/files return 404', async () => {
    // The legacy FileController exposed GET/PUT/DELETE /dataroom/files/:id
    // with no dataroomId in the URL, so the guard could not scope them.
    // Those routes were removed; they must now 404.
    const legacyGet = await request(app.getHttpServer())
      .get(`/dataroom/files/some-fake-id`)
      .set('Cookie', `token=${aliceOwner.token}`);
    expect(legacyGet.status).toBe(404);

    const legacyDelete = await request(app.getHttpServer())
      .delete(`/dataroom/files/some-fake-id`)
      .set('Cookie', `token=${aliceOwner.token}`);
    expect(legacyDelete.status).toBe(404);
  });

  it('no external calls triggered by rejected requests', async () => {
    // Quick sanity: even when outsider hammers, nothing leaks.
    // (Mocks were cleared by previous tests' resetMocks — not used here but
    // still assert the rejected requests didn't fire emails.)
    const emailBefore = mocks.email.mock.calls.length;

    await request(app.getHttpServer())
      .get(`/dataroom/${aliceDataroomId}`)
      .set('Cookie', `token=${outsider.token}`);

    await request(app.getHttpServer())
      .post(`/dataroom/${aliceDataroomId}/invitation`)
      .set('Cookie', `token=${outsider.token}`)
      .send({});

    expect(mocks.email.mock.calls.length).toBe(emailBefore);
  });
});
