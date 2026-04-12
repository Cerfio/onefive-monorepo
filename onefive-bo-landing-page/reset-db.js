import { migrate } from 'payload/dist/migrations/migrate';
import config from './src/payload.config';

const resetDB = async () => {
  console.log('Resetting database...');
  await migrate({
    config,
    reset: true,
  });
  console.log('Database reset completed');
  process.exit(0);
};

resetDB();
