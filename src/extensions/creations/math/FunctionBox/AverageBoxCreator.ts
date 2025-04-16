import { DraggingCreator } from 'core/creators/DraggingCreator'
import { AverageBox } from './AverageBox'

export class AverageBoxCreator extends DraggingCreator {
	declare creation: AverageBox

	setup() {
		super.setup()
		this.creation.functionLabel.update({
			text: 'µ'
		})
	}

	createMobject(): AverageBox {
		return new AverageBox()
	}
}