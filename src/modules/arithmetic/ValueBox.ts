import { Rectangle } from '../shapes/Rectangle'
import { TextLabel } from '../TextLabel'
import { Color } from '../helpers/Color'
import { LinkableMobject } from '../mobject/linkable/LinkableMobject'
import { log } from '../helpers/helpers'

export class ValueBox extends LinkableMobject {

	value: number
	valueLabel: TextLabel
	background: Rectangle

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			viewWidth: 80,
			viewHeight: 40,
			inputNames: ['value'],
			outputNames: ['value'],
			strokeWidth: 0.0
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			value: 1
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.background = new Rectangle({
			width: this.viewWidth,
			height: this.viewHeight,
			fillColor: Color.black()
		})
		this.valueLabel = new TextLabel({
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			text: `${this.value}`
		})
		this.valueLabel.view.style.fontSize = '20px'
		this.add(this.background)
		this.add(this.valueLabel)
	}

	updateModel(argsDict) {
		super.updateModel(argsDict)
		this.background = new Rectangle({
			width: this.viewWidth,
			height: this.viewHeight
		})

		var labelText = `${this.value.toPrecision(3)}`
		if (isNaN(this.value) || !isFinite(this.value)) {
			labelText = ''
		}

		this.valueLabel.update({
			width: this.viewWidth,
			height: this.viewHeight,
			text: labelText
		})
	}


















}