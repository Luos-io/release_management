"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBasePathOfAlias = exports.relativeOutPathToConfigDir = exports.getProjectDirPathInOutDir = exports.mapPaths = void 0;
const globby_1 = require("globby");
const path_1 = require("path");
const normalizePath = require("normalize-path");
const mapPaths = (paths, mapper) => {
    const dest = {};
    Object.keys(paths).forEach((key) => {
        dest[key] = paths[key].map(mapper);
    });
    return dest;
};
exports.mapPaths = mapPaths;
function getProjectDirPathInOutDir(outDir, projectDir) {
    const dirs = (0, globby_1.sync)([
        `${outDir}/**/${projectDir}`,
        `!${outDir}/**/${projectDir}/**/${projectDir}`,
        `!${outDir}/**/node_modules`
    ], {
        dot: true,
        onlyDirectories: true
    });
    return dirs.reduce((prev, curr) => prev.split('/').length > curr.split('/').length ? prev : curr, dirs[0]);
}
exports.getProjectDirPathInOutDir = getProjectDirPathInOutDir;
function relativeOutPathToConfigDir(config) {
    config.configDirInOutPath = getProjectDirPathInOutDir(config.outPath, config.confDirParentFolderName);
    if (config.configDirInOutPath) {
        config.hasExtraModule = true;
        const stepsbackPath = (0, path_1.relative)(config.configDirInOutPath, config.outPath);
        const splitStepBackPath = normalizePath(stepsbackPath).split('/');
        const nbOfStepBack = splitStepBackPath.length;
        const splitConfDirInOutPath = config.configDirInOutPath.split('/');
        let i = 1;
        const splitRelPath = [];
        while (i <= nbOfStepBack) {
            splitRelPath.unshift(splitConfDirInOutPath[splitConfDirInOutPath.length - i]);
            i++;
        }
        config.relConfDirPathInOutPath = splitRelPath.join('/');
    }
}
exports.relativeOutPathToConfigDir = relativeOutPathToConfigDir;
function findBasePathOfAlias(config) {
    return (path) => {
        const aliasPath = { path };
        if ((0, path_1.normalize)(aliasPath.path).includes('..')) {
            const tempBasePath = normalizePath((0, path_1.normalize)(`${config.configDir}/${config.outDir}/` +
                `${config.hasExtraModule && config.relConfDirPathInOutPath
                    ? config.relConfDirPathInOutPath
                    : ''}/${config.baseUrl}`));
            const absoluteBasePath = normalizePath((0, path_1.normalize)(`${tempBasePath}/${aliasPath.path}`));
            if (config.pathCache.existsResolvedAlias(absoluteBasePath)) {
                aliasPath.isExtra = false;
                aliasPath.basePath = tempBasePath;
            }
            else {
                aliasPath.isExtra = true;
                aliasPath.basePath = absoluteBasePath;
            }
        }
        else if (config.hasExtraModule) {
            aliasPath.isExtra = false;
            aliasPath.basePath = normalizePath((0, path_1.normalize)(`${config.configDir}/${config.outDir}/` +
                `${config.relConfDirPathInOutPath}/${config.baseUrl}`));
        }
        else {
            aliasPath.basePath = normalizePath((0, path_1.normalize)(`${config.configDir}/${config.outDir}`));
            aliasPath.isExtra = false;
        }
        return aliasPath;
    };
}
exports.findBasePathOfAlias = findBasePathOfAlias;
//# sourceMappingURL=path.js.map