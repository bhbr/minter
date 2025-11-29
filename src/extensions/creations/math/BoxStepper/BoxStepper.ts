
import { BoxSlider } from 'extensions/creations/math/BoxSlider/BoxSlider'
import { ScreenEvent, eventVertex } from 'core/mobjects/screen_events'

export class BoxStepper extends BoxSlider { 

	defaults(): object {
		return {
			min: 0,
			max: 10,
			value: 6,
			precision: 0
		}
	}



	mutabilities(): object {
		return {
			precision: 'never'
		}
	}
}