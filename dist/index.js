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
exports.retrieveVersion = exports.retrievePackageVersion = exports.retrieveSourceBranchVersion = void 0;
var core = __importStar(require("@actions/core"));
var github = __importStar(require("@actions/github"));
var fs = __importStar(require("fs"));
var semver_1 = __importDefault(require("semver"));
function retrieveSourceBranchVersion() {
    var _a, _b, _c;
    var sourceBranchName = (_c = (_b = (_a = github.context.payload) === null || _a === void 0 ? void 0 : _a.pull_request) === null || _b === void 0 ? void 0 : _b.head) === null || _c === void 0 ? void 0 : _c.ref;
    if (sourceBranchName) {
        var matchPattern = sourceBranchName.match(/^release\/(\d+\.\d+\.\d+(-rc\.\d)*)$/);
        if (matchPattern && matchPattern.length >= 2) {
            return semver_1.default.valid(matchPattern[1]);
        }
    }
    return null;
}
exports.retrieveSourceBranchVersion = retrieveSourceBranchVersion;
function retrievePackageVersion() {
    try {
        return semver_1.default.valid(JSON.parse(fs.readFileSync('package.json', 'utf8')).version);
    }
    catch (err) {
        return null;
    }
}
exports.retrievePackageVersion = retrievePackageVersion;
function retrieveVersion() {
    try {
        core.debug("Starting 'Release Management' action...");
        var version = retrievePackageVersion();
        if (!version) {
            core.setFailed('Could not read package.json');
        }
        else {
            core.debug("Current version: ".concat(version));
            var sourceBranchVersion = retrieveSourceBranchVersion();
            var type = core.getInput('type');
            if (!sourceBranchVersion) {
                core.warning("Could not retrieve source branch version, using 'type' input value ('".concat(type, "')..."));
                switch (type) {
                    case 'major':
                    case 'minor':
                    case 'patch':
                        core.setOutput('version', semver_1.default.inc(version, type));
                        break;
                    case 'rc':
                        core.setOutput('version', semver_1.default.inc(version, 'prerelease', 'rc'));
                        break;
                    default:
                        core.warning("Unknown type: '".concat(type, "' (expected: 'major', 'minor', 'patch' or 'rc'), falling back to patch..."));
                        core.setOutput('version', semver_1.default.inc(version, 'patch'));
                }
            }
            else {
                core.debug("Source branch version: ".concat(sourceBranchVersion));
                if (semver_1.default.lte(sourceBranchVersion, version)) {
                    core.setFailed('New version is lower or equal to package version');
                }
                else {
                    core.setOutput('version', sourceBranchVersion);
                }
            }
        }
    }
    catch (err) {
        core.setFailed(err.message);
    }
}
exports.retrieveVersion = retrieveVersion;
retrievePackageVersion();
