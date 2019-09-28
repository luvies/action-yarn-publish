import actionsCore from '@actions/core';

export interface ActionConfig {
  // Action config.
  packagePath: string;
  dryRun: boolean;
  skippedVersions: string;
  skipGitTag: boolean;

  // Env vars.
  githubToken: string | undefined; // Given by user.
  githubRepository: string | undefined; // Default env var by github.
}

function getBoolInput(name: string, def: string): boolean {
  const val = actionsCore.getInput(name) || def;

  switch (val) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      throw new Error(
        `Value of ${val} for input ${name} is not valid (value has to be either 'true' or 'false')`,
      );
  }
}

export function loadConfig(): ActionConfig {
  return {
    packagePath: actionsCore.getInput('package-path'),
    dryRun: getBoolInput('dry-run', 'false'),
    skippedVersions: actionsCore.getInput('skipped-versions').trim(),
    skipGitTag: getBoolInput('skip-git-tag', 'false'),
    githubToken: process.env.GITHUB_TOKEN || undefined,
    githubRepository: process.env.GITHUB_REPOSITORY || undefined,
  };
}
