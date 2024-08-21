import { Rectangle } from '../shapes/Rectangle'
import { TextLabel } from '../TextLabel'

export class ValueBox extends Rectangle {

	value: number
	valueLabel: TextLabel

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			value: 0
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.valueLabel = new TextLabel()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.valueLabel)
	}

}