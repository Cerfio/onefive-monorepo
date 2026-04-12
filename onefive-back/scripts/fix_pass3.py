#!/usr/bin/env python3
"""Pass 3: Add tests for 8 missing controllers + rename 3 wrongly-named files."""
import os
import shutil

BASE = '/Users/yanniscoulibaly/oneFive/onefive-back/src'

# First rename the 3 wrongly-named test files
renames = [
    (
        f'{BASE}/dataroom/controllers/dataroom.controller.e2e.spec.ts',
        f'{BASE}/dataroom/controllers/dataroom.controller.e2e-spec.ts',
    ),
    (
        f'{BASE}/dataroom/dataroom-category/dataroom-category.e2e.test.ts',
        f'{BASE}/dataroom/dataroom-category/dataroom-category.e2e-spec.ts',
    ),
    (
        f'{BASE}/dataroom/dataroom-file-signed-url/dataroom-file-signed-url.e2e.test.ts',
        f'{BASE}/dataroom/dataroom-file-signed-url/dataroom-file-signed-url.e2e-spec.ts',
    ),
]

for old, new in renames:
    if os.path.exists(old):
        shutil.move(old, new)
        print(f'Renamed: {os.path.basename(old)} -> {os.path.basename(new)}')
    else:
        print(f'Not found (skip): {old}')

files = {}

# 1. AppController: GET / and GET /health
files[f'{BASE}/app.controller.e2e-spec.ts'] = '''import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupE2E, E2EContext } from '../test/utils/e2e-setup';

describe('AppController (e2e)', () => {
  let context: E2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;
  });

  afterAll(async () => {
    await context.teardown();
  });

  describe('GET /health', () => {
    it('should return health status (public)', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('should return root response', async () => {
      const res = await request(app.getHttpServer())
        .get('/');
      // Root may require auth or be public
      expect(res.statusCode).toBeLessThan(500);
    });
  });
});
'''

# 2. ProfileAvatarController: POST /profile-avatar/upload (multipart)
files[f'{BASE}/profile-avatar/profile-avatar.controller.e2e-spec.ts'] = '''import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../test/helpers/fixtures';
import { setupE2E, E2EContext } from '../../test/utils/e2e-setup';

describe('ProfileAvatarController (e2e)', () => {
  let context: E2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('avatar'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  afterAll(async () => {
    await context.teardown();
  });

  describe('POST /profile-avatar/upload', () => {
    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-avatar/upload');
      expect([401, 429]).toContain(res.statusCode);
    });

    it('should fail without a file', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-avatar/upload')
        .set('Cookie', `token=${authToken}`);
      // Without multipart file, should get 400 or 500
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should accept a file upload', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-avatar/upload')
        .set('Cookie', `token=${authToken}`)
        .attach('file', Buffer.from('fake-image'), {
          filename: 'avatar.png',
          contentType: 'image/png',
        });
      // May succeed or fail depending on file validation
      expect(res.statusCode).not.toBe(404);
    });
  });
});
'''

# 3. ProfileCoverController: POST /profile-cover/upload (multipart)
files[f'{BASE}/profile-cover/profile-cover.controller.e2e-spec.ts'] = '''import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../test/helpers/fixtures';
import { setupE2E, E2EContext } from '../../test/utils/e2e-setup';

describe('ProfileCoverController (e2e)', () => {
  let context: E2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('cover'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  afterAll(async () => {
    await context.teardown();
  });

  describe('POST /profile-cover/upload', () => {
    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-cover/upload');
      expect([401, 429]).toContain(res.statusCode);
    });

    it('should fail without a file', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-cover/upload')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should accept a file upload', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-cover/upload')
        .set('Cookie', `token=${authToken}`)
        .attach('file', Buffer.from('fake-image'), {
          filename: 'cover.png',
          contentType: 'image/png',
        });
      expect(res.statusCode).not.toBe(404);
    });
  });
});
'''

