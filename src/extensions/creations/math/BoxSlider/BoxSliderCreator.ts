
import { Vertex } from 'core/classes/vertex/Vertex'
import { Creator } from 'core/creators/Creator'
import { BoxSlider } from './BoxSlider'
import { Linkable } from 'core/linkables/Linkable'
import { Color } from 'core/classes/Color'


export class BoxSliderCreator extends Creator {

	declare creation?: BoxSlider

	setup() {
		super.setup()
		this.update({
			creation: this.createMobject(),
			anchor: this.getStartPoint()
		})
		if (this.creation == null) { return }
		this.add(this.creation)
		this.creation.hideLinks()
	}

	createMobject(): BoxSlider {
		return this.creation || new BoxSlider({ height: 0 })
	}

	updateFromTip(q: Vertex, redraw: boolean = true) {
		// this.update({ // This shouldn't be necessary, fix
		// 	fillColor: Color.black()
		// }, redraw)
		if (this.creation === null) { return }
		this.creation.update({
			height: q.y - this.getStartPoint().y,
		}, redraw)
		this.creation.filledBar.update({
			fillColor: Color.gray(0.5)
		}, redraw)
		this.creation.hideLinks()
		if (redraw) { this.redraw() }
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
