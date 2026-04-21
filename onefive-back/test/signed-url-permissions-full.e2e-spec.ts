/**
 * Signed URL handler — permission matrix complete :
 * 1. Groupe hasAllAccess → bypass permissions par catégorie
 * 2. Groupe sans hasAllAccess → doit matcher PermissionCategory.canView / canDownload
 * 3. Outsider (non-membre) → 403 via DataroomMemberGuard
 * 4. File inexistant → 404
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
import { installMocks } from './helpers/mocks';

describe('Signed URL permissions — full matrix', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  async function seedDataroomWithFile(
    ownerToken: string,
    ownerProfileId: string,
  ) {
    const dr = await createDataroomForUser(
      app,
      request,
      { token: ownerToken, profileId: ownerProfileId },
      { prisma },
    );
    if (!dr.dataroomId) throw new Error('dataroom not created');
    const dataroomId = dr.dataroomId;

    const category = await prisma.category.create({
      data: {
        name: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        dataroomId,
        createdBy: ownerProfileId,
      },
    });

    const file = await prisma.dataroomFile.create({
      data: {
        dataroomId,
        name: 'pitch.pdf',
        size: 1024,
        mimetype: 'application/pdf',
        storageId: `storage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        categoryId: category.id,
        uploadedBy: ownerProfileId,
      },
    });

    return { dataroomId, categoryId: category.id, fileId: file.id };
  }

  it('owner (group hasAllAccess) can always get signed URL', async () => {
    const owner = await createAuthenticatedUser(app, request, 'suf-owner');
    const { dataroomId, fileId } = await seedDataroomWithFile(
      owner.token,
      owner.profileId,
    );

    const res = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}/file/${fileId}/signed-url?action=view`)
      .set('Cookie', `token=${owner.token}`);

    expect([200, 201]).toContain(res.status);
    expect(res.body.data?.url).toBeTruthy();
  });

  it('outsider (non-member) → 403 from DataroomMemberGuard', async () => {
    const owner = await createAuthenticatedUser(app, request, 'suf-owner2');
    const outsider = await createAuthenticatedUser(app, request, 'suf-outsider');
    const { dataroomId, fileId } = await seedDataroomWithFile(
      owner.token,
      owner.profileId,
    );

    const res = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}/file/${fileId}/signed-url`)
      .set('Cookie', `token=${outsider.token}`);

    expect(res.status).toBe(403);
  });

  it('member without explicit category view permission → 403', async () => {
    const owner = await createAuthenticatedUser(app, request, 'suf-owner3');
    const member = await createAuthenticatedUser(
      app,
      request,
      'suf-member-restricted',
    );
    const { dataroomId, fileId } = await seedDataroomWithFile(
      owner.token,
      owner.profileId,
    );

    const restrictedGroup = await prisma.dataroomGroup.create({
      data: {
        name: 'Read-restricted',
        dataroomId,
        type: 'CUSTOM',
        createdBy: owner.profileId,
        hasAllAccess: false,
        canUpload: false,
        canShare: false,
        canManageUsers: false,
        canManageGroups: false,
      },
    });

    await prisma.member.create({
      data: {
        dataroomId,
        profileId: member.profileId,
        groupId: restrictedGroup.id,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}/file/${fileId}/signed-url?action=view`)
      .set('Cookie', `token=${member.token}`);

    expect(res.status).toBe(403);
  });

  it('member with canView but not canDownload → view OK, download 403', async () => {
    const owner = await createAuthenticatedUser(app, request, 'suf-owner4');
    const member = await createAuthenticatedUser(app, request, 'suf-view-only');
    const { dataroomId, categoryId, fileId } = await seedDataroomWithFile(
      owner.token,
      owner.profileId,
    );

    const group = await prisma.dataroomGroup.create({
      data: {
        name: 'View-only',
        dataroomId,
        type: 'CUSTOM',
        createdBy: owner.profileId,
        hasAllAccess: false,
        canUpload: false,
        canShare: false,
        canManageUsers: false,
        canManageGroups: false,
      },
    });
    await prisma.permissionCategory.create({
      data: {
        categoryId,
        groupId: group.id,
        canView: true,
        canDownload: false,
        canComment: false,
        givenBy: owner.profileId,
      },
    });
    await prisma.member.create({
      data: { dataroomId, profileId: member.profileId, groupId: group.id },
    });

    const viewRes = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}/file/${fileId}/signed-url?action=view`)
      .set('Cookie', `token=${member.token}`);
    expect([200, 201]).toContain(viewRes.status);

    const dlRes = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}/file/${fileId}/signed-url?action=download`)
      .set('Cookie', `token=${member.token}`);
    expect(dlRes.status).toBe(403);
  });

  it('non-existent fileId under an owned dataroom → 403 or 404', async () => {
    const owner = await createAuthenticatedUser(app, request, 'suf-owner5');
    const { dataroomId } = await seedDataroomWithFile(owner.token, owner.profileId);

    const res = await request(app.getHttpServer())
      .get(
        `/dataroom/${dataroomId}/file/00000000-0000-0000-0000-000000000000/signed-url`,
      )
      .set('Cookie', `token=${owner.token}`);

    expect([403, 404]).toContain(res.status);
  });
});
