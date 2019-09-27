import { action } from './action';
import { loadConfig } from './config';

async function main(): Promise<void> {
  await action(loadConfig());
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
