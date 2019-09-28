import * as actionsCore from '@actions/core';
import { action } from './action';
import { loadConfig } from './config';

async function main(): Promise<void> {
  await action(loadConfig());
}

main().catch(err => {
  actionsCore.error(err);
  process.exit(1);
});
