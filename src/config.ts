import actionCore from '@actions/core';

export interface ActionConfig {
  packagePath: string;
  dryRun: boolean;
  skippedVersions: string;
  skipGitTag: boolean;
}

function getBoolInput(name: string, def: string): boolean {
  const val = actionCore.getInput(name) || def;

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
    packagePath: actionCore.getInput('package-path'),
    dryRun: getBoolInput('dry-run', 'false'),
    skippedVersions: actionCore.getInput('skipped-versions').trim(),
    skipGitTag: getBoolInput('skip-git-tag', 'false'),
  };
}
