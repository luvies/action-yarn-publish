import * as actionsCore from '@actions/core';
import * as semver from 'semver';
import { ActionConfig } from './config';
import { ExecFn, execFactory, fileExists, readAll } from './util';
import fetch from 'node-fetch';
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
  githubToken: string | undefined;
  githubRepository: string | undefined;
}

async function publish({
  version,
  exec,
  dryRun,
  skipGitTag,
  githubToken,
  githubRepository,
}: PublishArgs): Promise<void> {
  if (!skipGitTag) {
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN is unset, cannot create git tag without github token');
    }

    if (!githubRepository) {
      throw new Error(
        'GITHUB_REPOSITORY missing from envrionment (check that the default envrionment variables are not being overwritten)',
      );
    }
  }

  if (!dryRun) {
    await exec('yarn publish --not-interactive');
  } else {
    actionsCore.info(`[DRY RUN] Would have published version ${version} to registry`);
  }

  if (!skipGitTag) {
    const [longHash, shortHash] = await Promise.all([
      exec('git rev-parse HEAD').then(h => h.trim()),
      exec('git rev-parse --short HEAD').then(h => h.trim()),
    ]);
    const tag = `v${version}`;
    if (!dryRun) {
      const res = await fetch(`https://api.github.com/repos/${githubRepository}/git/refs`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${githubToken}`,
        },
        body: JSON.stringify({
          ref: `refs/tags/${tag}`,
          sha: longHash,
        }),
      });

      if (!res.ok) {
        throw new Error(
          `Failed to tag commit ${shortHash}, reason: (${res.status}) ${await res.text()}`,
        );
      }
    } else {
      actionsCore.info(`[DRY RUN] Would have tagged commit ${shortHash} with tag ${tag}`);
    }
  } else {
    actionsCore.info('Skipped git tagging');
  }
}

export async function action({
  packagePath,
  dryRun,
  skippedVersions,
  skipGitTag,
  githubToken,
  githubRepository,
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
      githubToken,
      githubRepository,
    });
  } else {
    actionsCore.info(`Skipping publish, reason: ${result.reason}`);
  }
}
