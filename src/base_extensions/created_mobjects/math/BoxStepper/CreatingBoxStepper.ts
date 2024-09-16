import { CreatingBoxSlider } from 'base_extensions/created_mobjects/math/BoxSlider/CreatingBoxSlider'
import { BoxStepper } from './BoxStepper'

export class CreatingBoxStepper extends CreatingBoxSlider {

	declare creation: BoxStepper

	statelessSetup() {
		super.statelessSetup()
		this.creation = new BoxStepper()
	}

}