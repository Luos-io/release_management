import { AliasPath, IProjectConfig, PathLike, StringReplacer } from '../interfaces';
export declare const mapPaths: (paths: PathLike, mapper: StringReplacer) => PathLike;
export declare function getProjectDirPathInOutDir(outDir: string, projectDir: string): string | undefined;
export declare function relativeOutPathToConfigDir(config: IProjectConfig): void;
export declare function findBasePathOfAlias(config: IProjectConfig): (path: string) => AliasPath;
