
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepper } from './BoxStepper'

export class BoxStepperCreator extends BoxSliderCreator {

	declare creation: BoxStepper

	defaults(): object {
		return {
			creation: new BoxStepper()
		}
	}

}