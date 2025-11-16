
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepper } from './BoxStepper'

export class BoxStepperCreator extends BoxSliderCreator {

	declare creation: BoxStepper

	defaults(): object {
		return {
			helpText: 'A vertical number stepper (slider for integers). Drag to the desired size. The min and max values can be edited.'
		}
	}

	createMobject(): BoxStepper {
		return this.creation || new BoxStepper({ height: 0 })
	}

}