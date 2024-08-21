export class Dependency {
    constructor(argsDict = {}) {
        this.source = argsDict['source'];
        this.outputName = argsDict['outputName']; // may be undefined
        this.target = argsDict['target'];
        this.inputName = argsDict['inputName']; // may be undefined
    }
    delete() {
        this.source.removeDependency(this);
    }
}
//# sourceMappingURL=Dependency.js.map