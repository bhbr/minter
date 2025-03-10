
import { vertex, vertexOrigin } from 'core/functions/vertex'
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

	updateFromTip(q: vertex, redraw: boolean = true) {
		if (this.creation === null) { return }
		this.creation.update({
			height: q[1] - this.getStartPoint()[1],
		}, redraw)
		this.creation.filledBar.update({
			fillColor: Color.gray(0.5)
		}, redraw)
		this.creation.hideLinks()
		if (redraw) { this.view.redraw() }
	}

	dissolve() {
		super.dissolve()
		if (this.creation === null) { return }
		this.creation.update({
			anchor: this.view.frame.anchor,
			frameHeight: this.creation.height
		})
		this.creation.outerBar.update({ anchor: vertexOrigin() }) // necessary?
		this.creation.label.update({
			anchor: [this.creation.width/2 - this.creation.label.view.frame.width/2, this.creation.height/2 - this.creation.label.view.frame.height/2]
		})
		this.creation.outputList.positionSelf()

	}






















}
