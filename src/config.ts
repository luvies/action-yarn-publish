import actionCore from '@actions/core';

export interface ActionConfig {
  packagePath: string;
  dryRun: string;
  skippedVersions: string;
}

export function loadConfig(): ActionConfig {
  return {
    packagePath: actionCore.getInput('package-path'),
    dryRun: actionCore.getInput('dry-run'),
    skippedVersions: actionCore.getInput('skipped-versions'),
  };
}
