import { Vertex } from '../../helpers/Vertex.js';
import { Color } from '../../helpers/Color.js';
import { RoundedRectangle } from '../../shapes/RoundedRectangle.js';
import { LinkHook } from './LinkHook.js';
import { TextLabel } from '../../TextLabel.js';
import { IO_LIST_WIDTH, IO_LIST_OFFSET, HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from './constants.js';
export class InputList extends RoundedRectangle {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            mobject: null,
            inputNames: [],
            linkHooks: [],
            cornerRadius: 20,
            fillColor: Color.white(),
            fillOpacity: 0.2,
            strokeWidth: 0,
            width: IO_LIST_WIDTH
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.createHookList();
        this.update({ height: this.getHeight() }, false);
    }
    getHeight() {
        if (this.inputNames == undefined) {
            return 0;
        }
        if (this.inputNames.length == 0) {
            return 0;
        }
        else {
            let h = 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * (this.inputNames.length - 1);
            return h;
        }
    }
    createHookList() {
        this.linkHooks = [];
        for (let i = 0; i < this.inputNames.length; i++) {
            let name = this.inputNames[i];
            let h = new LinkHook({
                mobject: this.mobject,
                name: name,
                type: 'input'
            });
            let t = new TextLabel({
                text: name,
                horizontalAlign: 'left',
                verticalAlign: 'center',
                viewHeight: HOOK_VERTICAL_SPACING,
                viewWidth: IO_LIST_WIDTH - HOOK_LABEL_INSET
            });
            this.add(h);
            this.add(t);
            let m = new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * i]);
            h.update({ midpoint: m });
            let a = h.midpoint.translatedBy(HOOK_LABEL_INSET, -HOOK_VERTICAL_SPACING / 2);
            t.update({ anchor: a });
            this.linkHooks.push(h);
        }
    }
    hookNamed(name) {
        for (let h of this.linkHooks) {
            if (h.name == name) {
                return h;
            }
        }
        return null;
    }
    updateModel(argsDict = {}) {
        if (argsDict['inputNames'] !== undefined) {
            this.createHookList();
        }
        let p1 = this.bottomCenter();
        let p2 = this.mobject.localTopCenter();
        let v = new Vertex(p2[0] - p1[0], p2[1] - p1[1] - IO_LIST_OFFSET);
        argsDict['anchor'] = this.anchor.translatedBy(v);
        argsDict['height'] = this.getHeight();
        super.updateModel(argsDict);
    }
}
//# sourceMappingURL=InputList.js.map