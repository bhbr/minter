import { TextLabel } from '../../TextLabel.js';
import { ScreenEventHandler } from '../screen_events.js';
import { Vertex } from '../../helpers/Vertex.js';
import { Color } from '../../helpers/Color.js';
export class ExpandButton extends TextLabel {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            viewWidth: 30,
            viewHeight: 30,
            anchor: Vertex.origin(),
            screenEventHandler: ScreenEventHandler.Self,
            backgroundColor: Color.green().brighten(0.5),
            color: Color.black()
        });
    }
    get parent() {
        return super.parent;
    }
    set parent(newValue) {
        super.parent = newValue;
    }
    onTap(e) {
        this.parent.toggleViewState();
    }
}
//# sourceMappingURL=ExpandButton.js.map