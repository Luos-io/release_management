import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import semver from 'semver';

import * as releaseMangement from './index';

const initialVersion = '1.0.0';

describe('RELEASE', () => {
  let inSpy: jest.SpyInstance;
  let outSpy: jest.SpyInstance;
  let setFailedSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  let inputs = {} as any;
  let outputs = {} as any;

  beforeEach(() => {
    inSpy = jest.spyOn(core, 'getInput');
    inSpy.mockImplementation((name) => inputs[name]);

    outSpy = jest.spyOn(core, 'setOutput');
    outSpy.mockImplementation((name, value) => {
      outputs[name] = value;
    });

    setFailedSpy = jest.spyOn(core, 'setFailed');
    setFailedSpy.mockImplementation((message) => message);

    debugSpy = jest.spyOn(core, 'debug');
    debugSpy.mockImplementation(() => {});

    inputs = {};
    outputs = {};
    Object.defineProperty(github, 'context', {
      value: {},
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('Errors', () => {
    it(`Should return an error if 'package.json' is unavailable`, () => {
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) => '');

      releaseMangement.retrieveVersion();
      expect(setFailedSpy).toBeCalledWith('Could not read package.json');
    });

    it(`Should return an error if the 'source branch version' is lower or equal to current version`, () => {
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              head: { ref: `release/${initialVersion}` },
            },
          },
        },
      });

      releaseMangement.retrieveVersion();
      expect(setFailedSpy).toBeCalledWith(
        'New version is lower or equal to package version',
      );
    });
  });

  describe(`MAJOR`, () => {
    it(`TYPE / Should return a 'major' update to version 2.0.0`, () => {
      inputs['type'] = 'major';
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      releaseMangement.retrieveVersion();
      expect(semver.diff(initialVersion, outputs.version)).toBe('major');
      expect(outputs.version).toBe('2.0.0');
    });

    it(`BRANCH / Should return a 'major' update to version 2.0.0`, () => {
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              head: { ref: 'release/2.0.0' },
            },
          },
        },
      });

      releaseMangement.retrieveVersion();
      expect(semver.diff(initialVersion, outputs.version)).toBe('major');
      expect(outputs.version).toBe('2.0.0');
    });
  });

  describe(`MINOR`, () => {
    it(`TYPE / Should return a 'minor' update to version 1.1.0`, () => {
      inputs['type'] = 'minor';
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      releaseMangement.retrieveVersion();
      expect(semver.diff(initialVersion, outputs.version)).toBe('minor');
      expect(outputs.version).toBe('1.1.0');
    });

    it(`BRANCH / Should return a 'minor' update to version 1.1.0`, () => {
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              head: { ref: 'release/1.1.0' },
            },
          },
        },
      });

      releaseMangement.retrieveVersion();
      expect(semver.diff(initialVersion, outputs.version)).toBe('minor');
      expect(outputs.version).toBe('1.1.0');
    });
  });

  describe(`PATCH`, () => {
    it(`TYPE / Should return a 'patch' update to version 1.0.1`, () => {
      inputs['type'] = 'patch';
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      releaseMangement.retrieveVersion();
      expect(semver.diff(initialVersion, outputs.version)).toBe('patch');
      expect(outputs.version).toBe('1.0.1');
    });

    it(`BRANCH / RELEASE / Should return a 'patch' update to version 1.0.1`, () => {
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              head: { ref: 'release/1.0.1' },
            },
          },
        },
      });

      releaseMangement.retrieveVersion();
      expect(semver.diff(initialVersion, outputs.version)).toBe('patch');
      expect(outputs.version).toBe('1.0.1');
    });

    it(`BRANCH / DEFAULT / Should return a 'patch' update to version 1.0.1`, () => {
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              head: { ref: 'random-branch-name' },
            },
          },
        },
      });

      releaseMangement.retrieveVersion();
      expect(semver.diff(initialVersion, outputs.version)).toBe('patch');
      expect(outputs.version).toBe('1.0.1');
    });
  });

  describe(`RC`, () => {
    it(`TYPE / Should return a 'rc' update to version 1.0.1-rc.0`, () => {
      inputs['type'] = 'rc';
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      releaseMangement.retrieveVersion();
      expect(semver.diff(initialVersion, outputs.version)).toBe('prepatch');
      expect(outputs.version).toBe('1.0.1-rc.0');
    });

    it(`BRANCH / Should return a 'rc' update to version 1.0.1-rc.0`, () => {
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((_path, _options) =>
          JSON.stringify({ version: initialVersion }),
        );

      Object.defineProperty(github, 'context', {
        value: {
          payload: {
            pull_request: {
              head: { ref: 'release/1.0.1-rc.0' },
            },
          },
        },
      });

      releaseMangement.retrieveVersion();
      expect(semver.diff(initialVersion, outputs.version)).toBe('prepatch');
      expect(outputs.version).toBe('1.0.1-rc.0');
    });
  });
});
