
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepper } from './BoxStepper'

export class BoxStepperCreator extends BoxSliderCreator {

	declare creation: BoxStepper

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creation: new BoxStepper()
		})
	}

}