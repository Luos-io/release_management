"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Output = void 0;
class Output {
    constructor(verbose = false) {
        this.verbose = verbose;
    }
    setVerbose(value) {
        this.verbose = value;
    }
    info(message) {
        if (!this.verbose)
            return;
        console.log(`tsc-alias info: ${message}`);
    }
    error(message, exitProcess = false) {
        console.error(`\x1b[41mtsc-alias error:\x1b[0m \x1b[31m${message}\x1b[0m\n`);
        if (exitProcess)
            process.exit(1);
    }
    clear() {
        console.clear();
    }
    assert(claim, message) {
        claim || this.error(message, true);
    }
}
exports.Output = Output;
//# sourceMappingURL=output.js.map