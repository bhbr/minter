import { BoxSlider } from './BoxSlider'
import { ScreenEvent, eventVertex } from '../mobject/screen_events'
import { Vertex } from '../helpers/Vertex'

export class BoxStepper extends BoxSlider {

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			min: 0,
			max: 10
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			precision: 0
		})
	}

	onPointerMove(e: ScreenEvent) {
		let scrubVector: Vertex = eventVertex(e).subtract(this.scrubStartingPoint)
		this.value = this.valueBeforeScrubbing - scrubVector.y/this.height * (this.max - this.min)
		this.value = Math.max(Math.min(Math.floor(this.value), this.max), this.min)
		this.update()
	}

	updateLabel() {
		this.label.update({
			text: this.value.toString(),
			anchor: new Vertex(this.width/2 - this.width/2, this.height/2 - 25/2),
			viewWidth: this.width
		}, false)
	}

}