"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTsConfigExtendsPath = exports.loadConfig = void 0;
const mylas_1 = require("mylas");
const findNodeModulesPath = require("find-node-modules");
const fs = require("fs");
const path_1 = require("path");
const loadConfig = (file) => {
    if (!fs.existsSync(file)) {
        console.error(`\x1b[41mtsc-alias error:\x1b[0m \x1b[31mFile ${file} not found\x1b[0m\n`);
        process.exit();
    }
    const { extends: ext, compilerOptions: { baseUrl, outDir, declarationDir, paths } = {
        baseUrl: undefined,
        outDir: undefined,
        declarationDir: undefined,
        paths: undefined
    }, 'tsc-alias': TSCAliasConfig } = mylas_1.Json.loadS(file, true);
    const config = {};
    if (baseUrl)
        config.baseUrl = baseUrl;
    if (outDir)
        config.outDir = outDir;
    if (paths)
        config.paths = paths;
    if (declarationDir)
        config.declarationDir = declarationDir;
    if (TSCAliasConfig === null || TSCAliasConfig === void 0 ? void 0 : TSCAliasConfig.replacers)
        config.replacers = TSCAliasConfig.replacers;
    if (TSCAliasConfig === null || TSCAliasConfig === void 0 ? void 0 : TSCAliasConfig.resolveFullPaths)
        config.resolveFullPaths = TSCAliasConfig.resolveFullPaths;
    if (TSCAliasConfig === null || TSCAliasConfig === void 0 ? void 0 : TSCAliasConfig.verbose)
        config.verbose = TSCAliasConfig.verbose;
    if (ext) {
        return Object.assign(Object.assign({}, (ext.startsWith('.')
            ? (0, exports.loadConfig)((0, path_1.join)((0, path_1.dirname)(file), ext.endsWith('.json') ? ext : `${ext}.json`))
            : (0, exports.loadConfig)(resolveTsConfigExtendsPath(ext, file)))), config);
    }
    return config;
};
exports.loadConfig = loadConfig;
function resolveTsConfigExtendsPath(ext, file) {
    const tsConfigDir = (0, path_1.dirname)(file);
    const node_modules = findNodeModulesPath({ cwd: tsConfigDir });
    const targetPaths = node_modules.map((v) => (0, path_1.join)(tsConfigDir, v, ext));
    for (const targetPath of targetPaths) {
        if (ext.endsWith('.json')) {
            if (fs.existsSync(targetPath)) {
                return targetPath;
            }
            else {
                continue;
            }
        }
        let isDirectory = false;
        try {
            isDirectory = fs.lstatSync(targetPath).isDirectory();
        }
        catch (err) { }
        if (isDirectory) {
            return (0, path_1.join)(targetPath, 'tsconfig.json');
        }
        else {
            if (fs.existsSync(`${targetPath}.json`)) {
                return `${targetPath}.json`;
            }
        }
    }
}
exports.resolveTsConfigExtendsPath = resolveTsConfigExtendsPath;
//# sourceMappingURL=config.js.map