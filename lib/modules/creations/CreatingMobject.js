import { Mobject } from '../mobject/Mobject.js';
import { ScreenEventHandler } from '../mobject/screen_events.js';
import { Vertex } from '../helpers/Vertex.js';
export class CreatingMobject extends Mobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            startPoint: Vertex.origin(),
            endPoint: Vertex.origin()
        });
    }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            screenEventHandler: ScreenEventHandler.Self
        });
    }
    get parent() {
        return super.parent;
    }
    set parent(newValue) {
        super.parent = newValue;
    }
    dissolve() {
        let cm = this.createdMobject();
        cm.update({
            anchor: this.startPoint
        });
        this.parent.addToContent(cm);
        this.parent.remove(this);
    }
    createdMobject() {
        return this;
    }
    updateFromTip(q) {
        this.endPoint.copyFrom(q);
    }
}
//# sourceMappingURL=CreatingMobject.js.map