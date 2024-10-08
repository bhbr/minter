
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepper } from './BoxStepper'

export class BoxStepperCreator extends BoxSliderCreator {

	declare creation: BoxStepper

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			creation: new BoxStepper()
		})
	}

}