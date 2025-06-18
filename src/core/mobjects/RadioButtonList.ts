
import { MGroup } from 'core/mobjects/MGroup'
import { RadioButton } from 'core/mobjects/RadioButton'
import { ScreenEventHandler } from 'core/mobjects/screen_events'

export class RadioButtonList extends MGroup {
	
	options: object
	selection: string | null
	buttons: Array<RadioButton>

	defaults(): object {
		return {
			options: {},
			selection: null,
			buttons: [],
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	mutabilities(): object {
		return {
			options: 'on_init'
		}
	}

	setup() {
		super.setup()
		let keys = Object.keys(this.options)
		for (var i = 0; i < keys.length; i++) {
			let b = new RadioButton({
				name: keys[i],
				selected: (keys[i] == this.selection),
				anchor: [0, 30 * i],
				list: this
			})
			this.buttons.push(b)
			this.add(b)
		}
	}

	optionSelected(optionName: string) {
		for (let button of this.buttons) {
			if (button.name == optionName) {
				button.select()
			} else {
				button.deselect()
			}
		}
		this.options[optionName]()
	}
}