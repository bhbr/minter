import { Vertex } from '../../helpers/Vertex_Transform'
import { Color } from '../../helpers/Color'
import { Mobject } from './../Mobject'
import { RoundedRectangle } from '../../shapes/RoundedRectangle'
import { LinkHook } from './LinkHook'
import { TextLabel } from '../../TextLabel'

export class OutputList extends RoundedRectangle {

	listOutputNames: Array<string>
	hookLocationDict: object
	mobject: Mobject

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			listOutputNames: [],
			hookLocationDict: {},
			cornerRadius: 20,
			fillColor: Color.white(),
			fillOpacity: 0.3,
			strokeWidth: 0,
			width: 150
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.createHookList()
		this.update({ height: this.getHeight() }, false)
	}

	getHeight(): number {
		if (this.listOutputNames == undefined) { return 0 }
		if (this.listOutputNames.length == 0) { return 0 }
		else {
			return 40 + 25 * this.listOutputNames.length
		}
	}

	createHookList() {
		for (let i = 0; i < this.listOutputNames.length; i++) {
			let name = this.listOutputNames[i]
			let c = new LinkHook({mobject: this.mobject, outputName: name})
			let t = new TextLabel({
				text: name,
				horizontalAlign: 'left',
				verticalAlign: 'center',
				viewHeight: 20,
				viewWidth: 100
			})
			this.hookLocationDict[name] = c.anchor
			this.add(c)
			this.add(t)
			c.update({ anchor: new Vertex([15, -10 + 25 * (i + 1)]) })
			t.update({ anchor: c.anchor.translatedBy(25, 0) })
			this.hookLocationDict[name] = c.parent.transformLocalPoint(c.midpoint, t.getPaper())
		}
	}

	updateModel(argsDict: object = {}) {
		argsDict['height'] = this.getHeight()
		super.updateModel(argsDict)
	}

}