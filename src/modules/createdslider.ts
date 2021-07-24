
import { Vertex } from './vertex-transform'
import { CreatedMobject } from './creating'
import { BoxSlider } from './slider'
import { WaveCindyCanvas } from './cindycanvas'
import { Mobject } from './mobject'
import { Color } from './color'


export class CreatedBoxSlider extends CreatedMobject {

	protoSlider: BoxSlider
	width: number
	height: number

	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			width: 50,
			height: 0,
			fillColor: Color.black(),
			drawBorder: true
		})
		this.setDefaults({ startPoint: Vertex.origin() })
		this.anchor = this.startPoint
		this.protoSlider = new BoxSlider(argsDict)
		this.protoSlider.update({
			value: 0.5,
			width: this.width,
			height: 0,
			fillColor: Color.black()
		})
		this.protoSlider.filledBar.update({
			width: this.width,
			fillColor: Color.gray(0.5)
		})
		this.add(this.protoSlider)

		if (this.constructor.name == "CreatedBoxSlider") {
			this.update(argsDict)
		}
	}

	updateFromTip(q: Vertex) {
		this.update({ // This shouldn't be necessary, fix
			fillColor: Color.black()
		})
		this.protoSlider.update({
			height: q.y - this.startPoint.y,
			//fillColor: gray(0.5) // This shouldn't be necessary, fix
		})
		this.protoSlider.filledBar.update({
			fillColor: Color.gray(0.5)
		})
		this.redraw()
	}

	dissolveInto(superMobject: Mobject) {
		superMobject.remove(this)
		this.remove(this.protoSlider)
		superMobject.add(this.protoSlider)
		console.log('anchor', this.anchor)
		this.protoSlider.update({
			anchor: this.anchor
		})
		console.log('anchor', this.protoSlider.anchor)
		//this.protoSlider.outerBar.update({ anchor: new Vertex(0, 0) })
		this.protoSlider.label.update({
			center: this.protoSlider.localCenter()
		})

	}
}