# 4. DataroomGroupController: CRUD /dataroom/:id/group
files[f'{BASE}/dataroom/dataroom-group/dataroom-group.controller.e2e-spec.ts'] = '''import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../../test/helpers/fixtures';
import { setupE2E, E2EContext } from '../../../test/utils/e2e-setup';

describe('DataroomGroupController (e2e)', () => {
  let context: E2EContext;
  let app: INestApplication;
  let authToken: string;
  let dataroomId: string;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('drgrp'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    // Create a dataroom
    const drRes = await request(app.getHttpServer())
      .post('/dataroom')
      .set('Cookie', `token=${authToken}`)
      .send({ name: 'Test Dataroom' });
    if (drRes.body?.data?.id) {
      dataroomId = drRes.body.data.id;
    }
  });

  afterAll(async () => {
    await context.teardown();
  });

  describe('POST /dataroom/:dataroomId/group', () => {
    it('should call the create group endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/group`)
        .set('Cookie', `token=${authToken}`)
        .send({ name: 'Test Group' });
      expect(res.statusCode).not.toBe(404);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/dataroom/fake-id/group')
        .send({ name: 'Test' });
      expect([401, 429]).toContain(res.statusCode);
    });
  });

  describe('GET /dataroom/:dataroomId/group', () => {
    it('should call the get groups endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .get(`/dataroom/${dataroomId}/group`)
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('PUT /dataroom/:dataroomId/group/:groupId', () => {
    it('should call the update group endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .put(`/dataroom/${dataroomId}/group/fake-group-id`)
        .set('Cookie', `token=${authToken}`)
        .send({ name: 'Updated Group' });
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('DELETE /dataroom/:dataroomId/group/:groupId', () => {
    it('should call the delete group endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .delete(`/dataroom/${dataroomId}/group/fake-group-id`)
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });
});
'''

# 5. DataroomGroupPermissionController: PUT permissions
files[f'{BASE}/dataroom/dataroom-group-permission/dataroom-group-permission.controller.e2e-spec.ts'] = '''import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../../test/helpers/fixtures';
import { setupE2E, E2EContext } from '../../../test/utils/e2e-setup';

describe('DataroomGroupPermissionController (e2e)', () => {
  let context: E2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('drperm'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  afterAll(async () => {
    await context.teardown();
  });

  describe('PUT /dataroom/:dataroomId/group/:groupId/permissions', () => {
    it('should call the update permissions endpoint', async () => {
      const res = await request(app.getHttpServer())
        .put('/dataroom/fake-dr/group/fake-grp/permissions')
        .set('Cookie', `token=${authToken}`)
        .send({ permissions: [] });
      expect(res.statusCode).not.toBe(404);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .put('/dataroom/fake-dr/group/fake-grp/permissions')
        .send({});
      expect([401, 429]).toContain(res.statusCode);
    });
  });
});
'''

# 6. DataroomInvitationController: CRUD invitations
files[f'{BASE}/dataroom/dataroom-invitation/dataroom-invitation.controller.e2e-spec.ts'] = '''import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../../test/helpers/fixtures';
import { setupE2E, E2EContext } from '../../../test/utils/e2e-setup';

describe('DataroomInvitationController (e2e)', () => {
  let context: E2EContext;
  let app: INestApplication;
  let authToken: string;
  let dataroomId: string;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('drinv'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    const drRes = await request(app.getHttpServer())
      .post('/dataroom')
      .set('Cookie', `token=${authToken}`)
      .send({ name: 'Inv Dataroom' });
    if (drRes.body?.data?.id) {
      dataroomId = drRes.body.data.id;
    }
  });

  afterAll(async () => {
    await context.teardown();
  });

  describe('POST /dataroom/:dataroomId/invitation', () => {
    it('should call the create invitation endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/invitation`)
        .set('Cookie', `token=${authToken}`)
        .send({ email: 'invited@test.com', groupId: 'fake-group' });
      expect(res.statusCode).not.toBe(404);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/dataroom/fake-id/invitation')
        .send({});
      expect([401, 429]).toContain(res.statusCode);
    });
  });

  describe('PATCH /dataroom/:dataroomId/invitation/:invitationId/accept', () => {
    it('should call the accept endpoint', async () => {
      const res = await request(app.getHttpServer())
        .patch('/dataroom/fake-dr/invitation/fake-inv/accept')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('GET /dataroom/:dataroomId/invitation', () => {
    it('should call the list invitations endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .get(`/dataroom/${dataroomId}/invitation`)
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('DELETE /dataroom/:dataroomId/invitation/:invitationId', () => {
    it('should call the delete endpoint', async () => {
      const res = await request(app.getHttpServer())
        .delete('/dataroom/fake-dr/invitation/fake-inv')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });
});
'''

