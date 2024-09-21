
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepper } from './BoxStepper'

export class BoxStepperCreator extends BoxSliderCreator {

	declare creation: BoxStepper

	statelessSetup() {
		super.statelessSetup()
		this.creation = new BoxStepper()
	}

}