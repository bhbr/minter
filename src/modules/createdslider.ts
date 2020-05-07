
import { rgb, gray } from './helpers'
import { Vertex } from './transform'
import { CreatedMobject } from './creating'
import { BoxSlider } from './slider'
import { WaveCindyCanvas } from './cindycanvas'
import { Mobject } from './mobject'


export class CreatedBoxSlider extends CreatedMobject {

	protoSlider: BoxSlider
	width: number
	height: number

	constructor(argsDict: object) {
		super(argsDict)
		this.setAttributes({
			width: 50,
			height: 0,
			fillColor: rgb(0, 0, 0)
		})
		this.setDefaults({ startPoint: Vertex.origin() })
		this.anchor = this.startPoint
		this.protoSlider = new BoxSlider(argsDict)
		this.protoSlider.update({
			value: 0.5,
			width: this.width,
			height: 0,
			fillColor: rgb(0, 0, 0)
		})
		this.protoSlider.filledBar.update({
			width: this.width,
			fillColor: gray(0.5)
		})
		this.add(this.protoSlider)
	}

	updateFromTip(q: Vertex) {
		this.update({ // This shouldn't be necessary, fix
			fillColor: gray(0)
		})
		this.protoSlider.update({
			height: q.y - this.startPoint.y,
			//fillColor: gray(0.5) // This shouldn't be necessary, fix
		})
		this.protoSlider.filledBar.update({
			fillColor: gray(0.5)
		})

	}

	dissolveInto(superMobject: Mobject) {
		superMobject.remove(this)
		superMobject.add(this.protoSlider)
		this.protoSlider.update({
			anchor: this.anchor
		})
		this.protoSlider.outerBar.update({ anchor: new Vertex(0, 0) })
		this.protoSlider.label.update({
			anchor: new Vertex(this.protoSlider.width/2, this.protoSlider.height/2)
		})

	}
}
