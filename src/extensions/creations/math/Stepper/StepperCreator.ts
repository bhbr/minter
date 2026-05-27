
import { SliderCreator } from 'extensions/creations/math/Slider/SliderCreator'
import { Stepper } from './Stepper'

export class StepperCreator extends SliderCreator {

	declare creation: Stepper

	defaults(): object {
		return {
			helpText: 'A vertical number stepper (slider for integers). Drag to the desired size. The min and max values can be edited.'
		}
	}

	createMobject(): Stepper {
		return this.creation || new Stepper({ height: 0 })
	}

}