
import { NumberInputBox } from './NumberInputBox'
import { SimpleButton } from 'core/ui/SimpleButton'
import { log } from 'core/functions/logging'

const BUTTON_WIDTH: number = 20
const BUTTON_INSET: number = 5
const BUTTON_FONT_SIZE: number = 10

export class IntegerInputBox extends NumberInputBox {

	decrementButton: SimpleButton
	incrementButton: SimpleButton

	defaults(): object {
		return {
			decrementButton: new SimpleButton({
				width: BUTTON_WIDTH,
				fontSize: BUTTON_FONT_SIZE,
				text: '<'
			}),
			incrementButton: new SimpleButton({
				width: BUTTON_WIDTH,
				fontSize: BUTTON_FONT_SIZE,
				text: '>'
			})
		}
	}

	setup() {
		super.setup()

		switch (this.labelPlacement) {
		case 'left':
			this.decrementButton.update({
				anchor: [this.labelWidth + this.labelGap, BUTTON_INSET],
				height: this.frameHeight - 2 * BUTTON_INSET,
			})

			this.inputElement.style.left = `${this.decrementButton.anchor[0] + this.decrementButton.width + BUTTON_INSET}px`

			this.incrementButton.update({
				anchor: [this.decrementButton.anchor[0] + this.decrementButton.width + BUTTON_INSET + this.inputWidth + BUTTON_INSET, BUTTON_INSET],
				height: this.frameHeight - 2 * BUTTON_INSET
			})
			break

		case 'top':
			this.label.update({
				anchor: [BUTTON_WIDTH + BUTTON_INSET + this.inputWidth / 2 - this.labelWidth / 2, 0]
			})

			this.decrementButton.update({
				height: this.frameHeight - 2 * BUTTON_INSET,
				anchor: [0, this.labelHeight + this.labelGap + BUTTON_INSET]
			})

			this.inputElement.style.left = `${this.decrementButton.anchor[0] + this.decrementButton.width + BUTTON_INSET}px`

			this.incrementButton.update({
				anchor: [this.decrementButton.anchor[0] + this.decrementButton.width + BUTTON_INSET + this.inputWidth + BUTTON_INSET, this.labelHeight + this.labelGap + BUTTON_INSET],
				height: this.frameHeight - 2 * BUTTON_INSET
			})
			break
		}
		


		this.decrementButton.action = this.decrement.bind(this)
		this.add(this.decrementButton)
		this.incrementButton.action = this.increment.bind(this)
		this.add(this.incrementButton)
	}

	increment() {
		this.update({
			value: this.value + 1
		})
		this.updateDependents()
	}

	decrement() {
		this.update({
			value: this.value - 1
		})
		this.updateDependents()
	}

}