import * as migration_20260715_100752_baseline from './20260715_100752_baseline';
import * as migration_20260715_115535_add_jobs from './20260715_115535_add_jobs';
import * as migration_20260715_165956_fix_resume_relation from './20260715_165956_fix_resume_relation';

export const migrations = [
  {
    up: migration_20260715_100752_baseline.up,
    down: migration_20260715_100752_baseline.down,
    name: '20260715_100752_baseline',
  },
  {
    up: migration_20260715_115535_add_jobs.up,
    down: migration_20260715_115535_add_jobs.down,
    name: '20260715_115535_add_jobs',
  },
  {
    up: migration_20260715_165956_fix_resume_relation.up,
    down: migration_20260715_165956_fix_resume_relation.down,
    name: '20260715_165956_fix_resume_relation'
  },
];
