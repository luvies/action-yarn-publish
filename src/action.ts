import * as semver from 'semver';
import { ActionConfig } from './config';
import { ExecFn, execFactory, fileExists, readAll } from './util';
import path from 'path';

interface PackageJson {
  name: string;
  version: string;
}

interface YarnInfo {
  type: 'inspect' | 'error';
  data: string[];
}

interface ShouldPublishArgs {
  version: string;
  skippedVersions: string;
  info: YarnInfo;
}

function shouldPublish({
  version,
  skippedVersions,
  info,
}: ShouldPublishArgs): { should: true } | { should: false; reason: string } {
  if (skippedVersions && semver.satisfies(version, skippedVersions)) {
    return { should: false, reason: 'Version is within skipped versions range' };
  }

  if (info.type === 'error') {
    return { should: true };
  }

  if (info.data.includes(version)) {
    return { should: false, reason: 'Version already published' };
  }

  return { should: true };
}

interface PublishArgs {
  version: string;
  exec: ExecFn;
  dryRun: boolean;
  skipGitTag: boolean;
}

async function publish({ version, exec, dryRun, skipGitTag }: PublishArgs): Promise<void> {
  if (!dryRun) {
    await exec('yarn publish --not-interactive');
  } else {
    console.log(`[DRY RUN] Would have published version ${version} to registry`);
  }

  if (skipGitTag) {
    const tag = `v${version}`;
    if (!dryRun) {
      await exec(`git tag -a ${tag}`);
    } else {
      const commitHash = await exec('git rev-parse --short HEAD');
      console.log(`[DRY RUN] Would have tagged commit ${commitHash} with tag ${tag}`);
    }
  } else {
    console.log('Skipped git tagging');
  }
}

export async function action({
  packagePath,
  dryRun,
  skippedVersions,
  skipGitTag,
}: ActionConfig): Promise<void> {
  const cwd = packagePath ? path.resolve(packagePath) : process.cwd();
  const pkgPath = path.resolve(cwd, 'package.json');

  if (!(await fileExists(pkgPath))) {
    throw new Error(`Package.json at ${pkgPath} cannot be accessed`);
  }

  const exec = execFactory(cwd);

  const pkgRaw = await readAll(pkgPath);
  const pkg: PackageJson = JSON.parse(pkgRaw);

  const version = semver.valid(pkg.version);
  if (!version) {
    throw new Error(`Version ${version} is not a valid semver string`);
  }

  const yarnInfoRaw = await exec(`yarn info ${pkg.name} versions --json`);
  const yarnInfo: YarnInfo = JSON.parse(yarnInfoRaw);

  const result = shouldPublish({ version, skippedVersions, info: yarnInfo });

  if (result.should) {
    await publish({
      version,
      exec,
      dryRun,
      skipGitTag,
    });
  } else {
    console.log(`Skipping publish, reason: ${result.reason}`);
  }
}