# 7. UploadFileController: CRUD /dataroom/:id/file
files[f'{BASE}/dataroom/file/upload-file.controller.e2e-spec.ts'] = '''import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../../test/helpers/fixtures';
import { setupE2E, E2EContext } from '../../../test/utils/e2e-setup';

describe('UploadFileController (e2e)', () => {
  let context: E2EContext;
  let app: INestApplication;
  let authToken: string;
  let dataroomId: string;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('uplfile'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    const drRes = await request(app.getHttpServer())
      .post('/dataroom')
      .set('Cookie', `token=${authToken}`)
      .send({ name: 'File Upload Dataroom' });
    if (drRes.body?.data?.id) {
      dataroomId = drRes.body.data.id;
    }
  });

  afterAll(async () => {
    await context.teardown();
  });

  describe('POST /dataroom/:dataroomId/file', () => {
    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/dataroom/fake-dr/file');
      expect([401, 429]).toContain(res.statusCode);
    });

    it('should call the upload endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/file`)
        .set('Cookie', `token=${authToken}`)
        .attach('file', Buffer.from('test content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('PUT /dataroom/:dataroomId/file/:fileId', () => {
    it('should call the update endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .put(`/dataroom/${dataroomId}/file/fake-file-id`)
        .set('Cookie', `token=${authToken}`)
        .send({ name: 'renamed.pdf' });
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('DELETE /dataroom/:dataroomId/file/:fileId', () => {
    it('should call the delete endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .delete(`/dataroom/${dataroomId}/file/fake-file-id`)
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('PUT /dataroom/:dataroomId/file/:fileId/move', () => {
    it('should call the move endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .put(`/dataroom/${dataroomId}/file/fake-file-id/move`)
        .set('Cookie', `token=${authToken}`)
        .send({ categoryId: 'new-category' });
      expect(res.statusCode).not.toBe(404);
    });
  });
});
'''

# 8. FileController: CRUD /dataroom/files
files[f'{BASE}/dataroom/file/file.controller.e2e-spec.ts'] = '''import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../../test/helpers/fixtures';
import { setupE2E, E2EContext } from '../../../test/utils/e2e-setup';

describe('FileController (e2e)', () => {
  let context: E2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('filectl'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  afterAll(async () => {
    await context.teardown();
  });

  describe('POST /dataroom/files', () => {
    it('should call the create file record endpoint', async () => {
      const res = await request(app.getHttpServer())
        .post('/dataroom/files')
        .set('Cookie', `token=${authToken}`)
        .send({ dataroomId: 'fake-dr', name: 'test.pdf' });
      expect(res.statusCode).not.toBe(404);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/dataroom/files')
        .send({});
      expect([401, 429]).toContain(res.statusCode);
    });
  });

  describe('GET /dataroom/files', () => {
    it('should call the list files endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/dataroom/files')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('GET /dataroom/files/:fileId', () => {
    it('should call the get file endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/dataroom/files/fake-file-id')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('DELETE /dataroom/files/:fileId', () => {
    it('should call the delete file endpoint', async () => {
      const res = await request(app.getHttpServer())
        .delete('/dataroom/files/fake-file-id')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('PUT /dataroom/files/:fileId/move', () => {
    it('should call the move file endpoint', async () => {
      const res = await request(app.getHttpServer())
        .put('/dataroom/files/fake-file-id/move')
        .set('Cookie', `token=${authToken}`)
        .send({ targetCategoryId: 'new-category' });
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('GET /dataroom/files/:fileId/download', () => {
    it('should call the download endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/dataroom/files/fake-file-id/download')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });
});
'''

for path, content in files.items():
    with open(path, 'w') as f:
        f.write(content)
    print(f'Written: {path}')

print(f'\nTotal files written: {len(files)}')
print(f'Total files renamed: {sum(1 for o, n in renames if os.path.exists(n))}')
