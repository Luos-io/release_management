"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = __importStar(require("@actions/core"));
var github = __importStar(require("@actions/github"));
var fs_1 = __importDefault(require("fs"));
var semver_1 = __importDefault(require("semver"));
var releaseMangement = __importStar(require("./index"));
var initialVersion = '1.0.0';
describe('RELEASE', function () {
    var inSpy;
    var outSpy;
    var setFailedSpy;
    var debugSpy;
    var inputs = {};
    var outputs = {};
    beforeEach(function () {
        inSpy = jest.spyOn(core, 'getInput');
        inSpy.mockImplementation(function (name) { return inputs[name]; });
        outSpy = jest.spyOn(core, 'setOutput');
        outSpy.mockImplementation(function (name, value) {
            outputs[name] = value;
        });
        setFailedSpy = jest.spyOn(core, 'setFailed');
        setFailedSpy.mockImplementation(function (message) { return message; });
        debugSpy = jest.spyOn(core, 'debug');
        debugSpy.mockImplementation(function () { });
        inputs = {};
        outputs = {};
        Object.defineProperty(github, 'context', {
            value: {},
        });
    });
    afterEach(function () {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });
    describe('Errors', function () {
        it("Should return an error if 'package.json' is unavailable", function () {
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) { return ''; });
            releaseMangement.retrieveVersion();
            expect(setFailedSpy).toBeCalledWith('Could not read package.json');
        });
        it("Should return an error if the 'source branch version' is lower or equal to current version", function () {
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
            Object.defineProperty(github, 'context', {
                value: {
                    payload: {
                        pull_request: {
                            head: { ref: "release/".concat(initialVersion) },
                        },
                    },
                },
            });
            releaseMangement.retrieveVersion();
            expect(setFailedSpy).toBeCalledWith('New version is lower or equal to package version');
        });
    });
    describe("MAJOR", function () {
        it("TYPE / Should return a 'major' update to version 2.0.0", function () {
            inputs['type'] = 'major';
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
            releaseMangement.retrieveVersion();
            expect(semver_1.default.diff(initialVersion, outputs.version)).toBe('major');
            expect(outputs.version).toBe('2.0.0');
        });
        it("BRANCH / Should return a 'major' update to version 2.0.0", function () {
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
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
            expect(semver_1.default.diff(initialVersion, outputs.version)).toBe('major');
            expect(outputs.version).toBe('2.0.0');
        });
    });
    describe("MINOR", function () {
        it("TYPE / Should return a 'minor' update to version 1.1.0", function () {
            inputs['type'] = 'minor';
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
            releaseMangement.retrieveVersion();
            expect(semver_1.default.diff(initialVersion, outputs.version)).toBe('minor');
            expect(outputs.version).toBe('1.1.0');
        });
        it("BRANCH / Should return a 'minor' update to version 1.1.0", function () {
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
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
            expect(semver_1.default.diff(initialVersion, outputs.version)).toBe('minor');
            expect(outputs.version).toBe('1.1.0');
        });
    });
    describe("PATCH", function () {
        it("TYPE / Should return a 'patch' update to version 1.0.1", function () {
            inputs['type'] = 'patch';
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
            releaseMangement.retrieveVersion();
            expect(semver_1.default.diff(initialVersion, outputs.version)).toBe('patch');
            expect(outputs.version).toBe('1.0.1');
        });
        it("BRANCH / RELEASE / Should return a 'patch' update to version 1.0.1", function () {
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
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
            expect(semver_1.default.diff(initialVersion, outputs.version)).toBe('patch');
            expect(outputs.version).toBe('1.0.1');
        });
        it("BRANCH / DEFAULT / Should return a 'patch' update to version 1.0.1", function () {
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
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
            expect(semver_1.default.diff(initialVersion, outputs.version)).toBe('patch');
            expect(outputs.version).toBe('1.0.1');
        });
    });
    describe("RC", function () {
        it("TYPE / Should return a 'rc' update to version 1.0.1-rc.0", function () {
            inputs['type'] = 'rc';
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
            releaseMangement.retrieveVersion();
            expect(semver_1.default.diff(initialVersion, outputs.version)).toBe('prepatch');
            expect(outputs.version).toBe('1.0.1-rc.0');
        });
        it("BRANCH / Should return a 'rc' update to version 1.0.1-rc.0", function () {
            jest
                .spyOn(fs_1.default, 'readFileSync')
                .mockImplementation(function (_path, _options) {
                return JSON.stringify({ version: initialVersion });
            });
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
            expect(semver_1.default.diff(initialVersion, outputs.version)).toBe('prepatch');
            expect(outputs.version).toBe('1.0.1-rc.0');
        });
    });
});
