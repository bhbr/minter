
import { Vertex } from 'core/classes/vertex/Vertex'
import { Creator } from 'core/creators/Creator'
import { BoxSlider } from './BoxSlider'
import { Linkable } from 'core/linkables/Linkable'
import { Color } from 'core/classes/Color'


export class BoxSliderCreator extends Creator {

	declare creation?: BoxSlider
	width: number
	height: number
	min: number
	max: number

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'width'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			width: 70,
			height: 0,
			fillColor: Color.black(),
			min: 0,
			max: 1
		})
	}

	setup() {
		super.setup()
		this.update({
			creation: this.createMobject(),
			anchor: this.getStartPoint()
		})
		if (this.creation == null) { return }
		this.add(this.creation)
		this.creation.update({
			min: this.min,
			max: this.max,
			value: 0.4 * this.min + 0.6 * this.max,
			width: this.width,
			height: 1,
			fillColor: Color.black(),
			barFillColor: Color.gray(0.5)
		})
		this.creation.hideLinks()
	}

	createMobject(): BoxSlider {
		return this.creation || new BoxSlider()
	}

	updateFromTip(q: Vertex) {
		this.update({ // This shouldn't be necessary, fix
			fillColor: Color.black()
		})
		if (this.creation === null) { return }
		this.creation.update({
			height: q.y - this.getStartPoint().y,
			//fillColor: gray(0.5) // This shouldn't be necessary, fix
		})
		this.creation.filledBar.update({
			fillColor: Color.gray(0.5)
		})
		this.creation.hideLinks()
	}

	dissolve() {
		super.dissolve()
		if (this.creation === null) { return }
		this.creation.update({
			anchor: this.anchor
		})
		this.creation.outerBar.update({ anchor: new Vertex(0, 0) }) // necessary?
		this.creation.label.update({
			anchor: new Vertex(this.creation.width/2 - this.creation.label.viewWidth/2, this.creation.height/2 - this.creation.label.viewHeight/2)
		})

	}
}
