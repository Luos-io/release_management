import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import semver from 'semver';

export function retrieveSourceBranchVersion() {
  const sourceBranchName = github.context.payload?.pull_request?.head?.ref;
  if (sourceBranchName) {
    const matchPattern = sourceBranchName.match(
      /^release\/(\d+\.\d+\.\d+(-rc\.\d)*)$/,
    );
    if (matchPattern && matchPattern.length >= 2) {
      return semver.valid(matchPattern[1]);
    }
  }

  return null;
}

export function retrievePackageVersion() {
  try {
    return semver.valid(
      JSON.parse(fs.readFileSync('package.json', 'utf8')).version,
    );
  } catch (err) {
    return null;
  }
}

export function retrieveVersion() {
  try {
    core.debug(`Starting 'Release Management' action...`);

    const version = retrievePackageVersion();
    if (!version) {
      core.setFailed('Could not read package.json');
    } else {
      core.debug(`Current version: ${version}`);

      const sourceBranchVersion = retrieveSourceBranchVersion();
      const type = core.getInput('type');
      if (!sourceBranchVersion) {
        core.warning(
          `Could not retrieve source branch version, using 'type' input value ('${type}')...`,
        );
        switch (type) {
          case 'major':
          case 'minor':
          case 'patch':
            core.setOutput('version', semver.inc(version, type));
            break;
          case 'rc':
            core.setOutput('version', semver.inc(version, 'prerelease', 'rc'));
            break;
          default:
            core.warning(
              `Unknown type: '${type}' (expected: 'major', 'minor', 'patch' or 'rc'), falling back to patch...`,
            );
            core.setOutput('version', semver.inc(version, 'patch'));
        }
      } else {
        core.debug(`Source branch version: ${sourceBranchVersion}`);
        if (semver.lte(sourceBranchVersion, version)) {
          core.setFailed('New version is lower or equal to package version');
        } else {
          core.setOutput('version', sourceBranchVersion);
        }
      }
    }
  } catch (err) {
    core.setFailed((err as Error).message);
  }
}

retrieveVersion();
