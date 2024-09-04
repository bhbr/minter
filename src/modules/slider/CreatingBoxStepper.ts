import { CreatingBoxSlider } from './CreatingBoxSlider'
import { BoxStepper } from './BoxStepper'

export class CreatingBoxStepper extends CreatingBoxSlider {

	statelessSetup() {
		super.statelessSetup()
		this.protoSlider = new BoxStepper()
	}

}