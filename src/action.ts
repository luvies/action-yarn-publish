import { ActionConfig } from './config';
import { fileExists, readAll } from './util';
import path from 'path';

interface PackageJson {
  name: string;
  version: string;
}

const packageJsonName = 'package.json';

export async function action(cnf: ActionConfig): Promise<void> {
  const cwd = cnf.packagePath ? path.resolve(cnf.packagePath) : process.cwd();
  const pkgPath = path.resolve(cwd, packageJsonName);

  if (!(await fileExists(pkgPath))) {
    throw new Error(`Package.json at ${pkgPath} cannot be accessed`);
  }

  const pkgRaw = await readAll(pkgPath);
  const pkg: PackageJson = JSON.parse(pkgRaw);

  console.log(pkg.name, pkg.version);
}
