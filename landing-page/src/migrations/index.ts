import * as migration_20260715_100752_baseline from './20260715_100752_baseline';

export const migrations = [
  {
    up: migration_20260715_100752_baseline.up,
    down: migration_20260715_100752_baseline.down,
    name: '20260715_100752_baseline'
  },
];
