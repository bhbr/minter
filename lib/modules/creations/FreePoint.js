import { Point } from './Point.js';
import { ScreenEventHandler } from '../mobject/screen_events.js';
export class FreePoint extends Point {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            screenEventHandler: ScreenEventHandler.Self
        });
    }
    onPointerDown(e) {
        this.startDragging(e);
    }
    onPointerMove(e) {
        this.dragging(e);
    }
    onPointerUp(e) {
        this.endDragging(e);
    }
}
//# sourceMappingURL=FreePoint.js.map