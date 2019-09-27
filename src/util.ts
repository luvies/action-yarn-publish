import childProcess from 'child_process';
import fs from 'fs';
import util from 'util';

const exec = util.promisify(childProcess.exec);

export type ExecFn = (command: string) => Promise<string>;

export function execFactory(cwd: string): ExecFn {
  return (command: string) => exec(command, { cwd }).then(({ stdout }) => stdout);
}

const readFile = util.promisify(fs.readFile);

export async function readAll(path: string): Promise<string> {
  const data = await readFile(path);
  return data.toString('utf8');
}

const access = util.promisify(fs.access);

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
