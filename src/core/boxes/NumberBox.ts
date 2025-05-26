
import { Linkable } from 'core/linkables/Linkable'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Rectangle } from 'core/shapes/Rectangle'
import { Color } from 'core/classes/Color'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'

export class NumberBox extends Linkable {
	
	value: number
	background: Rectangle
	valueLabel: TextLabel

	defaults(): object {
		return {
			value: 1,
			valueLabel: new TextLabel(),
			background: new Rectangle({
				fillColor: Color.black(),
				fillOpacity: 1
			}),
			frameWidth: 80,
			frameHeight: 40
		}
	}

	setup() {
		super.setup()
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		})
		this.add(this.background)
		this.valueLabel.update({
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height,
			text: `${this.value}`
		})
		this.valueLabel.view.div.style.fontSize = '20px'
		this.add(this.valueLabel)
		this.moveToTop(this.inputList)
		this.moveToTop(this.outputList)

	}

	valueAsString(): string {
		if (!this.value && this.value !== 0) { return '' }
		var text = this.value.toString()
		if (!Number.isInteger(this.value)) {
			text = `${this.value.toPrecision(3)}`
		}
		if (isNaN(this.value) || !isFinite(this.value)) {
			text = ''
		}
		return text
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		
		var labelText = this.valueAsString()
		this.valueLabel.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			text: labelText
		}, redraw)
		if (redraw) { this.view.redraw() }
	}

}

export class LinkableNumberBox extends NumberBox {

	defaults(): object {
		return {
			inputProperties: [
				{ name: 'value', displayName: null, type: 'number' }
			],
			outputProperties: [
				{ name: 'value', displayName: null, type: 'number' }
			]
		}
	}
}

export class NumberBoxCreator extends DraggingCreator {
	
	declare creation: LinkableNumberBox

	createMobject() {
		return new LinkableNumberBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}