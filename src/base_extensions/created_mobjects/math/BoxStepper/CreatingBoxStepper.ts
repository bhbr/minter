import { CreatingBoxSlider } from 'base_extensions/created_mobjects/math/BoxSlider/CreatingBoxSlider'
import { BoxStepper } from './BoxStepper'

export class CreatingBoxStepper extends CreatingBoxSlider {

	statelessSetup() {
		super.statelessSetup()
		this.protoSlider = new BoxStepper()
	}

}