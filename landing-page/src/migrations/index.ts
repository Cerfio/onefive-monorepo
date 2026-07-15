import * as migration_20260715_100752_baseline from './20260715_100752_baseline';
import * as migration_20260715_115535_add_jobs from './20260715_115535_add_jobs';

export const migrations = [
  {
    up: migration_20260715_100752_baseline.up,
    down: migration_20260715_100752_baseline.down,
    name: '20260715_100752_baseline',
  },
  {
    up: migration_20260715_115535_add_jobs.up,
    down: migration_20260715_115535_add_jobs.down,
    name: '20260715_115535_add_jobs'
  },
];
