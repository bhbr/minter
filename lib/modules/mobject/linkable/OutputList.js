// import { Vertex } from '../../helpers/Vertex'
// import { Color } from '../../helpers/Color'
// import { Mobject } from './../Mobject'
// import { RoundedRectangle } from '../../shapes/RoundedRectangle'
// import { LinkHook } from './LinkHook'
// import { TextLabel } from '../../TextLabel'
// import { log } from '../../helpers/helpers'
// import { HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_OFFSET, HOOK_VERTICAL_SPACING } from './constants'
// export class OutputList extends RoundedRectangle {
// 	outputNames: Array<string>
// 	linkHooks: Array<LinkHook>
// 	mobject: Mobject
// 	defaultArgs(): object {
// 		return Object.assign(super.defaultArgs(), {
// 			mobject: null,
// 			outputNames: [],
// 			linkHooks: [],
// 			cornerRadius: 20,
// 			fillColor: Color.white(),
// 			fillOpacity: 0.3,
// 			strokeWidth: 0,
// 			width: 150
// 		})
// 	}
// 	statefulSetup() {
// 		super.statefulSetup()
// 		this.createHookList()
// 		this.update({ height: this.getHeight() }, false)
// 	}
// 	getHeight(): number {
// 		if (this.outputNames == undefined) { return 0 }
// 		if (this.outputNames.length == 0) { return 0 }
// 		else { return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * this.outputNames.length }
// 	}
// 	createHookList() {
// 		this.linkHooks = []
// 		for (let i = 0; i < this.outputNames.length; i++) {
// 			let name = this.outputNames[i]
// 			let h = new LinkHook({
// 				mobject: this.mobject,
// 				name: name,
// 				type: 'output'
// 			})
// 			let t = new TextLabel({
// 				text: name,
// 				horizontalAlign: 'left',
// 				verticalAlign: 'center',
// 				viewHeight: HOOK_VERTICAL_SPACING,
// 				viewWidth: 100
// 			})
// 			this.add(h)
// 			this.add(t)
// 			h.update({ anchor: new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * i]) })
// 			t.update({ anchor: h.anchor.translatedBy(HOOK_LABEL_OFFSET, 0) })
// 			this.linkHooks.push(h)
// 		}
// 	}
// 	hookNamed(name): LinkHook | null {
// 		for (let h of this.linkHooks) {
// 			if (h.name == name) {
// 				return h
// 			}
// 		}
// 		return null
// 	}
// 	updateModel(argsDict: object = {}) {
// 		if (argsDict['outputNames'] !== undefined) {
// 			this.createHookList()
// 		}
// 	 	let p3: Vertex = this.topCenter()
// 		let p4: Vertex = this.mobject.localBottomCenter()
// 		argsDict['anchor'] = this.anchor.translatedBy(p4[0] - p3[0], p4[1] - p3[1] + HOOK_INSET_Y)
// 		argsDict['height'] = this.getHeight()
// 		super.updateModel(argsDict)
// 	}
// }
import { Vertex } from '../../helpers/Vertex.js';
import { Color } from '../../helpers/Color.js';
import { RoundedRectangle } from '../../shapes/RoundedRectangle.js';
import { LinkHook } from './LinkHook.js';
import { TextLabel } from '../../TextLabel.js';
import { IO_LIST_WIDTH, IO_LIST_OFFSET, HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from './constants.js';
export class OutputList extends RoundedRectangle {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            mobject: null,
            outputNames: [],
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
        if (this.outputNames == undefined) {
            return 0;
        }
        if (this.outputNames.length == 0) {
            return 0;
        }
        else {
            return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * (this.outputNames.length - 1);
        }
    }
    createHookList() {
        this.linkHooks = [];
        for (let i = 0; i < this.outputNames.length; i++) {
            let name = this.outputNames[i];
            let h = new LinkHook({
                mobject: this.mobject,
                name: name,
                type: 'output'
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
            h.update({ midpoint: new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * i]) });
            t.update({ anchor: h.midpoint.translatedBy(HOOK_LABEL_INSET, -HOOK_VERTICAL_SPACING / 2) });
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
        if (argsDict['outputNames'] !== undefined) {
            this.createHookList();
        }
        let p1 = this.topCenter();
        let p2 = this.mobject.localBottomCenter();
        argsDict['anchor'] = this.anchor.translatedBy(p2[0] - p1[0], p2[1] - p1[1] + IO_LIST_OFFSET);
        argsDict['height'] = this.getHeight();
        super.updateModel(argsDict);
    }
}
//# sourceMappingURL=OutputList.js.map