import { Vertex } from './vertex-transform'
import { CreatedMobject } from './creating'
import { BoxSlider } from './slider'
import { WaveCindyCanvas } from './cindycanvas'
import { Mobject } from './mobject'
import { Color } from './color'
import { EventHandlingMode } from './helpers'


export class CreatedBoxSlider extends CreatedMobject {

	protoSlider = new BoxSlider()
	width = 50
	height = 0
	fillColor = Color.black()
	startPoint = Vertex.origin()
	eventHandlingMode: EventHandlingMode = "self"

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.add(this.protoSlider)
		this.anchor = this.startPoint
		this.protoSlider.update({
			value: 0.5,
			width: this.width,
			height: 0,
			fillColor: Color.black(),
			barFillColor: Color.gray(0.5)
		}, false)
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
		//this.redraw()
	}

	dissolveInto(superMobject: Mobject) {
		superMobject.remove(this)
		this.protoSlider.update({
			anchor: this.anchor
		})
		superMobject.add(this.protoSlider)
		this.protoSlider.outerBar.update({ anchor: new Vertex(0, 0) }) // necessary?
		this.protoSlider.label.update({
			anchor: new Vertex(this.protoSlider.width/2 - this.protoSlider.label.viewWidth/2, this.protoSlider.height/2 - this.protoSlider.label.viewHeight/2)
		})

	}
}
