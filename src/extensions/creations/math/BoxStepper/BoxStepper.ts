
import { BoxSlider } from 'extensions/creations/math/BoxSlider/BoxSlider'
import { ScreenEvent, eventVertex } from 'core/mobjects/screen_events'
import { Vertex } from 'core/classes/vertex/Vertex'

export class BoxStepper extends BoxSlider {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			min: 0,
			max: 10,
			value: 6,
			precision: 0
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			precision: 'never'
		})
	}
}