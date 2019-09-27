import childProcess from 'child_process';
import fs from 'fs';
import util from 'util';

export const exec = util.promisify(childProcess.exec);

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
