import { CurvedLine } from './CurvedLine.js';
export class CurvedShape extends CurvedLine {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            closed: true
        });
    }
}
//# sourceMappingURL=CurvedShape.js.map