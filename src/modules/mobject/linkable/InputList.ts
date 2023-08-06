import { Vertex } from '../../helpers/Vertex_Transform'
import { Color } from '../../helpers/Color'
import { Mobject } from './../Mobject'
import { RoundedRectangle } from '../../shapes/RoundedRectangle'
import { LinkHook } from './LinkHook'
import { TextLabel } from '../../TextLabel'

export class InputList extends RoundedRectangle {

	listInputNames: Array<string>
	hookLocationDict: object
	mobject: Mobject

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			listInputNames: [],
			hookLocationDict: {},
			cornerRadius: 20,
			fillColor: Color.white(),
			fillOpacity: 0.2,
			strokeWidth: 0,
			width: 150
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.createHookList()
		this.update({ height: this.getHeight() }, false)
	}

	createHookList() {
		for (let i = 0; i < this.listInputNames.length; i++) {
			let name = this.listInputNames[i]
			let c = new LinkHook({mobject: this.mobject, inputName: name})
			let t = new TextLabel({
				text: name,
				horizontalAlign: 'left',
				verticalAlign: 'center',
				viewHeight: 20,
				viewWidth: 100
			})
			this.add(c)
			this.add(t)
			c.update({ anchor: new Vertex([15, -10 + 25 * (i + 1)]) })
			t.update({ anchor: c.anchor.translatedBy(25, 0) })
			this.hookLocationDict[name] = c.parent.transformLocalPoint(c.midpoint, t.getPaper())
		}
	}

	getHeight(): number {
		if (this.listInputNames == undefined) { return 0 }
		if (this.listInputNames.length == 0) { return 0 }
		else { return 40 + 25 * this.listInputNames.length }
	}

	updateModel(argsDict: object = {}) {
		argsDict['height'] = this.getHeight()
		super.updateModel(argsDict)
	}
}