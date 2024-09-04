import { Vertex } from '../helpers/Vertex'
import { CreatingMobject } from '../creations/CreatingMobject'
import { BoxSlider } from './BoxSlider'
import { WaveCindyCanvas } from '../cindy/WaveCindyCanvas'
import { Mobject } from '../mobject/Mobject'
import { LinkableMobject } from '../mobject/linkable/LinkableMobject'
import { Color } from '../helpers/Color'


export class CreatingBoxSlider extends CreatingMobject {

	protoSlider: BoxSlider
	width: number
	height: number
	min: number
	max: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			width: 70,
			height: 0,
			fillColor: Color.black(),
			startPoint: Vertex.origin(),
			min: 0,
			max: 1
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.protoSlider = new BoxSlider()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.protoSlider)
		this.anchor = this.startPoint
		this.protoSlider.update({
			min: this.min,
			max: this.max,
			value: 0.6 * (this.min + this.max),
			width: this.width,
			height: 1,
			fillColor: Color.black(),
			barFillColor: Color.gray(0.5)
		})
		this.protoSlider.hideLinks()
	}

	createdMobject(): LinkableMobject {
		return this.protoSlider
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
		this.protoSlider.hideLinks()
	}

	dissolve() {
		super.dissolve()
		this.protoSlider.update({
			anchor: this.anchor
		})
		this.protoSlider.outerBar.update({ anchor: new Vertex(0, 0) }) // necessary?
		this.protoSlider.label.update({
			anchor: new Vertex(this.protoSlider.width/2 - this.protoSlider.label.viewWidth/2, this.protoSlider.height/2 - this.protoSlider.label.viewHeight/2)
		})

	}
}
