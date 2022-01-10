export declare class Output {
    private verbose;
    constructor(verbose?: boolean);
    setVerbose(value: boolean): void;
    info(message: string): void;
    error(message: string, exitProcess?: boolean): void;
    clear(): void;
    assert(claim: any, message: string): void;
}
