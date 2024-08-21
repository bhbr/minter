import { Mobject } from './Mobject.js';
export class MGroup extends Mobject {
    statefulSetup() {
        super.statefulSetup();
        // children may have been set as constructor args
        for (let submob of this.children) {
            this.add(submob);
        }
    }
}
//# sourceMappingURL=MGroup.js.map